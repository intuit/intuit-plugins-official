# Live report Artifacts

Read before the first report call for a live Artifact, including when the user picks live in a
later turn, when they ask to make a snapshot live, and when they say a live page is not working.
A live page reruns its report through the viewer's own QuickBooks Labs connector each time it opens,
and shows only figures the page fetched. To make a snapshot live, build a new live Artifact; do
not republish the snapshot.

## Period

- Send a relative period as its macro, so QuickBooks resolves it on each open: "last month" is
  `LastMonth`, "as of today" is `Today`, "this quarter" is `ThisQuarter`. When the fiscal year
  (`company_get_context`'s `fiscal_year_start_month`) does not start in January, ask whether "year
  to date" means `ThisFiscalYearToDate` or `ThisYearToDate`.
- Keep explicit dates fixed.
- A period no macro covers, such as the trailing 12 months, is a `period_rule` the page resolves
  (below).

## Before the page

Run each report once in this conversation through `reports_run` with the exact request the page
will send, not through another report tool or with resolved dates. That run proves the request
works for this company, gives the real rows and columns to design around, and settles the empty
check: a report with no data gets no page unless the user asks for one.

## Build the page

Build it from `assets/live-report.html` as SKILL.md section 6 builds a snapshot. The JSON you
append is this config, and it holds no figures:

```json
{
  "server": "<the QuickBooks Labs connector name the Artifact tool shows>",
  "realm_id": "<realm_id from company_get_context>",
  "company": "<company_name>",
  "title": "<the Artifact title>",
  "sections": [{
    "heading": "<report title>",
    "period_label": "<the user's wording, such as Last month>",
    "request": <the reports_run input this conversation ran, without realm_id>,
    "period_rule": <only for a period no macro covers>,
    "chart": <only for a graph, as references/graphs.md describes>
  }],
  "notes": ["<data-quality notes>"]
}
```

- Publish with the Artifact tool, declaring only that connector and only `company_get_context`
  and `reports_run` (in Cowork, `capabilities.mcp.servers`). The page calls nothing else.
- `request` is the exact input this conversation ran: report, macro or fixed dates, basis,
  filters, grouping. The page adds the pinned `realm_id`, and never falls back to the viewer's
  default company.
- `period_rule` `{ "trailing_months": 12 }` runs from the first day of the month 11 months before
  `company_get_context`'s `server_date` through `server_date`; add `"through": "last_month_end"`
  to end on the last day of the prior month. Leave `period` out of `request` then. The page
  resolves the dates from `server_date` on every load, never from the viewer's clock, and shows
  them.
- Never put rows, totals, values or cells in the config, not even as a fallback; the page refuses
  to load one that does.
- For a relative period, the title uses the user's wording, such as "Last month", not the dates
  of this conversation's run.

The template does the rest on every load: it watches `company_get_context` and then `reports_run`,
reads each tool's JSON from the watch event's `result.payload`, refetches all watches from its
Refresh control through `mcp.invalidate`, and has no timer, because each refresh runs a
QuickBooks report. It checks the returned title, period, basis, `meta.no_data`,
`meta.page.next_offset` and the tie-out; labels the company, period with resolved dates, basis,
currency, `generated_at` and fetched time, including a cached replay's `result.cache.storedAt`;
and shows loading, no-data and error states that each name their code. It has no "What stands
out" section: put observations from this conversation's run in the chat summary, dated.

## Codes the page shows

| Code | Fix |
| --- | --- |
| `mcp_unavailable`, `not_granted`, `capability_disabled`, `capability_removed` | QuickBooks Labs under Settings > Connectors and artifact connectors on in Settings > Capabilities |
| `server_not_connected`, `needs_reauth` | Add or reconnect QuickBooks Labs under Settings > Connectors, then reload |
| `selection_required` | More than one QuickBooks Labs connector: choose one in the prompt |
| `not_in_manifest` | QuickBooks Labs is turned off for this page: allow it, then reload |
| `blocked_by_policy`, `approval_required` | The organization's policy blocks the report |
| `tool_error / delegation`, `tool_error / permission`, `realm_mismatch` | The viewer's QuickBooks Labs connection does not include this company |
| `tool_error / <other>` | QuickBooks Labs' message and next action, shown on the page |
| `config_invalid`, `config_unreadable`, `unexpected_result`, `server_date_missing`, `page_error` | A page bug (below) |

## Tell the user

In the chat summary, say that the Artifact:

- reruns the report whenever it opens, through each viewer's own QuickBooks Labs connector, so a
  viewer needs QuickBooks Labs connected with access to this company and approves access on first
  open;
- can be shared inside a Team or Enterprise organization; and
- shows no data to anyone who opens a public link from outside the organization, and on Pro and
  Max to anyone but the owner. Say this plainly, then that a snapshot is the way to share by
  public link.

Give the key figures from this conversation's run as of when they were fetched.

## When the page is not working

Diagnose from the page's source and the code it shows, not from the wording of its message. A
message is only what the page chose to print, so a page that shows no code, or shows one state for
every failure, cannot say whether the cause is a setting.

- **A page bug** is a page that shows no code, branches on message text, reads the event instead
  of `result.payload`, or shows a "shape" or "unexpected response" message, usually a page written
  by hand before these templates; or a template page showing a page-bug code. Rebuild the page
  from `assets/live-report.html` with the config above, not by patching its code, and republish it
  by passing the Artifact's existing `url` to the Artifact tool, so the link the user already has
  gets the new version. Then ask the user to reload and quote the code if it still fails. Name no
  setting until the page shows a code.
- **A settings or connection code** means the page is right: tell the user the one fix that
  code's row names.

Keep the page live while you diagnose. Offer a snapshot as an alternative, and build one only when
the user picks it.
