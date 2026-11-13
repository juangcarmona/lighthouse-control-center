# Lighthouse adoption and dogfooding

Original inventory baseline: `d24953debaab37dfedf7745add1b47dae538a6d7`, 2026-11-09. Current package/workflow declaration rows were reconciled against integration source `7ce2654a5917fecfa83a1f5f689e4535b0538fc1` on 2026-11-11; original execution receipts retain their captured versions. This is the documentation-only increment of [#124](https://github.com/juangcarmona/lighthouse-control-center/issues/124), under [#116](https://github.com/juangcarmona/lighthouse-control-center/issues/116). It records repository adoption and a reproducible procedure, not a completed authenticated mission demonstration. Relative source links refer to this checkout; replay against a recorded exact revision, not an assumed latest branch.

## Status and evidence vocabulary

- **Implemented**: present in the inspected source, or completed within the specifically linked receipt's scope. It does not mean deployed or universally qualified.
- **Partial**: a bounded subset exists, or an unmerged candidate has evidence but lacks required acceptance.
- **Unavailable**: the required observation is not supplied here; do not replace it with zero, healthy or passed.
- **Unsupported**: not selected or outside the current contract/authority. Installation or configuration alone cannot authorize it.

The original [owner checkpoint](https://github.com/juangcarmona/lighthouse-control-center/issues/124#issuecomment-6754472591) supplies original stack and acceptance observations; current declaration rows also use the integration source above. This inventory did not query a private runner, authenticate an App user or perform source effects. Older [assessment](../roadmap/lighthouse-control-center-assessment.md), workflow and tooling notes preserve useful history but contain earlier tuples/grants; use the revision-bound declarations below for this baseline.

## Packages, profiles and managed sources

| Surface | Exact selection / evidence | Status and limit |
| --- | --- | --- |
| Lighthouse CLI / SDLC / UI | **0.12.65 / 0.22.4 / 0.2.1** in [manifest](../../package.json), [lock](../../package-lock.json), [Lighthouse manifest](../../lighthouse.json), [SDLC projection](../../.lighthouse/sdlc.json) and [command projection](../../.lighthouse/commands.json) | Implemented adoption. Lock records public npm tarballs and integrity; CLI depends on this same SDLC/UI tuple. Installed versions must still be observed after a successful locked install. No registry-latest assertion or new upgrade is made here. |
| Upgrade receipt | [PR #126](https://github.com/juangcarmona/lighthouse-control-center/pull/126), merge `19a180791df017ae41e2f61144a8995650340ac1`, [merge-SHA verification](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42510933273) | Implemented, owner-supplied completed bootstrap. Do not repeat installer work or relabel it as mission acceptance. |
| ProductShape | `@prodshape/cli` **0.23.0**, direct pin and Lighthouse authority | Implemented tooling; [ProductShape](../product/README.md) owns intent and Product Changes. No accepted model changes in this increment. |
| ArcShape | Direct `@arcshape/cli` **0.1.6**; Lighthouse's nested CLI and adopted authority **0.4.0**, separately locked | Implemented dual selection, not an inconsistent claim that both are the same executable. [Tooling](../tooling.md#arcshape) explains ownership; `architecture:check` uses the direct tool. |
| Delivery planning | `@fission-ai/openspec` **1.15.0**; [configuration/inventory](../../openspec/README.md), [schemas](../../openspec/schemas/) | Implemented provider. Plans share the implementation PR; documentation-only plans use `skip_specs: true`. Plans grant no product approval. |
| Foundation/profile | Baseline **0.1.0**, product identifier `sofa`, selected **dotnet-backend**; application full-stack/dotnet in [manifest](../../lighthouse.json) | Implemented profile selection, partial migration as documented in [tooling snapshot](../../src/dotnet/README.md). `visual-theme` is not selected. Public-site enabled is a declaration, not a publication receipt. |
| .NET source tooling | Adopter-owned CQRS/analyzer snapshot from CLI **0.12.53**, source `dd1694735391f54241604a1686ccd627de7b2036` | Implemented [snapshot](../../src/dotnet/README.md), not an independently installed current NuGet Lighthouse package. Preserve licenses and LH1001/LH1002 checks. |
| Application packages | Aspire CLI/AppHost SDK/Hosting **13.6.5**; OpenIdConnect **10.0.14**; MessagePack **2.5.307**; retained runtime Npgsql **10.0.3** | Exact declarations in [npm manifest](../../package.json), [AppHost](../../src/SoFa.AppHost/SoFa.AppHost.csproj), [workspace](../../src/SoFa.Modules.Workspace/SoFa.Modules.Workspace.csproj) and [runtime](../../src/SoFa.Runtime/SoFa.Runtime.csproj); resolved dependency graphs remain in their `packages.lock.json` files. These are not the SDK/runtime patch version. |
| Runtime environment | Node `>=22` engine; CI Node `24` and .NET `10.0.x`; application target `net10.0`; native environment `dotnet` + PostgreSQL | Partial declarations from [CI](../../.github/workflows/verify.yml), [environment](../../.lighthouse/environment.json) and project files. Ranges, majors and target frameworks are **not exact installed runtime patch versions**. Record actual versions on the checked host. |
| Development provider | Keycloak image tag **26.8.1** in [composition](../../src/SoFa.AppHost/WorkspaceComposition.cs) | Implemented development composition; tag is not a runtime digest/availability receipt. Production provider/custody acceptance stays with #58. |
| Browser/tool checks | Playwright **1.64.1**, axe **4.14.0**, markdownlint-cli2 **0.24.0**, commitlint **21.2.4**, Husky **9.1.7** | Exact direct pins in manifest/lock. Node test runner is supplied by the actual Node runtime; do not invent a separate package version. |

Managed foundation files are enumerated in [`lighthouse.json.managed`](../../lighthouse.json); the fuller [upgrade ledger](../../.lighthouse/upgrade.json) records per-file hashes and ownership, including `LIGHTHOUSE.md`, guard script/hooks, foundation workflow, .NET profile docs/skill, init skill and SDLC/command projections. That ledger, not this prose, is the exact file/hash inventory. Do not hand-edit generated assets. A future authorized upgrade uses the owning versioned installer, previews the diff, preserves ProductShape/ArcShape and source-control authority, and reruns verification.

The [portable skill directory](../../.agents/skills/) contains lifecycle skills and project role adaptations; [`skills-lock.json`](../../skills-lock.json) records upstream toolkit source paths and computed hashes. It is not proof of one universal installed skill release. [Claude skill links](../../.claude/skills/) project those sources; preserve opaque links and never rewrite them as copies. ProductShape/ArcShape skills retain provider ownership. The packaged native execution harness is distinct from those portable skills.

## Workflows, source contracts and runtime evidence

| Capability | Status and concrete evidence | What remains separate |
| --- | --- | --- |
| Native router/workers | Implemented [router](../../.github/workflows/lighthouse-sdlc-router.yml), seven worker source/lock pairs (`triage`, `refine`, `propose`, `implement`, `integrate`, `review`, `apply-review`) in [workflows](../../.github/workflows/). Immutable upstream workflow source **d601fd70412a4c2dd3bdc7bcb6cb9678ad59e01b**; compiled gh-aw **0.93.2**, OpenCode **2.1.0** | Package version, workflow source, compiler and product source are distinct identities. Do not regenerate locks or change pins for this inventory. |
| Typed issue control | Implemented [v1 projection](../../.lighthouse/issue-control.json): six stages, router digest, auto-implementation/completion enabled; public entry `@juangcarmona/lighthouse-sdlc/src/issue-control.mjs`; [consumer evidence](../delivery/evidence/issue-48/contract-adoption.md) | Partial application acceptance: observe/prepare/submit/reconcile contracts do not supply acting-user consent, transport, journal or a real accepted dispatch. #48 owns that boundary. |
| Optional routes | Implemented unattended/maintenance workflow files; [SDLC](../../.lighthouse/sdlc.json) declares supervised, plan-only, unattended, hotfix and stacked routes | Installed route names are not an admission grant. Product Change worker is not selected (`productChangeEnabled:false`); native epic execution is not installed. Such controls are unsupported here, even if router inputs exist. |
| Delegated delivery | Implemented [bounded policy](../../.lighthouse/unattended.json): FF only, low-risk reversible dependency-resolved 1–3 point admission, one shared correction, 6,600-second deadline, explicit paths, merge enabled; [implementation policy](../../.lighthouse/implement.json) and [current grant](lighthouse-unattended.md) | Defaults `reviewRequired:false` alone do not authorize merge. #47/#48/#50/#51/#52/#57/#58 retain supervised overrides; old #99 correction permissions do not transfer. No new correction budget, provider effect or human-decision waiver. |
| Models/review | Implemented [project selection](../../.lighthouse/models.json): build Sol Medium, plan/independent review Luna High | Actual private operator resolution, distinct authenticated model identity and live access are unavailable from source inspection. Independent planning/candidate acceptance remains required where delegated. |
| Canonical repository/checks | Implemented new name in [GitHub contract](../../.lighthouse/github.json): `juangcarmona/lighthouse-control-center`, required `verify` / integration **15368**, evidence branch `process/retrospectives`, zero configured required approvals | Effective forge rules and exact-head checks must be reobserved before integration. Zero configured approvals is not permission to bypass owner-only decisions. No validated release workflow is declared. |
| Rename continuity | Partial, scoped [#121 observations](../delivery/evidence/issue-121/post-rename/README.md): repository **1425429121 / R_kgDOVPZSgQ**, all 45 repaired linked checkouts accessible, eight PRs retained targets; candidate CI at `454f8cdc74233c8bb7386293a1e510251653f753` | Historical pre-cutover inventory, private webhook/callback settings and uncertain-request reconciliation are not proved. Preserve old-name historical evidence and frozen old-name source findings listed in the [runbook](repository-rename-continuity.md). |
| CI App authority | Implemented [owner-only preflight](../../.github/workflows/lighthouse-ci-app-preflight.yml), separately pinned **59ded863109b045e399931dbad61e6cfdb698107** | Current installation scope and confirmed token revocation need an operator-owned real receipt. Historical #99 App-push CI does not attest today's installation. No credential inspection or App reconfiguration here. |
| Runner/environment | Partial: worker label `lighthouse-workflow`, independent executor, pinned environment/preflight contracts described in [workflow operation](repository-workflows.md) | Actual runner liveness, image IDs/digests and provider availability are unavailable here. Registration/labels alone are not capacity. No Docker socket, runner probing or service startup is required for this documentation. |
| Telemetry producer | Implemented [shared adapter](../../.github/workflows/shared/lighthouse-opencode.md) and router post-steps: optional telemetry, run/attempt attribution and artifact retention (14 days), best-effort export | Partial end-to-end evidence: an export step is not exporter health, LCC ingestion, measured host/GPU capacity, model billing or attributable cost. Missing correlation or expired artifacts remain unavailable; #57/#54 own consumption/metrics. |
| Shared visual foundations | Implemented UI **0.2.1** semantic tokens in [web project](../../src/SoFa.Web/SoFa.Web.csproj), [product-owned CSS](../../src/web/public/app.css); identity assets in [asset inventory](../../assets/lighthouse-control-center/) | Reuse #123; no copied/forked design system or second installation path. This increment changes no visuals and makes no new visual publication decision. |
| Observed own repository | Partial: main supports configured observations via [existing GitHub reader](../../src/SoFa.Modules.Workspace/Source/GitHubObservations.cs); owner previously confirmed computer source connection per [identity runbook](development-identity.md) | Current main is not the assembled mission workspace. The real authenticated mission/control demonstration remains pending below. |
| Unsupported operations | No new scheduler, embedded executor, automatic epic decomposition, provider administration, credential/release/deployment change | [ADR-0006](../architecture/09-architecture-decisions/0006-observe-repository-owned-workflows.md) keeps repository delivery independent of LCC. Do not start the retired supervisor to demonstrate dogfooding. |

## Existing delivery and outstanding application slice

These receipts demonstrate real use of the adopted lifecycle, not completion of every #124 criterion:

- [#99 qualification](../delivery/evidence/issue-88/native-qualification/README.md) links issue, original plan/reviews, run **42452259718 / attempt 1**, [PR #113](https://github.com/juangcarmona/lighthouse-control-center/pull/113), checked tree, App-push CI **42455503204**, merge **a9e06e0376f28dd5a3075cfd26c81fcb98130db0**, post-merge CI **42456523349** and accepted final review **42459934534**. Its original CLI/SDLC **0.12.55 / 0.21.6** stay historical, not current adoption versions.
- #126 integrated the requested newer tuple; its merge/check link is above. Owner answers also link real [#54 refinement](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42522662955), not implementation or integration of #54.
- Owner-recorded [#121 requalification run 42527573043](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42527573043) accepted the unchanged reviewed continuity candidate; [PR #128](https://github.com/juangcarmona/lighthouse-control-center/pull/128) merged as **1719c52f16122ed15342de2074d45166c7cf170d**. Earlier failed/blocked receipts remain unchanged.
- This #124 increment's [archived plan](../../openspec/changes/archive/2026-11-10-issue-124-proposal/proposal.md) travels in its implementation PR. Host-supplied request provenance: run **42723277342 / attempt 1**, router **42723155335 / attempt 1**, product/workflow input revision **d24953debaab37dfedf7745add1b47dae538a6d7**. The worker itself did not perform publication or integration; the later source-bound host and forge verification receipts are recorded below.

At the owner's latest checkpoint, [PR #100](https://github.com/juangcarmona/lighthouse-control-center/pull/100) is **unmerged**, published head **0f9e016b8c3e8e00b4e7a8fd2c32dfc57aed4116**; application **399fcd74649eb5f17fbdfbf295156003226b405e** is development-only. Component merges went into its feature branch, not main. Its [product-behaviour evidence](https://github.com/juangcarmona/lighthouse-control-center/blob/0f9e016b8c3e8e00b4e7a8fd2c32dfc57aed4116/docs/delivery/evidence/issue-116/unattended-continuation/product-behaviours/README.md) records 97 fixture and five latest real read/recovery cases, separate actual comment publication, 12 valid report documents and 71 hashes. Those counts do **not** establish source dispatch/current-question acceptance, accepted structured-behaviour/session changes or installation/production qualification. Initial-login and earlier intermittent-controls causes remain unresolved. Do not diagnose them by expanding this increment.

The later demonstration reuses #50/#48 and relevant #52/#53 delivery, plus #51/#56/#57 where applicable. It does not create another mission model, adapter, installer or lifecycle. Preserve exhausted correction limits, existing device waivers and all protected decisions; do not close #124 or parent #116 on the strength of this guide.

## Reproduce the inventory and checks

### 1. Select and record the candidate

Use an existing authorized checkout without overwriting work. Record date, operator, canonical repository/numeric ID, exact source revision, workflow pin and run/attempt. Use normal Git tooling; retain a dirty checkout rather than reset it. Compare the committed manifests, lock and projections above. A future registry refresh/upgrade is separate reviewed installer work, not a prerequisite to rerun this inventory.

For independent installation, reuse [the current installation runbook](control-center-installation.md) and [#120 prerequisite-only proposal PR #153](https://github.com/juangcarmona/lighthouse-control-center/pull/153). Its pending proposal is not an accepted installer or production qualification. Do not silently substitute PR #100 or this inventory revision for the runbook's older explicit installation baseline. A later supported installation must select its own verified artifact/revision and repeat the required checks.

### 2. Check locally, without source writes

On a suitable host, record exact command, exit code and revision for each:

```sh
node --version
npm --version
dotnet --info
npm ci --ignore-scripts
npm ls @juangcarmona/lighthouse @juangcarmona/lighthouse-sdlc @juangcarmona/lighthouse-ui @prodshape/cli @arcshape/cli @fission-ai/openspec --all
npx --no -- lighthouse verify --format json
npm run lint:docs
npm run spec:validate
npm run product:citations
npx --no -- openspec validate issue-124-proposal --strict --no-interactive
```

Use the active change identifier instead if replaying after archive. The supplied candidate check additionally invokes OpenSpec via `npx --yes --package=@fission-ai/openspec@1.15.0`; it must resolve the same pinned provider. Installed `npm ls` output, not targets/ranges, establishes the package tuple actually used. A passing foundation check covers its applicable profiles/projections only; not-applicable visual checks are not visual acceptance.

Run `CI=true npm run verify:container` in the credential-free official environment with host-provisioned PostgreSQL, or `npm run verify` on the supported Docker-capable host. Do not manufacture a database connection or pass Docker into the agent. Container scope excludes the two host engine tests; it cannot replace full hosted verification. [Package scripts](../../package.json), [container wrapper](../../scripts/verify-container.mjs), [runtime verification](../../scripts/verify-runtime.mjs) and [CI](../../.github/workflows/verify.yml) are the authoritative command chain:

| Lane | Checks / evidence boundary |
| --- | --- |
| Regular verify | Markdown, Node tests, redacted secret scanning, ProductShape validate/integrity/doctor, all strict OpenSpec and citations, ArcShape links, locked .NET restore/Release profile/format/module/analyzer rejection/tests, browser tests |
| Browser | Existing [Playwright config](../../playwright.config.mjs) selects `/usr/bin/chromium` when present, one worker, local preview lifecycle and reports; fixture browser success is not real App consent |
| Host/forge | Full `verify`, including Docker engine tests; `test:runtime:host` retains the host lane. PR branch/commit checks also apply. The separate foundation workflow verifies Lighthouse and its guard |
| Separate identity E2E | `npm run verify:identity:host`, nightly/manual, Docker and documented certificate tools; outside PR/push merge CI. Actual source consent remains separate |

Retain terminal receipts and reports, not just a quiet log or a green parent workflow. Missing dependencies, database or tooling stay blocked. Do not change policy, tests, resources or checks to turn that result green. Native worker commands use the supplied managed-command wrapper; the trusted host reruns required checks independently without provider/GitHub credentials.

Original worker observation, 2026-11-10: a successful locked install and `npm ls` confirmed CLI/SDLC/UI **0.12.65 / 0.22.4 / 0.2.1**, ProductShape **0.23.0**, direct/nested ArcShape **0.1.6 / 0.4.0** and OpenSpec **1.15.0**. The checking container reported Node **24.22.1**, npm **11.19.1**, .NET SDK **10.0.100** and Chromium **156.0.8078.47**; these observations do not identify the application's installed .NET runtime patch or a production environment. Applicable installed-Lighthouse checks and strict proposal validation passed. The worker's container verification passed earlier checks, then failed .NET restore with **No space left on device**. Its .NET build/tests and browser lane did not complete, and that worker result remains blocked. npm also reported seven low-severity advisories; no dependency fix or general upstream repair is claimed.

Subsequent qualification: the trusted host independently passed all required commands on published [PR #154](https://github.com/juangcarmona/lighthouse-control-center/pull/154) head **eca22474704ee91c5a4805138c91476157891503**, tree **771b656669aad0dc000a9b2c15838add28cec28a**. [The original host receipt](../delivery/evidence/issue-124/dogfooding/host-checks.json) binds locked npm installation, `CI=true npm run verify:container` and strict OpenSpec to that exact candidate, with exit zero and unchanged protected verification inputs. [Full GitHub verification](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42727030503) also passed at that head. This qualifies the documentation increment's checks; it does not relabel the earlier worker result, prove a general scratch fix or complete the authenticated mission demonstration. Integration uses a fresh final-head review and CI after plan archival.

### 3. Collect live continuity evidence through its owners

The repository administrator/operator follows [repository workflows](repository-workflows.md), [bounded delivery](lighthouse-unattended.md) and [rename continuity](repository-rename-continuity.md). Treat older literal commands/pins in historical sections as history; resolve current declarations before any approved action.

1. Confirm canonical repository identity and exact-head required `verify` with the unchanged integration and effective protections. Before a GitHub write, require the existing `scripts/check-repository-target.mjs` check and verify the actual issue/PR target/state.
2. Obtain the existing owner-only App preflight receipt, including repository-only scope and confirmed revocation. Do not inspect secrets, mint test credentials or make dummy commits.
3. Obtain the operator's existing runner/environment and independent model capability receipts, plus actual run/attempt correlation. Do not infer liveness from a label or access private runner configuration to fill an inventory row.
4. Read stage outcome, command receipts, reviews and source-bound completion, not just workflow conclusion. Preserve older failures, source requests/digests and uncertain effects. Reconcile through the owning contract; never blindly resubmit.
5. Observe telemetry/export-health and coverage only if actually available. Record missing IDs, counters or expired artifacts explicitly. No token, provider configuration, private paths or billing data belongs in public evidence.

### 4. Demonstrate one own-repository mission only when dependencies qualify

This is a later dependency-bound procedure, **not executed by this documentation increment**:

1. Require the existing mission/source-control candidates' acceptance and protected decisions, not a green preview. Resolve actual login/control blockers under their existing owners. Configure `juangcarmona/lighthouse-control-center` through the existing permitted-repository configuration and authenticated user connection; registration grants no source authority. Reuse [development identity](development-identity.md), without broadening App permissions.
2. Select one real, already-authorized LCC issue through the existing fleet/mission workspace. Record its exact source issue, labels/question identity, plan and current observation time. Do not create test issues or dispatch merely to make the demonstration look complete.
3. Inspect its actual source run ID/attempt/event, product revision, workflow revision, PR/head/base, exact check receipts, reviews and outcome. Record missing links as unavailable, not inferred from titles, labels, comments or telemetry.
4. A read or ordinary comment is not Continue/dispatch acceptance. Any separately authorized effect must use the existing typed contract, acting-user authority, protected journal and exact receipt/reconciliation. An uncertain result is reconciled, never resent under a new identity. Preserve current-question/source-consent requirements.
5. Record actual integration SHA and post-merge verification/final review only if they exist. Open/draft/blocked/unmerged is a valid observed outcome; a green worker is not delivered. Production deployment is another boundary.
6. Retain safe post-callback screenshots and a concise report with date, revision, environment, commands/exits and source links. Omit callback URLs, private settings, tokens and raw credential-bearing logs. Existing phone waivers remain; do not claim physical-device acceptance from narrow emulation.

Use this report shape for either inventory or the later mission; `unavailable`, `partial` and `not performed` are honest entries, not invitations to invent receipts:

| Record | Required value |
| --- | --- |
| Scope | Date/operator, repository/numeric identity, inventory-only or authenticated mission |
| Candidate | Product SHA, installed tuple observation, workflow source, actual environment versions |
| Source chain | Issue + plan, workflow/run/attempt, PR/head/base, independent reviews and exact checks |
| Current outcome | Source state, integration SHA/post-merge receipts if present; missing evidence/reason |
| Acceptance | Actual consent/dispatch/current-question result where required; no inference from fixture counts |
| Recovery | Original failure, existing owning issue, bounded action and new receipt; no uncertain replay |

## Remaining gaps and ownership

- #124 retains the authenticated mission demonstration; #50/#48/#52/#53 retain their implementation/acceptance dependencies. #121 supplies scoped continuity evidence, not proof of every private integration.
- #120 / PR #153 and #58 own independent installation and production security/custody. This guide carries forward exact revision selection, locked installs, existing verification and explicit missing evidence; it supplies no second installer.
- [Lighthouse #584](https://github.com/juangcarmona/lighthouse/issues/584) is the owner-reported scratch-exhaustion reliability gap. #128's eventual requalification is not evidence of a general upstream fix. Do not inspect or clean private caches as part of this inventory.
- The prior [assessment](../roadmap/lighthouse-control-center-assessment.md#upstream-delivered-versus-still-open) links [Lighthouse #119](https://github.com/juangcarmona/lighthouse/issues/119) for actual-user issue-control qualification and [#220](https://github.com/juangcarmona/lighthouse/issues/220) for provenance-aware metrics. Those are dated references, not fresh issue-state observations. #57/#54 own LCC telemetry/metrics consumption; package availability is not acceptance.
- Missing current runner/App/provider evidence belongs to the operator, not a new product decision or an excuse to weaken boundaries. Report subsequent delivery status on parent #116 as requested by the owner.
