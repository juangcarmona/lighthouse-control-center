# Lighthouse Control Center evolution roadmap

Tracking issue: [#116](https://github.com/juangcarmona/sofa/issues/116). This is an incremental evolution of the existing repository. The name is decided; the [Product Change](../product/changes/active/chg-lcc-evolution-001/change.md) and [Proposed ADR-0010](../architecture/09-architecture-decisions/0010-administer-independent-runtime-providers.md) remain review artifacts. No product apply, merge, deployment or remote rename is authorized by a green documentation check.

## Review package and owners

| Deliverable | Canonical artifact |
| --- | --- |
| Current state, capability status and gap analysis | [Dated assessment](lighthouse-control-center-assessment.md), with source permalinks and exact active PR heads |
| Target responsibilities, actors, journeys and bounded contexts | [CHG-LCC-EVOLUTION-001](../product/changes/active/chg-lcc-evolution-001/change.md) and its complete proposed artifacts |
| Target architecture | [Twelve ArcShape views](../architecture/README.md), explicitly proposed LCC sections; [ADR-0010](../architecture/09-architecture-decisions/0010-administer-independent-runtime-providers.md) |
| Platform patterns, trade-offs and measurement catalog | [Research comparison](lighthouse-control-center-research.md) |
| Ordered implementation and execution backlog | This roadmap, [#116](https://github.com/juangcarmona/sofa/issues/116) and native child links |
| Independent source installation | [New-operator procedure](../runbooks/control-center-installation.md), with current-baseline and release gaps explicit |
| Rename inventory and rollback | [Rename plan](lighthouse-control-center-rename.md) |
| First end-to-end slice | [Existing source-controlled issue journey](../delivery/plans/116-lcc-first-vertical-slice.md) |

ProductShape owns what and why; ArcShape owns how and decision rationale. The roadmap owns sequence, dependencies and per-increment acceptance. OpenSpec plans own implementation details for their issue. GitHub issue/PR/run state is live authority; this document is a dated plan. Historical supervisor plans remain evidence and are no longer the delivery entrypoint.

## Phases and exit criteria

| Phase | Ordered increments and dependencies | Exit evidence and risks |
| --- | --- | --- |
| 1 — Product redefinition | Inspect source and active delivery; review #116 ProductShape delta; maintainer resolves scope and accepts ADR-0010; approve/apply/merge product through its owning process | Coherent six-domain intent and provider/delivery boundary, zero overlay/architecture/citation errors, explicit human acceptance. Risk: treating the proposed overlay as already accepted or resurrecting the obsolete supervisor. |
| 2 — Control Center foundation | Retain #49 identity and current .NET/Aspire/UI; accept #50 reader and #48 source controls; reuse #52 configured fleet entry; project stable repository/issue/attempt IDs; #53 defines adoption compatibility | Usable projects/missions centered application against installed Lighthouse 0.12.61/0.22.0 and explicit unsupported versions; no namespace/UI rewrite. Risk: source API compatibility and cross-account stale cache. |
| 3 — Operational workspace | Complete actual source acceptance and integrate the existing #100 → #112 → #103 → #105 → #111 stack in order; #47 retains its source history; #56 adds proposal/integration/accepted-outcome drill-down | Operate a real eligible issue from context to exact source result, with duplicates/lost response/denial and stopping LCC proved. Required source/owner/forge gates remain. Green runs and preview acceptance do not close the mission. |
| 4 — Runtime control | After #57 inventory integration, #117 wraps current reads in provider/pool contracts; #57 follows with public telemetry ingestion/resource/capacity observations; #118 adds one safe local start operation; separately refine drain/restart/scaling only when the provider can enforce safety | Real configured host/pool and source runner inventory, source/cursor/resource provenance, actual independently checked safe provider outcome and denied/race/replay evidence. Kubernetes/VMSS doubles validate abstraction only. Risks: confused identities, excessive host privilege, idle-to-busy race, false capacity. |
| 5 — Health and analytics | #53 adoption/drift and #56 accepted delivery feed #54; use #57 telemetry where available. Define each metric/retention/window, then one reproducible historical signal, then additional producer-backed families | Reproducible calculation from exact inputs; incomplete, stale, non-applicable and missing producers explicit; independently confirmed production outcomes and provider cost where claimed. Risks: deployment-object timestamps, temporal attribution and silent zero values. |
| 6 — Rename and distribution | #120 rehearses independent single-instance installation; #58 proves production identity/TLS/custody/recovery. #121 completes migration/rollback and source-name compatibility, obtains final administrative authorization, then renames the same repository and validates final installation | Stable repository ID/history/issues/PRs/releases and working App/OIDC/CI/source receipt path; actual clean-operator installation. Risk: breaking hashed historical intents, data protection and callback registrations. The repository/folder rename may happen earlier using the bounded cutover in the rename plan; #58/#120 remain separate production/distribution work. |

Issue #119 scoped multi-user access can follow Phase 2 without blocking the personal slice. It must precede team claims or provider operations by additional identities. Current Lighthouse issue-control v1 permits the personal owner; team source writes wait for an independently accepted/released/adopted upstream contract. Scope configuration is sufficient initially; no new identity service, commercial tenancy or enterprise provisioning is selected.

## Reconciled GitHub execution backlog

| Work | Owning issue | Status at inspection | Prerequisite / smallest next result |
| --- | --- | --- | --- |
| Evolution and review | [#116](https://github.com/juangcarmona/sofa/issues/116) | New tracker | Review product/architecture; it is never dispatched as one giant implementation |
| Identity foundation | [#49](https://github.com/juangcarmona/sofa/issues/49) | Completed, merged #84 | Preserve existing boundary; production belongs to #58 |
| Issue context and source evidence | [#50](https://github.com/juangcarmona/sofa/issues/50) | Active #100 | Actual connected-user read acceptance and explicit handling of exhausted automatic-review gate |
| Refine/Propose/comments/Continue | [#47](https://github.com/juangcarmona/sofa/issues/47), [#48](https://github.com/juangcarmona/sofa/issues/48) | Active #112 after #100 | Exact source receipts and actual App-user effects; no separate #47 implementation loop |
| Fleet and issue discovery | [#52](https://github.com/juangcarmona/sofa/issues/52) | Active #103 after #112 | Source-accepted configured repository list/board; later registration/grouping via a bounded follow-on |
| Runtime inventory and usage | [#57](https://github.com/juangcarmona/sofa/issues/57) | Active #105 after #103 | Registration/GitHub inventory acceptance first; public telemetry/cursor ingestion, host measurements and capacity remain explicit follow-ons |
| Intervention workspace | [#51](https://github.com/juangcarmona/sofa/issues/51) | Active #111 after #105 | Common controls and source-confirmed resolution; branch stacking is not an intrinsic dependency on physical runtime inventory |
| Adoption/profiles/drift | [#53](https://github.com/juangcarmona/sofa/issues/53) | Existing open | Reuse #52/#57 declarations; supported-version map and baseline/intentional exceptions; Discovery → Foundations → Maintenance |
| Proposal/integration/accepted delivery | [#56](https://github.com/juangcarmona/sofa/issues/56) | Existing open | Reuse #50/#48 receipts; show allowed source fallback for unsupported protected actions; exact merged head and post-merge acceptance |
| Engineering health | [#54](https://github.com/juangcarmona/sofa/issues/54) | Existing open | Adopt the reviewed measurement catalog one family at a time; durable history only for defined retention |
| Provider contract / local read adapter | [#117](https://github.com/juangcarmona/sofa/issues/117) | New missing increment | Product/ADR acceptance and #57; actual local read plus Kubernetes/VMSS contract doubles |
| One safe provider operation | [#118](https://github.com/juangcarmona/sofa/issues/118) | New missing increment | #117, protected journal design and independent security review; start an allowlisted inactive service only |
| Explicit multi-user scope | [#119](https://github.com/juangcarmona/sofa/issues/119) | New missing increment | #49/#48; two-user read/provider-scope isolation; no emulation of unsupported source actors |
| Independent installation | [#120](https://github.com/juangcarmona/sofa/issues/120) | New missing increment | Workspace acceptance and #58 design; clean operator/origin/configuration rehearsal |
| Remote rename gate | [#121](https://github.com/juangcarmona/sofa/issues/121) | New missing increment | Bounded repo/folder cutover and applicable source-name checks; #58/#120 distribution work continues independently |
| Production identity/custody | [#58](https://github.com/juangcarmona/sofa/issues/58) | Existing open | Real external issuer, callback/permissions, protected persistence/key recovery and negative boundary evidence |
| Idea promotion | [#55](https://github.com/juangcarmona/sofa/issues/55) | Existing open | Optional after source controls; does not block LCC operation |

Completed issues #33/#45/#49/#88/#90/#95/#99 are retained completion evidence, not recreated implementation issues. #16's obsolete supervisor is excluded from dependencies; owner retirement can preserve its negative/history evidence. Existing #60/#71 PRs and diagnostic #77/#80 issues remain intact. Native parent links supplement body links; existing parent relationships are preserved rather than forcibly reassigned. Operational bodies/PRs remain their delivery owners; this roadmap does not rewrite their current grants or acceptance claims.

## Execution and integration rules

Each increment follows the installed Lighthouse lifecycle: triage/refine/propose/implement/integrate/review with source readiness, independent reviews, required checks and human-only decisions. The roadmap grants no request label, workflow dispatch or new unattended merge scope. Existing issue-specific OpenSpec proposals are reused; only genuinely new behavior gets a new proposal under its own issue. A change larger than the accepted bound is refined into separately verifiable work, not dispatched as the tracker.

Before pickup, refresh source/PR/head/attempt, dependencies, WIP and current grants. Rebase dependent candidates only after their prerequisite integrates; rerun affected complete checks on the exact candidate and retain prior receipts. Preserve #50's exhausted automatic correction limit. A renamed product or fresh branch cannot reset budgets, revoke a hold or approve security decisions. Existing physical-phone waivers persist.

For the documentation increment, run product baseline and overlay validation, ProductShape managed-file integrity/doctor, direct architecture citations and OpenSpec provider citations, ArcShape links/reader and Markdown. Run the repository verify pipeline for the candidate and report environmental/source failures accurately. No new behavior tests are needed for prose. Implementation increments require meaningful trust-boundary tests, independent security checks, actual source/provider acceptance and exact-head hosted checks before integration. Deployment is separately approved and verified.

## Gates and next decision

The review package is prepared; CHG-LCC-EVOLUTION-001 is approved by the maintainer on 2026-11-08 and ADR-0010 Proposed. ProductShape apply and human merge remain separate from the recorded approval. Existing accepted workspace work can continue through its own grants; it is not blocked merely by this future provider proposal. The first implementation action after product/plan acceptance is to finish the existing real-source #50/#48 acceptance path. Provider writes, broad access and rename each retain their own reviewed security/operational gates.
