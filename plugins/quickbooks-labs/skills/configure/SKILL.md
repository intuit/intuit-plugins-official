---
name: configure
description: Set up QuickBooks Labs. Connects QuickBooks, shows bank and card balances with a bank connect button, then offers the top next job as one yes-or-no question. Runs the same setup as /onboard. Use when the user invokes /configure or on first plugin run.
disable-model-invocation: true
compatibility: Requires the QuickBooks Labs MCP tools.
---

# QuickBooks Labs configure

`/configure` is the same setup as `/onboard`, under the name hosts use for a finish-setup entry.

Load the `onboard` skill, unless it is already in context, and follow it from its first step. Treat
this turn as the first `/onboard` turn of the conversation: write its welcome before any tool call.
Follow its voice, limits, checkpoints, and completion response unchanged. A later reply, a rerun of
`/configure`, or a rerun of `/onboard` continues the same flow with no second welcome.

Add nothing of your own. Keep setup rules in `onboard`.
