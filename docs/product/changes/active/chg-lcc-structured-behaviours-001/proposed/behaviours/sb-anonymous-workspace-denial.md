---
id: SB-ANONYMOUS-WORKSPACE-DENIAL
type: structured-behaviour
title: "Deny anonymous operational access"
status: draft
illustrates: [BR-LAN-PRIVILEGE-BOUNDARY]
given:
  - "The caller has no admitted operator session"
when: "The caller requests protected issue information"
then:
  - "Protected issue information is not returned"
  - "The response does not grant source mutation authority"
---

## Intent

Make one existing BR-LAN-PRIVILEGE-BOUNDARY example independently observable, as requested by the maintainer on 2026-11-09. This is an example of existing intent, not a new capability or test implementation.

## Boundaries

All stated outcomes are conjunctive. Evidence for a fixture-backed case does not establish actual source or provider acceptance. No claim of mission delivery, deployment or enterprise readiness follows from this example.
