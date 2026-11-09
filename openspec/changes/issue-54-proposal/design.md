---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation and prerequisites. Main at the supplied revision exposes latest-20 workflow runs and first-100 open issue records in `GitHubObservations.cs`. Permission precedes cache lookup; connection/session generation guards prevent stale-authority results. A 15-second coalescing interval and 20-second collection budget are existing observation mechanics, not signal freshness policy.

The #100 candidate contains the issue-reader work absent here. Its reported input/result and request/envelope/result member allowlists exclude telemetry. Default-branch integration, source/product acceptance and a telemetry extension remain separate. Current architecture sections describe signal projections as target work; ADR-0010 is proposed.

## Goals / Non-Goals

**Goals:** add a bounded query/projection through existing Workspace boundaries, keep shared calculation identity explicit, and expose orthogonal evidence states with attributable records.

**Non-Goals:** persistent history, comparison policy, new family producers, telemetry installation, provider operations, credentials, new services or a local measurement-policy authority.

## Decisions

### 1. Extend the accepted reader, not the archive surface

After #100 integration and acceptance, extend its authenticated reader under #57 coordination. Select an artifact by server-verified exact repository/run/attempt and artifact ID, with a strict name pattern `lighthouse-telemetry-agent-[1-9][0-9]*`. Permit only `evidence/host/telemetry.jsonl` and `telemetry-usage.json`. Do not choose newest-by-name or merge artifacts silently. Multiple candidates require exact artifact selection; otherwise explain ambiguity. Numeric repository identity comes from authorized source metadata, not the event's repository alias.

Proposed defensive ceilings per request are 16 MiB compressed archive, 32 MiB aggregate decompressed bytes, 64 archive entries, 16 MiB normalized-event member, 64 KiB summary, 50,000 events and 64 KiB per event, within a 20-second read budget. Enforce limits while streaming, not after full allocation; reject oversize inputs rather than truncate into a complete measurement. These are reader safety ceilings, not product targets or health thresholds. Retain any stricter accepted #57 bounds.

Reject absolute, traversal, backslash/ambiguous-normalized, duplicate or link member entries; extract nothing to disk and do not recursively unpack. Validate JSON/schema v1, pinned producer compatibility and exact repository alias-to-ID binding, revision, workflow run, attempt and execution correlation before deriving or returning a value. Reject unsupported versions or mixed correlations. Source IDs identify records; authenticated artifact origin and exact source binding establish provenance, not those IDs alone. Return safe metadata and contributing record references, not arbitrary raw attributes.

Check live connected-user repository and Actions authority before source I/O or reuse. Scope pending work and results by session, connection generation and source identity. Cancel/discard late results and clear protected data on authority loss. Retain old evidence only for temporary transport failure while authority is still verified. No fallback to operator credentials, native logs or broader browsing.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

Alternatives: unrestricted archive browsing is flexible but violates the evidence boundary; processing native traces expands sensitive inputs and forks producer semantics; a new ingestion service introduces unnecessary operational ownership. The thin normalized reader accepts more unavailable cases in exchange for bounded authority. Exact route/class names follow the integrated #100 contract, not invented replacements in this proposal.

### 2. Pin and verify shared producer semantics

Pin Lighthouse revision `879c4e75efebd945f8aea5b8ee09b97db62edbea`, SDLC `0.22.4`, CLI `0.12.65`, event schema v1, and the calculation source identity independently of application/package version. Immutable references:

- [Event schema](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/schemas/telemetry-event.schema.json).
- [usageSummary calculation](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/src/telemetry-opencode.mjs#L74-L84).
- [Exact-run CLI filter](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/src/telemetry-cli.mjs#L25).

Use the public shared calculation through the accepted reader bridge with normalized inputs only. Verify its result against the stored producer summary, retaining each provenance separately. A version/calculation mismatch is unavailable, not permission to invent a local formula. Do not invoke the operator-state usage command from the authenticated application.

The pinned calculation deduplicates by source kind/ID, otherwise event ID, using the producer's last-entry selection. Native starts select session events; otherwise select CLI events, never add both. Finished primary steps contribute each token field only if every finish has a numeric field; otherwise that field is null. Counts and matched loss/gap/omission markers govern coverage. Failed native finishes follow the pinned function, not a reinterpreted success-only rule. Reasoning/cache stay separate. Output completeness additionally requires numeric outputTokens. No-starts is unavailable even if an anomalous finish exists.

The named two-member contract has no separately proven stream-health sidecar. Label producer-reported coverage as such; replay without health metadata cannot independently certify collection health. If summary/health provenance is absent, contradictory or unsupported, expose an evidence gap rather than upgrading replay coverage. Any additional health member needs a separately reviewed allowlist contract, not opportunistic browsing.

Alternatives: copying the formula into .NET risks semantic divergence; displaying a stored sum without validation is simpler but hides missing fields, wrong execution and summary disagreement. A thin shared-calculation bridge plus source-linked differential fixtures preserves ownership at the cost of explicit compatibility gating.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

### 3. Project independent evidence dimensions

Use a read model containing definition/calculation identity; purpose; measured field versus derived total; nullable value/unit; repository/run/attempt/execution/artifact/record references; source/observed/calculated times; selected source kind; starts/finishes/sample counts; known denominator or explicit unknown; input availability/reason; coverage; freshness; applicability/basis; and limitations. Do not collapse these into one severity enum. No persistent storage or cross-execution aggregation is added.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->

Preserve incomplete subtotals as labelled partial evidence, never complete totals. Freshness follows original timestamps and failed-refresh evidence; do not invent an age cutoff. Missing time is unknown. Expired, denied, malformed, unsupported, absent and transient failure have distinct safe reasons. Denial clears protected values; transport failure can retain stale values under live authority. Not-applicable deployment requires an accepted source basis; absent deployment data alone stays unavailable.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

Alternatives: a single status badge loses simultaneous stale/incomplete information; zero-filling suggests consumption was measured; a fixed freshness threshold invents policy. Separate fields are more verbose but preserve the operator's evidence boundary.

### 4. Explain first; do not chart a single execution

Present a four-family inventory and an execution resource detail using existing navigation and Lighthouse themes. Show purpose, value/state, counts, calculation/version and limits before expandable contributing records. Keep text inert, links safe and source-bound, keyboard focus stable, and state descriptions textual rather than colour-only. No S1 trend chart is offered.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## Verification Groups and Acceptance Mapping

These are local verification groups, not new lifecycle gates. AC identifiers refer to the supplied passed refinement:

| Parent criterion | Meaning and S1 coverage | Verification group / tasks |
| --- | --- | --- |
| AC-54-01 | Four families, supported values, unavailable reasons; additional producers remain S2 | VG-S1-PRESENTATION; 4.1 |
| AC-54-02 | Purpose, pinned definition/formula, identities, unit, window, times and limits | VG-S1-PRODUCER and VG-S1-PRESENTATION; 1.2, 2.1, 4.2 |
| AC-54-03 | Measured/derived and independent coverage, freshness, availability, applicability | VG-S1-PRODUCER and VG-S1-PRESENTATION; 2.2, 4.2 |
| AC-54-04 | Authorized source records, counts and explicit unknown denominator/population | VG-S1-READER and VG-S1-PRESENTATION; 3.1, 4.2, 4.3 |
| AC-54-05 | Comparable retained trends: wholly deferred to S3, not delivered here | Future-slice task 5.3 records the boundary; no S1 trend tests |
| AC-54-06 | Exact-run dedup/native-fallback/null/coverage calculation and distinct real evidence | VG-S1-PRODUCER; 2.1, 2.2, 4.3 |
| AC-54-07 | No score, threshold, health, effort or billing claims | VG-S1-PRESENTATION; 4.1, 4.3, 5.1 |
| AC-54-08 | Bounded reader, live authority, exact correlation and clearing | VG-S1-READER; 3.1, 3.2 |

- **VG-S1-PRODUCER:** source-linked synthetic fixtures cover exact-run selection, duplicate keys, native/fallback coexistence, fallback-only, separate reasoning/cache, numeric zero versus missing/null, observed counts with null tokens, no starts, mismatched counts, matched degraded/lost streams, gaps/omissions and summary/replay disagreement. Fixture calculations are not hosted provenance. Add focused tests beside the bridge's accepted Node tests; shared upstream semantics stay pinned.
- **VG-S1-READER:** .NET boundary/transport tests beside `SourceRequestGateTests.cs` and `GitHubAuthorizationTests.cs`, plus archive bridge tests, cover direct unauthenticated/denied reads, exact artifact selection, expired/malformed/oversized members, duplicate/traversal paths, unsupported schema, wrong repository/revision/run/attempt/execution, connection replacement, permission loss and late-result clearing. Synthetic hostile archive tests run only on a later authorized implementation, not as infrastructure probes.
- **VG-S1-PRESENTATION:** projection and browser tests beside `tests/browser/observation.spec.mjs` cover inventory and all evidence-state combinations, missing metadata, source links/counts, safe text, authority clearing, stable focus, accessible labels and honest copy. Capture desktop and 390px light/dark screenshots for observed, incomplete-plus-stale, null-value, unavailable, evidenced not-applicable and authority-loss states. Review keyboard flow and accessibility-tree/axe evidence; screenshots alone do not prove accessibility or physical-phone acceptance.

### Separately attributed real observation

Preserve the owner-supplied observation of issue #53 propose: repository ID `1425429121`, workflow run `42704809531`, attempt 1, execution `ff1430057209bc8788c7685ed04bd2c63a1a6bf6512c596a6f70019fc09b6782`, revision `d24953debaab37dfedf7745add1b47dae538a6d7`, stream `26590d5e-ed6b-45f0-927a-2e478e7125f9`, artifact `lighthouse-telemetry-agent-1`. Its reported 538 schema-v1 events span `2026-11-09T21:43:24.339Z` to `2026-11-09T21:49:01.127Z`. The stored summary reports native selection, observed coverage, 10 starts/10 finishes, 13,746 output tokens and null billed cost.

Owner-reported offline replay matched stored usage without a separate health sidecar; coverage remains attributed to the producer summary. No fresh collection/replay is performed here. This one execution establishes neither ongoing collection, retention/population completeness, accepted signal nor trend. The agent succeeded but validation/publication failed; failed-run history remains failed. Package retention defaults of seven local/fourteen hosted days are supplied source context, not verified target retention.

## Risks / Trade-offs

- [Older main duplicates candidate work] → wait for #100 integration/acceptance and rebase; change only the missing reader extension.
- [Optional collection or expired artifacts] → explicit gaps; do not install telemetry or infer zero.
- [Replay lacks health provenance] → retain producer attribution and independent verification limits; no unqualified completeness claim.
- [Large or ambiguous source inputs] → fail closed at documented ceilings and exact artifact identity; no scan expansion.
- [Version drift] → pin shared contracts and differential fixtures; reject unsupported inputs.
- [Feature looks like whole-issue completion] → retain S2/S3 and the future hold in documentation and review.

## Migration Plan

After separate authorization, integrate/reuse accepted source-reader work, add the narrow telemetry contract and tests, then the read model and UI. No data migration is required. Roll back by removing the new reader/projection and presenting unavailable; do not alter source artifacts, retained failure history or repository delivery. Process restart follows existing session invalidation, not persistence recovery.

## Validation and Definition of Done

The publisher, not this engine, materializes artifacts and runs `npm run spec:validate`, `npm run product:citations` and `npm run lint:docs`. Provider-owned metadata is preserved. No CLI validation pass is claimed here.

Later implementation must pass all three verification groups, exact-candidate `npm run verify` and configured CI in supported runners. Each task owns its unit tests and documentation; the final group checks integration only. Review every lifecycle DoD dimension, retained product/spec consistency, limits and visual evidence; developer/maintainer decisions and protected source/security approvals remain explicit. Proposal review is not implementation approval.

No unresolved product question blocks this bounded proposal. #100/#52/#57 acceptance, shared-contract compatibility, target collection/retention verification and removal of the implementation hold remain owned later prerequisites, not facts established by this design.
