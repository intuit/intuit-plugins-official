---
name: configure
description: Set up QuickBooks Labs. Runs the plugin's setup skill from its first step - onboard-accountant in the accounting-firm plugin, onboard otherwise (connect QuickBooks, show bank and card balances with a bank connect button, then offer the top next job). Use when the user invokes /configure or on first plugin run.
disable-model-invocation: true
compatibility: Requires the QuickBooks Labs MCP tools.
---

# QuickBooks Labs configure

`/configure` is the plugin's setup, under the name hosts use for a finish-setup entry. Which setup
depends on the plugin:

- **The accounting-firm plugin**: `/quickbooks-labs:onboard-accountant` is among your skills.
  Load that skill and follow it from its first step, as a first
  `/quickbooks-labs:onboard-accountant` turn.
- **Otherwise**: load `onboard` and follow it from its first step, as a first `/onboard` turn.
  Another plugin's `onboard-accountant` (one under a different `/<plugin>:` name) does not count.

Load only that one skill, unless it is already in context, and never ask the user which setup to
run. Write its welcome before any tool call, and follow its voice, limits, checkpoints, and
completion response unchanged. A later reply, a rerun of `/configure`, or a rerun of that setup
skill continues the same flow with no second welcome.

Add nothing of your own. Keep setup rules in the setup skill.
