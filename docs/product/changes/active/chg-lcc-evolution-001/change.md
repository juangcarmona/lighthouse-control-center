---
id: CHG-LCC-EVOLUTION-001
type: product-change
title: Evolve SoFa into Lighthouse Control Center
status: draft
base-revision: 4c457c337640795a31492f7219cb0e497df9e232
operations:
  add:
  - ACT-RUNTIME-ADMINISTRATOR
  - ACT-RUNTIME-PROVIDER
  - BC-ENGINEERING-HEALTH
  - TERM-MISSION
  - TERM-RUNTIME-PROVIDER
  - TERM-RUNTIME-POOL
  - TERM-EXECUTION-HOST
  - TERM-RUNNER
  - TERM-AGENT-RUNTIME
  - TERM-MODEL-PROVIDER
  - TERM-RUNTIME-OPERATION
  - CON-DEPLOYMENT-INDEPENDENCE
  - BR-PROVIDER-OPERATIONS
  - FR-RUNTIME-PROVIDER-OPERATIONS
  - FR-EVIDENCE-CORRELATION
  - QR-PROVIDER-EXTENSIBILITY
  - TERM-HEALTH-MEASUREMENT
  - ACT-OPERATOR
  modify:
  - ACT-ENGINEER
  - BC-RUNTIME-OPERATIONS
  - BC-PORTFOLIO-PROJECT-CONFIGURATION
  - BC-BACKLOG-TRIAGE
  - BC-SCHEDULING
  - CON-FACTORY-RUNTIME
  - CON-TRUSTED-LAN
  - BR-LAN-PRIVILEGE-BOUNDARY
  - UC-MAINTAIN-RUNTIME
  - FR-RUNTIME-HEALTH
  - FR-PROJECT-DISCOVERY
  - FR-ISSUE-CONTEXT
  - FR-PROJECT-HEALTH
  - UC-INSPECT-PROJECT-SIGNAL
  - JRN-DAILY-FACTORY-OPERATIONS
  - BR-CAPACITY-DEFAULTS
  - ACT-IDENTITY-PROVIDER
  - BR-EXPLAINABLE-SIGNALS
  - BC-DELIVERY
  - TERM-DELIVERY-EVIDENCE
  - TERM-RUNTIME-HEALTH
  - TERM-SCHEDULING-DECISION
  - JRN-ENGINEERING-EXECUTION
  - FR-FACTORY-DISCOVERY
  - FR-WORK-UNIT-SHAPING
  - QR-EXECUTION-SECURITY
  - UC-ACCESS-FACTORY
  - UC-EXECUTE-WORK-UNIT
  - UC-EXPLORE-FACTORY
  - UC-OPERATE-ISSUE
  - UC-RESOLVE-INTERVENTION
  - UC-SCHEDULE-WORK
  - UC-SHAPE-WORK-UNIT
  - UC-TRIAGE-BACKLOG
  - UC-VERIFY-DELIVERY
  remove:
  - ACT-JUAN
  - ACT-FACTORY-OWNER
---

## Problem

The accepted definition centers on a named individual and an industrial production metaphor, and limits runtime operations to observation. That excludes the decided reusable Control Center identity, separately authorized infrastructure administration and deployment across independent operators. Existing source-owned delivery, explicit commands and evidence semantics remain valid.

## Intended Product Outcome

Lighthouse Control Center is a self-hosted application for observing, operating and improving a fleet of software projects adopting Lighthouse, including their missions, engineering health, agents and execution infrastructure. Lighthouse remains independently usable. Repositories at different adoption levels provide useful observations without mandatory complete adoption.

The product has six primary domains: Fleet; Missions; Operations & Interventions; Engineering Health; Infrastructure & Runtime Operations; Evidence & Observability. Product domains are navigation and language boundaries, not a requirement for six deployed services. The maritime vocabulary describes a fleet of independently operated projects, missions and their operating environment. Roles remain Operator, Runtime administrator and Repository engineer. The feedback loop connects delivery evidence to the next improvement; it is not another scheduler or Lighthouse lifecycle stage. Optional harbor imagery does not introduce a new runtime or authorization entity. APIs and contracts retain precise engineering terms.

Fleet explains Discovery → Foundations → Maintenance. Missions follow issue-centric objectives through dependencies, attempts, review and accepted delivery. Operations exposes source-backed human decisions and supported commands. Health explains measurements and their limits. Runtime operations independently authorizes provider actions. Evidence correlates these domains with provenance.

## Rationale

The maintainer explicitly decided the Lighthouse Control Center name and evolution of the existing repository, preserving history, architecture and delivery. The supplied mission requires authorized runtime administration while retaining repository workflow orchestration. This change records that semantic extension without accepting a technical architecture, granting any actor operational access or authorizing a remote rename.

Retain work-unit, execution and source-evidence identities under the issue-centric mission. Replace the personal and industrially named operator actors with ACT-OPERATOR, and update their graph relationships in this same overlay. Other existing artifact IDs stay stable for citation compatibility; their visible titles and prose use the new vocabulary. Existing source roles, human gates, explicit comments, recovery, independent execution and source-backed metrics continue to govern. Multi-user suitability is product scope; actual admission policies require separately reviewed implementation.

## Affected Product Areas

Neutral operator and runtime-administrator actors; fleet/adoption, mission language, operational recommendations, runtime operations and engineering-health contexts; daily operations and runtime-maintenance journeys; deployment independence, provider authorization, mission history, measurements and evidence correlation. Existing delivery authority remains unchanged.

## Open Questions

No operational or authority questions remain for this semantic scope. Harbor/bay imagery and a label such as Loop Point remain optional naming suggestions, not selected product entities or navigation labels. Provider-specific command sets, team admission design, measurement sources and retention windows require reviewed delivery proposals within these boundaries; this change grants no default destructive operation, composite score, retention period or enterprise readiness.

## Product Acceptance

A reviewer can understand every role without knowing the original operator. Visible product prose uses fleet, mission, operations and feedback rather than an industrial-production identity. A reviewer can identify all six domains and distinguish repository authority from runtime authority. A single operator and a scoped team use the same product roles without personal host assumptions. A non-adopted repository remains visible; lack of telemetry is unknown. An agent or workflow success cannot close a mission by inference. Runtime commands require explicit provider authority and confirmed outcomes; stopping Control Center leaves repository delivery operating. Lighthouse, GitHub, ProductShape, ArcShape, identity and model providers retain their stated authorities.

## Out of Scope

A rewrite, new repository, accepted architecture status, implementation acceptance, apply/merge, deployment, remote rename, new scheduler, queue/broker infrastructure, blanket privileges, default autoscaling, concrete enterprise infrastructure, model-provider substitution, additional tracking systems or changes to the accepted six-stage Lighthouse lifecycle.
