---
pdac-scope: cited
---

# Proposal

## Why

An admitted Control Center operator needs to investigate a project signal by inspecting its source and calculation, not guessing from workflow success or absent telemetry. GH-54-S1 provides one bounded resource measurement while making missing evidence explicit.

Let an admitted operator investigate one execution's reported output-token usage through its definition, contributing records and explicit evidence gaps, without treating it as overall project health.

## What Changes

- Show delivery, harness/workflow adoption, quality and resource-consumption families, with unavailable reasons for unsupported producers.
- Explain reported OpenCode output tokens for one exact execution: definition, calculation, identities, unit, times, counts, coverage, applicability and limitations.
- Add authorized drill-down through a narrow normalized-telemetry artifact/member contract after existing reader prerequisites; the current application does not ingest these measurements.
- Distinguish incomplete coverage, stale evidence, unavailable values and evidenced non-applicability. Null never becomes zero.
- Retain the full issue #54 decomposition. S2 adds accepted delivery/adoption/quality producers; S3 adds defined retained comparisons. Neither is delivered by S1. No composite score, thresholds, billing, production-health, human-effort or trend claim is introduced.

## Capabilities

### New Capabilities

- `project-health-resource-signal`: explain exact-execution resource measurements, family availability and authorized contributing evidence.

### Modified Capabilities

None. `factory-overview` remains the bounded workflow/issue observer; `github-user-connection` remains the source-authority contract. Their requirements are preserved, not copied into a competing capability.

## Impact

### Product authority and impact

This delivery consumes CHG-LCC-EVOLUTION-001's applied baseline, accepted through #126 according to verified owner context. Individual model files still say draft; this proposal grants no new approval and changes no product files. No product-definition drift is identified.

The impacted semantic sources are FR-PROJECT-HEALTH for supported families and claim limits, UC-INSPECT-PROJECT-SIGNAL for inspection, TERM-HEALTH-MEASUREMENT for metadata, and BR-EXPLAINABLE-SIGNALS for evidence states.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

BR-LAN-PRIVILEGE-BOUNDARY governs the retained authenticated source boundary.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

Host-prepared impact reports connect these sources to ACT-OPERATOR and BC-ENGINEERING-HEALTH. Checked neighbours include delivery evidence, project/work identities, capacity and GitHub authority, runtime operations and configuration drift. S1 does not change their definitions: delivery and adoption belong to S2, comparison/retention policy to S3, and provider administration is excluded. Existing authorization semantics remain unchanged.

### Source and implementation boundary

The read-only main checkout has bounded GitHub observations, not the issue-reader handlers assembled through #112/#103/#105/#111 in #100 on `feat/50-issue-workspace`, candidate `eb9d51a7bb7bd883b97b139d57c9553d8f51d8e4`. That candidate identity is owner-supplied context, not a fresh merge receipt. Reuse it after default-branch integration and source/product acceptance; do not rebuild it from this older checkout.

Owner-supplied candidate evidence limits IssueEvidence to input/result artifacts and the bridge to request/envelope/result JSON members. Artifact inventory alone cannot read normalized telemetry. S1 extends that reader narrowly under #57 coordination; it adds no arbitrary archive browser, operator CLI fallback, native traces, prompts or OpenCode logs.

Expected impact is within the existing Workspace source/query boundary, its accepted bridge, browser signal presentation and their tests. No new service, database, provider dependency, orchestration or credential path is needed. ADR-0006/0007/0009 remain authoritative; proposed ADR-0010 is not accepted by this plan.

### Candidate evidence and dependencies

The candidate pins SDLC `0.22.4`, CLI `0.12.65`, schema v1 and Lighthouse revision `879c4e75efebd945f8aea5b8ee09b97db62edbea`; see design.md for the immutable calculation references. One owner-reported #53 execution has 13,746 output tokens and null billed cost. It is not fresh collection, ongoing ingestion, a passed #53 stage or population evidence; that workflow's validation/publication failed.

- D-52: LCC maintainer coordinates #52/#100 integration and source-scope acceptance; reuse configured identity.
- D-57: LCC maintainer coordinates #57 reader contract, provenance, collection/retention evidence and separate acceptance. Inventory is not ingestion.
- D-shared: Lighthouse shared-contract maintainer owns calculation semantics; LCC maintainer coordinates adoption. Package version alone is not a calculation definition.
- D-53 and D-56: accepted adoption/delivery producers are later S2 dependencies; draft proposals #147/#148 are not implementation. Quality also needs a supported shared producer definition.
- D-hold: maintainer retains `future` and separately decides implementation sequencing. S1 has no slice predecessors, but all applicable external prerequisites still gate implementation.

This is a planned candidate for owner review, not accepted design, implementation, integration or release. Validation and Definition of Done are in design.md and dependency-ordered tasks.md.
