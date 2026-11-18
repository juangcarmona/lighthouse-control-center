---
id: CHG-AGENT-OBSERVABILITY-001
type: product-change
title: Explain agent usage and cost across attributable work
status: applied
base-revision: '35041b29c03d8879f89d66bee383f61fabce7214'
operations:
  add: []
  modify:
    - FR-EVIDENCE-CORRELATION
    - FR-PROJECT-HEALTH
  remove: []
---

## Problem

The current product definition allows health signals for tokens, duration, retries and cost and requires evidence correlation, but does not explicitly describe agent sessions, executed models, skills, commands or workflow stages as dimensions of attributable usage. Without that definition, a consumer can show totals without proving which work and source records they describe.

## Intended Product Outcome

Lighthouse Control Center can explain agent and runner usage for a repository work item from correlated source records. Supported measurements can be grouped by workflow, stage, action or command, executed model, runner and skill when the producer reports those dimensions. Each result preserves its measurement grain, provenance, coverage, time window and limitations. Provider-billed cost, runtime-reported cost and estimates remain distinct.

## Rationale

The operator wants to understand what work consumes tokens and resources, compare models and workflows on attributable evidence, and investigate cost without turning configuration into a claim about what executed. A shared definition lets OpenCode and later agent producers report comparable fields while exposing gaps honestly.

## Affected Product Areas

Issue evidence correlation; project engineering-health signals; runtime and agent usage measurements; cost provenance and comparison.

## Open Questions

None. Collection remains metadata-only by default. Source-specific availability, detail and retention limits are reported with the measurement.

## Product Acceptance

- A project signal can be traced through the exact repository and work item to correlated workflow, run, attempt, runner and agent-session records where those identities are available.
- Token, duration, retry, tool and resource measurements identify their source, unit, time window, measurement grain, sample coverage and limits.
- The operator can group by workflow, stage, action or command, executed model, runner and skill only when source records support the dimension; unavailable and redacted dimensions remain explicit.
- Requested model configuration is distinct from the runtime-reported executed model. Provider-billed cost, runtime-reported cost and a versioned estimate are visibly distinct; tokens alone do not establish billed cost.
- Replayed or duplicate events do not inflate totals, retries remain separate attempts, and parent/child usage is not added twice.
- Prompts, transcripts, source content, tool arguments/results and credentials are excluded from product usage evidence by default.

## Out of Scope

This change does not select a storage engine or hosting topology, set a universal retention period, establish model quality or productivity scores, guarantee attribution unsupported by a producer, obtain provider billing access, or authorize execution, source mutation or production deployment.
