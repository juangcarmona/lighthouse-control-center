---
id: UC-SCHEDULE-WORK
type: use-case
title: Compare source queues and recommend work
status: draft
primary-actor: ACT-OPERATOR
supporting-actors: []
bounded-context: BC-SCHEDULING
governed-by: [BR-HUMAN-DECISION-BOUNDARIES, BR-RECOVERABLE-EXECUTION]
uses-terms: [TERM-PROJECT, TERM-WORK-UNIT, TERM-EXECUTION-RUN, TERM-SCHEDULING-DECISION]
---

## Goal

Compare source queues and recommend work.

## Trigger

An operator requests a refresh or a configured source observation is refreshed.

## Preconditions

Repository identity is configured; unavailable source access is explicit.

## Main Flow

1. Lighthouse Control Center reads repository priorities, dependencies and queue evidence.
2. Lighthouse Control Center presents candidates and limitations without dispatching work.
3. The operator may request an action through the repository entrypoint directly or a separately authenticated Lighthouse Control Center control.
4. The repository workflow owns authorization and scheduling.

## Alternative Flows

Unavailable or stale evidence is shown with a source link and observation time.

## Failure Conditions

An observation cannot authorize work or claim success without evidence.

## Postconditions

The operator can inspect source-backed state without Lighthouse Control Center becoming an execution dependency.
