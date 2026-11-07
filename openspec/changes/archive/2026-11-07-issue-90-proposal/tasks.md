---
pdac-scope: cited
---

# Tasks

## 1. Add source timing without breaking observations

- [x] 1.1 Add optional run startedAt from run_started_at in src/observation/ without changing existing attention facts, source fields, labels, request bounds, PR exclusion or unavailable results. Extend tests/observation.test.mjs for running/queued/pending/requested/waiting/completed, valid/missing/invalid timing and independent unavailable repositories; verify the observation suite and retained source/read-only/input-validation assertions pass in the admitted verification chain (AC1, AC2, AC4, AC6, AC7).
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
- [x] 1.2 Update README's collector usage/limits with additive run timing and unchanged mixed source attention semantics; verify examples and described fields against the observation fixtures and actual collector contract (AC8).
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## 2. Deliver the native overview with tests and usage

- [x] 2.1 Implement active groups, all collected active cards, separate inspectable completed/unclassified history and prominent deduplicated needs-info/waiting-review issues in src/web/. Preserve other source attention items without marking them human waits. Extend tests/browser/observation.spec.mjs alongside this work for all states, more than eight active records, both wait labels, mixed agent-working/ready labels, source identity, revision, links and timing availability; verify visible content, counts and history through Playwright (AC1, AC2, AC7).
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
- [x] 2.2 Add persistent-on-refresh local repository selection, source-keyed focus/disclosure restoration and safe removal fallback. Extend the same browser suite with multi-repository filter selection through successful/failed refresh, identical titles/ids in different repositories, reorder/status/history transitions, changed href, removal and external-control focus; verify keyboard focus remains reachable and scoped metrics/sections agree (AC3, AC7).
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
- [x] 2.3 Implement as-of-observation elapsed/update ages, absolute timestamps, visible latest-20/first-100 bounds, known counts with unknown remainder, all-unavailable/empty/initial-failure states and stale snapshot retention. Add browser cases for missing/null/invalid/future timestamps, partial/unavailable evidence and failed fetch/JSON refresh; verify unavailable is never rendered as zero activity or health and failed refresh does not advance observation time (AC4, AC7).
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
- [x] 2.4 Finish token-based light/dark responsive layout and safe text/links for every new path. Preserve and extend browser security, keyboard and axe assertions, including hostile/off-repository links and long labels/revisions. Verify no horizontal overflow at 390px, exercise filter/refresh/history/focus paths and deliver desktop/mobile screenshots in both themes plus browser reports; label them fixture evidence (AC5, AC6, AC7).
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
- [x] 2.5 Update README with delivered overview, filter/count scope, human-wait labels, source-update versus wait age, missing timestamps, partial/unavailable/stale evidence and unchanged read-only setup. Verify it matches the visible browser paths and makes no session/runner monitoring, production-readiness or #51/#52/#57 completion claim (AC8).
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
- [x] 2.6 Reconcile the delivered behavior with proposal/design/spec and refresh affected citations using provider inspect/cite where dependencies changed; verify each current Markdown artifact has exactly one cited scope declaration and current payloads through the unchanged product:citations step. Stop for product drift rather than changing the accepted model (AC7).
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## 3. Implementation verification

- [x] 3.1 Run `npm ci --ignore-scripts`, `env CI=true npm run verify:container` and `npx --yes --package=@fission-ai/openspec@1.15.0 openspec validate issue-90-proposal --strict --no-interactive` without narrowing the inventory. Retain source-bound exit results and artifacts; verify frozen tests/web.test.mjs still proves allowlist/cache/method/host/cross-site/CSP/error boundaries and application/test edits remain in the admitted paths. Trusted operator integration separately owns evidence publication and provider fold/archive; the native policy remains unchanged (AC6, AC7).
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
- [x] 3.2 Perform supplementary agent inspection of desktop/mobile light/dark artifacts and the live read-only view; record tested interactions, source observation times, collection limits and any unavailable evidence separately from fixture screenshots and trusted receipts. Verify AC1–AC8 mapping and record all remaining limitations without inferring live health from fixtures.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

## Workflow follow-up

- Original task 3.3 is a mandatory host integration gate, recorded here rather than as an implementation checkbox: Obtain distinct independent candidate review after accepted planning review and the full required hosted `verify` on the actual integration candidate, including host .NET/Docker EngineTests and retained browser artifacts. Verify effective forge requirements, source/head bindings and all lifecycle DoD dimensions before integration; report any required failed/unavailable check or protected decision as a concrete blocker (AC7). Initial candidate review accepted `955bc5eebf7a2eb416577297734c3c3c8f5f75dc` with no findings and all eleven DoD dimensions assessed; hosted verification of that head passed. The final post-fold/archive head still requires fresh hosted verification and independent final-head audit before merge. These gates are not waived or claimed complete in this archive.
- The fresh operator snapshot at that head passed all three declared commands; full host and hosted checks passed 34 Node, 38 .NET and 12 browser tests. Operator receipts and the candidate review are retained under `docs/delivery/evidence/issue-90/`.

- Native run [42351913300](https://github.com/juangcarmona/sofa/actions/runs/42351913300) accepted the corrected proposal with independent planning review. Its implementation author declared a blocked result after an executable-cache restriction and absence of GitHub tooling in the editing container. The separate trusted verification subsequently ran all three declared commands successfully, with source integrity and service cleanup confirmed. The controller retained the blocked author result and published no implementation PR; native end-to-end qualification remains open in #88.
- The owner explicitly authorized completing and merging the necessary PRs. This branch continues in the trusted operator lane, preserves the native result, and adds compact cards and a closed-history focus regression test. It changes no execution authority, verification policy, accepted product model or architecture.
- Twelve browser tests now pass in both themes, including source bounds, human waits, timing, unavailable/stale evidence, safe links, mobile layout and focus restoration. Real GitHub inspection at 2026-11-07T08:33:17Z successfully observed both configured repositories and checked desktop/mobile in both themes, zero Axe violations, no overflow, filter preservation on refresh and POST rejection. See `docs/delivery/evidence/issue-90/runtime.json`.
- The original candidate has passed source-bound container checks, the complete host suite including Docker EngineTests, hosted verify and independent review. Final integration repeats the effective forge checks and exact-head review after the provider fold/archive. No failed check or human product decision is waived. Broad #51/#52/#57 and the existing holds remain open; this delivery does not establish authenticated operations, session monitoring, production readiness, release or deployment.
- Fold and archive this delivery plan through OpenSpec after implementation review; audit the final integration head again and retain review/CI links on the PR and issue.
