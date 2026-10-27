---
name: onboard
description: Connect bank and card accounts to QuickBooks with QuickBooks Labs, then offer one next job: categorize waiting transactions, reconcile an account to its statement, or run a business health report. Use when the user invokes /onboard or asks to set up, get started, or onboard QuickBooks Labs or their books. This is the guided setup entry point. Outside setup, categorize-transactions, reconcile, or create-reports handles that one job. When the user is finished, it offers a daily or weekly check that reports connection problems and waiting transactions and changes nothing.
compatibility: Requires the QuickBooks Labs MCP tools.
---

# QuickBooks Labs onboarding

Take the user from an unknown QuickBooks setup to one connected company and one next job. This
skill connects a bank or card, then offers the next job. Categorizing, reconciling, and
reporting run in the skills it loads.

## Voice

Talk about the company: its name, an account that needs a fix, what is waiting, and the one next
action. With accounts, the connection status card already shows balances and Connect Securely.
With none, it shows one connect pitch and Connect Securely. Do not repeat that copy.

- First `/onboard` turn: write the welcome before any tool call, then the tool calls, then the lines step 1 allows after them.
- Later turns: one or two sentences about the accounts or the question, then stop.
- Tool calls run back to back. Back to back means the chat stays empty between calls. It does not
mean one parallel tool batch. A call already made, a short result, a missing tool, or an
omitted argument stays out of the chat. Continue at the next call.
- Resume when the user replies. A card sends a reply when the user uses Connect Securely, or answers
yes or no to the offer. A card on screen is not a reply.
- One checkpoint per turn. On the connection status turn, wait until `company_get_connection_status`
returns, then call `onboarding_next_steps` as the final tool call. The skills card then renders
from `onboarding_next_steps`. Then ask its one yes-or-no question. Continue in the same turn only
from an accepted offer into its job, and from a hand-back into the next offer.
- A feed, account, report, or task counts when a tool result says so.
- Approval for a write stays in the skill that owns the write.
- Show no full account numbers.



## Limits

- Rerun a failed or incomplete read once. After an unclear write, read instead of writing again.
- After two failed or empty reads in one step, tell the user what came back and one next action.
- Call the current step's tools. Wait for the user.
- Load a skill from the jobs table when the user accepts that job. A skill already in context is
followed again, not loaded again.



## State

Read live: QuickBooks Labs and the bank feeds (`pending_count`, `needs_attention`).
Keep for this conversation: each hand-back, each report's status, and whether the recurring check
was offered. A rerun of `/onboard` skips a company or connection-status step whose live check
succeeds, then offers the next job.

## Path

Start the first `/onboard` turn with the welcome.

1. QuickBooks Labs MCP connector missing: its Connect card (step 1). Only QuickBooks Labs is required. Do not ask the user to connect Intuit QuickBooks.
2. No company for this session: the company card only. Onboarding waits. The connection status
  card stays closed until the user picks a company, or a company is already set (step 1).
3. QuickBooks Labs connected and a company is set: the connection status card, then the next job (step 1).
4. Offer the top next job. On yes, run it. After its hand-back, offer again (step 2).
5. When the user is finished, offer the recurring check (step 3). A finished health report returns
  to step 2 first. It does not skip to this check.



## Welcome

On the first `/onboard` turn of a conversation, the first thing the user sees is this welcome.
Write it before any tool call:

**Welcome to QuickBooks Labs!** We'll start by connecting your bank accounts to QuickBooks.

The welcome is not written from a tool result. Once per conversation. A rerun or a reply to a card
gets no welcome.

## 1. Connect

On the first `/onboard` turn, write the welcome before any tool call.

Only QuickBooks Labs is required. When QuickBooks Labs is missing, show its Connect card and stop. Do not
search for or suggest Intuit QuickBooks. The only line is "Connect QuickBooks Labs to continue." Add
one line to the plugin's `SETUP.md`. The next reply starts at the company check below.

Onboarding does not proceed until this session has a company. A company is set when
`company_get_context` returns a `realm_id`, when `company_wait` returns `selected`, or when
`company_select` has saved a `realm_id` in this conversation. Until then, do not call
`company_get_connection_status` or `onboarding_next_steps`. The connection status card must not
render on the company picker.

1. One ToolSearch for `company_get_context`, `company_list`, and `company_wait`, when any is deferred.
2. If this conversation does not already have a `realm_id`, call `company_get_context` once. It opens no card.
3. A result with `realm_id`: the company is set. Continue at the connection status calls. Do not call `company_list`.
4. `company_selection_required`: call `company_list` once to open the picker, then immediately call `company_wait` with that result's `picker_request_id`. Write nothing. Do not call `company_get_connection_status` or `onboarding_next_steps` while the picker is open. On `waiting`, call `company_wait` again immediately with the same `picker_request_id`. On `selected`, the company is set: run the connection status calls and continue onboarding in this same turn. The connection status card renders only after that selection. Only on `card_unavailable` may you show the returned companies and ask once in chat. After the user names one, call `company_select` with that `realm_id`, then run the connection status calls in that same turn. Never pick a company for the user. On `timed_out`, stop.
5. `no_company`: call `company_list` once. Do not call `company_get_connection_status` or `onboarding_next_steps`. On `setup_required`, say in a sentence or two that no QuickBooks company was found for this Intuit sign-in and that filling in the card creates a free QuickBooks Online company. Leave the profile blank, then immediately call `company_wait` with that result's `picker_request_id`. Write nothing else. On `waiting`, call `company_wait` again immediately with the same `picker_request_id`. On `selected`, the company is set: run the connection status calls and continue onboarding in this same turn. On `card_unavailable`, give the signup link from the fallback details and stop. On `timed_out`, tell the user to finish the setup card and type Continue, then stop. Never invent a business profile. Without `setup_required`, give the card's signup link, or `signup_url` when there is no card, and wait for the user to return after external sign-up.
6. A sign-in or authorization error, or no such tool: the QuickBooks Labs connect card above. Do not call `company_get_connection_status`.

When a company is set, these calls go back to back. This phase calls no `bank_feed_*` tool.

1. One ToolSearch for `company_get_connection_status` and `onboarding_next_steps`, when either is deferred.
2. Call `company_get_connection_status` once. A sign-in, authorization, or no such tool uses the QuickBooks Labs connect card. If the result is still `company_selection_required` or `no_company`, the company is not set: do not call `onboarding_next_steps`. Go back to the matching case above. Skip `bank_feed_list_connections`.
3. When `onboarding_next_steps` is loaded, call it once as the final tool call. Do not respond after step 2. When it is not loaded, use the next-step fallback in section 2.

Then the turn ends. The last line is the yes-or-no question from `onboarding_next_steps`, copied exactly. `kind: connection_status` is the connection status card. `bank_connect_url` is the connect link on that card, not a no-card result. When the host cannot paint the card, write the account lines, or the connect pitch when there is no account, and link `bank_connect_url` before the next-step question. Label that link Connect Securely.

**Read failed.** After one rerun of any other error, one sentence that the accounts could not be read, plus one next action.

The user's reply:

- A reply that a bank was linked runs the connection status calls again.
- Yes, or a named job, starts that job.
- No refuses the offered job and follows the next-step offer. Offer the next ranked job once. Do not start the refused job.
- `continue`, `skip`, and any other reply that is not about a bank, a statement, or the offered job: say connecting is complete, then stop. Do not name Shopify, PayPal, Stripe, Square, or Google Drive. Do not read the feeds again.

## 2. Next steps

Offer after the connection status turn, and after each hand-back. `onboarding_next_steps` reads the feeds.
Skip `bank_feed_list_connections` here.

A request outside these jobs gets QuickBooks Labs read tools, then the offer again. "Finished" goes
to step 3. A finished health report is not finished: it returns here.

### Next-step offer

Call `onboarding_next_steps` with `last_job` (`categorize`, `reconcile`, or `health_report`) when a job just handed back. A finished health report uses `health_report`. That call ranks the finished report last, even when the feeds are clean, so the offer is another job. Pass `health_report` again on every later checkpoint until a different job hands back. Omit `last_job` only on the connection-status turn, before any job has handed back. Omitting it after a finished health report offers that report again. After `categorize`, also pass
`categorized_account_ids`: the account ids whose every Pending row categorization took, with no
date, text or direction filter. Leave out an account it filtered or did not finish, and pass `[]`
when that leaves none.

The call opens the skills card. It already lists each skill, so write no list and no account table.
The last line of the turn is the top job's question, copied exactly. It must be one binary question
with no alternative-action "or" clause and no second question. Example: "Should I categorize the
12 transactions waiting in Checking next?"

- **Yes:** start that job.
- **No:** offer the next job in the result, once, the same way. A second no: one sentence that the
user can ask for any of the three by name.
- **A named job:** start it.

Without `onboarding_next_steps`, offer `/categorize-transactions` when a feed has pending transactions
or needs attention, otherwise the health report, in the same sentence form. After a finished
health report, offer `/categorize-transactions` instead of the report.

### Jobs

| Job | Runs in | `args` | Overrides |
| --- | --- | --- | --- |
| `/categorize-transactions` | `categorize-transactions` skill | `entry: "connected"`, `realm_id`, `accounts` | no reports or scheduling; end at the hand-back |
| `/reconcile` | `reconcile` skill | `entry: "onboard"`, `realm_id`, `account_id` when the account is already chosen | end at the hand-back |
| `/create-reports` | this skill, then `create-reports` | `reports`, `period`, `artifact: "combined"`, `kind`, `notes` | [Health report](#health-report) |

### Categorize

Categorizing connected data loads `categorize-transactions` with `entry: "connected"` and `accounts`
from the latest feed read. It ends at its hand-back. Keep the posted, failed and unconfirmed counts and
the rows left for the user from its hand-back for the health report notes. When the hand-back has a
`next_action` (the run did not finish), say it and stop before the next-steps call. When the
hand-back's `remaining` is above 0, offer to categorize the rest of those accounts before the
next-steps call, in the same "Should I ... next?" form.

### Health report

Read [references/health-report.md](references/health-report.md) before asking live or snapshot,
loading `create-reports`, or calling a report tool, including when the user picks the health
report and when they reply live or snapshot in a later turn. It holds the question, the `args`,
and the report overrides.

## 3. Finish

When the user says they are finished, and the recurring check is still unoffered, offer a check
that reports connection problems and how many transactions are waiting, and changes nothing:
Daily, Weekly, or Not now. End the turn. A `done` after the health report is the next-step
hand-back in section 2, not this offer.

Read [references/recurring-review.md](references/recurring-review.md) before asking for schedule
details or creating the task, including when the user picks Daily or Weekly and when they reply
with a time or weekday in a later turn. It holds the task rules and the prompt.

## Done

Close with the company, what is connected, what each job did, the recurring check, and one next
action. A write still waiting for approval means the session is still open.
