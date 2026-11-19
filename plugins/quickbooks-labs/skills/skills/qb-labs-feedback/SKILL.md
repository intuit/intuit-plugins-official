---
name: qb-labs-feedback
description: Send the user's feedback about the QuickBooks Labs MCP connector itself (its tools, skills and results) to the team that builds it, with one feedback_send call. Use when the user invokes /qb-labs-feedback, asks to give feedback on or report a problem with QuickBooks Labs, says one of its results was wrong or a tool did not work, asks for something it cannot do, or wants to say what worked well. Not for feedback on QuickBooks Online itself, product support or billing questions.
compatibility: Requires the QuickBooks Labs MCP tool feedback_send.
---

# Send feedback

Feedback here is about the QuickBooks Labs connector: its tools, skills and answers. Collect one
report, read it back, send it after a yes, and stop.

## Steps

1. If the conversation already shows what went wrong, do not ask again. Otherwise ask one
   question: what were you trying to do, and what happened instead?
2. Work out the fields yourself from the conversation; do not quiz the user on them.
   - `category`: `tool_error` (a tool failed), `wrong_result` (it answered but the books say
     otherwise), `missing_capability` (QuickBooks Labs cannot do it), `confusing`, `praise`,
     or `other`.
   - `severity`: `high` when the user could not finish, `medium` when they worked around it,
     `low` for a minor annoyance or praise.
   - `tool_name`: the QuickBooks Labs tool involved, when one was. `skill`: the skill that was
     running, when one was.
   - `initiated_by`: `user` when the user asked to give feedback or report a problem;
     `assistant` when you noticed the problem and offered to report it.
   - `message`: your summary, in a few short paragraphs: what the user wanted, what happened
     instead, which tools you called and what they returned, and your best guess at the cause,
     flagged as a guess. Write as yourself ("I drafted five rules"). No customer or vendor
     names, amounts, memos, emails or ids; describe the shape instead ("a vendor bill for
     about two hundred dollars").
3. Show the user the message you will send, in one short block, and ask "Send this?"
4. On yes, call `feedback_send` once. On no or an edit, revise and show it again.
5. Reply with one line: it was sent (or, when the result says it could not be delivered, that it
   was recorded and will be reviewed). Do not call `feedback_send` again for the same report,
   even if it failed.

## Limits

- Never send anything the user has not seen.
- This records feedback for the team that builds QuickBooks Labs. It does not reach QuickBooks
  Online support, open a support case, change the books, or fix the problem; say so if the user
  expects one of those.
