# Actions usage

<!-- pdac-scope: cited -->

## Purpose

Let operators inspect bounded Actions duration and storage evidence without confusing source observations with attributable billing reports.

## ADDED Requirements

### Requirement: Qualified read-only observations

Actions usage SHALL require current connected-user repository Actions-read authority and retain repository, exact attempt where applicable, observation time, unit, definition, source and coverage. Reads MUST NOT dispatch, cancel or modify source work or broaden grants.
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->

#### Scenario: Supported observation

- **WHEN** an admitted operator explicitly inspects a readable repository or exact run attempt
- **THEN** bounded source evidence is displayed with its identity and provenance
- **AND** an unconfigured repository or lost authority cannot return source records

### Requirement: Execution intervals are not billing

Job duration SHALL use valid completed source intervals in seconds. Attempt elapsed span SHALL require complete known job intervals. Billing minutes and cost SHALL remain unknown unless separately authorized attributable GitHub reports exist. Public, private and self-hosted semantics MUST NOT imply host or model-provider cost.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Parallel jobs and self-hosted work

- **WHEN** a complete attempt contains parallel completed jobs including an explicit self-hosted label
- **THEN** individual seconds and attempt span are distinguished from summed job time and billed minutes
- **AND** self-hosted resource and provider cost remain unknown

#### Scenario: Billing authority missing

- **WHEN** repository Actions access exists but separately reviewed billing authority does not
- **THEN** billing is unsupported and unknown, not zero, and no billing request or broader grant is attempted

### Requirement: Bounded storage and coverage

Cache and artifact observations SHALL show bytes and separate coverage. Expired artifacts MUST NOT inflate active listed bytes. Incomplete pagination, malformed records, denied permissions and unsupported sources MUST remain explicit rather than becoming exact repository totals.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Partial artifacts and expiry

- **WHEN** the bounded artifact page omits additional records and contains an expired artifact
- **THEN** only known active listed bytes contribute, the expired count is exposed and the result is marked partial

#### Scenario: Unavailable interval

- **WHEN** a job interval is missing, reversed or unfinished, or additional jobs are omitted
- **THEN** unavailable durations and attempt span remain unknown with explicit coverage

### Requirement: Safe stale inspection and drill-down

Usage SHALL expose fixed repository/run source links and retain original observation times when failed refresh leaves stale evidence. Explicit authority loss SHALL clear affected evidence. History SHALL remain unavailable without retained comparable samples and definitions.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Stale storage sample

- **WHEN** a storage refresh fails temporarily after a valid sample
- **THEN** retained bytes are labelled stale with original observation time, not newly measured
- **AND** account replacement or permission denial removes the old sample
