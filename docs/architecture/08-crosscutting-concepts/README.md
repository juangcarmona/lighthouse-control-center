---
title: Cross-cutting concepts
arc42-section: "08"
description: Concepts and rules that affect multiple building blocks.
---

# 08. Evidence, authority and failures

Observations retain source identity, revision, time and collection scope. Missing evidence is unknown, never healthy or delivered. Repository policies own authorization and gates. A future SoFa control records the user action in GitHub and does not grant additional permission. Runtime progress metadata excludes secrets and transcripts. A source failure affects the verification claim, not an independent execution.

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

ASP.NET cookie/OIDC middleware validates code/S256 transactions, issuer, audience, state and nonce. Owner admission additionally requires the exact configured issuer/subject, verified password assurance in development (external mode retains MFA) and fresh authentication time. The browser cookie protects an opaque server reference; provider/source tokens remain in bounded process-memory records. Process restart invalidates all local authority and requires fresh linking. Source request initiation verifies the live session, connection and generation under the same lock as disconnect/account replacement; invalidation also cancels pending source I/O. The shared transport requires that guard on credential-bearing requests.

The authorized development policy uses fifteen-minute idle and four-hour original-authentication limits, with five-minute online provider revalidation. Polling cannot renew idle time; explicit validated navigation/interaction can, within the absolute cap. Reference rotation and provider refresh are atomic with respect to the stored credentials and cannot move the original limits. These are development implementation choices under the reviewed proposal, not production policy constants.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

Identity-provider admission and GitHub acting-account authority are separate. The source adapter verifies numeric user identity and intersects repository/user permission with app installation grants before protected reads or cache reuse. Connection generation and session ownership scope observations. Incomplete permission enumeration is unavailable authority, never a sufficient grant. Source tokens have no operator CLI or installation-token fallback.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

CSRF protects local authentication/connection POSTs. Exact HTTPS host validation, no-store responses and restrictive CSP apply to the application boundary. CSP permits only self and the configured authentication redirect origins for form navigation. Hosting/authentication diagnostics do not log callback queries or credentials; provider-test artifacts contain safe post-callback screenshots and summary receipts rather than HARs or browser call logs. See the [identity implementation](../../../src/SoFa.Modules.Workspace/Identity/) and [boundary tests](../../../tests/SoFa.Web.Tests/OwnerBoundaryTests.cs).

## Proposed observation semantics

Store source identity/revision, collected time, source time when available, pagination coverage and errors independently. Availability, completeness, freshness and applicability are separate dimensions. Cached issue context can remain readable with a stale marker; it cannot authorize a write. Rate limiting uses bounded backoff and exposes retry state. Start with pull-based refresh while visible and explicit refresh; webhooks are not a first-delivery requirement. Restrict artifact size/type, sanitize rendered Markdown and never treat source content as instructions or executable HTML.

## Proposed durability and secrets

[ADR-0008](../09-architecture-decisions/0008-source-correlated-issue-commands.md) owns request persistence, duplicates and uncertain responses. Application data can be backed up; no restored receipt automatically resubmits work. Tokens are protected server-side and excluded from logs/evidence. Production secret and recovery procedures belong to infrastructure under ADR-0007. A journal is not an execution queue.

## Proposed health evidence

A signal definition identifies purpose, source adapter, calculation/version, unit, window, coverage, applicability and baseline. The detail view exposes contributing records. Candidate signals are source workflow duration/outcome for investigation; proposal/PR/check state for delivery decisions; installed-versus-selected baseline for maintenance; measured duration/tokens/storage for resource decisions. Missing tokens do not imply zero consumption, a run duration is not user attention time and a merged PR is not a production deployment. Additional metrics require a source definition before UI claims.

## Implemented issue-content boundary

The issue reader has no global issue cache. Evidence consumes one validated current-connection/generation page once within 30 seconds, rechecking authority without refetching conversation. Every credential-bearing source read and signed-asset request initiates under the same atomic session gate as disconnect/replacement; invalidation cancels prior connection I/O. Its browser view stops at ten conversation pages / 1,000 comments and eight MiB of retained text; source and response reads have separate two-MiB bounds. ZIP handling permits only bounded JSON/text members, rejects unsafe/duplicate paths, limits compressed/expanded/member sizes and never extracts source artifacts. User credentials stay on fixed GitHub API requests and are absent from signed asset downloads and the offline shared validator. Validator input/output and process lifetime are bounded; missing validation stays unavailable.

The Markdown subset builds DOM text nodes and explicit HTTPS links. Raw HTML, scripts, forms and images remain inert. Original Markdown remains readable. The browser preserves stale source timestamps after temporary failure and erases prior context, including the title, after authority loss. A public non-authority connection identifier and generation bind pagination snapshots; account replacement or reconnection cannot append new pages to an earlier connection. Known loss of Actions access clears old execution evidence even when conversation refresh fails. These implemented mechanics do not supply command admission or the proposed durable journal.

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->

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
