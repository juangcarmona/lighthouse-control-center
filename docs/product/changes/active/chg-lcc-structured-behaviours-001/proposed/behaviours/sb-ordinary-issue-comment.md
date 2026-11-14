---
id: SB-ORDINARY-ISSUE-COMMENT
type: structured-behaviour
title: "Publish an ordinary comment without continuation"
status: draft
illustrates: [UC-OPERATE-ISSUE]
given:
  - "The acting GitHub user has current issue comment authority"
  - "The repository supports ordinary comments distinct from continuation"
when: "The operator explicitly confirms an ordinary comment"
then:
  - "The conversation contains the confirmed GitHub comment identity"
  - "The comment is attributed to the verified GitHub user"
  - "The action does not request continuation"
---

## Intent

Make one existing FR-ISSUE-CONVERSATION example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
