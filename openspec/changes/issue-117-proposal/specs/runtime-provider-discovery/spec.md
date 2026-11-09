## Purpose

Expose runtime-provider capabilities and inventory as bounded source evidence without granting administrative authority or coupling repository delivery to Control Center.
<!-- pdac:cite id="BC-RUNTIME-OPERATIONS" digest="sha256:07a2f3d2b6f5a25d22deda174fe9c35169d65a8a02ddfb15ef8658c2fe1c9144" -->
<!-- pdac-scope: cited -->

## ADDED Requirements

### Requirement: Independent versioned discovery

Provider descriptors SHALL declare scoped identity, contract versions and capabilities without granting execution authority.
<!-- pdac:cite id="FR-RUNTIME-PROVIDER-OPERATIONS" digest="sha256:59e7f1eb588e54c5d52773b7a30e5384e0d6b0eb8bb6ff5c1c625382a3a3ad05" -->
<!-- pdac:cite id="QR-PROVIDER-EXTENSIBILITY" digest="sha256:060c4af7c05abe49f1c348cc68e1e54715a8174acf42928f9ba5d43b477164bf" -->

#### Scenario: Inventory without telemetry or operations

- **WHEN** a local provider supports inventory but has no telemetry producer or executable operations
- **THEN** inventory remains discoverable and telemetry and operations explicitly report unavailable support with limitations rather than inheriting inventory support

#### Scenario: Provider identity and independent descriptors

- **WHEN** a configured provider exposes inventory, telemetry or operation discovery
- **THEN** its stable instance ID, kind, resource scope and contract version remain explicit, and each capability separately identifies its version, support state, target kinds and limitations

#### Scenario: Incompatible or missing version

- **WHEN** a requested contract or capability version is absent or unsupported
- **THEN** the affected read reports that incompatibility explicitly without invoking an older capability or fallback command

### Requirement: Unsupported capabilities remain unavailable

Discovery SHALL explicitly represent unsupported drain, restart and scaling. Capability descriptions SHALL identify applicable scope, targets, parameter bounds, grant/confirmation requirements and outcome limitations where supplied. Unsupported or missing capability evidence MUST NOT authorize an alternative operation.
<!-- pdac:cite id="FR-RUNTIME-PROVIDER-OPERATIONS" digest="sha256:59e7f1eb588e54c5d52773b7a30e5384e0d6b0eb8bb6ff5c1c625382a3a3ad05" -->

#### Scenario: Unsupported local operation

- **WHEN** a consumer inspects drain, restart or scaling for the observation-only local provider
- **THEN** each is explicitly unsupported and no shell, provider-neutral substitute, preview or submission is executed

### Requirement: Scoped resource identities

Provider instances and each entity kind SHALL have distinct stable scoped identities. Pools, hosts, runners, agent runtimes and model providers MUST NOT collapse into each other. Names and labels SHALL remain display data, not identity.
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
<!-- pdac:cite id="QR-PROVIDER-EXTENSIBILITY" digest="sha256:060c4af7c05abe49f1c348cc68e1e54715a8174acf42928f9ba5d43b477164bf" -->

#### Scenario: Equal IDs in different scopes

- **WHEN** two provider instances or entity kinds report equal source IDs and names
- **THEN** their projected identities remain distinct and relationships cannot cross scopes implicitly

#### Scenario: Display rename

- **WHEN** an entity changes its display name without changing its source identity
- **THEN** its stable identity remains unchanged

### Requirement: Source-established relationships

Typed pool-member, runner-host, job-runner, execution-runtime and runtime-model-provider relationships SHALL be emitted only when established source identifiers support them. Missing or contradictory evidence SHALL remain explicitly unknown rather than synthesized from names, labels or proximity.
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->

#### Scenario: Positive source-ID join

- **WHEN** source evidence identifies both scoped endpoints and their typed relationship
- **THEN** the projection preserves that relationship and its source provenance

#### Scenario: Absent or contradictory correlation

- **WHEN** entities have identical labels but no source relationship, or source identifiers conflict
- **THEN** no asserted edge is emitted and the missing or conflicting correlation remains inspectable as a limitation

### Requirement: Existing inventory authority and bounds

The local adapter SHALL preserve accepted #57 local-registration and GitHub permission checks, configured-root and file/process read bounds, session/source isolation and explicit denied/unavailable/partial evidence. Registration MUST NOT confer authority, and denied or incomplete reads MUST NOT become empty success.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Permission loss or source disconnection

- **WHEN** current user/app authority is lost or the connection/session changes during a read
- **THEN** protected data is not returned or reused across that boundary and the result preserves denied or unavailable semantics

#### Scenario: Registration outside accepted read bounds

- **WHEN** configured inventory contains an unsafe path or exceeds the accepted file/process budget
- **THEN** the adapter does not broaden access and retains the baseline rejection or partial/unavailable result and limitations

### Requirement: Bounded provenance-preserving pages

Inventory pages SHALL preserve source provenance within accepted authority scope and read budgets.
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

#### Scenario: Page boundary and exhausted budget

- **WHEN** inventory has another page or a read budget is exhausted before enumeration completes
- **THEN** collected records retain IDs, resource scope, source and observation times, revision or ETag when available, completeness and limitations, with a bounded continuation where valid; exhaustion never claims complete inventory

#### Scenario: Invalid continuation

- **WHEN** a continuation is malformed or belongs to another provider, scope or connection
- **THEN** it is rejected safely without reading outside the authorized scope

#### Scenario: Missing revision or source time

- **WHEN** the source supplies neither a revision nor a source timestamp
- **THEN** those facts remain unknown and the observation time does not substitute for either

### Requirement: Independent evidence dimensions

Availability, completeness, freshness and resource measurements SHALL remain independently represented.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:24fdf64ce66a09fa35b21d0cbf75b7e38235f289cefdb30c1849981cc14f55fa" -->

#### Scenario: Partial stale snapshot without counters

- **WHEN** retained inventory is partial and stale and supplies no resource counters
- **THEN** both limitations and original times remain visible, stale evidence gains no new authority, and missing measurements remain unknown rather than zero

#### Scenario: Failure versus authorized empty page

- **WHEN** reads return denial, unsupported capability, source failure, unavailable evidence or a successful empty page
- **THEN** each remains distinguishable and only the successful page reports known empty collected results within its coverage

### Requirement: Capacity state is not measured readiness

Requested and desired capacity MUST remain distinct from measured readiness and usable instances.
<!-- pdac:cite id="QR-PROVIDER-EXTENSIBILITY" digest="sha256:060c4af7c05abe49f1c348cc68e1e54715a8174acf42928f9ba5d43b477164bf" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:24fdf64ce66a09fa35b21d0cbf75b7e38235f289cefdb30c1849981cc14f55fa" -->

#### Scenario: Divergent platform counts

- **WHEN** a Kubernetes double reports desired 5 and ready 2, or a VMSS double reports requested 5 and provisioned 3
- **THEN** each count retains its distinct meaning, source and observation time, with missing measurements unknown and no claim of five usable instances

#### Scenario: Desired state is not readiness

- **WHEN** a provider accepts a request or registers an entity with desired/requested capacity
- **THEN** that state alone does not establish provisioned, ready or independently verified capacity

### Requirement: Observed asynchronous outcomes

Provider outcome evidence SHALL distinguish accepted, pending, uncertain/timeout, failed and completed states. Completion MUST NOT imply independently verified usable capacity. Observing an uncertain outcome MUST NOT resubmit a command.
<!-- pdac:cite id="QR-PROVIDER-EXTENSIBILITY" digest="sha256:060c4af7c05abe49f1c348cc68e1e54715a8174acf42928f9ba5d43b477164bf" -->

#### Scenario: Pending timeout and later completion

- **WHEN** a contract double supplies accepted, pending, timeout/uncertain and later completed observations for the same source operation
- **THEN** the consumer preserves operation identity, ordered evidence and actual observed state without retrying submission or asserting independent verification

### Requirement: Observation has no execution authority

Provider discovery SHALL not grant execution or cancel independent repository work.
<!-- pdac:cite id="BC-RUNTIME-OPERATIONS" digest="sha256:07a2f3d2b6f5a25d22deda174fe9c35169d65a8a02ddfb15ef8658c2fe1c9144" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

#### Scenario: Discovery and refresh are read-only

- **WHEN** a consumer discovers capabilities or refreshes local inventory, including hostile provider text
- **THEN** only accepted bounded reads occur; no command, helper, shell fallback, source mutation, administrative execution, host privilege expansion or scheduling is introduced; displayed text remains inert and projections remain credential-free

#### Scenario: Control Center is stopped

- **WHEN** Control Center is unavailable
- **THEN** repository workflows and their independent runtime retain orchestration and execution without this provider boundary
