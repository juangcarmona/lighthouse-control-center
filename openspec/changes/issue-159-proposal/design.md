---
pdac-scope: cited
---

# Design

## Context

See proposal.md for authorization and motivation. Health already exposes project and exact-run routes. Workspace owns authenticated source reads under ADR-0006; this increment reuses those boundaries.

## Goals / Non-Goals

Expose a bounded snapshot on explicit request, not fleet-wide automatic collection. Do not request billing grants, identify runner capacity, mutate Actions or create a history store.
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->

## Decisions

- Use one internal query and GET route, requiring current Actions-read permission without requiring Issues-read. Recheck live session/connection/generation before each request and publication. Two nonqueuing read slots and a 25-second budget bound concurrent collection. No new credential path or fallback.
- Repository snapshots read cache usage and the first 100 artifact records; exact attempts read the first 100 jobs. Never follow provider URLs or silently claim exhaustive pagination. Fixed API paths, transport byte limits and bounded projections constrain cost.
- Derive completed-job seconds only from valid ordered source start/completion timestamps. Attempt elapsed span requires a complete, nonempty set of completed intervals; parallel job seconds are not wall time. Missing intervals stay null. Do not substitute run updated_at for completion.
- Return each measure with its own availability, source, unit, definition, scope and observation time. Artifact bytes exclude expired records; malformed values prevent an exact total. Cache freshness is approximate (GitHub refreshes about every five minutes), not a billing period.
- Billing remains unsupported because this increment has no verified Plan authority or repository attribution. Public/private visibility and self-hosted labels are explanatory facts, not billing rates; neither duration nor zero reported billing proves zero host or model cost.
- Keep display data in memory only. Retain stale measures with original times only after a successful, scope-validated usage response confirms current Actions-read authority. Distinguish unverified authority from content-read failures; failed authority checks, unconfirmed responses, explicit authority loss or changed account clear the old usage sample. Do not introduce synthetic trends without retained comparable samples.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Risks / Trade-offs

- Partial pagination → show collected/source counts, never repository totals from the bounded artifact list.
- Runner labels are not billing authority → label self-hosted only when explicitly supplied; otherwise unknown.
- Credential-free fixtures cannot qualify the connected account → retain live-source acceptance as a separate installed-runtime requirement.
- Added evidence density → reuse Health disclosures and existing Lighthouse layout; verify desktop/narrow and both themes.

## Migration Plan

No migration. Deploy through existing reviewed delivery; rollback removes the new route and presentation. No source state is changed.
