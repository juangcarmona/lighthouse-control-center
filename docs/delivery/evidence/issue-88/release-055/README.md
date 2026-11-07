# Lighthouse 0.12.55 / SDLC 0.21.6 adoption

The owner approved publishing this tuple from `83a7796e254f897f40074d6d1bed3d733fc59e32`, adopting it and resuming #99. [Release run](https://github.com/juangcarmona/lighthouse/actions/runs/42372897175) initially published the packages but failed pushing tags because its token lacks `workflows` permission. Operator recovery created only the two annotated tags at that same approved commit. The failed attempt is retained; the retried release result is recorded in `release.json`.

Official CLI upgrade and workflow installation update the installed tuple and immutable harness pin. The #99-only grant, supervised defaults, frozen verification inputs, models and environment retain their exact hashes. Direct product UI remains 0.2.0. This is a maintenance prerequisite; actual native delivery, App-push CI, merge and post-merge evidence remain pending under #88/#99.

`release.json` records registry integrity/source metadata and unchanged authority hashes. Candidate verification and independent review are recorded before integration. Production, development identity and issue workspace delivery are separate.
