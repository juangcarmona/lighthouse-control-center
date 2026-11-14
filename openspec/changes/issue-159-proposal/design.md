# Design

<!-- pdac-scope: cited -->

## Context

See proposal.md for motivation and specs/actions-usage/spec.md for behavior. Current GitHubObservations exposes source run identity, attempt, event and timestamps; updated_at is not a completion timestamp. Its connected-user permission-before-cache and generation guards, and GitHubTransport's fixed API origin, no redirects, 10-second request timeout and 2 MiB response limit are reusable. They do not prove billing capability. ADR-0006 keeps Control Center optional to repository execution. Architecture sections 05/08 classify Health projections and provider interfaces as proposed, not deployed.

The inspected OpenSpec baseline includes factory-overview, github-user-connection and visual-identity. None owns usage accounting. Active #52 discovery and #57 inventory candidates must not be overwritten or treated as completed Health interfaces. Active frontend/.NET architecture checks constrain implementation; no framework migration is needed.

## Goals / Non-Goals

**Goals:** a repository-selected, bounded query/projection consumed by #54 Health detail; separate evidence dimensions; no hidden job fan-out; exact identities compatible with #57; acceptance traceable to AC1–AC7.

**Non-Goals:** central collection, billing administration, host instrumentation, money estimates, provider-cost ingestion, historical backfill, independent retention storage, alerts or delivery controls. Existing operational activity APIs retain their meanings.

## Decisions

### 1. Use existing read boundaries and explicit capability qualification

Add an internal Workspace Actions-usage query slice and protected repository/run-attempt GET projections. Proposed integration routes are `/api/health/{owner}/{repository}/actions-usage` and its exact run/attempt detail; #54 owns the page route and common Health projection. Browser inputs select only configured repositories and validated positive exact run/attempt IDs. No arbitrary endpoint or report URL is accepted. Follow existing internal sealed CQRS and shared-browser dependency direction.

Before implementation, Juan reviews #54's envelope/detail/history integration and #57's scoped identity mapping. Record an endpoint matrix containing current official documentation/version, effective connected-user/App read permission, source fields, page semantics, attribution, limitations and date. Existing API version is 2026-03-10; do not change it merely to revive a legacy timing endpoint.

Candidate reads to qualify are repository Actions runs, jobs for an exact attempt, cache usage, artifact metadata and supported billing reports. A billing/timing endpoint is not assumed supported. Unsupported billing yields a local unsupported capability without attempting legacy routes. A denied capability causes no dependent data call. Repository Actions-read never implies billing read. Reports requiring unconfigured account scope or broader authority are not collected; repository attribution is unavailable. No operator token, installation-bot substitution, consent automation or broad organization grant.

Alternative: reuse activity cards as billing evidence. Rejected because timestamps and successful reads do not establish execution accounting. Alternative: organization-wide collector or new billing service. Rejected because it expands authority, attribution and deployment scope. Exact endpoint qualification can change the adapter mapping, not the specified honest missing-data behavior. If qualification requires a new product/security boundary, stop and return for owner review.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

### 2. Normalize evidence, not costs

Each metric envelope carries immutable repository ID plus observed name, source kind/version, metric key/definition version, nullable exact value, units, source record/report IDs, run/attempt/job IDs as applicable, optional runner/provider scoped references, source timestamp when supplied, observedAt, collectionStartedAt/EndedAt, selected window, record/page counts and known/unknown denominator, availability, completeness, freshness and limitations. Numeric bytes/durations are nonnegative, validated and overflow-checked; invalid input is unknown, never rounded into identity or a known measurement. No credentials, raw report payloads, transcripts or private configuration enter projections/logs.

Run elapsed means a documented valid start-to-completion interval, or an explicitly labelled in-progress start-to-observation interval; no completion from updated_at. Job duration means valid completed job intervals summed for the exact attempt; missing/in-progress intervals remain unknown with a measured subset count. Parallel jobs can sum above wall time. Partial job sums are labelled collected-job sums, not full-run duration. Preserve source seconds/milliseconds and display units explicitly; no rounding rule converts them into billable minutes. Billing minutes preserve the producer's units, runner categories, report window and attribution; reports with only money or bytes do not supply minutes. Known public/private visibility and GitHub-hosted/self-hosted classification remain separate attributes; labels alone do not prove host identity.

Use repository source cache-usage bytes as its own snapshot. If only paged cache entries are supported, report a collected-entry subtotal rather than pretending it is the source total. Artifact bytes sum distinct current non-expired metadata records only, with collected/expired/unknown counts. Missing expiration/size cannot enter a complete current sum. Never download artifact/cache contents. Expired or deleted content is unavailable for inspection; absent metadata cannot reconstruct historical bytes. Do not add a source total to its component entries or combine cache and artifact snapshots into billed storage.

Alternative: one resource total and one status badge. Rejected because it hides overlapping totals and independent freshness/coverage. No money estimate is introduced even though the broader baseline permits explicitly versioned estimates; this issue excludes them.

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

### 3. Enforce numeric budgets and independent failure states

One selected-repository query at a time per browser; no automatic fleet crawl or jobs read for every run. Exact-attempt detail is a separate explicit read. These are proposed upper bounds, not claims about current production capability:

| Budget | Limit |
| --- | --- |
| Whole query, including authorization | 30 seconds |
| Individual HTTP request | 10 seconds, additionally bounded by remaining query time |
| All outbound requests per query | 20 including authorization, pagination and refresh |
| Authority enumeration | At most 8 of those requests; unresolved authority stops data reads |
| Runs overview | 1 page, latest 20 runs |
| Jobs detail | 2 pages of 100 for one exact attempt |
| Cache entries, artifacts, billing | At most 2 pages of 100 each; use a single cache-usage response when supported |
| Per response / aggregate source bytes | 2 MiB / 16 MiB including authorization |
| Final serialized projection | 2 MiB; truncate records with partial reason, never silently |
| Global admitted usage queries / per-query HTTP concurrency | 2 / 1; reject busy immediately, no queue |
| Automatic retries | 0; show rate-limit/unavailable and wait for explicit refresh |
| Coalescing TTL / freshness threshold | 15 seconds / 5 minutes since successful observation |

Count requests before initiation and bytes while reading, including chunked bodies. Reuse the mandatory transport guard and add a query-owned aggregate budget rather than weakening transport limits. Cancel on owner/source lifetime loss; a cancelled waiter need not cancel a shared read still authorized for another waiter. Coalescing key includes owner session, connection generation, immutable repository, capability, window and exact attempt. Check authority before every reuse and publication. If existing authorization cannot complete within its sub-budget, return unavailable; never accept partial permission enumeration.

Availability is available/denied/unsupported/unavailable; coverage is complete-for-declared-scope/partial/unknown; freshness is fresh/stale/unknown. A latest-20 selection is complete only for that explicit selection, never a monthly total. A next-page cap, inconsistent page, duplicate/change during pagination or missing row field limits coverage. A known empty current collection requires successful complete source enumeration; a partial zero subtotal says only zero observed in the collected subset.

Any transient data failure with verified current authority can retain only the prior same-scope sample with original times and an immediate stale reason. Samples older than five minutes are stale even without a failed refresh. Staleness is a display freshness policy, not a health alarm or billing cutoff. Capability denial clears its old data; repository denial clears all usage/history in that repository; account replacement or owner loss clears all associated data immediately. Unknown authority blocks display reuse until revalidated. Do not wait for unrelated sibling reads before clearing.

Alternative: retry/backoff and background polling. Deferred to avoid hidden source costs and lifetime coupling; initial navigation and explicit refresh suffice.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

### 4. Integrate with Health; consume history without owning it

Issue #54 receives the normalized metric envelope and owns its shared detail/report presentation and any persisted retention. #57 supplies distinct scoped runner/host/provider references where actually observed; unmatched identities remain absent. Initial interface agreement must confirm this handoff, not introduce a second Health module. If no compatible history provider exists, this slice returns history unavailable and writes no database. Do not repurpose the source-control journal for usage.

History read interface accepts exact metric/repository/window and returns at most 100 retained samples, explicit retention policy, gaps and definition boundaries. It rechecks authority and fits the same 2 MiB response and 30-second deadline. Comparison key includes source/metric definition version, units, repository/resource scope, time-window shape and coverage basis. Partial samples remain labelled and compare only when their basis is explicitly compatible. Cumulative billing windows are not summed across snapshots. No interpolation across gaps or zero filling. No promise of retained samples, retention duration or backfill is invented.

Volatile current snapshots follow the 15-second coalescing policy. Browser display restoration uses the existing scope-verified cache abstraction (10-minute maximum age, 2 MiB maximum), adding only the Health view key if needed; restoration is stale display data, never history or authority. Its ten-minute eviction is independent of the five-minute freshness label. Logout/replacement/repository loss removes corresponding stored projections. No localStorage or new persistence dependency.

Alternative: build an independent historical store for #159. Rejected because #54 owns retention and definitions and history is explicitly conditional on retained evidence.

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->

### 5. Compact, inspectable presentation

Use the existing Control Center shell, semantic tokens, flat labelled rows and one page title. Metric rows show name, value/unit and textual state; disclosures hold exact times, identities, formula, window and coverage. Provide native keyboard controls for exact run/attempt and source-report inspection. Fixed repository-bound GitHub HTTPS links are generated/validated against identity; any approved report link uses its reviewed fixed source origin/scope, not arbitrary returned URLs. No raw HTML. Focus follows the exact metric/run identity through refresh; disappearing rows return focus to a persistent safe control without stealing unrelated focus.

Show duration, billing and storage separately, with explicit unobserved host/model-cost wording beside billing. Use lists/tables for retained samples; a graph is not required and must not imply continuity. Retain loading, successful empty, denied, unsupported, unavailable, partial, stale and busy states.

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Test Impact and Evidence Plan

- Extend .NET source fixture patterns in tests/SoFa.Web.Tests: exact attempt parsing, parallel/missing timing, zero/denied/unsupported billing, cache/artifact expiry and duplicates, all numeric boundaries, overflow, cancellation and authority-before-cache/publish races. Denied paths make zero dependent source calls.
- Add Node projection/architecture checks where the new browser integration touches shared modules/cache. Existing architecture and safety tests remain enabled. Each slice lands its own tests and runbook/API documentation.
- Playwright uses labelled synthetic fixtures for mixed availability, partial-and-stale storage, exact drill-down, incompatible/no history, account replacement during a held read and immediate clearing. Test keyboard focus, accessible names/text units and reduced motion.
- Retain safe screenshots at 390px and desktop (for example 1440px), in light/dark themes. Check computed 15px typography, compact controls, 2px edges, navigation geometry and page overflow, and compare against the installed Lighthouse/Control Center reference. Accessibility checks alone are not visual acceptance; narrow screenshots are not physical-phone qualification.
- After authorization, retain one real supported Actions observation with actor/repository identity, exact run/attempt, source fields/definition, observation window and displayed reconciliation. Also cover denied billing, a self-hosted run, incomplete pagination, expired artifact and stale storage. Controlled cases prove failures where live sources cannot safely reproduce them; record which are synthetic and retain live permission limitations instead of claiming source success. No authority changes solely to pass acceptance.
- Run npm run verify and npm run test:visual on the implementation candidate; retain exact-head CI and safe browser evidence. Developer Juan reviews all eleven lifecycle Done dimensions, including source acceptance, security and visual judgement. This proposal has run none of those implementation checks.

## Risks / Trade-offs

- [Billing support or attribution absent] → Treat unsupported/denied/unavailable as supported honest outcomes; never resurrect unreviewed endpoints or invent spend.
- [Storage mutates during collection] → Record interval, pages and inconsistency; subtotals remain partial rather than atomic totals.
- [Finite windows miss older usage] → Label latest-run selection and report windows; no monthly/fleet total inferred.
- [#54/#57 contract mismatch] → Keep implementation hold and require recorded interface agreement; material scope/authority changes return for proposal revision.
- [Old private sample survives a race] → Lifetime cancellation, generation guard before publication, immediate scoped clearing and held-read tests.

## Migration Plan

After separate owner admission, land contracts/tests, bounded collectors, Health projection/history adapter, then UI and source acceptance. Expose only the agreed Health route; existing activity/inventory remain compatible. No data migration, permission change or background agent is needed. Rollback removes the new view/query integration and its volatile display key; independent execution and #54-owned retained evidence remain untouched. Do not delete source artifacts/caches or alter retention during rollout/rollback.

## Implementation Admission and Definition of Done

Juan must review #54/#57 interfaces and endpoint/least-privilege permissions and explicitly lift the future hold before implementation. These are not recorded as completed by this candidate. No unresolved product choice is delegated to code: any need to expand scope, source authority or persistence returns to owner review. Done requires AC1–AC7 evidence, documented limitations, completed or explicitly dropped tasks, passing configured verification, citation/spec consistency, exact-head CI and developer judgement; deployment and merge remain separate.
