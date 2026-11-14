# Issue controls

<!-- pdac-scope: cited -->

## ADDED Requirements

### Requirement: Shared source decisions govern explicit issue effects

The workspace SHALL use the released shared issue-control contract for supported actions, current questions and reservation/source decisions, and SHALL preserve unsupported and unavailable reasons without copying policy.

#### Scenario: Source inputs or grant change before submission

- **WHEN** source/session/account/repository state changes after an action was displayed
- **THEN** fresh server and source admission reject or explain the stale intent without a stale dispatch

### Requirement: Durable caller claims precede one possible source write

The workspace SHALL persist the source-bound intent and transactionally claim its stable identity before its exact prepared effect, reusing the existing receipt for the same payload and rejecting a changed payload.

#### Scenario: Reconnect or process restart after a lost response

- **WHEN** a source write may have succeeded and its response or local completion was lost
- **THEN** the existing claim remains uncertain and is reconciled by authenticated source identity without another send or a newest-run guess

### Requirement: Ordinary comments and explicit continuation remain distinct

The workspace SHALL attribute comments to the verified GitHub user and SHALL bind explicit continuation to the verified current question and original grant.

#### Scenario: An ordinary comment is posted during work

- **WHEN** the owner explicitly posts an ordinary comment after seeing its source-freshness effect
- **THEN** the workspace shows its exact comment receipt or uncertainty, requests no continuation and does not promise pending publication stays valid

#### Scenario: Continuation is acknowledged but has no validated passing result

- **WHEN** the source admits the answer, or its workflow fails, blocks or lacks a matching validated result
- **THEN** the workspace preserves separate request/execution/outcome facts and does not claim the original question is resolved

### Requirement: Owner and source scope bound every read and effect

The workspace SHALL keep source credentials server-side, require the exact owner/account/repository scope and CSRF boundary, and remove private data after recognized authority loss.

#### Scenario: A stale child or browser response arrives after source replacement

- **WHEN** the owner disconnects, changes source account or loses repository authority
- **THEN** no new source request starts under the old guard and its late result cannot restore prior private content or authorize another effect

<!-- pdac:cite id="UC-OPERATE-ISSUE" digest="sha256:125cec42bb77d281e22920ae2b491eb2f43afe7dfd5f0a700fd289842af11d62" -->
<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->
<!-- pdac:cite id="FR-ISSUE-CONVERSATION" digest="sha256:936e13fb5556657bf62b15f7b5fb8c943b1aaa00736100b5ba4bc6c51689e463" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
