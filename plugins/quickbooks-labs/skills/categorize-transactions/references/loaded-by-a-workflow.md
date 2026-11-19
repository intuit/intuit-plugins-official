# When another workflow loads this skill

Read this first when a workflow such as `/onboard` loads this skill by name (the Skill tool's
`args`, or the caller's instructions). It holds the caller's overrides and the hand-back the caller
reads.

`/onboard` loads this skill by name for its categorize job. When a workflow loads it:

- Caller overrides win, from the Skill tool's `args` (`entry: "connected"`, `realm_id`, `accounts`
  from its latest feed read, which replace the section 2 call) or the caller's instructions. Overrides
  can skip or narrow steps, never the approval rule for posting.
- A yes to the caller's offer starts section 3 for the accounts the offer named, else the `accounts`
  passed. The run card and posting yes still happen here. Skip the completion response's continue
  question: report `remaining` instead. No reports, scheduling or rule offers after a correction.
- Instead of the completion response or next steps of your own, go back to the caller's next step
  in the same reply. Do not write out the hand-back or say you are handing back.
- The hand-back the caller reads:
  - `categorization`: unavailable, proposed but not posted, or per account the posted, failed and
    unconfirmed counts from the run card after the last posting call;
  - `left_for_user` and `unconfirmed`: rows left Pending with no proposal, and rows whose posting
    QuickBooks never confirmed;
  - `remaining`: Pending rows of those accounts no run took (past the 1,000 one run takes), so the
    caller can offer to continue; and
  - `next_action`: one step for the user when a run did not finish.
