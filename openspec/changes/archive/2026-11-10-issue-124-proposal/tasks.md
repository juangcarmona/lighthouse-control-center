# Tasks

<!-- pdac-scope: none reason="Documentation-only tasks under the owner's bounded inventory increment; no product contract changes." -->

## 1. Adoption inventory

- [x] 1.1 Document the exact selected tuple, authority/profile/managed-file boundaries, source contracts and runtime/telemetry capabilities; verify each row against source paths or attributed immutable receipts.

## 2. Operator procedure

- [x] 2.1 Document safe local verification, separate live operator checks and the dependency-bound mission evidence procedure; verify links to #121, #123, #120/PR #153 and the existing #100/#48/#52/#53 work without claiming their acceptance.
- [x] 2.2 Link the guide from existing README/runbook entrypoints; check relative links and keep changes inside the admitted documentation/planning paths.

## 3. Candidate verification

- [x] 3.1 Run the supplied installation, container and strict proposal checks plus relevant available checks; retain terminal exit receipts, a source-reference report and retrospective, and mark completion only when checks pass.

Original worker verification remained incomplete: `verify:container` exited 1 during .NET restore with `No space left on device`. That result remains blocked in native run `42723277342`; it has not been rewritten or counted as passed.

Subsequent trusted-host verification of published PR #154 head `eca22474704ee91c5a4805138c91476157891503`, tree `771b656669aad0dc000a9b2c15838add28cec28a`, passed all three required commands: locked npm installation, `CI=true npm run verify:container` and strict OpenSpec. The original source-bound receipt is retained at `docs/delivery/evidence/issue-124/dogfooding/host-checks.json`; protected verification inputs match the baseline. Exact-head full GitHub verification `42727030503` also passed. These later receipts complete this documentation increment's checks without changing resources, checks, policy or the old worker result. Final integration-head review and CI remain separate.

## Workflow follow-up

- The trusted host independently checks and publishes this candidate; required source-bound review, exact-head forge CI and authorized integration remain separate.
- The later #124 mission demonstration consumes the existing workspace and source acceptance work. This documentation increment does not close the parent issue or authorize provider effects.
