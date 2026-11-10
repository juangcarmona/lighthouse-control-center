---
id: SB-UNCERTAIN-ISSUE-COMMENT
type: structured-behaviour
title: "Reconcile an uncertain comment without duplicate publication"
status: draft
illustrates: [UC-OPERATE-ISSUE]
given:
  - "The operator confirmed an ordinary comment"
  - "Its source publication response was lost"
when: "The operator requests reconciliation"
then:
  - "The original comment intent remains identified"
  - "Lighthouse Control Center does not silently post another comment"
  - "The outcome remains uncertain until source evidence confirms it"
---

## Intent

Make one existing FR-ISSUE-CONVERSATION example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
