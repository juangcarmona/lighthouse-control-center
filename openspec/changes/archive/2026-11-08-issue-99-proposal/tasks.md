# Tasks

<!-- pdac-scope: cited -->

## 1. Source metadata and projection parity

- [x] 1.1 Extend github.mjs with raw-token exact attempt validation and additive runAttempt/event projection; add tests/observation.test.mjs cases for 1/2, integral decimal/exponent forms, missing/null/string/boolean/nonpositive/fractional/out-of-range inputs and known/missing event. Verify the actual default-path JSON parser feeds collector serialization and raw `1.00000000000000001` yields null while existing source/read-only/unavailable/timing assertions remain intact.
- [x] 1.2 Add nullable observation fields and local exact JsonElement number validation in GitHubObservations.cs; extend only observation metadata fixtures/assertions in GitHubAuthorizationTests.cs. Verify the same raw JSON matrix through the real transport, observer and JSON serialization, with explicit nulls and all existing authority, coalescing, stale, cancellation and read-stop assertions unchanged.
- [x] 1.3 Update README.md with runAttempt/event field semantics, explicit unknowns and the retry-versus-recovery limitation. Verify documented examples match Node and .NET serialized cases and keep historical CLI authentication separate from the supported web adapter.

These tasks consume source evidence without inferring recovery or replacing source identity.
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->

## 2. Shared run cards

- [x] 2.1 Add labeled attempt/event text and explicit unknowns in app.js's shared run card, retaining sourceKey and source link; change app.css/index.html only if needed for wrapping or explanatory text. Add browser metadata tests in observation.spec.mjs and update README.md's overview description in this slice. Verify known/missing values in running, queued/pending/requested, waiting, completed, unclassified and stale cards; attempt 2 must differ visibly from 1.
- [x] 2.2 Extend browser cases for hostile/long event text and attempt changes across refresh. Verify inert text, unchanged repository-bound links, source times, counts, filters, stale warnings, keyboard focus and accessibility in light/dark desktop and 390px layouts, preserving every existing assertion.

Presentation remains source-backed and keyboard-accessible; it gains no authority.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## 3. Candidate integration evidence

- [x] 3.1 Run the admitted `npm ci --ignore-scripts`, `env CI=true npm run verify:container` and `npx --yes --package=@fission-ai/openspec@1.15.0 openspec validate issue-99-proposal --strict --no-interactive` on the candidate. Verify retained receipts and the existing product citation check are successful; compare the diff with the exact allowlist and three metadata-test exceptions, preserving all other frozen inputs.
- [x] 3.2 Exercise the real app against the existing browser GitHub fixture for known/missing values and the actual unconfigured/unavailable path. Verify labeled screenshots/observations show correct metadata and unknown evidence; record explicitly that fixture evidence is not authenticated GitHub acceptance.
- [x] 3.3 Reconcile the delivered behavior with the delta and refresh affected citations only from current provider-generated payloads if needed. Verify exactly one scope declaration per document, all citations current and zero strict OpenSpec issues; preserve the diagnosed citation placement and record any design deviation without expanding #99.

These checks must preserve authentication, session, source authority and independent repository execution; no new credentials, gh, Docker socket or model enter the app.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:9f39dd08a392db995a75f26c9a30ed4d4ec43f73ad0ccafbdfaa3d0eabc1528a" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## Candidate evidence

Managed command receipts and logs live under `/output/evidence/`. `npm-ci-2`, `verify-container-3`, `openspec-strict-1` and `runtime-unavailable-1` completed with exit 0. The full suite passed 42 Node tests, 112 web/.NET tests, 36 runtime tests and 18 browser tests; all 88 product citations were current and all nine documents classified. Existing styles already wrap hostile event text; no CSS or HTML change was needed. No implementation design deviation or citation refresh was needed.

Earlier attempts are retained: the first dependency installation was cancelled by the shell timeout, the first container check exhausted the temporary filesystem during restore, and the second caught a serializer-options analyzer error in the new tests. Download-cache cleanup and reuse of the framework's cached web serializer options resolved those failures before the successful complete run.

Browser screenshots named `fixture-*` are intercepted GitHub fixture evidence, not authenticated GitHub acceptance or human visual approval. `runtime/actual-unavailable-mobile.png` and its JSON observation exercise the existing server and real collector without interception or credentials. The default CLI parser test uses a temporary fake `gh` executable solely as a transport fixture; no application credential or dependency was introduced.

## Workflow follow-up

- The supplied plan is implemented; the checked tasks above refer only to recorded candidate evidence. The trusted host independently validates the candidate and its artifacts; this worker does not attest independent review.
- Require fresh host preflights, independent native candidate acceptance, full hosted forge CI including authenticated App/publication and host-only lanes, actual PR/head/base/merge receipts and post-merge acceptance before closure. Keep one shared correction and the original 6600-second route; operator-only success cannot replace a blocked native run.
- Archive only after the configured reviews, checks and citation validation pass. Do not claim #52/#57 completion or parent #88 qualification from this plan.
