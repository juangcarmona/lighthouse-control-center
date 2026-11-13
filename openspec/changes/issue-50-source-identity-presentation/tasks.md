<!-- pdac-scope: none reason="Tasks validate a bounded presentation correction without changing product semantics." -->

- [x] Display the verified source login only after existing issue/actor/scope/current-operation checks pass.
- [x] Explain workflow dispatch permission separately from ordinary issue-comment permission.
- [x] Add browser regressions for verified identity, mismatched actor identity, authority loss, workflow denial, and no write request.
- [x] Compare live displayed identity with the source actor login when the source returns one.
- [x] Run the focused browser file, frontend architecture checks, strict OpenSpec, ProductShape citations, Markdown lint, and diff checks.
- [x] Review exact diff to confirm there are no changes to backend authority, action eligibility, requests, journal, or confirmation behavior.

Verification: `tests/browser/issue.spec.mjs` 36/36 passed; `tests/frontend-architecture.test.mjs` 5/5 passed; strict OpenSpec validation passed with zero spec deltas; ProductShape citations 220/220 current; Markdown lint and `git diff --check` passed. The live source-login assertion was added to the E2E case but was not run against a connected user here.
