---
id: BR-PROVIDER-OPERATIONS
type: business-rule
title: Authorize and verify each infrastructure change
status: draft
applies-to:
- BC-RUNTIME-OPERATIONS
- UC-MAINTAIN-RUNTIME
uses-terms:
- TERM-RUNTIME-OPERATION
- TERM-RUNTIME-PROVIDER
---

## Rule

Every runtime administration request MUST name the target, capability, parameters, actor, grant, expected current state and impact. Control Center MUST enforce least privilege, explicit confirmation, durable audit and fresh authorization; the provider MUST enforce its own authority and limits. Unknown occupancy or authority MUST block destructive maintenance. Uncertain outcomes MUST be reconciled before any retry; actual provider state, not acknowledgement alone, establishes completion. Infrastructure changes MUST NOT authorize Lighthouse stages or bypass repository gates.

## Rationale

Infrastructure control is a product responsibility with a different authority boundary from repository delivery.

## Examples

A drain stops new admissions only through a provider-supported drain mechanism and waits for confirmed existing work to finish. An idle-service restart requires a fresh occupancy check and post-restart provider evidence. Unsupported drain is unavailable, never an instruction to kill a runner.

## Exceptions

None. Later automation requires an explicitly accepted provider policy; observing a condition cannot create that authority.
