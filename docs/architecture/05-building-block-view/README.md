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

## Issue reader, discovery and remaining target blocks

The issue reader now implements bounded conversation pages and optional source-associated stage/PR/check summaries in the Workspace module. Its [query](../../../src/SoFa.Modules.Workspace/Source/GetIssueContextHandler.cs), [evidence adapter](../../../src/SoFa.Modules.Workspace/Source/IssueEvidence.cs) and [shared contract bridge](../../../src/SoFa.Modules.Workspace/Source/SourceContract.cs) are implementation evidence; real connected-user acceptance and live reservation coverage remain open. Source command/capability adapters, a durable application command journal and broader signal projections remain target work. A future receipt reconciler observes exact source acknowledgments and does not schedule or automatically resubmit work. [ADR-0008](../09-architecture-decisions/0008-source-correlated-issue-commands.md) owns the proposed durability decision.

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:11f4c196c15675fa20c05bb320f02a2bab4bdbf96cf275a408c849924faed270" -->

## Implemented discovery projection

The [factory query](../../../src/SoFa.Modules.Workspace/Source/GetFactoryPageHandler.cs) reuses current repository authority and atomic request admission for fixed metadata and ordinary-issue reads. It returns bounded explicit pages or an exact-number result, connection scope, coverage and separate configured/observed branch facts. The [browser view](../../../src/web/public/factory.js) uses one predicate for list/state-board views and preserves shared issue identities; evidence reads reuse #50. No database, source mutation or new execution component is introduced. Actual connected-user acceptance remains open.

## Implemented runtime inventory adapter

The [runtime queries](../../../src/SoFa.Modules.Workspace/Runtime/) coordinate owner-gated host observations and connected-user repository-runner reads. The [bounded tokenless helper](../../../src/workspace-tools/runtime-inventory.mjs) reads selected registration metadata and committed adoption through a private object view; it creates no execution worker, supervisor or journal. The [browser projection](../../../src/web/public/runtime.js) correlates repository-scoped identities and preserves unknown or conflicting observations. Source/read lifetime and authority belong to [section 08](../08-crosscutting-concepts/README.md); operational configuration belongs to the [runbook](../../runbooks/runtime-inventory.md).

<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
