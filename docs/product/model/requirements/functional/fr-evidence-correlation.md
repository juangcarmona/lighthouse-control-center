---
id: FR-EVIDENCE-CORRELATION
type: functional-requirement
title: Correlate operational evidence with provenance
status: draft
derived-from:
- UC-OPERATE-ISSUE
- UC-MAINTAIN-RUNTIME
- BR-EXPLAINABLE-SIGNALS
uses-terms:
- TERM-MISSION
- TERM-EXECUTION-RUN
- TERM-DELIVERY-EVIDENCE
verification:
- scenario: A retried mission retains both run attempts, missing runner/session IDs stay unknown and repeated events are deduplicated by stable
    source identity.
- scenario: Expired artifacts, stale observations and completed workflows with blocked results remain distinct from independently verified delivery.
---

## Requirement

Control Center MUST consume available Lighthouse evidence and telemetry, GitHub records and runtime/provider measurements with stable source identities, source and observation timestamps, versions, collection scope and limitations. It MUST preserve repository → issue → mission → workflow → run → attempt → worker → runner → runtime → evidence → result links only where the sources establish them. Unsupported or unavailable links remain explicit. OpenTelemetry-compatible signals MAY supplement evidence; they MUST NOT replace authoritative source results. Raw prompts, credentials and transcripts MUST be excluded by default.

## Rationale

Operators need to trace a claim across independently owned systems without treating transport metadata as independent verification.
