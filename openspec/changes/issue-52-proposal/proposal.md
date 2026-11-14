# Find repository work

<!-- pdac-scope: cited -->

## Why

The authenticated observer only exposes attention items. The owner needs ordinary issues, search and project navigation that preserve source identity and explain incomplete collections. This implements the accepted CHG-AUTHENTICATED-OPERATIONS-001 baseline; no product-model edit is proposed.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:4ebd9c84897af61f0fb570eaf7a91e17a230b13192f37d470f810cd1984e94f9" -->
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
<!-- pdac:cite id="FR-PROJECT-DISCOVERY" digest="sha256:fb93a1c32232be6a679aa7aa074e9b6c0efd871cd48592b6b8d56996c36a2382" -->

## What Changes

- Read configured repository identity/default-branch facts and explicit pages of ordinary issues, including closed and non-attention work.
- Search collected titles/identities and combine repository, issue-state, source-stage, associated-run and human-wait filters. Exact-number lookup reaches an issue outside the current collection. Display the search and pagination scope beside results.
- Share filters and issue destinations between a list and a board grouped by GitHub issue state. Stage and multiple human-wait facts stay separate; unread/unsupported evidence stays unknown.
- Reuse #50 for explicit evidence reads and shared issue detail. No automatic whole-backlog evidence crawl.
<!-- pdac:cite id="UC-EXPLORE-FACTORY" digest="sha256:29ecffccb7221e8c3bdc537659dc329dce6b37860472229c1beca3ab4607b25e" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Capabilities

### New Capabilities

- `factory-discovery`: authorized repository/issue discovery, consistent project list/board and explicit collection scope.

### Modified Capabilities

None. The bounded operational overview remains available unchanged.

## Impact

Workspace query adapters, existing server-side source guard, browser navigation, a discovery page and focused source/browser tests. Depends on #50 and #49; no application database, new service or mutation API. All eleven configured Done dimensions apply. Actual physical-phone rehearsal is owner-deferred and will not be claimed.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

## Product impact and drift

The ten cited artifacts govern this increment; the whole 71-file definition was inspected and structural impact was widened from the discovery/workspace requirements and signal rule. Actor/project/work/evidence terms and linked contexts remain unchanged. UC-OPERATE-ISSUE and FR-ISSUE-CONTEXT are consumed through #50. Command admission/conversation writes (#48), intervention resolution (#51), runtime/version signals (#57), ideas, metrics, priorities and scheduling were checked and excluded from this read-only increment. No product-definition drift identified. Missing health/configuration values remain explicit rather than delaying discovery.
