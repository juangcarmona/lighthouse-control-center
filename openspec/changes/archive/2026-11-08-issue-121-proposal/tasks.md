# Tasks

<!-- pdac-scope: none reason="Documentation implementation and operational verification tasks only; product behavior is unchanged." -->

## 1. Current continuity guidance

- [x] 1.1 Update the roadmap and add the post-rename continuity runbook; verify attribution, worktree preservation, request reconciliation and separate delivery boundaries by document assertions and Markdown lint.
- [x] 1.2 Update the direct installation clone URL while retaining the exact pinned commit and configuration compatibility guidance; verify the source diff and document assertions.

The original worker could not complete dependency installation. The operator completed installation and reran documentation validation; exact receipts are retained with the candidate.

## 2. Verification and evidence

- [x] 2.1 Run all three policy checks and applicable documentation/citation checks, retain terminal receipts and a concise retrospective, and validate the final diff against frozen inputs.
- [x] 2.2 Record actual linked-worktree and GitHub continuity receipts, with unavailable historical evidence and private integration checks explicitly left to #121 operational closeout. This documentation increment does not claim the full rename acceptance complete.

The original installation and validation failures remain historical evidence. Hosted verification passed at 454f8cdc74233c8bb7386293a1e510251653f753. Current operator receipts are retained under `docs/delivery/evidence/issue-121/post-rename/`. A complete pre-cutover snapshot cannot be recreated after the rename; private integration acceptance remains outside this documentation increment, recorded rather than inferred. Final-head checks are required again after these edits.

## Workflow follow-up

- The trusted host independently checks the candidate and publishes a reviewable PR. Required exact-head CI and repository review remain separate from this workspace assessment.
- Keep #121 open while operational evidence is missing; coordinate visual identity with #123, dogfooding with #124 and installation/custody with #120/#58 without making them prerequisites for the bounded rename.
