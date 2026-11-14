---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation and specs/runtime-provider-discovery/spec.md for behavior. `main` at `d24953debaab37dfedf7745add1b47dae538a6d7` contains Identity and Source code. RepositoryAccess.cs demonstrates configured-repository admission, current connection/generation checks, effective user/app permission intersection and bounded enumeration. Its installation/repository page limits are permission-discovery limits, not evidence of #57 inventory budgets. The local inventory handlers are absent from that main revision but already assembled in PR #100's feature candidate at `eb9d51a7bb7bd883b97b139d57c9553d8f51d8e4`; their exact bounds and source acceptance must be revalidated before the new adapter uses them.

Accepted ADR-0006 preserves independent repository delivery. Proposed ADR-0010 and building-block view section 05 describe the candidate provider boundary; neither is treated as accepted implementation authority. Product CHG-LCC-EVOLUTION-001 is applied; its #126 integration is supplied host provenance.

## Goals / Non-Goals

**Goals:** a small internal read boundary, lossless evidence projection, scoped identities and shared conformance tests for one real adapter plus two deterministic platform doubles.

**Non-Goals:** operation preparation/submission, a durable operation journal, administrative grants, new collectors, host probes, telemetry ingestion, production Kubernetes/VMSS adapters or a UI redesign. No new deployment unit, dependency or database is needed.

## Decisions

### 1. Wrap the accepted reader inside Workspace

Propose internal immutable records and cancellable asynchronous discovery/inventory reads under a Runtime provider area of the existing Workspace module. Keep handlers internal/sealed and retain compiler-enforced module boundaries. After #57 is integrated and accepted, the local implementation delegates to its existing readers and maps their results; GitHub remains a read source, not owner of a host. The provider registry contains only explicitly configured instances and exposes no arbitrary endpoint/discovery input.

Alternative: a separate service/plugin host would add deployment and credential boundaries without helping this slice. Rebuilding the #57 collector from scratch would duplicate work already assembled in PR #100 and invalidate the reuse estimate. Do neither. Revalidate the feature-candidate handlers, budgets and acceptance after PR #100 is integrated to `main`; material incompatibility returns this proposal for revision.
<!-- pdac:cite id="BC-RUNTIME-OPERATIONS" digest="sha256:07a2f3d2b6f5a25d22deda174fe9c35169d65a8a02ddfb15ef8658c2fe1c9144" -->

### 2. Separate resource identity from presentation and correlation

Use a configured stable provider-instance key and a structured resource key comprising provider instance, entity kind, source namespace/scope and source ID. Preserve the source ID separately for audit and joins; use structured encoding rather than ambiguous string concatenation. A rename changes display data only. A resource without stable source identity remains an explicitly uncorrelated observation, not an invented name-based entity.

Typed edges carry both scoped endpoints and source provenance. Existing job/execution IDs are references, not replacement identities. Contradictory IDs produce a limitation, not a preferred guessed join. Configuration may declare a stable host/pool identity but does not establish a runner-host or runtime-model relationship without evidence.

Alternative: names, labels or hostnames are simpler but collide and imply relationships that the sources have not established. Global provider-local IDs likewise fail across instances.
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->

### 3. Version discovery independently and expose no command surface

Use initial contract version 1 with independent capability versions for inventory, telemetry and operation discovery. A descriptor contains support state, target kinds, resource scope, limitations and any declared parameter/grant/confirmation/consistency/outcome constraints. Unknown metadata is not permissive metadata. Unsupported versions return an explicit result rather than silent downgrade.

The local adapter advertises only the reads actually present in the accepted baseline. Telemetry remains unsupported if no producer exists. Start, drain, restart and scaling remain explicitly unsupported. Describe operations without adding prepare, submit or retry methods, routes, credentials or helper installation. Synthetic asynchronous records live in test doubles only; no production reconciler or sender is added.

Alternative: one provider version or a generic execute method hides capability differences and creates accidental authority. Full administration belongs to separately authorized #118 work.
<!-- pdac:cite id="FR-RUNTIME-PROVIDER-OPERATIONS" digest="sha256:59e7f1eb588e54c5d52773b7a30e5384e0d6b0eb8bb6ff5c1c625382a3a3ad05" -->

### 4. Keep evidence dimensions orthogonal

A page carries entities, typed relationships, provider/scope, source metadata, observed-at, collection bounds, completeness, continuation and limitations. Each observation retains its source time/revision where present; mixed sources never acquire a fabricated common source time. Availability distinguishes available, denied, unsupported, failed and unavailable; completeness and freshness are separate fields. Missing measurements use explicit unknown/null with a reason, not zero.

Delegate pagination to the accepted reader. Wrap continuation in a scope-bound token or existing validated handle; never accept a source-supplied URL as an authenticated destination. Bind it to provider, query/resource scope and current source connection. No aggregation loop may exceed the existing reader's budgets. Capture exact page/item/byte/time/process limits from integrated #57 in the preservation map, rather than inventing larger defaults here. Permission checks still precede any baseline cache reuse; do not add a global provider cache.

Alternative: a single status/health flag or eagerly flattened complete list loses partial and stale evidence and encourages unbounded reads.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

### 5. Validate state semantics with shared test doubles

A table-driven conformance suite accepts the same discovery/page/result shapes from local fixtures, a Kubernetes double and a VMSS double. Platform-specific state remains labeled: desiredReplicas versus readyReplicas; requestedCapacity versus provisionedInstances. No derived usable-capacity total is introduced. Synthetic outcome observations include source operation identity, source/observation times, state and optional actual-state evidence.

Tests read accepted/pending/uncertain/failed/completed sequences without any submit mechanism. Completion is not independent verification. Alternative: real cloud adapters would require credentials, operational authorization and deployment evidence outside this estimate; generic capacity alone would conceal important differences.
<!-- pdac:cite id="QR-PROVIDER-EXTENSIBILITY" digest="sha256:060c4af7c05abe49f1c348cc68e1e54715a8174acf42928f9ba5d43b477164bf" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:24fdf64ce66a09fa35b21d0cbf75b7e38235f289cefdb30c1849981cc14f55fa" -->

## Interfaces and Data Effects

Logical requests are Discover(provider, requested versions, authorized scope) and ReadInventory(provider, scope, bounded continuation, cancellation). Results carry explicit evidence state, never exception text or credentials as public data. These are design-level signatures, not a promised public SDK or new HTTP route. Existing inventory consumers receive compatibility projections through their accepted query path. No persisted schema or source-side data changes; session invalidation and restart semantics remain unchanged.

The adapter adds no process command. Any bounded process observation included in #57, if accepted and integrated, remains owned by that reader, not reimplemented as shell execution. No arbitrary path, source URL or privilege input is accepted by the new boundary.

## Risks / Trade-offs

- Prerequisite API or source acceptance differs → developer maps the #57/#105 implementation already assembled in PR #100 and its negative tests after main integration; maintainer reviews any material plan change. The five-point estimate assumes this reuse.
- Identity confusion → structured scoped keys, rename/collision tests and source-established edges.
- Authority leakage through cached pages → preserve live session/connection checks and test disconnect/reconnect during reads.
- Unknown measurements presented as capacity → explicit unknowns and divergent-count doubles.
- Descriptor expansion into administration → no production operation method, command route, helper or cloud client; independent security review inspects the actual candidate.
- Doubles mistaken for deployment proof → evidence catalog labels contract-only and actual-local cases separately.

## Migration Plan

1. Before implementation, obtain the maintainer's proposal decision and ADR-0010 decision, integrate/reconcile #57/#105 and freeze the source-preservation map. Keep `future` until explicit implementation release. These are entry gates, not approvals supplied by this document.
2. Land contract and conformance tests, then adapt existing readers without changing their externally consumed results. Bind exact source files after prerequisite integration.
3. Add platform doubles and run preservation/integration checks on the actual candidate. No cloud deployment is involved.
4. If a regression occurs, revert only this increment through normal review to the existing #57 projection after its own integration and acceptance; no database rollback, provider command or resource migration is needed. Repository workflows remain independent throughout.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

## Validation and Evidence Plan

Each slice lands its own tests and contract documentation. Cover identity collisions/renames, positive and contradictory joins, version/support combinations, stale/partial/denied/unavailable/failed reads, page and budget boundaries, unsafe path fixtures, scope-confused continuations and mid-read authority loss. Reuse existing SourceRequestGateTests, owner/session tests and the #57 candidate preservation suite after main integration and source acceptance. Negative tests use controlled fixtures; no host probing or privileged infrastructure testing is required.

Retain `npm run verify` and configured exact-candidate CI, including strict OpenSpec/citation checks and module-boundary checks, in the supported delivery environment. This proposal engine runs none of those checks; the publisher validates artifacts separately. Independent review must assess contract consistency, safe reads and absence of mutation/privilege expansion.

An authorized local operator supplies safe actual configured-local inventory evidence with source IDs, source/observation times, scope and limitations. Keep private paths/configuration and credentials out of reports. The maintainer accepts that evidence; platform doubles cannot replace it.

No new visual surface is planned. If compatibility work changes inventory rendering, retain safe screenshots at desktop and 390px in light/dark themes, textual unknown/unsupported/partial states, keyboard focus and refresh/authority-loss results. Otherwise record unchanged presentation and existing browser regression receipts; viewport checks do not establish physical-phone acceptance.

## Definition of Done

AC1-AC7 are demonstrated; all tracked tasks are completed or explicitly re-scoped through review; the implementation matches the owner-reviewed plan and accepted architecture; documentation and citations are current; configured checks and exact-head CI pass; independent security/contract review and actual-local evidence are retained. Acceptance and merge remain explicit later decisions. No enterprise, production platform or full telemetry readiness is inferred.
