---
id: FR-PROJECT-DISCOVERY
type: functional-requirement
title: Discover project metadata from configured sources
status: draft
derived-from: [BR-GITHUB-SOURCE]
uses-terms: [TERM-PROJECT]
verification: [{scenario: "Given only a repository identity and default branch, SoFa discovers available project, engineering, workflow, policy, and delivery metadata and records each source and observation time."}, {scenario: "Given unavailable or conflicting metadata, SoFa registers the project, reports the gap or conflict explicitly, blocks only dependent operations, and does not treat the value as confirmed configuration."}]
---

## Requirement

Lighthouse Control Center MUST allow a project to be configured with only a repository identity and default branch. It MUST discover additional project, engineering, workflow, policy, and delivery metadata from the configured sources when available. It MUST record source identity, observation time, result, and limitations for discovery, and MUST expose unavailable or conflicting metadata without silently inventing a value. An incomplete discovery MUST not prevent project registration; only operations dependent on the missing or conflicting metadata may be blocked, with an explicit reason.

The discovered inventory MUST be usable by the factory search and project workspace. Version and configuration observations MUST identify their source revision and distinguish actual configuration from an expected baseline. Repository onboarding MUST NOT silently grant action authority.

Discovery MUST represent unadopted, partially adopted and fully configured repositories against their selected Lighthouse baseline. It MUST explain Discovery → Foundations → Maintenance progress from supported evidence. Absent files are distinct from denied access; capability gaps MUST NOT hide a repository or require full adoption for useful issue observations. Fleet grouping and filters do not grant permissions or configure repository policy.

## Rationale

Minimal onboarding keeps the factory usable across projects while preserving evidence when automatic discovery is incomplete.
