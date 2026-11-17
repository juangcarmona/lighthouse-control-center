# Issue #180: proposed deployment source contract

Status: proposed for maintainer and source-owner review. This document does not change the accepted product model, GitHub App permissions or a repository's deployment policy. [Issue #180](https://github.com/juangcarmona/lighthouse-control-center/issues/180) remains blocked for implementation until the mapping and permission handoff is reviewed.

## Decision to review

Each observed repository owns a versioned declaration at `.lighthouse/project-health.json` on its default branch. Control Center reads that file at an exact commit through the connected user's effective App authority. The first version declares whether the repository is an application or non-deploying tooling and maps at most two display stages to exact GitHub deployment environment names. Control Center does not discover a target from branch names, workflow names or a successful Actions run.

```json
{
  "schemaVersion": 1,
  "projectKind": "application",
  "targets": [
    { "stage": "pre", "githubEnvironment": "pre-production" },
    { "stage": "production", "githubEnvironment": "production" }
  ]
}
```

`stage` is a presentation category (`pre` or `production`); the UI may abbreviate these as PRE and PRO. `githubEnvironment` is an exact, case-sensitive source value. Repositories with a distinct third stage must request a versioned mapping extension; the UI does not equate two names silently. A non-deploying repository declares `projectKind: "tooling"` and an empty `targets` array. An application may explicitly declare `deploymentIntent: "not-deployed"`; the UI labels that **declared not deployed** with the declaration commit and time. A bounded empty deployment response alone remains **unknown**, and a contradictory successful receipt makes the declaration **conflicted** until reconciled.

The repository owner reviews changes to this declaration. Control Center treats the file as source data, not as authority to deploy or to change a gate. A malformed file, unsupported version, missing default-branch ref or wrong repository identity produces an unavailable mapping with its cause. Reading the file requires `Contents:read`; no fallback to a local file or operator PAT is permitted.

## Deployment receipts and states

The first producer is GitHub Deployments. For each declared exact environment, read at most 30 deployments and the latest statuses of at most the 10 newest deployment IDs. Store the numeric repository ID, declaration ref/commit, deployment ID/ref/SHA/environment, status ID/state/time, source URL and observation time. This is a bounded latest-sample view; omitted pages and older statuses remain explicit. A later trend or frequency measure requires a separate retained, comparable history under #157.

| Display state | Required evidence |
| --- | --- |
| Observed deployment | Matching target and deployment ID with a latest `success` status; show commit and status time, without claiming the service is currently live. |
| Recent deployment failed | Matching latest attempt with `failure` or `error`; retain the last observed success separately if present. |
| In progress | Matching latest status is `queued`, `pending` or `in_progress`; show source attempt and time. |
| Declared not deployed | Exact current-branch declaration says `not-deployed`, with no contradictory observed success; identify it as a declaration. |
| Not applicable | Exact current-branch declaration identifies non-deploying tooling. |
| Unknown or unavailable | Mapping, permission, source response or bounded coverage cannot establish one of the above. A temporary read failure retains prior observations as stale with original timestamps. |

Deployment status `inactive` is retained as its own source fact. It never becomes a new success. A later failed attempt does not erase a prior success. The latest status for a deployment is selected by source time and ID after validating the JSON shape; duplicate IDs are deduplicated. A mismatched environment, repository ID or ref is rejected. Refresh and drill-down use GET only.

## Authority and permission handoff

GitHub documents that [listing deployments](https://docs.github.com/en/rest/deployments/deployments#list-deployments) and [listing deployment statuses](https://docs.github.com/en/rest/deployments/statuses#list-deployment-statuses) require repository `Deployments:read` for fine-grained GitHub App user tokens. The current Control Center repository authority exposes Issues/Actions reads and does not confirm Deployments read. This increment needs an explicit App registration and connected-user consent review for `Deployments:read`, plus `Contents:read` for the declaration. The permission check must bind the acting account, selected installation, numeric repository ID and generation before each collection and before any retained result is shown. Denied permission remains denied; provider failure remains unavailable. Public API access or a maintainer CLI token cannot substitute for the connected user's permission.

## Real source examples and qualification

`juangcarmona/domusmind` (repository ID `1176806574`) has [deployment 7386198849](https://api.github.com/repos/juangcarmona/domusmind/deployments/7386198849) at commit `2521478d154c88f42839a3344442b8a86e865a4e` with environment `production`. [Status 20819751761](https://api.github.com/repos/juangcarmona/domusmind/deployments/7386198849/statuses) reports `success` and links the [exact production-site job](https://github.com/juangcarmona/domusmind/actions/runs/40693736614/job/122834891416). This is a source candidate, not proof that the current connected user can read it or that the site is live now. `juangcarmona/lighthouse-control-center` (ID `1425429121`) returned an empty first deployments page; that observation is an unknown case, not a not-deployed verdict.

Before implementation, the maintainer must review the declaration path and ownership, the PRE/PRO naming, the explicit negative declaration, the bounded read limits and the App permission/consent change. Then qualify the positive example through the connected user and add a declared non-deploying repository, a denied read, a failed deployment, a duplicate/redeployment and a stale sample. The #155 UI may show these states only after the source contract and tests exist; #157 owns deployment frequency and lead-time definitions.
