---
id: FR-PROJECT-HEALTH
type: functional-requirement
title: Explain project health and trends without invented scores
status: draft
derived-from: [UC-INSPECT-PROJECT-SIGNAL, BR-EXPLAINABLE-SIGNALS]
uses-terms: [TERM-PROJECT, TERM-WORK-UNIT, TERM-DELIVERY-EVIDENCE, TERM-HEALTH-MEASUREMENT]
verification:
  - scenario: "Opening a delivery trend shows contributing source records, windows and formula; missing intervals are not plotted as zero."
  - scenario: "Incomplete resource measurements and non-applicable deployment metrics retain different visible states."
---

## Requirement

Lighthouse Control Center MUST present source-backed signals for delivery, adoption of the harness and workflows, quality and resource consumption when their data is available. Each signal MUST have a decision purpose and drill-down to its inputs, formula or source assessment, scope, age, coverage and limitations. Trend comparisons MUST expose incompatible samples and changes in definition. A composite score, universal target or copied threshold MUST NOT be inferred from reference screenshots.

Delivery throughput, lead time, deployment frequency, change quality and rework, CI outcomes, coverage, mutation, security, autonomy/intervention, tokens, duration, retries and cost MUST be individually source-defined. Repository or provider reports are required where GitHub alone is insufficient. DORA deployment measures require actual target-environment outcomes; agent success and green CI are not deliveries. Cost requires an attributable provider report or an explicitly labeled, versioned estimate and MUST NOT be fabricated from token availability.

## Rationale

The operator can decide whether a project needs investigation and verify the basis of that decision.
