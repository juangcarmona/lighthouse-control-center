# Factory discovery

<!-- pdac-scope: cited -->

## Purpose

Find configured repository work through bounded source collections without granting execution authority.

<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="FR-PROJECT-DISCOVERY" digest="sha256:834d2e20c321db40d8151f30c5b9f26075f7fa3068b6b13dfc6b68ae62bea427" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## ADDED Requirements

### Requirement: Authorized bounded discovery

The workspace SHALL read only configured repository identities and ordinary issues under current connected-user authority, preserving source identity, observation/update times, errors and collection coverage.

#### Scenario: Ordinary work beyond the first page

- **WHEN** two configured repositories include non-attention/closed issues and an ordinary issue beyond the first page
- **THEN** explicit paging exposes that issue with its source identity, title and state; PR records do not become issues
- **AND** title filters name their collected scope and an exact-number lookup reaches work outside the current pages

#### Scenario: Unknown or denied collection

- **WHEN** a collection fails, exceeds a bound or loses authority
- **THEN** the view distinguishes incomplete, unavailable and denied from a complete empty backlog, and prior identity data cannot survive source replacement

### Requirement: Consistent project views

The workspace SHALL apply the same combinable search/repository/state/stage/associated-run/human-wait filters to list and board, preserve navigation state and open the same issue workspace from either view.

#### Scenario: Unknown stage and several waits

- **WHEN** an issue has no verified stage, or has several source wait labels or report contexts
- **THEN** unknown/multiple evidence and every wait remain explicit; open/closed board grouping does not assign a lifecycle stage or resolve a wait
- **AND** navigation/filtering sends no source mutation, workflow dispatch or continuation

### Requirement: Inspectable project identity

The workspace SHALL show configured and observed repository/default-branch identity, source health and available metadata with scope/time and explicit missing/conflicting values.

#### Scenario: Missing or conflicting metadata

- **WHEN** discovery is incomplete or the source branch differs from configured identity
- **THEN** the project remains registered, shows the gap/conflict and blocks no unrelated read; missing health metrics never become zero or healthy

### Requirement: Accessible safe discovery

Discovery SHALL use inert source text, safe fixed-repository links, keyboard controls and usable narrow layouts, without becoming an execution dependency.

#### Scenario: Keyboard and narrow navigation

- **WHEN** the owner searches, loads another page, switches views and opens an issue using the keyboard or a390px browser
- **THEN** scope and focus remain understandable, text does not execute and the same issue context remains reachable
