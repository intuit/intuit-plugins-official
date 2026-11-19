# Reports in chat or a local file

Read before presenting a report in chat or writing a local file, including when the first request
asks for one, when the user asks in a later turn, and when Claude cannot create an Artifact. A
chat or file report is never published: call no Artifact tool for it, and do not ask live or
snapshot. SKILL.md sections 1 to 5 still apply: the period question, the report call, and the
checks.

## Chat

Write the report in the reply:

1. A heading, `<Report title> — <company> — <period or as-of date>`, then one line with the
   returned basis, currency, and generated-at time.
2. One Markdown table with a row for each returned row, in the returned order, using the returned
   labels and values. Show the hierarchy from `level`: bold section headers, Summary rows, and
   `totals`, and start a child label with one `–` for each level below its section. Use no HTML
   entities or tags such as `&nbsp;`, which a terminal shows as text. Leave a missing value
   blank; never write zero for it.
3. For a Balance Sheet or Trial Balance, the tie-out from section 5.
4. "What stands out": two to four evidence-backed observations.
5. Data-quality notes: pagination, a cut result, unavailable comparisons, and a caller's notes.

Then:

- Several reports in one request get one heading and table each, in one reply.
- A report of more than about 60 rows shows each section's Summary rows and the returned
  `totals`. Say how many rows are not shown, and offer the full report as a file or a narrower
  report. Never leave rows out without saying so.
- Chat cannot draw a graph. Give its series as a table and say a file or an Artifact can draw it.
- Empty (`meta.no_data`): write no table. Say the report has no data for the exact period and
  filters, and ask whether to change the period. Partial: the summary's figures as returned, what
  was not returned, and the rerun as the next action. Blocked: the error and its `next_action`.
- When the report is in chat because Claude cannot create an Artifact, say so in one sentence. Do
  not tell the user to turn Artifacts on.

## Local file

Write the snapshot file with step 1 of "Build the page from a template" in SKILL.md section 6,
from `assets/snapshot-report.html`, and stop there. Skip step 2 and call no Artifact tool. The
file holds this conversation's figures and declares no connectors.

- Name the file after the report, company, and period, in the folder where you save files for the
  user.
- After the byte count, tell the user the file's name and folder, that it was not published as an
  Artifact, and two to four key returned figures. Do not repeat the full report in chat.
- If this host has no shell or file tool, or the write fails, show the report in chat as above
  and say the file could not be written.
- Empty: write no file. A partial or blocked report uses the template's `partial` or `blocked`
  section.

## After either

- Offer one follow-up (section 7). Do not offer scheduled updates: each scheduled run publishes
  an Artifact.
- If the user later asks for an Artifact, build it from section 6 and ask live or snapshot then.
- In the completion response, Output is chat or local file, and Scheduled update is not offered.
