# Lighthouse adoption evidence

<!-- pdac-scope: cited -->

## Purpose

Let an admitted operator inspect repository Lighthouse adoption facts and comparison context without confusing committed declarations with installed or required capabilities.

## ADDED Requirements

### Requirement: Categorized source facts

The repository view SHALL label each available CLI, SDLC, workflow and harness fact by category, source path/link, exact revision and discovery time. Declared, installed, observed-run and current-policy facts MUST remain distinct.

<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->

#### Scenario: Committed declarations are not installation receipts

- **WHEN** committed evidence at revision `ef5a8f9c7429f8ff76fa8275784b2f50bb9422b8` declares CLI `0.12.65` and SDLC `0.22.4`
- **THEN** both appear as declarations with source paths, exact revision and collection time
- **AND** lockfile resolution and a workflow's harness source reference remain committed facts, not proof of installed packages, workflow execution or current policy
- **AND** unavailable workflow or harness values remain unknown rather than inferred from bot names or PR titles

#### Scenario: Observed execution has its own scope

- **WHEN** a supplied source observation identifies a run, attempt and revision distinct from the selected checkout
- **THEN** it is labeled observed-run evidence with that scope and does not overwrite the checkout declaration or establish installed/current-policy state

### Requirement: Explicit comparison baseline

Every displayed deviation SHALL name the selected compatible baseline, its source and origin. Missing or incompatible baselines MUST produce no drift verdict. Selected, latest-available and required-by-policy baselines MUST remain distinct.

<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->

#### Scenario: Compatible source baseline is supplied

- **WHEN** source evidence supplies a named baseline compatible with the displayed fact category and version definition
- **THEN** comparison identifies that baseline, its origin and source revision separately from the observed value
- **AND** a selected comparison does not become a policy requirement without policy evidence

#### Scenario: No compatible baseline exists

- **WHEN** baseline evidence is omitted, incompatible, ambiguous or unavailable
- **THEN** the view states no compatible baseline is available and shows no compliant/drift verdict or automatic upgrade recommendation

### Requirement: Missing categories do not block issue reading

Unavailable adoption categories SHALL remain explicit unknowns with independent coverage and freshness. Missing adoption evidence MUST NOT prevent ordinary authorized issue navigation.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: No configured checkout or installed receipt

- **WHEN** an operator can read the selected repository's issues but its adoption producer is unconfigured, unavailable or partial
- **THEN** installed and policy categories remain unknown with their limitation, not absent/unsupported by inference
- **AND** the selected issue still opens through the existing authorized reader

#### Scenario: Incomplete evidence becomes stale

- **WHEN** a temporary refresh fails after an incomplete adoption observation
- **THEN** retained same-scope data keeps its original collection time and both incomplete and stale labels
- **AND** a successful replacement observation replaces old values without claiming complete repository adoption

### Requirement: Scoped safe observation

Adoption inspection SHALL remain read-only and restricted to authorized configured sources. Source values SHALL render inertly with validated repository-bound HTTPS links. Lost scope MUST remove affected private projections.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Permission loss and unsafe evidence

- **WHEN** repository permission is denied or the acting account is replaced while a repository adoption projection is displayed or in flight
- **THEN** affected joined private projections are cleared and late responses cannot repopulate them
- **AND** source markup is inert and unsafe links are not navigable
- **AND** viewing or comparing facts performs no package/configuration mutation, execution request or credential fallback
- **AND** independently owner-authorized host observations retain their existing separate authority boundary

### Requirement: Accessible adoption inspection

Adoption disclosures and source controls SHALL remain keyboard reachable with visible focus and usable desktop and 390px layouts in light and dark themes.

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Long adoption identifiers

- **WHEN** an operator opens and refreshes adoption evidence with long revisions and source names by keyboard in each layout/theme combination
- **THEN** text and links remain readable without page overflow, focus remains on the same source identity or a safe persistent control, and status meaning does not depend on color
