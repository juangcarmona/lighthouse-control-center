---
id: FR-RUNTIME-PROVIDER-OPERATIONS
type: functional-requirement
title: Administer supported provider resources
status: draft
derived-from:
- UC-MAINTAIN-RUNTIME
- BR-PROVIDER-OPERATIONS
- CON-DEPLOYMENT-INDEPENDENCE
uses-terms:
- TERM-RUNTIME-PROVIDER
- TERM-RUNTIME-POOL
- TERM-RUNTIME-OPERATION
verification:
- scenario: An authorized idle-resource operation is confirmed by a provider read after its receipt; denied, busy, stale, unsupported and uncertain
    cases cause no unconfirmed retry.
- scenario: A local provider and contract doubles for Kubernetes and VM scale sets express different capabilities and asynchronous outcomes without
    changing mission semantics.
---

## Requirement

Control Center MUST discover provider capabilities and expose inventory and permitted runtime pool operations through explicit authority boundaries. Safe drain, maintenance, service recovery and bounded scaling MUST be offered only when the selected provider supports and enforces them. Every command MUST preserve identity, expected state, authorization, confirmation, audit, limits and actual provider outcome. Provider credentials MUST remain outside agent workspaces and browsers.

## Rationale

Operators need to act on infrastructure without moving repository orchestration into the application.
