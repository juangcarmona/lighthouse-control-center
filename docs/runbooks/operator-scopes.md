# Explicit operator scopes: correction candidate

PR #196 preserves the single-owner default when `SoFa:Access` is absent. Its current correction slice supports exact operator admission and project **read** grants only. It is not completion of issue #119 or a production/team-write qualification.

The selected identity profile still owns issuer, client, assurance and authentication time. Its legacy `OwnerSubject` remains required for compatibility but is not automatically admitted in explicit mode. Email, groups and network reachability confer no grants. For example, add this synthetic section beneath `SoFa` alongside the existing identity and repository configuration:

```json
{
  "Access": {
    "Projects": [
      { "Id": "project-a", "Repository": "example/project-a" },
      { "Id": "project-b", "Repository": "example/project-b" }
    ],
    "Operators": [
      {
        "Issuer": "https://identity.invalid/realms/dev",
        "Subject": "operator-a",
        "Grants": [{ "Project": "project-a", "Permission": "read" }]
      },
      {
        "Issuer": "https://identity.invalid/realms/dev",
        "Subject": "operator-b",
        "Grants": [{ "Project": "project-b", "Permission": "read" }]
      }
    ]
  }
}
```

Both repositories must already be in the deployment allowlist. The issuer must exactly match the selected issuer's absolute URI. Unlisted identity C is denied; an explicitly admitted identity with no grants receives no project data. Empty, duplicate, ambiguous, wildcard or unknown references fail startup. Unsupported action/provider configuration is rejected, not silently granted. The full independent read/operate/admin model and qualified provider references remain unfinished.

Configuration is compiled once. Editing it alone does not revoke access. Apply identity/grant removal by restarting with validated configuration: every explicit-mode session, GitHub connection and observation cache is process-local. Old cookies cannot restore sessions; even an unchanged operator must sign in and link GitHub again. Separate sessions never inherit a connection, including sessions using the same GitHub account. Logout, expiry and disconnect invalidate only that session's connection. Legacy single-owner access continuity is unchanged; explicit mode never opens or restores its session vault.

Account/observation lists are scoped before enumeration; direct excluded and unknown repository routes return the same empty not-found response before source requests. Current upstream read authority is still required. Explicit mode does not open source controls or the durable command journal through its APIs; existing journal records and duplicate/uncertainty budgets are not rewritten. Host-wide and repository runner inventories are unavailable because no qualified provider/resource grant contract is integrated. A project read grant does not authorize GitHub runner inventory. No provider adapter or substitute credential is introduced.

Rollback requires an intentional reviewed policy/application change and restart. Removing `Access` deliberately restores legacy owner visibility; do not remove it merely to conceal a failed scoped configuration. Independent API/race/browser/security acceptance and source/provider qualification remain required. #58 remains the production deployment gate.
