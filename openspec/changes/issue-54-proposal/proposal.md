---
pdac-scope: cited
---

# Proposal

## Why

An operator needs to understand a project's evidence before deciding what to investigate. The existing Health route exposes workflow results, but not a supported resource measurement or comparable history.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## What Changes

- Plan GH-54-S1: reported OpenCode output tokens for one exact execution, with source drill-down, independent coverage/freshness states and a four-family availability inventory.
- Define the reusable Health detail fields for downstream producers without admitting unreviewed producer contracts.
- Preserve GH-54-S2 (delivery, adoption and quality verdicts) and GH-54-S3 (retained history and comparable trends) as later work under #54, not new issues.
- Keep unavailable values unknown; no composite score, thresholds, inferred billing, human attention or production-health claims.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

Implementation is blocked on accepted source-reader prerequisites. This candidate contains planning artifacts only; it does not broaden artifact access, install telemetry, implement a producer or claim #54 complete. The current authorized implementation request supersedes historical stage instructions, but supplies no evidence that the protected reader decisions were accepted.

## Capabilities

### New Capabilities

- `project-health-resource-signal`: explain a supported exact-execution resource measurement, its evidence gaps and source scope.

### Modified Capabilities

None. `factory-overview` covers bounded workflow observations and `delivery-verification` covers delivery evidence; neither defines the proposed resource measurement. Their existing requirements remain unchanged.

The in-flight #155 `project-health` delta owns navigation and workflow-source presentation. Reuse that existing Health surface; this resource capability does not duplicate its navigation requirements.

## Impact

Future implementation touches the .NET Workspace source reader, its bounded archive bridge and the existing `/workspace/health` presentation. No new service, credential path, provider administration or external metrics platform is proposed. Frozen checks, source contracts and product files remain unchanged.

Each measurement exposes purpose, unit, definition/version, execution window, source identities, observation times, coverage, applicability and limitations.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->

### Source and prerequisite evidence

- Candidate definition: Lighthouse commit `879c4e75efebd945f8aea5b8ee09b97db62edbea`, SDLC `0.22.4`, CLI `0.12.65`; see the immutable calculation link in design.md. No dependency upgrade is proposed.
- `IssueEvidence.cs` admits only `input` and `result` artifacts. `issue-control-read.mjs` admits only `request.json`, `envelope.json` and `result.json`. Artifact inventory is not telemetry-member access.
- D-52 / #52: maintainer must establish source-reader acceptance. Existing configured-repository code is reused, not rebuilt.
- D-57 / #57: maintainer must resolve authorized normalized telemetry ingestion, provenance, retention and collection evidence before reader implementation.
- D-shared: shared-contract maintainer owns definitions. The pinned token candidate does not establish accepted LCC integration.
- D-53 / #53 and D-56 / #56: later adoption/delivery producer dependencies. #156–#159 and #179/#180 retain their separate source contracts and reviews.
- D-hold: the current request authorizes this implementation assessment, not label changes, acceptance, publication approval or release. Historical proposal/feature-branch merges are not presumed accepted on main.

All future reads retain connected-user repository authority and clearing on authority loss.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

### Product and architecture impact

This consumes CHG-LCC-EVOLUTION-001's applied model without changing its metadata or intent. ProductShape inspect/impact and generated citations are retained in evidence. Relevant artifacts are FR-PROJECT-HEALTH, TERM-HEALTH-MEASUREMENT, BR-EXPLAINABLE-SIGNALS, UC-INSPECT-PROJECT-SIGNAL and BR-GITHUB-SOURCE. Their current `draft` metadata is preserved; this plan is not a new approval.

Checked neighbors include BC-ENGINEERING-HEALTH and BR-CAPACITY-DEFAULTS: no execution/capacity policy is introduced. Delivery terms, configuration drift, intervention, work authorization and runtime-provider operations remain outside S1. ADR-0006's independent execution and ADR-0009's .NET/Aspire boundary are preserved. No product-definition drift or new architecture acceptance is asserted.
