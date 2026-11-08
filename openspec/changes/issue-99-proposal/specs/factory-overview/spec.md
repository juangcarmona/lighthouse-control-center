## ADDED Requirements

<!-- pdac-scope: cited -->

### Requirement: Exact source run attempt

Each collected run SHALL expose its source attempt consistently in serialized observations and cards. A known attempt MUST preserve the exact positive integral source value. Missing, malformed, nonpositive or fractional source attempts MUST remain explicitly unknown, never defaulted or rounded to a nearby integer.

#### Scenario: First attempt and retry

- **WHEN** collected source runs report numeric attempts 1 and 2
- **THEN** CLI and authenticated snapshots retain the corresponding known attempts and cards distinguish attempt 2 from attempt 1
- **AND** repository/run identity, revision, timestamps and source link remain unchanged; attempt 2 alone does not assert successful recovery

#### Scenario: Missing or malformed attempt

- **WHEN** the source attempt is absent, null, a string, a boolean, an object, nonpositive or fractional
- **THEN** the serialized attempt is null and the card labels the source attempt unknown without discarding the otherwise collected run

#### Scenario: Fraction hidden by floating-point rounding

- **WHEN** the actual source JSON contains `run_attempt: 1.00000000000000001`
- **THEN** both collection paths treat its exact fractional value as unknown even if floating-point parsing would yield 1
- **AND** validation occurs before precision loss; neither path rounds malformed evidence into a known attempt
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->

### Requirement: Source triggering event

Each collected run SHALL expose its source triggering event in serialized observations and cards. An absent event MUST remain explicitly unknown. Event text MUST remain inert and MUST NOT grant authority or imply an outcome.

#### Scenario: Known triggering event

- **WHEN** GitHub supplies a triggering event such as `workflow_dispatch` or `push`
- **THEN** the CLI and authenticated snapshots preserve that event and every corresponding card displays it as source text beside the existing run evidence

#### Scenario: Missing or hostile event text

- **WHEN** the event is absent or null, or a supplied event contains markup-like text
- **THEN** an absent event serializes as null and displays as unknown
- **AND** supplied text is never interpreted as HTML, a control, a new link or execution authority
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->

### Requirement: Consistent metadata without changing observation boundaries

Source attempt and event metadata SHALL agree across the CLI, authenticated projection and every existing run-card location. The addition MUST preserve existing observation safety and evidence limitations and MUST NOT request work or change execution authority.

#### Scenario: Every existing card location

- **WHEN** runs appear in running, queued/pending/requested, waiting, completed history, unclassified statuses or stale repository evidence
- **THEN** each card shows its known or unknown source attempt and triggering event using the existing safe source link
- **AND** grouping, counts, repository filtering, keyboard/focus behavior and accessible desktop/390px light/dark layout remain unchanged

#### Scenario: Refresh and unavailable evidence

- **WHEN** refresh fails, source evidence becomes stale/unavailable, or source/session authority is lost
- **THEN** existing stale retention, original timestamps, unavailable-source handling and authority-loss clearing continue unchanged, with no invented metadata or activity
- **AND** permission-before-cache checks, session/generation guards, coalescing, cancellation and read-stop behavior remain unchanged
- **AND** no new source request, mutation, credential or dependency on SoFa for repository execution is introduced
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
