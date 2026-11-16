# Inspect delivery evidence

Open a configured issue and expand **Delivery evidence**. Lighthouse history and source reports retain their own run, attempt, input revision and result. Proposal text remains in the issue/conversation or its source link; this increment does not download a proposal archive.

For an explicitly referenced PR, open **PR head, checks and reviews**, then **Integration and exact-commit observations**. A PR's head can differ from its squash/rebase result. The integration reader uses the source-confirmed merged commit, not the current branch tip. An unmerged test-merge SHA is not integration. A merge to another branch, or missing default-branch metadata, cannot establish default-branch verification.

Check rows label their revision binding as exact, stale or unknown. A matching row only establishes that observation: it does not establish required-check applicability, human approval or integration authority. Review states retain their own commit and source time; an old approval cannot approve a changed head. Required human decisions stay separate even when automation is green.

The reader retains at most ten source reports and ten explicitly referenced PRs per displayed conversation page, within the existing twenty-second budget and 2 MiB JSON response bounds. Each confirmed default-branch merge adds its first hundred checks and at most ten workflow records, retaining three matching repository/default-branch push executions and the first hundred artifacts per execution. Inventory completeness is labelled separately. Artifact metadata is not verified content or producer provenance; missing/expired artifacts, failures, unknown bindings and partial reads cannot establish delivery. Source details separate source times from observation time.

Implement, Integrate and Review are unavailable through public SDK 0.24.2's typed issue-control contract. Installed stage names do not supply that capability. This view adds no dispatch or merge control; existing supported Refine/Propose, Comment, Continue and original-receipt recovery still use the shared path. Native repository entrypoints remain separate, and an integrate request is an assessment, not merge permission. The lifecycle remains triage → refine → propose → implement → integrate → review.

These observations do not establish production deployment. Refresh after a changed head; never attach a nearby green run to missing evidence. Source authority loss clears inaccessible evidence through the existing session/connection boundary. Closing Control Center does not stop repository execution.

## Qualification still required

Controlled HTTP/browser tests prove handling, not connected-user acceptance. The source operator must inspect existing authorized history through the connected-user path, recording repository/issue, request/result/run/attempt, proposal reference, PR/head, explicit decision, exact merged SHA, matching checks and artifact identities with source/observation times. Record unavailable evidence rather than manufacturing a merge. Independent exact-head review, forge CI and authorized integration remain separate; responsive screenshots do not replace owner visual publication authority or the deferred physical-phone rehearsal.
