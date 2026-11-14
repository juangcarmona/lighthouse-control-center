# Proposal

<!-- pdac-scope: cited -->

## Why

An operator cannot explain a repository's Lighthouse adoption and one issue's handoffs from one cited view. The passed refinement for [#158](https://github.com/juangcarmona/lighthouse-control-center/issues/158) authorizes a bounded first increment that exposes available facts without inventing history or delivery acceptance.

## What Changes

- Add a repository adoption disclosure using existing committed facts, exact revisions, source paths, discovery times and separately labeled declared, installed, observed-run and current-policy categories. Missing categories and comparison baselines remain unknown.
- Open one selected issue's source-cited history from its repository context, reusing the issue reader and optional evidence collection. Keep workflow execution, validated results, PRs, reviews, merge and later verification distinct.
- Show dated source events chronologically and undated evidence separately, with observation time, selected window, pages and unknown gaps. Deduplicate exact events, not retries or distinct observations.
- Explain individually sourced questions and decisions separately from protected approvals. Publish no aggregate intervention count, autonomy percentage or inferred wait duration.
- Preserve source authority, bounded reads, inert text, safe links, keyboard access and compact light/dark desktop/narrow layouts. No breaking interface change is intended.

## Capabilities

### New Capabilities

- `lighthouse-adoption`: inspect categorized repository adoption evidence and explicit comparison context.
- `issue-history`: inspect the available source-associated history of one selected issue without inferred transitions or acceptance.

### Modified Capabilities

None. `factory-overview` remains the bounded operational overview; `delivery-verification` remains engineering toolchain acceptance. Active `issue-context` (#50) and `runtime-inventory` (#57) proposals retain ownership of their readers. These new contracts add explanation rather than copying their requirements.

## Impact

Workspace source/runtime projections and plain browser repository/issue presentation; .NET source tests, Node projection tests, Playwright/browser/visual cases, and operator documentation. Reuse #53 discovery ownership, #50/#99 source associations and #54 presentation conventions; #56 remains the later accepted-outcome dependency. Juan García Carmona coordinates these dependencies. No package, framework, service, database, background ingestion, workflow or product-model change is proposed.

The exact available producer is `HostInventory.observation.adoptions[]`, containing `repository`, `revision`, `collectedAt`, `declaredCli`, `lockedCli`, `sdlcVersion`, `workflowRef`, `sourceUrl`, availability and completeness. This is committed evidence, not installed evidence. No dedicated #53 installed/policy/baseline receipt is supplied by this checkout; the initial selected baseline is explicitly unavailable. This is an intentional supported state, not a discovery replacement.

## Product grounding and scope

Impacted accepted artifacts are FR-CONFIGURATION-DRIFT, FR-PROJECT-HEALTH, FR-DELIVERY-EVIDENCE and BR-EXPLAINABLE-SIGNALS; source security and mobile quality remain binding. Prepared inspect/impact reports identify neighboring source authority, human decisions, delivery/run terms, project workspace, retention and runtime operations. Their source ownership is preserved. Provider administration, scheduling, costs, production deployment and historical metric ingestion are excluded.

<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

No product-definition drift is proposed. `docs/product/README.md` identifies model/ as the accepted baseline despite artifact draft metadata; the active access-continuity and structured-behaviour Product Changes are not approval for this candidate. Cohort durations, intervention rates and complete mission/delivery history remain follow-on requirements with #50/#54/#56, not satisfied criteria.

## Review boundary

The verified owner answers authorize implementation of this first slice in one draft PR, with no additional independent technical review required. The recovery authorization permits only the seven named test paths to change; other frozen inputs remain unchanged. Actual connected-user and visual qualification are not established by fixtures. Cohort analytics, deployment, publication acceptance and merge remain outside this implementation.
