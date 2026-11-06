# Bounded Lighthouse delivery

This is the activation procedure for the adoption in [#88](https://github.com/juangcarmona/sofa/issues/88). Adoption installs workflows; it grants no delivery or merge. The first native SoFa delivery requires a separate owner authorization. The [repository workflow runbook](repository-workflows.md) still governs supervised work.

## Installed policy

| Boundary | Adopted setting |
| --- | --- |
| Execution / merge | `enabled: false`, `merge: false` |
| Route / estimate | Only `ff`; low risk, reversible, dependencies resolved, 1–3 points; no five-point opt-in |
| Writable modules | Read-only observer collector `src/observation/` and presentation `src/web/`; Lighthouse adds only its issue-specific OpenSpec planning root |
| Corrections / deadline | One shared planning/candidate correction, 3,600 seconds |
| Implementation | `build`: `openai/gpt-6.1-sol`, `medium` |
| Independent review | `plan`: `openai/gpt-6-luna`, `high`; planning and candidate review run separately with read-only source |
| Default acceptance | `.lighthouse/implement.json` retains `reviewRequired: true` and the existing supervised scope and commands |
| Trusted verification | Exact files and prefixes in `defaults.verification.paths`; no test correction exceptions |
| Required GitHub CI | Existing `verify` check, integration ID 15368, including browser and full host .NET/Docker suites |
| Recovery | Maintenance installed; maintenance, automatic recovery, CI repair and report publication require separate opt-ins |

Hotfix, authentication, .NET runtime, ProductShape, ArcShape, credentials, workflow changes and policy changes are outside this unattended write scope. New or modified tests under `tests/` are frozen too. A future change needing tests or a different module needs a reviewed scope and exact test-correction decision before admission; the agent cannot grant itself an exception. Owner-only product/security decisions and `future` remain binding, including #49.

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

## Separately authorize the first delivery

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

Keep `merge: false`; restore `enabled: false` and remove only the qualification issue's override. Supervised defaults and workers remain installed. For an urgent stop of all new work, the owner can set `LIGHTHOUSE_AUTOMATION_ENABLED=false`; inspect active runs before cancellation or reservation cleanup. Do not unset the existing App credentials or alter repository protections. Do not enable `LIGHTHOUSE_MAINTENANCE_ENABLED`, `LIGHTHOUSE_RECOVERY_ENABLED`, a report index or CI repair as part of this adoption. Installing their workflows does not grant their execution.
