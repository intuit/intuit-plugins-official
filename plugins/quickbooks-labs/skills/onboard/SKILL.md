---
name: onboard
description: "Connect bank and card accounts to QuickBooks with QuickBooks Labs, then offer one next job: categorize waiting transactions, reconcile an account to its statement, or run a business health report. Use when the user invokes /onboard or asks to set up, get started, sign up for QuickBooks, or onboard QuickBooks Labs or their books. This is the guided setup entry point. Outside setup, categorize-transactions, reconcile, or create-reports handles that one job. When the user is finished, it offers a daily or weekly check that reports connection problems and waiting transactions and changes nothing."
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

- First `/onboard` turn: write the welcome, then run the company check (step 1). Ask the who-are-you question (step 0) only when that check finds no company or several, nobody is signed in (`sign_in_required`), or QuickBooks Labs is not connected.
- After a card that ends the turn, write nothing: no sentence that repeats its question or points at it.
- Later turns: one or two sentences about the accounts or the question, then stop.
- Tool calls run back to back. Back to back means the chat stays empty between calls. It does not
mean one parallel tool batch. A call already made, a short result, a missing tool, or an
omitted argument stays out of the chat. Continue at the next call.
- Resume when the user replies. A card sends a reply when the user links a bank through Connect
Securely ("I connected Business checking."), answers yes or no to the offer, or uses Start or a job link on the onboarding card ("Yes, start
/categorize-transactions."). A card on screen is not a reply.
- One checkpoint per turn. On the connection status turn, `company_get_connection_status` with
`onboarding: true` is the final tool call, unless its `onboarding` result has a `request_id`: then
call `onboarding_wait` with it and the `realm_id` that result names right away and write nothing while it waits. On `bank_linked`,
write nothing and call it again with the same `request_id` and `realm_id`; on `bank_skipped`, the wait has ended: write the [file ask](#skipped-bank) and end the turn; on `task_started`, start that job in this turn as the user's yes;
on `waiting`, repeat the call the same way; on `expired`, end the turn without text. Each wait
returns within 45 seconds and the request expires 10 minutes after the card opened, so the
repeats always end in `expired` if the user does nothing. It opens the onboarding card, which already shows the
first job. Then ask the one yes-or-no question
its result gives. Continue in the same turn only from an accepted offer into its job, and from a
hand-back into the next offer.
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
Keep for this conversation: the who-are-you answer, each hand-back, each report's status, and
whether the recurring check was offered. A rerun of `/onboard` skips a company or connection-status step whose live check
succeeds, then offers the next job.

## Path

Start the first `/onboard` turn with the welcome.

1. QuickBooks Labs MCP connector missing: the who-are-you question in the host's picker, then its Connect card (steps 0 and 1). Only QuickBooks Labs is required. Do not ask the user to connect Intuit QuickBooks.
2. QuickBooks Labs added but nobody signed in (a company tool returns `sign_in_required`): the signed-out who-are-you card (`quickbooks_labs_get_started`), then sign-up or sign-in ([Signed out](#signed-out)).
3. No company, or several, for this session: the who-are-you card, then the company card. Onboarding waits. The connection status
  card stays closed until the user picks a company (steps 0 and 1). A company already set skips both.
4. QuickBooks Labs connected and a company is set: the connection status card, then the next job (step 1).
5. Offer the top next job. On yes, run it. After its hand-back, offer again (step 2).
6. When the user is finished, offer the recurring check (step 3). A finished health report returns
  to step 2 first. It does not skip to this check.



## Welcome

On the first `/onboard` turn of a conversation, the first thing the user sees is this welcome.
Write it before any tool call:

**Welcome to QuickBooks Labs!** Let's get your books set up.

The welcome is not written from a tool result. Once per conversation. A rerun or a reply to a card
gets no welcome.

## 0. Who are you

Ask "How will you use QuickBooks Labs?" only when the answer changes what happens next:

- `company_get_context` returned `company_selection_required` or `no_company` (step 1 sends you
  here): use the card.
- `company_get_context` returned `sign_in_required` (nobody is signed in): use the signed-out
  card, `quickbooks_labs_get_started` ([Signed out](#signed-out)).
- QuickBooks Labs is not connected: use the host's picker, before its Connect card.

Skip it when a company is already set, when this conversation already has the answer, or when a
message already says which, such as "set up books for my new business". Ask once per conversation.

1. **Card.** Signed out (`sign_in_required`), never this card: `company_get_connection_status`
   only answers `sign_in_required` before sign-in, so use `quickbooks_labs_get_started` instead
   ([Signed out](#signed-out)) and skip the rest of this item. When signed in: step 1's ToolSearch
   already loads `company_get_connection_status`; load it then if it is still deferred. Call it
   once with `onboarding: true`. With no company set, it
   opens the who-are-you card (`kind: get_started`), which already shows the question and the three choices.
   Write nothing after it, not even a line about the card. When its result has a `request_id`,
   call `onboarding_wait` with it right away and write nothing while it waits: on `chosen`,
   continue in this turn as if the user had replied with that pick; on `waiting`, call it again;
   on `expired`, end the turn. Without a `request_id`, end the turn and wait for the reply.
   Once the card has opened in this conversation, it is the question: never ask again with the
   picker, AskUserQuestion, or a list, even when the host says the turn had no visible output.
   If the host insists on visible text, write only "Pick one on the card above to continue."
2. **Picker, when QuickBooks Labs is not connected**, when `quickbooks_labs_get_started` is missing or its card does not show,
   or, when signed in, `company_get_connection_status` is missing or returns an authorization error: ask with the host's multiple-choice question tool
   (`AskUserQuestion` in Claude Code), which is not a QuickBooks tool, then end the turn. Use these
   labels and descriptions exactly:
   - "As a new small business": "This will walk you through setting up a free company"
   - "As an existing business": "On QuickBooks already. Sign in and pick up your books where they are."
   - "As an accountant": "Managing client books. Pick which clients to manage here."

   Without such a tool, write the question and those three choices as a numbered list in the chat.

The answer, from `onboarding_wait` (`new_business`, `existing_business`, `accountant`), a card
tile reply, or the picker. Keep it, write no welcome again, and continue in that turn:

- Signed out (`sign_in_required`), after the signed-out card or the picker: follow
  [Signed out](#signed-out) only. Do not call `company_list` before sign-in.
- After the picker, with QuickBooks Labs not connected: show its Connect card (step 1).
- Signed in, **new small business** ("As a new small business.") or **existing business** ("As an
  existing business on QuickBooks."): call `company_list`, then follow the matching case in step 1.
- Signed in, **accountant** ("As an accountant managing client books."): call `company_list` with
  `client_books: true`, so the company card opens on the firm's client books, then follow the
  matching case in step 1.

## Signed out

QuickBooks Labs is added, but nobody has signed in: `company_get_context` or another company tool
returns `sign_in_required`. That is not an error and the connector is not broken; do not say it
is. Nothing is read or changed until the user signs in. The who-are-you answer picks the way in.
When this conversation has no answer yet, load `quickbooks_labs_get_started` with ToolSearch when it is deferred, then call it once: it shows the
who-are-you card, which works before sign-in. Write nothing after it and end the turn; the tile
the user clicks arrives as their next message, one of the three replies step 0 lists. Use step 0's
picker only when that tool is missing or its card does not show. Do not call
`company_get_connection_status` or `onboarding_wait` signed out.

- **New small business** (no QuickBooks Online yet): call `qbo_onboarding` to open the sign-up
  form. Pass `signup_intent: "payments"` only when they said they want to get paid or send
  invoices, otherwise `"default"`. Set `prefill` only from details the user already stated in
  this conversation; never ask for them to fill it, never guess. The form is the reply: write
  one sentence that it creates their free QuickBooks Online company, then end the turn.
- When the form posts its message that the account is ready ("continue with any actions we were
  attempting"), call `quickbooks_labs_connect` in that turn. Signing up does not sign this
  conversation in, so the user signs in once with the account they just created; when they
  already are, Connect answers that the account is connected. Once signed in, call `company_get_context`.
  With a `realm_id`, say in one line which company is connected, then go straight back to what
  the user asked for before signing up, like the invoice. Do not call
  `company_get_connection_status` or `onboarding_wait`, and do not run step 1 or 2: the user can
  ask for bank setup later. When no earlier request is waiting, start step 1.
- **Existing business** or **accountant** (on QuickBooks already): call `quickbooks_labs_connect`
  so they sign in with the Intuit account that has their books. Never open `qbo_onboarding` for
  them: it would start a second company. If they are not sure which Intuit account has their
  books, say to sign in with the email they use for QuickBooks.
- After `quickbooks_labs_connect` asks for sign-in, end the turn with one line: "Sign in to
  QuickBooks to continue." When the user is back ("done", "signed in", "try now") or Connect
  answers that the account is connected, call `company_get_context`. With a `realm_id` and an
  earlier request waiting, go back to that request as above; otherwise start step 1's company
  check in that turn. An accountant goes to their client books instead: call `company_list` with
  `client_books: true` and follow the matching case in step 1. A sign-in with no company goes to
  step 1's `no_company` case, which creates one.
- A user who asks for something before signing up, like an invoice, can see it first:
  `qbo_sales_preview_invoice` drafts one without an account.

## 1. Connect

On the first `/onboard` turn, write the welcome, then start here.

Only QuickBooks Labs is required. When QuickBooks Labs is missing, ask step 0's picker first if this conversation has no answer yet; after the answer, show its Connect card and stop. Do not
search for or suggest Intuit QuickBooks. The only line is "Connect QuickBooks Labs to continue." Add
one line to the plugin's `SETUP.md`. The next reply starts at the company check below.

Onboarding does not proceed until this session has a company. A company is set when
`company_get_context` returns a `realm_id`, when `company_wait` returns `selected`, or when
`company_select` has saved a `realm_id` in this conversation. Until then, call
`company_get_connection_status` only to open step 0's who-are-you card. Do not open
another card. The connection status card must not render on the company picker.

1. One ToolSearch for `company_get_context`, `company_list`, `company_wait`, `company_get_connection_status`, and `onboarding_wait`, when any is deferred.
2. If this conversation does not already have a `realm_id`, call `company_get_context` once. It opens no card.
3. A result with `realm_id`: the company is set. Skip step 0. Continue at the connection status calls. Do not call `company_list`.
4. `company_selection_required`: when this conversation has no who-are-you answer yet, open step 0's card and end the turn; its reply calls `company_list` (with `client_books: true` for an accountant). Otherwise call `company_list` once to open the picker, then immediately call `company_wait` with that result's `picker_request_id`. Write nothing. Do not call `company_get_connection_status` while the picker is open. On `waiting`, call `company_wait` again immediately with the same `picker_request_id`. On `selected`, the company is set: run the connection status calls and continue onboarding in this same turn. The connection status card renders only after that selection. Only on `card_unavailable` may you show the returned companies and ask once in chat. After the user names one, call `company_select` with that `realm_id`, then run the connection status calls in that same turn. Never pick a company for the user. On `timed_out`, stop.
5. `no_company`: when this conversation has no who-are-you answer yet, open step 0's card and end the turn; its reply calls `company_list`. Otherwise call `company_list` once. Do not call `company_get_connection_status`. On `setup_required`, say in a sentence or two that no QuickBooks company was found for this Intuit sign-in and that filling in the card creates a free QuickBooks Online company. For a new small business, say only that filling in the card creates their first QuickBooks Online company, free. For an existing business, add that their books may be under a different Intuit sign-in. Leave the profile blank, then immediately call `company_wait` with that result's `picker_request_id`. Write nothing else. On `waiting`, call `company_wait` again immediately with the same `picker_request_id`. On `selected`, the company is set: run the connection status calls and continue onboarding in this same turn. On `card_unavailable`, give the signup link from the fallback details and stop. On `timed_out`, tell the user to finish the setup card and type Continue, then stop. Never invent a business profile. Without `setup_required`, give the card's signup link, or `signup_url` when there is no card, and wait for the user to return after external sign-up.
6. `sign_in_required`: QuickBooks Labs is added but nobody signed in. Follow [Signed out](#signed-out). Do not call `company_get_connection_status`.
7. A sign-in or authorization error, or no such tool: the QuickBooks Labs connect card above. Do not call `company_get_connection_status`.

When a company is set, these calls go back to back. This phase calls no `bank_feed_*` tool.

1. One ToolSearch for `company_get_connection_status`, when it is deferred.
2. Call `company_get_connection_status` once with `onboarding: true`. It is the final tool call of this turn. A sign-in, authorization, or no such tool uses the QuickBooks Labs connect card. If the result is still `company_selection_required` or `no_company`, the company is not set. Go back to the matching case above. Skip `bank_feed_list_connections`.

Then the turn ends. The last line is the closing line its result names, copied exactly: the top job's yes-or-no question once a bank is connected, or "Connect a bank on the card to continue." when none is. With no bank, that line is the whole reply: no sentence before it saying nothing is connected, because the card says so. `kind: connection_status` with `onboarding` is the onboarding card. `bank_connect_url` is the connect link on that card, not a no-card result. When the host cannot paint the card, write the account lines, or the connect pitch when there is no account, and link `bank_connect_url` before that last line. Label that link Connect in your browser.

**Read failed.** After one rerun of any other error, one sentence that the accounts could not be read, plus one next action.

The user's reply:

- "I connected <bank>." posted by the onboarding card comes with context saying the card already
  refreshed. Reply with only the top job's question that context names. Do not call
  `company_get_connection_status` again: the card on screen already shows the bank and Start.
- A reply typed by the user that a bank was linked, with no such context, runs the connection
  status calls again.
- "Skip connecting a bank for now." from the onboarding card: follow [Skipped bank](#skipped-bank).
- Yes, a named job, or a "Yes, start /<job>." reply from the card starts that job.
- No refuses the offered job and follows the next-step offer. Do not start the refused job.
- `continue`, `skip`, and any other reply that is not about a bank, a statement, or the offered job: say connecting is complete, then stop. Do not name Shopify, PayPal, Stripe, Square, or Google Drive. Do not read the feeds again.

### Skipped bank

Skip on the onboarding card unlocks step 2 with only the health report. Ask once for a file
instead of a bank. The whole reply is exactly:

No problem. If you have a bank or card statement or a transaction export (PDF, CSV or Excel), attach it here and I'll bring those transactions into QuickBooks for review.

Then end the turn. Do not read the feeds again, pitch connecting a bank, or repeat the health
report's question. A Start on the card, or any reply other than a file, goes ahead without one:
follow it and do not ask for a file again.

**Statement import.** A bank or card statement or a transaction export the user attaches after the
ask, PDF, CSV or Excel:

1. Read every transaction row from the file: date, amount and description exactly as printed.
   Amounts are signed from the bank's side, so money out and card charges are negative. A file
   with no readable rows: say so in one sentence and ask for a CSV export. Stop.
2. Pick the account. Call `accounts_search` for Bank and Credit Card accounts. Use the one whose
   name or last four digits match the file. With several possible matches, ask which one. With
   none, ask to create one named for the bank and last four digits, and create it with
   `accounts_create` (Bank for a bank statement, Credit Card for a card) only after a yes.
3. Preview in one or two sentences: the number of rows, the date range, money in and money out,
   and the account. End with "Should I import these <N> transactions into <account>?"
4. After a yes, import with `bank_feed_transaction_import_start`, following its description for
   chunks, order, and unconfirmed replies. The rows land in For review.
5. Report what was imported and what was left out as already in the feed, in one sentence. Then
   go to the [next-step offer](#next-step-offer). It offers categorizing the imported rows only
   when one or more rows were imported.

A no to the import or to creating the account: one sentence that nothing was imported, then the
next-step offer.

## 2. Next steps

The onboarding card makes the first offer on the connection status turn. Offer here after each
hand-back. There is no next-steps tool and no skills card. Skip `bank_feed_list_connections` here.

A request outside these jobs gets QuickBooks Labs read tools, then the offer again. "Finished" goes
to step 3. A finished health report is not finished: it returns here.

### Next-step offer

Write no list and no account table. The last line of the turn is one binary question, with no
alternative-action "or" clause and no second question. Copy it from the ranked job. Example:
"Should I categorize the 12 transactions waiting in Checking next?"
One sentence before the question may name an account whose feed `needs_attention`.

Before any job has handed back, and while the feeds are unchanged since the connection status
result, the ranked list is `onboarding.options` on that result. Offer `options[0]` and copy its
`offer` exactly. A no offers `options[1]` once. After the card posts "I connected <bank>.", its
context names the refreshed top offer and the offer for a no: copy those, not the earlier list.

After a hand-back or a statement import, the first result's `options` are out of date, so do not
copy them. Rank the same three jobs from the feed rows already in context with the rules below,
counting the job that just handed back. Do not call `bank_feed_list_connections`.

- Pending rows, `needs_attention`, or a book balance that differs from the bank balance on a feed
  that is not a CSV upload put `/categorize-transactions` first, then `/reconcile`, then the health
  report. A CSV upload reports a bank balance of 0, so that difference does not count.
- No such signal puts the health report first, then `/categorize-transactions`, then `/reconcile`.
- A statement import that reported one or more imported rows puts `/categorize-transactions` first,
  the same as pending rows.
- After categorize: in the accounts that run covered, pending rows and a balance difference do not
  count. The run changed both after the feed read, and the hand-back has no new balance. Pending
  rows or a balance difference outside that run, and `needs_attention`, still put categorize first.
  When they do not, the health report is first, then `/reconcile`, and categorize is last.
- After the health report: do not offer the report again. Offer `/categorize-transactions`.
- After reconcile: it is last. Offer `/categorize-transactions` when a signal still raises it,
  otherwise the health report.

A no offers the next job in that order once. A second no: one sentence that the user can ask for
categorize, reconcile, or the health report by name.

- **Yes:** start that job.
- **No:** offer the next job in that order once, the same way.
- **A named job:** start it.

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
`next_action` (the run did not finish), say it and stop before the next-step offer. When the
hand-back's `remaining` is above 0, offer to categorize the rest of those accounts before the
next-step offer, in the same "Should I ... next?" form.

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
