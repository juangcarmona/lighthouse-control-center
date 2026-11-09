## ADDED Requirements

<!-- pdac-scope: cited -->

### Requirement: Supported family availability

The system SHALL show four signal families and explain missing producers without fabricating values.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

#### Scenario: Only resource consumption has a supported producer

- **WHEN** an operator opens the signal inventory with an accepted resource definition and no supported delivery, adoption or quality producers
- **THEN** delivery, harness/workflow adoption, quality and resource consumption are named, the resource detail is available when evidence permits, and the other families state unavailable with their missing source or definition
- **AND** no unsupported family shows zero, healthy, passing or a fabricated signal

### Requirement: Explainable exact-execution measurement

The system SHALL expose a signal's governing definition, evidence metadata and limitations in its detail.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

#### Scenario: Inspect a supported execution

- **WHEN** the operator opens a supported output-token signal
- **THEN** detail identifies its investigation purpose, repository identity, workflow run, attempt, execution ID, source records, producer/schema and calculation versions, formula, reported-token unit, exact execution window, source and observation times, starts/finishes, sample count, coverage, applicability and limitations
- **AND** source-reported fields are distinguished from the derived execution sum; unknown timestamps, denominators or population coverage remain explicitly unknown

### Requirement: Pinned output-token semantics

The system SHALL use the pinned shared calculation and SHALL label a complete output-token value only with observed coverage and numeric usage.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Deduplicated native calculation

- **WHEN** exact-execution records include duplicate source events, native starts/finishes and CLI fallback steps
- **THEN** deduplication follows the pinned source-kind/source-ID or event-ID rule, native steps are selected without adding fallback usage, and output tokens sum numeric fields from finished primary steps only
- **AND** reasoning/cache fields remain separate, with compaction/title exclusions stated

#### Scenario: Fallback-only measurement

- **WHEN** no native start exists and valid CLI starts/finishes supply numeric output tokens
- **THEN** the pinned CLI fallback calculation is identified and no native usage is invented

#### Scenario: Observed steps but missing numeric field

- **WHEN** starts and finishes satisfy observed coverage but a finished step lacks numeric outputTokens
- **THEN** step coverage stays observed while output-token value stays null and unavailable, not zero or a complete numeric measurement

### Requirement: Independent evidence states

The system SHALL distinguish value availability, coverage, freshness and applicability; absent values SHALL NOT become zero.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Incomplete coverage is also stale

- **WHEN** retained evidence has mismatched starts/finishes and a later refresh fails temporarily while authority remains valid
- **THEN** incomplete coverage and stale freshness appear together with original timestamps, any partial subtotal is labelled incomplete, and no complete total is asserted

#### Scenario: Lost stream or omitted records

- **WHEN** starts exist with matched degraded/dropped stream evidence, collection gaps, omitted diagnostics or omitted-event markers
- **THEN** coverage is incomplete even when start/finish counts match

#### Scenario: No starts or telemetry

- **WHEN** no selected starts exist or telemetry is absent
- **THEN** coverage or input availability is unavailable with a reason, not evidence of no consumption

#### Scenario: Deployment applicability requires evidence

- **WHEN** an accepted source explicitly establishes no deployment process, or deployment evidence is merely absent
- **THEN** deployment measurement is not applicable only in the first case, with its basis visible; absence alone is unavailable

### Requirement: Authorized bounded evidence inspection

Signal reads and source drill-down SHALL preserve current connected-user repository authority, exact source correlation and bounded inputs.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Contributing records are inspectable

- **WHEN** current authority permits an exact execution's accepted normalized artifact
- **THEN** drill-down identifies its repository/run/attempt/artifact/member and contributing record identities, sample counts and collection bounds without exposing native logs, prompts or unrelated artifacts

#### Scenario: Invalid or inaccessible source

- **WHEN** input is expired, denied, malformed, outside the allowed artifact/member bounds, unsupported in schema, or mismatched in repository, revision, execution, run or attempt
- **THEN** the read fails closed with an appropriate evidence-gap reason, does not substitute another source, and does not widen access or use an operator CLI

#### Scenario: Authority is lost during a read

- **WHEN** the session expires, permission is lost, or the source connection is replaced or disconnected
- **THEN** protected signal data is cleared and late results from the old generation cannot repopulate it

### Requirement: Accessible and bounded claims

Presentation SHALL make evidence states and source inspection accessible without implying a score, billing, production health, human effort or comparable trend.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Keyboard and assistive inspection

- **WHEN** the operator navigates inventory, explanation and source controls by keyboard or assistive technology at desktop and narrow widths
- **THEN** labels, focus and textual state explanations remain usable without relying on colour alone, and source text remains inert with safe repository-bound links

#### Scenario: One observation does not establish a broader outcome

- **WHEN** a fixture or the separately attributed #53 observation is presented
- **THEN** its evidence type and limits are explicit, billed cost remains unknown/null, and no score, default target, alert threshold, production-health, human-effort, ongoing-adoption or trend claim is made
- **AND** #53 remains execution evidence whose validation/publication failed, not a passed stage
