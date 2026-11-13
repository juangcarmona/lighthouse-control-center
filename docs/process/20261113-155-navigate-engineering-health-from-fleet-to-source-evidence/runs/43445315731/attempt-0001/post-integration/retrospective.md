## What went well
- Owner acceptance was explicit and bounded: the reviewed captures and connected-user observation are recorded separately. The observation documents its authority and latest-20/first-100 scope; it does not overclaim a complete audit.
- The accepted merge revision is bound to a successful post-merge `verify` check. No source defect was established by this review.

## What went wrong
- Current-main guidance available in this review contradicts the supplied authenticated follow-up account: `docs/runbooks/project-health.md:9,20`, `docs/delivery/evidence/issue-155/platform-reference.md:3,16`, and `openspec/changes/issue-155-proposal/tasks.md:19-26` retain pending/stale statements. The source observation at `docs/delivery/evidence/issue-155/source-observation-2026-11-13.json:29-32` says historical run 42966414214 is outside its bounded window. This is a documentation/evidence consistency gap, not a failed check or established application bug.
- The workflow history includes an earlier implementation evidence-gate failure and several rejected review envelopes, but these are retries/attempts for this single delivery, not evidence of recurrence across work items.

## Start doing
- Before final review publication, reconcile owner decisions and post-merge documentation follow-ups against the exact current-main text and ensure the acceptance artifact explicitly separates fixtures, connected-source evidence, and out-of-window historical records. Owner: maintainer. Smallest guard: a review checklist comparing cited paths/lines with the supplied current-main revision. Reproduce by checking the three cited files against comments 6856029244 and 6856195218; confirm corrected statements and task completion before passing.

## Stop doing
- Stop treating a successful required check, owner comment, or claimed follow-up PR as proof that the checked guidance copy is reconciled. Stop describing fixture captures as connected-user acceptance or inferring deployment/unsupported-source coverage.

## Improvement candidates
- Evidence/current-main reconciliation: observed conflict above; maintainer owns it. Add a small source-text consistency check to review preparation only after separately reviewing the guard and its regression proof. Reproduce with the cited stale passages, then verify that the proposed check flags them and passes on corrected text. No recurrence across distinct work items is established.
- Review-envelope validation: earlier attempts were rejected for misplaced/missing `effect` and missing retrospective (owner comments 6855802637 and 6856195218). This review includes both required fields in the contract positions. This is evidence of multiple validation mistakes in attempts on this one issue, not recurring failure across issues. A separately reviewed pre-publication schema validation guard could be considered; reproduce each malformed shape and ensure rejection, then validate the corrected envelope.