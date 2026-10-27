---
name: reconcile
description: Reconcile a QuickBooks bank or credit-card account to its statement with QuickBooks Labs. Picks the account, takes the statement ending date and balance, begins only after a yes to those figures, opens the worksheet when available or ticks lines in chat when it is not, and finishes or reports the result. Use when the user invokes /reconcile or asks to reconcile a bank or card account against a statement, or when /onboard loads it by name.
compatibility: Requires the QuickBooks Labs MCP reconciliation tools. The worksheet card is optional and used when reconciliation_review is available.
---

# Reconcile an account

Match one bank or credit-card register to its statement until the difference is 0.00, then finish
the session. Reading and the worksheet card change nothing until a write. This skill owns every
write for the session: begin, clear, finish, cancel, and undo.

## Ground rules

- Statement figures come from the user or the attached statement. Never invent a date or balance,
  and never use the QuickBooks book balance in place of the statement ending balance.
- Call `reconciliation_begin` only after the user says yes, in a later turn, to a message that lists
  the account, statement ending date, statement ending balance, and any service charge or interest
  earned. The reply that supplies those figures is not that yes.
- While the worksheet card is open, the card ticks lines, finishes, and cancels. Call
  `reconciliation_get` to read progress; do not call `reconciliation_set_cleared`,
  `reconciliation_finish`, or `reconciliation_cancel` from chat. The one exception is lines the
  worksheet could not load, in section 5.
- When `reconciliation_review` is unavailable, this skill ticks and finishes in chat, with the
  approvals in sections 5 and 6.
- Call `reconciliation_finish` with `adjusting_entry` only after the user says yes to that
  discrepancy in a later turn. Call `reconciliation_undo` only after the user names the finished
  session and says yes to unlocking it.
- Do not show full account numbers or more detail than the step needs. Before the worksheet opens,
  each message holds only the list or figures its step names and one question; do not summarize
  balances, history, or lines.

## Limits

- Rerun a failed or incomplete read at most once. Never retry a write after an unclear result;
  read the account with `reconciliation_get` before the next write.
- After two failed attempts at listing accounts, beginning a session, or reading progress, stop and
  tell the user what came back and one next action. Do not work around it with other tools,
  reports, or connectors.
- Call only `company_get_context`, `reconciliation_list_accounts`, `reconciliation_get`,
  `reconciliation_list_lines`, `reconciliation_history`, `reconciliation_begin`,
  `reconciliation_update`, `reconciliation_set_cleared`, `reconciliation_finish`,
  `reconciliation_cancel`, `reconciliation_undo`, and `reconciliation_review` when that tool is
  available; `bank_feed_list_connections` and `bank_feed_sync` (only after the user's yes to the
  offer in section 4); plus ToolSearch to load them as section 1 says. Never wait on a timer or poll.
- Do not load other skills.

## 1. Check capabilities

If the QuickBooks Labs tools are unavailable or unauthenticated, call `company_get_context` so the host
shows its Connect card, and wait for its automatic retry. If no card can appear, point the user to
the host's Connectors settings and stop.

Load the reconciliation tools by their exact names, never by topic words. Make one ToolSearch for
`reconciliation_list_accounts`, `reconciliation_get`, `reconciliation_begin`, and
`reconciliation_review`, when any is deferred, before the first reconciliation call. These tools
stay loaded for later turns, including the turn where the user says yes to begin. Load any other
reconciliation tool, a bank-feed tool, or one that is no longer loaded, the same way in the step
that calls it.

When that search does not return `reconciliation_get` and `reconciliation_begin`, say
reconciliation is not available in this connection and stop. When it does not return
`reconciliation_review`, use the chat path in section 5. Never tell the user to begin the session
in QuickBooks.

## 2. Pick the account

When the caller or the user already named one account with its `account_id`, use it. Otherwise call
`reconciliation_list_accounts` once. Keep Bank and Credit Card accounts. Name each with the ending
date of its last finished reconciliation from its `last`, or "never reconciled", and say which ones
have a session in progress; do not call `reconciliation_history` for those dates. Suggest the
account whose last reconciliation is the oldest, or a session already in progress when one exists.
Ask which account to reconcile and, for an account with no session in progress, its statement ending
date and ending balance, or the statement itself. End the turn.

## 3. Resume or take the statement

Call `reconciliation_get` for the picked `account_id`.

- **Session in progress:** skip begin. When `reconciliation_review` is available, call it, with
  `statement_lines` as in section 4 when the user attached the statement, and go to section 5. When
  it is not, go to section 5's chat path.
- **No session:** when the user has not given the statement ending date and the statement ending
  balance yet, ask for them and end the turn; otherwise go to section 4. When the user attaches the
  statement, read those two figures from it. Read a service charge or interest earned only when the
  statement shows one.

## 4. Begin the session

Show the account, statement ending date, statement ending balance, and any service charge or
interest earned, and ask whether to start. End the turn. When the user says statement lines are
missing from QuickBooks and the account is on a live bank link (`connection_type` Regular, OAuth or
DirectFeed in `bank_feed_list_connections`), offer to update its feed from the bank first; only on a
yes, call `bank_feed_sync` with its `institution.id`.

Call `reconciliation_begin` only after the user says yes to that list in a later turn. Pass the
figures as shown. A `conflict` result means a session is already open: call `reconciliation_get`,
then open the worksheet or continue in chat; do not begin again.

When `reconciliation_review` is available, call it right after a successful begin. When the user
attached the statement, pass every transaction on it, in statement order, as `statement_lines`, so
the expanded card shows the statement beside the QuickBooks lines; the tool description gives the
sign.

## 5. Close the difference

### Worksheet path

After `reconciliation_review` opens the card, write one sentence and end the turn: tick the lines
that are on the statement until the difference is 0.00, finish in the card, and reply `done`.
Do not list balances, do not offer to tick lines from chat, and do not ask for the statement again.

When the user asks about a line or a remaining difference, call `reconciliation_get` and, when
needed, `reconciliation_list_lines` with `clear_state: "NotCleared"`. Name a row by its
`line_number` (the same number on the worksheet). Stay in the card for the writes. Lines matched
or added from the bank feed can already be Cleared (`linked_to_bank_feed: true`), so the difference
may already be 0.00; that is expected.

`reconciliation_review` returns at most the newest 200 lines, and the card loads the older ones
itself. The worksheet context sets `lines_status`. When it is `loading` or `failed`, do not clear
lines from chat. For `failed`, tell the user to select Refresh on the card. When it is `capped`,
the card stopped past 5,000 lines and will not post an adjustment. Then, when the user asks about
the missing lines or replies `done` with a difference that is not 0.00, do steps 1 and 2 of the
chat path for the lines the card does not show, following `next_cursor` of
`reconciliation_list_lines` until it is null. The user then finishes in the card.

When the user wants to change the statement date or balance, show the new figures and call
`reconciliation_update` only after they say yes in a later turn.

### Chat path

Use this path only when `reconciliation_review` is unavailable, or for the lines a worksheet could
not load.

1. Call `reconciliation_list_lines` with `clear_state: "NotCleared"` and `date_to` at the statement
   ending date. Name the lines that appear on the statement.
2. Call `reconciliation_set_cleared` with those `line_ids` only after the user says yes to that list
   in a later turn. Prefer `line_ids` over `through_date`.
3. Call `reconciliation_get` after each clear batch. Repeat until the difference is 0.00, the user
   cancels, or the user accepts an adjusting entry in section 6.

## 6. Finish, cancel, or report

- **Worksheet path, user replies `done`:** call `reconciliation_get` once. Report finished, still in
  progress with its difference, or no session (cancelled). Do not call finish or cancel from chat.
  When `lines_status` is `capped` and the difference is not 0.00, look for the
  missing lines as section 5 says. When it is `failed`, tell the user to select Refresh.
- **Chat path, difference 0.00:** show the account and statement figures and ask whether to finish.
  Call `reconciliation_finish` only after yes in a later turn.
- **Chat path, non-zero difference:** investigate missing or duplicate lines before any adjusting
  entry. Show the difference and the default adjusting account from `reconciliation_get`. Call
  `reconciliation_finish` with `adjusting_entry` only after the user says yes to posting that
  discrepancy in a later turn, and pass the difference they said yes to as `expected_difference`.
  On `conflict` the difference moved: read `reconciliation_get` again and ask again.
- **Cancel:** when the user wants to stop, on the worksheet path tell them to cancel in the card; on
  the chat path call `reconciliation_cancel` after they say yes in a later turn. Cancelling leaves
  Cleared ticks in place.
- **Undo a finished session:** only when the user asks. Call `reconciliation_history` for the
  account, name the session, and call `reconciliation_undo` only after yes in a later turn.

## When another workflow loads this skill

`/onboard` loads this skill by name when the user picks reconcile from its next steps. When a
workflow loads it:

- The caller's overrides win, whether they arrive in the Skill tool's `args` (`entry: "onboard"`,
  `realm_id`, and `account_id` when already chosen) or in the caller's own instructions. Overrides
  can skip or narrow steps, never the approval rules for begin, clear, finish, cancel, or undo.
- The statement checkpoint, the begin yes, and the finish or adjusting-entry yes still happen here.
- Instead of offering next steps of your own or the completion response below, go back to the
  caller's next step in the same reply. Do not write out the hand-back or say you are handing
  back: the user sees only the caller's next preview, question or summary.
- The hand-back the caller reads:
  - `realm_id` and `account_id`;
  - `outcome`: `finished`, `in_progress`, `cancelled`, or `declined`;
  - `statement_ending_date`, `statement_ending_balance`, and `difference` when a session was open;
  - `session_id` when finished; and
  - `next_action`: one step for the user when the job did not finish.

## Completion response

End with one line: the account, whether the session finished, is still open with its difference, was
cancelled, or never began, and one next action when work remains.
