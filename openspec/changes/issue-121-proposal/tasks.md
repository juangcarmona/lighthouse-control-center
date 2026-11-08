# Tasks

<!-- pdac-scope: none reason="Documentation implementation and operational verification tasks only; product behavior is unchanged." -->

## 1. Current continuity guidance

- [ ] 1.1 Update the roadmap and add the post-rename continuity runbook; verify attribution, worktree preservation, request reconciliation and separate delivery boundaries by document assertions and Markdown lint.
- [x] 1.2 Update the direct installation clone URL while retaining the exact pinned commit and configuration compatibility guidance; verify the source diff and document assertions.

Task 1.1's documents and dependency-free assertions are complete, but Markdown lint could not execute because dependency installation did not complete. It remains unchecked rather than treating partial verification as completion.

## 2. Verification and evidence

- [x] 2.1 Run all three policy checks and applicable documentation/citation checks, retain terminal receipts and a concise retrospective, and validate the final diff against frozen inputs.
- [ ] 2.2 Obtain operator receipts for actual linked-worktree repair, pre-cutover reconciliation and applicable GitHub/integration continuity; verify each acceptance criterion against the receipt checklist before claiming completion.

Task 2.1 records attempts, not passing acceptance: installation was cancelled, container verification stopped at the missing Markdown lint executable, and OpenSpec/citation executables were unavailable. Terminal receipts and the seven passing document assertions are retained under `/output/evidence/`. Required checks must pass before completion. Task 2.2 cannot be performed from this disposable workspace; the actual Bastion and GitHub receipts remain missing.

## Workflow follow-up

- The trusted host independently checks the candidate and publishes a reviewable PR. Required exact-head CI and repository review remain separate from this workspace assessment.
- Keep #121 open while operational evidence is missing; coordinate visual identity with #123, dogfooding with #124 and installation/custody with #120/#58 without making them prerequisites for the bounded rename.
