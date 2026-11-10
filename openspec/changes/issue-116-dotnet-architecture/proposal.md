# #116 .NET architecture checks

Tracking: [Lighthouse Control Center #116](https://github.com/juangcarmona/lighthouse-control-center/issues/116).

<!-- pdac-scope: none reason="This increment verifies existing backend boundaries and changes no product behavior." -->

## Why

The .NET profile documents module exports, implementation references and Roslyn rules, but the product repository has no compiled architecture test or positive analyzer fixture suite. The profile verifier checks module settings and rejects one combined invalid fixture; its activation check does not currently verify that `LighthouseModule` is compiler-visible.

## Authorization and limits

On 2026-11-09 the user requested “siempre con calidad, arquitectura, tests de arquitectura, rosylen, tests de arquitectura en front, feature slices” and then confirmed “100% desatendido”. This is the operator-directed #116 verification-hardening increment under that session grant. It is not a native unattended candidate and does not reset #99 or #50.

This increment may add or extend named tests, analyzer-activation verification in `scripts/check-dotnet-profile.mjs`, necessary test-project references/locks only if the chosen tests prove they are needed, `tests/README.md`, and these issue-linked OpenSpec artifacts. No product policy, lifecycle policy, schema, authentication, runtime, source-control or production behavior changes are authorized here. Frontend architecture coverage is outside this backend-only increment.

## What changes

- Test the actual compiled Workspace module for exported CQRS handlers and sibling implementation references.
- Require every solution implementation module to expose the analyzer activation property as well as the analyzer-only reference.
- Compile one valid semantic handler fixture and independent LH1001 and LH1002 violations; each invalid fixture must fail with its own diagnostic.
- Correct .NET profile/test documentation to describe only checks that run.

No analyzer rules, package dependencies, module layout, runtime behavior, source controls or accepted product behavior change.

## Product definition

No product-semantic impact: the increment tests the implementation profile and does not change an operator journey or product contract.

## Rollback

Revert only the additive architecture tests, activation-verifier assertions, test dependencies if any, test documentation and this OpenSpec change. Keep existing verifier execution and all application/module code unchanged.
