---
id: FR-RUNTIME-HEALTH
type: functional-requirement
title: Surface independent runtime health
status: draft
derived-from: [UC-MAINTAIN-RUNTIME, BR-RECOVERABLE-EXECUTION]
uses-terms: [TERM-EXECUTION-RUN]
verification: [{scenario: "Source observations preserve identity and limitations; stopping SoFa does not stop repository workflows; a read refresh cannot dispatch or publish work."}]
---

## Requirement

Lighthouse Control Center MUST expose available runner, executor, workflow and provider health with source identity, observation time and limitations. Missing telemetry MUST be unknown rather than healthy. Health observation MUST NOT launch, cancel, recover or modify repository work. Explicit runtime administration is separate under FR-RUNTIME-PROVIDER-OPERATIONS; a refresh remains read-only. A Lighthouse Control Center outage MUST NOT stop the independently supervised runtime.

Source-reported capacity, queue pressure, contention, resource consumption and isolation limitations MUST be distinguished from execution progress. Lighthouse Control Center MUST show the affected repository or runtime and source decision without allocating capacity or inferring free capacity from missing measurements. Measured usage MUST expose its coverage and units.

Provider, pool, execution host, runner, agent runtime, model provider and execution MUST have distinct identities and lifecycles. CPU, memory, GPU, storage, queue and usage observations MUST identify source, time, units, coverage and unavailable counters. No registration count establishes measured free capacity.

## Rationale

The operator supervises work across repositories without making that view a prerequisite for delivery.
