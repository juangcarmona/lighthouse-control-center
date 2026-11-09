# Change: enforce frontend module boundaries

## Linked issue

Issue [#116](https://github.com/juangcarmona/lighthouse-control-center/issues/116) tracks the evolution while retaining the existing source and session safety boundaries. This is a bounded implementation-quality increment; it does not complete or accept the wider issue.

## Operator authorization and bounded interpretation

The operator directed: “Dame un listado completo del trabajo que vas a hacer y yo te lo valido, siempre con calidad, arquitectura, tests de arquitectura, rosylen, tests de arquitectura en front, feature slices, y todo eso... si?? Y la app NO SE LLAMA SOFA.” After reviewing the plan, the operator authorized unattended continuation: “Tiene que ser algo 100% desatendido, me quiero ir a dormir y quiero despertarme mañana y tener un lighthouse concotrl center que funcione de verdad de acuerdo a la deifinición del producto”. They later requested: “Y quiero evidencias, ejecutadas con playwright, casos e2e basados en los structured behaviours del modelo de producto”. This increment is authorized as frontend architecture and quality work under that direction. The scope below does not authorize product-policy changes, acceptance overrides, security bypasses, or source/production behavior changes.

## Problem

The browser is split into page, shared-shell, display-cache and source-control modules, but `npm test` does not currently reject dependency-direction regressions. A page can silently take ownership of another feature's transport or cached private state while existing behavior tests still pass.

## Outcome

Add parser-backed checks to the existing test command for local ESM resolution and the implemented browser ownership boundaries: page entries may use shared modules; shared shell/cache modules remain feature-independent; cache owns session-storage access and has no network transport; only the issue-action owner submits source-control mutations; and issue actions remain limited to their issue/inbox callers. Checks include invalid-source probes that must fail, proving the assertions reject the regressions they describe.

## Scope and limits

Use a small exact-pinned development-only JavaScript parser and Node's built-in test runner. The only implementation files authorized by this plan are `package.json`, `package-lock.json`, and a new `tests/frontend-architecture.test.mjs`, plus this issue-specific OpenSpec change. Do not edit production modules, browser behavior tests, shared policy, generated model/architecture files, or deployment. The test must check source-control POST ownership specifically; it must not ban unrelated legitimate POST routes such as account actions. Static module checks supplement the existing source-control/security/browser tests; they do not establish runtime authorization or connected-user acceptance. Rollback reverts only the additive test and parser dependency/lock entry, leaving existing production and safety tests untouched.
