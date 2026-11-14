---
pdac-scope: cited
---

# Proposal

## Why

Operators need to distinguish runtime providers and their capabilities without confusing runner registration, host capacity or administrative authority. Issue [#117](https://github.com/juangcarmona/lighthouse-control-center/issues/117) supplies the bounded next increment after the existing #57 inventory is accepted and integrated.

## What Changes

- Introduce versioned read-only inventory, telemetry-discovery and operation-capability discovery within the current .NET application.
- Represent provider instances, pools, hosts, GitHub runners, agent runtimes and model providers with scoped identities; correlate jobs and executions only through established source IDs.
- Wrap the existing #57 local/GitHub inventory reads only after their integration and acceptance, without replacing their collectors or changing their permissions, budgets or evidence semantics.
- Exercise Kubernetes and VMSS contract doubles for divergent capacity counts, bounded pagination, unknown measurements, unsupported capabilities and asynchronous outcome observations.
- Document the contract, source-preservation map and separate real-local versus contract-only evidence. No breaking consumer change is intended.

This consumes applied CHG-LCC-EVOLUTION-001, not a new Product Change. It delivers discovery only, not the complete provider-operation requirement.
<!-- pdac:cite id="FR-RUNTIME-PROVIDER-OPERATIONS" digest="sha256:59e7f1eb588e54c5d52773b7a30e5384e0d6b0eb8bb6ff5c1c625382a3a3ad05" -->
<!-- pdac:cite id="QR-PROVIDER-EXTENSIBILITY" digest="sha256:060c4af7c05abe49f1c348cc68e1e54715a8174acf42928f9ba5d43b477164bf" -->

## Capabilities

### New Capabilities

- `runtime-provider-discovery`: read-only provider capability discovery, scoped inventory identity, provenance, completeness and provider-specific state semantics.

### Modified Capabilities

None. Existing `factory-overview`, `github-user-connection` and `owner-access` requirements remain preservation constraints. The inventory contains no existing runtime-provider capability. Other current specs cover identity environments, visual identity and delivery verification. Active #121/#123 change directories contain metadata only, not competing provider behavior.

## Impact

Reuse the Workspace module and its source/session boundary; add internal provider contracts and an observation adapter after #57/#105 integration. Add contract and adapter regression tests alongside the existing .NET web tests. Keep the current native browser presentation; adapt its existing inventory projection only if needed for compatibility. No new service, library dependency, database, credential, source mutation, telemetry producer or cloud deployment is selected.

### Product traceability

The affected context is infrastructure/runtime observation. Source-backed relationships and separate timestamps remain evidence, not proof of usable capacity.
<!-- pdac:cite id="BC-RUNTIME-OPERATIONS" digest="sha256:07a2f3d2b6f5a25d22deda174fe9c35169d65a8a02ddfb15ef8658c2fe1c9144" -->
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:24fdf64ce66a09fa35b21d0cbf75b7e38235f289cefdb30c1849981cc14f55fa" -->

Sign-in and configured registration grant no additional authority. Repository workflows keep delivery ownership.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

The supplied product impact reports connect this work to runtime maintenance, provider operations and deployment independence. Their administrative preview/confirmation/audit and production installation neighbors are deliberately deferred to #118/#120/#58; full telemetry and historical measurements remain #57 follow-ons. This proposal changes no accepted product artifact or mission/source-command semantics.

### Dependencies and authority

This is a proposal candidate, not accepted architecture or implementation. The maintainer must separately decide Proposed ADR-0010 and review this candidate. The current PR #100 feature candidate at `eb9d51a7bb7bd883b97b139d57c9553d8f51d8e4` already assembles the #57/#105 runner-inventory implementation, including the bounded local/GitHub handlers; those changes are not on `main` at `d24953debaab37dfedf7745add1b47dae538a6d7`, and #57 acceptance remains open. Reuse the candidate inventory after PR #100 integration and source acceptance; revalidate exact bounds and preservation tests before adapter work rather than rebuilding it. Dated roadmap PR states are not live integration evidence. If that baseline changes the contract or estimate materially, revise/re-refine instead of duplicating it here.

The `future` hold stays active until the maintainer explicitly releases implementation through Lighthouse. The five-point estimate remains conditional on reuse. No scheduler, administrative command, shell fallback, privileged web process, Docker socket, new telemetry collection or production platform adapter belongs to this increment.

### Completion

The proposal is complete when its specification, design and unchecked tasks are ready for owner review and publisher validation. Later implementation acceptance requires AC1-AC7 evidence, independent contract/security review, actual configured-local inventory observations and passing candidate verification/CI; doubles establish contract coverage only.

### Recovery provenance

Native proposal run `42587007894` produced a candidate artifact marked `planned`, but its strict-validation/publication job failed before the result was published. This operator-recovered copy is validated separately; the native run is not treated as a published or passed proposal.
