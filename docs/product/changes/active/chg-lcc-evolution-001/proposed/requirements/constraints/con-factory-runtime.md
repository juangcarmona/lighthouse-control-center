---
id: CON-FACTORY-RUNTIME
type: constraint
title: Keep delivery execution independent of Control Center
status: draft
applies-to: [BC-EXECUTION, BC-SCHEDULING, BC-DELIVERY, BC-RUNTIME-OPERATIONS]
---

## Constraint

Repository workflows MUST own lifecycle orchestration and use an independently operated execution runtime. Lighthouse Control Center MUST remain optional to repository delivery. Authenticated repository controls submit through supported source entrypoints. Independently authorized infrastructure controls use provider interfaces and do not implement delivery orchestration. No SoFa database, scheduler, lease, supervisor or service MAY be required to execute repository work. This constraint does not select the future SoFa UI framework.

## Rationale

The owner supervises work across repositories without making that view a prerequisite for delivery.

## Consequences

Runtime providers own actual resource operations and enforce their limits; Control Center can request and audit supported changes. Workflow gates remain source-owned. Stopping Control Center does not stop admitted work or require moving any execution checkpoint.
