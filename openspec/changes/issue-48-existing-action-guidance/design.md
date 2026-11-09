# Existing-action guidance

<!-- pdac-scope: none reason="This increment explains existing journal behavior and changes no product semantics or system design." -->

## Behavior

When the prepare response has `journalState: existing`, show a plain-language explanation in the existing action confirmation area: the new draft was not prepared, the existing intent is unchanged, and “Recover previous action” reviews its current status and available next step. Leave the composer value untouched. Do not infer that the journal entry is still prepared; the existing state can represent prepared, claimed, uncertain or terminal prior work.

Recovery continues through the existing receipt operation and displays only the journal state actually returned. A prepared entry exposes its existing explicit confirmation; claimed or uncertain entries follow their current reconciliation behavior. There is no automatic recovery, prepare, submit, reconcile, or resend.

## Scope

Change only `src/web/public/issue-actions.js` and add one regression to `tests/browser/issue.spec.mjs`. Add this OpenSpec change directory without a spec delta because the ProductShape use case and requirements already describe repeated-submission recovery. Do not modify server code, the journal, SDK bridge, request payloads, authority checks, CSRF/origin protection or product model.

The browser regression prepares an original comment, edits the composer and receives `existing` for a second prepare. It verifies the explanatory message, preserved replacement draft, original intent in the response and absence of a confirmation button or automatic submit/reconcile. The explicit Recover click then receives a `prepared` entry and reveals that original confirmation while preserving the replacement draft. The test stops before clicking Confirm and asserts no submit was sent.

## Verification and rollback

Run the focused browser case, frontend architecture Node checks, strict OpenSpec validation, ProductShape citation verification, Markdown lint and `git diff --check`. Inspect the diff for unchanged operation flow and source authority.

Rollback only the UI guidance, its regression and this OpenSpec directory. Preserve journal rows, data-protection keys and any source receipts so existing actions remain recoverable.
