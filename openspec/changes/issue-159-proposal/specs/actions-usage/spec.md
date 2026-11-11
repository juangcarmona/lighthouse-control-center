# Spec Delta

<!-- pdac-scope: cited -->

## Purpose

Let admitted operators investigate repository Actions consumption through scoped time, billing and storage evidence without inventing costs or coverage.

## ADDED Requirements

### Requirement: Inspectable metric evidence

Each metric SHALL expose repository and source identity, purpose, nullable value, unit, definition/version, source and observation times, scope/window, coverage and limitations. Missing values and source times MUST remain unknown.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Reconcile an authorized observation

- **WHEN** an authorized source supplies a supported metric
- **THEN** its visible value and evidence disclosure reconcile to the exact repository, report or run/job attempt, source fields, units and window
- **THEN** absent values and source timestamps display unknown, not zero or observation time substituted as source time

### Requirement: Distinct execution durations

Run elapsed time and summed job duration SHALL be separately named and defined. An update timestamp MUST NOT establish execution completion or billing. Incomplete job collections SHALL NOT claim complete run execution time.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Parallel jobs and missing completion

- **WHEN** two parallel jobs each supply a valid 60-second execution interval and the run has no documented completion time
- **THEN** the collected job sum is 120 seconds with its coverage, while completed run elapsed time is unknown and neither value becomes billable minutes
- **THEN** an in-progress elapsed display requires a valid source start, is labelled as of observation and is not measured CPU time

### Requirement: Honest billing and cost coverage

Billable minutes SHALL require an authorized, attributable source report with scope and window. Repository visibility and execution class remain distinct; unknown class stays unknown. Zero billing MUST NOT imply zero host, infrastructure or model-provider cost. Duration or tokens MUST NOT become money.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Authorized and denied billing

- **WHEN** the source provides authorized billable minutes or denies the billing capability while Actions reads remain allowed
- **THEN** the former shows the reported minutes and attribution, and the latter shows denied billing with no zero-spend claim while independently readable durations remain visible

#### Scenario: Public and self-hosted cost distinctions

- **WHEN** a report supplies zero billed minutes for public or self-hosted execution
- **THEN** visibility and execution classification are shown independently when known and host/infrastructure/model-provider costs remain unobserved unless separately attributable provider evidence exists under #54

#### Scenario: Unsupported or unattributable billing

- **WHEN** no supported billing capability exists or a report lacks repository attribution
- **THEN** billing is unsupported or repository attribution unavailable respectively; an account-wide report is not displayed as repository spend and no broader grant is requested automatically

### Requirement: Current storage evidence

Current cache and supported artifact bytes SHALL retain separate source scope, observation time and coverage. Overlapping totals MUST NOT be added. Expired or deleted artifact content SHALL be unavailable for current inspection, not evidence of zero historical storage or a storage charge.
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->

#### Scenario: Expired artifact and changing storage

- **WHEN** artifact records include expired content, current cache usage is reported and artifact pagination is incomplete
- **THEN** current artifact bytes cover only known non-expired collected records, expiry is explicit, incomplete bytes are not a repository total, and cache/artifact snapshots are not converted to accumulated charges

### Requirement: Finite collection with independent states

Every collection SHALL enforce documented finite page, request, byte, time and concurrency limits. Cap exhaustion, missing pages and source failure MUST leave coverage incomplete. Denied, unsupported and unavailable SHALL remain distinct; coverage and freshness SHALL be independent. Missing data MUST NOT become zero or healthy.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Incomplete pagination and timeout

- **WHEN** a next page exists beyond a cap, a page is missing, or the query times out
- **THEN** collection stops within its budget, explains collected records/pages and the unknown remainder, and never claims an exhaustive total or retries indefinitely

#### Scenario: Partial stale storage

- **WHEN** an earlier partial storage sample is retained after transient refresh failure or exceeds its freshness limit
- **THEN** it remains both partial and stale with original timestamps and a visible reason, not newly observed or complete

### Requirement: Exact evidence navigation

Project Health SHALL provide repository-bound run/job-attempt or source-report drill-down preserving exact identity. Source text SHALL remain inert and unsafe or unscoped links MUST NOT become navigable.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Retry drill-down and hostile source text

- **WHEN** an operator opens evidence for attempt 2 of a run with markup-like names and an unsafe supplied URL
- **THEN** evidence retains attempt 2 and its job/report identity, text renders literally and only validated exact-scope source links are offered

### Requirement: Comparable retained history

History SHALL use retained samples only and expose retention limits, gaps and incompatible scope, units, windows or definitions. No samples SHALL mean history unavailable. Missing intervals MUST NOT be plotted as zero or connected as comparable observations.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Compatible samples and gaps

- **WHEN** retained samples contain matching definitions alongside missing intervals, stale samples and a definition or scope change
- **THEN** only compatible samples are compared; stale values, gaps and the changed basis remain explicit without fabricated intervals
- **THEN** without retained samples the view says history unavailable, even if a current snapshot exists

### Requirement: Authority-scoped read-only observations

Refresh and reuse SHALL recheck current owner and source authority. Authority loss SHALL clear affected private data. On transient failure, retain only verified same-scope prior evidence as stale with original times. Observation MUST remain read-only and optional for delivery.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Account replacement during collection

- **WHEN** the source account changes, repository authority is denied or the owner session ends during an in-flight read
- **THEN** affected pending reads cannot publish, private current/history/display-cache data are cleared at the appropriate scope and no sibling read can restore the old scope

#### Scenario: Failed collection with current authority

- **WHEN** current authority succeeds but a metric collection fails transiently
- **THEN** only prior same-scope evidence can remain stale; failed authority verification does not authorize reuse and refresh emits no mutation or credential fallback

### Requirement: Accessible Project Health presentation

Metric states and units SHALL be understandable in text, drill-down SHALL be keyboard-operable with visible focus, and narrow/desktop light/dark layouts SHALL remain legible without page overflow using the existing Control Center visual contract. Synthetic evidence MUST remain labelled synthetic.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Keyboard and themed inspection

- **WHEN** an operator refreshes, opens evidence and returns by keyboard at 390px and desktop sizes in light/dark appearance
- **THEN** metric identity, state, units and limitations remain readable, focus remains reachable, and long source labels do not cause page overflow
