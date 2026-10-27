# Business health report

Read before asking live or snapshot, loading `create-reports`, or calling a report tool, including
when the user picks the health report from the next steps and when they reply live or snapshot in
a later turn. It holds the question, the `args`, and onboarding's overrides for the report.

## Live or snapshot

When the user has not chosen live or snapshot, ask that one question and end the turn, before
loading `create-reports` or calling a report tool. Ask even when a live Artifact may be
unavailable. Live first:

- Live — the page reruns the Profit & Loss and Balance Sheet through QuickBooks Labs each time it opens
- Snapshot — keeps this conversation's figures

A reply of live, always up to date, or dashboard chooses live. A reply of snapshot, freeze, or
public link chooses snapshot.

## Load create-reports

On that reply, load the `create-reports` skill before calling any report tool, and pass
`reports: ["ProfitAndLoss", "BalanceSheet"]`, the `period`, `artifact: "combined"`, `kind`
(`live` or `snapshot`), and `notes`. The notes hold the imported period, the failed and
unconfirmed counts and the rows left for the user from a categorization hand-back, and the pending counts
from the latest feed read, because pending transactions are not in the figures yet. This report is
one step in onboarding, not a report request, so:

- Do not ask for a period. The Profit & Loss is the fiscal year to date and the Balance Sheet is
  as of today, from `company_get_context`'s `server_date` and fiscal year start. For a live
  Artifact, pass those as `ThisFiscalYearToDate` and `Today`, so the page stays current. For a
  snapshot, pass the explicit dates. Omit `basis`, so QuickBooks uses the company's default, and
  show the returned basis.
- Build one Artifact. Title a snapshot `QuickBooks Labs Financial Snapshot — <company> — <as-of date>`.
  Title a live Artifact `QuickBooks Labs Financial Report — <company> — fiscal year to date`. Include
  the period and basis, the Profit & Loss, the Balance Sheet, the "What stands out" section, the
  data-quality notes, and the generated-at time. Leave out graphs unless the user asks. When a
  report has no data, build the Artifact anyway and mark that section empty.
- When the user picks live and a live Artifact is unavailable before the page is built,
  `create-reports` explains why and builds the snapshot. When a published live page does not
  work, the choice of live stands: `create-reports` diagnoses and fixes the page, and builds a
  snapshot only if the user asks for one.
- Skip the report follow-up and scheduled-update offers; the end of onboarding handles recurring
  work.
- When a report fails or comes back summary-only, `create-reports` allows one immediate rerun.
  After that, do not follow the tool's `next_action` yourself: show the section as partial or
  blocked with the returned figures and error, keep the other report complete, and offer the retry
  to the user.

## After the Artifact

Each report is generated, partial, empty or blocked. After showing the Artifact, ask the user to
review it and say `done` or describe changes, and end the turn. On `done`, return to the next steps
in `/onboard` and call `onboarding_next_steps` with `last_job` `health_report` before the offer.
That finished report ranks last, so the offer is the next job. Pass `health_report` again on every
later checkpoint until a different job hands back. Omitting it after this report offers the
finished report again when the feeds are clean. This done is not the recurring check.
