# Bounded activation for the first operational view

On 2026-11-07 Juan explicitly requested activation of autonomous delivery with `merge:true`, followed by the first small read-only operational view from #52/#51/#57. [Issue #90](https://github.com/juangcarmona/sofa/issues/90) records the bounded scope, acceptance and delegation. This grants the requested first native delivery and merge together; it replaces the earlier suggested `merge:false` rollout sequence without weakening checks or forge rules.

## Change and authority

- Enable only native FF with merge, 1–3 points, one correction and a one-hour deadline.
- Keep supervised defaults requiring owner review. Add only issue `90` with independent candidate acceptance and narrow paths.
- Admit two exact test corrections with reasons and require both files to remain present. Other tests, scripts, manifests, locks, workflows, ProductShape, ArcShape, policy and provider inputs stay frozen during native execution.
- Use the existing native collector/server/UI and tokens. The first read-only view partially realizes accepted discovery/intervention/runtime-observation requirements. No significant architecture change: system, trust, execution, persistence and component boundaries remain as in ADR-0006.
- Preserve #49's hold and existing proposal PRs. No identity, runner administration, agent hosting, deployment, maintenance or recovery activation.

## Observed prerequisites

- Current default branch at inspection: `e54ff638f21e1aea335e9c9718ff1b1b27c2405e`; adoption default-branch CI passed.
- [App preflight 42345617735](https://github.com/juangcarmona/sofa/actions/runs/42345617735) passed: existing installation, repository-only contents:write token and confirmed revocation. No ref or delivery created.
- `main` ruleset `25811673` is active with required `verify` / integration `15368`, strict checks, PR required, zero required approvals and no bypass actors. Evidence ruleset `25811689` remains active; official observation matches the committed digest.
- Repository workflow runner online and idle when inspected. Its service reads the existing private engine configuration and host-wide gateway hook. Operator configuration and credential values were not changed.
- Official pinned .NET environment preflight passed for Node 24, npm, Git, Chromium, OpenCode 2.1.0, .NET SDK 10.0.100 and PostgreSQL 17; temporary service/network cleanup passed.
- Isolated read-only provider calls returned `OK` for the resolved `openai/gpt-6.1-sol#medium` and `openai/gpt-6-luna#high` requests. Probe sessions were removed. This proves successful access with those requests; authenticated provider-reported model/settings and billing identity remain unverified by the current adapter.

The [machine-readable receipt](activation-90.json) retains sanitized prerequisite evidence. The activation PR carries full verification and independent review results in its conversation and checks; native delivery receipts will belong to the actual #90 execution. No native delivery is claimed before this activation is merged.

## Execution and rollback

After the activation PR passes checks and independent review, merge under the owner's current grant. Recheck current `main`, issue #90 and runner state, then dispatch the installed unattended workflow exactly once with `issue=90`, `route=ff`. Require the exact candidate, both independent reviews, trusted checks, App-triggered native verify, merge and post-merge evidence. A blocked run retains its real receipt and effects; reconcile before another request.

To stop new unattended deliveries, set `enabled:false`, `merge:false` and remove only the numeric `90` override through a reviewed change. Keep the supervised default, installed workers, existing credentials and protections.
