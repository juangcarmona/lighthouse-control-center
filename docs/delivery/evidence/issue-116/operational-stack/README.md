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

The issuer is reachable again. Rotation of the previously exposed development client secret still
needs operator confirmation before reuse. Production identity/deployment remain #58; the maintainer
already waived physical-phone rehearsal. Synthetic browser/security tests remain distinguishable
from actual source-user acceptance. All five issues stay open until their respective gates pass.
