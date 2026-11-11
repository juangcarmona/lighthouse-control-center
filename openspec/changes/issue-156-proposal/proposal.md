---
pdac-scope: cited
---

# Proposal

## Why

An operator cannot yet inspect a repository-produced coverage sample with trustworthy scope, age and compatible history. Issue #156 selects one coverage facet so missing reports and green CI are not mistaken for measured quality.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## What Changes

- Produce one bounded, versioned coverage summary in repository CI, with a named scope, explicit completeness and no coverage threshold.
- Add a read-only consumer that verifies current connected-user authority and source attribution before accepting a sample. A report's self-assertions cannot establish trust.
- Retain exact-attempt observations, duplicates and conflicts under explicit bounds; compare only compatible complete samples.
- Expose coverage, recent gaps, provenance and a textual history through the #54 Health detail. Other quality facets remain unavailable.
- Keep source expiry distinct from observation retention; never change or delete source evidence while reading it.
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->

## Capabilities

### New Capabilities

- `coverage-evidence`: source-backed scoped coverage production, authorized inspection, evidence states and comparable exact-attempt history.

### Modified Capabilities

None. Existing authenticated connection, operational overview, lifecycle evidence and visual identity requirements are preserved. The current flat spec inventory has no coverage capability.

## Impact

Repository CI, a producer/normalizer, Workspace source queries and a separate bounded observation store, the repository Health detail, source/unit/browser tests and operational documentation. No new web framework, execution service, scan-from-web path or mutation API. Storage and producer trust choices are candidate architecture, not current facts. Dependencies are #54's reviewed detail interface and the repository engineer's reviewed contract.

## Product impact and drift

The host evidence index and relevant inspect/impact reports identify FR-PROJECT-HEALTH, BR-EXPLAINABLE-SIGNALS and TERM-HEALTH-MEASUREMENT as the measurement boundary; BR-RETENTION-STANDARDS governs retained observations. UC-INSPECT-PROJECT-SIGNAL supplies the drill-down journey.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

Checked neighbouring runtime/resource, configuration, delivery, cost and scheduling concerns are excluded: #53 configuration is not a measurement, and CI success is not coverage or deployment. The active access-continuity and structured-behaviour Product Changes are draft, not authority to widen scope. This candidate proposes no change to accepted product intent or artifact lifecycle status.

## Candidate status

Blocked, not implementation-ready. The passed refinement requires proposal-stage agreement on the producer contract and #54 interface; neither agreement is complete. The [engineering review](https://github.com/juangcarmona/lighthouse-control-center/issues/156#issuecomment-6797833258) confirms that upstream reuse and authoritative artifact-to-exact-attempt attribution remain unresolved. Do not infer those from artifact names, timestamps or payload fields. Juan García Carmona owns both decisions. Keep `future`; proposal publication does not accept this design, approve implementation or authorize merge.
