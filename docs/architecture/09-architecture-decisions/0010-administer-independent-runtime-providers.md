---
name: administer-independent-runtime-providers
description: Add scoped runtime-provider administration while preserving repository-owned delivery orchestration.
status: Proposed
date: 2026-11-08
deciders: []
tags: [control-plane, providers, authorization]
---

# ADR-0010: Administer independent runtime providers

## Context

The maintainer has decided to evolve the existing SoFa application into Lighthouse Control Center. Accepted ADR-0006 assigns delivery routing, concurrency, gates, publication and continuation to repository workflows using Lighthouse. It permits authenticated source actions and makes the application optional. Current identity is a .NET/Aspire workspace; open #57 inventory code reads local registrations and GitHub runner records. The accepted runtime product context is observation-only. The proposed Product Change explicitly adds separately authorized infrastructure operations and deployment-independent actors.

## Decision

We propose capability-based runtime-provider adapters inside the existing application boundary, with a separate administrative grant and provider-enforced operations. Keep four logical planes: product/delivery, control, execution and observability. These responsibilities do not create four services. Keep the .NET web application, Aspire composition, browser assets, OIDC and GitHub App connection. Reuse the existing inventory adapters and source-controlled issue journey.

A provider declares versioned inventory/telemetry/operation capabilities and stable scoped resource identities. GitHub runner, execution host, pool, agent runtime, model provider and execution remain separate entities. A local provider is the first actual deployment; Kubernetes and VM scale sets validate the contract using doubles before any production adapter is promised.

Repository commands continue through the installed Lighthouse public SDK and source entrypoints. Runtime commands require a separately scoped actor/grant, preview, current-state binding, explicit confirmation, atomic intent record, provider receipt and confirmed outcome. Unsupported operations are unavailable. Unknown or stale occupancy cannot authorize a disruptive operation; a GitHub busy read alone does not prevent a newly arriving job. The initial local write can start an allowlisted inactive service; safe restart/drain needs a provider primitive that fences new work and confirms quiescence. LCC does not invent that primitive by killing a process.

Provider adapters hold least-privilege credentials outside browser and agent workspaces. The web application receives no arbitrary shell, broad sudo or Docker socket. A reviewed narrow helper or authenticated provider API enforces an allowlist, target and expected-state checks. Asynchronous reconciliation reads provider state; it neither resends uncertain commands nor schedules repository jobs. A provider's existing elasticity controller retains its loop and limits.

ADR-0006 remains accepted and is extended, not superseded: its repository-delivery responsibility is unchanged. This record stays Proposed until maintainer acceptance. It does not accept ADR-0008's candidate journal changes or change its recorded status; its owner acceptance and integration are reconciled in the active #48 path.

## Alternatives considered

- Keep runtime permanently observation-only: fails the supplied product requirement for authorized infrastructure control.
- Restore the old SoFa supervisor/admission store: makes delivery depend on LCC and conflicts with ADR-0006.
- Expose shell/Docker administrative access from the web process: grants excessive authority and cannot prove target/effect boundaries.
- Start with Kubernetes, VMSS, an event broker and separate services: adds operational dependencies before a local provider proves the contract.
- Build an LCC scaling/job-assignment loop: duplicates provider elasticity and GitHub scheduling; explicit provider requests are sufficient.

## Consequences

The existing delivery path keeps operating when LCC is stopped. Infrastructure administration has a testable authority boundary and can evolve independently. Providers vary in capability and consistency, so the UI must expose unsupported, pending and uncertain outcomes. Durable audit and bounded observation retention add persistence requirements to review; no additional database is selected here. Strong quiescence and multi-user authorization require independent negative tests and real provider evidence. A local demonstration establishes no enterprise-readiness claim.

## References

- [Proposed product change](../../product/changes/completed/chg-lcc-evolution-001/change.md)
- [ADR-0006](0006-observe-repository-owned-workflows.md)
- [ADR-0007](0007-shared-identity-custody-and-recovery.md), [ADR-0008](0008-source-correlated-issue-commands.md), [ADR-0009](0009-dotnet-and-aspire.md)
- [Building blocks and provider contract](../05-building-block-view/README.md)
- [Runtime interactions](../06-runtime-view/README.md)
- [Assessment](../../roadmap/lighthouse-control-center-assessment.md) and [research](../../roadmap/lighthouse-control-center-research.md)
- [Tracking issue #116](https://github.com/juangcarmona/sofa/issues/116)
