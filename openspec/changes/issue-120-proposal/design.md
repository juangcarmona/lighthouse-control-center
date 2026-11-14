---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation and source identities. This reconciles PR #153's documentation-only design against current source, retaining its release/security gates rather than treating the older design as application evidence.

`WorkspaceComposition.cs` validates settings, starts one web process and provisions pinned Keycloak only in Development. External mode provisions no provider. `start-workspace.mjs` requires an absolute private configuration outside the checkout, restores in locked mode, builds Release AppHost and executes that assembly. No new installation path is needed.

Unlike the original proposal baseline, `OwnerIdentity.cs` and `OwnerSessionVault.cs` now retain protected sessions and a separately bound GitHub grant. `ControlJournal.cs` retains SQLite intentions with persistent keys/marker and makes old preparations reconciliation-only. Current configuration requires separate session/key directories and optional paired journal/key directories. These observations supersede the old process-local-only/no-journal assumption, not #58's missing production acceptance.

## Goals / Non-Goals

**Goals:** a classified version/configuration inventory, named decision owners, version-specific custody outline, rollback boundaries and acceptance/receipt mapping in one canonical runbook, plus deterministic regression coverage of existing restart and independent configuration behavior.

**Non-Goals:** an installer/service manager, binary distribution, new auth/journal/storage implementation, provider administration, production security policy or live installation/rehearsal. No personal infrastructure, ambient `gh` or alternate authority path is introduced.

## Decisions

### 1. Extend the canonical source-install runbook

Keep the historical pin explicitly development-only and link development identity and #124 dogfooding. A future release needs a nominated accepted revision, or an independently selected artifact and checksum if distributed. Do not invent a binary route or replace the pin with an unaccepted feature head. Alternative: container installer/deployment platform; rejected because it duplicates composition and expands support scope.

### 2. Bind inventory and configuration to the inspected revision

Record checked-in pins separately from installed environment versions and supported-release claims. Current Aspire CLI/SDK/Hosting is 13.6.5, Lighthouse direct CLI 0.12.68, UI 0.2.1, OpenSpec 1.15.0, ProductShape 0.23.0, direct ArcShape 0.1.6 and Playwright 1.64.1. Preserve the Keycloak 26.8.1 image digest in composition; lockfiles own transitive resolution. Node >=22 and net10.0 are not exact patch versions. The operator/release owner must select and record the tested Linux/toolchain tuple. Alternative: calling package pins a supported release; rejected for lack of acceptance evidence.

Keep issuer/owner admission separate from GitHub App registration, installation and user consent. Document exact origin and callback formulas, bounded repository allowlist, private storage settings and explicit optional runtime absence. Existing runbooks mix historical read-observation wording with Issues/write and later action grants: reconcile permissions against the selected capability; never pre-grant administration, contents-write or dispatch. Alternative: installer-owned provider or ambient CLI/PAT fallback; rejected because it crosses authority boundaries.

### 3. Describe custody without choosing #58 policy

Inventory configuration/TLS references, session data/key pair, command journal/key-marker pair, binding identities and compatibility metadata. Record owner, process user, access mode, consistency, retention and restore order; production encryption, retention and recovery policy remain #58 decisions. Current private directories are separate and mode0700; files are private, with journal files mode0600. Never copy a running SQLite file alone or attach backups as evidence.

Stop the single application writer, capture consistent complete directory pairs including required WAL/marker files, record version/binding compatibility, restore while stopped under approved custody, and validate before access. Preserve original command/source IDs and irreversible transmission claims; reconcile uncertainty without resend, reset/delete bypass or replacement intention. Session restoration follows the accepted version's policy and online provider/source verification; migration from an in-memory version needs fresh login/linking. Missing keys or incompatible state stop recovery acceptance. Alternative: change key purposes during rebranding or recreate intentions; rejected because recoverability and original uncertainty would be lost.

### 4. Observe independent delivery; do not become execution authority

Observe an independently admitted workflow during an authorized application stop interval. Keep its original source run ID and outcome, or an explicit evidence gap after reconnect. Do not dispatch replacement work, cancel source work or restart the retired supervisor, including during rollback. Upgrade/rollback requires compatible artifacts, configuration, bindings and a protected backup; stop on incompatible state rather than overwrite newer data.

<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->

## Acceptance and evidence plan

The canonical runbook will contain R1–R9, preserving PR #153's coverage: install/version receipts; valid/invalid configuration; independent sign-in/source connection and partial/unadopted reads; protected restore; retained-command reconciliation; anonymous/denied/expiry/logout/revocation/outage boundaries; stopped-application independent delivery; compatible upgrade/rollback; independently reviewed credential-free receipt index. Each row needs prerequisites, expected result and safe receipt. All remain planned, not executed.

The issue contains six acceptance bullets; PR #153 expanded them into AC-1–AC-8. Preserve that mapping explicitly rather than invent eight issue bullets. The runbook owns detailed tables, not a new behavior specification.

No UI is changed; no new screenshot or visual publication approval is needed for this documentation increment. Later R3/R6 use safe post-callback account/repository/denial views, light/dark desktop/narrow keyboard/focus checks, and the existing owner-deferred physical-phone boundary. Never retain login/callback screens, HARs, traces, tokens, raw browser logs or private source content.

Run required policy commands and relevant Markdown/OpenSpec/citation checks through the managed command slot, recording terminal exit codes. The owner authorized additive regressions only in OwnerSessionsTests and WorkspaceOptionsTests; preserve all existing session, grant-custody, configuration and identity-denial assertions and other frozen verification inputs. The restart test compares persisted idle and absolute deadlines exactly and rejects access at the idle deadline. Both selected identity profiles load operator inputs without runtime registrations, checkouts or control-journal providers. Full host verification and separate `verify:identity:host` remain separate receipts; Docker-in-Docker is unsupported. Development-provider and source fixtures do not prove actual external identity or real App consent/revocation.

The owner's 2026-11-14 decision supersedes the separate-clean-machine requirement: their first startup in their own environment, including installation, authenticated source connection, restart and recovery, counts once performed and recorded. Keep it pending; neither these tests nor this documentation establish production approval, #58 acceptance, a released artifact or deployment.

## Risks / Trade-offs

- Historical pin mistaken for current source/support → separate revision columns and explicit non-acceptance labels.
- New persistent candidate mistaken for #58 approval → document actual paths but retain custody/security matrix gates.
- Conflicting historical session guidance → scope statements by version and link current access-continuity migration.
- Permission wording drift → require effective App/user capability review before real connection/rehearsal.
- Upstream gap discovered → retain failed receipt with its owner; no alternate engine or weakened verification.
- Missing evidence mistaken for inactivity/recovery → retain source times, IDs and uncertainty; no resend.

## Migration Plan

This increment changes documentation and additive regression assertions only. Rollback is a reviewed revert preserving historical evidence; there is no application data migration. Later Juan, as integration/security/release owner, records the selected candidate and environment and performs the first-startup rehearsal. Production custody/security acceptance remains #58 work. No current stage result authorizes release/deployment. #121/#123/#124 ownership is unchanged.

## Deferred dependency decisions

Accepted #100/#48 executable and actual-source receipts; conditional release form/checksum; exact Linux/toolchain baseline; #58 external identity/TLS, encryption/key custody, retention, backup consistency and restore/session matrix. Each is a later execution gate with Juan and the operator as responsible owners, not a guessed documentation default.

## Definition of Done

For this increment, the canonical runbook contains the inventory, configuration/custody decision register, R1–R9 and receipt/AC mapping; workspace documentation, strict OpenSpec and citation checks have completed receipts; developer accuracy/prose review is recorded. Independent exact-head checks, forge CI, integration and actual installed-runtime acceptance follow under their own authority. Documentation alone cannot close #120 or establish production approval.
