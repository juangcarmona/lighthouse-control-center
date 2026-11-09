
## Purpose

<!-- pdac-scope: cited -->

Let an admitted Control Center operator inspect an issue's source-confirmed delivery chain and permitted requests without confusing automation, authority, integration and verified outcomes.

## ADDED Requirements

### Requirement: Source-linked issue delivery chain

The selected issue view SHALL present established delivery relationships and leave unestablished relationships unknown.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Inspect a correlated chain

- **WHEN** the selected configured-repository issue has source-confirmed stage results, proposal content, PR identity/current head, checks, reviews, explicit decisions, integration and artifacts
- **THEN** the operator can inspect their exact source identities, safe source references and run, attempt and revision bindings
- **THEN** source timestamps and observation times are separately labelled

#### Scenario: Similar titles and unrelated latest runs

- **WHEN** several PRs or workflow attempts have similar titles and the source establishes only some relationships
- **THEN** only established relationships are linked, all confirmed related PRs remain distinguishable, and missing edges stay unknown rather than following titles or latest-run ordering

### Requirement: Exact revision evidence

Checks and review evidence SHALL remain bound to the exact revision they evidence.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->

#### Scenario: Head changes after checks and review

- **WHEN** a PR changes from head A to head B after checks or review were recorded for A
- **THEN** the old evidence remains labelled for A and cannot establish B's checks, review or eligibility

#### Scenario: Squash or rebase integration

- **WHEN** the source reports an integrated commit different from the PR head
- **THEN** both identities remain distinct from the PR head and stage input revision, even if some revisions happen to be equal
- **THEN** verification uses evidence for the resulting integrated commit rather than assuming head equality

### Requirement: Decisions remain independent facts

The view MUST keep lifecycle progress and human decisions separate from verified outcomes.
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="UC-VERIFY-DELIVERY" digest="sha256:804087739b1dfabebcd5932c70a85b2204501bbfa1a9b99360be1d3e548a0be9" -->

#### Scenario: Preserve the lifecycle and decision boundary

- **WHEN** proposal generation, owner content review, implementation request, merge authorization, integration and verification are displayed
- **THEN** the lifecycle remains triage → refine → propose → implement → integrate → review, with approvals as conditions rather than stages
- **THEN** green checks, ready labels, successful runs and mergeability do not supply absent approval

#### Scenario: Green automation with a human gate

- **WHEN** a proposal run and PR checks succeed but required owner content review or integration authorization is absent
- **THEN** automation success is visible while the missing decision remains an explicit unmet condition, without an acceptance or integration claim

### Requirement: Source-authorized action projection

Actions SHALL use only current shared source capabilities and the existing command and receipt path.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Supported action explicitly confirmed

- **WHEN** the source permits a supported Implement, Integrate, Review or recovery request for the current actor, repository and evidence
- **THEN** preparation identifies the actor, target, exact effect, current bindings and applicable conditions before explicit confirmation through the shared path
- **THEN** submission displays the original request and source receipt without claiming completion or replacing a required human decision

#### Scenario: Installed stage is not a public action

- **WHEN** a stage is installed or named by a CLI but the adopted public contract cannot support the request, or current source authority denies it
- **THEN** the request is unavailable with its missing capability or evidence explained, a safe authoritative source link is shown when available, and no dispatch, label mutation or local-policy fallback is used

### Requirement: Revalidation before dependent effects

The shared boundary SHALL revalidate current authority and prepared evidence before dependent effects.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Prepared authority becomes stale

- **WHEN** the PR head, permissions, required checks, review, reservation or applicable evidence changes before submission
- **THEN** the shared boundary denies stale authority before its dependent effect and the UI explains the changed condition instead of dispatching from cached green evidence
- **THEN** a changed intent requires fresh preparation and confirmation

### Requirement: Evidence limitations stop claims

Evidence limitations SHALL remain distinguishable and stop only the success claims they disprove.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="UC-VERIFY-DELIVERY" digest="sha256:804087739b1dfabebcd5932c70a85b2204501bbfa1a9b99360be1d3e548a0be9" -->

#### Scenario: Failed integration or incomplete output

- **WHEN** integration fails, a required human decision is outstanding, an artifact is missing or expired, source evidence conflicts, or a read is unavailable
- **THEN** the exact limitation and affected boundary are shown without a verified-result claim at that boundary
- **THEN** unrelated verified facts remain visible

#### Scenario: Completed workflow without a successful result

- **WHEN** a completed source workflow has a blocked stage result or no validated stage result
- **THEN** submission, admission and workflow completion remain distinct from stage-result status, which is blocked or unknown rather than delivered

### Requirement: Original request reconciliation

Uncertain submissions SHALL reconcile through the shared receipt path using the original request identity.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Response lost after submission

- **WHEN** the response is uncertain and the operator refreshes, navigates, reconnects, restarts or repeats confirmation
- **THEN** the same request is reconciled without another send, and only its exact source receipt can establish admission or outcome
- **THEN** absent source proof remains visibly uncertain rather than attaching a nearby run

### Requirement: Exact integrated result

A verified integrated result SHALL be bound to the exact source-confirmed commit and its required evidence.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="UC-VERIFY-DELIVERY" digest="sha256:804087739b1dfabebcd5932c70a85b2204501bbfa1a9b99360be1d3e548a0be9" -->

#### Scenario: Verified commit differs from current branch tip

- **WHEN** the source confirms integration at commit C and the default branch later advances to D
- **THEN** the issue's integrated result remains C with its integration decision evidence and relevant post-integration checks, pipelines and artifacts bound to C, not D's newest successful run
- **THEN** the view distinguishes integration, post-integration verification and any separately recorded delivery decision without claiming production deployment

#### Scenario: Only pre-merge or incomplete post-merge evidence

- **WHEN** PR-head checks are green but the resulting commit's relevant checks or artifacts are absent, expired or failed, or deployment evidence is absent
- **THEN** integration can be shown if source-confirmed, but the affected verified-result claim is stopped and missing deployment evidence does not establish production delivery

### Requirement: Scoped safe evidence access

Delivery inspection SHALL remain within current authenticated session and connected-source scope.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Session or source scope is lost

- **WHEN** the session expires, source authority is revoked, the actor changes or a late response belongs to a previous connection generation
- **THEN** dependent reads and actions are blocked, current authority is checked before reuse, inaccessible displayed evidence is removed and the late response cannot restore it

#### Scenario: Untrusted proposal and unsafe source link

- **WHEN** source content contains markup or instruction-like text, or a reference uses an unsafe scheme or another repository/evidence identity
- **THEN** source content remains inert data, the unsafe reference is not navigable, credentials remain server-side and no execution effect is introduced

### Requirement: Bounded accessible independent inspection

The issue view SHALL disclose bounded coverage and remain accessible without affecting independent repository execution.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Partial or temporarily stale collection

- **WHEN** collection reaches a page, size or time bound, or a transient refresh failure occurs while authority remains valid
- **THEN** the view labels incomplete coverage or retained stale evidence with original times, reports unknown relationships and never converts missing records into exhaustive absence

#### Scenario: Keyboard and narrow layout

- **WHEN** the operator inspects long revisions, proposal content, limitation explanations and confirmation at desktop and 390px widths in supported themes
- **THEN** controls are keyboard reachable, focus remains visible and source-keyed across refresh, status is not color-only and content causes no page-wide horizontal overflow

#### Scenario: Application closes after source admission

- **WHEN** Control Center closes after a request is admitted by the source
- **THEN** repository execution continues independently and reopening can inspect that same request without cancellation or resubmission

### Requirement: Source-confirmed delivery qualification

Delivery qualification SHALL distinguish actual source evidence from controlled handling evidence.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->

#### Scenario: Delivery evidence assessment

- **WHEN** the implementation is presented for acceptance
- **THEN** evidence includes one actual connected-source proposal/PR/integration chain, exact PR head and integrated commit references, relevant runs/checks/artifacts and explicit limitations
- **THEN** controlled changed-head, stale-check, failed-integration, human-gate, missing-artifact and uncertain-response cases are separately identified as handling evidence, not proof of actual integration
- **THEN** unsupported action outcomes remain unavailable and no fixture is offered as source-success evidence
