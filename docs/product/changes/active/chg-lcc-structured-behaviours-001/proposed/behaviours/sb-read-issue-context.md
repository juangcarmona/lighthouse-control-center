---
id: SB-READ-ISSUE-CONTEXT
type: structured-behaviour
title: "Read source-backed issue context"
status: draft
illustrates: [UC-OPERATE-ISSUE]
given:
  - "An admitted operator has current read access to an ordinary issue"
  - "The issue has a description and conversation"
when: "The operator opens the issue"
then:
  - "Lighthouse Control Center displays its description and available conversation"
  - "The repository and issue source identities remain inspectable"
  - "The view explains its observation time and collection bounds"
---

## Intent

Make one existing FR-ISSUE-CONTEXT example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
