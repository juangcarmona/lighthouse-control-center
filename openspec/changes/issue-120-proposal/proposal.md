---
pdac-scope: cited
---

# Proposal

## Why

The installation runbook pins a historical development revision and leaves supported release and recovery acceptance open. Issue #120 needs a version-bound prerequisite inventory and safe rehearsal plan before an independent operator can install and recover an accepted application.

## What Changes

- Extend `docs/runbooks/control-center-installation.md`, the existing installation entrypoint; reuse development identity guidance and #124 adoption instructions.
- Classify executable/dependency versions, independent HTTPS/OIDC/GitHub configuration and optional runtime settings as pinned, operator-supplied or unresolved.
- Document the current separate access-continuity and command-journal custody surfaces, while retaining #58 production custody and recovery decisions.
- Provide backup/restore and compatible upgrade/rollback outlines, a clean-operator rehearsal matrix and exact-version receipt format. All live rehearsal rows remain planned, not passed.
- Extend the documentation increment from proposal PR #153 with the two owner-authorized regression-test paths: persisted session deadlines across restart and operator-selected External configuration without optional runtime/control providers. No production behavior, installer, provisioning, source mutation or deployment is added.
- Use the owner's first installation, authenticated source connection, restart and recovery in their own environment as the pending #120 rehearsal; no second clean machine is required. Deterministic checks do not complete that rehearsal or #58 acceptance.

## Capabilities

### New Capabilities

None. This increment documents existing contracts and independently owned acceptance prerequisites.

### Modified Capabilities

None. The existing `owner-access`, `github-user-connection`, `identity-environments`, `factory-overview`, `delivery-verification` and `visual-identity` requirements remain unchanged. `.openspec.yaml` opts out with `skip_specs: true`; rehearsal cases are an evidence plan, not specification deltas. Demonstrated behavioral gaps return to their existing owner.

## Impact

Operational documentation, its OpenSpec plan and additive assertions in `tests/SoFa.Web.Tests/OwnerSessionsTests.cs` and `tests/SoFa.Web.Tests/WorkspaceOptionsTests.cs`; no API, configuration schema, data format, dependency lock or cryptographic-purpose change. One non-root Linux x64 instance reuses the existing .NET/native UI and Aspire composition. Other operating systems, HA, concurrent writers, enterprise infrastructure and provider administration remain excluded.

This reuses unmerged proposal PR #153 at `1bb987a9e9b52febec11473f8da930c1a15e30a4`. Its original inspected main `d24953debaab37dfedf7745add1b47dae538a6d7`, historical runbook pin `4c457c337640795a31492f7219cb0e497df9e232` and owner-reported assembled #100 head `281bb63a0782b986603d9275fa1d38350404b00e` retain their separate meanings. The current host-supplied source is `d3a166bc2de76a0aa4b25c970baba30c29eb00f2`: journal and access-continuity code is now present, but presence is not accepted executable or actual-source qualification. No owner-reported feature head is promoted to a release.

### Product and architecture authority

ProductShape under `docs/product/` remains authoritative; accepted ADR-0006/0007/0009 retain independent execution, external Keycloak and .NET/Aspire reuse. No Product Change is introduced. #121 continuity, #123 identity/assets and #124 adoption remain separately owned. Installed-runtime acceptance and #58's external identity/TLS/custody matrix are later work, not inferred from documentation or deterministic tests.

<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->
