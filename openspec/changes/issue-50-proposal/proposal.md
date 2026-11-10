# Read one complete issue workspace

<!-- pdac-scope: cited -->

## Why

The operations overview cannot explain an ordinary issue, a long conversation or a blocked proposal. The signed-in owner needs that context inside SoFa before deciding what to request.

## What Changes

- Add an authenticated issue view and read API, reached by repository/number or an observed issue.
- Read the complete issue body and conversation through explicit bounded pages, with source IDs, times and incomplete/unavailable states.
- Present source-backed lifecycle reports, dispatches, reservations, related PRs/checks and bounded artifact summaries separately from GitHub workflow status. Preserve association and revision evidence; never select a run by recency.
- Retain stale context after temporary errors and erase it after authority loss or account changes.

## Capabilities

### New Capabilities

- `issue-context`: paginated source context and independently identified lifecycle evidence.

### Modified Capabilities

None. This implements the read/query part of accepted CHG-AUTHENTICATED-OPERATIONS-001. Existing owner admission and GitHub user authority remain #49.

## Impact

The existing .NET Workspace source adapter and browser assets gain an issue reader. No workflow, execution controller, source mutation, credential fallback or durable command journal is introduced. Commands stay #47/#48; inbox and boards reuse this view under #51/#52. The PR is stacked on #84 until that dependency passes its own gate.

## Product impact and drift

The unchanged full product baseline reviewed for #49 remains authoritative. Direct dependencies and the expanded FR-ISSUE-CONTEXT graph identify the artifacts cited below. TERM-WORK-UNIT, TERM-WORK-COMMAND, TERM-EXECUTION-RUN and TERM-DELIVERY-EVIDENCE distinguish displayed facts; ACT-FACTORY-OWNER and BC-BACKLOG-TRIAGE provide context. Execution, scheduling and production identity neighbours are inspected and unchanged. No product-definition drift is proposed.

Issue: <https://github.com/juangcarmona/sofa/issues/50>.

## Product grounding

<!-- pdac:cite id="UC-OPERATE-ISSUE" digest="sha256:125cec42bb77d281e22920ae2b491eb2f43afe7dfd5f0a700fd289842af11d62" -->

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->

<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
