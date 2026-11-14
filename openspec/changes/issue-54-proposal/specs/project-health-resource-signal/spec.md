# Spec Delta

## Purpose

Show one exact Actions attempt's OpenCode output-token measure with its source and evidence limits.

<!-- pdac-scope: cited -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## ADDED Requirements

### Requirement: Exact-attempt output-token observation

The system SHALL display `tokens.outputTokens` only from the supported OpenCode-native usage summary for the exact GitHub Actions run and attempt selected by the operator.

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->

#### Scenario: Matching observed telemetry

- **WHEN** the exact run attempt has one current, unexpired `lighthouse-<runId>-<attempt>` artifact with the supported schema and complete matching correlation records
- **THEN** the detail shows the reported output-token count, repository/run/attempt, revision, source link, source update time and local observation time
- **THEN** it states that the value is not cost, billing, health or delivery acceptance

#### Scenario: Missing, expired or mismatched evidence

- **WHEN** current Actions authority is unavailable, the run attempt or artifact is missing/ambiguous/expired, either required member is missing, telemetry is partial, or any binding differs
- **THEN** output tokens remain unknown with an explanation; no zero, stale value or alternate credential is used

#### Scenario: Artifact bounds

- **WHEN** the archive is malformed, unsafe, oversized, or outside its 14-day retention
- **THEN** the source is unavailable and no artifact contents are projected

### Requirement: Pending resource families and history

The system SHALL keep unimplemented producer families, billing/cost and cross-run trends unknown.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: No producer or comparable history

- **WHEN** a resource family has no accepted source contract or no retained compatible observations exist
- **THEN** its value or trend remains unavailable and is not rendered as zero or a composite score

### Requirement: Current authenticated source authority

The system SHALL read the exact run artifact only under current connected-user Actions-read authority and clear the private value when that identity or authority changes.

<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Authority changes during read

- **WHEN** the connected account or its repository authority changes during a source read
- **THEN** the read is discarded and the prior private output-token value is cleared
