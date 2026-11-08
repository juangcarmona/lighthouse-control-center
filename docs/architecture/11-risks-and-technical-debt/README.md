---
title: Risks and technical debt
arc42-section: "11"
description: Known risks, technical debt, and their planned responses.
---

# 11. Remaining limitations

The current observer reads only the latest twenty runs and the first hundred open issue records per repository. It is not a complete audit and does not verify artifact contents. The authenticated development boundary and source-read adapters are implemented; the issue reader and factory discovery are implemented with bounded source reads, but actual connected-user issue/discovery acceptance and active reservation coverage remain open. Source command controls remain future work. The installed router admits the owner and supports Refine, Propose, Implement, Integrate and Review entry under stage-specific evidence and gate checks. Runner loss may leave a reservation requiring operator reconciliation. Legacy execution code remains opt-in for rollback and must not regain product authority.

<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->

See [ADR-0006](../09-architecture-decisions/0006-observe-repository-owned-workflows.md) for the accepted boundary and superseded design.

## Delivery risks and owners

| Risk | Owning work |
| --- | --- |
| The owner confirmed desktop GitHub connection/operations for49; issue/discovery acceptance remains open and phone rehearsal was owner-deferred | Record actual source proof per delivery; never infer device/command acceptance from fixtures |
| Process-memory development state is lost on restart | Fresh identity login and source relinking; production persistence/custody remain release work |
| Source dispatch receipt received versus response lost | Command journal plus Lighthouse correlation/deduplication contract; no time-based matching |
| Ordinary comments may resume needs-info or invalidate task digest | Lighthouse explicit intent contract; UI pre-submit effect explanation |
| Installed contract differs from source/latest documentation | Pin and test the adopted package; incompatibility is explicit |
| OAuth/App user permission differs from router actor | Real user-token dispatch/comment test before claiming authorization |
| Cached capabilities become stale before admission | Server refresh and source admission recheck; no optimistic approval |
| Incomplete collector hides issues or evidence | Paginated query adapter with coverage and unavailable states |
| Health data is partial or not comparable | Inspectable source definitions and no invented values/scores |
| Development host exposes real operational credentials | Test credentials locally; protected production boundary per ADR-0007 |
| Protected journal or key ring lost/corrupted | Controls fail closed; restore the paired private backup and reconcile, never automatically resend |

Issue #47's refined request now has a blocked proposal report identifying identity/deployment and exact correlation. Owner decisions address identity direction; shared/source receipt behavior still needs implementation evidence. Legacy issue #16 describes the superseded supervisor and must not be treated as a dependency of this operational backlog. Its history and closure decision are preserved.

## LCC evolution risks and decisions still gated

| Risk | Response / owning work |
| --- | --- |
| Active workspace stack mistaken for accepted main | Preserve #100/#112/#103/#105/#111 heads and acceptance limits; integrate only through existing delivery |
| #50 automatic correction budget silently reset | Preserve exhausted gate; this product mission grants no extra round or acceptance |
| Old roadmap restores the superseded supervisor | Historical roadmap entrypoints now lead to the LCC roadmap; #16 is not an execution dependency |
| Runtime control recreates delivery orchestration | Proposed ADR-0010 preserves ADR-0006; providers enforce resources, GitHub assigns jobs |
| Owner-only implementation presented as enterprise access | New scoped-access work and upstream actor compatibility required; no widened owner admission in this increment |
| Provider read-to-write race harms a job | No disruptive command until provider-enforced quiescence/fencing; initial write limited to starting an inactive allowlisted service |
| Repository rename invalidates receipts or source pins | Stable repository IDs, preserved old aliases/historical bytes and explicit source-contract compatibility test before rename |
| Namespace/brand change invalidates data protection | Preserve old purpose/application strings and journal marker until a tested migration/rollback exists |
| Telemetry mistaken for billing or delivery | Source coverage, independent receipts, provider cost records and confirmed deployment semantics required |
| More infrastructure than actual need | One application; defer broker/new database/scaling loop; add bounded storage only for a defined history requirement |

The [assessment](../../roadmap/lighthouse-control-center-assessment.md) is the dated implementation snapshot. Production identity, secret custody, backup/restore and multi-user/provider authorization remain independently verifiable work under #58 and the linked LCC increments.
