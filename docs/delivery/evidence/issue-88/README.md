# Issue #88: qualified Lighthouse adoption

This implements the adoption portion of [#88](https://github.com/juangcarmona/sofa/issues/88), authorized directly by the owner on 2026-11-06. Native delivery qualification, App-push CI at a real candidate and delegated merge remain separate. No unattended delivery, merge or deployment was dispatched. The issue must remain open for those criteria.

## Approved scope and implementation

The owner requested implementation and a reviewable PR, with the existing App and credentials reused. Work started from `origin/main` `6d623d636d3310828a27fd25cde00f0ac77d9a3d` on `chore/88-lighthouse-unattended-adoption` in an isolated worktree. The dirty primary checkout and other worktrees were preserved.

- [x] Inspect the issue, published adoption/unattended/completion/model contracts, installed policy, runner and effective rules.
- [x] Lock CLI 0.12.42 / SDLC 0.20.9, preview reconcile/upgrade and apply the official upgrade.
- [x] Install immutable workflows with `--with-unattended --with-maintenance --replace-reviewed --apply`; completion is included. Retain the supervised workers and existing request form.
- [x] Reconcile labels through the official capability planner/apply: add only missing `execution-failed`; preserve existing labels, custom descriptions and issue decisions.
- [x] Add disabled narrow FF policy, distinct model profiles and complete verification input declarations; retain default owner review.
- [x] Extend `verify` pushes to `lighthouse/verification-*`, preserving its identity and all existing checks.
- [x] Add an owner/default-branch App-only preflight using the pinned official `github-app-ci.mjs check`, with confirmed token revocation required.
- [x] Run application checks, adoption negative controls, official image prerequisites, workflow compilation/schema checks and document activation/rollback.

The [machine-readable receipt](adoption.json) records immutable versions, package integrities and observed boundaries. The [activation procedure](../../../runbooks/lighthouse-unattended.md) describes remaining operator actions and the first separately authorized `merge: false` qualification.

## Published source and ownership

The registry returned CLI **0.12.42** depending on SDLC **0.20.9**; both tarballs identify commit `9b165b590b415dcdb25de5a2f843c6fb30e9e445`. That signed merge includes Lighthouse [PR #498](https://github.com/juangcarmona/lighthouse/pull/498). Its [verification](https://github.com/juangcarmona/lighthouse/actions/runs/42185777239), [package contracts](https://github.com/juangcarmona/lighthouse/actions/runs/42185777212) and [release](https://github.com/juangcarmona/lighthouse/actions/runs/42185885372) completed successfully. npm integrity hashes are retained in the lockfile and receipt; source main or an unpublished local checkout was not used as the release authority.

`lighthouse reconcile` initially reported the old command projection differing from the new package; `lighthouse upgrade --scope all --format json` classified it as adoptable against its recorded ownership hash. The reviewed official upgrade applied it. The project-owned manifest's SDLC selection was set to 0.20.9 before the second official upgrade regenerated its control-plane projection and guide. Subsequent regeneration preserves identical workflow bytes.

The new CLI resolves bundled ArcShape 0.4.0 while SoFa retains direct ArcShape 0.1.6. `lighthouse authorities --adopt-existing` validated the current documents with both provider authorities; applying its reviewed plan recorded the resolved validator version without initializing or rewriting provider files. SoFa's existing `architecture:check` still uses direct 0.1.6. ProductShape remains 0.23.0. Accepted models, active Product Changes, architecture/ADRs, installed provider skills and application source are unchanged.

Live ruleset 25811673 requires `verify` from integration 15368 with strict status checks, prevents deletion/non-fast-forward writes and permits no bypass. Evidence-branch ruleset 25811689 retains deletion/non-fast-forward protection and no bypass. The official protection observer returned the existing adopted digest unchanged. Classic branch protection returned 404; effective rulesets provide the protection. No repository/account settings, credentials or protection rules were changed.

Existing open PRs [#60](https://github.com/juangcarmona/sofa/pull/60), [#71](https://github.com/juangcarmona/sofa/pull/71) and [#84](https://github.com/juangcarmona/sofa/pull/84) and issue decisions were preserved. In particular #49 retains `future`, its pending proposal and security/product approval boundaries. Catalog creation added no request label to any issue.

## Verification

| Check | Observed evidence |
| --- | --- |
| Locked install | `npm ci` passes with Node 24.22.1 / npm 11.19.1; install reports 8 existing toolchain advisories (5 low, 3 high), not a clean audit |
| Repository verification | `CI=true npm run verify` exits 0: Markdown, 32 Node tests (including the five adoption controls), redacted Gitleaks, ProductShape validate/integrity/doctor, ArcShape, 38 full .NET/PostgreSQL/Docker tests and 4 browser tests |
| Adoption controls | Five `tests/lighthouse-adoption.test.mjs` tests cover disabled/eligible routes, scope, 1–3 point limit, protected verification bytes, unavailable reviewer, App scope/revocation and owner-only preflight |
| Foundation | `lighthouse verify --format json`: no blocking checks or authority drift; GitHub-profile live snapshot and general evidence index remain unconfigured observations, not passing native delivery evidence |
| Workflow generation | Official installer and gh-aw 0.93.2 compile all seven workers; `gh aw compile --validate --no-emit --no-check-update` passes; repeated installer preserves source/lock bytes |
| Standalone YAML | actionlint 1.7.12 passes the App preflight and unchanged-check CI workflow without exclusions. Generated adapter YAML passes with the actual custom runner label and only the known `queue` parser limitation excluded |
| Runner and environment | Repository `lighthouse-workflow` runner online/idle; private operator selects immutable .NET/PostgreSQL images. Official `startEnvironment` probes Node 24/npm/Git/Chromium/OpenCode 2.1.0/.NET 10.0.100/PostgreSQL 17 and confirms service/network cleanup |
| Model selection | Official resolver against actual private operator inventory yields Sol Medium implementation and distinct Luna High review. Configuration evidence only; provider access/identity remains unverified |

actionlint 1.7.12 does not recognize the installed official `queue: max` syntax. [GitHub's concurrency documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) explicitly supports it; no generated workflow was weakened to satisfy that older parser. The compiler also reports newer checkout/setup-node versions available; the adopted upstream templates and compiled locks remain unchanged. The initial local Node 24 runner npm shim was incomplete; verification instead used its complete npm CLI and Node binary without modifying the runner.

## Remaining owner actions and limits

After adoption merges, run the owner-only App preflight from `main` and retain its safe summary and run link. Its first default-branch execution is pending: this PR does not claim installation-token scope or revocation has already been proven against the real App. The variable and secret names were observed present without reading the private key.

Verify actual provider access to both models and private runner resource configuration. An available capability declaration or successful environment probe does not prove model execution. Recheck rules, evidence publication and cleanup before the owner separately grants a specific issue and activation change. Retain default owner review and add only that issue's explicit candidate-review override when authorized.

Eligible native App push CI at the exact integration head, a first accepted native SoFa PR and any later separately granted delegated merge/post-merge review remain unqualified. They require real bounded work; no dummy commit or synthetic verification ref was created. The [activation and rollback runbook](../../../runbooks/lighthouse-unattended.md) is explicit about those gates. Keep execution and merge disabled until then.
