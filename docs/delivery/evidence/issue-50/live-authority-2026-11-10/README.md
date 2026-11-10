# Issue #50 live action-authority observation — 2026-11-10

This is one authenticated, read-only Playwright case against the running development application. The harness was at `c75b369b45eb5a4e3c6db9b909678db4881deca3`; the served application was `399fcd74649eb5f17fbdfbf295156003226b405e`. The focused case passed in 21.4 seconds (24.1 seconds total test command). It did not submit a source command or comment.

The original configured ProductShape reporter outputs are retained as `structured-behaviours.json` and `verification-evidence.json`. They record one passing end-to-end result for `SB-UNAVAILABLE-ISSUE-ACTION`, cited to `FR-ISSUE-CONTEXT`, under draft overlay `CHG-LCC-STRUCTURED-BEHAVIOURS-001`. The observed source response reported `availability: available`, no general `reason`, and missing read scopes `contents`, `pull_requests`, and `variables`; `sourceWritePerformed` is false. The case confirms its explicit UI assertions only. It does not establish full issue #50 acceptance, source-command support, a complete source-read grant, or approval of the draft Product Change.

`action-authority.png` is the authenticated page capture from this case. `SHA256SUMS` covers all retained evidence files except itself and this README.

## Earlier timeout, retained separately

`initial-two-case-timeout.log.gz` and `initial-timeout-context.md.gz` preserve (gzip-compressed byte-for-byte from the original files) the earlier two-case run: repository discovery passed, then the action-authority case timed out waiting 15 seconds for the controls response. That failure is historical and remains a failure; the later focused pass does not rewrite it. The focused repeat used the increased 60-second response wait in the harness. Neither run performed a source write.

## Validation

The `verification-evidence.json` report was checked with ProductShape CLI 0.23.0, serialization `v1alpha2`, in the existing disposable view at `test-results/productshape-evidence-view`. Its `.product/config.yaml` selects the v1alpha2 contract, and its 87 product-model Markdown files are byte-identical to the tracked baseline. Tracked ProductShape configuration was not modified. `productshape-validator-output.json` retains exact CLI stdout: one passed end-to-end result, current `FR-ISSUE-CONTEXT` citation, and no diagnostics. `report-validation.json` records exit status 0, CLI version, command, validation context and the 87-file baseline comparison. The companion `structured-behaviours.json` is the ProductBehaviourReporter output and is retained as source evidence, not as an input to ProductShape’s evidence verifier.
