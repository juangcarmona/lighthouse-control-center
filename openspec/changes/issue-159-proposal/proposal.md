# Proposal

<!-- pdac-scope: cited -->

## Why

An admitted operator cannot currently compare repository Actions consumption using measured time and storage evidence. Issue [#159](https://github.com/juangcarmona/lighthouse-control-center/issues/159), under #116, needs an inspectable Project Health slice that never mistakes duration or missing billing access for spend.

## What Changes

- Add read-only Actions usage to Project Health: recent run evidence, exact-attempt job durations, source-reported billable minutes when supported and authorized, current cache bytes and supported artifact bytes.
- Separate elapsed time, summed job duration, billing minutes and unobserved host/model-provider costs. No inferred money, healthy status, alarms or copied thresholds.
- Expose source/report identity, definition/version, units, source and observation times, collection window, coverage and independent freshness.
- Bound every read and show denied, unsupported, unavailable, partial and stale outcomes without converting missing values to zero.
- Preserve exact project-to-run/report navigation. Consume compatible retained samples from #54 only; otherwise show history unavailable.
- Retain current owner/source-authority checks and clear affected private observations after authority loss. No source mutations or execution dependency.

## Capabilities

### New Capabilities

- `actions-usage`: authorized, bounded, explainable Actions time, billing coverage and current storage observations with source drill-down and compatible-history inspection.

### Modified Capabilities

None. `factory-overview` remains an activity view, not a billing report. `github-user-connection`, `owner-access` and `visual-identity` keep their authority and presentation contracts.

## Impact

Extend the existing .NET Workspace source/query boundary and browser Project Health integration; add focused .NET, Node contract and Playwright tests and a usage runbook. No new service, database, framework, credentials, dependency package or source-write API is proposed. Existing transport guards and frontend/module architecture checks remain authoritative.

Issue #54 owns Health detail, common measurement/history contracts and attributable provider cost; #57 owns runner/host/runtime identities and observations. The current #57 candidate proves inventory, not measured consumption. Their interface agreement and current acting-account endpoint/permission review are mandatory before implementation. The owner's future hold remains; this candidate does not accept the design or authorize code work.

## Product impact and authority

Impacted product artifacts are FR-PROJECT-HEALTH, FR-RUNTIME-HEALTH, BR-EXPLAINABLE-SIGNALS, BR-LAN-PRIVILEGE-BOUNDARY, BR-RETENTION-STANDARDS, CON-FACTORY-RUNTIME and QR-MOBILE-OPERATIONS. They ground explained reporting, read-only authority, retained-evidence limits, independence and usable inspection. Their model frontmatter remains draft; the repository identifies model/ as its accepted baseline, not individual approval inferred by this proposal.

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:f13856de8700ab35a6cca5fd6297e25a07719aa44f55f783d4079988eb535d7e" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="BR-RETENTION-STANDARDS" digest="sha256:f2e0fc34e7ac838a26edfbceb72e9afff335518288e37b52b560f2ae3b5db982" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

Discovery used the host's 87-artifact product inventory, relevant inspect/impact reports and baseline text. Neighbours UC-INSPECT-PROJECT-SIGNAL, TERM-HEALTH-MEASUREMENT and BC-ENGINEERING-HEALTH explain the existing investigation purpose; their definitions are not changed. FR-CONFIGURATION-DRIFT, delivery/deployment metrics, command admission, provider administration and capacity policy were excluded: this slice does not redefine them. Questioned relationships in the signal/retention reports are context, not approval or a reason to suppress citations.

No product-intent adjustment is proposed. The active access-continuity and structured-behaviour Product Changes are draft overlays, not additional authority. No provider-cost ingestion, host telemetry, retention-policy ownership, backfill, budgeting, deletion, allocation, dispatch or credential expansion is included.

## Completion boundary

The planned result is a candidate for owner review. Future Done requires the mapped AC1–AC7 evidence, tests and documentation per slice, full repository verification and developer review of every lifecycle Done dimension. Live-source, visual, implementation and integration checks have not been performed by this proposal.
