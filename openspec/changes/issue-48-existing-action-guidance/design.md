# Existing-action guidance

<!-- pdac-scope: none reason="This increment explains existing journal behavior and changes no product semantics or system design." -->

## Behavior

When the prepare response has `journalState: existing`, show a plain-language explanation in the existing action confirmation area: the new draft was not prepared, the existing intent is unchanged, and “Recover previous action” reviews its current status and available next step. Leave the composer value untouched. Keep the original journal-backed intent/body/details that the verified prepare response already returns visible before recovery, so the operator can compare it with the editable draft. The server has checked actor and source scope for this response; the returned details are source-backed context, not a current-state confirmation. Do not infer the current journal state from `existing`: it can mask prepared, claimed, uncertain or terminal persisted state.

Recovery continues through the existing receipt operation and displays only the journal state actually returned. “Confirm and send” is exposed only when that explicit recovery response reports `prepared`; claimed, uncertain and terminal entries follow their existing state-specific controls. There is no automatic recovery, prepare, submit, reconcile, or resend.

## Scope

Change only `src/web/public/issue-actions.js` and add one regression to `tests/browser/issue.spec.mjs`. Add this OpenSpec change directory without a spec delta because the ProductShape use case and requirements already describe repeated-submission recovery. Do not modify server code, the journal, SDK bridge, request payloads, authority checks, CSRF/origin protection or product model.

The browser regression prepares an original comment, edits the composer and receives `existing` for a second prepare. It verifies the explanatory message, preserved replacement draft, original intent/body in the verified response and absence of a confirmation button or automatic submit/reconcile. The explicit Recover click then receives a `prepared` entry and reveals that original confirmation while preserving the replacement draft. The test stops before clicking Confirm and asserts no submit was sent.

## Verification and rollback

Run the focused browser case, frontend architecture Node checks, strict OpenSpec validation, ProductShape citation verification, Markdown lint and `git diff --check`. Inspect the diff for unchanged operation flow and source authority.

Rollback only the UI guidance, its regression and this OpenSpec directory. Preserve journal rows, data-protection keys and any source receipts so existing actions remain recoverable.

## Maintainer acceptance correction — 2026-11-10

The original file scope above describes the earlier increment. The current correction also touches issue.html, issue.js, issue.css, browser fixtures and the product-owned Control Center design supplement. Keep the shared action status, review preview, explicit confirmation, receipt and recovery next to the composer in both issue and inbox contexts. On user-triggered preparation or recovery, focus the announced result and bring it into view; maintain the source-backed distinction between prepared, existing, uncertain and published. Retain the busy guard and require a separate Confirm and send click.

Place the composer before a closed-by-default conversation-history disclosure; retain source records, provenance and explicit pagination. Make the description independently collapsible so a long source description cannot bury the editor. Preserve disclosure choice during same-issue updates and clear it on source identity/issue replacement. The existing inert Markdown renderer and raw-source disclosure remain unchanged.

Regressions cover a long thread with local visible confirmation, rapid duplicate review clicks while preparation is pending (one prepare, zero submits), one explicit submit, failed-response recovery without a second submit, and retained draft/authority protections. Verify both themes, desktop/narrow layouts and the complete fixture browser suite. Actual source publication, application activation and whole-PR acceptance remain separately recorded.
