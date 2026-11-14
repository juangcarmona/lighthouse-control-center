# Design

<!-- pdac-scope: cited -->

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Context

See proposal.md for the bounded correction. Host-supplied source provenance is PR #201 at `8908a7761373a7b046917f0f5ead6c0ff4bcbf80`. The full bounded review includes an older metadata-only assessment; the current checkout already contains a producer, consumer, Health display and tests.

## Goals / Non-Goals

**Goals:** Reuse existing work, distinguish implemented checks from trusted acceptance, retain exact identity and unknown semantics, and make unfinished work reviewable.

**Non-Goals:** No quality threshold, additional facets, credential changes, independent scanning, source publication, merge, or invented #54 agreement.

## Decisions

1. Preserve the existing `coverage-evidence` capability instead of extending the workflow-observation capability. The latter describes collected run facts, not numeric measurements.
2. Retain the optional CI job and named scope: `SoFa.Web.Tests exercising SoFa.Modules.Workspace and SoFa.Web`, `coverage-lines-v1`, Coverlet 6.0.4/Cobertura. Normal verification remains authoritative; collection does not replace or gate it.
3. Do not treat report identity equality as authenticated producer attribution. The consumer currently reads the latest completed verify run and its artifact inventory, selects an attempt-named artifact, and validates payload identities. The supplied owner review says the artifact API does not authenticate the attempt. A reviewed producer revision and independently checkable binding remain necessary; this correction does not invent a trust policy or claim that existing reports satisfy it.
4. Preserve production code while required agreements remain unresolved. A local fixture pass establishes only the behavior exercised, not trusted source acceptance. Record the trust defect from inspection without probing or exploiting it.
5. Keep current Health presentation provisional. The candidate exposes recent counts and run identity but has no accepted reusable detail/history contract or durable comparable-sample history. Do not substitute its project section for #54 agreement or assert historical acceptance.

## Required decisions and unfinished contract

- **#54 Health owner:** Which reviewed detail/history schema and history entry point should #156 use? This affects presentation and history work and is a blocker, not a deferrable design question.
- **Repository producer/security owner:** Review the pinned producer boundary and independently checkable exact-attempt binding. An artifact name, timestamp or report claim cannot supply it.
- Complete source-ref/tested-revision verification, artifact identity/digest/retention handling and visible source age. The current payload has a ref and tested commit, but the consumer does not authenticate them against the producing source.
- Specify and verify retry deduplication without erasing failures and history compatibility by scope, tool and definition; incompatible samples must show a break. No trend is accepted yet.

## Risks / Trade-offs

- [Claimed attempt mistaken for trusted attribution] → Block acceptance until independently bound producer evidence is implemented and reviewed; do not describe current numeric display as trusted.
- [Unit tests mistaken for source acceptance] → Keep fixture results separate from a real repository-produced artifact and missing-facet acceptance.
- [Unreviewed history design] → Retain the explicit #54 question and leave dependent tasks pending.
- [Broader verification failure] → Retain complete command receipts and report failure rather than relaxing checks.

## Migration Plan

This correction adds planning only and preserves existing metadata and source bytes. No deployment or data migration is performed. The trusted host verifies head/discussion freshness and the candidate independently before any same-branch update; hosted CI and installed-runtime acceptance remain later work.
