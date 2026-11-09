## Purpose

Limit the overview and its counts to repositories the current operator is permitted to read.
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac-scope: cited -->

## MODIFIED Requirements

### Requirement: Scoped filtering

The overview SHALL filter only configured repositories within the caller's current read grants and retain permitted selection across refresh, with explicit count scope. All repositories MUST mean all repositories permitted to that caller, not all deployment repositories.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->

#### Scenario: Filter survives successful and failed refresh

- **WHEN** a permitted configured repository is selected and observations refresh or collection fails without losing authority
- **THEN** selection persists, all sections/counts explain and retain that scope, and an unavailable permitted repository remains selectable alongside All repositories and every permitted configured repository

#### Scenario: Another operator's project is selected directly

- **WHEN** an operator submits a filter or direct request for a repository outside their read grants
- **THEN** no protected repository facts, names, counts or links outside those grants are returned
- **AND** the server does not treat browser filtering as authorization

### Requirement: Failed refresh retains stale evidence

Failed refresh SHALL retain the previous valid view and observation times with a stale warning only while current read authority and its identity/session/connection/scope binding remain valid. Authority loss MUST clear affected records and derived counts rather than retaining stale protected evidence.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Failed refresh and initial failure

- **WHEN** fetch or JSON refresh fails after a valid view with current authority, or before any valid observation
- **THEN** the previous permitted view, selection and observation times are retained and labeled stale in the first case, and no observation is available in the second; neither failure fabricates empty evidence or makes old timing newly observed

#### Scenario: Authority changes while refreshing

- **WHEN** the session, grant, source permission or source connection binding becomes invalid during refresh
- **THEN** affected records and derived counts are cleared and a late response from the old binding cannot restore them
- **AND** the explanation does not expose records or scope identifiers from another operator
