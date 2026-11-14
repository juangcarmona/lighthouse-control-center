---
pdac-scope: cited
---

# Actions usage observations

## Why

Operators need to inspect Actions time and storage without mistaking execution intervals for a bill. The owner authorized this first read-only slice on #159 and existing PR #200, superseding the earlier implementation hold.

## What Changes

- Add explicit repository storage and exact-run-attempt job reads to Health.
- Show bytes, job intervals, coverage, observation times and fixed GitHub source links.
- Keep billing unsupported without separately verified account billing authority and attribution; unknown never becomes zero.
- Exclude expired artifacts from active listed bytes while exposing their count. Mark retained failed-refresh samples stale.
- Keep runner inventory, writes, host/provider cost estimates and historical comparisons outside this increment.

## Capabilities

### New Capabilities

- `actions-usage`: Bounded, source-qualified Actions duration and storage inspection, separate from billing.

### Modified Capabilities

None. The existing `factory-overview` describes the latest-run overview, not storage or completed job intervals; its identity and authority contracts remain unchanged.

## Impact

Reuse the authenticated Workspace source transport, repository permission checks and Health presentation. Add a query adapter and focused source/browser tests; no dependencies, permission expansion, persistence or source mutations.

This implements the existing applied `chg-authenticated-operations-001` and `chg-lcc-evolution-001` intent, not a Product Change. Product dependencies are FR-PROJECT-HEALTH, FR-RUNTIME-HEALTH and BR-EXPLAINABLE-SIGNALS.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

Impact traversal checked UC-INSPECT-PROJECT-SIGNAL, runtime observations and source authority. Configuration drift, interventions, capacity defaults and provider administration are neighbours left unchanged: no baseline, threshold, action or resource allocation is introduced. #54 supplies the existing Health detail; #57 inventory remains separate. Connected-user acceptance, independent host checks, forge CI and owner visual publication acceptance follow this candidate and are not claimed here.
