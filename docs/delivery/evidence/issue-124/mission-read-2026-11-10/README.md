# Own-repository read checkpoint after workspace integration

Two existing Playwright journeys passed against the real development application for `juangcarmona/lighthouse-control-center` (repository ID `1425429121`), issue #124. Run `2026-11-10T18:29:44.562Z` completed in 35.6 seconds: repository discovery/exact issue lookup (12.3 seconds) and issue description/conversation/provenance with narrow-layout inspection (20.8 seconds).

## Provenance and result

The original reporter identifies test harness `8c5cc49bd1ef9a5087caa0553d89a497833dd845`. The running application is independently activated `0144c6c64820ab936920fe82061e1507543be617`, as recorded in the [development receipt](../../issue-48/comment-feedback-2026-11-10/development-activation.json). Its `src/` tree is identical to integrated main `877bb1fd6219becdbd07e342d0bbc6eeedec517b`; the harness `tests/` tree also matches that main commit. The running binary and reporter revision are separate facts. The original reports were copied without alteration.

[Post-merge repository verification](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42874502250) and [foundation verification](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42874502229) passed for `877bb1f`. The same main was merged into the existing PR #154 candidate before adding this documentation. Its README conflict was resolved by retaining both the dogfooding-guide link and the integrated runtime-inventory paragraph. No application, test, provider policy or credential change is introduced by this evidence increment.

Authentication used a fresh session against the configured trusted development Keycloak and the application's retained GitHub connection. No operator GitHub token was supplied to the application. These cases navigate and read; they do not invoke prepare, submit, reconciliation or a workflow dispatch. They do not independently log network request counts, inject lost responses or verify a new source effect.

## Actual captures and product traceability

- [Repository and source issue lookup](repository.png).
- [Issue description/conversation source context](issue.png).
- [Narrow issue view](issue-narrow.png).

The structured report retains the exact baseline requirement digests and draft Given/When/Then clauses, limitations and six uncovered behaviours. Passing these two journeys contributes partial discovery, collection and issue-context evidence. It does not accept a complete conjunctive behaviour or approve the draft Product Change. The [scope record](scope.json) and [artifact manifest](manifest.json) separate runtime, harness and integration provenance.

## Still open

This is a read checkpoint, not full issue #124 dogfooding acceptance. It does not establish the complete mission-to-workflow/run/attempt/PR/check/integration correlation, a newly confirmed ordinary comment, authorized Refine/Propose/Continue, runtime administration or production deployment.

The original PR #154 native requalification remains blocked. [Lighthouse #586](https://github.com/juangcarmona/lighthouse/issues/586) owns the archived-plan preparation defect. Do not recreate an active plan fragment, forge a completion marker, repeat the unchanged failed qualification, or treat this read evidence and current CI as a substitute for its required native proof. After the owning fix is released and adopted, the same updated PR needs fresh source-bound qualification and independent exact-head review. Original blocked receipts and archived plan remain unchanged.

To reproduce only these reads, use the explicit development parameters in [the test instructions](../../../../../tests/README.md), select this repository and issue #124, and filter the live suite to `live repository discovery|live issue context`. Keep publication opt-in unset. Retained captures were taken only after sign-in; no login form, cookie, password or token-bearing trace is retained.

Local verification initially discovered an empty untracked `openspec/changes/issue-124-proposal/` directory left in this reused worktree after the earlier tracked-fragment removal. Its original failure log is retained. The directory contained no files and was removed with `rmdir` before repeating verification; Git content and the archive were unchanged. A local or restored checkout should check for this exact empty residue before interpreting OpenSpec discovery. This local cleanup does not fix #586, where the native host actively recreates a tracked metadata file.
