---
pdac-scope: cited
---

# Proposal

## Why

An admitted Control Center operator needs to trace an issue from proposal to its exact integrated result without treating green checks, mergeability or a submitted request as approval. Issue #56 plans that drill-down on top of the existing reader and command foundation, while implementation remains held.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="UC-VERIFY-DELIVERY" digest="sha256:804087739b1dfabebcd5932c70a85b2204501bbfa1a9b99360be1d3e548a0be9" -->

## What Changes

- Extend the selected issue workspace with source-linked stage results, proposal content, related PRs/current heads, checks, reviews, explicit decisions and resulting artifacts. Preserve missing or conflicting relationships rather than guessing them.
- Separate proposal generation, owner content review, implementation request, merge authorization, integration and verified result. Preserve triage → refine → propose → implement → integrate → review; approvals remain conditions.
- Show the exact resulting default-branch commit and its post-integration checks/artifacts separately from the PR head and pre-merge checks. Missing deployment evidence never proves production delivery.
- Project supported Implement, Integrate, Review and recovery requests only through the existing shared capability/prepare/confirm/submit/receipt/reconcile boundary. Unsupported or denied actions show reasons and a safe source link when available.
- Retain authenticated scope isolation, inert source content, bounded requests, keyboard access, narrow layouts and execution independent of Control Center. No automatic merge, alternate executor, local eligibility policy or new journal is introduced.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Capabilities

### New Capabilities

- `issue-delivery-evidence`: issue-centric inspection of proposal, PR, decisions and exact integrated evidence, including capability-gated action presentation and visible verification limits.

### Modified Capabilities

None. `delivery-verification` owns engineering-toolchain qualification, not this operator view. `factory-overview` remains a bounded read-only overview; `owner-access`, `github-user-connection`, `identity-environments` and `visual-identity` retain their existing contracts.

## Impact

Extend `src/SoFa.Modules.Workspace/Source/`, protected routes in `WorkspaceModule.cs` and the issue browser supplied by #50 under `src/web/public/`. Reuse #48's shared SDK bridge and protected journal after their existing delivery, not a parallel implementation. Add focused .NET/HTTP and browser coverage alongside `tests/SoFa.Web.Tests/` and `tests/browser/`; update issue-reader/operator guidance and affected ArcShape views through their owners. No new infrastructure, credential scope, durable evidence history, public source API or database migration is planned.

Dependencies remain owned by Juan García Carmona. The current PR #100 feature candidate at `eb9d51a7bb7bd883b97b139d57c9553d8f51d8e4` already assembles the #50 reader and #47/#48 source-control, receipt and journal components from PR #112; those changes are not on `main` at `d24953debaab37dfedf7745add1b47dae538a6d7`, and #48 remains open with actual-source acceptance pending. Reuse those candidate components after PR #100 integration and #48 acceptance; do not duplicate them. The candidate ADR-0008 file records `Accepted`, while `main` records `Proposed`; verify the existing #48 decision receipts before relying on that difference. The dated #116 assessment is context, not live forge status. Current adoption configuration enumerates six stages, but the inspected public-SDK consumer test demonstrates Refine preparation only; it does not establish Implement/Integrate/Review or recovery support. Later-stage support defaults to unqualified/unavailable until the adopted source advertises and validates it. No upstream feature is assumed.

### Product authority and impact discovery

This consumes the accepted model, including applied CHG-LCC-EVOLUTION-001, rather than reopening its product decision. The host index and relevant inspect/impact reports identify FR-DELIVERY-EVIDENCE, UC-VERIFY-DELIVERY, FR-EVIDENCE-CORRELATION, BR-EXPLICIT-WORK-COMMANDS, BR-HUMAN-DECISION-BOUNDARIES and the security/mobile qualities as direct scope. Their source-authority, actor and evidence-term neighbours are retained: ACT-OPERATOR, ACT-GITHUB-BACKLOG, BR-GITHUB-SOURCE, BR-LAN-PRIVILEGE-BOUNDARY, TERM-DELIVERY-EVIDENCE, TERM-EXECUTION-RUN and TERM-WORK-COMMAND. JRN-ENGINEERING-EXECUTION supplies journey context; no scheduling step is implemented here.

BR-GITHUB-SOURCE preserves authoritative identities and independent execution. BR-LAN-PRIVILEGE-BOUNDARY preserves server-side action authority separately from provider login.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

Checked impact neighbours left out: runtime/provider administration and UC-MAINTAIN-RUNTIME, portfolio discovery/boards, inbox resolution, idea promotion, engineering-health calculations and durable telemetry history. Existing issue context/conversation and source authorization remain prerequisite-owned, not rebuilt here. No accepted product intent changes.

### Review and delivery boundary

This candidate was recovered only from the envelope.json in artifact lighthouse-result-56-1 for failed propose run 42586873918, sourced from d24953debaab37dfedf7745add1b47dae538a6d7. The publisher did not publish the result because strict OpenSpec validation rejected the spec preamble and long requirement text. These four proposal documents were adjusted to address those validation errors and are validated locally; no successful source publication, proposal PR, owner review or implementation approval is inferred. Native agent and prompt traces were not used.

This is a planned candidate for owner review, not approved implementation. Retain `future`; prerequisite integration/qualification and a separate maintainer release remain necessary. Accepted ADR-0006/0007/0009 govern; no proposed ADR is accepted. Production deployment verification, new risk policy, team admission, rename and provider effects are excluded. See design.md for alternatives, data/interface boundaries and evidence plans, and tasks.md for ordered slices and Definition of Done.
