# Detail reports

Read before running a detail report, interpreting any paged or truncated result, drilling from
a P&L account, or calculating from detail, including initial requests and accepted follow-ups.

## Complete a detail report

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
- Request each next offset once and check that the combined Data rows with `cell_ids` number
  the sum of the pages'. Never deduplicate transaction rows by id, account or amount: legitimate
  split postings can share them. Only after every page is complete, drop `meta.page` and
  `meta.truncated` and add a note naming the pages combined. If offsets repeat or a check fails,
  show the partial result instead.

## Drill from a P&L account

### Choose the account and detail report

- Reuse the P&L's company, resolved period, basis, currency and other filters. If they are not
  known, establish them as in SKILL.md before running the report.
- Use the requested account row's `id` from the P&L, never its label as an id. For several
  accounts (such as domestic and international airfare), collect their returned ids. If the
  P&L lacks ids, use `reports_run` with `report: "AccountList"`, `period: {}` to resolve them;
  clarify ambiguous account names. For a parent total, include its relevant sub-account ids
  explicitly; do not assume selecting the parent includes them on every report source.
- Run `reports_run` with `report: "ProfitAndLossDetail"` and
  `filters: { "account_ids": ["<returned account id>"] }`. `GeneralLedger` is another route
  when postings and running balances are wanted. Use `reports_list` to check supported
  filters, columns and pagination before choosing options.
- Example shape: `{ "realm_id": "<company realm>", "report": "ProfitAndLossDetail",
  "period": { "start": "2026-08-01", "end": "2026-08-31" }, "basis": "Accrual",
  "filters": { "account_ids": ["<airfare id>"] } }`. Reuse the user's actual scope.
- Keep each detail row's transaction type and id, with its date and description, in the working
  data. The id is the row's `cell_ids` entry for the transaction-type column: the column whose
  `col_key` is `txn_type` (its `key` is usually `Transaction Type`); that column's `cells` value
  is the type. An account row's `id` and the ids on the name or split columns are not
  transaction ids. Never infer an id from a displayed document number.

### Calculate only what the detail supports

- Follow the pagination and truncation rules above before calculating a complete total.
  If the detail cannot be completed, label calculations partial and state the scope; never
  present a first page or a cut section as the whole account.
- Identify amount and quantity columns from the returned column descriptors. Calculate from
  numeric `values`, never formatted `cells`. Preserve signs and nulls; a missing value is not
  zero. Do not sum running balances, Beginning Balance rows, Header rows, Summary rows or
  `totals` into the postings. Do not add a Total column to the split columns it already totals.
- Sum the selected accounts' transaction posting amounts once each, including negative
  refunds or credits. Keep legitimate splits: the same transaction can post to several
  accounts. Reconcile to the corresponding P&L account totals on the same scope and basis;
  report a difference rather than inventing a balancing row.
- Count transactions once across all selected accounts. The transaction count is the number of
  distinct `(transaction type, transaction id)` pairs over every included row; the posting count
  is the number of rows. Never add per-account counts to get a combined count: a transaction
  that posts to two selected accounts is in both accounts' counts but once in the total, so the
  total can be smaller than their sum. When the two counts differ, show both with their units.
  Missing ids prevent a reliable distinct count: say so, and never present rows as transactions.
- In a summary by account, the combined row is not the column's sum: its transaction count is
  the distinct count over all rows, and its average divides the combined total by that count.
  For example, Bill 7 posts 400 to Fuel and 100 to Tolls, and Check 9 posts 50 to Tolls: Fuel
  has 1 transaction, Tolls 2, and the combined row 2 transactions (3 postings), averaging 275.
- Quantity is available only when the returned detail actually supplies it for the intended
  scope. Never substitute posting count or transaction count for quantity. If quantities are
  absent or incomplete, say quantity and average cost per unit are unavailable. With complete
  comparable quantities, average cost per unit is sum(amount) / sum(quantity), not an average
  of row averages; do not divide by zero or mix units/currencies. An average amount per
  transaction is a different metric: label it explicitly, and divide the net total by the
  distinct transaction count across all selected accounts, never by the posting count.
- Put derived metrics and their definitions in the snapshot Artifact's `observations`; keep
  report rows unchanged and limitations in `notes`. Do not embed creation-time aggregates in
  a live page as though they refresh; use only metrics its renderer actually recomputes.

This drill is read-only. Retain transaction ids for a later edit request, but this skill does
not call transaction write tools or change the books.
