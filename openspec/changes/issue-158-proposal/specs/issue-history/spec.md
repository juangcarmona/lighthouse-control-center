# Selected issue history

<!-- pdac-scope: cited -->

## Purpose

Explain one selected issue's available lifecycle and delivery evidence through cited events, preserving unknown history and the distinction between execution, results and human decisions.

## ADDED Requirements

### Requirement: Selected issue navigation and evidence provenance

An authorized operator SHALL open one selected issue's history from its repository context. Each available run, result, PR, review, decision and integration fact SHALL retain its source identity, association, revision, link and source time separately from observation time; unavailable fields MUST remain explicit.

<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->

#### Scenario: Repository to selected issue

- **WHEN** an admitted operator selects an authorized issue from its repository and opens History
- **THEN** that issue's existing reader shows its available source-associated events and links, without fetching a fleet cohort or substituting a more recent unrelated run
- **AND** collection time, source time, revision and unavailable associations remain inspectable

#### Scenario: Retained real history replay

- **WHEN** the sanitized retained-source #99 case is replayed for verification
- **THEN** run `42452259718` attempt `1`, PR `113` head `6b5b4219d20df81e73c9656b1e139cc3c8ba062a`, verification `42455503204`, merge `a9e06e0376f28dd5a3075cfd26c81fcb98130db0` and review `42459934534` remain separate cited records
- **AND** it is visibly labeled retained-source demonstration data, never a live observation or current source authorization

### Requirement: Source chronology and unknown intervals

History SHALL order events only by valid source event times within the displayed selected window. Undated evidence SHALL remain separate. Queue, running, human-wait and PR-wait intervals MUST require applicable versioned Lighthouse semantics and explicit source endpoints; otherwise they remain unknown gaps.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Retained summary lacks event timestamps

- **WHEN** the retained #99 summary supplies associations but no complete event timestamps or applicable interval contract
- **THEN** those records are undated, the observation timestamp is not used as an event time, and elapsed queue/work/wait values are unknown
- **AND** run numbers, JSON record order, current labels and issue update time do not establish chronology or interval endpoints

#### Scenario: Dated events and window selection

- **WHEN** source-backed dated events span a selected UTC window and some evidence has invalid or missing dates
- **THEN** dated events in the window sort chronologically, undated evidence remains separately identified as unplaceable, and the chosen window and covered input pages remain visible
- **AND** equal timestamps do not imply causal ordering and window filtering does not imply complete coverage

### Requirement: Exact event and attempt identity

Repeated observations of the same exact source event SHALL not duplicate that event. Distinct attempts, source events and changed source observations SHALL retain their separate identity, outcomes and provenance. Unknown identity MUST NOT be guessed or silently merged.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Repeat observation and retry

- **WHEN** one exact event is observed twice and its run also has a second attempt
- **THEN** the identical event appears once, both attempts remain distinguishable, and no default attempt or successful recovery is inferred
- **AND** a conflicting observation of that event retains a visible conflict/version rather than silently overwriting its earlier outcome

### Requirement: Outcomes remain separate

Workflow execution SHALL remain distinct from validated stage results, review, merge and accepted delivery. Failed, skipped, blocked, missing and superseded evidence MUST remain inspectable; later success MUST NOT rewrite an earlier failure or gap.

<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->

#### Scenario: Successful workflow with blocked or absent result

- **WHEN** a workflow succeeds but its validated result is blocked, or its result is absent/rejected, or its jobs were all skipped
- **THEN** execution facts remain visible without a passed stage or accepted delivery inferred from them

#### Scenario: Failed and superseded delivery attempt

- **WHEN** the retained #99 case includes failed run `42440808113` and superseded PR `109` alongside the later PR `113` chain
- **THEN** the failure and superseded record remain inspectable and do not become successful through the later chain

#### Scenario: Later post-merge verification

- **WHEN** an earlier merge receipt records post-merge CI missing and a later independent receipt cites passing verification `42456523349`
- **THEN** both observations remain separate with their sources, and the earlier missing evidence is not erased or assigned a fabricated time

### Requirement: Incomplete history remains unknown

History SHALL expose unavailable/expired inputs, truncation, uncollected pages and retention limits independently of freshness. Missing history MUST NOT become zero duration, zero interventions, resolved waits or an autonomy rate.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Expired output and missing event pages

- **WHEN** a result artifact has expired and label/event or review history is not collected or only partially available
- **THEN** each affected input and coverage limit is visible, no expired artifact is downloaded, and no duration, aggregate intervention count, resolved wait or rate is invented
- **AND** a collected empty page says only that no matching records were collected on that page

### Requirement: Individually cited human decisions

History SHALL show source-backed questions, intervention reasons and protected approvals separately. Ordinary comments, label removal and independent automated reviews MUST NOT establish a protected human decision or question resolution. Unavailable classification SHALL remain unknown.

<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->

#### Scenario: Intervention and protected approval have different meanings

- **WHEN** exact source records supply a verified question/reason and a separately identified required protected approval
- **THEN** both retain their separate type, actor evidence and source; the approval is not counted as an unplanned intervention
- **AND** neither contributes to a numerical intervention or autonomy metric in this increment

#### Scenario: Ordinary comment or removed label

- **WHEN** someone comments, a wait label disappears, or a PR review says approved without evidence of its protected human role
- **THEN** the view preserves only those source facts, does not assert question resolution or protected acceptance, and reports missing classification/history explicitly

### Requirement: Bounded authorized collection

History SHALL collect read-only evidence for one configured repository and selected issue under current connected-user authority. Each read MUST disclose its bounds and partial coverage. Account replacement, scope denial or owner loss MUST stop affected collection and clear affected private projections.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Collection limits and cancellation

- **WHEN** History reads the displayed conversation page
- **THEN** it reuses that page without refetching, reads at most 10 report references and 10 explicitly referenced PRs within the shared 20-second optional-evidence budget, and performs no background crawl
- **AND** artifacts retain the existing 100-item complete-inventory and 2 MiB compressed bounds, each PR has at most its first 100 checks and first 20 reviews, and excess inputs remain visibly uncollected
- **AND** cancellation or exceeded response bounds produce unavailable/partial evidence, not complete empty history

#### Scenario: Authority changes during a held read

- **WHEN** repository/Actions authority is lost, the account generation changes, or the owner session ends during collection
- **THEN** affected requests stop, affected records clear before late sibling reads settle, and stale responses cannot repopulate them
- **AND** missing optional evidence authority does not remove separately authorized ordinary issue reading
- **AND** no alternate credential, anonymous source fallback or mutation is attempted

### Requirement: Verified repository continuity

History across repository renames SHALL join only through source-confirmed immutable repository and issue identities. Original receipt repository strings MUST remain unchanged. Missing or conflicting stable identity MUST prevent cross-name joins.

<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Historical repository name

- **WHEN** source evidence confirms repository ID `1425429121` and the selected issue's identity across the retained `juangcarmona/sofa` name and current repository
- **THEN** the verified association is inspectable while original receipt bindings remain unchanged
- **AND** name similarity, redirects or matching issue numbers alone cannot join histories or authorize new source reads

### Requirement: Accessible inert history

History SHALL render source text inertly with validated source links and usable keyboard focus in desktop and 390px light/dark layouts. Private or unsafe content MUST NOT enter published visual evidence.

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Long hostile source data and refresh

- **WHEN** an operator opens and refreshes History containing long identifiers, markup-like text and unsafe links
- **THEN** source text does not execute, invalid links are not navigable, controls remain keyboard reachable and focus follows source identity or a safe persistent control
- **AND** each layout/theme preserves readable status text and no horizontal page overflow
