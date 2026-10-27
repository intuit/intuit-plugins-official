---
name: create-reports
description: Create Claude Artifacts containing QuickBooks financial reports and visualizations from QuickBooks Labs, either live pages that rerun the report through the QuickBooks Labs connector each time they open or fixed snapshots, and optionally schedule recurring updates. Use whenever the user invokes /create-reports or asks to see, prepare, compare, summarize, chart, keep up to date, or build a dashboard of a P&L, balance sheet, cash flow statement, trial balance, aging, sales, vendor, inventory, transaction, or other QuickBooks report. Clarify missing details and render only values returned by the tool.
compatibility: Requires Claude Artifacts and the QuickBooks Labs MCP report tools. Live Artifacts also need QuickBooks Labs as a claude.ai connector with artifact connector calls on. Claude Cowork scheduled tasks are optional and are used only when the user requests recurring updates.
---

# Create QuickBooks reports

Turn the user's reporting question into the right QuickBooks report, then present the returned
data in a useful artifact with a concise chat summary. Treat the user's wording as the source of
intent: do not force a standard report pack when they asked for one specific report.

## Ground rules

- Report tools are read-only. Run only the reports needed to answer the request.
- Ask for the reporting period whenever the user did not provide one. Do not silently choose a
  default month, quarter, fiscal year, or as-of date. The one exception: an as-of report the user
  wants live or always up to date, with no date named, is as of today, even if it becomes a
  snapshot. Say so in the summary.
- Ask which report they want when the request does not identify one. Give a short, useful menu
  rather than listing the entire report catalog.
- Use exact values, labels, dates, basis, and currency returned by QuickBooks Labs. A planned tool
  call, an empty result, or a failed call is not a generated report.
- Every completed report must be a Claude Artifact. Do not substitute a chat-only table,
  Markdown attachment, or claimed artifact link for an actual artifact.
- Calculate and chart from parsed `values`, not display `cells`, as the `reports_run`
  description explains.
- Never invent report rows, balances, comparisons, trends, explanations, or accounting advice.
  Separate observations supported by the report from hypotheses that would need more evidence.
- Do not expose unnecessary sensitive details in chat. Keep full report data in the artifact when
  the host supports artifacts.
- An Artifact is live only when its page fetches through a declared QuickBooks Labs connector. Never
  call a snapshot live or ask the user to reload one to see whether it refreshes; it will not.
  Never republish a live page with fixed figures.

## Limits

- Rerun a failed or summary-only report call at most once. Never wait on a timer or poll.
- After two failed or empty attempts at the same report, stop and tell the user what came back
  and one next action. Do not work around it with other reports, tools, or connectors.
- Call only `company_get_context`, the QuickBooks Labs report tools, the Artifact tools, the shell or
  file tool that writes the page (section 6), and, on the scheduled-update path, the
  scheduled-task tool. Do not load other skills.

## 1. Establish the request

At the start, identify:

1. the business question or requested report;
2. the reporting period or as-of date;
3. the accounting basis when the report supports one;
4. the desired presentation, such as table, graph, comparison, or concise summary; and
5. live or snapshot.

Reuse details the user already supplied. Ask only for missing information, in one question.

### No report specified

Ask one concise question using business-friendly choices:

- Profit & Loss — income, expenses, and profit over a period
- Balance Sheet — assets, liabilities, and equity as of a date
- Cash Flow — operating, investing, and financing cash movement
- Receivables or payables aging — who owes money or what bills are due
- Sales or expenses — performance by customer, product/service, vendor, class, or location
- Another QuickBooks report

If the user describes a business question instead of a report name, route that question to the
closest report. Ask a focused follow-up when materially different reports could answer it. For
example, "show sales" needs a dimension such as customer, product/service, class, or location.

### No period specified

Ask for the period before running a report, except for a live as-of report (ground rules). Offer
choices appropriate to the report:

- Range reports: this month, last month, this quarter, fiscal year to date, or custom dates
- Snapshot reports: today, month end, quarter end, or a custom as-of date

For reports that support Cash or Accrual basis, include that choice in the same question if the
user has not stated it. Do not confuse a cash-basis P&L with a Statement of Cash Flows.

### Live or snapshot

A live Artifact reruns its report through the viewer's QuickBooks Labs connector each time it opens;
a snapshot keeps this conversation's figures. "Always up to date", "whenever I open it", "live",
or "dashboard" means live; "snapshot", "board pack", "freeze", or "public link" means snapshot.
When the user names neither and live is available (section 2), ask, in the same question as any
other missing details, with live first.

## 2. Check capabilities

Required QuickBooks Labs capabilities:

- `company_get_context`
- `reports_list`
- `reports_run`

Required host capability:

- Claude Artifacts

If the report tools are unavailable, tell the user QuickBooks Labs must be connected and offer the
host's connector setup flow. Stop after that handoff. If Claude cannot create an Artifact, tell
the user to enable Artifacts and cloud code/file creation, then stop. Do not generate the report
only in chat.

Live is available only when the Artifact tool lets a page declare QuickBooks Labs as a connector.
That needs QuickBooks Labs connected to the user's claude.ai account (Settings > Connectors),
artifact connector calls on (an org Owner's Enable artifact connectors, Settings > Capabilities),
and the user's AI-powered artifacts on (Settings > Capabilities). A plugin or `.mcp.json` server
supplies data only while you build the page. When live is unavailable, build a
snapshot without asking, and say why in one or two short sentences that name only the missing
requirement: for example, "QuickBooks Labs is connected only through the plugin, so this is a
snapshot. Connecting it under Settings > Connectors would make it live." If you cannot tell which
is missing, name the connector. When the user asks to make an existing snapshot live, run no
report: say why, offer a refreshed snapshot or scheduled updates, and wait for their choice.

Claude Cowork scheduled-task creation is optional. Its absence must not block the initial report
Artifact.

## 3. Select the report

Run every report with `reports_run`. Call `reports_list` first when the report name, period kind,
supported filters, comparison options, grouping, or runnability is uncertain. The catalog result
is authoritative; do not guess unsupported report options.

Common routes include:

| User intent | `reports_run.report` |
| --- | --- |
| Profit & Loss, income statement, profit | `ProfitAndLoss` |
| Balance Sheet, financial position, assets and liabilities | `BalanceSheet` |
| Trial Balance, debit/credit tie-out | `TrialBalance` |
| Statement of Cash Flows | `CashFlow` |
| A/R aging | `AgedReceivables` |
| A/P aging | `AgedPayables` |
| Open invoices | `OpenInvoices` |
| Unpaid bills | `UnpaidBills` |
| General ledger | `GeneralLedger` |
| Transaction list | `TransactionList` |
| Sales by customer | `CustomerSales` |
| Sales by product/service | `ItemSales` |
| Sales by class | `ClassSales` |
| Sales by location | `DepartmentSales` |
| Expenses by vendor | `VendorExpenses` |
| Inventory value | `InventoryValuationSummary` |

Use `reports_list` rather than this routing table for requests outside these common cases or when
the user asks what reports are available.

## 4. Build a valid request

Call `company_get_context` before the first report and pass its `realm_id` on every report call,
so each report stays pinned to the company named in its Artifact. Use exactly one period form:

- Range report: `{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }` or one supported macro
- Snapshot report: `{ "as_of": "YYYY-MM-DD" }`, an end date, or one supported macro
- No-period report: `{}`

Read [references/live-artifact.md](references/live-artifact.md) before the first report call for
a live Artifact, including when the user picks live in a later turn, when they ask to make a
snapshot live, and when they say a live page is not working. It holds the live period rules, the
page's connector contract and its error states.

P&L, Cash Flow, Trial Balance, General Ledger, sales, and expense reports normally use a range.
Balance Sheet, aging, open-invoice, unpaid-bill, and balance reports normally use an as-of date.
When uncertain, read the matching `reports_list` descriptor and follow its `period_kind`.

Read [references/graphs.md](references/graphs.md) before choosing a time grouping or building a
graph, including when the first request asks for a graph or trend and when the user accepts an
offered graph in a later turn. It holds the grouping and chart rules.

Detail reports can be large. Narrow the period and filters, request only useful columns, and use
pagination when the catalog says it is supported. Never imply that the first page is complete
when `meta.page.next_offset` is present. A page's totals cover only that page, so never
quote them as the report's totals. A result over the size limit comes back cut, with
`meta.truncated` set and the summary saying TRUNCATED. Its last section is complete only when
`meta.truncated.cut_at` is `section`; when it is `row`, the rows stop mid-section, so never show
that last section as whole. When it is not a page and `meta.truncated.totals_available` is
absent, its totals are QuickBooks' own, so quote them; when `totals_available` is present, only
the last totals were kept, so say which are missing. Never sum the rows or present them as the whole report. Tell the user what was left
out and narrow the request the way the summary suggests.

To show a whole detail report that is too big for one result, on a snapshot only (a live page
shows one result with its warning), page through it and combine the pages into one section:

- Call `reports_run` with `page`, starting at offset 0, and follow `meta.page.next_offset` until
  it is null. Keep a page's own cut: if a page has `meta.truncated`, its `next_offset` already
  resumes at the first dropped row.
- Copy every row exactly as returned, `cell_ids` included; never retype or reshape rows.
- Every page repeats each section's Header row and, on a General Ledger, its Beginning Balance
  row (the Data row with no `cell_ids`). Keep each only the first time it appears, and drop every
  page's Summary rows and `totals`: they cover that page only.
- Take the `totals` (the level-0 Summary rows) from one run of the same request without `page`,
  and put each after the last row of its section. A cut run keeps every total unless its
  `meta.truncated.totals_available` is set; if it is, say which totals are missing. A cut run
  can drop Summary rows below level 0, so combine pages only when every Summary row the pages
  return is level 0 (a General Ledger or a transaction list); otherwise show the cut result.
- Check that the combined Data rows with `cell_ids` number the sum of the pages' and that no
  posting repeats. A posting is the same only when its `path`, transaction id and amount all
  match: one transaction posts once per account, so the same id under different accounts is
  normal. Then drop `meta.page` and `meta.truncated` from the combined report and
  add a note naming the pages combined. If a check fails, show the cut result instead.

## 5. Validate the result

Each report tool returns two text blocks: a one-line summary (title, period, row and total
counts, and the last total), then the full report as JSON. Build the report from the JSON block.
The summary names only the last total, so a report built from it would be missing every account
line and, on a Balance Sheet, TOTAL ASSETS. The `reports_run` description explains the rows,
cells, values, and totals; this skill relies on:

- `meta`: `title`, `source`, `basis`, `currency`, `period`, `generated_at`, `no_data`,
  `page.next_offset`, and `truncated`;
- each row's `path` and `level`, for the hierarchy; and
- `totals`, for headline totals such as Net Income or TOTAL ASSETS.

Before presenting the report:

- confirm the returned report title and source;
- confirm the returned period and accounting basis;
- check `meta.no_data`;
- preserve the returned row hierarchy using `path` and `level`;
- use `totals` for headline totals rather than recomputing them from a partial row set;
- for a Balance Sheet, compare TOTAL ASSETS with TOTAL LIABILITIES AND EQUITY and disclose any
  returned imbalance; and
- for a Trial Balance, compare total debits with total credits and disclose any returned
  difference.

Give each report one status:

- **Generated:** the JSON block came back and passed these checks. A disclosed imbalance is
  still generated.
- **Empty:** `meta.no_data` is true. Create no Artifact for it, because an empty Artifact spends
  usage and shows nothing. Tell the user it has no data for the exact period and filters, and ask
  whether to change the period or create it anyway; the request's other reports still get theirs.
  If they want it, show an explicitly empty state; do not fabricate zeros.
- **Partial:** the result had the summary line but no JSON block, and one rerun of the same call
  still had none. Create the Artifact as a partial report: show the figures the summary names
  exactly as returned, mark the rows, other totals, and basis as not returned, and give rerunning
  the report as the next action. A labeled partial report tells the user what QuickBooks
  returned; never fill the gaps from the summary's row counts or from other reports.
- **Blocked:** the call failed, or QuickBooks Labs or Artifacts are unavailable. Show the error and
  give the tool's `next_action` to the user as the next step instead of acting on it. The only
  exception is one immediate rerun of the same call, which counts against the limit above.

## 6. Present the report

Create one Claude Artifact per requested report. This keeps each report readable and lets the
user request several reports without combining unlike structures.

A snapshot declares no connectors and embeds the figures returned in this conversation.

Title each artifact:

```text
<Report title> — <company> — <period or as-of date>
```

Include:

1. report title, company, period, basis, currency, and generated-at timestamp when returned;
2. the report table with its hierarchy and returned totals;
3. the requested graph, when applicable;
4. a short "What stands out" section containing only evidence-backed observations; and
5. data-quality notes, including no-data state, pagination, unavailable comparisons, or errors.

Create a graph only when the user asks for one or accepts an offered visualization.

### Build the page from a template

Build every report page from a template in `assets/`, never by writing HTML: `snapshot-report.html`
for a snapshot, `live-report.html` for a live page, including a rebuilt or republished page. Each
is a finished page that renders the JSON appended after its last line, so the title and that JSON
are the only text you write. A hand-written page repeats thousands of tokens of markup and skips
the template's checks.

1. Write the file in one shell command, in the folder where you save files for the user:

   ```bash
   T="<this skill's base directory>/assets/snapshot-report.html"
   [ -r "$T" ] || T=$(find /sessions / -path '*/skills/create-reports/assets/snapshot-report.html' -print -quit 2>/dev/null)
   [ -r "$T" ] && {
     echo '<title><the Artifact title></title>'
     cat "$T"
     sed 's/</\\u003c/g' <<'CLAUDEBOOKS_JSON'
   <the page JSON>
   CLAUDEBOOKS_JSON
     echo '</script>'
   } > "<folder>/<name>.html" && wc -c "<folder>/<name>.html"
   ```

   In Cowork the shell sees the plugin under `/sessions/<id>/mnt/`, not at the base directory;
   the `find` covers that. Use `live-report.html` in both paths for a live page. In the title,
   write `&` as `&amp;`, `<` as `&lt;` and `'` as `&#39;`; `sed` escapes `<` in the JSON. The
   byte count confirms the write: do not read the file or the template back, which adds the whole
   page to your context and checks nothing the template's tests do not. No byte count means the
   template was not found and nothing was written: go to step 3.
2. Publish that file with the Artifact tool. The Artifact takes its name from that first-line
   `<title>`, and the tool adds the `<html>`, `<head>` and `<body>` itself, so add nothing around
   the file. A snapshot declares no connectors. To update an Artifact, write a new file the same
   way and pass the Artifact's `url`.
3. Only if the command printed no byte count, read the template and write the same file with
   your file tool: the title line, the template unchanged, the JSON with `<` written as `\u003c`,
   then `</script>`. Never publish a page without the template.

The snapshot JSON:

```json
{
  "title": "<the Artifact title>",
  "company": "<company_name from company_get_context>",
  "sections": [{ "report": <the reports_run JSON block>, "chart": <only for a graph> }],
  "observations": ["<one evidence-backed observation per item>"],
  "notes": ["<data-quality notes, including a caller's notes>"]
}
```

- `report` is the JSON block exactly as returned, minus what the page does not read: drop every
  row's and total's `path`, `id`, `cell_ids`, `cell_links` and `cells`, but keep `cells` entries for
  columns that never appear in `values`, such as Date or Name. Change no label, number or null.
- The page shows `meta`'s title, period, basis, currency and generated-at, the hierarchy from
  `level` and `kind`, `totals` as key figures, the Balance Sheet or Trial Balance tie-out, and a
  note when `meta.page.next_offset` is present. Do not repeat those in `notes`.
- A combined Artifact lists every report in `sections`. A report the user wants despite no data
  is `{ "status": "empty", "report": ... }`. A partial one is `{ "status": "partial", "heading":
  "<report title>", "summary": "<the summary line exactly as returned>", "next_action": "Rerun
  the report" }`. A blocked one is `{ "status": "blocked", "heading": ..., "error": { "code",
  "message", "next_action" } }`.
- `chart` follows [references/graphs.md](references/graphs.md); a live page's JSON is the config
  in [references/live-artifact.md](references/live-artifact.md).

Confirm that the Artifact was actually created, then give a short chat summary with its name and
two to four key returned figures or observations. Do not duplicate the full report in chat.

## 7. Offer one report follow-up

After presenting the requested report, offer one relevant follow-up rather than a catalog dump.
Examples:

- compare the same report with the prior period or prior year;
- drill into a material P&L account with `ProfitAndLossDetail` or `GeneralLedger`;
- pair P&L with Balance Sheet or Cash Flow;
- show aging detail behind receivables or payables; or
- change the chart granularity.

Run another report only when the user accepts or when it was part of the original request.

## 8. Offer scheduled Artifact updates

At the end of every successfully created snapshot Artifact, ask whether the user wants Claude to
update that Artifact automatically on a cadence. Offer:

- Daily
- Weekdays
- Weekly
- Not now

A live Artifact is already current, so do not offer this. If the user asks for a schedule on one,
say so and offer dated snapshots, which leave the live Artifact unchanged.

Read [references/scheduled-updates.md](references/scheduled-updates.md) before asking for
schedule details or creating a scheduled task, including when the first request already asks
for recurring updates and when the user replies with schedule details in a later turn. It holds
the rules for creating the task and what its prompt must contain.

## When another workflow loads this skill

`/onboard` loads this skill by name for its business health report, a Profit & Loss and Balance
Sheet. When a workflow loads it:

- The caller's overrides win, whether they arrive in the Skill tool's `args` (`reports`, `period`,
  `artifact: "combined"` for one Artifact holding every report, `kind` of `live` or `snapshot`,
  and `notes` for its data-quality notes) or in the caller's own instructions: for example,
  skipping the follow-up and scheduled-update offers.
- Build the passed `kind`. When `kind` is missing, ask live or snapshot, live first, and end the
  turn before any report call. When the passed `kind` is live and live is unavailable, section 2
  applies. Show a report with no data as an `empty` section.
- A partial or blocked report does not stop the others. Show its section with the returned
  figures, error, and next action, and offer the retry to the user.
- End with this hand-back instead of offering next steps of your own:
  - `reports`: for each report, its name, status, and the returned period and basis;
  - `artifact`: the Artifact title, or blocked; and
  - `next_action`: one step for the user when a report is not generated.

## Completion response

End with:

- Report: generated, partial, empty, or blocked
- Period and basis: the exact returned settings
- Artifact: live, snapshot, not created (no data), or blocked
- Scheduled update: created, declined, instructions provided, awaiting schedule details, or not
  offered (live)
- Next action: one concrete option

Do not mark the report generated until QuickBooks Labs returned report data and the Claude Artifact
was actually created. Do not mark a scheduled update created until Cowork confirms the task.
