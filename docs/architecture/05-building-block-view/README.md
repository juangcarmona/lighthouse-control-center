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

The issue reader implements bounded conversation pages and optional source-associated stage/PR/check summaries. Its [query](../../../src/SoFa.Modules.Workspace/Source/GetIssueContextHandler.cs), [evidence adapter](../../../src/SoFa.Modules.Workspace/Source/IssueEvidence.cs) and [offline validator](../../../src/SoFa.Modules.Workspace/Source/SourceContract.cs) are implementation evidence. The #48 read-only development checkpoint adds a [shared source reader](../../../src/SoFa.Modules.Workspace/Source/GetIssueControlsHandler.cs) through a fixed tokenless [Node bridge](../../../src/SoFa.Modules.Workspace/Source/SourceControlBridge.cs); credentials and HTTP initiation remain in the .NET adapter. Public compatible SDK adoption and actual connected App-user acceptance remain open; the selected older package reports its missing export as unsupported. Source-write controls and a durable journal remain target work. [ADR-0008](../09-architecture-decisions/0008-source-correlated-issue-commands.md) remains Proposed and owns the durability decision.

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:11f4c196c15675fa20c05bb320f02a2bab4bdbf96cf275a408c849924faed270" -->
