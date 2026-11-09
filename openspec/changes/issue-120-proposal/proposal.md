---
pdac-scope: cited
---

# Proposal

## Why

The existing installation runbook pins a historical development revision and explicitly leaves supported release and durable recovery acceptance open. Issue #120 needs a reviewable prerequisite plan before an independent operator can safely rehearse the accepted application.

## What Changes

- Plan a documentation-only increment extending `docs/runbooks/control-center-installation.md`, not a second installation path. Link the existing development identity procedure and #124 adoption instructions.
- Classify source/artifact versions, toolchain inputs, independent HTTPS/OIDC/GitHub configuration and optional runtime settings as pinned, operator-supplied or unresolved.
- Document custody decision slots for #58, version-specific backup/restore and compatible upgrade/rollback boundaries; do not invent durable paths or approve a policy.
- Define a clean-operator rehearsal matrix, safe receipts and AC-1–AC-8 traceability. Actual execution remains later, separately authorized work.
- Keep #120 open and `future`, with coordination on #116. No code, provisioning, installation, source mutation, acceptance or deployment is authorized by this candidate.

## Capabilities

### New Capabilities

None. This increment documents prerequisites and verification of existing/independently owned contracts; it introduces no application behavior.

### Modified Capabilities

None. Read the current `owner-access`, `github-user-connection`, `identity-environments`, `factory-overview`, `delivery-verification` and `visual-identity` specifications, including scenarios. Their requirements remain unchanged. `.openspec.yaml` sets `skip_specs: true`; the rehearsal cases in design.md are an evidence plan, not new specification deltas. Any demonstrated behavioral gap must return to its existing owner and receive a separately scoped proposal.

## Impact

Future implementation of this increment changes operational documentation only. It does not change APIs, configuration keys, data formats, package locks, production origins or cryptographic purposes. Reuse one non-root Linux x64 instance, the existing .NET application/native UI, Aspire development composition and external identity profile. No release artifact is selected by this proposal.

The inspected main is host-supplied `d24953debaab37dfedf7745add1b47dae538a6d7`; the runbook instead pins `4c457c337640795a31492f7219cb0e497df9e232`. The verified owner identifies assembled PR #100 at `281bb63a0782b986603d9275fa1d38350404b00e`, with #112/#103/#105/#111 merged into that feature branch, not main. That head was not inspected here and is not an accepted release. #100 acceptance and #58 security/custody decisions block later executable acceptance, not this documentation plan.

### Product and architecture authority

The accepted model location is declared by docs/product/README.md; draft artifact metadata does not override that policy. ProductShape remains product authority and accepted ADR-0006/0007/0009 govern execution independence, external Keycloak and .NET/Aspire reuse. This candidate documents existing intent; it neither alters the model nor introduces a Product Change.

Impacted constraints: independent installation, independent execution, credential/authority isolation and recovery observation.
<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->

The supplied product index/impact reports identify fleet/adoption, engineering health, runtime operations, execution and delivery neighbours. Check them for boundary effects, but leave their capabilities unchanged: this plan adds no catalog, metrics producer, runtime operation or orchestration. Existing access/source specs govern the identity journey. #121 retains continuity checks, #123 retains visual publication and #124 retains adoption ownership; their work is not duplicated. The current #121/#123 change directories contain metadata only; archived plans and current specs were read rather than treating those stubs as active implementation.

## Review boundary

The first independently verifiable increment is documentation with a complete inventory, named decision owners and executable acceptance cases. The remaining installation/security/recovery work stays on #120 after accepted dependencies and explicit release of the relevant hold. Owner review of this candidate is the next action, not an approval already granted.
