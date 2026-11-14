---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation. The existing authenticated observation API supplies latest-20 workflow status/conclusion, exact run links, revision and timestamps. It supplies no comparable historical measurements. ADR-0006 keeps execution independent.

## Goals / Non-Goals

Use the shared native shell for fleet, project and signal routes. No collector, persistence, new metric, score, provider action or authority change.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

## Decisions

- Reuse account and observation GETs, not another backend. Validate current permissions, source scope and owner deadline; remove denied records. Only explicitly stale evidence retains its original time.
- Use the raw workflow status/conclusion assessment as the first signal. State that the source supplies no metric version or numeric unit. It is not deployment or delivery acceptance.
- Keep all four requested families visible. Name missing reports rather than inferring quality, autonomy or consumption. Link existing runtime inventory separately.
- Omit charts until #54 supplies comparable samples. A sequence of unrelated workflow runs is not a trend.
- Use native links, definition lists and the existing appearance controls with compact flat rows.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## Risks / Trade-offs

- A polished page implies completeness → state bounds and unknown remainder at each level.
- Fixtures imply source acceptance → label demonstration evidence and require connected-source rehearsal.
- Version/history absent → explain the gap; do not create a definition authority.

## Migration Plan

No migration. Add routes and assets together; rollback removes only the new presentation. Preserve all existing API contracts.
