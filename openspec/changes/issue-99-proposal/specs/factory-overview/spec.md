## ADDED Requirements

<!-- pdac-scope: cited -->

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
