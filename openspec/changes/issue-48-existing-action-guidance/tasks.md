<!-- pdac-scope: none reason="These tasks validate a bounded UI clarification without changing product semantics." -->

- [x] Add accessible guidance for an `existing` journal response without assuming its stored state.
- [x] Preserve the editable draft and existing recover action.
- [x] Add a browser regression covering a second prepare, explicit recovery of the original prepared intent, and no implicit submit.
- [x] Run the full issue browser file (34/34), the focused existing-action regression, and frontend architecture Node checks (5/5).
- [x] Validate strict OpenSpec, ProductShape citations (216/216 current), Markdown and `git diff --check`.
- [x] Review exact diff for unchanged backend, journal, source-authority and submission behavior.

## Verification record

Playwright `tests/browser/issue.spec.mjs`: 34/34 passed. The focused existing-action regression passed independently. `tests/frontend-architecture.test.mjs`: 5/5 passed. `openspec validate issue-48-existing-action-guidance --strict --no-interactive` passed with zero spec deltas. ProductShape citations verified: 216 current, 0 stale/tampered/unresolved. Markdown lint and `git diff --check` passed. This fixture verification does not establish live connected-user acceptance.

## Acceptance correction — 2026-11-10

The previous verification record remains historical. These tasks concern the newly reported feedback-placement and long-thread defects in the existing PR.

- [ ] Keep action status, confirmation, result and recovery adjacent to the editor, with deliberate result focus and visible progress.
- [ ] Put the editor before collapsed conversation history and provide an independent description disclosure without losing source content or pagination.
- [ ] Extend browser regressions for visible local confirmation, rapid duplicate clicks, one explicit submit, recovery/no-resend and identity boundaries.
- [ ] Update the product-owned design guardrail for feedback locality and long-thread density.
- [ ] Run full repository/browser verification and retain light/dark desktop/narrow captures.
- [ ] Obtain independent final-head review; record source effect/activation separately and update the existing PR only.
