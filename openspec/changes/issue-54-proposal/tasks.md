---
pdac-scope: cited
---

# Tasks

All tasks are future work, not execution authorization. Preserve `future`. Verification groups and AC-54-01 through AC-54-08 are defined in design.md; AC-54-05 remains S3 work.

## 1. Reconcile Prerequisites and Pin Contracts

- [ ] 1.1 Before implementation, obtain the maintainer's separate authorization and record #100 default-branch integration plus #52/#57 source/product acceptance receipts; verify candidate ancestry and reused handlers on that authorized source, without rebuilding #103/#105/#111/#112. Stop if the implementation hold remains.
- [ ] 1.2 Recheck current product inspect/impact reports and shared producer/schema/calculation pins; document supported normalized inputs and source limitations, verify immutable references and refreshed citation payloads, and obtain #57 reader-contract/security acceptance. This delivers the definition record for AC-54-02 and AC-54-06 before coding.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->

## 2. Verify Shared Calculation and Evidence Projection

- [ ] 2.1 Add the normalized-input shared-calculation bridge and source-linked synthetic fixtures for exact execution, deduplication, native-over-fallback, fallback-only and separate token fields. Verify VG-S1-PRODUCER differential results against the pinned upstream function; document calculation identity independently of package version. Do not copy a new local policy formula.
- [ ] 2.2 Add nullable measurement/state projection with field availability, counts, unknown denominator, source/observation times and independent coverage/freshness/applicability. Verify no-starts, missing/null/numeric-zero usage, mismatched counts, matched stream loss, gaps/omissions and summary disagreement in VG-S1-PRODUCER; document why observed coverage alone is not a complete value.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 3. Add the Narrow Authenticated Reader

- [ ] 3.1 After group 1 acceptance and group 2 semantics, extend the integrated reader for exact normalized artifact identity and the two named members only. Implement/document streaming archive/member/event/timeout ceilings and schema/producer/repository/revision/run/attempt/execution checks. Verify VG-S1-READER allowlist, duplicate/traversal, oversize, malformed, unsupported, ambiguous-artifact and wrong-correlation cases; no native logs or operator CLI fallback.
- [ ] 3.2 Preserve live connected-user permission-before-reuse, session/connection-generation scoping and cancellation. Verify VG-S1-READER denied/expired reads, disconnect, permission loss, replacement and late-result clearing, plus stale retention only under still-valid authority. Document safe evidence-gap reasons and coverage provenance limits.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

## 4. Present and Document the S1 Signal

- [ ] 4.1 Add the four-family availability inventory and execution resource detail using existing navigation/themes. Verify VG-S1-PRESENTATION supported/unsupported copy, inert text, safe links, keyboard/focus and accessible labels at desktop/390px in light/dark; document no health score, threshold, billing, effort or trend claim.
- [ ] 4.2 Expose definition, source records, exact identities/window, timestamps, counts, unknown denominator and limitations. Verify projection/browser cases for incomplete-plus-stale, observed-plus-null, absent/expired/denied inputs and evidenced not-applicable deployment versus missing deployment data; record accessible visual evidence for each state without claiming physical-phone acceptance.
- [ ] 4.3 Add an evidence note linking the separately attributed #53 observation and exact source identities, producer summary, replay/health-sidecar limitations and failed validation/publication. Verify it stays distinct from synthetic fixtures, current collection and accepted stage results; test source drill-down metadata without downloading excluded logs.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 5. Validate the Integrated Candidate

- [ ] 5.1 Refresh citations for all affected consumer behavior from current provider reports, then run `npm run spec:validate`, `npm run product:citations` and `npm run lint:docs`; retain exact output and fix strict validation failures without changing product authority or provider-owned metadata.
- [ ] 5.2 Run all three verification groups and `npm run verify` on the exact implementation candidate in supported CI; retain test, accessibility and visual receipts with source revision. Verify no authority/correlation regression in existing observations and no unbounded history or credential fallback. Report failed/unavailable checks honestly.
- [ ] 5.3 Review the implementation against every DoD dimension and the design acceptance mapping with the developer/maintainer. Verify S1 criteria only, preserve S2's supported-family producers and S3's AC-54-05 comparisons as later parent work, and record prerequisite/source/product acceptance separately from CI and proposal review.

## Workflow Follow-up

- The trusted publisher validates and publishes this proposal candidate; the owner reviews it before any separately authorized implementation.
- S2 and S3 both depend on S1 in the slice graph; their external producer/comparison prerequisites remain separate. No child issue is created and no whole-parent completion is implied.
- Integration, release, deployment and later lifecycle transitions retain their protected decisions.
