## Purpose

<!-- pdac-scope: cited -->

Let an admitted Control Center operator retain an idea and deliberately create or link GitHub work, preserving context, source identity and uncertainty without implicitly requesting execution.

## ADDED Requirements

### Requirement: Retained pre-promotion context

The system SHALL retain an operator's idea outcome, scope, selected repository and proposed issue content for revisit and refresh before promotion. An idea MUST remain distinct from authoritative GitHub work.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="TERM-IDEA" digest="sha256:6c5c214cd1f93d9456f4430dc976458dd7f8c3cd973b89c26466327b235c2ca1" -->

#### Scenario: Leave and revisit

- **WHEN** the operator saves outcome, scope, a configured repository and proposed issue content, leaves and revisits or refreshes the idea
- **THEN** the saved context is restored without creating an issue or entering normal backlog flow
- **AND** save failures are visible rather than reported as retained state

### Requirement: Draft disposal has no source effect

Leaving or explicitly discarding an unsubmitted idea SHALL NOT create GitHub work or request execution. Disposal MUST NOT erase an unresolved promotion's duplicate-prevention evidence.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Abandoned draft

- **WHEN** the operator leaves or discards a draft before submitting promotion
- **THEN** no GitHub mutation or execution request occurs and the idea is absent from normal backlog
- **AND** explicit discard removes the draft from the retained idea list

#### Scenario: Uncertain promotion is not an unsubmitted draft

- **WHEN** the operator leaves an idea with an unresolved creation attempt
- **THEN** recovery still identifies that attempt and another create stays blocked

### Requirement: Related work with honest limits

Before promotion the system SHALL show potentially related source issues or an explicit retrieval limitation. It MUST distinguish incomplete, stale and unavailable results from a successful empty result. Similarity MUST NOT select or create work.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Candidate review

- **WHEN** the operator explores an idea in a configured repository
- **THEN** related candidates retain repository/issue identities, source links, query scope, observation time and collection limitations
- **AND** no candidate is automatically linked and no exhaustive duplicate-detection claim is made

#### Scenario: Related query fails or is bounded

- **WHEN** retrieval fails, is stale, reaches a page limit or returns no matches successfully
- **THEN** those outcomes are distinguished and the operator can inspect the limitation before making a deliberate choice

### Requirement: Explicit reviewed promotion choice

The operator SHALL explicitly choose a verified existing issue or review the target repository and proposed issue content before confirming creation. Linking MUST NOT create another issue. Unsupported create/link operations MUST remain unavailable.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="UC-TRIAGE-BACKLOG" digest="sha256:0eaed6ca26d2e957f0eea2fbe207d6b201a0bb25708970f63d4f50c9703db9ac" -->

#### Scenario: Reviewed create

- **WHEN** the authorized operator reviews the selected repository, acting GitHub user, title and body and explicitly confirms a supported create
- **THEN** exactly that reviewed intent is submitted and only confirmed source evidence establishes success

#### Scenario: Explicit existing-issue link

- **WHEN** the operator selects and confirms an existing issue in the selected configured repository
- **THEN** the system verifies that it is an accessible issue rather than a pull request and binds its source identity without creating or modifying a GitHub issue

#### Scenario: Unsupported operation

- **WHEN** the owning source capability cannot support create or link with the required guarantees
- **THEN** the dependent operation explains that limitation, retains context and performs no alternative write

### Requirement: Current source authority

Create/link SHALL verify the current connected GitHub user and effective issue-write authority for the selected repository on the server. Missing, denied or unverifiable authority MUST prevent the operation without losing draft context.
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Sign-in is not source permission

- **WHEN** the operator is signed in but lacks verified current GitHub identity or effective repository issue-write permission
- **THEN** create/link is denied or unavailable with an explanation, no source write and retained draft context

#### Scenario: Permission changes after preview

- **WHEN** permission is removed between preview and submission
- **THEN** the boundary recheck prevents the operation instead of trusting the earlier display

### Requirement: Review is bound to the acting target

Confirmation SHALL bind content, draft revision, source actor and repository; any changed binding requires new review. Protected requests SHALL enforce session, scope and anti-CSRF checks and never expose credentials.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->

#### Scenario: Actor target or content changes

- **WHEN** the connected user, repository or saved content changes after review, or an old tab submits an earlier revision
- **THEN** the stale confirmation cannot send and the operator must review the current binding

#### Scenario: Invalid protected request

- **WHEN** an anonymous, expired-session, cross-site or out-of-scope request reads or mutates an idea directly
- **THEN** protected content and the dependent operation are denied without credentials in responses or evidence

### Requirement: Confirmed identity survives repetition

A confirmed create/link SHALL retain the source repository and issue identity across refresh, revisit and repeated submission. The same idea MUST NOT create another issue after confirmation, including when later source reads are unavailable.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Repeat refresh and concurrent confirmation

- **WHEN** confirmation is repeated from two tabs or the operator refreshes or revisits after success
- **THEN** the original confirmed repository/issue identity is returned without another create
- **AND** a later unavailable source read preserves that binding with an availability limitation

### Requirement: Uncertain creation blocks another send

A potentially sent create with no conclusive response SHALL remain uncertain. Repeated submission, reconnect, refresh and recovery MUST NOT resend it while uncertainty remains. Transport acknowledgement alone MUST NOT establish issue creation.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Response lost after creation

- **WHEN** GitHub creates the issue but the creation response is lost
- **THEN** the idea shows uncertainty, retains its operation identity and disables another create
- **AND** repeat submission and page refresh do not create a second issue or request execution

#### Scenario: Restart near submission

- **WHEN** Control Center restarts after a send may have occurred but before confirmation was retained
- **THEN** the recovered attempt is reconciled as uncertain rather than automatically sent again

### Requirement: Source evidence resolves uncertainty

Reconciliation SHALL confirm an uncertain create only through exact source-supported correlation. Otherwise it MUST remain unresolved for investigation; title similarity MUST NOT prove identity or permit retry.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Original creation found

- **WHEN** source-supported correlation establishes the original issue for the recorded operation
- **THEN** that issue identity is retained as confirmed and repeated submission returns it without another create

#### Scenario: No authoritative answer

- **WHEN** correlation is unsupported, incomplete, ambiguous, denied or temporarily unavailable
- **THEN** the unresolved operation, last evidence time, limitation and investigation path remain visible
- **AND** empty or similar search results do not clear the send lock

### Requirement: Exploration does not start agents

Exploring an idea MUST NOT start agents. Assistance requires a separate explicit request through a supported capability; unsupported assistance offers no terminal or alternate execution path.
<!-- pdac:cite id="FR-IDEA-PROMOTION" digest="sha256:02726ca033f3c323ee9b2898ea36086cdebe41aa270c6d785ececc5c1912b9e3" -->
<!-- pdac:cite id="BR-WORK-AUTHORIZATION" digest="sha256:157f762cba7de8c5e40b42a8dfaa83c58e09032ddbebba67065a439ad1e487ce" -->

#### Scenario: Ordinary exploration and unsupported assistance

- **WHEN** the operator captures or revisits an idea and no supported assistance capability exists
- **THEN** no agent starts, assistance is explicitly unsupported and no terminal or shell fallback is provided

#### Scenario: Supported assistance is separately requested

- **WHEN** a supported assistance capability is offered
- **THEN** only a separate informed operator request can invoke its normal authorized entrypoint
- **AND** saving, reviewing or promoting never implies that request

### Requirement: Confirmed work enters the source backlog

Only confirmed source identity SHALL enter the backlog.
<!-- pdac:cite id="FR-BACKLOG-PROJECTION" digest="sha256:b98f45997965ba4d187781ca782921eb8c98cb8a9877de2081d26d1e6e5a4d55" -->
<!-- pdac:cite id="UC-TRIAGE-BACKLOG" digest="sha256:0eaed6ca26d2e957f0eea2fbe207d6b201a0bb25708970f63d4f50c9703db9ac" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Create and link handoff

- **WHEN** a real create or existing-issue link is confirmed
- **THEN** the existing backlog resolves that repository/issue once, retaining source state, timestamps and limitations
- **AND** no stage label, continuation request or agent execution is added by promotion
- **AND** promotion does not claim readiness or replace source facts with local draft state

#### Scenario: Denied abandoned and uncertain journeys

- **WHEN** promotion is denied, a draft is abandoned or a create remains uncertain
- **THEN** the idea does not enter normal backlog without confirmed source identity and no execution request is sent

### Requirement: Accessible review and recovery

Draft, candidate, confirmation and recovery controls SHALL be labelled, keyboard usable and readable on desktop and narrow layouts. Refresh and reconnect MUST preserve the existing operation rather than resubmit it.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Keyboard and narrow journey

- **WHEN** the operator saves, selects, reviews, confirms and investigates recovery using a keyboard on desktop or a 390px viewport in supported themes
- **THEN** focus is visible, statuses are understandable without color, long content does not obscure actions and refresh does not resend
- **AND** viewport checks are not represented as physical-phone acceptance
