### What went well
- The accepted revision has a passed required `verify` check and a passed post-merge `verify.yml` check (run 43426178457). The delivery retains reviewed desktop/mobile/theme screenshots and a separate bounded connected-source observation in `docs/delivery/evidence/issue-155/`.
- The UI evidence labels fixture data as demonstration data; `docs/runbooks/project-health.md` documents limits on run scope, permission and applicability rather than presenting the signal as a full audit or score.

### What went wrong
- Integration authority is inconsistent: the host-bound dispatch says `merge: false`, while host completion says merged. No owner-authenticated review/answer accompanies the supplied record. This is unresolved process evidence, not a product-code defect.
- Acceptance statements drift: `docs/delivery/evidence/issue-155/README.md` says visual approval occurred, but `platform-reference.md:16` and `docs/runbooks/project-health.md:9` still call acceptance pending. No recurrence across separate work items is established.

### Start doing
- Keep owner approval, connected-source observation and CI verification as separate evidence items, with an authenticated owner decision tied to the exact accepted revision. Owner: repository owner. Smallest useful guard: require a revision-bound decision receipt before recording acceptance. Reproduce by reviewing PR #168’s supplied empty reviews/ownerAnswers and the `merge: false` authorization, then check the receipt is absent and cannot be inferred from CI.

### Stop doing
- Stop carrying forward “pending” acceptance text after a newer decision is recorded, and stop treating a merged state or green check as proof of explicit merge authorization.

### Improvement candidates
- Documentation continuity: the observed conflict is between `README.md`, `platform-reference.md:16`, and `project-health.md:9`. Owner: repository maintainer. Smallest useful guard: update the acceptance status in the evidence index/runbook together after the owner decision, while retaining fixture/source distinction. Reproduce by comparing those three files; verify the correction leaves no contradictory pending/approved claims. This guard is a proposal only; no policy or provider-owned guidance was changed.
- Authorization reconciliation: the observed mismatch is the `merge: false` bound dispatch versus reported merge in the supplied completion. Owner: trusted publisher/host owner with repository owner. Smallest useful guard: surface and require resolution of the authorization/result mismatch before recording review completion. Reproduce with this host record and verify the assessment blocks until a decision is recorded. This single case does not establish recurrence.