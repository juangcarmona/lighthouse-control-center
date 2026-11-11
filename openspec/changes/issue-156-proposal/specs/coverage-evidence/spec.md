# Coverage evidence spec delta

<!-- pdac-scope: cited -->

## Purpose

Let an authorized operator investigate one repository-produced coverage scope using inspectable source evidence and compatible history, without turning absence or CI outcomes into quality claims.

## ADDED Requirements

### Requirement: Versioned measurement envelope

The producer report SHALL identify schema/definition versions, numeric repository, ref, commit, workflow, run/attempt, facet, tool/version, scope rules, counts/unit, generation time and retention. A verified observation SHALL add artifact identity, link and expiry after upload. Unsupported versions contribute no value.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Supported complete report

- **WHEN** a supported complete report and its verified source metadata are accepted
- **THEN** all contract fields remain inspectable, including artifact identity added after upload rather than invented inside a self-referential payload

#### Scenario: Unsupported or incomplete envelope

- **WHEN** a version is unsupported or a required identity or scope field is missing
- **THEN** the observation explains that condition and contributes no measured coverage value

### Requirement: Actual scoped production

Repository CI SHALL measure actual tests for the declared scope and report failure or partial scope explicitly. Normalized reports MUST exclude source text, credentials, environment dumps, logs and unnecessary file detail. No coverage threshold or Control Center availability dependency is introduced.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Real measurement and failed collection

- **WHEN** repository tests successfully measure the declared scope, or collection fails or omits required scope
- **THEN** CI publishes a bounded complete summary in the first case and a safe failed/incomplete observation where publication is possible in the others, never substituted passing counts

### Requirement: Source attribution

The consumer SHALL verify numeric repository, workflow/ref, commit and exact run/attempt from authenticated evidence under a reviewed producer trust policy. Report claims, artifact names, public reachability and untrusted signatures cannot establish attribution. Unprovable attribution remains untrusted.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Mismatched source identity

- **WHEN** repository, workflow, ref, commit or attempt differs from verified source association
- **THEN** the report is rejected as untrusted and no value or trend point is accepted

#### Scenario: Names and report fields are insufficient

- **WHEN** a report claims attempt 1 but available source metadata cannot establish its owning attempt
- **THEN** it remains untrusted even if its name or signature appears plausible

### Requirement: Current source authority

Every coverage read or retained-data reuse SHALL require the acting account's current effective repository and Actions:read authority. Account change, disconnect, denial or unverified authority MUST prevent out-of-scope reuse and remove affected displayed data. The consumer MUST NOT fall back to operator credentials.

#### Scenario: Revocation and account replacement

- **WHEN** current authority is denied, cannot be verified, or the connected account changes during a read
- **THEN** pending affected reads stop and no old coverage projection is served to the changed or unverified scope

### Requirement: Measured values

Only supported, complete, trusted reports SHALL contribute coverage. Covered/total MUST be exact nonnegative integers with covered at most total. Percentage is 100 × covered/total for positive total; zero total has no percentage. Scoped coverage MUST NOT appear repository-wide.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Zero, empty and invalid counts

- **WHEN** counts are 0/10, 0/0, fractional, negative, rounded beyond exact representation or covered exceeds total
- **THEN** 0/10 is a valid zero measurement, 0/0 has no percentage, and invalid counts are rejected; none is inferred to pass a quality gate

### Requirement: Independent evidence states

Availability, completeness and freshness SHALL remain independent. The consumer SHALL distinguish no producer, missing report, expired/deleted source, unsupported version, malformed/untrusted content, denied access, incomplete upload, partial scope and stale observations. None of these conditions SHALL imply passing quality or fabricated zero.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Bounded absence and partial collection

- **WHEN** a declared producer has no report in a complete inspected run inventory, or collection stops before that inventory is complete
- **THEN** the former says missing report and the latter says incomplete collection, without claiming repository-wide absence

#### Scenario: Evidence-state matrix

- **WHEN** controlled observations represent each unavailable reason, including a stale partial observation
- **THEN** each reason remains distinguishable and the stale partial observation retains both freshness and completeness facts

### Requirement: Exact identity and conflicts

Samples SHALL retain numeric repository, exact commit, workflow run/attempt, artifact identity and definition/scope/tool versions. Re-reading an artifact SHALL be idempotent. Later attempts MUST NOT replace earlier failures. Conflicting reports for one logical sample identity SHALL remain explicit rather than silently overwrite evidence.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Retry, duplicate and conflict

- **WHEN** failed attempt 1 is followed by successful attempt 2, either artifact is read twice, or two different reports claim the same logical sample
- **THEN** both attempts remain distinct, repeated reads add no duplicate sample, and conflicting claims remain inspectable and excluded from an unqualified trend

### Requirement: Compatible history

Trends SHALL compare only complete trusted samples with matching scope, kind/unit, tool and definition versions. Changed bases create explained breaks; fewer than two comparable samples show insufficient history. Missing intervals MUST NOT become zeros or interpolation.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->

#### Scenario: Compatible pair with a newer gap

- **WHEN** two compatible complete samples and a later failed collection exist
- **THEN** the comparison identifies its samples and exact attempts, and the later gap stays visible without becoming zero or disappearing behind the older valid sample

#### Scenario: Changed basis or insufficient history

- **WHEN** only one comparable sample exists or scope, kind, unit, tool/version or definition changes
- **THEN** the view explains insufficient history or a comparison break instead of drawing a continuous trend across the change

### Requirement: Explainable detail

Health detail SHALL expose the latest valid sample, separate newer gaps, comparable history, counts/unit/formula, scope, tool/version, times, links and retention. Older valid samples show age; other facets remain unavailable.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

#### Scenario: Inspect a scoped result

- **WHEN** an authorized operator opens coverage detail after a newer unavailable observation
- **THEN** the older valid sample is labelled with age, the newer gap is visible, and the operator can inspect provenance and calculation without treating another facet as measured

### Requirement: Accessible inspection

Coverage states and history SHALL have keyboard-accessible textual equivalents and usable narrow/desktop, light/dark presentation under the existing design contract. Source text SHALL remain inert; links MUST be safe repository-bound HTTPS source links.

#### Scenario: Keyboard, themes and hostile text

- **WHEN** detail is inspected by keyboard at 390px and desktop widths in both themes with long or markup-like source fields
- **THEN** text and history remain understandable without color or a chart, focus remains visible, no page overflow occurs and hostile text or links cannot execute

### Requirement: Bounded safe collection

The consumer SHALL enforce documented numeric bounds on compressed/expanded/member bytes, member count, JSON complexity, pagination, time and retained history before using content. Unsafe paths, duplicate members, malformed archives and oversized reports SHALL be rejected with safe diagnostics. Source credentials and signed download URLs MUST NOT appear in projections or logs.

#### Scenario: Resource and archive rejection

- **WHEN** any configured bound is exceeded, content is truncated, paths traverse directories, a member is duplicated or an archive is otherwise unsafe
- **THEN** the report contributes no value, safe reason and collection limits remain visible, and no archive is extracted or unbounded continuation started

### Requirement: Observation retention

Normalized history SHALL follow a declared bounded retention policy, separately report source retention/availability and remain subject to current source authority. Refresh MUST NOT delete repository evidence. Retained samples SHALL NOT imply that expired source evidence can still be independently verified.
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->

#### Scenario: Source expires before retained history

- **WHEN** an artifact expires while a normalized sample remains within observation retention
- **THEN** the permitted viewer sees the historical value with its source-unavailable limitation, retention window and last verification time, not a newly verified source claim

### Requirement: Acceptance evidence

Coverage acceptance SHALL include an actual repository-produced measurement through the authorized consumer and a repository without the facet. Controlled rejection and history cases SHALL supplement, not replace, that source acceptance.

#### Scenario: Fixtures alone

- **WHEN** only synthetic reports or fixture-backed browser checks have passed
- **THEN** real producer/consumer and missing-facet acceptance remain unproven
