# Design

<!-- pdac-scope: cited -->

## Context

See proposal.md for motivation and scope. ADR-0006 assigns execution and publication to repository workflows; ADR-0008 assigns protected intent/receipt persistence and reconciliation to the application. The runtime view and development issue-controls runbook document the implemented prepare, explicit confirmation, one-effect claim, receipt and reconciliation path. No alternate entrypoint or policy is needed.

The host supplies a passed fresh refinement at source revision `81a3104da7abfc26e19626d3051ed64072b4159e`. The owner selected the existing development preview. The earlier proposal failed at runtime preflight; reported archival/capacity recovery is owner evidence, not an engine-verified operational fact. Historical plans may carry older citations and versions; current provider reports, not copied historical hashes, ground these artifacts.

## Goals / Non-Goals

**Goals:** make each refined criterion independently reviewable; preserve exact source association, uncertainty and failure; collect the smallest safe evidence bundle using existing controls.

**Non-Goals:** change UI or behavior, create a live journey harness, inspect private journals or credentials, restart infrastructure, reproduce completed writes, manufacture live security failures, qualify production or decide owner acceptance. Physical-phone rehearsal is owner-waived for this qualification, not satisfied by narrow screenshots.

## Decisions

### 1. Qualify existing contracts without a spec delta

Use `skip_specs: true`. The requirements already distinguish ordinary comments, continuation, source admission and outcomes. Adding a capability would invent new meaning; modifying #48's active specification would confuse this evidence exercise with its earlier implementation plan. The alternative, a behavior change or new automation, requires separate scope and potentially Product Change authority.

<!-- pdac:cite id="FR-AUTHORIZED-ENTRY" digest="sha256:9d9205257c47d81d2f01866ea9d643bc5f169f4295cf37a600086a405eab8463" -->
<!-- pdac:cite id="FR-ISSUE-CONVERSATION" digest="sha256:936e13fb5556657bf62b15f7b5fb8c943b1aaa00736100b5ba4bc6c51689e463" -->
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->

### 2. Assemble one evidence ledger; do not replay the journey

The qualification operator assembles a sanitized ledger in the existing parent completion record for #47/#48 and Lighthouse #119. Each entry contains criterion/scenario ID, authority source, actor's safe source identity, repository/issue identity, local action and immutable request IDs where exposed, source comment URL/ID, router run/attempt, worker run/attempt, validated result/artifact link, source/observation times, tested revision, outcome and limitation. Unknown fields remain unknown with a responsible follow-up; neither timestamps nor the latest run establish association. Keep source acknowledgement, job conclusion, validated stage result and owner acceptance separate. No private request body or journal export is needed.

Use these anchors without guessing missing links:

| Event | Known anchor and treatment |
| --- | --- |
| Initial human wait | Question comment `6943264685`; obtain original Refine receipt and exact router/worker/result links from retained source evidence |
| Ordinary comment | Comment `6943924711`; retain its confirmed actor and evidence that the question remained pending |
| Explicit continuation | Answer `6944035493`; retain the exact question, original grant and request binding plus source acknowledgement and resumed result |
| Failed proposal | Worker `44058084284/1`; retain runtime-preflight failure and absence of proposal, never replay its consumed request |
| Recovery note | Comment `6944866940`; label archival/capacity recovery owner-reported, not independently verified here |
| Fresh refinement | Request `3e5a5eae8603d09305275f0c59e2cc825ec6cddfe19dbfba3e316c46f5eaa1cc`, router `44061595300/1`, worker `44061708654/1`, report comment `6945100807`; do not substitute this refresh for the earlier resumed refinement |
| Current fresh Propose | Request `cbc8b3fb1974cdfe9807666b6f87119e23d9eee722380406655c724c75fa60fe`, request comment `6945183464`, router `44063470951/1`, worker `44063549200/1`; attach its validated publication only after the host publishes it |

These identities are host-supplied provenance, not independent engine authentication. This run produces the current proposal candidate; do not submit another Propose to prove it. Host validation/publication and eventual connected-user recovery complete that record later. Keep unrelated status on the parent tracker to avoid changing issue #258's input.

<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:f2639559cb8742b8f4642d3a5a3b5031b5b1bded58778bbc499067f44abd4ae5" -->

### 3. Use receipt/reconcile operations for recovery

Select one already retained submitted or uncertain action through supported controls. Record safe action/request identity and intent association, then recover after an existing lost-response event or owner-approved supported application restart. Compare the original and recovered intent locally without publishing its private payload. Count receipt/reconcile operations and assert zero prepare and zero submit operations throughout recovery. A restored preparation is read-only; an unknown receipt stays unknown until exact source proof exists. If the latest retained action differs from the historical action required, record that limitation rather than replace it or inspect storage.

Prefer read-only recovery over inducing an outage. If no suitable retained event exists, keep the check unperformed and request the operator's bounded evidence decision; this plan grants no restart, process kill, reset, journal deletion, new write or runtime cleanup. Retention/admission failure stops collection with the exact safe reason. Reconciliation is preferable to resending because a consumed or unknown request may already have had its source effect.

<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->

### 4. Separate isolated tests, connected proof and acceptance

The following are qualification scenarios for unchanged requirements, not new normative specifications. Each row defines an observable pass/failure boundary.

| Scenario / criterion | Given / when | Required evidence and forbidden outcome |
| --- | --- | --- |
| Q1 / AC-1 | Given the original Refine request, when its retained outcome is inspected | Verified App-user actor and immutable request lead to exact router, worker attempt and needs-info question `6943264685`; HTTP/job success without a validated result is incomplete |
| Q2 / AC-2 | Given that question was pending, when ordinary comment `6943924711` was confirmed | Separate source ID/actor and before/after question receipts show no continuation and the same pending question; comment text alone is insufficient |
| Q3 / AC-3 | Given the current question and original grant, when explicit answer `6944035493` requested Continue | Exact owner/question/grant/request binding, acknowledged source action, resumed worker/attempt and validated refinement outcome; preview selection grants no additional authority |
| Q4 / AC-4 | Given failed proposal `44058084284/1` and passed fresh refinement, when this new Propose completes | Failure/no proposal remain preserved, current request has a distinct immutable identity and exact validated published candidate; missing result is incomplete, never permission to replay |
| Q5 / AC-5 | Given an existing retained action after response loss or supported restart, when receipt/reconcile is requested | Same action, unchanged intent and exact source identity; zero prepare/submit, restored preparation cannot send, unknown remains unknown without proof |
| Q6 / AC-6 | Given denied, unknown, stale, unsupported or reserved prerequisites, when context refreshes or confirmation is attempted in isolated cases | Explicit reasons and no dependent source write; refresh, HTTP success and workflow success cannot create eligibility, approval or a passing result |
| Q7 / AC-7 | Given completed and incomplete evidence, when the owner reviews the parent bundle | Separate model, test, execution and acceptance records; actual tested revision/versions/digest, source links and failures retained; no production/device or parent-issue completion inferred |

The pending question and retained action are the operational subjects. Invariants are actor/question/grant binding, immutable intent, no implicit continuation, no replay and source-only confirmation. A failed terminal attempt remains failed; recovery must not send it again. No accepted LC or SB artifact appears in the 87-artifact inventory, so formal lifecycle initial/terminal states, transition IDs and `covers-transition` or `illustrates` links are not applicable. Delivery stages are not invented domain states.

Draft `SB-ORDINARY-ISSUE-COMMENT`, `SB-UNCERTAIN-ISSUE-COMMENT`, `SB-EXPLICIT-QUESTION-CONTINUATION`, `SB-UNRESOLVED-INTERVENTION` and `SB-UNAVAILABLE-ISSUE-ACTION` in the binding ledger aid scenario discovery only. Their acceptance remains pending in CHG-LCC-STRUCTURED-BEHAVIOURS-001; no baseline coverage citation is claimed. If qualification exposes a missing semantic rule, stop for the separate Product Change process rather than expand this plan.

#### Actual executable coverage and limits

- `tests/SoFa.Web.Tests/IssueControlCommandsTests.cs`: `ReleasedSdkPublishesOneCommentAndReconcilesLostResponsesWithoutResending` checks one synthetic source write, comment receipt, restart and unchanged intent; `RestoredPreparationIsReadOnlyAndRevokedOrReplacedAccountCannotSendOrReadIt` checks restored preparation and denial. These are released-SDK/SQLite integration checks, not actual-user effects.
- In the same file, `RefineDispatchUsesTheSharedTypedIntentAndNeverResendsOnReconciliation` asserts stage-only preparation, unacknowledged submission and one write after duplicate submit. Despite its name, it does not prove the complete source journey or independently execute a full resumed stage. `RevokedWriteAuthorityAfterPreparationCannotPublishAComment` checks fail-closed effect-boundary denial using synthetic authority.
- `tests/browser/attention.spec.mjs`: `verified intervention 1280/390: inspect on demand and reconcile explicit Continue` uses controlled API responses to test separate confirmation and source-resolution presentation; label-removal/failed-refresh and account-switch cases preserve uncertainty or clear private history. They cannot authenticate native source admission.
- `tests/e2e/product-behaviours.spec.mjs`: `live ordinary comment is confirmed by its source identity without continuation` performs a real write when opted in; do not run it again on #258. `live ordinary comment recovery confirms the existing source result without resending` checks the exact historical comment and zero prepare/submit. Uncertain-recovery cases prove unknown preservation, not confirmed publication.
- There is no complete live Refine → needs-info → ordinary comment → Continue → Propose test in that suite. Use the operator's exact retained connected-source receipts and manual supported UI observations for Q1–Q4; do not claim fixture success closes this gap or add automation under this proposal.

On a separately authorized capable host, use `npm run test:browser -- tests/browser/issue.spec.mjs tests/browser/attention.spec.mjs` for controlled presentation checks and the repository's `npm run verify:dotnet` lane for integration tests. The .NET lane needs host/container capabilities; no Docker-in-Docker workaround is allowed. Record exact command, run ID, revision, completed exit status and asserted outcomes. Do not run the live suite merely to gather existing receipts: its sign-in fixture reads private development realm credentials and is not an authorized mechanism for this engine. A trusted operator may use the already authenticated preview and supported recovery controls without exporting credentials. Any later harness execution needs its own permitted credential-custody boundary.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

### 5. Keep evidence narrow and versioned

Record the actual tested application revision separately from this planning revision. The manifest selects Lighthouse CLI `0.13.18`, SDLC `0.25.1`, ProductShape CLI `0.26.1` and OpenSpec `1.15.0`; these do not prove the preview's deployed/bundled versions. The host product report uses `@prodshape/core` `0.25.0`, serialization `v1alpha2`, baseline digest `2c9ad047058991f1668c5e975b30827f99b49d4b217bf2177f6c50c47f5977f1`. Individual artifacts retain their recorded draft status within the repository-designated accepted baseline.

For later external test evidence, use the installed provider's `evidence verify --help` and closed schema, emit `pdac-verification-evidence/v1alpha1`, retain provider-generated FR/QR citations, and run `prodshape evidence verify <evidence.json> --format json`. Record completed diagnostics and citation status, not just exit status. The verification-evidence format and model serialization are separate versions. Preserve failed tests and stale historical citations; obtain a new run if applicability changes. Do not recast historical evidence with a new digest.

Visual collection covers 1280px desktop and 390px narrow layouts in light/dark, system appearance behavior, keyboard-only traversal, visible focus, labels, no horizontal overflow, reduced motion and confirmation/result placement beside the invoking editor. Compare safe post-authentication captures against `docs/design/DESIGN.md` and `docs/design/control-center.md`; use `npm run test:visual` and the affected browser checks on the later host. Disabled controls or screenshots alone do not prove connected effects. Do not click Confirm to manufacture a screenshot. Retain only sanitized post-authentication images; no login capture, automatic failure screenshot, trace, HAR, video, cookies, credential material or protected journal contents. Phone rehearsal remains waived and production unqualified.

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Interfaces and data effects

No interface or data-model change. Evidence uses existing issue/attention views, current controls facts and supported receipt/reconcile operations. The application retains its own protected state and source checks; the plan requires no raw storage access. Later ordinary receipt refreshes may update application-owned receipts through supported APIs, but cannot create a new source write. The only repository artifacts proposed now are this change's documents and metadata.

## Risks / Trade-offs

- Missing old request, question-state or resumed-run receipts → retain explicit gaps; do not select a nearby run or replay actions. Connected qualification remains incomplete until proven.
- Preview revision or bundled SDK differs from source → record both; stop the affected check without deployment or upgrade.
- Capacity remains unavailable despite the owner's recovery report → preserve safe admission failure; no cleanup, retention edits or second send.
- Manual evidence is less repeatable than new automation → use scenario IDs, exact identities and operation counts; automation is a separate future decision.
- Current reports differ from historical plan citations → use current payloads for this candidate; leave old outcomes intact and report stale applicability separately.
- Live negative-case manufacture could alter authority or work → use isolated tests and naturally observable states only; no credential revocation, protections changes or conflicting live work.

## Migration Plan

None: no deployment, schema migration or application rollback is needed. The publisher validates the candidate and opens a proposal PR. An owner may accept, request revisions or decline it. Declining this plan changes no source action and must not delete retained journals, tombstones or historical evidence.

## Definition of Done

For this proposal: three Markdown artifacts and no-spec metadata form a complete bounded candidate, all ACs have tasks, current citations are retained and host strict validation is required before publication. Passing `planned` grants no acceptance.

For later qualification: Q1–Q7 each have exact proof or a plainly recorded unresolved result, executed checks retain command/status/revisions, required visual review and sanitized evidence validation are complete, and owner juangcarmona records the actual acceptance decision on the parent completion record. Incomplete checks remain incomplete and cannot support a full qualification claim. No parent issue closes automatically.

## Open Questions

No unresolved product or scope decision blocks this proposal: the environment is selected and phone rehearsal waived. Actual deployed revision, historical receipt availability, suitable recovery event and the parent's canonical evidence location are operational facts for the qualification operator to establish. A restart or additional source write, if needed, requires explicit separate authorization; this plan does not supply it.
