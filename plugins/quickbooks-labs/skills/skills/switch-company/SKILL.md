---
name: switch-company
description: Opens the QuickBooks company picker MCP App. Use only when the user invokes /switch-company or /quickbooks-labs:switch-company.
disable-model-invocation: true
compatibility: Requires the QuickBooks Labs MCP tools and company_list.
---

# Switch company

Call `company_list` once. Pass `client_books: true` when the user explicitly asked to choose or
switch a client book. Pass `refresh: true` when they asked to refresh the list after sign-up.
Otherwise use no arguments.

When the company card opens, immediately call `company_wait` with the `picker_request_id` from that
`company_list` result. Write nothing while it waits. That wait follows only this card.

- On `waiting`, call `company_wait` again immediately with the same `picker_request_id`.
- On `selected`, stop without chat text. The user's click completed the command.
- On `timed_out`, follow the tool's recovery instructions and stop. Do not call `company_select`.
- On `card_unavailable`, follow the tool's recovery. If the user names a company from that fallback,
  call `company_select` with only the `realm_id` they named. If that result includes `client_step`,
  the choice is not finished: ask whether to keep that company or which client book to open, then
  call `company_select` again as the result says. Do not continue while `client_step` is present.

Do not call any other QuickBooks Labs tool except `company_select` in that `card_unavailable` fallback.
Do not choose a company or write to QuickBooks. The company picker performs the user's explicit
selection, and `company_select` only records a `realm_id` the user named.
