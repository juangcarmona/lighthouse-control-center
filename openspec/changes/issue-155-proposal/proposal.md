---
pdac-scope: cited
---

# Proposal

## Why

Operators can inspect repository activity but cannot navigate from fleet health to an explained source observation. Health makes existing evidence useful without implying unsupported coverage.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:69da1f100227df86cc26fdad78c38a336e38d039bdedc1c097a1b6a5f4e8dceb" -->

## What Changes

- Add shared Health navigation with fleet, project and workflow-signal drill-down.
- Explain exact source records, age, bounds and unsupported families; preserve denied and stale states.
- Keep refresh read-only and omit scores and trends without comparable history.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Capabilities

### New Capabilities

- `project-health`: Fleet-to-source navigation for explained health observations.

### Modified Capabilities

None. Existing factory-overview contracts remain unchanged.

## Impact

Native browser assets, authenticated page routes, additive tests and user documentation. No dependencies, collector, measurement policy, authentication or source API changes. Implements applied CHG-LCC-EVOLUTION-001 intent. The current checkout includes #100/#52 navigation, #99 observations and #57 inventory; their existing live-acceptance limits remain. #54 history is not needed for raw source verdicts.

Model inspection and structural impact covered FR-PROJECT-HEALTH, FR-RUNTIME-HEALTH, UC-INSPECT-PROJECT-SIGNAL, BR-EXPLAINABLE-SIGNALS, BR-GITHUB-SOURCE and QR-MOBILE-OPERATIONS. Neighbouring configuration drift, intervention resolution, provider administration and capacity enforcement remain unchanged. Owner visual acceptance and connected-source rehearsal remain explicit.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->
