# Tasks

<!-- pdac-scope: none reason="Documentation-only tasks under the owner's bounded inventory increment; no product contract changes." -->

## 1. Adoption inventory

- [x] 1.1 Document the exact selected tuple, authority/profile/managed-file boundaries, source contracts and runtime/telemetry capabilities; verify each row against source paths or attributed immutable receipts.

## 2. Operator procedure

- [x] 2.1 Document safe local verification, separate live operator checks and the dependency-bound mission evidence procedure; verify links to #121, #123, #120/PR #153 and the existing #100/#48/#52/#53 work without claiming their acceptance.
- [x] 2.2 Link the guide from existing README/runbook entrypoints; check relative links and keep changes inside the admitted documentation/planning paths.

## 3. Candidate verification

- [ ] 3.1 Run the supplied installation, container and strict proposal checks plus relevant available checks; retain terminal exit receipts, a source-reference report and retrospective, and mark completion only when checks pass.

Verification remains incomplete: locked installation, installed tuple observation, Lighthouse verification, strict proposal validation and the documentation/source-reference check passed. `verify:container` exited 1 during .NET restore with `No space left on device`, after lint, 54 Node tests, secret/model/integrity/spec/citation/architecture checks passed. .NET build/tests and browser checks did not complete. Keep this task open and the candidate blocked; do not alter caches, isolation, resources, tests or policy to manufacture success. The runtime operator owns recovery through the existing upstream #584 path and a fresh required-check receipt.

## Workflow follow-up

- The trusted host independently checks and publishes this candidate; required source-bound review, exact-head forge CI and authorized integration remain separate.
- The later #124 mission demonstration consumes the existing workspace and source acceptance work. This documentation increment does not close the parent issue or authorize provider effects.
