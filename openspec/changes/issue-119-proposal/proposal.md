---
pdac-scope: cited
---

# Proposal

## Why

The workspace admits one configured owner and reads a deployment-wide repository list. Additional operators need explicit project and provider/resource visibility without inheriting the owner's source or runtime authority.

<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->

## What Changes

- Add opt-in, configuration-based admission by exact issuer/subject and explicit project/provider/resource grants. Keep existing personal-owner configuration when the new access section is absent.
- Define independent read, operate and admin ceilings, with no implicit role inheritance, wildcard scope or authority from email, group display claims or LAN reachability.
- Enforce grants server-side on discovery, observations, counts, account projections and supported action entrypoints. Intersect them with current upstream permissions and capabilities.
- Bind cache/coalescing, intentions and receipts to the application identity, originating session, connection generation and scope. Prevent late responses from restoring invalid authority.
- Apply access configuration only at validated application startup; changing grants requires a restart and fresh sessions. Retain existing expiry, revocation and source-account replacement controls.
- Add two admitted operators and one denied identity to direct API, race and accessible UI acceptance. Document unsupported operations and personal migration.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

## Capabilities

### New Capabilities

- `operator-scopes`: explicit non-inheriting grants, scoped read/action enforcement and identity/session/scope isolation.

### Modified Capabilities

- `owner-access`: admit exact configured operators as well as the compatible personal-owner configuration; retain the existing requirement name to target the baseline precisely.
- `github-user-connection`: let each admitted operator explicitly link their own verified acting account without sharing connections.
- `factory-overview`: restrict filters and count scope to the caller's permitted repositories and clear stale evidence on authority loss.

The existing `identity-environments`, `delivery-verification` and `visual-identity` capabilities do not need requirement changes. Existing environment separation, verification and visual identity remain constraints.

## Impact

Affected paths include `WorkspaceOptions`, identity admission/session records, `RepositoryAccess`, account/observation handlers, source request guards and the existing browser account/operations views. Extend the integrated #48 intention/receipt path, never build a second journal. Provider-facing scope checks consume #117 identifiers when its contract is accepted and integrated; unavailable provider surfaces stay unavailable.

The inspected Source directory has authorization, transport, permissions and observations, but no command journal. ADR-0008 and ADR-0010 remain Proposed. The dated roadmap's active PR table is not live integration evidence; implementation pickup must reconcile #48/#117 and retain their existing budgets and source acceptance. No code, API service, database, credentials or repository files are changed by this proposal run.

### Product authority and impact discovery

This implements the applied CHG-LCC-EVOLUTION-001 baseline, not new product intent. Product README identifies `model/` as accepted; individual artifact draft frontmatter has not been promoted by this proposal. Prepared ProductShape index/inspect/impact reports were used before drafting. The impacted product behaviors are ACT-OPERATOR, UC-ACCESS-FACTORY, BR-LAN-PRIVILEGE-BOUNDARY, QR-EXECUTION-SECURITY, CON-DEPLOYMENT-INDEPENDENCE, BR-PROVIDER-OPERATIONS and QR-MOBILE-OPERATIONS. None is edited.

Personal deployment simplicity and independent deployment remain constraints. Provider authority is a separate boundary, not an application-admin entitlement. Accessible explanations remain part of the existing desktop/phone journey.

<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->
<!-- pdac:cite id="BR-PROVIDER-OPERATIONS" digest="sha256:d341e8822a5a44a5cc2b67b5a79f37a1a106ba3e0b77a2566e1ad567dce3bf87" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

Impact neighbours checked include the external identity-provider actor, repository work authorization, runtime maintenance, daily operations, execution recovery, evidence correlation and engineering-health contexts. Their authentication, execution, operation, recovery and analytics contracts are not expanded: this change adds access ceilings to existing supported surfaces. Full discovery/boards, provider operations, analytics and upstream multi-actor writes remain their owning increments.

### Delivery boundary

Estimate remains the refined 8 points. Organization provisioning, SCIM, tenant administration, an identity service, upstream dispatch, provider operation implementation and production custody are excluded. Lighthouse v1 non-owner source writes remain unsupported without bot/CLI fallback. GitHub workflows keep executing independently of Control Center. #58 remains the production gate.

This is a candidate at `planned`, not an approved design. The maintainer must review the exact matrix, configuration and invalidation semantics before implementation; the `future` hold remains. Existing active changes `issue-121-proposal` and `issue-123-proposal` contain metadata only in this checkout and are not rewritten.

### Recovery provenance

Native proposal run `42695095764` produced this artifact set, but its publisher failed strict OpenSpec validation. The operator recovery separately passed `npm run spec:validate`, `npm run product:citations` and `npm run lint:docs`; the native run is not reported as passed.
