# Post-rename repository continuity

This runbook completes the bounded checks for [#121](https://github.com/juangcarmona/lighthouse-control-center/issues/121). The [rename roadmap](../roadmap/lighthouse-control-center-rename.md) retains the broader inventory and original preparation sequence. The issue reports the existing repository and main folder renamed on 2026-11-08; this document is not a receipt that the checks below ran.

## Preserve the active work

The repository administrator owns GitHub checks; the Bastion operator owns local checkout repair. Read current active deliveries and outstanding source requests before any recovery action. Preserve branches, dirty files and untracked assets. Do not prune, remove, reset, recreate or rename linked worktrees, and do not cancel unrelated jobs. Keep existing source request bytes, digests and request identities unchanged.

Reconcile prepared or uncertain old-name requests using the owning source contract before any further write. An absent response is not proof that nothing happened. Never replay an uncertain request under the new repository name. Record unavailable pre-cutover availability or reconciliation evidence as missing; a post-rename scan cannot prove what was pending before cutover.

## Repair the moved main checkout

Run these commands on Bastion, not in a disposable implementation workspace:

```sh
cd /srv/repos/juangcarmona/lighthouse-control-center
git status --short --branch
git worktree list --porcelain
git worktree repair
git worktree list --porcelain
```

Before repair, use the operator's existing checkout inventory to identify every linked directory, including #116's documentation checkout. Record its expected branch and dirty/untracked state through the normal safe backup procedure. A broken pointer can prevent `git status` before repair; retain that failure rather than resetting the checkout to make it work.

After repair, run the following from **each actual linked checkout directory**:

```sh
git status --short --branch
git branch --show-current
git worktree list --porcelain
```

Confirm registration points to the moved main checkout and each expected linked path, branch and work-in-progress asset remains intact. If a linked checkout cannot be discovered automatically, stop and have the operator use Git's documented explicit-path repair with the known real checkout paths. Do not guess a path or edit `.git` pointers by hand. Worktree folders do not themselves need renaming.

Inspect origin through normal Git tooling; the expected direct URL is `https://github.com/juangcarmona/lighthouse-control-center.git`. Update it only where still stale and authorized. Check configured absolute checkout paths through their owners, without copying private configuration into evidence. Fetch from the new direct repository and compare expected branch/tag refs with the retained baseline. A successful status command alone proves neither remote access nor history continuity.

## Receipt checklist

For each applicable row, record date, responsible actor, exact source revision/run, expected versus observed result, and a safe evidence reference. Use `passed`, `failed`, `unavailable` or `not applicable` with a reason. Never record secrets, callback query parameters, private configuration or raw token responses.

| Check | Required evidence | Current evidence boundary |
| --- | --- | --- |
| Before cutover | Target availability, active-delivery snapshot and outstanding old-name request reconciliation | Not supplied to this workspace; do not rerun the rename to recreate a snapshot |
| Same repository | Numeric ID `1425429121`, node ID `R_kgDOVPZSgQ`, expected history/refs/tags, issue/PR/release continuity | Numeric/node identity and current PR bases/heads observed; complete historical baseline unavailable |
| Moved checkout | Main origin uses new direct URL; all linked checkouts registered and expected work preserved after repair | Issue reports main origin updated and linked pointers broken; all 45 linked checkouts accessible; see the dated post-rename receipt |
| Direct Git and PRs | New-path fetch succeeds; expected refs retained; each open PR retains expected base/head and target repository identity | Direct and redirected Git HEAD agree; all eight current PRs target repository ID 1425429121 |
| Required CI | Actual eligible new-path check on the exact candidate SHA, with unchanged required check policy | Both hosted checks passed at candidate 454f8cd; each later candidate requires its own exact-head checks |
| Name-dependent integrations | Actual source routing, repository selection, hosted Action references, webhooks, schedules, runner/checkout paths and documentation hosting, where configured | Source scans do not prove private settings or effective integrations; owning operator records applicability and actual result |

The current workflow request arrives with the new repository name as host-supplied provenance. That is not proof of every integration, CI result or successful downstream publication. Preserve that distinction in #121's completion assessment.

## Source findings, not live failures

At source revision `19a180791df017ae41e2f61144a8995650340ac1`:

| Surface | Finding and action |
| --- | --- |
| Installation instructions | Use the new direct clone URL; retain the documented pinned commit and operator-owned configuration |
| `package.json` repository/bugs/homepage | Old-name links remain; frozen verification input, requiring a separately authorized correction rather than this candidate changing its own inputs |
| `scripts/setup-development-identity.mjs` | Sample repository list still includes the old name; frozen input remains unchanged. Set `SoFa.Repositories` explicitly through the supported private configuration route; do not regenerate or overwrite an existing setup |
| `src/web/server.mjs` | Retained legacy observer default still includes the old name; do not start that service as a rename probe. Its explicit repository configuration and any future default correction need their normal owner |
| `.github/workflows/` | Targeted literal scan found no old repository/main-folder references; generated sources and pins remain untouched. This does not establish live workflow eligibility or CI |
| Historical reports, fixtures and reconciliation records | Preserve original old-name URLs/identities; no global substitution or replay |

The initial broken worktree pointers were reported by the issue. The operator subsequently ran `git worktree repair` from the moved main checkout. The [post-rename receipt](../delivery/evidence/issue-121/post-rename/README.md) now verifies all 45 registered checkouts are accessible and resolve to the moved common Git directory. This current observation does not reconstruct a missing pre-cutover inventory. Old-name literals are source findings, not evidence that an integration actually failed. Record each real failure separately with its owner, affected delivery, bounded recovery action and post-recovery receipt. Preserve unrelated delivery and uncertain effects; do not use rename-back as an automatic recovery action.

## Completion and separate work

Keep #121 open while repair, required continuity receipts or actual integration failures remain unresolved. Missing product-independent operational evidence needs the repository administrator or Bastion operator, not a new product decision.

Keep .NET namespaces, `SOFA_CONFIG_FILE`, `SoFa:*`, cryptographic purposes, application origin, issuer/client identities and provider registrations stable. No credential, callback, storage or namespace migration is implied. Coordinate visual identity with #123 and Lighthouse dogfooding with #124. #120 owns independent installation; #58 owns production identity and custody. Neither is a prerequisite for the bounded repository/folder rename, and no visual publication or production acceptance is claimed here.

## Recorded post-rename observations

See the [dated operational receipt](../delivery/evidence/issue-121/post-rename/README.md) for current GitHub identity, PR targets, required rules and all linked-checkout observations. The documentation increment can be reviewed separately from #121 operational closeout; missing historical observations and private integration checks remain explicit, and this change does not close the issue.
