---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation. ADR-0006 keeps execution in repository CI. Workspace already checks connected-user repository/App authority and gates source I/O on live connection generation. GitHubArtifacts.cs handles lifecycle JSON, with 2 MiB compressed, 4 MiB expanded, 100-member and 1 MiB selected-JSON limits; it is not a coverage adapter. The building-block and crosscutting views describe Health/history as proposed. Existing issue evidence and discovery candidates must not acquire coverage semantics accidentally.

## Goals / Non-Goals

**Goals:** a small producer plus a dedicated read adapter, normalized exact-attempt history and an explainable #54 handoff, with bounded costs and authorization before reuse.

**Non-Goals:** a generic telemetry platform, public coverage badge, whole-repository claims, copied scorecard, test execution in the web process, workflow dispatch, changed required CI success criteria or additional quality facets.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

## Decisions

All choices below are candidate design, not accepted architecture. The two review prerequisites at the end prevent completion.

### 1. Start with a deliberately narrow producer

Propose `observation-collector-lines-v1`: include exactly `src/observation/github.mjs`; no additional files or exclusion globs. Display the label **Observation collector only — not application or repository coverage**. Tests are `tests/observation.test.mjs`, which already exercise the collector using controlled source responses and a fake CLI. Measuring the collector does not authorize using its `gh` path in the web consumer.

Propose exact c8 10.1.3 with a lockfile and Node 24.11.0 for this producer, emitting its `lines.covered` and `lines.total` summary as executable-line units. Include unexecuted in-scope code using c8's all-files mode, exact include path and no coverage check/threshold. Tool/runtime semantics are part of definition v1 and change the comparison key. These pins require dependency/build qualification, not an assertion that tooling was run here.

Alternatives: .NET Workspace line coverage would measure the main consumer but adds instrumentation to the broader test/runtime lanes. Whole-repository aggregation obscures unlike languages and incomplete instrumentation. The small existing Node scope is cheaper to qualify and makes no broader quality claim; the repository engineer must explicitly review its usefulness before adopting it.

Use a separate observational workflow/job triggered by pushes to `main`, with no required-check registration, no PR/fork execution and no dependence on Control Center. Its proposed path is `.github/workflows/coverage-evidence.yml`. Collection/test failures remain visible in that workflow and produce a failed observation if upload remains possible; an unavailable upload remains missing evidence. Do not turn test failure into complete counts or alter the required `verify` job. Bound producer execution to 10 minutes. Request 30-day retention for this new artifact only, subject to actual GitHub policy; do not modify retention of any existing evidence.

### 2. Use a dedicated versioned report and verified outer metadata

Proposed logical contract `coverage-evidence/v1`, definition `observation-collector-lines/v1`, facet `coverage`, kind `executable-lines`. Payload fields: schemaVersion, definitionVersion, repositoryId, ref, commit, workflowPath, workflowId, runId, runAttempt, facet, kind, tool name/version, runtime version, scope id/version/includes/excludes, unit, status, covered, total, generatedAt and safe limitation codes. For failed/incomplete reports counts are absent rather than zero. IDs/attempts are exact positive integers; counts are exact nonnegative integers no larger than 9007199254740991; decimal fractions cannot round into valid integers. Timestamps are UTC and checked against source/run chronology; inconsistent timing remains invalid.

The producer cannot put its final upload artifact ID into bytes uploaded before that ID exists. The consumer therefore joins authenticated artifact ID, repository-bound artifact/run links, created/expiry metadata, observedAt and lastSourceVerifiedAt into the accepted outer observation. A payload artifact URL is never a fetch destination or authority. Keep source expiry unknown when the source does not disclose it. Preserve generation, source observation and later calculation times separately. Percentage is `100 * covered / total`, displayed to one decimal without changing exact stored counts; total zero has no percentage.

Upstream shared semantics must be reused where available. This checkout's lifecycle report validator/member allowlist is not evidence of an upstream coverage contract, and this engine cannot establish upstream availability. A repository-specific adapter is only a candidate fallback, not an approved new shared authority. Selecting reuse versus fallback is a current review prerequisite.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->

### 3. Keep authenticated attribution separate from JSON validity

The .NET Workspace adapter owns all authenticated source reads and rechecks numeric repository identity, acting-user authority, effective Actions:read and live generation before downloads, stored-data reuse and response publication. No operator credential, public-download or installation-token fallback. Preserve the fixed GitHub API and credential-free, restricted HTTPS asset-download boundary. Current permission failure hides retained results rather than serving them stale. Temporary collection failure may retain old observations only after current authority is established.

Configure one reviewed producer repository/workflow/ref, initially the authorized repository and `refs/heads/main`; resolve and retain numeric repository/workflow IDs from authenticated source. Artifact name is a discovery hint, never trust. Verify commit and artifact owning run independently of report claims. A retry's artifact-to-attempt association must also be authoritative: current run_attempt and a report field do not prove an older artifact's attempt. Until that association is established under a reviewed source contract, classify the report untrusted.

Alternatives requiring a review decision: consume a suitable upstream producer association; or use a digest-bound, verified producer attestation with an explicit issuer, workflow/ref, repository, commit and exact invocation/attempt policy. A signature without that policy is insufficient. The latter may require producer permission changes and an additional verifier, so it is not silently selected here. Timestamp heuristics and attempt-bearing names are rejected. This is a material unresolved design prerequisite, not an implementation detail to guess later.

### 4. Bound collection independently of repository activity

Proposed coverage-specific ceilings tighten rather than automatically inherit lifecycle archive limits:

| Resource | Candidate hard limit |
| --- | --- |
| Compressed artifact | 256 KiB, inventory/header check and streaming cap |
| Expanded archive / selected member | 256 KiB each, actual streamed bytes counted |
| Members | Exactly one regular root member, `coverage.json` |
| JSON | Depth 8; 256 properties/tokens per container; 2,048 total tokens; 1,024 UTF-8 bytes per string; duplicate properties and unknown v1 fields rejected |
| Metadata response | 2 MiB each; all source bytes count toward request budget |
| Run discovery | 2 pages of 10 runs for the configured workflow/ref |
| Artifact inventory | 1 page of 100 per inspected run; reaching a nonterminal page means incomplete |
| Report downloads | 10 artifacts per refresh, never automatic drain |
| Whole refresh | 35 seconds including authority, metadata, attribution verification and downloads; at most 10 MiB total network bytes |
| Concurrency | One refresh per current account/repository; at most two coverage refreshes process-wide, fail busy rather than queue |
| Returned history | 100 observations per bounded response, no automatic next-page fetch |
| Retained history | At most 1,000 observations or 90 days per owner/actor/repository, whichever first |
| Local observation storage | 8 MiB logical payload per owner/actor/repository; 50 MiB total logical payload |

Stop at the first exhausted budget, cancel pending I/O and expose incomplete coverage with the last completed source boundary. Permission enumeration retains its existing independent page bounds but shares the 35-second/10-MiB request cap; exhaustion is unavailable authority, never permission success. Verification network reads must fit these same budgets; a selected trust mechanism that cannot fit requires revision, not an exception. No unbounded pagination, automatic retry or signed-URL logging.

Parse archives without disk extraction. Reject traversal, absolute/backslash paths, symlinks, encryption, duplicates, directories, nested archives, unknown member types and malformed/truncated content before accepting JSON. Error messages use bounded reason codes, not raw source bodies or exception URLs. Add coverage as a dedicated parsing profile; do not expand the lifecycle member allowlist indiscriminately.

### 5. Preserve observations rather than replace a latest value

Propose a separate private local SQLite observation store inside the existing Workspace module; do not reuse the command journal or credential records. Review its custody and schema before implementation. Partition by admitted owner, stable numeric acting account and numeric repository. Connection generation gates active reads but is not a historical sample identity. A reconnect can expose prior observations only after current account/repository/Actions authority is verified. Store normalized fields and safe diagnostics only, not original ZIPs, raw reports or signed URLs.

Artifact identity is `(repositoryId, artifactId)`; logical identity is `(repositoryId, workflowId, runId, attempt, facet, scopeVersion, definitionVersion)`. Re-reading identical normalized content is an idempotent update of verification metadata, not a new sample. Divergent content or another artifact claiming the same logical identity records an explicit conflict and cannot silently supersede the original. Attempts are separate records; a failed attempt remains beside a successful retry. Order this single producer stream by source run creation time, then run ID, then exact attempt; collection order does not rewrite source order. Unavailable observations whose exact attempt cannot be verified stay unassociated, not assigned a guessed attempt.

Comparison key requires exact equality of scope id/version and canonical include/exclude set, kind/unit, tool/version, runtime version and definition version. No migration equivalence is assumed in v1. Show comparison breaks, missing intervals and conflicts. Fewer than two complete trusted nonconflicting compatible samples means insufficient history.

Apply the 90-day/1,000-observation/byte limits transactionally and expose pruning windows. Count failures and conflicts within these limits; never preferentially delete failures to improve the trend. Record an explicit retained-window boundary before pruning oldest source-ordered observations. A total storage cap stops new retention with a visible limitation rather than erasing another account's data. Logical payload limits do not bound SQLite/WAL/key-ring disk use: document host quota/maintenance requirements separately. No source artifact is deleted.

Alternatives: memory-only history loses observations at restart; unlimited source re-download fails after expiry and exhausts budgets; a new telemetry service is unnecessary. SQLite adds a custody/migration responsibility and requires developer review.
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->

### 6. Hand off a typed read projection to Health

Propose `CoverageDetail` containing verified repository identity; definition/scope; latestValidSample; recentObservations; compatibleHistory; comparisonBreaks; availability, completeness and freshness; sourceAvailability; sourceRetention; observationRetention; collectionBounds; nextCursor and safe diagnostics. A sample carries counts/unit/formula, exact identities, generation/observation/verification times, source links and limitations. The recent observation list is not replaced by latestValidSample.

This is a proposed language-neutral #54 handoff, not an existing API. The Health owner must review its shape, route placement and ownership before the proposal is complete. Keep it within repository detail rather than inventing a fleet dashboard. A dedicated authorized GET can refresh and read bounded history; no coverage POST/dispatch or arbitrary repository parameter is admitted.

Use compact native rows in the shared shell. Primary content identifies the limited scope, latest measurement age and newer gap. Put identifiers, formula and exact provenance in labelled disclosures. A textual sample table is the primary non-visual history equivalent; an optional visual line cannot bridge incompatible groups or missing observations. Keep keyboard focus stable across refresh. Mark observations stale after 15 minutes without successful source refresh, independently of source completeness; show measurement generation age separately without inventing a quality target. Source expiry does not retroactively change a retained count but prevents a current-verification claim.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## Risks / Trade-offs

- [Exact-attempt attribution is not established] → Block proposal completion until the producer trust review selects and demonstrates an authoritative association; never accept a plausible name.
- [Shared coverage contract not available in supplied context] → Obtain upstream contract evidence or an explicit justified fallback decision; do not claim none exists upstream.
- [Narrow collector coverage may be less useful than application coverage] → Require repository-engineer scope review; retain its explicit label and prohibit broader claims.
- [Retained samples outlive source artifacts] → Display source availability, expiry and last verification independently; do not imply continued proof.
- [Historical private data leaks after account changes] → Server authorization before reuse, atomic generation checks, no-store HTTP and browser scope invalidation; test races.
- [Limits hide older results] → Visible inspected and retained windows; bounded pagination never claims completeness.
- [New observation store increases custody scope] → Separate storage from commands/credentials, fail safely on storage errors and obtain developer architecture/security review.

## Migration Plan

After the required reviews and explicit implementation authorization, land the contract and producer first, then the guarded reader, history store and Health detail. Keep ingestion/presentation disabled until a real source acceptance proves the selected trust association. Version the separate observation schema; do not migrate command or credential databases. Rollback disables coverage collection/presentation and the optional producer without affecting verify, issue controls or repository delivery. Preserve existing observations under their declared policy; never delete source artifacts as rollback.

## Validation and Definition of Done

Add producer/normalizer tests beside each producer change, source/archive/authority tests beside the reader, transactional restart/dedup/conflict/pruning tests beside storage and browser tests beside the detail. Regress existing ArtifactSafetyTests, GitHubAuthorizationTests, SourceRequestGateTests and IssueEvidenceTests; lifecycle evidence must retain its current member semantics. Include exact boundary and one-over-limit cases for every numeric ceiling.

Actual acceptance must read a repository-produced coverage artifact through the connected-user consumer and inspect a configured repository without that facet. Record source run, exact attempt, artifact and measured commit with safe result evidence. Controlled cases cover wrong repository/ref/commit/attempt, untrusted producer, malformed/oversized content, expired/deleted sources, partial upload/scope, failed attempt then retry, duplicate/conflicting reports, permission loss and incompatible comparison. Fixtures are not real-source acceptance.

Run `npm run verify`, `npm run test:visual` and affected browser tests on the implementation candidate. Capture 390px and desktop light/dark screenshots for measured, missing, stale, denied and comparison-break states; verify computed typography, geometry, focus, contrast and no page overflow against docs/design/DESIGN.md and docs/design/control-center.md. Host/browser source acceptance must not expose authentication callbacks, tokens or signed URLs. Docker-dependent verification runs on the supported external host; no Docker-in-Docker workaround.

All eleven lifecycle Done dimensions apply: acceptance, completeness, tests, quality checks, security, architecture conformance, documentation, product/spec consistency, linked CI evidence, named developer review and explicit limitations. No tests, builds, browser runs or source acceptance have been executed by this proposal engine.

## Blocking review decisions

These are not deferrable open questions. Juan García Carmona must provide (1) a reviewed reusable upstream coverage contract or justified repository-owned contract, including a verifiable artifact-to-exact-attempt trust policy, and review the proposed tool/scope/bounds/storage; and (2) the reviewed #54 detail/history handoff and route ownership. These reviews were proposal-stage dependencies in the passed refinement. Until supplied, this design is an incomplete candidate and no implementation task is authorized.
