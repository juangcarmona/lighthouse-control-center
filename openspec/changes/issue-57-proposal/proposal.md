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

<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="UC-MAINTAIN-RUNTIME" digest="sha256:bd92d57c9e69c4dfad43ad798ab0ee63d299976202fc18d18361522eaa8d4d23" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:1fae00c2b56b581a8562883217b9f7c720c0fcc74f3d820c271dbc8686558af9" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
