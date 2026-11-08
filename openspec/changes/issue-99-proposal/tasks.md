# Tasks

<!-- pdac-scope: cited -->

## 1. Source projections and their regressions

- [x] 1.1 Extend `src/observation/github.mjs` with nullable `runAttempt`/`event` mapping and exact raw numeric validation, retaining its injected caller contract; extend `tests/observation.test.mjs` and verify the production raw parser plus collector/JSON serialization preserve attempts 1/2 and events, reject raw `1.00000000000000001`, and keep missing/null/wrong-type/nonpositive/fractional/out-of-range attempts unknown. Cover exact integral notation, absent events and unchanged source facts/read-only requests; run the focused Node suite.
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->
- [x] 1.2 Add only the corresponding `ObservedRun` fields and field-local mapping/helpers in `GitHubObservations.cs`; extend metadata fixtures/assertions only in `GitHubAuthorizationTests.cs`, feeding the raw fractional lexeme through the actual transport parser. Verify the same semantic matrix and serialized fields as Node, plus unchanged authorization, cache, stale, cancellation and read-stop assertions in the existing .NET suite.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
- [x] 1.3 Document the additive snapshot fields, null/unknown semantics, common exact-number range and unchanged historical CLI versus authenticated web boundaries in `README.md`; verify examples against both projection tests and ensure no extra credential or runtime dependency is described.

## 2. Shared cards and their regressions

- [x] 2.1 Extend `app.js` shared `runCard` to show known/unknown source attempt and triggering event using safe text and the existing run link; add browser metadata cases for running, queued/pending/requested, waiting, completed, unclassified and stale cards. Verify attempts 1/2, missing values, hostile event text and original links/identity, grouping/counts, timestamps and unavailable evidence with the focused browser suite.
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
- [x] 2.2 Verify a metadata-only refresh from attempt 1 to 2 retains source-keyed focus, filtering and stale handling; retain all keyboard, authority-loss and accessibility assertions, test desktop/390px light/dark layout, and change allowed CSS/HTML only if necessary. Complete the README card-label and retry-not-recovery explanation; verify labels against rendered cards and the documentation checks.

## 3. Integrated verification and evidence

- [x] 3.1 Refresh affected planning citations if consumer text changes, using current host/provider payloads without editing canonical product intent; verify every document has one scope declaration and all citations are current with the existing ProductShape citation check. Preserve the issue-prescribed delta layout and verify the materialized proposal with pinned strict OpenSpec validation.
- [x] 3.2 Run every admitted implementation check on the candidate and retain the actual receipts: `npm ci --ignore-scripts`, `env CI=true npm run verify:container`, and `npx --yes --package=@fission-ai/openspec@1.15.0 openspec validate issue-99-proposal --strict --no-interactive`. Verify the complete existing chain passes; report any failed/unavailable check explicitly rather than replacing it with focused tests. Compare the candidate diff with the baseline to verify exact writable scope, all safety assertions and every other frozen verification input remain intact.
- [x] 3.3 Record additional real-app runtime observations using the existing browser GitHub fixture for known/missing metadata and the actual unconfigured/unavailable path in the credential-free environment. Verify displayed values/source links and unknown handling, retain revision/provenance/screenshots or response evidence, and label these as agent/fixture observations rather than positive authenticated App or native delivery evidence. Confirm observation introduces no work request or new application dependency.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## Workflow follow-up

- The trusted host validates/materializes these returned files and obtains independent native planning acceptance before authorized implementation; this plan and the admitted command inventory are not execution receipts.
- Before closure, require independent native candidate acceptance, complete trusted hosted verify/foundation and applicable authenticated App/publication evidence on the actual candidate/head, actual PR/head/protected merge and accepted post-merge/default-branch evidence. A blocked native run stays blocked; no operator-only replacement or manual publication of a failed candidate.
- Preserve the one shared correction and 6600-second route boundary under host enforcement. Do not extend previous failed runs or complete #52, #57 or #88 through this slice.
- Archive only after the project's review and integration requirements are satisfied; verify the archived result through the provider workflow.
