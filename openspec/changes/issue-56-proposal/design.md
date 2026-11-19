---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation. Current `IssueEvidence` follows at most ten source reports and ten explicit PR links from a consumed conversation page, with fresh authority checks, a twenty-second read budget and connection-generation guards. `RelatedPullRequests` reads PR-head checks and optional reviews; #158 history already projects merge metadata. Existing inert issue/conversation rendering supplies proposal text and source report inspection.

The installed tuple is Lighthouse CLI 0.13.13, public SDLC SDK 0.24.2, and the separately pinned workflow manifest (not assumed identical to the SDK). The selected SDK has typed Refine/Propose, Comment and Continue, not Implement/Integrate/Review. No later-stage request may be approximated using labels, a comment or a local eligibility policy.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:f2639559cb8742b8f4642d3a5a3b5031b5b1bded58778bbc499067f44abd4ae5" -->

## Goals / Non-Goals

**Goals:** Inspect a merged PR's exact commit, its checks, bounded matching push executions and artifact metadata. Make every claim's missing authority visible.

**Non-Goals:** No verified-delivery aggregate, approval engine, automatic merge, new executor, arbitrary URL fetch, proposal archive downloader, retention expansion or permission change. Existing incomplete actual-source acceptance is not repaired by fixtures.

## Decisions

1. Extend the existing partial evidence handler, not a new route or service. Reuse `GitHubTransport`, its 2 MiB JSON bound and live request guard. A confirmed merge requires `merged: true`, a valid merged timestamp and a forty-hex commit; GitHub's unmerged `merge_commit_sha` can be a test merge and is not an integration. Keep base and default branch facts distinct. Alternative: treat any merge SHA as integrated; rejected as false evidence.
2. Read check runs by the returned exact commit. Preserve individual `head_sha`, ID, times and safe source link; label exact, stale or unknown bindings. Do not infer required-check applicability from a green inventory. Alternative: newest branch checks; rejected because squash/rebase and branch advancement separate head A, result C and later tip D.
3. Read at most ten workflow executions filtered by exact commit and target default branch. Retain at most three valid repository-bound push runs and their first hundred artifact records, without downloading artifacts. Validate run revision, branch and event after the source filter. Missing, expired and partial inventories remain explicit; inventory shape is not artifact provenance. No successful workflow is promoted to accepted delivery.
4. Reuse native disclosures and existing compact styling. Separate head checks/reviews from integration and source details. Keep required human decisions, verification applicability and deployment explicitly unestablished. Explain unavailable later-stage actions even when shared observation fails; add no submit control for them.
5. Preserve all shared commands and their original receipt identities unchanged. A stale head cannot trigger a later-stage effect because none is exposed. Existing shared preparation, confirmation, revalidation and reconciliation remain owned by #48, not this projection.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->

## Verification and product traceability

The six issue bullets are not assigned invented acceptance IDs. Focused HTTP tests cover squash C versus head A, stale row B, later branch D, failed/absent checks, unmerged test SHA, missing/expired artifacts, bounds and source loss. Browser tests cover distinct revisions, human-gate limits, unavailable actions, inert source strings, keyboard focus, narrow/desktop light/dark rendering and no mutation. Existing suites cover history, uncertain receipts and session isolation.

The current PDaC serialization is v1alpha2; ProductShape is 0.26.1. `prodshape context` supplies current FR-DELIVERY-EVIDENCE, UC-VERIFY-DELIVERY, FR-EVIDENCE-CORRELATION and command/human-boundary citations. The model has no structured-behaviour or lifecycle definitions for this read-only projection: no SB or transition evidence is invented. Tests trace to the FR/UC and rules instead. Evidence metadata is observational, not a new domain state machine.

Run the policy's installation, `CI=true npm run verify:container`, and strict implementation-plan check. Also run focused .NET/browser tests, `npm run test:visual`, strict spec validation and product citations. Retain completed managed receipts and screenshots under `/output/evidence/`. Real connected-source acceptance must later inspect an existing authorized issue → proposal/report → PR/head → explicit decision → integrated SHA → matching post-integration checks/artifacts through the connected-user path. Record IDs, attempts, revisions, source/observation times and unavailable facts; never manufacture a merge or use fixtures as that proof.
<!-- pdac:cite id="UC-VERIFY-DELIVERY" digest="sha256:804087739b1dfabebcd5932c70a85b2204501bbfa1a9b99360be1d3e548a0be9" -->
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:99c64fb08f86f57409dbdf736e0922e68b036071f8df6faefc24a7ea8ba91829" -->

## Risks / Trade-offs

- [Twenty-second budget may omit dependent reads] → Return unavailable/partial evidence; do not increase grants or infer absence.
- [Checks may lack revision or policy applicability] → Show unknown binding; never declare verified integration.
- [Actual-source and visual acceptance are not available in a credential-free worker] → Preserve them explicitly for the responsible operator/owner, with reviewable code and controlled evidence.
- [Historical proposal is broader than this increment] → Retain provenance and deferred scope, rather than checking off the old full-chain tasks.

## Migration Plan

No migration or durable state change. Publish the additive candidate for review, run independent exact-head checks, then integrate only through authorized source workflow. Rollback removes the additive reader/presentation; existing command receipts and independent execution are untouched.
