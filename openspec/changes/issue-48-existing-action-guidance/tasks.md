<!-- pdac-scope: none reason="These tasks validate a bounded UI clarification without changing product semantics." -->

- [x] Add accessible guidance for an `existing` journal response without assuming its stored state.
- [x] Preserve the editable draft and existing recover action.
- [x] Add a browser regression covering a second prepare, explicit recovery of the original prepared intent, and no implicit submit.
- [x] Run the full issue browser file (34/34), the focused existing-action regression, and frontend architecture Node checks (5/5).
- [x] Validate strict OpenSpec, ProductShape citations (216/216 current), Markdown and `git diff --check`.
- [x] Review exact diff for unchanged backend, journal, source-authority and submission behavior.

## Verification record

Playwright `tests/browser/issue.spec.mjs`: 34/34 passed. The focused existing-action regression passed independently. `tests/frontend-architecture.test.mjs`: 5/5 passed. `openspec validate issue-48-existing-action-guidance --strict --no-interactive` passed with zero spec deltas. ProductShape citations verified: 216 current, 0 stale/tampered/unresolved. Markdown lint and `git diff --check` passed. This fixture verification does not establish live connected-user acceptance.
