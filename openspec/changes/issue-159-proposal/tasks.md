# Tasks

<!-- pdac-scope: cited -->

All tasks are future work. A planned candidate does not authorize implementation. Complete group 1 and obtain separate implementation admission before changing code. Requirement names refer to specs/actions-usage/spec.md; design.md fixes the proposed budgets and boundaries.

## 1. Resolve implementation admission

- [ ] 1.1 Agree #54 measurement/detail/history handoff and #57 repository/run/attempt/job/runner identity mapping with developer Juan García Carmona; verify a recorded interface note includes nullable fields, independent states, retention-unavailable behavior and no duplicate Health or telemetry ownership (AC1, AC5).
- [ ] 1.2 Review current official endpoint support, API version and effective acting-user/App permissions for runs, exact-attempt jobs, caches, artifacts and billing; deliver a dated endpoint/capability matrix with attribution, source fields and denied/unsupported outcomes, and verify no legacy timing assumption or broader credential requirement is hidden (AC2, AC4, AC6).
- [ ] 1.3 Record the owner's proposal decision, explicit future-hold release and separate implementation authorization; verify #54/#57 and permission prerequisites are resolved before proceeding, or stop with the exact unresolved decision.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

## 2. Bounded source collection

- [ ] 2.1 Add the internal usage slice, evidence envelope and query-owned budgets from design decision 3; verify .NET tests enforce every request/page/byte/deadline/concurrency limit at the boundary and over it, including authorization, chunked bodies, busy rejection and slot release; document units, state dimensions and limits (AC1, AC4).
- [ ] 2.2 Add supported run and exact-attempt job reads without overview job fan-out; verify missing/invalid times, parallel jobs, exact attempt identity, overflow and incomplete jobs never yield complete execution time or billing; document duration formulas and latest-20 selection (AC1).
- [ ] 2.3 Add only qualified billing capability reads or explicit local unsupported results; verify authorized source minutes, denied billing with zero billing calls, missing repository attribution, unknown execution class and public/self-hosted zero billing do not become zero total cost or money estimates; document independent cost domains (AC2).
- [ ] 2.4 Add metadata-only cache/artifact observations; verify duplicate/expired/deleted/unknown-size cases, changing pages, successful empty and capped listings retain current-versus-historical semantics and do not double count overlapping totals; document what the current byte snapshots exclude (AC3).
- [ ] 2.5 Implement independent availability/coverage/freshness and 15-second coalescing with five-minute freshness; verify fake-clock and transport tests cover partial-plus-stale, missing page, 429, timeout, unsupported capability, aggregate budget stop and no automatic retry; document recovery and collected-count wording (AC4).
- [ ] 2.6 Preserve current capability checks before reuse and guarded request/publication; verify held-read tests for logout, account replacement, permission loss, generation change and unknown authority, and assert only fixed read requests are sent with no fallback or source mutation; update source-boundary documentation (AC6).

<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

## 3. Health projection and conditional history

- [ ] 3.1 Integrate the agreed #54 projection with exact source identities, metric definitions, units, windows, counts and original timestamps; verify serialization/contract tests reconcile supported and missing fields and preserve independent partial/stale states within the final response bound; document the projection contract (AC1, AC3, AC4).
- [ ] 3.2 Consume up to 100 authorized retained #54 samples when available, otherwise return history unavailable; verify compatible samples, stale samples, missing intervals, changed windows/units/definitions and cumulative-report overlap cannot produce zero-filled or incompatible comparisons; document retention policy ownership and limitations (AC5).
- [ ] 3.3 Integrate scoped display restoration through the existing cache abstraction only; verify Node/browser tests cover ten-minute eviction, two-MiB limit, stale restoration, current authority prerequisite and immediate repository/account/owner clearing without sibling-read resurrection; document that restored snapshots are not history or authority (AC6).

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

## 4. Inspectable browser presentation

- [ ] 4.1 Add compact Project Health rows, disclosures and exact run/attempt/report navigation using the existing shell; verify labelled synthetic Playwright cases for loading/empty/denied/unsupported/unavailable/busy/partial/stale, inert text, safe scoped links, exact attempt drill-down and no/incompatible history; add an operator runbook with source reconciliation steps (AC1, AC5, AC7).
- [ ] 4.2 Implement visible focus, textual metric units/states, long-label wrapping and same-identity focus preservation; verify keyboard-only refresh/disclosure/navigation, removed-row focus recovery, accessible names, reduced motion and no horizontal page overflow in browser tests (AC7).
- [ ] 4.3 Run npm run test:visual and affected browser suites; retain 390px/desktop light/dark screenshots plus computed typography/control/edge/navigation checks, compare with docs/design/DESIGN.md and control-center.md, and obtain developer visual judgement without claiming a physical-phone test from screenshots (AC7).

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 5. Cross-slice acceptance and Done

- [ ] 5.1 Reconcile one real authorized supported Actions observation through the connected-user boundary and retain a safe actor/repository/run-attempt/source-field receipt; demonstrate denied billing, a self-hosted run, incomplete pagination, expired artifact and stale storage with clearly separated live and controlled evidence, recording any live-source limitation rather than granting access or claiming fixtures establish connected-user success (AC1–AC4).
- [ ] 5.2 Verify refresh/source inspection emits no mutations and observation outage does not become a delivery prerequisite; retain integration evidence for authority loss across current rows, retained-history responses and restored display data (AC6).
- [ ] 5.3 Refresh citations wherever implementation changes cited consumer text, verify current host-provided digests or newly generated canonical payloads, and run npm run spec:validate and npm run product:citations; preserve baseline/product-change approval boundaries and do not suppress validation failures.
- [ ] 5.4 Run npm run verify on the final implementation candidate, retain exact-head CI/browser evidence and have developer Juan review all eleven lifecycle Done dimensions, AC1–AC7 mapping, documented limitations, completed/dropped tasks and rollback; verify no unsupported live, deployment or approval claim appears in the completion report.

<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

## Workflow follow-up

- Owner reviews the proposal candidate separately from implementation admission.
- Integrate only after required source-bound review, configured checks and explicit owner/forge decisions; deployment remains separate.
- Archive through the installed OpenSpec workflow after delivery review, then verify the archived result without rewriting unrelated changes.
