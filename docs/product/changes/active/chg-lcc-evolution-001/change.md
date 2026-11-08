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
  modify:
  - ACT-FACTORY-OWNER
  - ACT-JUAN
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
  remove: []
---

## Problem

The accepted definition describes a personal factory and limits runtime operations to observation. That excludes the decided reusable Control Center identity, separately authorized infrastructure administration and deployment across independent operators. Existing source-owned delivery, explicit commands and evidence semantics remain valid.

## Intended Product Outcome

Lighthouse Control Center is a self-hosted application for observing, operating and improving a fleet of software projects adopting Lighthouse, including their missions, engineering health, agents and execution infrastructure. Lighthouse remains independently usable. Repositories at different adoption levels provide useful observations without mandatory complete adoption.

The product has six primary domains: Fleet; Missions; Operations & Interventions; Engineering Health; Infrastructure & Runtime Operations; Evidence & Observability. Product domains are navigation and language boundaries, not a requirement for six deployed services. The maritime metaphor can inform experience; APIs and contracts retain precise engineering terms.

Fleet explains Discovery → Foundations → Maintenance. Missions follow issue-centric objectives through dependencies, attempts, review and accepted delivery. Operations exposes source-backed human decisions and supported commands. Health explains measurements and their limits. Runtime operations independently authorizes provider actions. Evidence correlates these domains with provenance.

## Rationale

The maintainer explicitly decided the Lighthouse Control Center name and evolution of the existing repository, preserving history, architecture and delivery. The supplied mission requires authorized runtime administration while retaining repository workflow orchestration. This change records that semantic extension without accepting a technical architecture, granting any actor operational access or authorizing a remote rename.

Reuse existing IDs and behavior; retain work-unit and execution terms under the issue-centric mission. ACT-JUAN remains a compatibility instance of the general operator. Existing source roles, human gates, explicit comments, recovery, independent execution and source-backed metrics continue to govern. Multi-user suitability is product scope; actual admission policies require separately reviewed implementation.

## Affected Product Areas

Operator and runtime-administrator actors; fleet/adoption, mission language, operational recommendations, runtime operations and engineering-health contexts; daily operations and runtime-maintenance journeys; deployment independence, provider authorization, mission history, measurements and evidence correlation. Existing delivery authority remains unchanged.

## Open Questions

None for this semantic scope. Provider-specific command sets, team admission design, measurement sources and retention windows require reviewed delivery proposals within these boundaries; this change grants no default destructive operation, composite score, retention period or enterprise readiness.

## Product Acceptance

A reviewer can identify all six domains and distinguish repository authority from runtime authority. A single operator and a scoped team use the same product roles without personal host assumptions. A non-adopted repository remains visible; lack of telemetry is unknown. An agent or workflow success cannot close a mission by inference. Runtime commands require explicit provider authority and confirmed outcomes; stopping Control Center leaves repository delivery operating. Lighthouse, GitHub, ProductShape, ArcShape, identity and model providers retain their stated authorities.

## Out of Scope

A rewrite, new repository, accepted architecture status, implementation acceptance, apply/merge, deployment, remote rename, new scheduler, queue/broker infrastructure, blanket privileges, default autoscaling, concrete enterprise infrastructure, model-provider substitution, additional tracking systems or changes to the accepted six-stage Lighthouse lifecycle.
