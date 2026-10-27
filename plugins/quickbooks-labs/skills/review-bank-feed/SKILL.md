---
name: review-bank-feed
description: Opens the QuickBooks Labs bank feed MCP App for the active QuickBooks company. Use only when the user invokes /review-bank-feed or /quickbooks-labs:review-bank-feed.
disable-model-invocation: true
compatibility: Requires the QuickBooks Labs MCP tools and bank_feed_review.
---

# Review bank feed

Call `bank_feed_review` once. Pass `account_id` or `account_name` only when the user named an account
or filter in this message; otherwise call it with no arguments.

Do not call any other QuickBooks Labs tool. Do not write to QuickBooks.

When the tool returns, stop without chat text so the bank feed app owns the turn.
