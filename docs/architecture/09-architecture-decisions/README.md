---
title: Architecture decisions
arc42-section: "09"
description: Important architecture decisions and links to their records.
---

# 9. Architecture decisions

This directory is the canonical ADR collection for SoFa. It owns the decision records and their index; no parallel `docs/adr/` directory is used. The section remains part of the ArcShape twelve-section architecture.

| Decision | Status | Date | Record |
| --- | --- | --- | --- |
| Lighthouse owns delivery workflow and SoFa owns the execution runtime | Superseded by ADR-0006 | 2026-10-24 | [ADR-0001](0001-lighthouse-delivery-workflow-sofa-runtime.md) |
| One execution host supports bounded parallel execution through repository-scoped runner registrations | Superseded by ADR-0006 | 2026-10-24 | [ADR-0002](0002-bounded-parallel-execution.md) |
| Authenticate OpenCode outside the workflow | Accepted | 2026-10-24 | [ADR-0003](0003-opencode-codex-authentication.md) |
| Admit jobs locally and fence privileged publication | Superseded by ADR-0006 | 2026-10-24 | [ADR-0004](0004-local-admission-and-fenced-publication.md) |
| Separate workflow entry, autonomy and integration authority | Accepted | 2026-10-24 | [ADR-0005](0005-separate-entry-and-autonomy.md) |
| SoFa observes repository-owned workflows and independent execution | Accepted | 2026-10-25 | [ADR-0006](0006-observe-repository-owned-workflows.md) |
| Use an external identity provider | Accepted | 2026-10-26 | [ADR-0007](0007-shared-identity-custody-and-recovery.md) |
| Persist and correlate issue commands using a protected single-instance SQLite journal | Accepted | 2026-11-08 | [ADR-0008](0008-source-correlated-issue-commands.md) |
| Use .NET and Aspire for SoFa | Accepted | 2026-10-31 | [ADR-0009](0009-dotnet-and-aspire.md) |

ADR-0006 governs the current product boundary; earlier records retain their historical rationale.

ADR-0008 accepts the journal design for the issue-command adapter and recovery mechanism. It does not establish implementation or persist authentication credentials; realized behavior remains in sections05,06 and08.

## Proposals under review

| Proposed record | Scope |
| --- | --- |
| [ADR-0010](0010-administer-independent-runtime-providers.md) | Separately authorized provider administration; extends ADR-0006 without moving delivery orchestration |

This is a proposal inventory, not the accepted-decision table. ADR-0006 remains accepted. ADR-0008's owner acceptance and candidate integration are preserved in #48/#112 and must be reconciled through that existing delivery rather than changed here.
