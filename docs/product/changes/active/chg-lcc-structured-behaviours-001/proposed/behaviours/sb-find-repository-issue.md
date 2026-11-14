---
id: SB-FIND-REPOSITORY-ISSUE
type: structured-behaviour
title: "Find an ordinary issue in its repository"
status: draft
illustrates: [UC-EXPLORE-FACTORY]
given:
  - "An admitted operator can read a configured repository"
  - "An ordinary issue exists in that repository"
when: "The operator looks up that issue by its number"
then:
  - "The matching issue is reachable with its repository and issue identity"
  - "No workflow or issue transition is requested by navigation"
---

## Intent

Make one existing FR-FACTORY-DISCOVERY example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
