# Spec Delta

## Purpose

<!-- pdac-scope: cited -->

Let admitted operators navigate from configured repositories to explained source-linked observations without implying unsupported health coverage.

## ADDED Requirements

### Requirement: Health preserves configured fleet scope

The workspace SHALL expose Health with every configured repository, project drill-down, collection bounds and observation age. Denied and unavailable evidence MUST remain distinct from a successful empty collection.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

#### Scenario: Mixed fleet evidence

- **WHEN** repositories include readable, denied and unavailable sources
- **THEN** each remains navigable with explicit coverage and freshness and no overall healthy verdict

### Requirement: Source signals remain explainable

Health SHALL group source-linked, explained signals by family and expose missing evidence without fabrication.
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Inspect a workflow observation

- **WHEN** the operator opens a collected workflow signal
- **THEN** its source status and conclusion, exact run link and metadata remain inspectable without implying deployment acceptance
- **THEN** Delivery, Engineering quality, Lighthouse adoption/autonomy and Resources distinguish supported observations from missing sources; details explain purpose, definition/version, unit, window, coverage, freshness, applicability and limitations using only supported fields

#### Scenario: No comparable samples

- **WHEN** the source supplies no comparable measurement series
- **THEN** no chart, score, copied threshold or fabricated zero appears and missing history is explained

### Requirement: Refresh retains source authority boundaries

Health refresh SHALL only read existing authorized projections. Lost authority MUST clear affected records. Temporary failure SHALL retain old evidence only with original timestamps and a stale warning.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->

#### Scenario: Permission loss

- **WHEN** source permission is denied or the account scope changes
- **THEN** earlier private records are removed and refresh never dispatches work

### Requirement: Health supports keyboard and mobile inspection

Health SHALL use the Lighthouse shell and remain keyboard reachable at desktop and 390px widths in light and dark appearance, including long names and textual evidence states. Demonstration evidence MUST be labelled.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

#### Scenario: Narrow inspection

- **WHEN** an operator follows fleet, project and signal links at 390px
- **THEN** source text and controls remain usable without horizontal page overflow
