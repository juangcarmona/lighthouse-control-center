---
id: SB-UNAVAILABLE-ISSUE-ACTION
type: structured-behaviour
title: "Explain an unavailable issue action"
status: draft
illustrates: [UC-OPERATE-ISSUE]
given:
  - "The operator can read an issue"
  - "A required source permission is unavailable"
when: "The operator inspects its actions"
then:
  - "The dependent action cannot be submitted"
  - "A specific explanation identifies the missing authority"
  - "Read access is not represented as action authority"
---

## Intent

Make one existing FR-ISSUE-CONTEXT example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
