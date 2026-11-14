---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation and prerequisite evidence. Health already has fleet, project and contributing-run views. Its workflow observation collection is bounded, not a measurement population. The stage reader has no normalized telemetry-member contract. No production code changes are delivered in this blocked candidate.

## Goals / Non-Goals

**Goals:** make one execution measurement explainable after source-reader acceptance; give downstream families a consistent detail contract; expose unsupported evidence honestly.

**Non-goals:** broaden source authority, read native traces/prompts, add local operator credentials, implement later producers, invent a trend, estimate billing or introduce health thresholds.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

## Decisions

### Reuse the pinned shared calculation

The [released calculation](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/src/telemetry-opencode.mjs#L74-L84) and [exact-run CLI filter](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/src/telemetry-cli.mjs#L25) are authoritative for the candidate, not a local replacement formula. Source IDs are deduplicated; native starts select native steps, otherwise CLI fallback is selected, never both. Output tokens sum finished selected steps only when every value is numeric; reasoning and cache fields remain separate. Display a complete numeric measurement only with observed step coverage and a numeric output field. Otherwise retain null/incomplete/unavailable and the reported step counts.

Reported cost stays null. Window is one exact execution ID, repository, workflow run and attempt, not a calendar interval. Existing installation versions do not establish producer adoption or continued retention.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

Alternative rejected: recompute a new LCC formula from native logs or accept summary totals without validated normalized evidence. Both lose the shared definition or trust boundary.

### Gate a thin authenticated reader

After D-52/D-57 acceptance, extend only a reviewed normalized artifact/member contract under the existing .NET transport, connected-user permission checks, generation guard and cancellation. Match the authenticated repository, workflow run, exact attempt, execution and revision; validate released schema/version and correlation before projecting values. Bound inventory, archive/member paths and compressed/decompressed sizes; reject ambiguity, unsafe paths and unexpected members. No broad artifact browser or operator `gh` fallback.

The observed name `lighthouse-telemetry-agent-1` and members `evidence/host/telemetry.jsonl` and `telemetry-usage.json` are evidence of one producer output, not an approved reusable reader allowlist. Accepted naming, size and retention constraints are a blocking prerequisite, not an implementation default chosen here. Preserve existing stage readers unchanged until that review is supplied.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

### Shared detail projection, not shared producer semantics

The existing project route groups four families; contributing run details remain under `/workspace/health/{owner}/{repository}/runs/{id}`. Each future facet detail supplies:

| Field group | Required explanation |
| --- | --- |
| Identity | Family, signal/definition ID, version, source repository, run, exact attempt and execution |
| Meaning | Decision purpose, measured/derived classification, unit and formula or source verdict |
| Scope | Exact execution window or producer-defined UTC/cohort bounds; sample and denominator, with unknown explicit |
| Evidence | Source record identities and safe links, producer version, source time and observation time |
| State | Coverage independent of freshness, applicability independent of permission, unavailable reason |
| Limits | Retention basis, excluded work, unknown fields and restrictions on interpretation |
| History | Bounded source-linked observations, collection bounds and explicit comparison-break reasons |

These are presentation obligations, not an accepted new API schema. Coverage can be incomplete while freshness is stale. A transport failure retains original source times with a stale warning; identity or authority loss clears private values. Unknown deployment evidence stays unknown; not-applicable requires evidence of no deployment process. No local staleness age threshold is introduced.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

S2 adds only accepted family producers. S3 requires a shared comparison definition, compatible versions/units, UTC boundaries/cohort, eligible population and retention completeness. Missing intervals, changed definitions or expired inputs break a comparison visibly, never plot as zero. These remain later work, not S1 scenarios or delivered history.

### Separate real observation from reproducible fixtures

Owner-provided real provenance: repository `juangcarmona/lighthouse-control-center` (1425429121), run `42704809531`, attempt 1, issue #53 propose, revision `d24953debaab37dfedf7745add1b47dae538a6d7`, execution `ff1430057209bc8788c7685ed04bd2c63a1a6bf6512c596a6f70019fc09b6782`, stream `26590d5e-ed6b-45f0-927a-2e478e7125f9`, SDLC 0.22.4. The owner reports 538 normalized records, 10 starts/10 finishes, observed native coverage and 13746 output tokens, billed cost null. This worker did not retrieve or replay those records. The report is not proof of current ingestion, population completeness or stage success: that run's validation/publication failed.

Fixtures must be explicitly labeled synthetic and replayed through the pinned shared implementation, not copied totals. Require duplicate source events, native plus fallback, CLI only, missing numeric field, incomplete steps, health degradation/gaps and stale input. No live observation or provider claim can be replaced by fixtures.

## Verification groups and acceptance mapping

The supplied handoff references AC-54-01–08 without its full refinement envelope. The following mapping preserves the handoff's intent, not a claim to have validated absent receipts:

- **VG-S1-PRODUCER:** exact execution selection, deduplication, native/fallback, null fields, gaps and sample counts through the pinned calculation; AC-54-02/03/06/07.
- **VG-S1-READER:** accepted authenticated exact-artifact scope, bounded members, schema/correlation, denied/expired/malformed sources, identity/generation clearing; AC-54-04/08.
- **VG-S1-PRESENTATION:** accessible source explanation, four-family availability, independent stale/incomplete states, unknown deployment versus evidenced non-applicability, no billing/health score claims; AC-54-01/02/03/04/07.
- AC-54-05 remains S3 comparison work. No S1 completion claim satisfies the whole parent issue.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## Risks / Trade-offs

- [Unaccepted reader boundary] → Block production changes until maintainer/source-reader approval; never expand the allowlist as a workaround.
- [Optional telemetry and expired retention] → Expose gaps and unknown denominators; one sample never proves adoption.
- [Producer summary versus field coverage] → Preserve null even when step coverage is observed.
- [Misleading trends] → Defer comparisons until S3 has an accepted shared basis.
- [Visual publication] → Retain desktop/narrow light/dark evidence and require owner visual review for a changed interface.

## Migration Plan

This planning-only candidate has no runtime migration. After prerequisite acceptance, add a narrow read-only reader and test it before wiring the existing view; preserve old stage evidence behavior. Rollback removes only the new projection/view integration, without changing source records or credentials. Independent host verification, CI, integration and installed-runtime acceptance remain later gates.

## Blocking prerequisites

Maintainer/source-reader owner must supply accepted D-52/D-57 authority and normalized artifact contract, including retention/collection evidence. Shared-contract maintainers retain later definitions and comparison authority. These are not deferrable implementation questions and are not resolved by this plan.
