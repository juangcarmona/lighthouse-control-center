# Lighthouse Control Center: current state and gaps

## Qualification snapshot — 2026-11-09

This section supersedes the status, repository-path and installed-version claims in the historical preparation assessment below. It reports implementation and executed evidence; ProductShape owns intent and the canonical ArcShape views/ADRs own architecture. No new product requirement or architecture decision is introduced here.

Canonical repository: `juangcarmona/lighthouse-control-center`, numeric ID `1425429121`. The repository/folder rename and CHG-LCC-EVOLUTION-001 application through #126 are complete. The accepted model remains under `docs/product/model`; the structured-behaviour formalization and later access-continuity change are distinct, unapplied drafts.

| Source boundary | Exact observed revision and meaning |
| --- | --- |
| Default branch | `d24953debaab37dfedf7745add1b47dae538a6d7`; development identity/observer, adopted Lighthouse and branding baseline. It lacks the candidate issue-control, journal, discovery and runner handlers. |
| PR #100 candidate | `281bb63a0782b986603d9275fa1d38350404b00e`; includes component PRs #112/#103/#105/#111, subsequent workspace/source-read/quality corrections and operational lessons. These component PRs merged into `feat/50-issue-workspace`, not main. PR #100 remains draft and unmerged into main. |
| Activated development binary | `9f1e2f81b96449bdaea28b28e533637550c3a67f`; independently reviewed, private TLS verified and served action JavaScript hash matched. This is development qualification, not production deployment. |
| Adopted shared tuple | CLI `0.12.65`, SDLC `0.22.4`, UI `0.2.1`, with generated workflow source `879c4e75efebd945f8aea5b8ee09b97db62edbea`; package adoption is not source-operation or telemetry acceptance. |

Status vocabulary: **Implemented baseline** means present on the observed default branch; **Partial** means only a bounded subset exists; **Active candidate** means implemented in unmerged PR #100; **New** means absent from the application. A producer or draft proposal is identified separately from an implemented LCC feature.

| Capability | Current classification and proof | Remaining work / owner |
| --- | --- | --- |
| .NET/Aspire, OIDC and GitHub user connection | Implemented baseline; retain the observer, external identity boundary and connected-user transport. Continuity/session refinements are active candidate with a separate draft Product Change. | #49 baseline retained; proposed session decision and #58 production custody remain separate. |
| Fleet and repository discovery | Partial baseline observations; active candidate configured inventory, scoped issue lookup/list/board and filters. Real navigation/exact lookup passed. | #52 acceptance; registration/grouping and full adoption interpretation remain follow-ons. |
| Issues, conversation and history | Active candidate reader, inert content, paging and bounded source/evidence correlation. Actual issue/conversation reading passed. | #50/#56; complete retained mission history and later-stage delivery views are not established. |
| Source operations and interventions | Active candidate shared controls/journal and inbox. A fresh ordinary comment was confirmed in GitHub and separately recovered without prepare/submit. Refine/Propose are denied by actual source grants; Continue lacks its policy input. | #48/#51 real dispatch and current-question acceptance stay open. Comment publication is not delivery. |
| Adoption, versions and drift | Candidate reads declared versions; interpreted compatible baselines, applicability and exceptions remain New. | #53 draft PR #147; no installed/latest/policy inference from a declaration. |
| Runtime infrastructure | Active candidate local registration and permission-gated runner inventory; registration is not measured liveness/capacity. Provider capability contract and administration are New. | #57 qualification, #117 draft PR #144 and separately authorized #118 operation; no scaling/drain/provider adapter is accepted. |
| Engineering health and trends | New LCC ingestion/calculation/history. One actual normalized upstream execution observation exists; the current artifact reader does not ingest telemetry members. | #54 first resource-signal proposal; delivery/adoption/quality signals and comparable trends remain later slices. No DORA, billing or cost is invented. |
| Evidence and observability | Partial baseline source runs; active candidate issue/run/attempt/PR/head/receipt evidence and strict source guards. Ten original passing ProductShape reports retain draft example hashes and baseline citations. | Full correlation and independent verification remain source-specific; no workflow-success-to-delivery inference. |
| Multi-user/resource scopes | New; current owner admission and shared owner-only write support remain. | #119 draft PR #143; no extra identity, repository or provider authority is granted. |
| Identity and independent distribution | Renamed repository, Lighthouse/bench assets and adopted dependencies are baseline; compact Lighthouse workspace is active candidate. Independent installation/restore remains Partial/New. | #121/#123/#124 continuity/acceptance; #120 rehearsal and #58 production evidence remain open. |
| Idea exploration and promotion | New application capability; existing #55 is being refined/proposed. | Define explicit create/link authority and uncertain-response recovery without duplicating #48/#52. |
| Repository-owned autonomous delivery | Implemented bounded Lighthouse route; successful #55 refinement and actual native source-bound handoffs are execution evidence. | Preserve existing grants/holds and independent acceptance; no LCC scheduler or native epic adoption is introduced. |

Full hosted verification at `eb9d51a7` passed 105 Node, 267 workspace .NET, 38 retained-runtime and 90 fixture browser cases, including evaluated analyzer activation, real rejected LH1001/LH1002 compiler examples and frontend module/privileged-transport guards. [Executed source evidence](../delivery/evidence/issue-116/unattended-continuation/product-behaviours/README.md) records six distinct real-service cases across runs, all original failures, ten valid passing reports, sanitized captures and 52 artifact hashes. Fixture/live/draft-product evidence are separate. A settled unavailable-controls capture remains unexplained; subsequent available observations do not prove its cause fixed.

Current source anchors: [baseline module](https://github.com/juangcarmona/lighthouse-control-center/blob/d24953debaab37dfedf7745add1b47dae538a6d7/src/SoFa.Modules.Workspace/WorkspaceModule.cs), [candidate issue reader](https://github.com/juangcarmona/lighthouse-control-center/blob/281bb63a0782b986603d9275fa1d38350404b00e/src/SoFa.Modules.Workspace/Source/GetIssueContextHandler.cs), [journal](https://github.com/juangcarmona/lighthouse-control-center/blob/281bb63a0782b986603d9275fa1d38350404b00e/src/SoFa.Modules.Workspace/Source/ControlJournal.cs), [runner inventory](https://github.com/juangcarmona/lighthouse-control-center/blob/281bb63a0782b986603d9275fa1d38350404b00e/src/SoFa.Modules.Workspace/Runtime/GetRepositoryRunnersHandler.cs), [adopted package pins](https://github.com/juangcarmona/lighthouse-control-center/blob/d24953debaab37dfedf7745add1b47dae538a6d7/package.json), and [stage-chain retrospective](../delivery/evidence/issue-116/unattended-continuation/orchestration-retrospective.md). [Tracker #116](https://github.com/juangcarmona/lighthouse-control-center/issues/116) owns the live queue and changing run outcomes.

No architecture documentation impact: this reconciliation changes no component responsibility, trust boundary, persistence strategy or deployment topology. It corrects evidence classification and links existing sources; the canonical twelve ArcShape views and owning ADRs remain authoritative. Main integration, product/session/ADR decisions, installation, source/provider acceptance and production release remain separate. No enterprise readiness is claimed.

## Historical preparation assessment — 2026-11-08

The following original evidence retains its original timestamps, source revisions and pre-rename names. Its statuses are historical and are superseded by the qualification snapshot above.

Evidence snapshot: 2026-11-08 UTC, before any product apply or rename. Tracking: [#116](https://github.com/juangcarmona/sofa/issues/116). This assessment distinguishes implementation from acceptance; the [roadmap](lighthouse-control-center.md) owns sequencing. Product intent is proposed in [CHG-LCC-EVOLUTION-001](../product/changes/completed/chg-lcc-evolution-001/change.md); architecture remains in the twelve ArcShape views.

### Evidence boundary

SoFa default branch: `4c457c337640795a31492f7219cb0e497df9e232`; Lighthouse default branch: `1e76be4b46e6e402e030fa22d3e233a154fe73bc`. Both were fetched into isolated worktrees. Primary checkouts contain unrelated work and were not changed. GitHub repository ID `1425429121` / node ID `R_kgDOVPZSgQ` is the durable repository identity; current path is `juangcarmona/sofa`, observed public. Package privacy is a separate setting.

GitHub connector search supplied bodies and links but omitted state/check fields. Direct paginated GitHub CLI/API reads supplied issue states, exact heads, merge times and check conclusions. Static plans and PR descriptions were checked against source. The public Platform repositories were checked at the revisions in the [research comparison](lighthouse-control-center-research.md). No host services, provider grants, production credentials or callbacks were changed or exercised in this planning increment.

The accepted ProductShape model contains 71 artifacts and validates with no errors or warnings. Its artifact metadata still uses `draft`; acceptance comes from applied Product Changes and accepted merges, including #82, rather than inference from that field. The authenticated-operations change is completed, not an outstanding draft. Source and active branch facts below are the implementation authority.

### Capability assessment

Status vocabulary: **Implemented** means present on the inspected default branch; **Partial** means only a bounded subset is on that branch; **Active** means code exists in a named unmerged candidate; **New** means absent from the inspected application. Implemented does not attest production deployment or every acceptance scenario. A row naming several statuses separates those surfaces explicitly.

| Domain / capability | Current status and evidence | Retain, evolve or introduce |
| --- | --- | --- |
| .NET application and Aspire | Implemented: `SoFa.Web`, workspace library and AppHost; #49/#84 merged | Retain existing module and presentation boundaries; no framework migration |
| OIDC/Keycloak and GitHub App user connection | Implemented development boundary, bounded sessions, CSRF, source generation/isolation and permission intersection; external-mode configuration exists | Retain; actual connected-user operational acceptance is separate; #58 owns production proof |
| Fleet inventory and repository discovery | Partial: configured repository allowlist and observations. Active: #52/#103 metadata, exact lookup, bounded pages and list/board views | Evolve #52; avoid a second catalog/tracker |
| Register/group/filter repositories | Partial configuration and overview filter; Active #52 issue filters; New runtime registration UI and fleet grouping beyond configured list | Extend #52 in bounded follow-ons after source-reader acceptance; registration grants no source permission |
| Lighthouse versions, profiles, capabilities | Active #57/#105 reads committed package/config declarations; installed catalogs already exist in Lighthouse | Reuse #53 for baseline/profile/capability interpretation; do not execute repository configuration in the web process |
| Adoption journey and drift | Partial declarations; New explicit Discovery → Foundations → Maintenance projection and explained baseline comparison | #53 owns remaining adoption/gaps, intentional exceptions and supported-version matrix; no arbitrary maturity score |
| Unadopted / partial / configured projects | Source reads are not gated on complete adoption; Active configured-project discovery; New complete adoption projection | Keep generic issue observation useful; inaccessible is unknown, not unadopted |
| Missions: issue context and conversation | Active #50/#100: bounded paginated reader, inert content, exact source facts and safe artifacts | Retain candidate and its existing OpenSpec; accept actual connected-user reading before integration |
| Mission dependencies, state and historical attempts | Partial source labels and run attempt/event on main; Active #50 exact evidence/PR/head correlation; New complete retained mission history beyond source/artifact limits | Extend #50/#56 rather than starting another mission engine; preserve failures and missing links |
| Operations: Refine/Propose, comments, explicit Continue | Active #48/#112, public SDK and protected SQLite journal; actual user effects remain open | Complete existing source-controlled path; ordinary comment cannot resume work |
| Interventions and questions | Partial #90 needs-info/waiting-review overview; Active #51/#111 context, common controls and source-only resolution | Preserve separate question identities and accept actual source outcomes |
| Proposals, integration and confirmed delivery | Active #50 shows linked evidence; Partial source production contracts; New full operator-facing #56 actions and acceptance view | Keep run completion, PR integration, post-merge acceptance and production deployment separate |
| Autonomous repository delivery | Implemented adopted bounded Lighthouse route: #88 closed; #99/#113 plus #114 qualification evidence merged | Retain bounded grants and independent native receipts; not an LCC scheduler or general authority for new work |
| Engineering health and historical reporting | Partial source observations; New application calculations/trends under #54 | Adopt explained source definitions and inputs; no universal score or guessed DORA |
| Throughput, lead time, deployment frequency, quality/rework | New LCC projections; upstream GitHub/Lighthouse supplies some records | #54 defines accepted-delivery counts separately from run/PR counts and verifies production outcomes |
| Coverage, mutation, security and engineering excellence | New LCC ingestion; no repository-generated facet history established by this audit | #54 ingests only real versioned artifacts; missing producers remain unavailable |
| Agent autonomy, interventions, tokens, duration and attributable cost | Partial Lighthouse telemetry producer/usage contracts; New LCC consumption and attribution | #57 supplies usage observations; #54 defines ratios/windows/cost coverage; no billing inference from model configuration |
| Runtime inventory: local registrations and GitHub runners | Active #57/#105; local read helper and permission-gated runner API | Retain scoped IDs and unsafe-path defenses; registration is not liveness or capacity |
| Runtime provider/pool abstraction | New: current handlers directly read configured local/GitHub sources | Introduce one capability contract around the existing adapters, without adding services |
| Host/runner/runtime/model/execution separation | Partial upstream schema and candidate records; New normalized provider entities | Distinct identity and lifecycle per entity; names/labels cannot establish a join |
| CPU/memory/GPU/storage/queue/capacity telemetry | Partial upstream runner/engine events and cgroup counters; New LCC stream ingestion, host/GPU probes and measured capacity | #57 owns observations; every unavailable counter and sampled scope stays explicit |
| Authorized scaling, drain, maintenance and service recovery | New application capabilities | Provider-administration increment follows explicit authority and provider outcome checks; unsupported drain/scale is unavailable |
| Runtime policies and limits | Implemented source/operator limits outside LCC; New visible provider capability/policy checks | Providers enforce infrastructure limits; LCC cannot become a second job allocator |
| Evidence and OpenTelemetry correlation | Partial GitHub evidence + Lighthouse versioned telemetry/OTLP logs; Active #50 receipts; New retained cross-source LCC projection | Use source IDs/cursors; telemetry is not proof of acceptance and OTLP is optional transport |
| Multi-user/project/provider access scopes | New: current admission requires one configured issuer/subject; SDK v1 owner-only writes | Retain fail-closed personal default; upstream authorizes source identities before team writes can be enabled |
| Reproducible independent installation | Partial real development identity/run scripts; New supported release/distribution and neutral operator rehearsal | Reuse #58 production security; add packaging/install work without provider administration as a prerequisite |
| LCC identity and repository rename | New public identity/migration; strategic name decided | Product change first; execute [rename plan](lighthouse-control-center-rename.md) only after rehearsed gates |
| Idea exploration and promotion | Accepted intent; New implementation #55 | Retain as optional; it does not block the first Control Center journey |

### Source anchors

| Evidence | What it establishes |
| --- | --- |
| [src/SoFa.AppHost/WorkspaceComposition.cs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/src/SoFa.AppHost/WorkspaceComposition.cs) | Workspace + optional development Keycloak; no supervisor or execution database composed |
| [src/SoFa.Modules.Workspace/WorkspaceModule.cs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/src/SoFa.Modules.Workspace/WorkspaceModule.cs) | Actual protected routes, sessions, source connection and observation boundary |
| [src/SoFa.Modules.Workspace/Identity/OwnerAdmission.cs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/src/SoFa.Modules.Workspace/Identity/OwnerAdmission.cs) and [src/SoFa.Modules.Workspace/Source/RepositoryAccess.cs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/src/SoFa.Modules.Workspace/Source/RepositoryAccess.cs) | Exact owner admission and independent user/App source checks |
| [src/SoFa.Modules.Workspace/Source/GitHubObservations.cs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/src/SoFa.Modules.Workspace/Source/GitHubObservations.cs) | At most 20 runs / 100 open records per repository, source attempt/event, explicit failures |
| [src/observation/github.mjs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/src/observation/github.mjs) and [src/web/public/app.js](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/src/web/public/app.js) | Historical CLI and retained native UI; CLI credentials do not enter authenticated web queries |
| [tests/SoFa.Web.Tests/OwnerBoundaryTests.cs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/tests/SoFa.Web.Tests/OwnerBoundaryTests.cs) and [scripts/verify-identity-provider.mjs](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/scripts/verify-identity-provider.mjs) | Deterministic and actual pinned-provider security checks available in the repository; no new execution claimed by inspection |
| [docs/architecture/09-architecture-decisions/0006-observe-repository-owned-workflows.md](https://github.com/juangcarmona/sofa/blob/4c457c337640795a31492f7219cb0e497df9e232/docs/architecture/09-architecture-decisions/0006-observe-repository-owned-workflows.md) | Accepted repository-owned orchestration and optional Control Center boundary |
| [src/SoFa.Modules.Workspace/Source/GetIssueContextHandler.cs](https://github.com/juangcarmona/sofa/blob/b1f48fde8a08fdf5f91e82b20c6935f5ec091594/src/SoFa.Modules.Workspace/Source/GetIssueContextHandler.cs) | Active #50 reader and scoped source paging |
| [src/SoFa.Modules.Workspace/Source/ControlJournal.cs](https://github.com/juangcarmona/sofa/blob/09b745b7b8ea3b3727129285cedbb0793e564ab0/src/SoFa.Modules.Workspace/Source/ControlJournal.cs) | Active #48 encrypted SQLite intentions/receipts and irreversible send claims |
| [src/SoFa.Modules.Workspace/Source/GetFactoryPageHandler.cs](https://github.com/juangcarmona/sofa/blob/4a3d997598e8556e3d37613964e029c134d24b7c/src/SoFa.Modules.Workspace/Source/GetFactoryPageHandler.cs) | Active #52 bounded configured-repository discovery and list/board records |
| [src/SoFa.Modules.Workspace/Runtime/GetHostInventoryHandler.cs](https://github.com/juangcarmona/sofa/blob/0ae7d3910f2c2a19cc63f33bb89b7d1e0a996337/src/SoFa.Modules.Workspace/Runtime/GetHostInventoryHandler.cs) and [src/SoFa.Modules.Workspace/Runtime/GetRepositoryRunnersHandler.cs](https://github.com/juangcarmona/sofa/blob/0ae7d3910f2c2a19cc63f33bb89b7d1e0a996337/src/SoFa.Modules.Workspace/Runtime/GetRepositoryRunnersHandler.cs) | Active #57 local/GitHub inventory with explicit bounds and admin-read requirement |
| [src/web/public/attention.js](https://github.com/juangcarmona/sofa/blob/fcd09a947fa58bab70616622777e8859aa1251ec/src/web/public/attention.js) | Active #51 inbox presentation; common source controls own mutation behavior |

### Active delivery reconciliation

| PR | Exact observed head | Base branch | State / boundary |
| --- | --- | --- | --- |
| [#112](https://github.com/juangcarmona/sofa/pull/112) | `09b745b7b8ea3b3727129285cedbb0793e564ab0` | `feat/50-issue-workspace` | open; both listed checks successful |
| [#111](https://github.com/juangcarmona/sofa/pull/111) | `fcd09a947fa58bab70616622777e8859aa1251ec` | `feat/57-runner-inventory` | draft; both listed checks successful |
| [#105](https://github.com/juangcarmona/sofa/pull/105) | `0ae7d3910f2c2a19cc63f33bb89b7d1e0a996337` | `feat/52-factory-discovery` | draft; both listed checks successful |
| [#103](https://github.com/juangcarmona/sofa/pull/103) | `4a3d997598e8556e3d37613964e029c134d24b7c` | `feat/48-source-controls` | draft; both listed checks successful |
| [#100](https://github.com/juangcarmona/sofa/pull/100) | `b1f48fde8a08fdf5f91e82b20c6935f5ec091594` | `main` | draft; both listed checks successful |
| [#71](https://github.com/juangcarmona/sofa/pull/71) | `3e75c0ea9275fa04661d8265399d288e4c290de3` | `main` | draft; both listed checks successful |
| [#60](https://github.com/juangcarmona/sofa/pull/60) | `1d9f26b6575ad97f61161d333d2d9eb6454319f7` | `main` | open; failed listed check; inspect exact run |

The stack is `main → #100 → #112 → #103 → #105 → #111`. Retarget/rebase each dependent PR only through its existing delivery after prerequisite integration, preserving source reviews and rerunning affected checks. None is merged by this mission preparation. #50 exhausted its three automatic correction rounds: a new automatic round cannot be inferred from this product mission. Actual connected-user effects and final acceptance remain gates even where hosted checks passed. Existing device waivers recorded in #48/#51 remain valid; do not request a physical-phone rehearsal again or claim one occurred.

| Issue | Observed state | Reconciliation |
| --- | --- | --- |
| [#33](https://github.com/juangcarmona/sofa/issues/33) | CLOSED | Retain observer boundary; #34 merged. |
| [#45](https://github.com/juangcarmona/sofa/issues/45) | CLOSED | Retain web/Lighthouse UI; #46 merged. |
| [#49](https://github.com/juangcarmona/sofa/issues/49) | CLOSED | Retain merged identity #84; production remains separate. |
| [#88](https://github.com/juangcarmona/sofa/issues/88) | CLOSED | Closed completed; qualification #114 merged, not an open adoption dependency. |
| [#90](https://github.com/juangcarmona/sofa/issues/90) | CLOSED | Closed; retain source-backed active work/human waits, broader #51/#52/#57 stay open. |
| [#95](https://github.com/juangcarmona/sofa/issues/95) | CLOSED | Closed; runner telemetry adoption #96 merged; does not prove LCC ingestion. |
| [#99](https://github.com/juangcarmona/sofa/issues/99) | CLOSED | Closed; attempt/event projection #113 merged. |
| [#48](https://github.com/juangcarmona/sofa/issues/48) | OPEN | Active source controls #112; shared acceptance path with #47. |
| [#50](https://github.com/juangcarmona/sofa/issues/50) | OPEN | Active reader #100; source acceptance and exhausted review gate remain. |
| [#51](https://github.com/juangcarmona/sofa/issues/51) | OPEN | Active inbox #111; no resolution inferred from comments. |
| [#52](https://github.com/juangcarmona/sofa/issues/52) | OPEN | Active discovery #103; registration/grouping follow-ons remain. |
| [#53](https://github.com/juangcarmona/sofa/issues/53) | OPEN | Reuse for version/profile/capability/adoption/drift; no duplicate health epic. |
| [#54](https://github.com/juangcarmona/sofa/issues/54) | OPEN | Reuse for metrics and trends after source definitions. |
| [#55](https://github.com/juangcarmona/sofa/issues/55) | OPEN | Keep optional idea journey outside critical path. |
| [#56](https://github.com/juangcarmona/sofa/issues/56) | OPEN | Reuse for proposal/integration/accepted-delivery visibility. |
| [#57](https://github.com/juangcarmona/sofa/issues/57) | OPEN | Active inventory #105; telemetry/capacity remains a follow-on, not completed by registration reads. |
| [#58](https://github.com/juangcarmona/sofa/issues/58) | OPEN | Reuse for production security/custody and actual external-profile acceptance. |
| [#47](https://github.com/juangcarmona/sofa/issues/47) | OPEN | Retain original refinement/proposal evidence; #48 reuses shared command foundation. |
| [#16](https://github.com/juangcarmona/sofa/issues/16) | OPEN | Historical superseded-supervisor issue remains open; propose retirement to owner, never schedule it as LCC work. |
| [#77](https://github.com/juangcarmona/sofa/issues/77) | OPEN | Retain failed refine diagnostic history; not an alternate implementation path. |
| [#80](https://github.com/juangcarmona/sofa/issues/80) | OPEN | Retain failed refine diagnostic history; inspect if selected for repair. |

### Lighthouse contracts and compatibility

The inspected Lighthouse source is `1e76be4b46e6e402e030fa22d3e233a154fe73bc`: CLI `0.12.64`, SDLC `0.22.3`, UI `0.2.1`. SoFa commits CLI `0.12.61`, SDLC `0.22.0` and UI `0.2.0`; ProductShape `0.23.0`, ArcShape `0.1.6`, OpenSpec `1.15.0`. The current immutable SoFa workflow source is `d7ce30a91a9d6c195cc9b6a34e7a42a36737099d` in its generated router/locks, separately from package versions. These facts do not authorize automatic upgrade to Lighthouse main.

| Contract | Evidence and implementation | LCC consequence |
| --- | --- | --- |
| Harness, profiles, adoption and verification | [src/packages/cli/README.md](https://github.com/juangcarmona/lighthouse/blob/1e76be4b46e6e402e030fa22d3e233a154fe73bc/src/packages/cli/README.md); manifest/schema, capability catalog, reconciliation and verify implementation | Consume declared versioned evidence, preserve provider ownership; never execute arbitrary repository scripts in the web process |
| Router, workers and continuations | [src/packages/sdlc/README.md](https://github.com/juangcarmona/lighthouse/blob/1e76be4b46e6e402e030fa22d3e233a154fe73bc/src/packages/sdlc/README.md), `src/packages/sdlc/src/issue-actions.mjs`, `src/packages/sdlc/workflows/` | Six-stage lifecycle, reservations, recovery and publication stay source-owned; source enabled flags and current authority determine actions |
| Public source-control contract | [src/packages/sdlc/issue-control.md](https://github.com/juangcarmona/lighthouse/blob/1e76be4b46e6e402e030fa22d3e233a154fe73bc/src/packages/sdlc/issue-control.md) and exported `src/issue-control.mjs` | Observe/prepare/submit/reconcile; actual user transport, atomic claim, exact receipt, no ambient token fallback; v1 supports owner and limited pending-question types |
| Bounded execution | [src/examples/opencode-engine/README.md](https://github.com/juangcarmona/lighthouse/blob/1e76be4b46e6e402e030fa22d3e233a154fe73bc/src/examples/opencode-engine/README.md), `Dockerfile.runner`, `src/packages/sdlc/src/implementation-runtime.mjs` | Runner, engine environment, harness, inference provider and execution are separate; credentials/checks/publisher remain independent |
| Telemetry | [src/packages/sdlc/telemetry.md](https://github.com/juangcarmona/lighthouse/blob/1e76be4b46e6e402e030fa22d3e233a154fe73bc/src/packages/sdlc/telemetry.md), public module and `telemetry-event.schema.json` | Version 1 event IDs, per-stream sequence/cursor, source and observation times, optional correlation and OTLP HTTP JSON logs; unsupported fields stay null |
| Evidence | [src/packages/sdlc/src/evidence.mjs](https://github.com/juangcarmona/lighthouse/blob/1e76be4b46e6e402e030fa22d3e233a154fe73bc/src/packages/sdlc/src/evidence.mjs), evidence schemas and runtime/stage receipts | An index or event is not independent acceptance; validate the producing source/run/revision and retain gaps |

The native router includes owner/authenticated admission, per-issue concurrency, typed source requests, completion callbacks and scheduled reconciliation. Those mechanisms are implemented upstream and qualify under bounded source-specific receipts; LCC must not recreate them. Some upstream guide language still says issue-control awaits native qualification while released/adopted sources and downstream candidates exist: package availability, installed capability and actual-user qualification are separate evidence fields. LCC should display that distinction rather than use documentation recency as an acceptance verdict.

Compatibility acceptance must include the installed 0.12.61/0.22.0 tuple; a separately selected supported current tuple; and an older/absent/unsupported capability. Preserve read-only issue utility in every case. Unsupported team actor, epic or Product Change control returns its source explanation. No latest-version requirement hides a repository.

### Architecture challenges and retained investments

1. Keep one .NET web process and the current browser assets/Lighthouse tokens. Logical planes do not justify microservices.
2. Keep OIDC identity separate from GitHub user authority and provider administrative grants. Existing owner-only admission is a useful safe default, not a team implementation.
3. Reuse the #48 journal for repository requests. A runtime-command audit may reuse durable storage mechanics after review; it must not reinterpret repository keys or receipts.
4. Avoid PostgreSQL, a broker, global job queue and scheduler merely to draw a fleet view. Legacy runtime/store code remains rollback history; no AppHost dependency is restored.
5. Add durable observation history only for defined history/metric retention. Do not grow a latest-snapshot cache into an unbounded audit or assume expired artifacts can be reconstructed.
6. Treat local privileged access as a new trust boundary. The web process receives neither root nor a Docker socket nor an arbitrary shell endpoint. Unsupported safe drain is explicit; a fresh GitHub busy read alone cannot fence a race with a new job.
7. Keep provider elasticity delegated to the provider/controller. Configuring a capacity bound can be an administrative operation; LCC never assigns a GitHub job to a host.

### Retire or defer

Retire the obsolete supervisor as an architectural dependency and mark historical roadmap links accordingly; preserve its code/evidence until a separate removal decision. Retain #55 ideas without making it a foundation dependency. Defer enterprise service topology, organization-wide discovery credentials, new model engines, default autoscaling, push notifications, terminal/file explorers, custom scorecards and platform-wide quality thresholds until an accepted requirement and actual evidence justify them. Multiple providers and hundreds of repositories are contract and capacity validation targets, not current readiness claims.

### Upstream delivered versus still open

At the live inspection, Lighthouse [#521](https://github.com/juangcarmona/lighthouse/issues/521) telemetry and [#567](https://github.com/juangcarmona/lighthouse/issues/567) trusted completion recovery are closed completed. The source-owned callbacks and bounded recovery are implementation evidence, not an LCC controller requirement. [#119](https://github.com/juangcarmona/lighthouse/issues/119) remains open despite the published issue-control SDK: actual-user qualification and remaining acceptance must not be inferred from package availability. [#220](https://github.com/juangcarmona/lighthouse/issues/220) provenance-aware delivery/attention metrics remains open backlog work; its prospective shared definitions are not implemented LCC analytics. Reuse these upstream owners rather than create duplicate lifecycle/metric policy in Control Center.

The retained [native SoFa qualification](../delivery/evidence/issue-88/native-qualification/README.md) binds the completed #99 path to its original older CLI/SDLC tuple, exact candidate/merge, App-triggered CI, post-merge checks and final review. Later installed package upgrades are separate facts. Qualification of that bounded path does not grant new issue, provider, identity or rename authority.
