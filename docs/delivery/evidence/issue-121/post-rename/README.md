# Post-rename continuity observations

<!-- pdac-scope: none reason="Read-only operational observations; no product contract changes." -->

Observed on 2026-11-08 after the maintainer renamed the existing repository and delegated routine delivery orchestration. These receipts support the documentation increment in [PR #128](https://github.com/juangcarmona/lighthouse-control-center/pull/128); they do not close [#121](https://github.com/juangcarmona/lighthouse-control-center/issues/121).

| Observation | Actual result | Receipt |
| --- | --- | --- |
| Repository identity | Numeric ID 1425429121 and node ID R_kgDOVPZSgQ retained | [GitHub](github.json) |
| Direct and old redirected Git access | Both resolve to main HEAD 19a180791df017ae41e2f61144a8995650340ac1 | [GitHub](github.json) |
| Open PRs | All eight current PRs retain recorded bases/heads and target the same numeric repository | [GitHub](github.json) |
| Required main rules | Pull request and required status checks remain effective; no rule was changed | [GitHub](github.json) |
| Candidate checks | [verify](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42519060226) and [foundation](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42519060278) passed at 454f8cdc74233c8bb7386293a1e510251653f753; later edits need fresh checks | [GitHub](github.json) |
| Worktrees after operator repair | All 45 registered checkouts exist, accept git status and resolve to the moved common Git directory | [Worktrees](worktrees.json) |
| Work in progress | Four checkouts have dirty/untracked paths; none were reset, cleaned or pruned | [Worktrees](worktrees.json) |
| Releases and tags | Both inventories currently empty; no complete pre-cutover inventory is available | [GitHub](github.json) |

The public worktree receipt records aggregate counts only, omitting absolute paths, branch names, per-checkout revisions, file contents and private configuration. It cannot prove that every pre-cutover file survived: that would require a prior inventory. No outstanding source write was replayed. No credential, application origin, OIDC registration, namespace or cryptographic purpose was changed.

Actual source-native router/worker and CI runs now use the canonical repository path. Authenticated Control Center App-user effects remain the separate #48/#50 acceptance boundary. Private webhook/callback settings and historical prepared/uncertain request reconciliation have not been established by these observations. They remain explicit #121 follow-up; the documentation PR does not claim full cutover acceptance, installation or deployment.
