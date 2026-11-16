---
pdac-scope: cited
---

# Proposal

## Why

Operators can already inspect issue history and referenced PRs, but cannot inspect checks for the exact integrated commit. A newer green branch run must not replace evidence for the issue's result.
<!-- pdac:cite id="FR-DELIVERY-EVIDENCE" digest="sha256:5a56ea8e0030730dfdf0d8fd51027c45c2e6ddd65393b6d7726c85c27e543074" -->

## What Changes

- Extend the existing protected evidence reader with exact merged-commit checks and bounded default-branch push runs and artifact inventories.
- Keep PR-head checks, review revisions, integration facts, human decisions and deployment evidence separate. Label mismatched or unknown check bindings.
- Explain that Implement, Integrate and Review are unavailable through the selected public SDK; preserve supported shared controls and receipt recovery unchanged.
- Present source identifiers and times in accessible disclosures using existing issue-view styling, with controlled HTTP and browser coverage.
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:f2639559cb8742b8f4642d3a5a3b5031b5b1bded58778bbc499067f44abd4ae5" -->

## Capabilities

### New Capabilities

- `issue-delivery-evidence`: inspect exact-commit delivery observations and their limitations without inferring approval or delivery.

### Modified Capabilities

None. The overview and toolchain verification specifications retain their existing boundaries.

## Impact

Additive changes to the workspace Source evidence adapter, existing issue browser, focused tests and operator guidance. No new dependency, grant, route, journal, executor, mutation, deployment mechanism or product decision.

This reconciles historical draft #148 at `2a2f00ff8d699a769bc03482434e623a9a642662` with current source supplied by the host at `251120e3e18f76d88165aa1b039f6c9ac6d1f254`. The #158 history and #47/#48/#50 adapters are present and reused. The owner continuation supersedes the old routine future hold; actual connected-user prerequisite acceptance is not inferred. ADR-0008 is now recorded Accepted; this change makes no ADR decision. Broader historical graph/proposal-artifact work is not silently represented as complete.

Product authority is the applied model, including CHG-LCC-EVOLUTION-001, ACT-OPERATOR, UC-VERIFY-DELIVERY and its rules. Real-source qualification, independent review, exact-head forge checks, integration and deployment retain their authorities. The implementation can be reviewed without claiming those future results.
