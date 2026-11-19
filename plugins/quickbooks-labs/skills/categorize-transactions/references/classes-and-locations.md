# Classes and locations

Read this before the first record call (section 4 step 3) when a step 1 read
(`bank_feed_list_transactions`) carries `class_location`.

- Propose only the ones `class_location` marks true.
- A `transfer` takes a location but no class; a `card_payment` and a `match` take neither.
- Take QuickBooks' own suggested `class` or `location` on a row whose category you take. Otherwise
  take the row's `dimension_history`: the one value its payee's posted purchases, bills and
  deposits of the six months before it all carry.
- A row in `suggested` takes its `dimension_history` on the server. A row you put in `input` carries
  only the `class_id` and `location_id` you send.
- A row with neither gets none, and so does a payee the read's summary says could not be read. No
  agreement is not a reason to guess: a wrong location still totals correctly, so nobody notices
  it later, while an unset one shows on the card for the user to set.
- Prefer `left_for_user` for a split whose lines would take different classes.
- Never put where a value came from in the row's `memo`: a memo posts to the client's books.

At section 4 step 7, add one line: where each proposed class or location came from, by payee
("Harbor Supply: Catering, from its last 6 months"), and how many rows would post with none, so the
user sees what goes in untagged before they say yes.
