---
name: connect-bank
description: Opens the QuickBooks Labs connection status MCP App for the active QuickBooks company. Use only when the user invokes /connect-bank or /quickbooks-labs:connect-bank.
disable-model-invocation: true
compatibility: Requires the QuickBooks Labs MCP tools and company_get_connection_status.
---

# Connect bank feeds

Call `company_get_connection_status` once with no arguments.

Do not call any other QuickBooks Labs tool. Do not write to QuickBooks.

When the tool returns, stop without chat text so the connection status app owns the turn.
