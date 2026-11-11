# Repository workflows

Lighthouse Control Center uses Lighthouse repository workflows. GitHub runs the work; the web app observes it.

The change-request issue form collects an initial request. The owner can add `triage` for classification and an explained relative estimate, then request `refine` when appropriate. A submitted form does not itself authorize execution.

## Use the workflow

1. Add `refine` to an issue. If the agent asks a question, answer in the issue.
2. When refinement passes, implementation starts. Add `future` to pause it; remove that label to resume.
3. The agent plans with OpenSpec, writes the code, runs checks and opens a PR containing the plan and implementation.
4. Comment on the PR to request changes. The dedicated `apply-review` worker updates the same PR and branch, retaining the proposal or implementation stage. Approve the PR when it is ready; the merge still depends on CI and repository rules.
5. After merge and CI, the final review records the report and retrospective.

A separate `propose` request is still available for design work. There is no requirement to merge a proposal before implementation. Existing product decisions and security approvals still apply.

The router decides and dispatches; each stage has its own Actions execution. Issue receipts show the last observed phase with an icon and source links. Follow Actions for live status. A successful workflow can publish a blocked assessment; inspect the stage outcome before treating a gate as passed.

`agent-working` means an execution is active. `needs-info` means an answer is needed. `waiting-review` means there is a PR or a decision to review. Follow the run linked by the bot for logs, screenshots and checks.

## Operator setup

Register a repository-specific Linux runner with the `lighthouse-workflow` label. Provide Docker and `LIGHTHOUSE_ENGINE_CONFIG` pointing to the private engine configuration. Keep credentials outside the repository and web app. The implementation image must support the repository's checks, including .NET and the runtime tests.

The current gh-aw gateway uses host port 8080. Only one gateway job may occupy the host at a time. [development host] runner job hooks hold a shared host lock for the entire job; the engine lock alone does not cover gateway startup. Confirm this hook is active on every gateway-capable runner before running them together.

Enable `LIGHTHOUSE_AUTOMATION_ENABLED` after installing and checking the workflows. Keep default token permissions read-only. GitHub's setting allowing Actions to create and approve PRs is required for publication; the bot does not approve its own work.

The installed public packages select CLI 0.12.67 / SDLC 0.22.6. Source-mode workflows independently select immutable Lighthouse commit `2123a3343d56cbca5e5cce282fa83119ab8077dd`, using gh-aw 0.93.2. The official `.lighthouse/issue-control.json` projection enables the shared typed client entry for #48. It does not supply acting-user credentials or authorize a delivery. The owner-only CI-App preflight keeps its previously qualified `59ded863109b045e399931dbad61e6cfdb698107` pin. Update package selection and both SDLC/harness projections through the official CLI, then regenerate workflows with the installed installer and run foundation plus full repository checks. Historical [0.12.55 release adoption](../delivery/evidence/issue-88/release-055/README.md) and [native qualification](../delivery/evidence/issue-88/native-qualification/README.md) retain their original immutable facts.

The source-mode update adopts the archived-plan requalification repair from Lighthouse #586/#587, and the installed packages now include its published CLI 0.12.66 and SDLC 0.22.5 release. Package adoption does not refresh #154 completion evidence or alter delivery authorization. See the [bootstrap plan and verification record](../delivery/evidence/issue-124/archive-fix-adoption/README.md). A fresh native result on the candidate head remains required.

The exact #99 grant completed its real native planning, implementation, App-push CI, delegated integration and final review. Failed attempts remain historical; this adoption does not dispatch another run or extend the grant.

Native planning also requires the adopter's [OpenSpec configuration and inventory](../../openspec/README.md). OpenSpec 1.15.0 and the ProductShape-generated integration are installed locally; `npm run verify` checks both specification validity and product citations. Configuration and schemas are protected verification inputs. A containerized runner must persistently mount the private `<engine lock>.resources` directory at its host path alongside the shared lock. Confirm that its actual runner UID can write there before starting work; mounting only the lock file leaves execution preparation blocked.

The installed workers are `triage`, `refine`, `propose`, `implement`, `integrate`, `review` and `apply-review`. Optional unattended and maintenance workflows are installed. Unattended FF and delegated merge are enabled only for the exact issue #99 grant in the [bounded delivery runbook](lighthouse-unattended.md). Other issues retain default owner review. Maintenance, recovery and report publication require separate operator opt-ins and remain disabled. GitHub Actions executes work and issues retain receipts and reservations. The [adoption evidence](../delivery/evidence/issue-74/README.md) records validation and live-acceptance limits.

The router projects implementation PR state after supported events and on a five-minute GitHub Actions schedule, gated by `LIGHTHOUSE_AUTOMATION_ENABLED`. It rechecks bounded candidates and required evidence, including when GitHub suppresses a chained completion event. This reconciliation can return a PR to draft or make a fully checked candidate ready; it does not approve or merge it. Issues show `pr-draft` or `pr-ready` and stay open until post-merge review. This PR-state projection is separate from the optional maintenance workflow and does not establish reconciliation of every canonical `status:*` label.

After publishing refinement, the worker explicitly requests verified implementation continuation through the router. The existing `future` pause and duplicate-dispatch controls still apply. The project declares Sol Medium implementation and Luna High independent review. The existing operator enables profiles and permits these model/effort combinations; its overrides and authentication remain authoritative. Provider access is a separate activation prerequisite. No delivery was dispatched by adoption.

## Reproducible application checks

`.lighthouse/environment.json` selects the official `dotnet` profile with disposable PostgreSQL 17. `.lighthouse/implement.json` installs locked npm dependencies and runs `verify:container` with CI browser settings. Candidate acceptance retains owner review by default; only the exact issue #99 grant permits independent acceptance. The full `verify` CI suite and `test:runtime:host` retain the two Docker engine tests; container verification alone is insufficient for integration.

The operator configuration must map `environments.dotnet.image` and `environments.dotnet.postgresImage` to installed immutable image IDs from the official builder receipt. Keep the existing read-only image, legacy implementation image, provider volume, UID, model and lock. Use Lighthouse's pinned `src/examples/opencode-engine/build-environments.mjs` and its `ENVIRONMENTS.md` procedure when rebuilding. Never pass a host Docker socket into an agent or validation container.

Preflight verifies Node 24, npm, Git, Chromium, OpenCode 2.1.0 and .NET SDK 10.0.100. The host creates separate temporary databases and networks for agent work and independent checks, waits for PostgreSQL readiness and removes them afterward. PostgreSQL is test infrastructure, not an orchestration database. After cancellation, confirm both workload and database containers and their networks disappeared before considering cleanup complete.

To regenerate the existing workflow set from a verified Lighthouse checkout, first preview and review differences, then apply. Keep `--with-issue-control`: omitting it disables the existing #48/#51 client-control route in the generated router.

```sh
node node_modules/@juangcarmona/lighthouse-sdlc/src/install-workflows.mjs . 2123a3343d56cbca5e5cce282fa83119ab8077dd --with-unattended --with-maintenance --with-issue-control --replace-reviewed
node node_modules/@juangcarmona/lighthouse-sdlc/src/install-workflows.mjs . 2123a3343d56cbca5e5cce282fa83119ab8077dd --with-unattended --with-maintenance --with-issue-control --replace-reviewed --apply
```

Commit generated locks with their sources. The host authenticates product revision separately from workflow revision: a manual router dispatch can test this PR's workflow branch, while implementation policy and environment still come from the current default branch. Such a pre-merge run cannot prove activation of an unmerged environment declaration. Use isolated consumer acceptance for the candidate and retain this live-acceptance limitation until post-merge verification.

## Bounded unattended adoption

See [activation and rollback](lighthouse-unattended.md). Native `ff` and delegated merge are enabled for the exact issue #99 override. Scope covers the exact read-only observer files, README, delivery proposal and three specifically reviewed metadata test corrections, including the supported .NET observer after #49; all other verification inputs remain frozen. Hotfix and five-point changes are excluded. Default implementation policy still requires owner review for every other issue. The existing required `verify` job also runs on App-created `lighthouse/verification-*` pushes.

The owner-only **Lighthouse CI App preflight** workflow uses the pinned trusted harness to check the existing App installation, mint a repository-only `contents: write` token, and require confirmed revocation. It creates no verification ref or delivery. It is available for dispatch on the default branch after adoption merges.

## Recovery

Set `LIGHTHOUSE_AUTOMATION_ENABLED=false` to pause new work. Inspect the active run before stopping a runner or removing `agent-working`.

Manual `integrate` and `review` dispatches remain available for recovery. Ordinary operation uses PR feedback, approval and CI events.

The [web view](../../README.md#open-the-factory-view) is still read-only. Closing it does not affect running workflows.
