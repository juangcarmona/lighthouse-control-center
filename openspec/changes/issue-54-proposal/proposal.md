---
pdac-scope: cited
---

# Proposal

## Why

An operator needs to understand a project's evidence before deciding what to investigate. The existing Health route exposes workflow results, but not a supported resource measurement or comparable history.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## What Changes

- Show reported OpenCode output tokens for one exact GitHub Actions run and attempt when its retained telemetry artifact matches the run and repository.
- Read the existing `lighthouse-<workflowRunId>-<attempt>` artifact on demand; validate its usage summary and adjacent telemetry correlation records before displaying a value.
- Keep other resource families, delivery/adoption/quality signals and historical comparisons pending under #54; this slice does not close the parent issue.
- Keep missing or incompatible evidence unknown; do not infer cost, billing, provider usage, health or success.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

The owner authorized this exact read-only slice in the [existing PR #214 decision](https://github.com/juangcarmona/lighthouse-control-center/pull/214#issuecomment-6874864694). The existing telemetry producer and artifact retention are reused. This change does not install a producer, add a credential path, expose a general artifact browser or claim #54 complete.

## Capabilities

### New Capabilities

- `project-health-resource-signal`: explain a supported exact-execution resource measurement, its evidence gaps and source scope.

### Modified Capabilities

None. `factory-overview` covers bounded workflow observations and `delivery-verification` covers delivery evidence; neither defines the proposed resource measurement. Their existing requirements remain unchanged.

The in-flight #155 `project-health` delta owns navigation and workflow-source presentation. Reuse that existing Health surface; this resource capability does not duplicate its navigation requirements.

## Impact

The change touches the .NET Workspace source reader and the existing `/workspace/health` run detail. It reads only the named artifact from the exact connected-user-authorized run attempt. No new service, credential path, provider administration or external metrics platform is added. Frozen checks, source contracts and ProductShape files remain unchanged.

Each measurement exposes purpose, unit, definition/version, execution window, source identities, observation times, coverage, applicability and limitations.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->

### Source and prerequisite evidence

- Owner decision: one read-only output-token measure for one exact workflow run and attempt, using `evidence/host/telemetry-usage.json` plus adjacent `evidence/host/telemetry.jsonl` from `lighthouse-<workflowRunId>-<attempt>`.
- Accepted summary fields: `schemaVersion: 1`, `source: opencode-native`, `coverage: observed`, and numeric `tokens.outputTokens`. Every telemetry record must bind the same repository, issue, revision, workflow run, attempt and non-empty session ID.
- The existing artifact producer retains the artifact for 14 days. Reads are on demand, bounded, authenticated and read-only. No artifact or telemetry is persisted by Control Center.
- The prior #52/#57 holds are resolved only for this exact member and projection by the owner decision above; they do not authorize general artifact access or other signal families.
- D-53 / #53 and D-56 / #56: later adoption/delivery producer dependencies. #156–#159 and #179/#180 retain their separate source contracts and reviews.
- D-hold: the current request authorizes this implementation assessment, not label changes, acceptance, publication approval or release. Historical proposal/feature-branch merges are not presumed accepted on main.

Reads require current connected-user Actions-read authority and clear private values if that identity or authority changes.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

### Product and architecture impact

This consumes CHG-LCC-EVOLUTION-001's applied model without changing its metadata or intent. ProductShape inspect/impact and generated citations are retained in evidence. Relevant artifacts are FR-PROJECT-HEALTH, TERM-HEALTH-MEASUREMENT, BR-EXPLAINABLE-SIGNALS, UC-INSPECT-PROJECT-SIGNAL and BR-GITHUB-SOURCE. Their current `draft` metadata is preserved; this plan is not a new ProductShape approval.

Checked neighbors include BC-ENGINEERING-HEALTH and BR-CAPACITY-DEFAULTS: no execution/capacity policy is introduced. Delivery terms, configuration drift, intervention, work authorization and runtime-provider operations remain outside this slice. ADR-0006's independent execution and ADR-0009's .NET/Aspire boundary are preserved. No product-definition drift or new architecture acceptance is asserted.
