---
id: FR-PROJECT-HEALTH
type: functional-requirement
title: Explain project health and trends without invented scores
status: draft
derived-from: [UC-INSPECT-PROJECT-SIGNAL, BR-EXPLAINABLE-SIGNALS]
uses-terms: [TERM-PROJECT, TERM-WORK-UNIT, TERM-DELIVERY-EVIDENCE, TERM-HEALTH-MEASUREMENT, TERM-AGENT-RUNTIME, TERM-MODEL-PROVIDER, TERM-RUNNER]
verification:
  - scenario: "Opening a delivery trend shows contributing source records, windows and formula; missing intervals are not plotted as zero."
  - scenario: "Incomplete resource measurements and non-applicable deployment metrics retain different visible states."
  - scenario: "An agent-usage signal can be grouped by supported issue, workflow, stage, action, executed model, runner or skill dimensions and shows coverage for each group."
  - scenario: "A reported or estimated agent cost identifies its source and method; missing billing evidence is unavailable rather than inferred from tokens."
  - scenario: "Requested model configuration and runtime-reported executed model remain separate in a comparison."
---

## Requirement

Lighthouse Control Center MUST present source-backed signals for delivery, adoption of the harness and workflows, quality and resource consumption when their data is available. Each signal MUST have a decision purpose and drill-down to its inputs, formula or source assessment, scope, age, coverage and limitations. Trend comparisons MUST expose incompatible samples and changes in definition. A composite score, universal target or copied threshold MUST NOT be inferred from reference screenshots.

Delivery throughput, lead time, deployment frequency, change quality and rework, CI outcomes, coverage, mutation, security, autonomy/intervention, tokens, duration, retries and cost MUST be individually source-defined. Agent usage MUST identify its measurement grain and may be grouped by repository, issue, workflow, stage, action or command, executed model, runner and skill only when those dimensions are reported by the source. Missing or redacted dimensions MUST remain explicit. Provider-billed cost, runtime-reported cost and a versioned estimate MUST be separately identified; token availability MUST NOT be used to fabricate billed cost. Repository or provider reports are required where GitHub alone is insufficient. DORA deployment measures require actual target-environment outcomes; agent success and green CI are not deliveries.

## Rationale

The operator can decide whether a project needs investigation and verify the basis and coverage of the signal.
