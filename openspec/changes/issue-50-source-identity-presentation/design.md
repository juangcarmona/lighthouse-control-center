# Presentation boundary

The issue page may update shared workspace identity only after its current `readControls` checks bind the source facts to the requested repository and issue, require the returned actor ID to match `actingUserId`, match the current data scope, and reject stale operation revisions. Use the returned non-empty actor login. Mismatched, missing, stale, unavailable, or authority-revoked facts do not replace identity; existing 401 behavior clears it.

Use distinct copy for permission classes: comment denial remains about issue-write permission; refine/propose/continue workflow denial refers to repository access and GitHub App Actions: write/current dispatch authority. Do not infer that one permission grants another. Keep all existing eligibility checks, disabled states, server reason codes, source requests, CSRF/journal behavior, and human confirmation unchanged.

Browser regressions cover a verified login, actor-ID mismatch, authority loss, and a comment-eligible/workflow-denied response with no POST. The live product behavior test compares the displayed identity to the returned source login when one is present.

<!-- pdac-scope: none reason="Presentation copy and display of already-validated source facts do not change product semantics or requirements." -->
