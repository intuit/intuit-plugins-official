# QuickBooks Labs Setup Guide

QuickBooks Labs is a skills plugin. It bundles no local server and no credentials: every tool comes
from a hosted MCP connector declared in the plugin's `.mcp.json`, and each connector runs its own
sign-in.

## Install the plugin

**Upgrading from ClaudeBooks?** QuickBooks Labs is the new name for ClaudeBooks, but it installs as
a separate plugin: it does not replace ClaudeBooks, and with both enabled Claude sees two copies
of every skill and tool. Before you install, open **Cowork → Customize → Plugins** and remove
**ClaudeBooks**.

1. Download the latest release,
   [`quickbooks-labs.plugin`](https://static.boon.intuit.com/quickbooks-labs/quickbooks-labs.plugin), or
   build it (`pnpm build:mcp-plugin` writes `claudebooks/dist/quickbooks-labs-<version>.plugin`).
2. In Claude Desktop, open **Cowork → Customize → Plugins**, upload the file, and enable
   **QuickBooks Labs**.
3. Start a **new** chat or Cowork task. The skills load in a normal chat as well as in Cowork. A
   conversation that is already open keeps the skill list it started with.
**For a business owner**

4. Type `/` and confirm these commands are listed:

   - `/quickbooks-labs:onboard`
   - `/quickbooks-labs:configure`
      - `/quickbooks-labs:categorize-transactions`
   - `/quickbooks-labs:review-bank-feed`
   - `/quickbooks-labs:switch-company`
   - `/quickbooks-labs:connect-bank`
   - `/quickbooks-labs:reconcile`
   - `/quickbooks-labs:create-reports`

If they are missing, or `/claudebooks:` skills are still listed, remove the installed QuickBooks Labs
plugin and any ClaudeBooks plugin, upload the latest file, restart Claude Desktop, and open another
new chat. Claude Desktop caches plugins by version, so uploading a file with the same version over an
installed one keeps the old skills.

The guided workflows come only with the plugin. Connecting the QuickBooks Labs connector on its own
gives Claude the QuickBooks tools but none of these skills.

**Connect QuickBooks once.** The plugin page lists its own QuickBooks Labs connector, and that row
reads **Not added** until you add it there, even when QuickBooks Labs is already connected under
**Settings → Connectors**. That row is a second connection to the same QuickBooks service. With
two connected, Claude sees every QuickBooks tool twice and may mix the two when it picks a company.
If QuickBooks Labs, or the older ClaudeBooks connector, is already connected, leave the plugin row
**Not added**; the plugin still supplies the skills. Add the plugin's connector only when no
QuickBooks Labs connector is connected yet.

The skills are tested on Sonnet. On Haiku, Claude may skip the steps that load another skill or a
skill's reference files, so choose Sonnet for onboarding.

## Connect your services

**For a business owner**

Run `/quickbooks-labs:onboard`. After QuickBooks is connected, it shows a connection status card.
The card lists the bank and card accounts that already feed QuickBooks. With none connected,
that list is omitted and the card explains why to connect a bank. The connect button is Connect Securely. The link itself happens in
QuickBooks in your browser.
Onboarding then offers one next step: categorize, reconcile, or a health report. To connect
without onboarding, sign in from the Connectors panel, or with `/mcp` in Claude Code.

| Connector | `.mcp.json` server | Required | Used for |
| --- | --- | --- | --- |
| QuickBooks | `quickbooks-labs` | Yes | Company, accounts, transactions, bank feeds, imports, and reports |

## Considerations

**Declared connectors**

The plugin declares only the QuickBooks Labs connector. Connect any other service separately in
Claude if you want it available; QuickBooks Labs skills do not depend on it.

**Live report Artifacts**

`/quickbooks-labs:create-reports` can build a live Artifact that reruns its report each time someone
opens it. The published page can call only connectors on the viewer's claude.ai account, not the
plugin's `.mcp.json` servers, so live reports need:

- the hosted QuickBooks Labs connector added under **Settings → Connectors** on claude.ai, for the
  creator and for each viewer; and
- on Team and Enterprise, an org Owner turning on **Enable artifact connectors** under
  **Settings → Capabilities**; and
- **AI-powered artifacts** turned on under **Settings → Capabilities → Visuals**.

Without all three, the skill builds a snapshot and says what would make it live. Live Artifacts can be
shared inside a Team or Enterprise organization; viewers who open a public link from outside the
organization see no data, so share snapshots by public link.

**QuickBooks sign-in**

The `quickbooks-labs` connector ships Intuit's pre-registered OAuth client id, so signing in goes
straight to the Intuit consent screen instead of registering a new client on each install. No
client secret is bundled — it is a public client and uses PKCE.
