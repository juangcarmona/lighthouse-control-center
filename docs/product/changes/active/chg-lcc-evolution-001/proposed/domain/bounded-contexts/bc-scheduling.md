---
id: BC-SCHEDULING
type: bounded-context
title: Operational recommendations
status: draft
---

## Responsibility

Aggregate source queues, dependencies and human waits; explain operational recommendations across configured projects without owning delivery scheduling.

## Language

Priority, dependencies, capacity evidence, recommendation and uncertainty.

## Boundaries

This context never owns a queue, dispatches agents or imposes workflow gates.

## External Relationships

Reads BC-BACKLOG-TRIAGE and source capacity evidence for ACT-FACTORY-OWNER.
