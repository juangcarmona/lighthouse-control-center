# Proposal

<!-- pdac-scope: cited -->

## Why

An admitted Control Center operator needs to develop an idea into reviewable GitHub work without losing context or accidentally creating duplicates. Issue #55 is Ready for a bounded proposal; implementation remains held by `future` and separate source-acceptance gates.
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->

## What Changes

- Retain pre-promotion outcome, scope, repository and proposed issue content across revisit and refresh; explicit discard has no GitHub effect.
- Show bounded candidate issues and retrieval limitations before an explicit existing-issue link or reviewed create.
- Verify the connected GitHub actor and effective issue-write authority at confirmation; preserve confirmed source identity across repeat submissions.
- Reconcile uncertain creation before another send; unresolved cases stay uncertain for operator investigation.
- Join the existing source-backed backlog only after confirmation. Exploration and promotion request no lifecycle execution; assistance requires a separate supported explicit action.
<!-- pdac:cite id="UC-TRIAGE-BACKLOG" digest="sha256:0eaed6ca26d2e957f0eea2fbe207d6b201a0bb25708970f63d4f50c9703db9ac" -->
<!-- pdac:cite id="FR-BACKLOG-PROJECTION" digest="sha256:b98f45997965ba4d187781ca782921eb8c98cb8a9877de2081d26d1e6e5a4d55" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-WORK-AUTHORIZATION" digest="sha256:157f762cba7de8c5e40b42a8dfaa83c58e09032ddbebba67065a439ad1e487ce" -->

No breaking change is intended. No autonomous filing, new journal, queue, scheduler, lifecycle stage, integrated terminal, permission broadening or prerequisite implementation is included.

## Capabilities

### New Capabilities

- `idea-promotion`: retained pre-promotion ideas, candidate review, deliberate authorized create/link, confirmed identity and duplicate-safe uncertain recovery.

### Modified Capabilities

None. All six baseline specifications were inspected, including their scenarios. `owner-access` and `github-user-connection` remain prerequisite security contracts; `factory-overview` remains a bounded read-only observation surface. No existing capability covers this journey.

## Impact

Extend the authenticated workspace module, its browser presentation and tests. Reuse integrated #52 discovery and #48 source controls/ControlJournal only after their own acceptance. The future create/link adapter contract is proposed, not an existing Lighthouse command. Main is `d24953debaab37dfedf7745add1b47dae538a6d7`; owner evidence places #112/#103/#105/#111 in candidate #100 at `eb9d51a7bb7bd883b97b139d57c9553d8f51d8e4`, not main. ADR-0008 remains Proposed on main and must be reconciled through #48/#112. Accepted ADR-0006/0007/0009 remain constraints.

The whole product model (87 artifacts) was compared before drafting. Discovery reference: `docs/product/model` and `.lighthouse-product-evidence/index.json`; impact/citation references: `.lighthouse-product-evidence/<ID>.json` for the cited IDs in this proposal. These reports widened the selection through direct and transitive neighbours. Implemented intent is the accepted model, including applied CHG-LCC-EVOLUTION-001, owner-confirmed merged through #126; no new product decision is requested. Draft status fields and questioned graph edges are preserved as report metadata, not rewritten.

Impacted product dependencies, unchanged in authority:

- ACT-OPERATOR; FR-IDEA-PROMOTION; UC-TRIAGE-BACKLOG; FR-BACKLOG-PROJECTION; BR-GITHUB-SOURCE; BR-WORK-AUTHORIZATION: actor and bounded journey above.
- TERM-IDEA and BC-BACKLOG-TRIAGE: local idea ownership ends at source-backed promotion.
<!-- pdac:cite id="TERM-IDEA" digest="sha256:6c5c214cd1f93d9456f4430dc976458dd7f8c3cd973b89c26466327b235c2ca1" -->
<!-- pdac:cite id="BC-BACKLOG-TRIAGE" digest="sha256:160cdf8ee19db65605e325d8fd6124250e06f820adc04eb5d257c3f89f68a8a4" -->

- BR-LAN-PRIVILEGE-BOUNDARY and QR-EXECUTION-SECURITY: preserve server-side action authority and credential isolation.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

- FR-FACTORY-DISCOVERY and BR-EXPLAINABLE-SIGNALS: reuse scoped reads and expose coverage, freshness and availability independently.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:4ebd9c84897af61f0fb570eaf7a91e17a230b13192f37d470f810cd1984e94f9" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

- BR-RETENTION-STANDARDS, QR-MOBILE-OPERATIONS and BR-HUMAN-DECISION-BOUNDARIES: explicit local retention, accessible review/recovery and protected owner decisions.
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->

Checked neighbours left outside this delivery: ACT-ENGINEER/REQUESTER/GITHUB-BACKLOG retain their roles; TERM-PROJECT/WORK-UNIT/DELIVERY-EVIDENCE/EXECUTION-RUN retain their definitions; JRN-ENGINEERING-EXECUTION and JRN-DAILY-FACTORY-OPERATIONS are not expanded into full journeys. UC-OPERATE-ISSUE, FR-AUTHORIZED-ENTRY and FR-ISSUE-CONVERSATION remain with existing controls work; source priority, risk, execution, scheduling, delivery, provider operations, health and retention dashboards are unchanged. CON-FACTORY-RUNTIME, CON-TRUSTED-LAN and CON-DEPLOYMENT-INDEPENDENCE remain constraints, not new implementation scope. The graph's remaining provider, capacity, measurement and configuration neighbours do not justify extending #55.

Product definition drift: none proposed. See `design.md` for trade-offs, data effects, validation and six-bullet mapping; see `tasks.md` for ordered slices. This candidate stops at Planned. Keep #55 open and `future`; owner review does not itself satisfy dependency, source, architecture, implementation or integration acceptance.

## Recovery provenance

These four documents were recovered from the validated candidate envelope for native propose run `42714650903`. The candidate result reached `planned`, but publication failed strict OpenSpec validation because four requirement texts exceeded the 500-character limit. This local recovery preserves their clauses and citations while shortening those requirement summaries and keeping the details in scenarios. The original native run remains failed; this recovery does not change that result or imply implementation, approval, or acceptance.
