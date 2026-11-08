---
pdac-scope: cited
---

# factory-overview Specification

## Purpose

Provide a bounded, read-only factory overview of collected workflow activity and source-labeled human waits, with stable identity and explicit evidence limits. This delivery specification consumes ProductShape intent and covers only issue #90's observer slice, not the complete authenticated workspace.
<!-- pdac:cite id="JRN-DAILY-FACTORY-OPERATIONS" digest="sha256:a604012667b4b06339399a2f496380b24657fa3e71fc93d72d01187b2d4a272e" -->

## Requirements

### Requirement: Source-backed workflow overview

The overview SHALL show every collected active run in the selected scope with source-backed card facts.
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Active states and completed history

- **WHEN** collected runs include in_progress, queued, pending, requested, waiting and completed, with active records beyond the first eight
- **THEN** every collected active run is visible with repository, stable source identity, title, exact source status, revision and safe source link or explicit unavailable values; running, queued/pending/requested and waiting are distinct groups
- **THEN** completed runs remain inspectable separately and do not contribute to active counts

#### Scenario: Unknown state is not invented activity

- **WHEN** a source reports an unfamiliar status or omits a revision
- **THEN** the status remains inspectable separately as unclassified, excluded from active counts, and the revision is unavailable, without inferring completion, runner failure, session activity or approval ownership

### Requirement: Distinct source-labeled human waits

The overview SHALL prominently show and count source-labeled human waits without inventing owner action.
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->

#### Scenario: Mixed source labels

- **WHEN** issues have needs-info, waiting-review, both wait labels, or only ready/agent-working
- **THEN** only the first three kinds appear as human waits, each repository/issue counts once, both wait reasons remain visible on one issue, and each wait shows repository, number, title, source reason/labels and safe source link or unavailable values
- **THEN** ready/agent-working alone does not suggest owner action; a workflow waiting status alone neither adds a human-wait issue nor identifies an approver

### Requirement: Observer issue compatibility

Original collected issue facts SHALL remain available to existing observer clients.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

#### Scenario: Human-wait projection preserves source facts

- **WHEN** the overview distinguishes human waits from other collected attention items
- **THEN** the existing observer response retains the original issue facts and source labels, including ready/agent-working; other attention items remain inspectable without invented urgency

### Requirement: Source timing remains explainable

The overview SHALL show valid source times and ages as of observation; unavailable times SHALL stay unavailable.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->

#### Scenario: Available and unavailable timestamps

- **WHEN** records mix valid start/update timestamps with omitted, null, invalid or future-relative values
- **THEN** valid source timing has understandable ages and inspectable absolute timestamps with repository observation time; missing, invalid or inconsistent timing is unavailable, never epoch dates or zero ages

#### Scenario: Elapsed time requires a source start

- **WHEN** an in-progress run supplies a valid start time and observation time
- **THEN** its elapsed time is measured between those timestamps and labeled as of observation; missing starts are not inferred from updates, queue time is not execution duration and completed history does not imply a completion duration

### Requirement: Issue age is source-update age

Human-wait issue age SHALL describe time since source update, not duration of the wait.
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

#### Scenario: Updated issue with a human-wait label

- **WHEN** a collected needs-info or waiting-review issue has a valid updated timestamp
- **THEN** its age is labeled since source update as of observation, without asserting when the human wait began; missing or invalid timestamps remain unavailable

### Requirement: Scoped filtering

The overview SHALL filter configured repositories and retain selection across refresh, with explicit count scope.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->

#### Scenario: Filter survives successful and failed refresh

- **WHEN** a configured repository is selected and observations refresh or the refresh fails
- **THEN** selection persists, all sections/counts explain and retain that scope, and an unavailable repository remains selectable alongside All repositories and every configured repository

### Requirement: Stable keyboard navigation

Source identity SHALL survive redraw and state changes; focus SHALL remain reachable without unrelated focus theft.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Focus survives identity changes in presentation

- **WHEN** a focused run or issue changes title, ordering, safe href or active/history group on refresh
- **THEN** focus follows the same repository/source identity rather than another identically named card, with its source control still reachable

#### Scenario: Focused card disappears

- **WHEN** refresh removes the focused source control or makes its link unsafe
- **THEN** focus moves to a safe persistent repository action or overview control, not a removed element or disabled button

#### Scenario: Refresh preserves unrelated control focus

- **WHEN** focus is on a persistent filter, refresh button or another control outside the results
- **THEN** refreshing results does not steal that focus

### Requirement: Evidence limits remain visible

The overview SHALL expose bounded collection, selected coverage and distinct known counts versus unavailable evidence.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->

#### Scenario: Partial and unavailable repositories

- **WHEN** one configured repository is available with bounded results and another read fails
- **THEN** the view states repository observation times, latest-20-workflow-run and first-100-open-issue-record bounds, selected coverage, collected active-run counts, human-wait-issue counts and unavailable repositories
- **THEN** available results contribute only known collected counts; the failed read remains unknown and counts explain the unknown remainder, never exhaustive factory activity

### Requirement: Missing evidence is not inactivity

Missing source evidence SHALL NOT imply zero activity or health.
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

#### Scenario: All unavailable versus collected empty

- **WHEN** all selected repositories are unavailable, or a successful bounded collection contains no matching records
- **THEN** unavailable totals remain unknown while successful empty results say no matching collected records, neither claiming an idle or healthy factory

### Requirement: Failed refresh retains stale evidence

Failed refresh SHALL retain the previous valid view and observation times with a stale warning.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

#### Scenario: Failed refresh and initial failure

- **WHEN** fetch or JSON refresh fails after a valid view, or before any valid observation
- **THEN** the previous view, selection and observation times are retained and labeled stale in the first case, and no observation is available in the second; neither failure fabricates empty evidence or makes old timing newly observed

### Requirement: Safe source inspection

Source text SHALL remain inert; navigable source links SHALL be repository-bound HTTPS GitHub links.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->

#### Scenario: Hostile text and unsafe links

- **WHEN** records contain markup-like titles, unsafe schemes or links outside their repository
- **THEN** text remains inert and unsafe links are not navigable while valid source links remain inspectable

### Requirement: Accessible native overview

The overview SHALL preserve keyboard access, visible focus, native Lighthouse themes and usable 390px layout.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Phone and keyboard inspection

- **WHEN** the owner uses filter, refresh, history and source controls by keyboard at desktop and 390px sizes in light and dark themes
- **THEN** controls remain accessible with visible focus and long names, labels and revisions do not cause horizontal overflow

### Requirement: Observation remains independent

Repository execution SHALL remain independent of SoFa; observation SHALL NOT become execution authority.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->

#### Scenario: Observation does not own execution

- **WHEN** the owner inspects workflow or issue evidence
- **THEN** repository workflows and their independent runtime retain execution authority, without embedded agents, new scheduling or dependence on SoFa availability

### Requirement: Observation remains read-only

Observation SHALL preserve the configured allowlist, bounded shared cache and read-only server boundary.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->

#### Scenario: Refresh cannot dispatch work

- **WHEN** a client refreshes or filters observations, requests an unconfigured repository or attempts a mutating HTTP method
- **THEN** refresh/filter remain read-only over configured cached evidence, unconfigured access is not added and mutating methods are rejected
- **THEN** source inspection and navigation introduce no mutation API, credential or authentication change and request no work

### Requirement: Source run attempt evidence

Each collected run SHALL expose its source attempt as a known positive exact integer or explicitly unknown. A fractional numeric source value MUST NOT become known through rounding. Attempt metadata SHALL NOT replace run identity or establish successful recovery.

#### Scenario: Known attempts distinguish a retry

- **WHEN** GitHub supplies run_attempt 1 or 2 for an existing run
- **THEN** the projection preserves the known attempt and distinguishes 2 from 1 without changing repository/run identity or inferring recovery

#### Scenario: Missing and malformed source attempts

- **WHEN** run_attempt is absent, null, nonnumeric, nonpositive, fractional or not exactly representable in the projection
- **THEN** its projected attempt is explicitly unknown without coercion, a default first attempt or a nearest integer

#### Scenario: Fractional JSON must survive precision checks

- **WHEN** source JSON contains run_attempt as the numeric lexeme `1.00000000000000001`
- **THEN** both CLI and authenticated observation parsing paths retain the fact that it is fractional and project unknown, even if a floating-point parser would produce 1
- **THEN** exact integral numeric forms such as `1`, `1.0`, `1e0` and `2` remain known when representable
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

### Requirement: Source triggering event evidence

Each collected run SHALL expose its triggering event from GitHub as source text or explicitly unknown. Missing or malformed event evidence MUST NOT be inferred from other run facts.

#### Scenario: Known triggering event

- **WHEN** GitHub supplies a nonblank string event for a collected run
- **THEN** the projection preserves that event as source evidence associated with the same repository/run and existing source link

#### Scenario: Unknown triggering event

- **WHEN** event is absent, null, blank or not a string
- **THEN** event is explicitly unknown rather than inferred from workflow name, status, labels or attempt
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

### Requirement: Consistent safe run metadata presentation

The CLI snapshot, authenticated observation projection and every existing run-card category SHALL agree on known and unknown attempt/event evidence. The additions MUST preserve existing source, safety, accessibility, freshness and read-only boundaries.

#### Scenario: Serialized and displayed metadata agree

- **WHEN** a run with known or unknown attempt/event evidence is serialized or displayed in active, completed, unclassified or retained stale evidence
- **THEN** CLI and authenticated JSON include both fields with the same semantics, using null for unknown, and its card labels both facts with unknown where necessary
- **THEN** older snapshots missing these fields display unknown and the existing repository-bound run source link remains unchanged

#### Scenario: Safe metadata under refresh and filtering

- **WHEN** event contains hostile markup or long text, or an attempt changes while observations refresh or filters change
- **THEN** source text remains inert, layout remains usable in existing desktop/mobile themes, and keyboard focus follows the same run identity
- **THEN** source revisions, timestamps, work/wait groups, counts, filters, stale/unavailable evidence and existing accessibility behavior are preserved

#### Scenario: Metadata does not grant authority

- **WHEN** a client reads or refreshes run metadata with valid, lost or unavailable source authority
- **THEN** existing authentication/session, permission-before-cache, coalescing, invalidation and stale-evidence rules remain unchanged
- **THEN** observation introduces no source mutation, new credential, execution dependency or recovery claim; repository workflows retain execution authority
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:9f39dd08a392db995a75f26c9a30ed4d4ec43f73ad0ccafbdfaa3d0eabc1528a" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
