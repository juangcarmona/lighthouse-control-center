# Issue-control completion adoption

This delivery consumes the existing accepted authenticated-operations definition and #48 controls. Lighthouse [#119](https://github.com/juangcarmona/lighthouse/issues/119) owns the shared SDK and source authority; [#724](https://github.com/juangcarmona/lighthouse/pull/724) adds prerequisite observations through its canonical admission checks.

The consumer displays those observations in an optional disclosure. Missing and unevaluated evidence remain unavailable; no UI decision grants execution authority. Worker status, exact attempt and validated stage result stay distinct and link to their source. The existing protected journal now records the actual bundled SDK version rather than the original hard-coded 0.22.0.

The source collector, caller transport, immutable intent, claim, authenticated source admission and result reconciliation retain their existing boundaries. No credential, consent, journal reset, automatic resend, scheduler or delivery policy change is introduced. Historical source and connected-user receipts remain valid only for their recorded revisions.

## Delivery evidence

- Source package publication and actual registry archive installation.
- Current package/projection and exact consumer commit.
- Full consumer verification, including command/journal tests and source-result browser regressions.
- Light/dark, desktop/narrow screenshots and keyboard/overflow/accessibility checks.
- Actual connected App-user request, comment, stage result and recovery receipts.
- Merge, postmerge verification and exact running development revision separately.

The owner authorized the completion train. Physical-phone rehearsal remains waived; browser widths do not claim physical-device acceptance. Production readiness remains a separate work item.

## Candidate verification and baseline preflight

Local verification passed with 121 Node, 38 runtime and 324 workspace tests, plus 156 browser cases. Six final focused browser cases passed after adding worker status/attempt/result links. The four new prerequisite views were inspected with keyboard, accessibility and overflow checks at 1280px and 390px in both themes. These are controlled fixtures:

- [Desktop light](upstream-119/prerequisites-1280-light.png), [desktop dark](upstream-119/prerequisites-1280-dark.png).
- [Narrow light](upstream-119/prerequisites-390-light.png), [narrow dark](upstream-119/prerequisites-390-dark.png).

The [connected baseline preflight](upstream-119/connected-preflight-before.json) records the running revision and SDK separately from this candidate. It verifies the actual actor and repository and permits ordinary comments, while Refine/Propose remain denied for missing Actions/write. Contents, Pull requests and Variables reads are also absent. The owner must update the intended App and accept the installation grants before dependent connected qualification. These missing grants are not replaced by operator credentials, public-read fallbacks or a fixture result.

## Published package adoption

[Publication 43966091297](https://github.com/juangcarmona/lighthouse/actions/runs/43966091297) passed for release `0283ff1a5f01650dda4a44e9c7d1732c3af52c0a`. CLI 0.13.18 and SDLC 0.25.1 were downloaded from the default public npm registry and installed, with their lockfile SHA-512 values checked against registry metadata. Both package gitHead values and annotated tags match that release. The [registry/adoption receipt](upstream-119/registry-adoption.json) retains the exact identities.

The owning CLI previewed an upgrade without conflicts, applied only its declared managed projection updates and passed `lighthouse verify`. Existing source-mode stage-worker pins retain their separate reviewed selection; the additive SDK observations change no worker intent or authority. Public-package consumer/bridge checks pass (13 tests), including the new prerequisite observations. Full local verification of this final package selection passed: 121 Node, 38 runtime, 324 workspace and 158 browser tests. [PR #253](https://github.com/juangcarmona/lighthouse-control-center/pull/253) passed both hosted checks and merged at `432163f0131dc968fdd21a5dd47bfeec14a78d4e`. Its postmerge verification is [43968986840](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/43968986840); its final result remains a separate receipt.

The original registry queries returned 404 after successful publication. Actual archive installation above was checked separately after availability; a tag or green release workflow was not counted as installation.

## Connected comment and recovery

The exact merged revision `432163f0131dc968fdd21a5dd47bfeec14a78d4e` was built and activated in the existing development service with SDK 0.25.1. [Deployment](upstream-119/deployment.json) retained the former artifact and unchanged private configuration. [All 21 served JS/CSS/SVG assets](upstream-119/live-assets.json) match the publication. No credential, journal payload or key was read or changed to manufacture an outcome.

Using the actual connected GitHub App-user, the browser prepared and confirmed one ordinary comment on #48. A controlled browser-response loss occurred after the server published it. The application was restarted; the same owner session and GitHub connection survived. Reload and exact-identity reconciliation recovered [source comment 6931172227](https://github.com/juangcarmona/lighthouse-control-center/issues/48#issuecomment-6931172227) without another prepare or send. The [connected proof](upstream-119/connected-comment-proof.json), [independent source read](upstream-119/comment-source-proof.json) and [read-only journal version check](upstream-119/journal-version-proof.json) retain that distinction. The actual journal row records SDK 0.25.1 and a terminal source receipt; its transmission claim remains as a tombstone. This was one source write and requests no continuation.

Actual connected views, separate from the earlier controlled fixtures:

- Comment result: [desktop light](upstream-119/live-comment-1280-light.png), [desktop dark](upstream-119/live-comment-1280-dark.png), [narrow light](upstream-119/live-comment-390-light.png), [narrow dark](upstream-119/live-comment-390-dark.png).
- Source prerequisites: [desktop light](upstream-119/live-prerequisites-1280-light.png), [desktop dark](upstream-119/live-prerequisites-1280-dark.png), [narrow light](upstream-119/live-prerequisites-390-light.png), [narrow dark](upstream-119/live-prerequisites-390-dark.png).

The [current connected preflight](upstream-119/connected-preflight-current.json) still denies Refine/Propose for missing effective Actions/write and reports missing Contents, Pull requests and Variables reads. Continue cannot establish repository policy. Updating and accepting those App installation grants remains an owner action in GitHub. Consequently #47/#48 and upstream #119 remain open for actual dispatch, stage outcome and continuation acceptance. The comment proof does not satisfy those missing operations or production readiness.

## Permission-reader correction and renewal follow-up, 2026-11-17

[PR #257](https://github.com/juangcarmona/lighthouse-control-center/pull/257) corrected the adapter's Variables permission key from `variables` to GitHub's `actions_variables`, and added explicit credential renewal. Both PR checks and exact postmerge verification passed. The connected observation uses development revision `77e9ddcd004cf568724d883aaecf971455454797`. Before any explicit renewal, the [connected observation](upstream-119/connected-permission-correction.json) verified every required read grant, repository policy and eligible Refine with the existing App-user credential. The owner's permission configuration was already sufficient; the incorrect key caused the remaining denial.

The subsequent actual renewal exposed a race: a background read using the previous token could receive 401 after rotation and revoke the current connection. A deterministic regression reproduced that loss. Source credential rejection now carries the token used by that request into the existing atomic owner-grant boundary; an old token or a renewal in progress cannot revoke the newer grant. Current-credential rejection, explicit disconnect and identity-verification failure retain their revocation authority. The already removed connection requires fresh user authorization. No successful actual renewal or native Refine/Propose/Continue outcome is claimed by this correction. Controlled real-source qualification is tracked in [#258](https://github.com/juangcarmona/lighthouse-control-center/issues/258).

## Connected renewal and native-artifact correction, 2026-11-17

After owner reconnection, [actual renewal](upstream-119/connected-renewal.json) preserved account scope, absolute session deadline and effective read grants at development revision `81a3104da7abfc26e19626d3051ed64072b4159e`. The saved observation precedes an operator helper cleanup error; renewal was not repeated.

Actual UI Refine request `0ba3168b-a8fc-4d69-9dbb-01b0f48a803b` reached [router 44048980639/1](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/44048980639), [dispatch receipt 6943118559](https://github.com/juangcarmona/lighthouse-control-center/issues/258#issuecomment-6943118559) and [worker 44049064265/1](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/44049064265). The worker published a real [blocked refinement question](https://github.com/juangcarmona/lighthouse-control-center/issues/258#issuecomment-6943264685). An application restart preserved the connected account and immutable request without a second preparation or send.

The consumer could read source admission but could not authenticate the worker or question because all three artifact boundaries omitted `dispatch.json`. The read helper, authenticated source callback and bounded ZIP transport now accept this exact SDK-required member. The native input archive also carries an unselected root `reserved` marker; only that exact name and 64-byte size are admitted alongside existing supported file types. Unknown members, path traversal, archive limits and credential-free signed-asset downloads retain their existing checks. Regressions reproduced the refusal before the fix. Connected question verification and continuation still require actual candidate qualification; neither the worker's successful workflow nor its visible question substitutes for that verification.

The complete connected reconciliation then reached the existing 20-second request deadline while downloading the same immutable artifact members repeatedly. The helper now reuses each artifact-ID/member value only within one invocation, clones it for each caller, and still validates a fresh inventory before reuse. Source authority, run/dispatch reads, expiry checks, callback count remain unchanged. Regression coverage checks download deduplication, mutable-value isolation and refusal when the second inventory expires.

Actual reconciliation still exceeded 20 seconds after download reuse. Read-only reconciliation now has a 30-second operation budget within the unchanged 35-second request limit. Observation, preparation and submission retain their 20-second caller budgets. A delayed real-bridge regression fails with the old limit and checks reconciliation beyond 20 seconds while retaining exactly one original comment effect.
