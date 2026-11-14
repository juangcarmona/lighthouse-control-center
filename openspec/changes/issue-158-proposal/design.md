# Design

<!-- pdac-scope: cited -->

## Context

See proposal.md for motivation and the two specification files for behavior. ADR-0006 keeps Control Center optional and read-only for this surface. The current Workspace module owns session/provider checks, connected-user source authority and atomic source guards. `IssueEvidence.cs` reads one displayed page, at most ten reports and ten explicitly referenced PRs in twenty seconds; it validates exact report/request/run/artifact bindings through `SourceContract`. `RelatedPullRequests.cs` already reads PR metadata and first-page checks. Missing artifact or validator support remains unavailable.

`GetHostInventoryHandler` and `runtime-inventory.mjs` already produce committed adoption facts. The helper reads four fixed committed paths at a verified selected HEAD: package.json, package-lock.json, .lighthouse/sdlc.json and the fixed unattended workflow. `workflowRef` is a literal harness checkout source reference, not proof that it ran. #53 owns future version/profile discovery; this checkout provides no dedicated installed/policy/baseline receipt. #54 supplies the presentation boundary, not an implemented historical metric feed.

## Goals / Non-Goals

**Goals:** normalize existing facts into explanatory projections, preserve source identities and unknowns, and add bounded source fields necessary for cited history. Keep the current .NET module and plain ESM/browser architecture.

**Non-goals:** new external packages, generic repository scanning, telemetry ingestion, lifecycle transition interpretation, background collection, durable history, source writes, policy/approval changes or broader #158 cohort analytics. No new ADR is proposed because the existing observer pattern is retained.

## Decisions

### 1. Consume adoption evidence through one narrow adapter

Add an owner-protected, repository-authorized GET `/api/repositories/{owner}/{name}/adoption`. Reuse the existing host reader/helper under the existing global host slot, but narrow its input to the one already configured checkout and an empty registrations list. Refactor that selection seam rather than copy filesystem discovery. Preserve all helper confinement, output and ten-second limits. Do not expose checkout paths or trigger runner administration reads. Unconfigured checkout, unsupported host or absent source receipt returns unknown adoption without blocking ordinary issue reads. No host reader is invoked during this proposal run.

Normalize existing producer fields into bounded fact rows: component, category, value, source path/link, exact revision, source time if supplied, discovery time, availability, coverage and limitations. `declaredCli` and `lockedCli` are separate declarations/resolutions; `sdlcVersion` is a manifest declaration; the fixed workflow path and `workflowRef` describe workflow/harness declarations. Do not label any of them installed. Render installed and policy groups as unknown until an applicable source receipt actually supplies them. An exactly associated existing run can contribute observed-run evidence at its own revision/attempt, not at the selected checkout by inference.

The selected production comparison baseline for this increment is **none available**. Do not invent a #53 wire format, a latest-release request or a policy threshold. The presentation projection accepts only explicit source-backed compatible comparison evidence supplied by the owning producer; absent/incompatible data renders no verdict. Contract fixtures exercise named compatible and incompatible baselines without pretending that a deployed producer exists. Wiring an eventual external producer requires its real documented contract, outside this candidate if that changes scope.

Alternative: infer installed versions from the lockfile or build a second #53 discovery service. Rejected: neither supplies installation evidence and both duplicate ownership. Waiting for every category would unnecessarily block the independently useful unknown-aware view.

<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->

### 2. Extend the existing optional evidence projection

Keep the current issue/evidence GET routes and displayed-page snapshot consumption. Add optional history fields to their projections; preserve existing JSON members and unavailable states. Capture source-confirmed repository ID from the existing repository metadata/installations association and the already validated immutable issue ID; do not require command/write authority to obtain read identity. Unknown IDs disable cross-name joins, not ordinary reads.

Use dated conversation report sources, exactly referenced workflow metadata, existing validated stage reports, PR creation/merge fields and head checks. For each of at most ten referenced PRs, add only the first review page (`per_page=20&page=1`) under an effective pull-request-read grant; record returned review IDs, actor type/identity, submitted time, commit ID, source link and source state. Extend ordinary read-authority projection from existing grants without requesting permission escalation or requiring command eligibility. Missing PR permission leaves that input unavailable. PR merge fields come from the existing PR response; merge is not automatically accepted delivery. Review history remains partial when more pages are possible; no new issue-events or label-history crawl.

All report, run, artifact, PR, check and review reads share the existing twenty-second optional-evidence deadline and atomic source guards. Source payloads and final evidence JSON remain capped at 2 MiB. Keep complete artifact inventory <=100 and compressed artifact <=2 MiB; checks <=100 and reviews <=20 per PR. Describe page selection, skipped excess references, timeout and cancellation. The existing conversation has 100 comments per page, explicit pages 1-10; this increment consumes only one selected page per evidence read and never silently loads the rest.

Keep `SourceContract` authoritative for recognized receipt formats. Native retained #99 evidence is a replay input, not permission to add a permissive production parser. Unsupported native or historical receipt bindings remain cited unavailable evidence. Add safe metadata fields even when a stage result cannot be validated; execution failures/skips must survive that validation failure.

Alternative: fetch all runs/reviews/events and reconstruct lifecycle transitions from labels. Rejected for unbounded work and invented semantics. A new history database is unnecessary for this first explanation.

<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->

### 3. Deterministic event projection, not a state machine

Project typed event rows with repository/issue IDs when verified, source event type/ID, run ID plus exact attempt, source revision, source timestamp or null, observation timestamp, source link, exact association, source availability and retained observation versions. Deduplicate identical source event/version payloads. A repeated source ID with changed outcome retains a version/conflict and its observation time; a different attempt never collapses. Missing IDs remain unassociated observations, never deduplicated by title or nearby time.

Dated events sort ascending by valid event time; a stable identity tie-break provides display stability only, not causality. Undated rows live in an explicit Undated evidence group. The window defaults to all available source dates in the selected input page, with explicit UTC bounds when known; operator-entered start/end filters are inclusive and local-only. Undated rows remain visible as unplaceable outside the dated filter. If no dates exist, display window endpoints unknown. Show observation time and exact input page coverage separately. `updated_at` is only an update fact, never an implicit lifecycle transition.

No interval interpreter is supported by the currently inspected producers. Queue/work/human-wait/PR-wait durations therefore display unknown gaps; do not implement speculative arithmetic. A future interval feed must provide versioned Lighthouse semantics and both source endpoints before this boundary changes. No counts, denominator or autonomy rate are introduced. Verified handoff questions/reasons remain individually cited; PR reviews and protected human approvals have separate classifications. Without explicit source protection/actor evidence, classification is unknown. An automated independent review cannot become a protected human approval.

Retain only same-issue in-memory observations: at most 1,000 rows/versions and 1 MiB serialized history; truncation is visible. No new browser/server persistence or background ingestion. Closing/navigating away may lose retained observations and that limitation is stated. This does not alter the existing shared display-cache contract.

Alternative: a single latest status or estimated wait bars. Rejected because it erases failures and confuses current labels with historical endpoints.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

### 4. Preserve identity, authority and visual ownership

A rename association requires matching source-confirmed immutable repository and issue IDs, within the current configured scope. Names, redirects and matching numbers are insufficient. Preserve original receipt strings and validate original bindings with the shared validator; if a historical format cannot be validated, show its limitation rather than relax validation. An old-name source URL is navigable only when its source scope is independently verified; no credentials follow source-supplied URLs or unconfigured aliases.

Use the existing owner/account generation and repository authority checks before requests and publication. On denial or actor replacement, clear affected projections immediately and discard late responses; temporary same-scope transport failure can retain original times with stale warnings. Owner loss clears all browser data. Independent owner-authorized host observations remain separate from account-scoped repository joins; do not weaken the Runtime view's existing authority boundary. No private path, token, raw artifact or login trace enters an error or receipt.

Keep repository adoption in a compact disclosure in `factory.js`/repository presentation; link to the shared issue reader. Add History within `issue.js`, not a second mission view or a new action owner. Extract pure normalization/presentation utilities if useful; page entries import shared feature-independent utilities, never another page's private state. Existing source-control mutation ownership stays untouched. Render text nodes, validate repository-bound HTTPS links and preserve stable keyboard identity.

Use the existing 184px/60px rail, 48px header, compact rows, semantic tokens, 15px text and labeled metadata disclosures. Show unknowns beside the relevant source, not as duplicate nested warning panels. Preserve issue description/conversation disclosure choices and keep current actions/editor feedback together.

Alternative: share page globals or persist a fleet history cache. Rejected for account leakage, module-boundary violations and expanded retention.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Risks / Trade-offs

- [Incomplete/expired live history] → Show source-level gaps and input bounds. Retained replay proves projection behavior, not current connected-user acceptance.
- [No #53 comparable baseline or installed receipt] → Initial baseline/categories explicitly unknown; no external format or upstream delivery promise invented.
- [Source parser cannot validate old/native receipt] → Keep execution/reference evidence and unavailable result; never loosen binding checks for a prettier timeline.
- [Review page/budget exhausted] → Preserve partial classification and source links, never no-approvals or no-interventions claims.
- [Identity or permission changes mid-read] → Atomic guards, generation checks, cancellation and immediate affected-data clearing tests.
- [Memory truncation removes older observations] → Visible omitted-history warning; no complete-history or historical-rate claim.

## Test and evidence plan

Each task group lands its own tests and documentation. Extend `IssueEvidenceTests.cs` and source fixtures for timestamps, review/merge metadata, exact association, no extra conversation read, limits and permission races. Add pure projection tests for duplicate versions, distinct attempts, equal/invalid times, window filtering and undated rows. Extend existing runtime/adoption tests without replacing their confinement assertions.

Build a sanitized replay fixture from `docs/delivery/evidence/issue-88/native-qualification/qualification.json`, retaining source file provenance, actual associations and missing timestamps. Keep failed run/PR, initial missing CI and later verification as distinct facts. Synthetic supplements cover protected human approval, repeated attempts, skipped jobs and unavailable label/review history; label those inputs synthetic rather than attributing them to #99. Test renamed ID 1425429121 only with an explicit source-identity receipt.

Run browser navigation, keyboard, accessibility and authority-clearing cases, then `npm run test:visual` and `npm run test:browser`; retain sanitized desktop and 390px screenshots in light/dark. Review actual typography, borders, rail/header geometry, long identifiers, focus and overflow against the installed visual contract and Lighthouse reference. Fixture success is not physical-phone or actual source acceptance.

Before implementation is called done, perform an independently reviewed actual connected-user read of an authorized real issue and an actual unavailable-history case. Record repository/issue IDs, source revision, observation/window, bounded input coverage, safe source links and actual unavailable categories. Do not substitute operator gh, change grants or capture authentication material. If #99 artifacts expired or its native format is unsupported, qualify that gap honestly and retain replay as separate evidence; do not claim a full live #99 chain. Missing current authority leaves implementation acceptance unresolved.

Run `npm run verify`, `npm run spec:validate`, `npm run product:citations` and exact-head CI, then review all eleven Done dimensions. The publisher runs proposal strict validation; no application, browser or provider check was executed by this proposal engine.

## Migration Plan

After separate owner acceptance and implementation authorization, land the additive adapters/projections, then presentation and same-slice verification. Optional missing inputs remain unknown for existing configurations. No database/config migration or new permission grant is required. Rollback removes the additive adoption route/history projection and UI while preserving the existing issue/runtime readers, source receipt history, commands and independent repository execution. Production deployment remains separate.

## Open Questions

No unresolved decision blocks this bounded design. Broader cohorts, interval semantics, intervention denominators and complete accepted-delivery coverage remain separately refined work with #50/#54/#56. Owner review of this candidate is still required and is not inferred from a planned result.
