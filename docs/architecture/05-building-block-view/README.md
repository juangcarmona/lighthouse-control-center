---
title: Building block view
arc42-section: "05"
description: The static decomposition of the system into building blocks.
---

# 05. Implemented application blocks

| Building block | Responsibility | Source |
| --- | --- | --- |
| Web entrypoint | HTTPS application, safe hosting/logging and module composition | [SoFa.Web](../../../src/SoFa.Web/Program.cs) |
| Workspace module | Protected account/observation routes, owner admission, process-local sessions and explicit GitHub connection | [Module entrypoint](../../../src/SoFa.Modules.Workspace/WorkspaceModule.cs) |
| Source query adapters | Effective user/app permission checks, bounded/coalesced observations and account-status projection | [Source adapters](../../../src/SoFa.Modules.Workspace/Source/) |
| Browser presentation | Source-keyed observations, account states and removal of data after authority loss | [Browser assets](../../../src/web/public/) |
| Development composition | Workspace plus isolated identity container; external mode omits the provider | [AppHost composition](../../../src/SoFa.AppHost/WorkspaceComposition.cs) |
| Historical observation CLI | Explicit operator-authorized GitHub reads outside the web application | [Legacy collector](../../../src/observation/github.mjs) |

The workspace module is an application library, not an independently deployed service. Its query handlers are internal and sealed; compiler checks enforce module boundaries. Session/source mechanisms have one canonical explanation in [section 08](../08-crosscutting-concepts/README.md). The AppHost does not reference or start the retained execution runtime.

<!-- pdac:cite id="BC-EXECUTION" digest="sha256:a12712bab0b780d1a2132400bed82c4cca7c3ceeb187911dde55366d6581821e" -->

## Issue reader and remaining target blocks

The issue reader now implements bounded conversation pages and optional source-associated stage/PR/check summaries in the Workspace module. Its [query](../../../src/SoFa.Modules.Workspace/Source/GetIssueContextHandler.cs), [evidence adapter](../../../src/SoFa.Modules.Workspace/Source/IssueEvidence.cs) and [shared contract bridge](../../../src/SoFa.Modules.Workspace/Source/SourceContract.cs) are implementation evidence; real connected-user acceptance and live reservation coverage remain open. Source command/capability adapters, a durable application command journal and broader signal projections remain target work. A future receipt reconciler observes exact source acknowledgments and does not schedule or automatically resubmit work. [ADR-0008](../09-architecture-decisions/0008-source-correlated-issue-commands.md) owns the proposed durability decision.

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->

## Proposed Control Center components

These are extensions under [Proposed ADR-0010](../09-architecture-decisions/0010-administer-independent-runtime-providers.md), not deployed components.

| Component | Reuse / proposed responsibility | External authority |
| --- | --- | --- |
| Workspace and session boundary | Reuse current OIDC, connected-user checks, source scopes, CSRF and safe browser assets | Configured identity provider |
| Fleet and mission queries | Reuse active #50/#52 handlers, normalize stable repository/issue identities and explained adoption facts | GitHub records and installed Lighthouse capability/verify evidence |
| Source command adapter | Reuse #48 SDK bridge and accepted journal design after candidate integration | Lighthouse public issue-control contract, actual connected GitHub user and repository admission |
| Provider registry and adapters | New capability-based interfaces around #57 reads; explicit provider instance and resource scope | Runtime provider identity/API and grants |
| Runtime command handler | New preview/confirm/intent/provider outcome flow with distinct grant | Provider limits, expected state and receipt |
| Evidence and health projections | Reuse source evidence, ingest public telemetry with cursors and retain defined historical samples | Source producer schema/version, exact run/revision, provider usage reports |

### Proposed provider contract

A language-neutral contract is specified here before selecting .NET interface signatures. Its owner is the provider adapter boundary; no shared Lighthouse lifecycle schema is copied.

| Contract element | Required semantics |
| --- | --- |
| Provider instance | Stable configured instance ID, kind, contract version, resource scope and supported capability versions; no credential value in projections |
| Inventory | Provider/pool/host/runner/runtime/model-provider entities have separate scoped IDs, source revision or ETag when available, source time, observed time, completeness/cursor and limitations |
| Relationships | Explicit typed edges such as pool-member, runner-host, job-runner, execution-runtime and runtime-model-provider; unknown edges remain absent; names/labels are not identity |
| Capabilities | Independently advertise inventory, telemetry, diagnostics, start-inactive-service, drain, maintenance, restart or set-capacity. Describe target kinds, parameter bounds, grant and confirmation needs, consistency and outcome support. Missing/unsupported capability cannot fall back to shell |
| Observe | Bounded paged reads; availability, completeness and freshness are independent. Report denied, unsupported, stale, failed and unavailable distinctly |
| Prepare operation | Exact provider/resource ID, command/capability version, validated parameters, expected revision/state, impact and required scope; read only |
| Confirm/submit | Explicit actor/grant, target/payload digest, short-lived confirmation and durable unique operation key; atomic send claim; fresh grant and expected-state recheck at provider boundary |
| Receipt/reconcile | Provider operation ID when available, immutable request/payload identity, source link, timestamps, actual state and outcome evidence. Accepted/pending/uncertain/failed/completed/independently-verified remain distinct |
| Retry/recovery | Capability declares provider idempotency and receipt lookup. Unknown response means reconcile without resending; unsupported lookup remains uncertain and needs operator investigation |
| Resource limits | Provider-enforced min/max capacity, permitted services and command bounds. LCC neither allocates jobs nor owns a scaling reconciliation loop |

A local host provider exposes one explicitly configured host/pool and wraps the reviewed registration/helper observations. A GitHub read adapter supplies source runner/job identity without pretending to own the host. Docker, Kubernetes/ARC and VMSS can expose additional inventory and asynchronous capacity operations. Model services are distinct from host administration; model diagnostics require declared endpoints and grants.

Contract probes must model Kubernetes desired-versus-ready replicas and VMSS requested capacity versus provisioned instances. Neither desired state nor HTTP success establishes usable capacity. This validates extensibility without implementing either platform.
