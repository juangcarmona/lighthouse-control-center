---
id: SB-EXPLICIT-QUESTION-CONTINUATION
type: structured-behaviour
title: "Keep question continuation explicit"
status: draft
illustrates: [UC-RESOLVE-INTERVENTION]
given:
  - "A source-backed pending question exists"
  - "The repository supports continuation and the acting user is authorized"
when: "The operator inspects the question"
then:
  - "The actual source question is readable"
  - "Reply-and-continue is identified separately from an ordinary comment"
  - "The intended continuation effect is explained before confirmation"
---

## Intent

Make one existing FR-INTERVENTION-INBOX example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
