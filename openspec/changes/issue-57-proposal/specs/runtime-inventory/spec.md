## ADDED Requirements

<!-- pdac-scope: cited -->

### Requirement: Separately authorized runner observations

The workspace SHALL show bounded operator-selected host registrations separately from acting-user GitHub repository runners, with source identity, collection time, coverage and explicit unavailable authority. Neither source SHALL grant access to the other.

#### Scenario: Local registration and denied GitHub inventory

- **WHEN** an owner can read a configured local registration and the connected GitHub App lacks administration access
- **THEN** the registration is shown as a file observation, GitHub inventory is denied rather than empty, and no operator credential or inferred process-health result is used

#### Scenario: Empty and partial source inventory

- **WHEN** GitHub supplies zero runners or a bounded page shorter than its source total
- **THEN** only the verified zero-total collection is described as no runners; incomplete coverage and unknown fields remain explicit

### Requirement: Scope-safe identity and state

The workspace SHALL preserve source-reported labels, availability and busy state without deriving capacity or physical location. Registration correlation SHALL require repository scope and numeric runner identity, retaining source conflicts.

#### Scenario: Same numeric ID across repositories

- **WHEN** local and GitHub records have the same numeric runner ID in different repositories, or matching scope/ID with different names
- **THEN** different scopes are not joined, name conflicts remain visible, and neither case infers process health or runner location from a name/label

#### Scenario: Source authority changes during refresh

- **WHEN** a GitHub source becomes denied or the account changes while another source read is pending
- **THEN** prior affected GitHub facts disappear immediately, unrelated owner-authorized host observations stay separate, and owner-session loss clears all facts

### Requirement: Committed adoption facts

The workspace SHALL display configured-repository Lighthouse adoption evidence at an exact verified GitHub-origin commit, separating declarations, resolved versions and workflow pins from deployed or required versions. Missing or oversized inputs SHALL remain unknown.

#### Scenario: Dirty checkout and missing configuration

- **WHEN** a selected checkout has uncommitted package changes or lacks a supported source file
- **THEN** displayed facts come only from the exact committed revision, missing facts and operator-selected coverage remain explicit, and no installation, upgrade or repository mutation occurs

### Requirement: Read-only usable refresh

The Runtime view SHALL offer explicit bounded refresh, source recovery links and keyboard/narrow-layout access without controlling execution or fabricating missing health/usage measurements.

#### Scenario: Observation failure and independent runtime

- **WHEN** a source refresh fails transiently or SoFa stops
- **THEN** retained results keep their original times and a stale marker, unavailable measurements remain unknown, and independent runtime supervision continues without a SoFa allocation/cancellation side effect

<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="UC-MAINTAIN-RUNTIME" digest="sha256:3f59de22de35a1875c32c4901ce7488c68bf32d878d0c62e2ca70fa12b38852b" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:24fdf64ce66a09fa35b21d0cbf75b7e38235f289cefdb30c1849981cc14f55fa" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
