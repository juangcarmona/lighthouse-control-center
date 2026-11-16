## Purpose

<!-- pdac-scope: cited -->

Let operators inspect source-confirmed integration observations at their exact commit without confusing automation, human authority or production delivery.

## ADDED Requirements

### Requirement: Exact integration observations

The issue view SHALL distinguish PR-head evidence from confirmed integration and observations for the exact resulting commit.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->

#### Scenario: Squash result and advancing branch

- **WHEN** an explicitly referenced PR has head A, confirmed merged commit C on its default branch and the branch later advances to D
- **THEN** the view retains A and C separately and reads C's checks and matching default-branch push runs, not D's newest green run
- **THEN** review revisions, run attempts, artifact identities, source times and observation times remain inspectable

#### Scenario: Test merge or another branch

- **WHEN** a PR has an unconfirmed test-merge SHA or its target cannot be established as the default branch
- **THEN** the view does not present it as a verified default-branch integration and explains the missing source fact

### Requirement: Evidence limitations and decisions

The view SHALL preserve revision bindings and explicit evidence limits without inferring human authorization, verified delivery or deployment.
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->

#### Scenario: Stale checks and a human gate

- **WHEN** a check or review belongs to another revision, or required human authority is not established
- **THEN** its source revision and limitation remain visible and green automation cannot establish approval or eligibility

#### Scenario: Failed or missing evidence

- **WHEN** integration is unconfirmed, a check fails, artifacts are missing or expired, or bounded source reads are incomplete or unavailable
- **THEN** the affected facts remain unknown, failed or incomplete without a verified-result claim, while unrelated observations remain inspectable
- **THEN** artifact inventory alone never proves provenance and absent deployment evidence never proves production delivery

### Requirement: Shared action boundary

The issue view SHALL expose only actions supported by the adopted shared capability and receipt contract, preserving the six-stage lifecycle and existing supported controls.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:f2639559cb8742b8f4642d3a5a3b5031b5b1bded58778bbc499067f44abd4ae5" -->

#### Scenario: Later stages are not typed public actions

- **WHEN** the selected public contract does not expose Implement, Integrate or Review
- **THEN** those actions are explained as unavailable, with no preparation, dispatch, label mutation or local-policy fallback
- **THEN** triage → refine → propose → implement → integrate → review remains the lifecycle, with approvals as conditions rather than extra stages

### Requirement: Scoped accessible inspection

Evidence inspection SHALL remain bounded, inert, session-scoped and accessible in existing supported themes and layouts.
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->

#### Scenario: Source authority is lost

- **WHEN** a session or connected source changes during a dependent read
- **THEN** no later dependent request is admitted and inaccessible evidence cannot be restored by a late response

#### Scenario: Keyboard inspection in supported layouts

- **WHEN** an operator opens delivery disclosures by keyboard at desktop or 390px in light or dark appearance
- **THEN** focus remains visible, revisions and limitations are readable without page-wide overflow, and source text is inert

#### Scenario: Acceptance evidence distinguishes fixtures

- **WHEN** delivery qualification is reported
- **THEN** controlled failure-handling tests are distinguished from actual connected-source acceptance, which requires source identities and explicit limitations
