# Operational workspace integration candidate

## Scope and authority

The maintainer requested parallel delivery and autonomous orchestration. The five existing workspace
increments are consolidated into the existing draft integration PR #100, preserving their commits,
issues, reviews and evidence. This is staging on feature branches; main integration, actual connected
GitHub App-user acceptance and issue completion remain separate gates.

## Retained lineage

| Issue / PR | Reviewed component head | Capability |
| --- | --- | --- |
| #50 / #100 | `cffd6e5c6d04a25d9d8b18cf9c3404df97686cc4` | Issue context and source evidence |
| #48 / #112 | `e3eaa81b977929839434d0de8a29f8c6b6648270` | Explicit source controls and durable receipts |
| #52 / #103 | `8aec752e4ceabba5e6141ad8e21c9da55189bbc1` | Repository discovery and project views |
| #57 / #105 | `d70d1e5bd809c6b53e50d80a1dff27df1ec1eeb6` | Bounded host, runner and committed-adoption inventory |
| #51 / #111 | `06fcbcdf8b8b03867f06413d8e47dd8f955bf3bf` | Source-backed intervention contexts |

The joint source candidate `0711d39e701e3cf5bbea40d033da326fbb74036d` contains all five heads and main
`23b0a723e999919b58a12defc767ae1b8b059a32`. Git ancestry checks passed for each component before
consolidation. Advancing a feature ref requires its current tip to remain an ancestor; an unexpected
remote change aborts that update. No default-branch ref is advanced by this staging operation.

PR #130's malformed-runner-row guard was independently reviewed and merged into #57. Its original
merge `272d2f0adbe0ae19a1117eab505f1660ca93f1db` failed commit-message line-length validation.
Only that operator-created tip's message was amended to `d70d1e5bd809c6b53e50d80a1dff27df1ec1eeb6`,
with identical tree verified and an exact-old-tip force-with-lease. The original failure remains in
Actions and the PR's merge record.

## Verification checkpoint

Full local `npm run verify` passed on the joint source candidate. The new change after that run is
this integration record. Commit lint passed for every commit introduced relative to current main.
Hosted verification must pass on the final integration head itself before staging is declared verified.
Historical child checks do not substitute for that check.

The stacked PR #111 check on the joint candidate inspected accepted main merge commits absent from
its older feature base and failed their commit-message length. Main history and verification rules
are preserved. PR #100 targets current main, so its range checks all newly introduced feature
commits against their actual integration target. That final candidate requires its own full hosted CI.

Feature-ref fast-forwards are recorded as such. A PR is called merged only if GitHub reports it merged;
otherwise a superseded child is closed with its retained lineage and open acceptance issue identified.
PR #100 remains draft pending its complete Done gate.

## Remaining acceptance

- #50: actual issue and paginated conversation, distinct source/lifecycle states, and responsive reading.
- #48: actual connected App-user authorized/denied effects, stale-state rejection, exact receipts,
  duplicates, lost responses, ordinary comments and explicit question continuation.
- #52: actual configured repository discovery, pagination and equivalent filtered list/board results.
- #57: actual App-user runner inventory or authoritative denied state; retained local operator
  observations already exist and do not substitute for that user-scoped evidence.
- #51: an actual pending question and confirmed resolution, including conflict and uncertain cases.

The development identity/rotation blocker was resolved on 2026-11-09 through local provider
administration under the maintainer's instruction. The live client secret was rotated, its previous
value rejected with HTTP 401, and matching private app configurations and realm import updated.
No secret value is retained in this record. Owner subject, issuer, callbacks, TLS and GitHub
configuration were preserved. No further owner rotation confirmation is required.

The development preview runs `d7f7cd3b966db9fd8772feab132128f0fa236b58`. A real browser check with TLS
validation passed owner sign-in/session (200), denied the other development account (401), and opened
the fleet/runtime pages (200). The session cookie remained Secure/HttpOnly/SameSite. GitHub correctly
reported `unlinked`; this proves development identity, not actual connected-user source acceptance.
The safe receipt is [development identity verification](development-identity-verification.json).
These checks ran locally outside PR/push CI; no long-window E2E requirement was added to CI.

Production identity/deployment remain #58; the maintainer already waived physical-phone rehearsal.
Synthetic browser/security tests remain distinguishable from actual source-user acceptance.
All five issues stay open until their respective gates pass.

## Confirmed feature integration

After the existing `feat/50-issue-workspace` branch advanced by fast-forward to the joint candidate,
GitHub reported #112, #103, #105 and #111 as **merged**, respectively retaining merge commits
`8aec752e4ceabba5e6141ad8e21c9da55189bbc1`, `d495309dcd8b66ddb5fa076d4b397d77517a3595`,
`24eae98af58dcc30fdb69e0cf79267d17079340b` and `0711d39e701e3cf5bbea40d033da326fbb74036d`.
No manual child-PR close or additional feature-ref alignment was needed. The five acceptance issues
were rechecked open. PR #100 remains draft against main, and its description names the aggregate scope.

Hosted verification [42535673190](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42535673190)
passed on `8bc807350542b9dcebc15f0d42d92c213a34d592`, including all unchanged verification gates.
That is the checkpoint before the following test-only extension.

An independent review suspected that changing exact discovery search from #701 to #702 failed to
refresh. Reproduction passed against existing production code: the finding was a comparison-type
misread, not a reproduced defect. The existing browser test now also checks the actual #702 API
request and its result link after #701. No production correction was made, and existing assertions
remain intact. Focused browser evidence does not establish actual connected-user source acceptance.
The new final head must receive its own hosted verification.

## Current-main reconciliation

The integration branch also retains main `4632b94f7a083c3ef45d3c434494503f0d231a3e`, including #132's
versioned development realm and setup tests. The merge is conflict-free. Workspace production code
is unchanged from the development preview's checked revision; the complete new source head still
requires its own hosted CI and independent final review. The preview check above identifies the
revision actually running and does not claim that the newly reconciled source was deployed.
