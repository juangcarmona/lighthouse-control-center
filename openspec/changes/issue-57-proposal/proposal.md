# Inspect runner registrations and repository adoption

<!-- pdac-scope: cited -->

## Why

The owner cannot see which runners are registered on this host, what GitHub reports for each configured repository, or which committed Lighthouse configuration a repository declares. Issue #57 explicitly requests this first overview before broader capacity/usage work.

## What Changes

- Add an authenticated, read-only Runtime view with explicit refresh and separate local-registration, GitHub-runner and committed-adoption sections.
- Read only operator-selected local sources. GitHub observations continue to require the current connected user's effective App/repository grant.
- Preserve source identities, exact repository-scoped joins, observation times, partial coverage, denied/unknown and conflicting values. Registration, process health, GitHub availability and capacity remain distinct.
- Link repository and runner settings; do not install, restart, dispatch, cancel or upgrade anything.

## Capabilities

### New Capabilities

- `runtime-inventory`: bounded authorized runner registration and committed-adoption observations.

### Modified Capabilities

None. Existing operations, issue reader and discovery semantics remain unchanged apart from navigation.

## Impact

Existing Workspace options/query handlers, one tokenless host reader, plain browser assets, source/browser tests and implementation documentation. Depends on #49 and the #50/#52 workspace stack. No framework, service, database, release or accepted-product edit. All eleven configured Done dimensions apply. This is the owner-requested first milestone, not completion of the future capacity, telemetry, reservation or usage criteria on #57.

## Product impact and drift

The 71-file accepted product definition was inspected in this delivery; #57 was widened through FR-RUNTIME-HEALTH impact and configuration-drift context. The cited requirements/rules support source-backed observation. Existing issue/command/authentication meanings stay unchanged. Shared telemetry is not reimplemented: process health, measured usage, queue decisions and leases remain unobserved until consumed through their source contracts. No product-definition drift identified. Physical-phone rehearsal is owner-deferred, not tested.

<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="UC-MAINTAIN-RUNTIME" digest="sha256:3f59de22de35a1875c32c4901ce7488c68bf32d878d0c62e2ca70fa12b38852b" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:24fdf64ce66a09fa35b21d0cbf75b7e38235f289cefdb30c1849981cc14f55fa" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
