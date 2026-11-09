# Tasks

<!-- pdac-scope: cited -->

All tasks are future work under issue #55. Keep `future` and the issue open; this candidate is Planned, not implementation authorization. Follow `design.md` and `specs/idea-promotion/spec.md`. VG-01 through VG-06 are proposal-local verification groups mapped to the six original bullets in the design.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->

## 1. Establish reusable prerequisite contracts

- [ ] 1.1 Record owner implementation release only after integrated/source-accepted #52 discovery, #48 controls/ControlJournal and ADR-0008 reconciliation; verify exact accepted revisions and reuse points in the implementation evidence without duplicating their PRs.
- [ ] 1.2 Document the supported owning create/link capability, version, actor/target checks, exact correlation/receipt lookup and no-execution policy; verify with contract tests and protected source evidence before enabling sends, or stop for revised planning if those guarantees are unavailable.
- [ ] 1.3 Document storage extension, retention/discard, recovery and rollback alongside the integrated controls guidance; verify the design reuses one journal/store and introduces no queue or new Lighthouse command/stage.
<!-- pdac:cite id="BR-WORK-AUTHORIZATION" digest="sha256:157f762cba7de8c5e40b42a8dfaa83c58e09032ddbebba67065a439ad1e487ce" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->

## 2. Retain and dispose of scoped drafts

- [ ] 2.1 Add versioned owner-scoped idea persistence in the accepted store; verify save/load, optimistic revision conflict, migration, process restart, owner isolation and visible save failure in deterministic tests (VG-01).
- [ ] 2.2 Add authenticated save/revisit/discard handlers and labelled browser controls for outcome, scope, repository and proposed title/body; verify HTTP authorization/CSRF, refresh retention and abandoned drafts causing no source call (VG-01).
- [ ] 2.3 Document effective draft retention, explicit discard and storage limitations; verify browser tests cover revisit, save error and discard, including preservation of any operation fence rather than deletion of unresolved evidence (VG-01).
<!-- pdac:cite id="TERM-IDEA" digest="sha256:6c5c214cd1f93d9456f4430dc976458dd7f8c3cd973b89c26466327b235c2ca1" -->
<!-- pdac:cite id="BC-BACKLOG-TRIAGE" digest="sha256:160cdf8ee19db65605e325d8fd6124250e06f820adc04eb5d257c3f89f68a8a4" -->
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->

## 3. Discover candidates and bind review

- [ ] 3.1 Adapt integrated #52 reads for repository-bound related search and exact issue lookup, at most two 50-item pages per query; verify open/closed results, PR exclusion, paging bounds, failed/stale/empty distinctions and no query-induced write (VG-02).
- [ ] 3.2 Build candidate selection and create/link review showing actor, repository, payload, limitations and no-execution effect; verify keyboard/browser journeys and server tests reject changed content, target, actor or draft revision (VG-02/VG-03).
- [ ] 3.3 Document query bounds and the deliberate create-versus-link choice; verify safe inert content, repository-bound source links, long text and limitation messages in browser tests (VG-02).
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:4ebd9c84897af61f0fb570eaf7a91e17a230b13192f37d470f810cd1984e94f9" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="UC-TRIAGE-BACKLOG" digest="sha256:0eaed6ca26d2e957f0eea2fbe207d6b201a0bb25708970f63d4f50c9703db9ac" -->

## 4. Confirm through the accepted source boundary

- [ ] 4.1 Reuse current actor/permission checks and connection-generation fencing at confirmation; verify missing/denied/unknown write grants, expired sessions, CSRF rejection, changed accounts and out-of-scope targets cause no operation and retain context (VG-03).
- [ ] 4.2 Implement supported create and verified local existing-issue association through the owning adapter and journal, with one atomic promotion claim per idea; verify payload binding, PR rejection, concurrent tabs, create-versus-link race and exactly one send or zero sends for linking (VG-02/VG-03).
- [ ] 4.3 Persist confirmed repository/issue identity atomically and document create/link outcomes; verify refresh/revisit, repeated confirmation, repository rename and later source-read failure return the same binding without another create (VG-03).
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

## 5. Recover uncertain creation without resending

- [ ] 5.1 Connect the accepted read-only reconciler to the existing operation; verify lost response, crash before/after send, local confirmation-commit failure and restart preserve uncertainty and the send fence (VG-04).
- [ ] 5.2 Bind only exact source-correlated evidence and add unresolved recovery presentation; verify similar titles, empty/partial results, multiple matches, unsupported lookup and lost permission do not imply success, non-creation or eligibility to resend (VG-04).
- [ ] 5.3 Document operator investigation and safe rollback; verify replayed confirmations, refresh, reconnect, discard attempts and repeated reconciliation never create a second issue, erase uncertainty or request execution (VG-04).
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## 6. Handoff and accessible exploration

- [ ] 6.1 Connect only confirmed bindings to the existing backlog projection; verify identity-based deduplication, preserved source facts/limitations, delayed reads and exclusion of editable/denied/abandoned/uncertain ideas with no lifecycle mutation (VG-06).
- [ ] 6.2 Keep assistance explicitly unsupported unless an independently supported capability exists; verify ordinary exploration starts no agent and no terminal/CLI fallback exists; if a supported action is offered, verify only its separate explicit request invokes its authorized entrypoint (VG-05).
- [ ] 6.3 Finish in-context status/recovery explanations and operator documentation; verify desktop/390px light/dark keyboard journeys, focus, labels, long content and accessibility for draft, review, denial, confirmation and uncertainty (VG-05/VG-06).
<!-- pdac:cite id="FR-BACKLOG-PROJECTION" digest="sha256:b98f45997965ba4d187781ca782921eb8c98cb8a9877de2081d26d1e6e5a4d55" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## 7. Integrated acceptance evidence

- [ ] 7.1 With explicit protected source authorization, demonstrate real test-repository create, existing-issue link, denied permission, abandoned draft, lost response after real creation, exact reconciliation and unresolved uncertainty; verify retained context/identity and no duplicate or implicit execution across repeat/refresh, retaining redacted exact-candidate evidence for all six bullets.
- [ ] 7.2 Capture safe implemented desktop/narrow screenshots for each journey in both themes and rehearse on a physical phone over the permitted network; verify keyboard/accessibility evidence and record owner visual/source/security decisions or an explicit remaining limitation, never substituting viewport emulation for device acceptance.
- [ ] 7.3 Refresh citations for affected delivery documents against current ProductShape reports and check full-model/impact consistency; verify `npm run spec:validate`, `npm run product:citations` and `npm run lint:docs` pass without editing accepted product intent.
- [ ] 7.4 Run `npm run verify` and configured exact-head CI, then review every Definition of Done dimension with the developer and independent reviewer; verify tests, documentation, approved-design conformance, source evidence, limitations and protected decisions before proposing integration.

## Workflow follow-up

- The trusted publisher validates and publishes this proposal candidate; no task above is completed by this planning run.
- Owner review and later implementation release remain separate. Keep #55 open and `future` until its existing release gates are explicitly resolved.
- Archive only after implementation acceptance and the repository's integration/review requirements, then verify the archived specification and citations.
