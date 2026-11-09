# Design: frontend boundary checks

## Approach

Parse the public browser ESM files into syntax trees, derive their static local-import graph, and assert ownership rules against module paths and parsed calls. Resolve local imports to existing files. Keep checks in the current Node test suite and use small synthetic graph/call examples to prove forbidden cases are rejected.

## Boundaries to enforce

- `app.js`, `account.js`, `factory.js`, `issue.js` and `runtime.js` are page entry modules. Shared modules do not import page or feature modules.
- `read-projection-cache.js` is storage-only: it has no imports, browser network calls or source-action behavior. Page modules use its API instead of directly owning session storage.
- `issue-actions.js` is the sole browser owner of POST transport specifically to issue controls. Other legitimate POST paths remain outside this ownership rule. Its only feature callers are `issue.js` and `attention-controls.js`; read-only issue/control queries remain in their existing query modules.
- All authored ESM imports are static and relative, resolve within `src/web/public/`, and remain within the reviewed browser graph. Reject dynamic import, absolute/traversal paths, escaping symlinks, and external bare imports so the checker cannot silently omit a dependency edge.

This test describes existing source ownership, not a generic plugin architecture. Its exact allowlists should change only with reviewed source ownership changes. Positive examples must retain an unrelated account POST, while negative examples reject an issue-controls POST from another module, aliased/dynamic network access in the cache, and escaped imports. Existing behavioral and backend tests remain authoritative for real permission, CSRF, journal and source outcomes. Static AST checks cannot prove behavior hidden through arbitrary runtime indirection, server authorization, or actual source acceptance.

## Non-goals

No production refactor is assumed. No source API or data contract changes. No security claim is inferred from static syntax, and no full dependency-injection/framework abstraction is introduced.
