# Issue 52 read continuity correction

Baseline: `ef5a8f9c7429f8ff76fa8275784b2f50bb9422b8` in `juangcarmona/lighthouse-control-center` (repository ID `1425429121`). This operator-authorized correction retains the existing #52/#50 read boundaries and navigation fix. It does not claim connected-user acceptance.

## Evidence and scope

- Inline Chromium reproduction: an open issue Source details disclosure closes after typing a matching local filter (`true` to `false`). Factory rendering replaces its DOM without retaining disclosure choices.
- Inline Chromium reproduction: Overview observations render before a delayed account 401. Storage clears, but one repository remains visible and the status still claims a successful update.
- `GetAccountStatusHandler` returns HTTP 200 `state: unavailable` when a temporary GitHub identity/token refresh fails while the current grant remains. Factory currently treats that response as a definitive disconnection, unlike a transport 503.
- Read the repository instructions, README/documentation index, engineering lifecycle and continuation grant, design contracts, #52/#50 designs, relevant ProductShape requirements/rules, and architecture runtime/cross-cutting views. The existing architecture already requires stale observations for temporary failure and clearing after authority loss. This is an implementation correction with no architecture documentation impact.

## Implementation plan

1. Reuse the Overview authority-clearing path for account restoration and observation responses. Bind asynchronous updates to the existing epoch so an older success cannot undo denial. Check a returned account scope before skipping restoration because a snapshot already exists; remove records that its verified grants deny.
2. Treat HTTP 200 account `unavailable` as a temporary failure. Retain only already-visible data with stale status; never reopen stored data without successful online scope and repository verification. Keep unlink, owner expiry, explicit denial and source replacement destructive to the applicable display/cache scope.
3. Keep factory disclosure choices by stable repository/issue identity within the verified source scope across filtering, refreshing and history return. Clear choices on scope replacement, authority loss and repository denial. Store only choices in history, separate from cached display data.
4. Correct the existing authenticated navigation fixture to return the real API's connection scope; a missing scope is not a verified authenticated snapshot. Add Playwright regressions for denial in both response orders, temporary unavailable versus unlink, recovery and verified scope replacement, and disclosure choices during filtering/refresh/navigation. Keep existing no-stale-command and cache-bound assertions.
5. Run affected/full browser and visual checks, Node tests and documentation lint. Record exact commands/results and outstanding independent review/connected-user acceptance separately. Do not commit, push, deploy, modify lifecycle policy, add dependencies/frameworks or change server permission checks.
