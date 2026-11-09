# Source-bound orchestration retrospective

Recorded 2026-11-09 for `juangcarmona/lighthouse-control-center`, repository ID `1425429121`. This records executed findings and corrections, not issue acceptance or a new delivery policy.

## Owner context changed after refinement

Issue #54 refinement [42710049704](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42710049704) passed. The operator then posted proposal context in owner comment 6753195315. Proposal [42712455756](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42712455756) failed at owner-intent reservation: refinement was stale. No agent executed and no proposal envelope existed. Issue #55 proposal [42713148875](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42713148875) reached the same guard after owner context comment 6753282355. Neither failure was an inference-provider, OpenSpec or CI failure.

The installed shared contract hashes qualifying owner comments with the issue title/body. Corrective context was useful input, but adding it after Ready invalidated the source-bound handoff. The correction is to finish all input first, request a fresh refine, then request propose by label without changing that issue's owner intent or source. The final phase-conditional comments 6753346570 and 6753347435 were posted before fresh refine requests for #54/#55. Their subsequent outcomes must be read from the parent tracker; this record does not predeclare success.

The [shared owner-intent selector](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/src/issue-admission.mjs) and [handoff freshness check](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/src/issue-entry.mjs) remain authoritative. No digest check, permission, gate or failed receipt was relaxed.

## A merged component can still be a candidate

Fresh GitHub reads confirmed PRs #112, #103, #105 and #111 merged on 2026-11-08 into `feat/50-issue-workspace`, not `main`. Their commits are ancestors of PR #100 candidate `eb9d51a7bb7bd883b97b139d57c9553d8f51d8e4`. Default branch `d24953debaab37dfedf7745add1b47dae538a6d7` lacks those candidate handlers. Configuration, runtime, scope and delivery-evidence proposals must identify both states and reuse the assembled candidate implementation. Neither a feature-branch merge nor a status header establishes default-branch integration or actual source acceptance.

## Live evidence must observe the displayed source response

The original issue context capture could occur while controls were refreshing. A settled capture later showed unavailable controls while a separate API preflight was available. A separate preflight does not establish what the displayed page received. The stricter Playwright authority case observes that page's GET-controls response, waits through both loading states and requires the editor/enabled Review comment when the actual response grants comment authority. It passed with explicit sanitized evidence. The intermittent unavailability's cause remains unresolved; later successful observations do not establish its correction. [Original reports and captures](product-behaviours/README.md) retain all outcomes.

## Recovery does not mean repeat an effect

The real publishing tests include failed waits and captures with actual confirmed source effects. Original failures stay failed. Recovery verifies the exact comment and original intent with zero prepare/submit calls; no uncertain action was blindly resent and no journal row was reset. The full fresh publishing case separately passed. These are distinct results, not a rewritten successful history.

## Maintenance does not retry every failed publication

A read-only source/runtime audit found that the recovered draft proposals #147/#148/#144/#143 did not meet the installed automatic-retry gate: their agents succeeded and publishers failed, whereas retry eligibility requires a failed worker and skipped publisher; `future` independently blocks recovery. Leave their requests, holds and maintenance scope intact. A draft PR is not acceptance. The [pinned recovery implementation](https://github.com/juangcarmona/lighthouse/blob/879c4e75efebd945f8aea5b8ee09b97db62edbea/src/packages/sdlc/src/worker-recovery.mjs) owns these checks; no duplicate scheduler or recovery override was added.
