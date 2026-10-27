# Recurring bank-feed review

Read before asking for schedule details or creating the recurring review task, including when the
user picks Daily or Weekly and when they reply with a time or weekday in a later turn.

The task checks the bank feed and posts a short summary. It only reads: it never imports,
categorizes, posts, or creates anything, and it does not refresh reports. For a report that updates
on a schedule, the user can ask for a scheduled update from a report later.

## What a schedule needs

1. Cadence: daily or weekly.
2. Run time. The task runs in the user's local time; if the user names another timezone, convert
   the time and say so.
3. Weekday, for a weekly task.

## Create the task

- **The reply gives everything:** call `create_scheduled_task` in that turn.
- **Something is missing:** ask for only what is missing, in one question, and end the turn. The
  reply that supplies it is the user's approval: create the task in that turn without asking again.

The `create_scheduled_task` description says to go ahead when the request clearly describes a
schedule. For this task, a schedule is clear only when it settles the cadence, the run time and,
for weekly, the weekday. Do not pick a run time or weekday for the user: "weekly" alone is not
enough.

If scheduled tasks are unavailable, give the schedule and the filled-in prompt for the user to
paste into `/schedule`. Do not claim the task was created.

## Task prompt

Each run starts with no memory of this conversation and loads no skills, so the prompt must carry
every rule. Fill in this template and keep every numbered line:

```text
Check the QuickBooks Labs bank feed for <company> (realm <realm_id>) and post a short summary.

1. Call bank_feed_list_connections with realm_id "<realm_id>". Make no other QuickBooks Labs calls:
   this task only reads. Never import, categorize, post, match, exclude, or create anything, and
   do not load skills or run reports.
2. For each account in the result, report its name and pending_count as the transactions waiting
   for review. Name every account with needs_attention and its problem.
3. If the result lists no accounts, post "No bank feeds found" with the next action "Connect a
   bank feed". This is not "up to date".
4. If every pending_count is 0 and no account needs attention, post "Bank feed is up to date:
   nothing waiting for review." A quiet result is still a summary, not a failure.
5. If QuickBooks Labs is unavailable or the call fails, retry once. If it still fails, post what failed
   and "Reconnect QuickBooks Labs" as the next action.
6. End with one next action: when anything is waiting, "Ask Claude to review your bank feed";
   otherwise none.
```

After creating the task, tell the user its schedule, what each run does, and that tasks run while
the app is open.
