# Scheduled Artifact updates

Read before asking for schedule details or creating a scheduled task, including when the first
request already asks for recurring updates and when the user replies with schedule details in a
later turn.

## What a schedule needs

1. Cadence: daily, weekdays, or weekly.
2. Run time. The task runs in the user's local time; if the user names another timezone, convert
   the time and say so.
3. Weekday, for a weekly task.
4. Period: whether a relative period such as last month or fiscal year to date rolls forward on
   each run, or the report's dates stay fixed.

The task works from the Artifact this conversation just created. Do not ask the user for it, and
do not create a task before that Artifact exists.

- **Snapshot:** each run publishes a new version of that snapshot.
- **Live:** each run creates a separate dated snapshot and leaves the live Artifact unchanged. The
  live page already refreshes itself; never republish it with frozen figures.

## Create the task

- **The request gives all four:** call `create_scheduled_task` right after the Artifact is
  created.
- **Something is missing:** ask for only what is missing, in one question, and end the turn.
  The reply that supplies it is the user's approval: create the task in that turn without asking
  again.

The `create_scheduled_task` description says to go ahead when the request clearly describes a
schedule. For a report task, a schedule is clear only when it settles all four: the cadence, the
run time, the period, and, for weekly, the weekday. Do not pick a run time or weekday for the
user. "Every week" or "keep it refreshed" is not enough: ask first.

If Cowork scheduled tasks are unavailable, give the schedule and the filled-in task prompt for
the user to paste into `/schedule`. Do not claim the task was created.

## Task prompt

Each run starts with no memory of this conversation and loads no skills, so the prompt must carry
every rule. Fill in this template, keep every numbered line, and use the lines 4 and 5 wording
for the Artifact's kind. In line 4, copy the page's `chart` and `notes` JSON exactly, so every run
keeps the graph and notes; leave out observations, which would go stale:

```text
<Snapshot: Update the QuickBooks Labs <report title> Artifact <Artifact URL> with fresh QuickBooks
data.> <Live: Save a dated snapshot of the QuickBooks Labs <report title> report. Never publish to the
live Artifact <live Artifact URL>; it refreshes itself.>

1. Period: <rule resolved on each run, such as "the previous calendar month before today's
   date"; or "<start> to <end>, the same every run">.
2. Call reports_run with realm_id "<realm_id>", report "<report>", basis "<basis>", <filters,
   grouping, or summarize_by, if any>, and that period. Make no other QuickBooks calls; this task
   only reads.
3. Build from the JSON block, not the one-line summary. Check the returned title, period,
   basis, meta.no_data, totals, <the Balance Sheet or Trial Balance tie-out, if any>, and
   meta.page.next_offset.
4. Build the page in one shell command, without writing HTML: set
   T=$(find /sessions / -path '*/skills/create-reports/assets/snapshot-report.html' -print -quit 2>/dev/null),
   and only if [ -r "$T" ] succeeds, write, into the folder where you save files, a first line
   <title>title</title> with & as &amp;, < as &lt; and ' as &#39;, then the file "$T", then this
   JSON, then </script>:
   {"title": "<title>", "company": "<company>", "sections": [{"report": <the returned JSON
   block, without any row's or total's path, id, cell_ids, cell_links or cells, except cells for
   columns missing from values><, "chart": <the chart JSON>>}], "notes": [<the data-quality
   notes as JSON strings>]}. Write < inside JSON strings as \u003c and change no returned value.
   Add no <html>, <head> or <body>, and do not read the file back. If [ -r "$T" ] fails, write
   nothing: the template is missing, which is a failure under step 5.
   <Snapshot: The title is "<the Artifact title>". Publish that file to <Artifact URL> as a new
   version, not a separate Artifact.> <Live: The title is "<report title> — <company> — <the
   resolved period> (saved <today's date>)". Publish that file as a new Artifact that declares no
   connectors.>
5. On failure — QuickBooks Labs unavailable, the report call fails, a check fails, the template is
   missing, or meta.no_data is true:
   <Snapshot: do not publish; leave the last valid version in place.>
   <Live: create no Artifact.>
6. Report what failed, or "no data for <period>", and one next action.
```

After creating the task, tell the user its schedule, what each run does, and that tasks run
while the app is open.
