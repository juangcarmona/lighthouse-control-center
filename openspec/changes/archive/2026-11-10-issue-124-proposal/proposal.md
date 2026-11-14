# Proposal

<!-- pdac-scope: none reason="Owner-requested operational inventory and operator documentation only; no product behavior or accepted intent changes." -->

## Why

The dependency upgrade is already integrated, but older operational notes still describe the previous tuple and delivery grant. Operators need a revision-bound inventory and a repeatable dogfooding procedure that distinguishes installed contracts from actual application acceptance.

## What Changes

- Add `docs/runbooks/lighthouse-dogfooding.md` with package/profile/managed-file, workflow, source-control, runner, telemetry and verification inventories.
- Classify capabilities as implemented, partial, unavailable or unsupported, with source references and explicit evidence limits.
- Reuse the existing workflow, rename, identity and installation runbooks; link the guide from the root README and current workflow entrypoint.
- Preserve #124's later authenticated mission demonstration and #120's prerequisite-only proposal PR #153 as separate work. Do not repeat #126's upgrade or #123's visual delivery.

## Capabilities

### New Capabilities

None. This increment documents existing capabilities only.

### Modified Capabilities

None. Existing `delivery-verification`, `factory-overview` and `visual-identity` specifications remain unchanged. The inspected specification inventory also includes `github-user-connection`, `identity-environments` and `owner-access`. No behavioral delta is warranted; `.openspec.yaml` opts out with `skip_specs: true` while retaining host metadata.

## Impact

Documentation and this issue's OpenSpec planning root only. No package, lock, source, test, policy, workflow, credential, provider or deployment changes. ProductShape and ArcShape keep their existing authority. The owner explicitly selected this documentation-only increment; it neither derives new product requirements nor changes existing ones.

Test impact: run the supplied locked installation, container verification and strict issue-specific OpenSpec validation, plus installed Lighthouse verification and documentation/source-reference checks where available. Preserve failed or cancelled attempts; no missing check becomes a pass. Independent host checks, PR/CI, review and integration follow publication and are not receipts this worker can supply.
