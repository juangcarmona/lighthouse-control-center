---
id: BC-RUNTIME-OPERATIONS
type: bounded-context
title: Infrastructure and runtime operations
status: draft
---

## Responsibility

Observe runtime providers, pools, hosts, runner registrations and agent runtimes; present telemetry and support explicitly authorized administrative operations.

## Language

Provider, pool, execution host, runner, agent runtime, model provider, capacity, drain, maintenance and confirmed outcome.

## Boundaries

Providers own actual resources and enforce limits. Repository workflows retain job scheduling, lifecycle execution, cancellation policy and delivery authority. A read refresh never causes a write.

## External Relationships

Consumes ACT-RUNTIME-PROVIDER evidence, serves ACT-OPERATOR and ACT-RUNTIME-ADMINISTRATOR, and correlates infrastructure observations with BC-EXECUTION and BC-DELIVERY.
