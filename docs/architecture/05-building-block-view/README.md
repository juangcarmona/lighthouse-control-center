---
title: Building block view
arc42-section: "05"
description: The static decomposition of the system into building blocks.
---

# 05. Implemented application blocks

| Building block | Responsibility | Source |
| --- | --- | --- |
| Web entrypoint | HTTPS application, safe hosting/logging and module composition | [SoFa.Web](../../../src/SoFa.Web/Program.cs) |
| Workspace module | Protected account/observation routes, owner admission, bounded sessions, protected credential persistence and separately verified GitHub connection | [Module entrypoint](../../../src/SoFa.Modules.Workspace/WorkspaceModule.cs) |
| Source query adapters | Effective user/app permission checks, bounded/coalesced observations and account-status projection | [Source adapters](../../../src/SoFa.Modules.Workspace/Source/) |
| Browser presentation | Source-keyed observations, account states and removal of data after authority loss | [Browser assets](../../../src/web/public/) |
| Development composition | Workspace plus isolated identity container; external mode omits the provider | [AppHost composition](../../../src/SoFa.AppHost/WorkspaceComposition.cs) |
| Historical observation CLI | Explicit operator-authorized GitHub reads outside the web application | [Legacy collector](../../../src/observation/github.mjs) |

The workspace module is an application library, not an independently deployed service. Its query handlers are internal and sealed; compiler checks enforce module boundaries. Session/source mechanisms have one canonical explanation in [section 08](../08-crosscutting-concepts/README.md). The AppHost does not reference or start the retained execution runtime.

<!-- pdac:cite id="BC-EXECUTION" digest="sha256:a12712bab0b780d1a2132400bed82c4cca7c3ceeb187911dde55366d6581821e" -->

## Issue reader, discovery and remaining target blocks

The issue reader implements bounded conversation pages and optional source-associated stage/PR/check summaries. Its [query](../../../src/SoFa.Modules.Workspace/Source/GetIssueContextHandler.cs), [evidence adapter](../../../src/SoFa.Modules.Workspace/Source/IssueEvidence.cs) and [offline validator](../../../src/SoFa.Modules.Workspace/Source/SourceContract.cs) are implementation evidence. The #48 candidate adds a [shared source reader](../../../src/SoFa.Modules.Workspace/Source/GetIssueControlsHandler.cs) through a fixed tokenless [Node bridge](../../../src/SoFa.Modules.Workspace/Source/SourceControlBridge.cs); credentials and HTTP initiation remain in the .NET adapter. Public SDK 0.22.0 is adopted. Explicit command handlers and the protected SQLite journal implement the single-instance design; actual connected App-user acceptance remains open. Source admission remains owned by Lighthouse. See [ADR-0008](../09-architecture-decisions/0008-source-correlated-issue-commands.md).

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->

## Implemented discovery projection

The [factory query](../../../src/SoFa.Modules.Workspace/Source/GetFactoryPageHandler.cs) reuses current repository authority and atomic request admission for fixed metadata and ordinary-issue reads. It returns bounded explicit pages or an exact-number result, connection scope, coverage and separate configured/observed branch facts. The [browser view](../../../src/web/public/factory.js) uses one predicate for list/state-board views and preserves shared issue identities; evidence reads reuse #50. No database, source mutation or new execution component is introduced. Actual connected-user acceptance remains open.

## Implemented runtime inventory adapter

The [runtime queries](../../../src/SoFa.Modules.Workspace/Runtime/) coordinate owner-gated host observations and connected-user repository-runner reads. The [bounded tokenless helper](../../../src/workspace-tools/runtime-inventory.mjs) reads selected registration metadata and committed adoption through a private object view; it creates no execution worker, supervisor or journal. The [browser projection](../../../src/web/public/runtime.js) correlates repository-scoped identities and preserves unknown or conflicting observations. Source/read lifetime and authority belong to [section 08](../08-crosscutting-concepts/README.md); operational configuration belongs to the [runbook](../../runbooks/runtime-inventory.md).

<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->

## Implemented coverage evidence

The [CI producer](../../../.github/workflows/verify.yml) publishes an optional attempt-named report for the explicitly scoped `SoFa.Web.Tests` run. The [coverage query](../../../src/SoFa.Modules.Workspace/Source/GetCoverageEvidenceHandler.cs) requires current Actions read authority, a complete artifact inventory and matching numeric repository identity, source commit, workflow run and attempt. Missing, expired, oversized or mismatched reports remain unknown; the coverage step does not change CI success. Health requests this evidence only for the selected project and links the exact source run.

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

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
