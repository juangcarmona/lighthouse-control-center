---
id: CHG-LCC-STRUCTURED-BEHAVIOURS-001
type: product-change
title: 'Make existing Control Center journeys independently verifiable'
status: draft
base-revision: 'de005dea654edd445481e210c24f22641cf6c3c5'
operations:
  add: [SB-FIND-REPOSITORY-ISSUE, SB-PARTIAL-REPOSITORY-COLLECTION, SB-READ-ISSUE-CONTEXT, SB-UNAVAILABLE-ISSUE-ACTION, SB-ORDINARY-ISSUE-COMMENT, SB-UNCERTAIN-ISSUE-COMMENT, SB-EXPLICIT-QUESTION-CONTINUATION, SB-UNRESOLVED-INTERVENTION, SB-ANONYMOUS-WORKSPACE-DENIAL]
  modify: []
  remove: []
---

## Problem

The current model has prose verification scenarios but no structured-behaviour artifacts. Browser results therefore lack explicit Given/When/Then example identities and can be mistaken for complete source acceptance.

## Intended Product Outcome

Existing repository discovery, issue reading, comments, question continuation and access boundaries have named structured examples. Every given condition and expected outcome is explicit and conjunctive.

## Rationale

On 2026-11-09 the maintainer required executed Playwright E2E evidence based on the structured behaviours of the product model. This draft formalizes already declared examples; it does not mark them accepted or implemented.

## Affected Product Areas

UC-EXPLORE-FACTORY, UC-OPERATE-ISSUE, UC-RESOLVE-INTERVENTION and BR-LAN-PRIVILEGE-BOUNDARY. FR-FACTORY-DISCOVERY, FR-ISSUE-CONTEXT, FR-ISSUE-CONVERSATION and FR-INTERVENTION-INBOX supply the existing outcomes. Other runtime, metric, delivery and deployment semantics stay unchanged.

## Open Questions

None about the requested evidence structure. Product acceptance of these exact examples remains separate from test execution.

## Product Acceptance

Review that each example preserves its existing source requirement, uses Lighthouse Control Center terminology and grants no new authority. Validate the overlay before any approved apply; a green browser case does not approve this change.

## Out of Scope

New workflow semantics, changed source permissions, consent, provider commands, production deployment, architecture changes, automatic approval and direct editing of the accepted model.
