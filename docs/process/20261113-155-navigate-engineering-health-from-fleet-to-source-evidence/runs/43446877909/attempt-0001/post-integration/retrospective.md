### What went well
- The owner decision, accepted implementation revision (#168), bounded observation, and later documentation reconciliation (#190/#192) are now distinguished. The current runbook states observation limits, unavailable-source boundaries, and that workflow success is not deployment. Required `verify` passed on current main; post-merge `verify.yml` passed.

### What went wrong
- Post-integration guidance needed correction: the historical run was outside the accepted window, and an earlier evidence-protection preflight used a stale observation. These were reconciled by #189, #190 and #192; neither establishes a product defect or failed required Verify check. Earlier review attempts for this same issue also omitted the required retrospective or placed `effect` incorrectly, and host validation rejected them. These are retries within one issue, not evidence of recurrence across work items.

### Start doing
- Keep acceptance evidence pinned to the accepted candidate and explicitly label observation windows, fixture data, and unsupported capabilities. Before publishing a review, validate the complete envelope shape and required retrospective.

### Stop doing
- Do not treat a historical failing run outside the accepted window, skipped optional workflow jobs, or stale host-policy observations as current product failures. Do not infer deployment or unsupported-source coverage from owner acceptance or green verification.

### Improvement candidates
- **Lighthouse workflow maintainers:** observed process failure: review publication was rejected for an incorrectly nested `effect` (run 43441603854) and an earlier attempt omitted `output.retrospective` (run 43438513071). Smallest guard: add pre-publication schema validation with targeted diagnostics for top-level `effect` and the review retrospective. Reproduce by submitting each malformed envelope to the validator and confirming rejection, then submit a valid envelope and confirm acceptance; review the guard and regression proof separately before adoption. No guard change is made here.
- No other improvement finding was established. No attention-time or cost data was observed.