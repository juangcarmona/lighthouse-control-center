---
pdac-scope: cited
---

# Proposal

## Why

An admitted Control Center operator needs to investigate a project signal by inspecting its source and calculation, not guessing from workflow success or absent telemetry. GH-54-S1 provides one bounded resource measurement while making missing evidence explicit.

Let an admitted operator investigate one execution's reported output-token usage through its definition, contributing records and explicit evidence gaps, without treating it as overall project health.

## What Changes

- Show one read-only OpenCode output-token value for an exact GitHub Actions run and attempt.
- Read the existing retained Lighthouse artifact through the connected user's Actions permission. Check its usage summary and adjacent records against the selected repository, issue, revision, run, attempt and session.
- Show the source, run/attempt and observation time. Missing, expired, partial, unsupported or mismatched evidence stays unknown.
- Keep other metric families, history and comparisons under #54 for separate decisions and work. This slice adds no general artifact browser, telemetry storage, billing inference, composite score, threshold or delivery-health claim.

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

The owner authorized this exact slice in [PR #214](https://github.com/juangcarmona/lighthouse-control-center/pull/214#issuecomment-6874864694) and identified the existing telemetry artifact, supported summary fields, correlation records and 14-day retention. The implementation remains in draft PR #214 for exact-head checks and review. PR #100 is merged and the owner accepted #52; they are not pending gates for this slice.

The reader uses only the named artifact members, checks current connected-user Actions-read authority and requires exact repository, revision, run and attempt correlation. It does not install telemetry, persist it, expose a general artifact browser, or broaden credentials. Other sources and shared Health history/detail semantics remain separate #54 work; this proposal does not approve those future slices.

The change stays within the existing Workspace source/query and Health presentation boundaries. It adds no service, database, provider dependency, orchestration or credential path. ADR-0006/0007/0009 remain authoritative; proposed ADR-0010 is not accepted by this plan.

The checks and review for this proposal establish that it matches the owner's decision. They do not accept or merge the implementation. Exact-head CI, review, integration and later parent work remain separate.
