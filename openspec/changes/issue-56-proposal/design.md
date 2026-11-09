---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation and specs/issue-delivery-evidence/spec.md for observable behavior. Current main exposes account and bounded observation routes in `WorkspaceModule.cs`; `GetObservationsHandler` explicitly limits collection to 20 runs and 100 open issue records, checks permissions before cache access and isolates responses by session/connection generation. That snapshot cannot supply an exhaustive delivery chain.

The #116 plan identifies #50/PR #100's `GetIssueContextHandler`, `IssueEvidence` and safe artifact reader, and #48/PR #112's `SourceControlBridge`, `IssueControlCommands`, `SourceControlAccess` and protected `ControlJournal` as candidate foundations. They are absent from this checkout's Source directory. Reuse is conditional on their own integration and actual-user qualification; names here describe candidate boundaries, not delivered APIs. The dated assessment is not a live PR-status receipt.

Accepted ADR-0006 retains repository execution outside LCC, ADR-0007 retains external identity, and ADR-0009 retains ASP.NET Core/Aspire. The ADR index leaves ADR-0008 reconciliation with #48/#112. This proposal accepts no ADR or new persistence design.

## Goals / Non-Goals

**Goals:** Add an issue-scoped evidence projection and accessible detail sections using existing authenticated readers and command adapters. Make source bindings and claim limits inspectable.

**Non-Goals:** No second source of delivery truth, approval/risk engine, executor, scheduler, command journal, deployment verifier, fleet history store, additional identity scope or framework migration. Do not change the read-only overview or prerequisite correction budgets.

## Decisions

### 1. Extend the existing issue reader in one application

Use the #50 issue reader as the entry and read boundary after it is delivered. Add a delivery-detail query/projection within the existing workspace Source module; expose it through the reader's protected issue route or an additive issue-scoped GET using the same identity contract. Reuse the existing conversation, artifact and evidence parsers rather than loading arbitrary URLs or executing repository code.

The browser gets a credential-free projection. All reads remain server-authorized for the configured repository and connected user, including each dependent PR/check/artifact surface. Where existing app grants cannot establish a required read, report that evidence as unavailable; do not broaden grants as an implicit prerequisite. Preserve current no-store, session, origin/CSRF, fixed source-path, request-budget and connection-generation mechanisms.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

Alternative: extend the latest overview snapshot and join by title/time. Rejected because its bounded open-issue window and latest-run ordering cannot establish delivery relationships. A new service or durable graph would add ownership and retention without a scoped requirement.

### 2. Preserve typed evidence and explicit relationships

Normalize available source facts into issue-scoped nodes and source-confirmed edges, without declaring a new upstream receipt schema. The projection carries:

| Element | Proposed application projection |
| --- | --- |
| Scope | Stable repository ID/current path, issue ID/number, connected-source generation; never client-supplied authority |
| Node identity | Source kind/ID, run ID and exact attempt where known, stage result and request references, proposal artifact/path/revision, PR ID/number and head, check/review/decision IDs, integrated commit and artifact IDs |
| Binding | Exact producer revision and subject revision where different; source-established issue/request/run/PR relationships; no title/time heuristic |
| Time | Original source timestamps plus observation time, not a single rewritten freshness value |
| Availability | Available, missing, expired, stale, conflicting, denied, unsupported or unavailable as supported by evidence; source reason and completeness limits |
| Navigation | Validated repository-bound source reference or explicit unavailable link |

Deduplicate the same source identity without collapsing attempts. Keep multiple confirmed related PRs; a missing current relationship stays unknown. Preserve producer identity and schema/version validation from the prerequisite reader. Proposal content is inert text or its existing safe rendered form; do not expose raw prompts, credentials or transcripts.
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

Alternative: one delivery status or successful-run badge. Rejected because automation, human decisions, integration and verification are independently evidenced. The cost is more visible unknowns, which is preferable to false certainty.

### 3. Verify the resulting commit, not the newest green run

Display proposal/result, PR/pre-merge evidence, decisions and integration/post-integration evidence in separate sections. Resolve the resulting default-branch commit from authoritative integration evidence, including squash/rebase differences. Preserve it if the branch subsequently advances. Read relevant pipelines/checks and artifacts for that exact commit, retaining run attempts and artifact producer bindings. Source-defined applicable verification remains authoritative; LCC does not invent required checks or a delivery policy. If applicability cannot be established, report that limitation and withhold the claim.

The projection explains which facts are established and which are missing. Green PR checks do not satisfy missing owner decisions, merge evidence does not satisfy missing post-integration verification, and a source-confirmed verified result does not imply production deployment.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="UC-VERIFY-DELIVERY" digest="sha256:804087739b1dfabebcd5932c70a85b2204501bbfa1a9b99360be1d3e548a0be9" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->

Alternative: compare only PR head to default-branch tip. Rejected: squash/rebase and subsequent commits break that equivalence.

### 4. Render capabilities; do not implement lifecycle policy

The inspected `.lighthouse/issue-control.json` declares contract version 1 and six installed stages. `tests/issue-control-adoption.test.mjs` consumes the public SDK and proves controlled observe/prepare for Refine plus absent-contract denial. Neither that file, a CLI alias nor a successful proposal qualifies later-stage submission.

At implementation pickup record the adopted SDK/SDLC/workflow tuple and its exported public contract, then observe each requested action for the actual connected actor and issue. Default Implement/Integrate/Review/recovery to unqualified/unavailable until that boundary explicitly supports the action and its evidence bindings. Missing support is a designed outcome, not permission to implement an upstream feature. Retain existing supported controls and link safely to source for unsupported requests.

For supported requests, reuse #48's preparation, exact-effect preview, explicit confirmation, journal claim, submission and reconciliation unchanged. The preview shows actor, repository/issue, action and exact expected head/evidence, effects and conditions. A generic action that cannot bind all applicable authority cannot be used for a head-dependent effect. Do not encode this gap as a local check that pretends to strengthen an unsupported contract.

Submission revalidates permissions, head, required checks/review, reservation and applicable evidence through the shared boundary before its dependent effect. If changed, deny, refresh the explanation and require new preparation/confirmation. A future implementation release does not itself approve integration. Required human decisions and the `future` hold remain source conditions, not UI stages.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->

Alternative: dispatch stages directly, mutate request labels or add a local merge command. Rejected because it bypasses the shared authority/receipt contract and invents an alternate workflow.

### 5. Reconcile original requests; keep reads bounded

Use #48's original request identity and protected journal; no new command storage or background scheduler. Receipt/admission, worker execution, stage result, approval and verified outcome render independently. Lost responses remain uncertain and reconcile read-only by exact identity, never by a nearby run. Repeated confirmation, reload and restart do not send again. Source work continues when LCC stops.

Reuse #50's finite paging, response-size, artifact and elapsed-time limits and expose each limit in the delivery projection. Follow explicit IDs beyond the overview window within those bounds rather than scanning all history. Coalesce reads only inside the existing session/connection scope after live permission checks. Transient transport failure can retain labelled stale evidence with original times only while authority remains valid; authority loss clears inaccessible data, including late responses. No extra latency SLA or exhaustive-audit promise is introduced.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

Alternative: replay uncertain commands or retain all observations indefinitely. Rejected: replay risks duplicate effects; durable history requires separate product retention and architecture decisions.

## Interfaces and Data Effects

This is an additive internal projection, not a new public Lighthouse API. The query consumes prerequisite issue/evidence identities, authorized GitHub PR/check/review/integration/artifact reads and shared capability results. Responses contain facts, explicit edges, limits and action explanations, never tokens or locally authoritative eligibility. Mutation routes remain #48-owned and CSRF protected. Final endpoint and component names follow the integrated foundations; do not copy candidate files into this proposal.

Reading produces no repository effect. Confirmed supported commands have only their public contract's declared source effect and use existing receipt storage. No observation-history table, command-journal migration, retention expansion or AppHost service is needed. Rollback removes the additive view and controls while retaining the prerequisite reader and existing request receipts.

## Issue verification groups

The issue defines six acceptance criteria as bullets, without criterion IDs. The VG labels below are local proposal verification groups, not original issue criteria or new acceptance criteria. They connect the issue's existing bullets to requirements, scenarios and ordered tasks.

| Local group | Existing issue criterion covered | Requirements and tasks |
| --- | --- | --- |
| VG-01 — Source-linked chain | Criterion 1: connect issue and stage results to proposal content, PR/head, checks, reviews, decisions, integration commit and artifacts | Source-linked issue delivery chain; tasks 2.1, 3.1, 5.1 |
| VG-02 — Exact revision binding | Criteria 1 and 6: retain the referenced PR/head; verify changed head and stale checks | Exact revision evidence; tasks 2.2, 5.2 |
| VG-03 — Independent decisions | Criterion 2: distinguish proposal, owner review, implementation request, merge authorization and verified integration; automation does not imply approval | Decisions remain independent facts; tasks 2.3, 3.1, 5.2 |
| VG-04 — Source-authorized requests | Criteria 3 and 4: use the shared capability/receipt path for supported requests and explain unsupported actions while preserving stage order | Source-authorized action projection; tasks 1.2, 4.1 |
| VG-05 — Revalidation and reconciliation | Criteria 3, 4 and 6: bind actions to current evidence and test changed-head/stale-check outcomes | Revalidation before dependent effects; original request reconciliation; tasks 2.2, 4.2, 4.3, 5.2 |
| VG-06 — Exact integrated result | Criteria 1, 5 and 6: show the integration commit and post-integration checks, with source-confirmed evidence | Exact integrated result; tasks 2.2, 3.1, 5.1 |
| VG-07 — Limitations and claim boundaries | Criteria 2, 5 and 6: retain human gates, failed integration, missing artifacts and the absence of deployment proof | Evidence limitations stop claims; tasks 2.3, 3.2, 5.1, 5.2 |
| VG-08 — Scoped, qualified evidence | Criterion 6: verify an actual source-confirmed result and separately identify controlled cases. Authenticated scope, bounded collection, accessibility and fixture labeling are cross-cutting product-quality verification, not additional issue criteria | Scoped safe evidence access; bounded accessible independent inspection; source-confirmed delivery qualification; tasks 1.2, 3.2, 3.3, 5.1, 5.2 |

The task references use these VG labels so review can trace each planned check to the issue's actual criteria without assigning invented AC identifiers.

## Validation and Visual Evidence Plan

- Projection tests under `tests/SoFa.Web.Tests/`: exact identity/attempt joins, absent edges, multiple related PRs, changed head/stale checks, separate approvals, failed integration, missing/expired artifacts, conflicts, source outages and C-versus-D default-branch commits. Use deterministic controlled data, clearly labelled as such.
- HTTP/source-adapter tests alongside `OwnerBoundaryTests`, `SourceRequestGateTests` and the integrated #48 tests: preserve direct-route authentication, configured scope, authority-before-cache, connection-generation invalidation, inert rendering and shared denial before effects. Exercise controlled changed permission/review/check/reservation cases and repeated-confirmation/uncertain-response reconciliation. Test only approved application fixtures/harnesses, not sandbox or infrastructure boundaries.
- Browser tests alongside `tests/browser/observation.spec.mjs` and prerequisite issue-reader tests: keyboard-only navigation through evidence and explanations, confirmation focus return, stable identity across refresh, long content, stale/unavailable states, unsupported actions and authority-loss clearing. Run desktop and 390px layouts in light/dark themes, with accessibility checks.
- Retain sanitized screenshots of proposal/PR/decision sections, exact integrated commit with post-merge evidence, missing human gate, unsupported action, stale-head denial and uncertain receipt. Capture both themes and narrow layout, visible focus and text statuses; record screenshot-to-fixture/source identity. These are UI evidence, not physical-device or source-success proof. Preserve existing owner physical-phone deferral; no new waiver or completed phone rehearsal is claimed.
- After implementation authorization, inspect one actual source-confirmed proposal → PR → explicit integration decision → resulting commit → post-integration runs/checks/artifacts through the connected-user path. Record repository/issue IDs, request/result/run/attempt, PR/head, decision reference, exact integrated SHA, artifact IDs and source/observation times. Existing authorized source history can qualify inspection; do not manufacture a merge or real failure to populate evidence. Record any unavailable post-integration evidence and do not close acceptance on fixtures alone. For supported controls use only a separately authorized bounded source exercise; otherwise demonstrate their actual unavailable capability result.
- Close/reopen LCC after an authorized source admission and observe the same independently completed source work. Cover controlled response loss without deliberately duplicating a real operation.
- Run focused suites, `npm run verify`, current configured CI, `npm run spec:validate` and `npm run product:citations` on the exact implementation candidate. Preserve the separate nightly/manual identity-provider E2E lane; do not move it into required PR CI. No runtime, browser, provider or source-effect checks ran during this proposal. The publisher owns strict proposal validation outside the engine.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

## Risks / Trade-offs

- [Prerequisite candidates are not on main] → Keep implementation held; refresh existing source and acceptance receipts without duplicating #50/#48 work or extending correction budgets.
- [Later-stage public actions lack qualification] → Show unavailable until actual adopted support and binding semantics are proven; no upgrade or upstream implementation is assumed.
- [Source retention, grants and paging omit evidence] → Preserve partial/expired/denied states and stop affected claims; do not reconstruct missing approvals or artifacts.
- [PR head changes between reads and confirmation] → Bind evidence to exact revisions and require shared revalidation at submission/admission.
- [More detail makes the view dense] → Separate sections and concise limitation summaries with inspectable provenance, rather than a misleading aggregate badge.
- [Conflicting ADR-0008 status descriptions] → Leave reconciliation to #48/#112; do not accept a storage decision in this change.

## Migration Plan

1. Obtain owner review of this candidate. Separately complete prerequisite integration/qualification and maintainer release of `future` through the existing lifecycle.
2. Refresh the exact integrated foundations and capability tuple. Deliver the read projection and tests, then the issue-detail presentation, then only qualified shared controls. Each slice carries its own tests and documentation.
3. Qualify the actual source chain and exact candidate checks, complete applicable Done review and obtain any protected acceptance before integration. Deploy only through a separate authorized act.
4. If the view regresses, revert the additive delivery projection/presentation through normal reviewed delivery. Keep existing receipts for reconciliation and leave repository execution untouched; do not cancel admitted work or erase evidence.

## Deferred Details and Owner Decisions

Exact handler/route names and inherited finite read limits are reconciled with the integrated prerequisites at pickup without changing this contract. Unsupported actions remain unavailable regardless of their eventual release version. No unresolved product-scope choice is needed to draft this proposal. Owner proposal acceptance, prerequisite acceptance, implementation-hold release, any required visual acceptance and integration remain future explicit decisions, not approvals supplied here.
