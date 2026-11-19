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
- TERM-AGENT-RUNTIME
- TERM-RUNNER
- TERM-MODEL-PROVIDER
- TERM-HEALTH-MEASUREMENT
verification:
- scenario: A retried mission retains each run attempt; missing runner, session or model identities remain unknown; duplicate events are deduplicated by stable source identity.
- scenario: A usage detail follows only source-established repository, work-item, workflow, stage, run, attempt, worker, runner, runtime, session and evidence links, and identifies the producer and observation limits.
- scenario: An unavailable, expired or redacted source dimension remains distinct from zero usage and from a complete observation.
- scenario: Usage and cost evidence excludes prompts, transcripts, source content, tool arguments, tool results and credentials.
---

## Requirement

Control Center MUST consume available Lighthouse evidence and telemetry, GitHub records and runtime/provider measurements with stable source identities, source and observation timestamps, versions, collection scope and limitations. It MUST preserve repository → issue → mission → workflow → stage → run → attempt → worker → runner → runtime → agent session → evidence → result links only where the sources establish them. It MUST preserve reported action or command, executed model, skill and tool dimensions when the producer directly supplies them, and distinguish unavailable, redacted, unsupported and zero values. Repeated source events MUST NOT inflate derived usage; retries and parent/child sessions MUST retain identities needed to avoid double counting. OpenTelemetry-compatible signals MAY supplement evidence; they MUST NOT replace authoritative source results. Raw prompts, credentials, transcripts, source content and tool arguments/results MUST be excluded by default.

## Rationale

Operators need to trace a claim across independently owned systems without treating transport metadata as independent verification or confusing configured values with observed execution.
