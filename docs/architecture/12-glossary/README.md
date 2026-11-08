---
title: Glossary
arc42-section: "12"
description: Domain and architecture terminology used in this documentation.
---

# 12. Terms

A workflow run is a GitHub execution identity. An executor is the independent process that runs a bounded agent invocation. An observation is a timestamped projection of source evidence. Verification assesses whether that evidence supports a claim. A recommendation does not dispatch work. A human gate remains a source-side decision.

<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->

See [ADR-0006](../09-architecture-decisions/0006-observe-repository-owned-workflows.md) for the accepted boundary and superseded design.

## Proposed operational terminology

ProductShape TERM-WORK-COMMAND owns command meaning. An application receipt records submission and source acknowledgment, not stage completion. Reconciliation reads source evidence to resolve uncertainty; it does not rerun a stage. A capability decision is a versioned source/shared rule assessment against a snapshot; it is not an execution reservation. An intervention is a source-backed human request; its type is not an extra lifecycle stage. A signal is an explained observation or calculation, not an implicit health score.

## Proposed LCC architectural terms

Product definitions for mission, runtime provider/pool, execution host, runner, agent runtime, model provider and runtime operation are in the [Product Change](../../product/changes/completed/chg-lcc-evolution-001/change.md). The maintainer approved these definitions and ProductShape applied them on this branch; provider architecture and implementation remain separate. Existing work-unit and execution IDs are retained.

Product/delivery plane names the Lighthouse/repository lifecycle authority. Control plane names authenticated projections, command intentions and provider administration in LCC. Execution plane names actual compute, runner and engine processes plus inference dependencies. Observability plane names evidence/telemetry ingestion and analytical projections. These architectural responsibilities do not imply deployment units. A provider capability describes an available interface; a grant authorizes a particular actor/effect; neither establishes a completed operation.
