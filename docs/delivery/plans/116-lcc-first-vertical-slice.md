# #116 first vertical slice: operate one real mission through existing source controls

Tracking: [#116](https://github.com/juangcarmona/sofa/issues/116). Implementation owners remain [#50](https://github.com/juangcarmona/sofa/issues/50), [#47/#48](https://github.com/juangcarmona/sofa/issues/48) and their existing OpenSpec/PRs. This plan reconciles an already implemented candidate journey; it does not introduce another execution path or claim final acceptance.

## Outcome and scope

An authenticated operator opens an ordinary configured issue, reads its conversation and current Lighthouse evidence, explicitly requests eligible Refine or Propose, sees the exact source acknowledgement and worker attempt, and reads the confirmed result or reason it remains blocked. An ordinary comment is shown as conversation; Continue is a separate action for an authenticated pending question. LCC can be closed while admitted work continues.

The smallest source journey uses direct issue entry and existing overview navigation. Full fleet registration, the intervention inbox, runtime provider commands, analytics and LCC namespace/branding changes are not prerequisites. #52/#51 can subsequently feed the same issue reader. This path already fits accepted product intent and ADR-0006; the LCC Product Change expands future roles/providers without reopening accepted source behavior.

## Existing implementation to use

| Boundary | Candidate / evidence |
| --- | --- |
| Authentication and source permission | Merged #49/#84; existing `WorkspaceModule`, identity and `RepositoryAccess` handlers |
| Issue and conversation | #50 / PR #100; `openspec/changes/issue-50-proposal/`, `GetIssueContextHandler`, `IssueEvidence`, safe artifact reader and browser |
| Capability/prepare/confirm/reconcile | #48 / PR #112; its existing `openspec/changes/` issue-specific proposal, `SourceControlBridge`, `IssueControlCommands`, `SourceControlAccess` and protected `ControlJournal` |
| Authoritative operations | Installed public Lighthouse issue-control v1 in SDLC 0.22.0, exact adopted workflow pin, connected App-user transport and source admission |
| Existing acceptance evidence | `docs/delivery/evidence/issue-50/` and `issue-48/` on their candidates; retain fixture versus actual-source distinctions |

Use the exact PR heads in the [assessment](../../roadmap/lighthouse-control-center-assessment.md), then refresh live before working. The stack is already under delivery. Do not duplicate either proposal, change its write grant or start a fourth automatic #50 correction round.

## Ordered execution plan

1. Read the current issue/PR source, exact checks, remaining acceptance and independent review receipts. Confirm installed CLI/SDLC and workflow pin still match the reviewed candidate. Retain the owner-approved journal design; its status in main is not silently changed here.
2. Complete the connected-user reader gate for #50 with the existing allowed account/repository setup. Read an ordinary issue and paginated conversation, unavailable artifact, explicit stage outcome and active source reservation. Preserve current holds and obtain the required owner decision where the three-round budget is exhausted.
3. Complete #48 actual-user qualification against a deliberately selected test issue within current source authority. Review exact effect and user, submit once, retain request/router/worker/attempt IDs and resulting artifact. Verify a changed-state denial without dispatch and a repeated confirmation without duplicate effect.
4. Verify ordinary-comment behavior and explicit continuation of an actual supported pending question through the source contract. A posted comment, admitted worker or missing label does not establish question resolution. The source result must confirm it.
5. Exercise response-loss/reconnect/restart via the approved tests/provider rehearsal. Preserve the original intention; reconcile its exact identity. Do not deliberately create an uncontrolled duplicate operation on a real repository to manufacture a fault test.
6. Close/reopen the application after source admission and confirm the same workflow/result remains accessible. The repository executes without LCC. Distinguish stage result, PR, independent review, merge, post-merge checks and accepted delivery; this slice does not automatically request later stages.
7. Retain current responsive/keyboard/browser evidence. The owner has waived physical-phone rehearsal in the source issues; no new request for that test is introduced. Identify synthetic fixtures and device evidence separately.
8. Run affected deterministic tests and full existing checks on the exact candidate. Reuse source-independent verification and security probes; source success does not satisfy the application trust-boundary checks. Complete applicable Done review before integrating #100, then #112 through their existing paths. Refresh and retest each downstream stack member after its prerequisite integrates.

## Acceptance matrix

| Case | Evidence needed | Claim allowed |
| --- | --- | --- |
| Authenticated context | Actual issuer/session plus connected user and exact repository/issue/conversation records | Actor can read that scope; no action/merge permission implied |
| Eligible stage | Exact prepared intent, current source eligibility, source receipt, router and admitted worker attempt | Command was submitted/admitted; outcome remains pending until result |
| Blocked outcome | Completed source run with validated blocked result | Stage blocked; mission not delivered |
| Real result | Exact current artifact/stage receipt plus source-linked proposal or refinement | That stage produced that result; acceptance/later stages remain separate |
| Denied/cross-site/revoked/changed state | Direct server/source negative tests and no dependent effect | Boundary enforced for the tested scope |
| Duplicate/uncertain/restart | Atomic claim and source reconciliation retaining the original request | No silent resend; uncertainty persists until exact source proof |
| Comment versus Continue | Source comment ID and supported typed intent; matching pending question and result receipt | Conversation or explicit continuation, with source-only resolution |
| Independent delivery | Source workflow completes while application is closed | LCC is optional to this admitted execution |

## Repository Done dimensions

Acceptance criteria and implementation completeness require source/owner evidence. Tests must cover the actual shared boundaries; quality checks run `npm run verify` and configured CI on the current candidate. Security requires independent session/CSRF/source/journal probes and sanitized artifacts. Architecture must retain ADR-0006 and the approved #48 journal boundary. Documentation must reflect implemented state and limits. Product/spec consistency uses the accepted model and existing OpenSpec/provider citations. Evidence links exact heads and runs. Human review and all eleven configured dimensions remain applicable; known limitations include source capability support, bounded pagination/artifact retention, owner-only v1 actions and waived physical-device rehearsal.

Product acceptance, a green implementation, integration, production deployment and accepted mission delivery remain separately recorded. The slice is complete only when the real source chain and existing acceptance gates are satisfied; this preparation reports it as active candidate work.
