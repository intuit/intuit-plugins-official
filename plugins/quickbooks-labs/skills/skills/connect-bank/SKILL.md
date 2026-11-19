---
name: connect-bank
description: Opens the QuickBooks Labs connection status MCP App for the active QuickBooks company, or writes its connected accounts and a connect link in chat where cards don't show. Use only when the user invokes /connect-bank or /quickbooks-labs:connect-bank.
disable-model-invocation: true
compatibility: Requires the QuickBooks Labs MCP tools and company_get_connection_status.
---

# Connect bank feeds

Call `company_get_connection_status` once with no arguments.

Do not call any other QuickBooks Labs tool. Do not write to QuickBooks.

When the tool returns, stop without chat text so the connection status app owns the turn, unless
this host cannot show cards (Claude Code in a terminal) or the user says the connection status did
not appear: then follow the chat path.

## Chat path

Write what the card shows from that result instead of stopping: one line per connected account
with its name and balance, and for an account with `needs_attention` its `reconnect_url`, labeled
Reconnect in your browser (`reconnect_kind` bank_sign_in) or Fix in QuickBooks (quickbooks_fix);
or, with none, one sentence that no bank or card is connected yet.
Start with those lines; do not mention the host, the card, or this path. Then link
`bank_connect_url`, labeled Connect in your browser, and say to reply once the bank is linked.
Say with it: if a bank or card is already an account in their books, pick that account when
QuickBooks asks where it goes, because Add new creates a second account with its own opening balance.
On that reply, call `company_get_connection_status` once more and write the accounts the same way.
Show no full account numbers. Never open a bank sign-in or QuickBooks' Fix now with browser tools.
