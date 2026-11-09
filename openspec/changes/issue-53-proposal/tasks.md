---
pdac-scope: cited
---

# Tasks

Implementation is held by `future`. These unchecked tasks describe later work, not authorization or completed evidence. VG-1–VG-8 refer only to the proposal verification groups mapped in [proposal.md](proposal.md#proposal-verification-matrix); they are not numbered acceptance criteria from the original issue.

## 1. Confirm delivery prerequisites before coding

- [ ] 1.1 Maintainer accepts/integrates the existing #52/#103 discovery and #50/#48 reader path and reconciles its ADR-0008 status in #48/#112; verify linked acceptance and exact integrated interface receipts, not candidate #100 presence alone.
- [ ] 1.2 Maintainer explicitly resolves the implementation hold through the existing lifecycle and reviews this proposal; verify a recorded release decision before starting group 2.
- [ ] 1.3 Refresh the project-detail, discovery, source-scope and issue/evidence reader contracts against the accepted head; deliver an interface map and confirm the additive route uses those paths without duplicating prerequisites.

## 2. Project source facts and supported interpretations

- [ ] 2.1 Add pinned CLI 0.12.65 manifest/upgrade schemas and owner-supplied SDLC 0.22.4 compatibility fixtures with integrity/source receipts; verify offline schema tests reject the SDLC forbidden asset keys without relaxing the schema (VG-7).
- [ ] 2.2 Implement the design support table for six fixed source files and two bounded managed workflow sources, preserving field provenance and raw unsupported facts; verify fixture tests retain manifest/upgrade/contract/package/lock dimensions and duplicate-key/unknown-schema diagnostics (VG-1, VG-7).
- [ ] 2.3 Implement conflict and root-npm applicability projections; verify tests retain every conflicting declaration and require complete supported evidence for narrowly scoped not-applicable, never inferring adoption from absent/denied files (VG-4).
- [ ] 2.4 Document supported paths, versions, unsupported semantics and fixture lineage alongside the projection; verify documentation matches the support-table test cases and synthetic variants are labelled (VG-1, VG-4, VG-7).
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="FR-PROJECT-DISCOVERY" digest="sha256:fb93a1c32232be6a679aa7aa074e9b6c0efd871cd48592b6b8d56996c36a2382" -->

## 3. Deliver the authorized bounded read query

- [ ] 3.1 Extend the existing connected-user transport for immutable configuration reads and add the workspace query/GET route; verify contract tests resolve the branch once, bind every file to that commit, require content-read authority and reject arbitrary paths, URLs, symlinks, unconfigured repositories and mutating methods (VG-1, VG-6).
- [ ] 3.2 Apply the eight-content-read, two-concurrent-read, 256 KiB/file, 1 MiB aggregate, 2 MiB response and 30-second budgets; verify boundary tests show incomplete/unavailable reasons rather than truncating into valid facts (VG-4).
- [ ] 3.3 Add scoped 15-second coalescing and lifecycle invalidation; verify injected-clock and transport tests check permission before reuse, preserve old times only for permitted stale fallback, and clear/cancel on session/account/generation/repository-authority changes including late responses (VG-4, VG-8).
- [ ] 3.4 Document query shape, availability mapping, read bounds, refresh and content-grant limitations; verify API examples against contract fixtures and confirm request traces contain only permitted read operations (VG-1, VG-6).
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 4. Explain comparisons and navigation in project detail

- [ ] 4.1 Add explicit same-scope baseline selection and deterministic compatible comparisons; verify tests cover scoped match, lower declaration, equal source identity, conflicting pins, different contracts, ranges and missing expectations with both origins visible (VG-2).
- [ ] 4.2 Render declared/lock-resolved facts separately and installed/latest/policy-required unknown slots; verify no baseline is labelled latest or required and no declaration proves runtime installation (VG-3).
- [ ] 4.3 Display source-linked exception declarations through the existing evidence path with unsupported/unassessed validity; verify the intentional-exception fixture preserves the difference and enforces no invented owner/review-date contract (VG-5).
- [ ] 4.4 Add immutable configuration links and explicitly linked maintenance-work navigation using existing readers/safe links; verify missing linkage remains unknown, hostile text stays inert, unsafe/out-of-scope links are rejected and navigation creates no upgrade/write/issue/dispatch requests (VG-6).
- [ ] 4.5 Enforce current dataScope/repository/epoch checks, at most two in-memory repository projections and 4 MiB retention with no persistent browser storage; verify account-change late responses cannot restore cleared facts or baseline selections (VG-4, VG-8).
- [ ] 4.6 Document the operator journey, comparison limitations, exception status and refresh semantics; verify each documented state can be reached in a labelled fixture demonstration (VG-2, VG-3, VG-5, VG-6).
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

## 5. Prove accessible inspection as it lands

- [ ] 5.1 Add keyboard-operable controls, visible focus, textual state explanations, stable refresh focus and wrapping source details; verify browser tests at desktop and 390px in light/dark themes, including removed focused sources and unrelated control focus (VG-8).
- [ ] 5.2 Capture browser evidence for matching, exception-unassessed, outdated, stale, conflicting, no applicable package, inaccessible and unsupported fixtures; verify screenshots, accessibility results and read-only request traces identify fixture provenance, viewport and candidate head (VG-8).
- [ ] 5.3 Update browser-test and user documentation with evidence locations and the physical-device limitation; verify review can reproduce the eight-fixture journey without a live credential or misleading real-fleet demonstration (VG-8).
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 6. Verify the integrated candidate

- [ ] 6.1 Refresh citations and check the proposal verification-group-to-scenario/task matrix against the accepted product baseline; verify `npm run spec:validate` and `npm run product:citations` pass with no scope drift.
- [ ] 6.2 Run `npm run verify` and the configured required CI on the exact implementation head using the supported host lanes; verify linked results include projection, .NET, browser, security and documentation checks without claiming unperformed real-provider or physical-device checks.
- [ ] 6.3 Obtain independent source-bound review and developer review of every lifecycle DoD dimension; verify the PR links VG-1–VG-8 evidence, known limitations and explicit protected decisions before requesting integration.
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->

## Workflow follow-up

- Owner acceptance, required forge approvals, merge and deployment remain separate from this proposal and its implementation checks.
- Archive through the existing OpenSpec lifecycle only after review requirements are satisfied; verify the archived capability and citations.
