# Find repository work

<!-- pdac-scope: cited -->

## Why

The authenticated observer only exposes attention items. The owner needs ordinary issues, search and project navigation that preserve source identity and explain incomplete collections. This implements the accepted CHG-AUTHENTICATED-OPERATIONS-001 baseline; no product-model edit is proposed.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
<!-- pdac:cite id="FR-PROJECT-DISCOVERY" digest="sha256:834d2e20c321db40d8151f30c5b9f26075f7fa3068b6b13dfc6b68ae62bea427" -->

## What Changes

- Read configured repository identity/default-branch facts and explicit pages of ordinary issues, including closed and non-attention work.
- Search collected titles/identities and combine repository, issue-state, source-stage, associated-run and human-wait filters. Exact-number lookup reaches an issue outside the current collection. Display the search and pagination scope beside results.
- Share filters and issue destinations between a list and a board grouped by GitHub issue state. Stage and multiple human-wait facts stay separate; unread/unsupported evidence stays unknown.
- Reuse #50 for explicit evidence reads and shared issue detail. No automatic whole-backlog evidence crawl.
<!-- pdac:cite id="UC-EXPLORE-FACTORY" digest="sha256:22b2dc21d177fa05f433f5ad1d4aaa1c378e83f823841ff92322f5a6f4e638c7" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

## Capabilities

### New Capabilities

- `factory-discovery`: authorized repository/issue discovery, consistent project list/board and explicit collection scope.

### Modified Capabilities

None. The bounded operational overview remains available unchanged.

## Impact

Workspace query adapters, existing server-side source guard, browser navigation, a discovery page and focused source/browser tests. Depends on #50 and #49; no application database, new service or mutation API. All eleven configured Done dimensions apply. Actual physical-phone rehearsal is owner-deferred and will not be claimed.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## Product impact and drift

The ten cited artifacts govern this increment; the whole 71-file definition was inspected and structural impact was widened from the discovery/workspace requirements and signal rule. Actor/project/work/evidence terms and linked contexts remain unchanged. UC-OPERATE-ISSUE and FR-ISSUE-CONTEXT are consumed through #50. Command admission/conversation writes (#48), intervention resolution (#51), runtime/version signals (#57), ideas, metrics, priorities and scheduling were checked and excluded from this read-only increment. No product-definition drift identified. Missing health/configuration values remain explicit rather than delaying discovery.
