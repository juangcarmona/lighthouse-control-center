# Issue #116 tasks

- [x] 1. Add exact-pinned development-only Acorn and update the lockfile deterministically.
- [x] 2. Implement `tests/frontend-architecture.test.mjs`: parse the current ESM graph; enforce reviewed page/shared/cache/source-control ownership; reject dynamic, absolute, traversal, external and symlink-escaping imports.
- [x] 3. Add negative examples for forbidden imports, unresolved local imports, direct/aliased/dynamic network access from cache, and issue-control POST ownership; include a positive unrelated account-POST example.
- [x] 4. Run focused architecture tests, full Node tests, existing browser checks, strict OpenSpec validation and `git diff --check`; record limitations.
- [ ] 5. Commit locally without pushing. Rollback is limited to the new test and parser dependency/lock entry.

Validation: the focused architecture suite passes 5/5; `npm test` passes 99/99; the existing Playwright suite passes 89/89; Markdown lint passes across 439 files; strict OpenSpec validation and `git diff --check` pass. No browser or production behavior changed. The AST guard detects authored static imports and direct browser transports; it does not prove runtime authorization or arbitrary computed/reflective behavior.
