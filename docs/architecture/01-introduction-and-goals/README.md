---
title: Introduction and goals
arc42-section: "01"
description: System purpose, stakeholders, and architecture goals.
---

# 01. Observe engineering activity across repositories

Lighthouse Control Center gives the operator a source-backed view of work, execution and delivery across repositories. Repository workflows orchestrate the lifecycle; an independent runtime executes agents. Lighthouse Control Center remains optional.

<!-- pdac:cite id="FR-AUTHORIZED-ENTRY" digest="sha256:9d9205257c47d81d2f01866ea9d643bc5f169f4295cf37a600086a405eab8463" -->

See [ADR-0006](../09-architecture-decisions/0006-observe-repository-owned-workflows.md) for the accepted boundary and superseded design.

## Accepted operational product direction

The [applied Product Change](../../product/changes/completed/chg-authenticated-operations-001/change.md) extends the accepted product baseline to a single authenticated workspace for daily work. The first proof is issue context → eligible Refine/Propose or comment → source receipt → correlated result, usable from a phone. Portfolio, intervention, project and signal views extend the same source projections in later deliveries. The architecture views below remain proposed and the behavior is not yet implemented.

The owner remains the primary operator. Existing requester and engineer distinctions are repository capabilities, not a new organization-management product. Architectural success means trustworthy action outcomes, explainable incomplete evidence and execution that remains independent of Lighthouse Control Center.

## Proposed LCC architectural drivers

The [LCC Product Change](../../product/changes/completed/chg-lcc-evolution-001/change.md) supplies the approved deployment-independent operator, runtime-administrator and provider boundaries. ProductShape has applied the approved change on this branch; integration establishes the updated baseline. Architecture must preserve usable source observations across different adoption levels and distinguish mission delivery from execution completion. Runtime administration introduces a new trust boundary under [Proposed ADR-0010](../09-architecture-decisions/0010-administer-independent-runtime-providers.md).

The [current-state assessment](../../roadmap/lighthouse-control-center-assessment.md) records default-branch versus candidate implementation; the existing issue-context and source-command PRs are not reimplemented by this proposal. The earlier statement that all operational behavior is unimplemented is scoped to the original planning snapshot: identity is on main, and the remaining workspace is active candidate work.
