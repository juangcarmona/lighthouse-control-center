# Proposal

<!-- pdac-scope: cited -->

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Why

Operators need repository-produced coverage with inspectable scope and source identity, not a quality score inferred from green CI. This reconciles the existing #156 candidate in PR #201 with the owner's exact repository, commit, run and attempt rule.

## What Changes

- Retain the existing optional named-scope coverage producer and read-only Health consumer; missing or mismatched evidence must remain unknown and coverage must not gate CI.
- Complete independently checkable producer/attempt attribution before accepting a measurement; artifact names and payload claims alone are insufficient.
- Keep unsupported facets unavailable and the unresolved #54 detail/history agreement explicit. The existing project display is a candidate, not acceptance of that interface.
- Restore planning artifacts and record fresh bounded checks against the host-supplied PR head, without creating a PR, merging or publishing.

## Capabilities

### New Capabilities

- `coverage-evidence`: Informational coverage bound to exact source identity. Retain the existing delta at this path.

### Modified Capabilities

None. The inspected `factory-overview` specification owns collected workflow observations, not numeric producer evidence or a reusable measurement-history interface.

## Impact

Existing implementation: `scripts/produce-coverage-report.mjs`, the optional coverage job in `.github/workflows/verify.yml`, `GetCoverageEvidenceHandler`, the Health endpoint and `src/web/public/health.js`. Existing tests cover counts, workflow optionality and report identity validation. This correction restores planning and assesses the candidate; it does not change production code, verification policy, product definitions or architecture authorities.

The owner has authorized the first implementation slice and settled unknown/no-gate semantics. That authorization is not a receipt for producer trust, the #54 interface, hosted CI or installed-runtime acceptance.
