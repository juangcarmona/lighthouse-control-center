# Proposal

<!-- pdac-scope: cited -->

## Why

Issue #99 addresses ambiguous workflow evidence: a source run link does not distinguish its retry attempt or triggering event. Show those facts consistently without treating an observed retry as successful recovery.
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->

## What Changes

- Add source `run_attempt` and `event` to collected run evidence, serialized as `runAttempt` and `event` in both projections. Missing or malformed values become explicit nulls, displayed as unknown.
- Validate the exact numeric source value before accepting an attempt; raw `1.00000000000000001` must remain unknown even when floating-point parsing would round it to 1.
- Show both facts as inert text in every existing run card, retaining the existing run source link and repository/run identity.
- Add focused Node, .NET metadata and browser coverage and update README.md; preserve all existing assertions and evidence limits.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `factory-overview`: add source attempt/event observation requirements and consistent known/unknown presentation; keep its fourteen existing requirements intact.

This is observable behavior, so a delta is required; do not set `skip_specs`. The source-bound host inventory lists delivery-verification, factory-overview, github-user-connection, identity-environments and owner-access. The relevant factory-overview and github-user-connection specifications were read in full. No connection or identity requirements change.

## Impact

Implementation is limited to `src/observation/github.mjs`, `src/SoFa.Modules.Workspace/Source/GitHubObservations.cs` and `src/web/public/app.js`, with `src/web/public/app.css` and `src/web/public/index.html` only if needed for metadata text/layout. Documentation is limited to `README.md`; tests to `tests/observation.test.mjs`, `tests/browser/observation.spec.mjs` and metadata fixtures/assertions in `tests/SoFa.Web.Tests/GitHubAuthorizationTests.cs`. Planning stays under this issue-specific root.

Only additive .NET observation mapping is authorized. No new package, request, endpoint, persistence, migration, execution control or credential is needed. Preserve authentication, sessions, token transport, permissions, cache behavior and source guards. Do not change workflows, policies, packages, deployment, runtime administration or other verification inputs.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:9f39dd08a392db995a75f26c9a30ed4d4ec43f73ad0ccafbdfaa3d0eabc1528a" -->

Repository execution remains independent of SoFa. Keep keyboard access, visible focus and mobile layout; this bounded change does not claim complete phone-journey acceptance.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

### Product impact and authority

Before drafting, compared #99 with the whole mounted product model and widened discovery using the host-prepared impact reports. The nine cited dependencies are FR-RECOVERABLE-EXECUTION, BR-RECOVERABLE-EXECUTION, BR-GITHUB-SOURCE, BR-EXPLAINABLE-SIGNALS, TERM-EXECUTION-RUN, CON-FACTORY-RUNTIME, BR-LAN-PRIVILEGE-BOUNDARY, QR-EXECUTION-SECURITY and QR-MOBILE-OPERATIONS. They ground the added observations and preserved boundaries; none is edited.

Checked direct/transitive neighbours and left out of delivery changes: UC-EXECUTE-WORK-UNIT and BC-EXECUTION retain their observation role; CON-TRUSTED-LAN and UC-ACCESS-FACTORY retain authenticated access; FR-RUNTIME-HEALTH, UC-MAINTAIN-RUNTIME and BC-RUNTIME-OPERATIONS gain no telemetry; FR-DELIVERY-EVIDENCE and BC-DELIVERY gain no delivery-verification feature; UC-SCHEDULE-WORK, FR-MULTI-PROJECT-SCHEDULING and BC-SCHEDULING gain no scheduling; FR-RETENTION-POLICY gains no retention feature. Work commands, authorization, human decisions, backlog, discovery, issue conversation, inbox, project signals and the wider journeys remain unchanged. Graph reachability is not permission to implement those neighbours.

Implements the already applied CHG-OBSERVE-REPOSITORY-WORKFLOWS-001 within ADR-0006 and the existing authenticated runtime view. No product-definition drift or new architecture decision is proposed. This does not complete #52/#57 or qualify parent #88.

### Completion boundary

See design.md and tasks.md for candidate checks. Completion requires focused regression evidence, unchanged safety assertions, complete admitted checks, current citations, independent native reviews, full trusted hosted CI, actual PR/head/merge and post-merge acceptance. Planning artifacts and prior failed runs are not delivery receipts.
