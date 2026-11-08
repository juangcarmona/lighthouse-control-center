# Proposal

<!-- pdac-scope: none reason="Operational repository-rename verification documentation only; no application behavior or product requirements change." -->

## Why

Issue #121 reports that the existing repository and main checkout have already been renamed, while the roadmap and installation instructions still describe a future cutover. Maintainers need current guidance and an honest account of the continuity evidence still missing.

## What Changes

- Attribute the completed rename to the issue's supplied observations, rather than claiming a live check from this disposable workspace.
- Document safe linked-worktree repair and per-checkout verification, preserving branches and dirty/untracked work.
- Record name-dependent source references and the operator receipts needed for identity, direct Git access, open PR bases, required CI and old-name request reconciliation.
- Update the installation clone URL without changing its pinned commit or compatible configuration names.
- Keep missing operational evidence explicit; no remote administration, request replay or integration write is performed.

## Capabilities

### New Capabilities

None. This is operational documentation, not new system behavior.

### Modified Capabilities

None. Existing `delivery-verification` and `factory-overview` specifications were read; neither changes. The source inventory also contains `github-user-connection`, `identity-environments` and `owner-access`, whose authentication behavior is outside this work. CLI inventory was unavailable in the original worker; operator installation and strict specification validation subsequently passed. `skip_specs: true` records the absence of behavioral deltas.

## Impact

Changes are confined to this planning root, the rename roadmap, a continuity runbook and the installation runbook. ProductShape, architecture, generated integrations, frozen verification inputs, .NET names, application origin and identity registrations remain untouched. This change does not implement product behavior from CHG-LCC-EVOLUTION-001 or accept ADR-0010. No product artifact is altered or used to define a new behavior contract; #123, #124, #120 and #58 remain separate deliveries.

At planning time, operator repair and continuity receipts were unavailable to the disposable worker. The operator continuation now supplies current repair/GitHub observations. Full issue completion still lacks the pre-cutover baseline and applicable private integration/historical request reconciliation; those are explicitly outside this documentation increment and #121 remains open.
