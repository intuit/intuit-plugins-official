# Statement import

Read this before reading or importing a bank/card statement or transaction export, including a file attached in a later turn or a resumed import.

**Statement import.** A bank or card statement or a transaction export the user attaches after the
ask, PDF, CSV or Excel:

1. Count the source transaction records independently of the import chunks, then read every
   record: date, signed amount, description and check number exactly as printed. Quoted CSV
   line breaks are part of one record. Money out and card charges are negative. Keep a local
   row ledger with a source row number and an outcome for every record, including unreadable
   and zero-amount records. If the source count cannot be established (for example an unreadable
   PDF page), say which part could not be read and ask for a CSV; do not claim a complete import.
   No readable records: ask for a CSV and stop.
2. Pick the account. Call `accounts_search` for Bank and Credit Card accounts. Use the one whose
   name or last four digits match the file. With several possible matches, ask which one. With
   none, ask to create one named for the bank and last four digits, and create it with
   `accounts_create` (Bank for a bank statement, Credit Card for a card) only after a yes.
3. Preview in one or two sentences: the number of rows, the date range, money in and money out,
   and the account. End with "Should I import these <N> transactions into <account>?"
4. After a yes, sort by date and send chunks of at most 100 records with
   `bank_feed_transaction_import_start`. Preserve repeats, and never split a date across two
   calls; a date with more than 100 records may split only so that every group of records
   with the same amount and description (ignoring case and spacing) stays whole in one call,
   so order that date's records by group before chunking. Check numbers do not separate
   records, since a missing check matches any. A group of more than 100 records cannot be
   split here: keep its unsent records in the ledger as not sent and tell the user they have
   to be imported in QuickBooks itself. Follow the tool
   description for refused, busy and unconfirmed outcomes. A refused chunk sent nothing: fix
   it and resend the whole chunk, not only the at-most-20 listed failures. Name records that
   cannot be sent and keep them in not sent. A busy or unanswered chunk stays open in the ledger;
   do not skip to the next chunk or declare completion. After read-only import_check settles an
   unknown outcome, repeat that call unchanged unless include_already_in_feed was set: it leaves
   out the rows that landed. Replace that chunk's previous outcomes; never sum attempts or add
   history totals. Rows may land in For review or be posted/excluded by bank rules.
5. Reconcile the ledger against the independently counted source records before reporting:
   source rows = imported + already present + not added + not sent + unconfirmed.
   Use each chunk's numeric counters, never `failed.length`; that list is diagnostic and capped.
   After an unanswered attempt, the repeat's `left_out` covers the rows that predated the
   import, the rows the first `unconfirmed` result already confirmed as `imported`, and the
   rows that reached the feed since. Keep that first result's `left_out` as already present and
   its `imported` as imported across every retry, counting neither again; report the remaining
   increase within already present as rows found in the feed after the unanswered attempt, with
   attribution unknown, never as imported (a feed match shows presence, not which operation
   added the row). Without that first result, the whole increase is unknown. QuickBooks duplicate
   and error counts are diagnostic subsets, never extra terms. If only 1,001 of 1,200 source
   records were sent, account for the other 199 as not sent and continue the remaining work;
   never announce completion. Report the source count and every nonzero outcome with the reasons
   for records not added or not sent, and one next action for anything unresolved. Then follow
   onboarding's next-step offer; offer categorization only when rows were confirmed added.

A no to the import or to creating the account: one sentence that nothing was imported, then the
next-step offer.
