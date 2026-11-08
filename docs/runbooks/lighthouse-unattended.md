# Bounded Lighthouse delivery

This is the activation procedure for the adoption in [#88](https://github.com/juangcarmona/sofa/issues/88). Adoption installs workflows; it grants no delivery or merge. The first native SoFa delivery requires a separate owner authorization. The [repository workflow runbook](repository-workflows.md) still governs supervised work.

## Installed policy

On 2026-11-07 the owner authorized autonomous delivery with `merge:true`, then completion of #88/#51/#52/#57 and necessary dependencies. The owner separately authorized lifting #49's `future` hold for development Keycloak and the GitHub user connection; production remains separate. These grants are recorded in the issues. They do not expand unattended agent write scope.

The original read-only slice [#90](https://github.com/juangcarmona/sofa/issues/90) was delivered by the operator in [#97](https://github.com/juangcarmona/sofa/pull/97) after native execution blocked. Its native run remains blocked and does not qualify #88. The current exact native grant is [#99](https://github.com/juangcarmona/sofa/issues/99): source workflow attempts and triggering events. Its initial reviewed prerequisite is [#98](https://github.com/juangcarmona/sofa/pull/98). All broader delivery continues through the shared lifecycle.

| Boundary | Adopted setting |
| --- | --- |
| Execution / merge | `enabled: true`, `merge: true`; exact issue #99 candidate acceptance override only |
| Route / estimate | Only `ff`; low risk, reversible, dependencies resolved, 1–3 points; no five-point opt-in |
| Writable modules | `src/observation/`, `src/web/`, `README.md` and the two exact tests below; Lighthouse adds only its issue-specific OpenSpec planning root |
| Corrections / deadline | One shared planning/candidate correction, 6,600 seconds inside the existing 125-minute job |
| Implementation | `build`: `openai/gpt-6.1-sol`, `medium` |
| Independent review | `plan`: `openai/gpt-6-luna`, `high`; planning and candidate review run separately with read-only source |
| Default acceptance | `.lighthouse/implement.json` retains `reviewRequired: true` and the existing supervised scope and commands |
| Trusted verification | Complete defaults inventory stays frozen. Only issue #99 may extend `tests/observation.test.mjs` and `tests/browser/observation.spec.mjs` with admitted reasons and independent review; existing safety assertions remain required |
| Required GitHub CI | Existing `verify` check, integration ID 15368, including browser and full host .NET/Docker suites |
| Recovery | Maintenance installed; maintenance, automatic recovery, CI repair and report publication require separate opt-ins |

Hotfix, authentication, .NET runtime, ProductShape, ArcShape, credentials, workflow changes and policy changes are outside this unattended write scope. Other tests and all verification entrypoints remain frozen. Only the two reviewed issue #99 corrections above are allowed; the agent cannot grant itself another exception. Owner-only product/security decisions and other `future` holds remain binding, except the separately recorded development authorization for #49. All other issues retain `defaults.reviewRequired:true` and cannot enter unattended delivery without another exact reviewed grant.

## Current authorized delivery

1. Verify the App preflight, distinct provider access, pinned environment, required checks and evidence protection below. The default-branch App preflight [42345617735](https://github.com/juangcarmona/sofa/actions/runs/42345617735) passed with repository-only scope and confirmed token revocation.
2. Review and merge this activation through the existing required `verify` check and independent review. Do not dispatch from an unmerged policy branch.
3. Dispatch `lighthouse-sdlc-unattended.yml` exactly once from current `main` with `issue=99` and `route=ff`. Lost responses require reconciliation rather than blind redispatch.
4. Require source-bound refinement, planning review, implementation, trusted container checks, candidate review, App-created verification ref and full native `verify` before delegated integration. Retain the actual PR/head, merge and post-merge verification and review evidence. No required forge approval may be bypassed.
5. Inspect desktop/mobile browser artifacts and the live read-only view. This delivery does not introduce privileged UI controls, local sessions, runner provisioning, release or deployment. Broader issues #51/#52/#57 stay open.

The activation remains bounded by the exact numeric issue override. To stop new unattended deliveries, restore `enabled:false` and `merge:false` and remove only the `99` override through a reviewed change. Do not alter credentials, protections or supervised defaults. Do not add maintenance/recovery opt-ins as part of this grant.

Project profiles are declarations. Operator overrides have precedence; a different profile name alone proves no independence. The currently inspected operator permits both selected combinations. Live provider access, model identity and effort must be checked on the actual runner before activation; configuration-derived selection does not establish provider-authenticated identity or billing. Missing capabilities fail without fallback. The project does not alter private operator configuration.

## Verify adoption after merge

1. The owner reviews and merges the adoption PR through existing rules. Confirm its `verify` check and the resulting default-branch CI. No workflow in this adoption enables auto-merge.
2. From the default branch, run the safe App-only preflight:

   ```sh
   gh workflow run lighthouse-ci-app-preflight.yml --repo juangcarmona/sofa --ref main
   ```

   Inspect **Lighthouse CI App preflight** in Actions and retain the run link. It admits only the owner as original and triggering actor, on the default branch. The pinned trusted harness checks the existing App installation, requests one-repository `contents: write` scope and revokes the token. A separate step requires `tokenRevoked: true`. The safe summary includes installation, permissions and expiry, never the token or key. No verification ref, commit, PR, model or delivery is created. Missing credentials, excess scope or unconfirmed revocation fail the job. Do not recreate the App or print secrets to diagnose it.
3. Confirm the repository runner is online with `lighthouse-workflow`; check the private engine configuration, pinned image IDs and official environment-builder receipts. Re-run the adopted harness environment preflight for Node 24, npm, Git, Chromium, OpenCode 2.1.0, .NET 10.0.100 and PostgreSQL 17. Confirm the shared gateway job hook and engine lock, resource limits, service cleanup, provider authentication and successful access to both selected models. Retain redacted execution receipts; an operator capability declaration is insufficient.
4. Recheck effective `main` rules: required `verify` / integration 15368, strict checks, no bypass; retain the protected evidence branch. Reobserve evidence protection if rules changed:

   ```sh
   node node_modules/@juangcarmona/lighthouse-sdlc/src/observe-protection.mjs juangcarmona/sofa process/retrospectives
   ```

   Review any changed digest before recording it in `.lighthouse/github.json`. Reconciliation observes rules; it must not weaken them.
5. Run `npm ci`, `npm run verify`, `npx --no -- lighthouse verify --format json` and `gh aw compile --validate --no-emit`. Check that the version tuple, immutable harness pin and installed sources/locks agree. Confirm the existing App settings are available without reading the secret value.

The new App preflight must first reach the default branch; a PR test cannot establish that the real installation passed it. Native App-push CI at an integration head is proven only by the separately authorized delivery below, never by a dummy commit, a fabricated check or manual approval of an ineligible run.

## Original rollout procedure (historical)

The owner replaced the staged first-delivery/merge sequence below with the original #90 grant and then the current #99 grant. These steps preserve the adoption rationale and are not additional approval gates for that grant.

1. Obtain a new explicit owner grant for one open owner-authored issue. It must describe a small, reversible observer improvement within accepted product intent and the declared paths. Resolve dependencies and questions; retain existing holds and pending proposal PRs. Do not reuse #49 or dispatch #88 as a delivery pilot.
2. Prepare a reviewed activation change. Set `.lighthouse/unattended.json` `enabled` to `true`, retaining `merge: false`, `routes: ["ff"]`, scope and budgets. Native admission also rejects `reviewRequired: true`: copy `defaults` into an exact numeric issue entry in `.lighthouse/implement.json`, set **only that issue's** `reviewRequired` to `false` and narrow its `paths` to the unattended paths. Retain its complete verification inventory and checks. Leave `defaults.reviewRequired: true`. This permits independent candidate acceptance for that one grant; owner merge remains required. Review and merge the activation change before dispatch. The disabled adoption itself contains no such override.
3. After approval and all preflights, dispatch exactly once from the current default branch:

   ```sh
   gh workflow run lighthouse-sdlc-unattended.yml --repo juangcarmona/sofa --ref main -f issue="$SOFA_FF_ISSUE" -f route=ff
   ```

   Set `SOFA_FF_ISSUE` to the separately approved issue number. Do not rerun an uncertain attempt: inspect its effects and receipt first.
4. Require the complete chain: issue intent → authenticated request/run/attempt → provider-generated plan and independent planning review → bounded candidate → unchanged verification inputs and host checks → distinct candidate review → PR/head/base → immutable App verification ref and native push CI → existing required `verify`. The container check excludes the two Docker engine tests; the full hosted `verify` includes them and cannot be waived. `merge: false` leaves the PR for the owner; a successful workflow is not merge or deployment evidence.
5. Exercise a safe negative control in local contract tests or a separately authorized qualification: disabled policy, unavailable reviewer or out-of-scope candidate must stop with a concrete blocker. Do not revoke credentials, alter protections or create synthetic remote work merely to test this.
6. Restore `enabled: false` and remove the exact per-issue override through a reviewed change after qualification. Record the real run, reviews, CI, PR and owner decision. Keep #88 open for its remaining native qualification criteria.

Delegated merge requires a later, separate owner grant for another bounded issue and a reviewed `merge: true` policy. This adoption and the first `merge: false` run authorize neither that setting nor automatic approval, release or deployment.

## Roll back to supervised delivery

Set `merge: false`; restore `enabled: false` and remove only the qualification issue's override. Supervised defaults and workers remain installed. For an urgent stop of all new work, the owner can set `LIGHTHOUSE_AUTOMATION_ENABLED=false`; inspect active runs before cancellation or reservation cleanup. Do not unset the existing App credentials or alter repository protections. Do not enable `LIGHTHOUSE_MAINTENANCE_ENABLED`, `LIGHTHOUSE_RECOVERY_ENABLED`, a report index or CI repair as part of this adoption. Installing their workflows does not grant their execution.

After #49 moved the supported observation adapter to .NET, the exact #99 grant includes only its observation source and associated workflow-metadata assertions. Browser access/account code, authentication, token transport, project files and shared compiler/profile inputs remain outside the writable slice or frozen. The current workflow source `ee3f2e591b8ad78db87bc28e6242f1d0f0b7b34c` retains host-prepared OpenSpec discovery, the per-command verification correction and the original delivery-deadline correction below; installed package versions and the single correction budget are unchanged.

## Verification and admission correction

Lighthouse [PR #558](https://github.com/juangcarmona/lighthouse/pull/558), pinned at `860624fcca7eeb676a8d1945088452a6d321061d`, gives each admitted verification command its existing ten-minute deadline independently. Setup and dependency installation no longer consume the following checks’ window. The outer workflow timeout, resource limits, cancellation, fail-stop behavior and exact issue #99 scope remain unchanged. The same source also includes bounded asynchronous engine admission; the private operator may configure its documented wait without increasing concurrent capacity. Do not run manual model reviews or diagnostic engine work during a native qualification run.

A credential-free operator replay of the exact candidate tree from native run [42411980410](https://github.com/juangcarmona/sofa/actions/runs/42411980410) passed all three admitted commands and cleaned its resources with this verifier. That diagnostic result is separate from the still-required native PR, CI, review, integration and postmerge evidence. Prior failures remain retained.

## Original route deadline and bounded retry

Native [run 42429047634](https://github.com/juangcarmona/sofa/actions/runs/42429047634) passed its first trusted checks, then exhausted 3,600 seconds during its single candidate correction for fractional-number precision. It published no PR and remains failed. Its managed correction observations do not replace final host verification or independent acceptance.

The reviewed source of [Lighthouse #569](https://github.com/juangcarmona/lighthouse/pull/569), `ee3f2e591b8ad78db87bc28e6242f1d0f0b7b34c`, shares one original deadline across provider work, CI/mergeability waiting and final authority checks. Source post-merge [verification](https://github.com/juangcarmona/lighthouse/actions/runs/42436609043) and [package checks](https://github.com/juangcarmona/lighthouse/actions/runs/42436608982) passed. The workflow source manifest is SDLC 0.21.11; installed public CLI/SDLC remain 0.12.55/0.21.6.

The project route window is 6,600 seconds (110 minutes), leaving fifteen minutes within the existing 125-minute job for setup and cleanup. The exact #99 grant retains one shared correction, the same models, resources, checks and ten-minute per-command limit. The primary unattended workflow and CI App preflight use the same immutable source. Refresh current merged-source App/provider/environment preflights before one new native request. Native candidate, PR, CI, merge and post-merge review remain required to qualify #88.
