# QuickBooks Labs

Bookkeeping workflows for small businesses in Claude, powered by QuickBooks Online through the
hosted QuickBooks Labs connector.

## What you get

**For a business owner**

A business owner starts with `/quickbooks-labs:onboard` to connect QuickBooks, see which bank and
card accounts already feed it, and link another. Onboarding then suggests
one next step from the state of the books: categorize transactions, reconcile an account, or a
business health report (Profit & Loss and Balance Sheet). After onboarding, the same jobs run on
their own:

- `/quickbooks-labs:categorize-transactions` to categorize new transactions.
- `/quickbooks-labs:reconcile` to match an account to its statement.
- `/quickbooks-labs:review-bank-feed` to open the bank feed.
- `/quickbooks-labs:switch-company` to choose a QuickBooks company.
- `/quickbooks-labs:connect-bank` to see connected banks and cards.
- `/quickbooks-labs:create-reports` for QuickBooks report Artifacts and charts, either live pages that rerun the report each time they open or snapshots that can refresh on a schedule.

## Quick start

1. Upgrading from ClaudeBooks? Remove the **ClaudeBooks** plugin in **Cowork → Customize → Plugins**
   first. QuickBooks Labs installs separately and does not replace it.
2. Upload the QuickBooks Labs `.plugin` file in **Cowork → Customize → Plugins** and enable **QuickBooks Labs**.
3. Start a new chat or Cowork task and run `/quickbooks-labs:onboard`. The skills load in a normal chat as well as in Cowork.
4. Sign in to QuickBooks from the inline **Connect** card.

See [SETUP.md](SETUP.md) for the full setup walkthrough.

## Skills

**For a business owner**

| Skill | Purpose |
| --- | --- |
| `onboard` | First-time setup: connect bank and card accounts, then suggest one next step from the state of the books (categorize, reconcile, or a live or snapshot health report), with an optional recurring bank-feed check |
| `categorize-transactions` | Automatically categorize an approved set of bank-feed transactions, posting proposals only after a yes |
| `review-bank-feed` | Open the bank feed MCP App (slash command only) |
| `switch-company` | Open the QuickBooks company picker (slash command only) |
| `connect-bank` | Open connected bank and card feeds, with Connect a bank (slash command only) |
| `reconcile` | Match a bank or credit-card account to its statement, from the statement figures through a finished session |
| `create-reports` | Build live or snapshot QuickBooks report Artifacts and graphs, with optional scheduled refreshes |

## Design principles

- **Write only after approval.** Receipts, bills, and categorization each show
  what will change and wait for explicit confirmation before changing QuickBooks.
- **Stay grounded in QuickBooks.** Reports and summaries use only values returned by the connector.
- **Connect QuickBooks.** The plugin declares only the QuickBooks Labs connector.
