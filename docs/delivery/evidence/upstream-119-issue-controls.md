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

The owning CLI previewed an upgrade without conflicts, applied only its declared managed projection updates and passed `lighthouse verify`. Existing source-mode stage-worker pins retain their separate reviewed selection; the additive SDK observations change no worker intent or authority. Public-package consumer/bridge checks pass (13 tests), including the new prerequisite observations. Full verification of this final package selection remains required in local and hosted CI.

The original registry queries returned 404 after successful publication. Actual archive installation above was checked separately after availability; a tag or green release workflow was not counted as installation.
