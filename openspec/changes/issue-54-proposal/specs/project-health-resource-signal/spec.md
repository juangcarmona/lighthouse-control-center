## ADDED Requirements

<!-- pdac-scope: cited -->

### Requirement: Explain one exact-execution output-token value

The system SHALL show the reported OpenCode output-token value for one exact GitHub Actions run and attempt when its existing telemetry artifact matches the selected source.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

#### Scenario: Inspect a matching execution

- **WHEN** the connected user can read the selected repository's Actions data and its retained artifact matches the selected repository, revision, run and attempt
- **THEN** the Health detail shows `tokens.outputTokens`, its source link, exact run and attempt, revision, source time and observation time
- **AND** the value is described only as the output-token total reported for that execution

### Requirement: Validate the approved artifact members

The system SHALL read only the owner-approved usage summary and adjacent correlation records from `lighthouse-<workflowRunId>-<attempt>`.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Summary and correlation match

- **WHEN** `telemetry-usage.json` has `schemaVersion: 1`, `source: opencode-native`, `coverage: observed` and numeric `tokens.outputTokens`, and each `telemetry.jsonl` record agrees on repository, issue, revision, run, attempt and one non-empty session ID
- **THEN** the system may show the reported output-token value
- **AND** the system reads the artifact on demand through the connected user's existing authority and does not persist or aggregate telemetry

#### Scenario: Evidence is missing or does not match

- **WHEN** authority is unavailable, the artifact is absent, expired or ambiguous, a required member or supported field is missing, or a correlation value differs
- **THEN** the value stays unknown with an evidence-gap reason and is never replaced by zero

#### Scenario: Authority changes

- **WHEN** the connected identity changes or loses Actions-read permission
- **THEN** the system clears the displayed private value and does not use a late result from the old authority

### Requirement: Keep claims within the source

The system SHALL identify the source, observation time, unit and limitations of this measure; missing evidence SHALL NOT imply zero or success.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Do not infer another outcome

- **WHEN** a value is displayed or its evidence is unavailable
- **THEN** the system does not infer billing, cost, provider usage, quality, delivery success, project health or another metric family
- **AND** it makes no claim about ongoing collection, population completeness, history or trends
