# Design

<!-- pdac-scope: cited -->

## Context

See `proposal.md` for motivation and product impact, and `specs/idea-promotion/spec.md` for observable requirements. This is a proposed delivery design, not an accepted architecture record.

Main's `src/SoFa.Modules.Workspace/WorkspaceModule.cs` composes owner/session gates, anti-CSRF-protected mutations, account and observation handlers. `Source/RepositoryAccess.cs` already checks connected-user repository access and issue-write grants and guards source requests against session/connection changes. Main has no idea routes or ControlJournal implementation. Architecture section 05 identifies those controls as target work. Owner evidence places reusable #48/#52 components in candidate #100, not main.

ADR-0006 preserves independent repository execution; ADR-0007 separates external identity and GitHub authorization; ADR-0009 selects .NET/Aspire. ADR-0008 is Proposed on main despite acceptance evidence in #48/#112: that existing delivery must reconcile it. No provider-operation architecture is needed for this journey.

The local idea belongs to BC-BACKLOG-TRIAGE until confirmed promotion; it is not a second authoritative issue tracker.
<!-- pdac:cite id="BC-BACKLOG-TRIAGE" digest="sha256:160cdf8ee19db65605e325d8fd6124250e06f820adc04eb5d257c3f89f68a8a4" -->
<!-- pdac:cite id="TERM-IDEA" digest="sha256:6c5c214cd1f93d9456f4430dc976458dd7f8c3cd973b89c26466327b235c2ca1" -->

## Goals / Non-Goals

**Goals:** Keep saved context independent of a browser tab; bind review to exact actor, target and content; reuse the integrated source boundary and shared journal; make confirmed and uncertain outcomes recoverable.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->

**Non-Goals:** Deliver #48/#52, accept ADR-0008, add a general conversation/agent service, create team-wide draft sharing, define production custody, or redesign lifecycle admission. Existing owner-only admission remains the first delivery boundary; no team source-write readiness is claimed.

## Decisions

### 1. Extend the integrated application store, not a new journal

After #48 integration and acceptance, add an owner-scoped idea record alongside its existing ControlJournal persistence. Reuse that store's migration, transaction and recovery machinery. Do not create a second command log or execution queue. If the integrated store cannot support the required atomic boundary, stop for a revised design rather than adding an alternate store.

Proposed data: opaque idea ID; admitted identity key (issuer/subject); outcome; scope; configured repository identity; issue title/body; draft revision; created/updated times; promotion status; reference to the existing journal operation; and confirmed repository/issue IDs, number and safe source URL when available. The journal owns request/receipt history; the draft stores only its reference and summary. Persist no access token, session ticket, authorization code or agent transcript. Every read/write checks owner scope; reconnecting a different GitHub account does not transfer draft ownership or permit a new send for an unresolved operation.
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

Retention proposal: saved editable drafts remain until the operator explicitly discards them; no timer silently deletes unsent context in this slice. Show the effective retention and storage limitations. Confirmed drafts become source-link summaries, not editable issue replicas. Discard may remove idea prose, but must preserve a minimal promotion binding/send fence under the accepted journal policy; unresolved receipts cannot expire into eligibility to create again. Never delete GitHub evidence. Store limits fail visibly before reporting a save successful. Protected storage, backup/custody and production retention approval remain deployment gates, not implied by this proposal.
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->

Alternatives: tab memory loses context; browser local storage puts sensitive idea prose outside the existing server boundary and is device-local; a separate database duplicates journal recovery and operational ownership. Reusing the accepted store couples delivery to #48 but avoids those forks.

### 2. Compose bounded discovery with explicit review

Use #52's integrated configured-repository/issue query interface. Search the selected repository using the proposed title and operator-adjustable terms; include open and closed issue candidates, exclude pull requests, and allow exact issue-number lookup. For this slice request at most two pages of 50 candidates per explicit query, with no background exhaustive crawl. Display the effective query, collected count, page limit, source/observation times and incomplete/unavailable states; retain an old result as stale after failure. These are proposed implementation bounds, not a product-wide performance objective or a guarantee of duplicate detection.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:4ebd9c84897af61f0fb570eaf7a91e17a230b13192f37d470f810cd1984e94f9" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

A review screen shows outcome/scope, exact target, connected actor, related-work result or limitation, create title/body or selected existing issue, and the effect: create/link only, no lifecycle request. Changing content, repository or actor invalidates review. A failed related query is not proof of no duplicates; the operator must see that limitation before deciding.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="UC-TRIAGE-BACKLOG" digest="sha256:0eaed6ca26d2e957f0eea2fbe207d6b201a0bb25708970f63d4f50c9703db9ac" -->

Alternative: automatic similarity linking is cheaper to operate but violates deliberate promotion and cannot establish identity. A global similarity service adds unnecessary infrastructure and scope.

### 3. Define a proposed owning source contract before enabling writes

The workspace source adapter is the application integration owner; the developer must identify and verify the actual supported owning create/link capability before implementation release. It is not asserted to be a Lighthouse issue command today. Extend/reuse #48's accepted adapter and ControlJournal facilities without copying Lighthouse policy or adding a new stage. If the owning capability is absent, dependent controls show unsupported; no raw HTTP, CLI, bot-token or shell fallback bypasses it.

The proposed contract requires: capability/version and target repository identity; connected actor; validated create payload or existing issue identity; explicit confirmation binding; an immutable unique operation key; source-supported correlation/receipt lookup; and typed confirmed, denied, unsupported, unavailable and uncertain outcomes with source times/links. Implementation entry requires evidence that the supported contract can realize these semantics. It must also establish that create/link does not admit lifecycle execution under the target policy; an issue-created automation that cannot preserve this boundary makes promotion unsupported, not implicitly authorized.
<!-- pdac:cite id="BR-WORK-AUTHORIZATION" digest="sha256:157f762cba7de8c5e40b42a8dfaa83c58e09032ddbebba67065a439ad1e487ce" -->
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->

Existing-issue linking is a local confirmed association after a fresh supported source read verifies repository/issue identity and excludes PR records; it sends no issue mutation. For this issue's conservative acceptance boundary, both create and link require the verified current actor and effective issue-write authority. Do not broaden grants or reinterpret read access as write permission. Reuse current authorization checks and connection-generation fencing immediately before the operation.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->

Alternatives: assume the current Refine/Propose contract supports create, or invoke GitHub independently to simulate it. Both hide missing ownership and bypass acceptance; neither is selected. Supporting the required capability remains a protected technical dependency, not a new tracking issue created by this proposal.

### 4. One promotion claim per idea; reconcile, never guess

Use an optimistic draft revision for edits and an atomic promotion claim in the existing journal transaction boundary. A short-lived server confirmation binds owner, GitHub user ID/connection generation, repository ID, draft revision, action and payload digest. Recheck live authority and target before consuming it. A uniqueness constraint on the idea's promotion claim fences concurrent create/link and old-tab submissions. A claimed operation cannot switch target or become a fresh operation merely because a response is missing.

Proposed state transitions:

| State | Permitted next step | Source effect |
| --- | --- | --- |
| Editable | Save, query, review, discard | None |
| Reviewed | Invalidate review or confirm with fresh checks | None until a send claim is durable |
| Claimed / possibly sent | Observe existing operation | At most the recorded send; no automatic resend |
| Denied before send | Explain, correct authority, review again | None |
| Uncertain | Read-only reconciliation / investigation | No resend or replacement promotion |
| Confirmed | Return stable source binding and open backlog context | No further create |

Persist the send claim before source submission. On crash before a send can be proved absent, treat it as possibly sent; safety takes precedence over automatic liveness. Commit confirmed identity and promotion binding atomically. A lost response or local commit failure enters uncertainty. Definitive pre-send denial can return to editing; a transport error after possible submission cannot.

The operation key alone is not GitHub idempotency. Reconciliation requires the owning source contract to recover an exact receipt/operation-to-issue association (including repository and payload/actor binding where supported). Do not invent a hidden-body marker, assume GitHub deduplicates create requests, or use title, newest issue or an empty search as proof. Source-correlated confirmation binds the original issue. Missing, ambiguous or inaccessible evidence leaves uncertainty visible with operation reference, last check and an investigation action; this slice provides no automatic retry after a possibly sent create. Any later safe retry mechanism requires authoritative non-creation/idempotency semantics and renewed review, not a local timeout.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

Alternative: retry on timeout improves apparent responsiveness but risks duplicate GitHub issues. An outbox sender or background retry queue creates the prohibited second coordinator. Reuse #48's read-only reconciliation mechanism instead.

### 5. Keep application interfaces narrow and source-backed

Proposed authenticated route families are `/workspace/ideas` and `/api/ideas`: list/get, explicit save/discard, related read, prepare review, confirm promotion and observe/reconcile the existing attempt. Final route names may follow integrated #48/#52 conventions without changing semantics. Mutations require existing anti-CSRF validation and owner/session checks; reads cannot submit work. Return revision and outcome codes plus safe human explanations, never tokens or raw upstream errors. Render source/draft text inertly and verify repository-bound HTTPS source links.

Map a confirmed binding into the existing backlog by source repository/issue IDs, not by draft title. Retain issue number and URL for inspection; a repository rename does not create a new logical issue. If the backlog read is delayed, show the confirmed link with a read limitation, not a fabricated row or another create. Never write derived priorities, stage labels or continuation commands during handoff.
<!-- pdac:cite id="FR-BACKLOG-PROJECTION" digest="sha256:b98f45997965ba4d187781ca782921eb8c98cb8a9877de2081d26d1e6e5a4d55" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

No assistance service is introduced. Show assistance as unsupported unless an independently supported capability exists; only then expose a separate explained action through its existing authorized entrypoint. Saving, candidate inspection, confirmation and source-link navigation never invoke that action.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-WORK-AUTHORIZATION" digest="sha256:157f762cba7de8c5e40b42a8dfaa83c58e09032ddbebba67065a439ad1e487ce" -->

### 6. Verify each slice and preserve evidence boundaries

The following VG labels are proposal-local verification groups, not invented original acceptance IDs.

| Original issue bullet | Local group and evidence | Tasks |
| --- | --- | --- |
| 1: retain outcome/scope/repository | VG-01: save, revisit/refresh, restart recovery and abandon with no source call | 2.1–2.3, 7.1 |
| 2: candidates and explicit choice | VG-02: bounded/failed/empty reads, reviewed payload and existing-issue link | 3.1–3.3, 4.2, 7.1 |
| 3: actor, authority, stable identity | VG-03: live grant, denial, actor/target drift, concurrency, repeat/refresh | 1.2, 4.1–4.3, 7.1 |
| 4: uncertain response | VG-04: lost response after actual create, exact correlation, unresolved case and no resend | 5.1–5.3, 7.1 |
| 5: optional explicit assistance | VG-05: no start on exploration; unsupported without fallback; explicit supported path if offered | 6.2–6.3, 7.1 |
| 6: confirmed backlog only | VG-06: real create/link, denied, abandoned and uncertain journeys with no implicit execution | 6.1, 6.3, 7.1–7.2 |

Add deterministic store/state tests and workspace HTTP integration tests under the existing .NET test profile (`tests/SoFa.Web.Tests` or the integrated controls test project); extend `tests/browser` for the flow. Verify CSRF, owner/session isolation, connection-generation races, stale review, missing grants, hostile content, pagination, duplicate submissions, crash windows and safe errors in the slice that introduces them. Doubles establish contract behavior, not actual source acceptance.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

After protected source authorization, demonstrate a real test-repository create, link, denial, abandoned draft and response loss after source creation. Retain redacted source IDs, candidate revision, operation association, relevant times and no-duplicate/no-execution observations. Run a separate unresolved-correlation journey. Do not test with production work or acquire credentials in the agent workspace.

Visual plan: capture the implemented saved draft, candidates/limitation, review/confirm, confirmed binding, denied state and unresolved recovery at desktop and 390px in both supported themes. Include long text, visible focus, keyboard-only completion and accessibility checks. Capture only safe post-authentication screens, never callback/consent/token content. Rehearse the applicable journey on an actual phone over the permitted network; browser screenshots are not device acceptance. Owner visual/security/source acceptance stays explicit.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->

## Risks / Trade-offs

- [Candidate-only prerequisites] → Keep #48/#52 integration and source acceptance as entry gates; do not transplant or reimplement their stack here.
- [No verified create correlation contract yet] → Require its supported owning capability before enabling writes. Failure to meet the proposed contract requires revised planning, not weaker matching.
- [Safety can leave an operation unresolved] → Preserve the fence and investigation context even if this delays promotion indefinitely; never trade correctness for timeout retry.
- [Durable prose increases sensitive local data] → Scope reads by admitted identity, exclude credentials/transcripts, document discard and protect the existing store; production custody is separate.
- [Bounded candidate reads miss related work] → Display limits and source query; selection remains an operator decision, not a duplicate-proof guarantee.
- [Authority/target drift] → Server-side fresh checks, versioned review and connection-generation binding; UI status alone never permits a send.
- [Layout checks overstate mobile acceptance] → Keep physical-device evidence separate and report any deferred acceptance explicitly.

## Migration Plan

1. Obtain owner proposal decision and retain `future` until #48/#52 and protected source gates are satisfied. Record exact integrated contracts/revisions and ADR-0008 reconciliation through their owners.
2. Add an additive versioned idea schema through the accepted application store's migrator; test old-store upgrade, restart and rollback compatibility. No GitHub data migration or new execution service is needed.
3. Deliver retained drafts, candidates/review, promotion, reconciliation and backlog handoff in dependency order, with tests and documentation in each slice. Keep source mutations unavailable until the full accepted contract and consented evidence exist.
4. Run repository checks and protected source/device review on the exact candidate. Definition of Done includes all six demonstrated conditions, finished tasks, tests, documentation, current citations, independent review, CI and recorded limitations. A proposal, double or successful HTTP response is insufficient.
5. Rollback disables new promotion and UI entry while preserving durable bindings and unresolved journal evidence for inspection/recovery. Never drop the store, clear a send fence, delete a GitHub issue or replay an operation as rollback. Repository delivery stays independent.

No unresolved product decision is invented. Source capability verification, architecture reconciliation and deployment custody remain explicit later acceptance gates with owners, not skipped design questions or claims of approval. Publisher-owned strict OpenSpec, citations and document lint are not run by this read-only engine.
