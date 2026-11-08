# Proposal

<!-- pdac-scope: cited -->

## Why

Issue #99 addresses retry confusion: the overview links a workflow run without showing its source attempt or triggering event. Exposing these facts makes collected evidence inspectable without implying successful recovery.
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->

## What Changes

- Add nullable `runAttempt` and `event` source facts to each collected run in the CLI snapshot and supported authenticated .NET snapshot. Validate attempts from exact source numbers before precision is lost; missing or malformed evidence stays unknown.
- Show `Source attempt` and `Triggering event` as inert text in every existing run card, retaining its existing source link and identity.
- Add focused Node, .NET projection and browser cases, including raw JSON `1.00000000000000001`, and document the fields and evidence limits in `README.md`.
- Preserve all existing grouping, timestamps, filtering, stale/unavailable handling, accessibility and authority/session behavior. No breaking removal, additional source request or dependency is planned.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `factory-overview`: add requirements for exact source attempts, triggering events and consistent read-only metadata presentation. Existing requirements remain unchanged; the delta uses ADDED requirements within this existing capability.

The trusted-host inventory in `context.proposal.discovery` identifies this exact capability path. Full baseline scenarios were read; `github-user-connection` was also read and remains unchanged. These are observable additions, so `skip_specs` does not apply.

## Impact

The minimum implementation touches `src/observation/github.mjs`, `src/SoFa.Modules.Workspace/Source/GitHubObservations.cs`, `src/web/public/app.js`, `README.md`, and the three admitted test files. Change `app.css` or `index.html` only if the added text requires layout or explanatory markup; no redesign. Planning artifacts stay under `openspec/changes/issue-99-proposal`. No endpoint, storage, package, workflow, policy, credential, deployment or runtime-administration change is needed.

### Product dependencies and neighbour assessment

Before drafting, the whole mounted product model was compared with this issue. Host-prepared inspect/impact reports widened these dependencies; canonical model files remain untouched:

- `FR-RECOVERABLE-EXECUTION` and `BR-RECOVERABLE-EXECUTION`, cited above: source evidence, exposed absence and retry versus recovery.
- `TERM-EXECUTION-RUN`: a source-identified attempt, not a replacement run identity.
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->
- `BR-GITHUB-SOURCE`: GitHub retains ownership of run facts, timestamps and limitations.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
- `CON-FACTORY-RUNTIME`: observation remains optional and cannot acquire execution authority.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

Direct/transitive neighbours checked but left unchanged include `UC-EXECUTE-WORK-UNIT`, `BC-EXECUTION`, `TERM-WORK-UNIT`, `CON-TRUSTED-LAN`, `BR-LAN-PRIVILEGE-BOUNDARY`, `BR-WORK-AUTHORIZATION`, `BR-HUMAN-DECISION-BOUNDARIES`, `QR-EXECUTION-SECURITY`, `QR-EXECUTION-RECOVERY` and `QR-MOBILE-OPERATIONS`: this slice neither implements new controls nor changes their boundaries. `FR-RUNTIME-HEALTH`, `UC-MAINTAIN-RUNTIME`, `BR-CAPACITY-DEFAULTS`, `BR-SCHEDULER-SAFETY`, `FR-MULTI-PROJECT-SCHEDULING`, `FR-RETENTION-POLICY`, `FR-DELIVERY-EVIDENCE` and the discovery/backlog/issue-operation neighbours remain outside this metadata addition; no health, scheduling, retention, command or delivery-verification capability is added. Existing overview safety requirements remain binding rather than being redefined here.

### Product definition drift

None identified: this delivery slice realizes existing intent, not altered product meaning. No new Product Change, baseline approval or architecture decision is asserted. ADR-0006 and the implemented building-block view retain the separate CLI and authenticated observation paths. This does not complete #52, #57 or parent #88.
