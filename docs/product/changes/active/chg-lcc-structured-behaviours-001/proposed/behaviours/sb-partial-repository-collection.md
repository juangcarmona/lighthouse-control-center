---
id: SB-PARTIAL-REPOSITORY-COLLECTION
type: structured-behaviour
title: "Keep incomplete repository collections explicit"
status: draft
illustrates: [UC-EXPLORE-FACTORY]
given:
  - "Only part of a repository issue collection is available"
when: "The operator opens its issue list"
then:
  - "The collection identifies its incomplete scope"
  - "Missing records are not presented as an empty repository"
---

## Intent

Make one existing FR-FACTORY-DISCOVERY example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
