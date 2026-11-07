---
pdac-scope: cited
---

## Why

Native SoFa delivery reached implementation and passed trusted host checks, but its author correctly reported a scanner executable failure in the editing container. The scanner ignores the supplied executable XDG cache and writes to the noexec home cache. The owner has authorized finishing #88 and necessary merges. Repository workflows and the independent runtime retain execution ownership; SoFa remains optional.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## What Changes

- Honor an absolute XDG_CACHE_HOME on non-Windows systems, retaining the existing home fallback and Windows behavior. Preserve authenticated download, version check, scanning, redaction and locks.
- Adopt published CLI 0.12.53 / SDLC 0.21.4 at immutable dd1694735391f54241604a1686ccd627de7b2036 through official tools, including final-review/CI completion fixes.
- Record the approved #90 retrospective with missing usage measurements explicit.
- Authorize one exact small observer issue for native qualification, preserving supervised defaults, all frozen verification and current human/security holds.

## Capabilities

### New Capabilities

- `delivery-verification`: portable scanner cache selection and evidence boundaries for repository delivery.

### Modified Capabilities

None. Existing observation behavior is unchanged by this maintenance increment.

## Impact

Touches tooling cache selection and its regression, officially generated lifecycle/workflow projections, ownership metadata, exact per-issue grants, runbooks and delivery evidence. No ProductShape baseline or architecture behavior changes. No source credentials, App changes, production deployment, security weakening or global concurrency change.

The maintenance PR does not close #88: actual native issue→candidate→App CI→merge→post-merge acceptance remains required after it lands. The owner separately lifted the #49 development identity hold during this maintenance cycle; that work remains outside this PR and must reconcile its existing proposal and security gates.
