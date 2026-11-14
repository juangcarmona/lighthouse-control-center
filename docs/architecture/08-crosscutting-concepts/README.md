---
title: Cross-cutting concepts
arc42-section: "08"
description: Concepts and rules that affect multiple building blocks.
---

# 08. Evidence, authority and failures

The #48 source-control bridge uses a fixed helper with a cleared environment and no source credentials. It bounds LF-delimited UTF-8 frames to 4 MiB, serial callbacks to 64, each complete SDK operation to 20 seconds, Node heap to 128 MiB and active children to two. Fixed source-read resources and an exact prepared effect are reachable through the guarded HTTP transport; a changed account, repository identity or App grant discards the observation. Cancellation kills and drains the owned child. This is a protocol/credential boundary, not an operating-system network sandbox. The published application bundles the selected public SDK; a publish check runs outside any checkout dependency ancestry. See [bridge tests](../../../tests/SoFa.Web.Tests/SourceControlTests.cs) and the [publish check](../../../scripts/check-workspace-publish.mjs). The public SDK owns eligibility, intent and source reconciliation; the parent owns authenticated HTTP and durable claims.

Observations retain source identity, revision, time and collection scope. Missing evidence is unknown, never healthy or delivered. Repository policies own authorization and gates. An explicit Lighthouse Control Center control records the user action in GitHub and does not grant additional permission. Runtime progress metadata excludes secrets and transcripts. A source failure affects the verification claim, not an independent execution.

<!-- pdac:cite id="BR-WORK-AUTHORIZATION" digest="sha256:157f762cba7de8c5e40b42a8dfaa83c58e09032ddbebba67065a439ad1e487ce" -->

See [ADR-0006](../09-architecture-decisions/0006-observe-repository-owned-workflows.md) for the accepted boundary and superseded design.

## Proposed state and authority model

| Fact | Example | Authority |
| --- | --- | --- |
| Issue state | Open/closed | GitHub issue |
| Lifecycle stage and result | Refine passed; Propose blocked | Lighthouse source result |
| Requested command | Propose requested | Attributed user intent and receipt |
| Source execution | Queued, running, completed/failed | GitHub run and attempt |
| Active work/reservation | Reserved by a run, released or uncertain | Repository/runtime source |
| Human wait | Information, review, approval | Source request and applicable policy |

These facts coexist and are not flattened into one progress label. A successfully completed workflow can still carry a blocked stage result. A waiting-review label does not prove an active reservation or accepted proposal.

## Implemented identity and source-authority mechanisms

ASP.NET cookie/OIDC middleware validates code/S256 transactions, issuer, audience, state and nonce. Owner admission additionally requires the exact configured issuer/subject, verified password assurance in development (external mode retains MFA) and fresh authentication time. The browser cookie protects an opaque server reference; provider/source tokens stay server-side. The access-continuity candidate uses encrypted bounded local session records and a separately retained owner-bound source grant under [Proposed ADR-0011](../09-architecture-decisions/0011-preserve-verified-access.md). Restored records require online provider/source revalidation; persisted credentials do not establish authority by themselves. Source request initiation verifies the live session, connection and generation under the same lock as disconnect/account replacement; invalidation also cancels pending source I/O. The shared transport requires that guard on credential-bearing requests.

The access-continuity development candidate uses two-hour idle and twelve-hour original-authentication limits, with five-minute online provider revalidation. Polling cannot renew idle time; explicit validated navigation/interaction can, within the absolute cap. Reference rotation and provider refresh are atomic with respect to the stored credentials and cannot move the original limits. These are development implementation choices under the reviewed proposal, not production policy constants.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

Identity-provider admission and GitHub acting-account authority are separate. The source adapter verifies numeric user identity and intersects repository/user permission with app installation grants before protected reads or cache reuse. Connection generation and session ownership scope observations. Incomplete permission enumeration is unavailable authority, never a sufficient grant. Source tokens have no operator CLI or installation-token fallback.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

CSRF protects authentication, connection and explicit control POSTs. Exact HTTPS host validation, no-store responses and restrictive CSP apply to the application boundary. CSP permits only self and the configured authentication redirect origins for form navigation. Hosting/authentication diagnostics do not log callback queries or credentials; provider-test artifacts contain safe post-callback screenshots and summary receipts rather than HARs or browser call logs. See the [identity implementation](../../../src/SoFa.Modules.Workspace/Identity/) and [boundary tests](../../../tests/SoFa.Web.Tests/OwnerBoundaryTests.cs).

## Proposed observation semantics

Store source identity/revision, collected time, source time when available, pagination coverage and errors independently. Availability, completeness, freshness and applicability are separate dimensions. Cached issue context can remain readable with a stale marker; it cannot authorize a write. Rate limiting uses bounded backoff and exposes retry state. Start with pull-based refresh while visible and explicit refresh; webhooks are not a first-delivery requirement. Restrict artifact size/type, sanitize rendered Markdown and never treat source content as instructions or executable HTML.

## Implemented command durability and secrets

[ADR-0008](../09-architecture-decisions/0008-source-correlated-issue-commands.md) owns request persistence, duplicates and uncertain responses. The optional single-instance Linux journal uses SQLite WAL with full synchronization, 10,000 retained intent/tombstone rows and a 50 MiB logical database cap. Its separate persistent ASP.NET Data Protection key ring encrypts preparations and source receipts; authentication uses the separate credential store/key ring described above, with separate protector purposes and custody. Both operator-provisioned directories must be private, separately located and outside the checkout. Directory/file descriptors reject symlinks, unsafe owners/modes and replaced database files; key loss/mutation, incompatible schema or storage failure blocks actions while reads remain available.

A transaction commits the unique immutable claim before the SDK can ask for its exact single POST. Existing claims only reconcile. Restart or restoration makes any prior unclaimed preparation uncertain, so a backup cannot re-enable sending. An unresolved intent blocks replacement for that owner, numeric actor/repository/issue scope. Terminal receipts preserve tombstones; the UI recovers the most recent intent for the currently verified scope. No automatic pruning or resend occurs. The database cap does not bound WAL, filesystem or key-ring disk usage. See the [journal](../../../src/SoFa.Modules.Workspace/Source/ControlJournal.cs), [command handlers](../../../src/SoFa.Modules.Workspace/Source/IssueControlCommands.cs) and [recovery runbook](../../runbooks/issue-controls.md). Production custody/recovery remains infrastructure work under ADR-0007. A journal is not an execution queue.

## Proposed health evidence

A signal definition identifies purpose, source adapter, calculation/version, unit, window, coverage, applicability and baseline. The detail view exposes contributing records. Candidate signals are source workflow duration/outcome for investigation; proposal/PR/check state for delivery decisions; installed-versus-selected baseline for maintenance; measured duration/tokens/storage for resource decisions. Missing tokens do not imply zero consumption, a run duration is not user attention time and a merged PR is not a production deployment. Additional metrics require a source definition before UI claims.

## Implemented issue-content boundary

The issue reader has no global issue cache. Evidence consumes one validated current-connection/generation page once within 30 seconds, rechecking authority without refetching conversation. Every credential-bearing source read and signed-asset request initiates under the same atomic session gate as disconnect/replacement; invalidation cancels prior connection I/O. Its browser view stops at ten conversation pages / 1,000 comments and eight MiB of retained text; source and response reads have separate two-MiB bounds. ZIP handling permits only bounded JSON/text members, rejects unsafe/duplicate paths, limits compressed/expanded/member sizes and never extracts source artifacts. User credentials stay on fixed GitHub API requests and are absent from signed asset downloads and the offline shared validator. Validator input/output and process lifetime are bounded; missing validation stays unavailable.

The Markdown subset builds DOM text nodes and explicit HTTPS links. Raw HTML, scripts, forms and images remain inert. Original Markdown remains readable. The browser preserves stale source timestamps after temporary failure and erases prior context, including the title, after authority loss. A public non-authority connection identifier and generation bind pagination snapshots; account replacement or reconnection cannot append new pages to an earlier connection. Known loss of Actions access clears old execution evidence even when conversation refresh fails. These read mechanisms do not grant command admission; the source-control SDK and protected journal described above handle explicit actions separately.

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->

## Implemented local observation boundary

Host request initiation shares the owner-session lock with removal, and the owned helper tree is cancelled on session removal or its admitted idle/absolute deadline. Cookie rotation retains that lifetime. Fixed metadata reads use pinned no-follow regular-file/directory handles; selected committed objects pass through a disposable bare view with pinned storage descriptors, isolated Git configuration/protocols and hash validation. No source configuration, hooks or credential helper executes. Global nonqueuing read slots and bounded process/byte lifetimes constrain observations independently from factory worker capacity. See the [query boundary](../../../src/SoFa.Modules.Workspace/Runtime/GetHostInventoryHandler.cs) and [helper](../../../src/workspace-tools/runtime-inventory.mjs).

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

Repository-runner authority intersects verified user administration with the expected App installation, immutable repository identity and current connection generation. Permission denial and unavailable authority remain distinct. The browser clears affected GitHub scope before unrelated reads finish, keeps host scope separate and retains original times only for explicitly stale observations. A local registration is metadata, GitHub runner status is a source fact, and committed versions are revision evidence; none establishes process health, deployed version or available execution capacity.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Proposed Control Center mechanisms

### Independent authority checks

Authentication admits a configured application identity. Source operations additionally require actual GitHub user authority and Lighthouse eligibility/admission. Provider operations additionally require an explicit provider/resource/action grant and provider enforcement. None implies the other. Team access must isolate caches, observations, intentions and receipts by admitted identity and source/provider scope, including after logout, connection replacement and permission loss. The source SDK v1 owner-only restriction stays explicit until upstream extends it.

### Stable evidence and history

Keep immutable numeric/node repository and issue IDs with observed names/URLs as aliases. Preserve workflow run, attempt, job, worker, runner, runtime/session, request and provider-operation IDs independently; provider/entity IDs include their scope. Repository rename changes an alias, not historical mission identity. Store source time separately from observed and calculated time, and schema/calculation version separately from software package version.

Availability, freshness, completeness, applicability, outcome and verification are independent fields. Unavailable is not zero; pending/blocked/failed is not completed; a completed result may still lack independent verification. Reconciliation does not erase failed attempts or manufacture a total ordering across telemetry streams. Retention policies and explicit gaps accompany historical calculations. Existing public telemetry excludes prompt/source/credential content; LCC does not expand that collection by default.

### Audited infrastructure effects

Reuse durable storage techniques only after reviewing repository-versus-provider key spaces and restore behavior. An operation intent carries actor, grant, capability version, target, payload digest, expected state and confirmation. Audit records denied as well as sent actions with sanitized explanations. No secret enters an audit record. Restore cannot make a past uncertain intention eligible to send. Provider acknowledgements and later actual-state evidence remain separate; independent verification is a recorded check, not a synonym for provider completion.

### Measurement provenance

The [research catalog](../../roadmap/lighthouse-control-center-research.md) proposes metric inputs and limitations. LCC implements explainable analytical projections; shared definitions and evidence contracts stay with Lighthouse. Each result retains definition/version, unit, window, numerator/denominator, source records/revisions, timestamps, coverage and limitations. Ratios from incompatible cohorts are not compared. Deployment and cost claims require their actual producers.

## Browser presentation and return navigation

The shared [workspace presentation module](../../../src/web/public/workspace-ui.js) owns appearance persistence, navigation icons and the canonical favicon. The [tab-scoped read cache](../../../src/web/public/read-projection-cache.js) restores bounded display projections for ten minutes only after current owner/account and repository permission verification. Source observations retain their original timestamps and restored rows are marked stale. Authority loss removes cached display data; cached evidence and action eligibility never authorize a mutation. Source actions retain the fresh server-side checks described above. The product-owned [visual contract](../../design/control-center.md) governs composition and interaction acceptance.
