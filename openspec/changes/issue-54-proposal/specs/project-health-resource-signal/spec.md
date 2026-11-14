# Spec Delta

## Purpose

<!-- pdac-scope: cited -->

Let an authorized operator inspect one exact execution's resource measurement and understand its source, calculation and evidence limitations.

## ADDED Requirements

### Requirement: Exact-execution resource explanation

The system SHALL explain a supported execution's resource measurement and its limits using a pinned shared definition.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->

#### Scenario: Supported output-token observation

- **WHEN** accepted source evidence supplies observed coverage and numeric output tokens for an exact execution
- **THEN** its detail identifies purpose, output-token unit, pinned formula/version, repository, run, attempt, execution window, source and observation times, sample counts and source records
- **THEN** duplicate source records and native plus fallback observations follow the pinned shared selection, without double counting or adding reasoning/cache tokens
- **THEN** the value makes no production-health, human-effort, billing or cross-run trend claim

### Requirement: Independent measurement evidence states

The system SHALL preserve null values and distinguish coverage, freshness and applicability independently.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Incomplete and stale input

- **WHEN** selected model steps are unfinished or collection gaps exist and the observation is stale
- **THEN** the detail shows incomplete coverage with known starts/finishes and stale input with original timestamps, not a complete value or refreshed observation time

#### Scenario: Observed steps with missing token field

- **WHEN** the shared producer reports observed step coverage but a finished step has no numeric output-token value
- **THEN** output tokens remain null/unavailable with the field limitation, while step counts retain their reported coverage

#### Scenario: Unsupported families and deployment applicability

- **WHEN** delivery, adoption, quality or resource measurements lack supported source definitions or observations
- **THEN** each unsupported measurement remains explicitly unavailable, never zero or a passing result
- **THEN** missing deployment evidence remains unknown; only source evidence establishing no deployment process permits not-applicable

### Requirement: Authorized contributing source inspection

The system SHALL expose contributing records only within the current authenticated repository authority.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

#### Scenario: Exact contributing records

- **WHEN** the operator opens a supported signal
- **THEN** source drill-down identifies only validated records associated with its exact repository, execution, workflow run and attempt, with bounded collection and retention limits

#### Scenario: Denied, expired or incompatible source

- **WHEN** source access is denied, an artifact is expired or its schema/correlation does not match
- **THEN** its value is unavailable with a reason, and no alternate credential or broader artifact search is used
- **THEN** loss of source identity or authority clears previously displayed private records
