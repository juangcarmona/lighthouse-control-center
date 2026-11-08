# Design

<!-- pdac-scope: cited -->

## Context

See `proposal.md` for motivation and product impact, and `specs/factory-overview/spec.md` for the observable contract. The historical CLI parses raw `gh api` output in `github.mjs`; the supported protected route independently maps `JsonElement` rows into `ObservedRun` in `GitHubObservations.cs`. `app.js` has one `runCard` renderer for active, completed, unclassified and stale runs. ADR-0006 and the building-block view retain these separate observation adapters; no new architecture is needed.

## Goals / Non-Goals

**Goals:** Project source attempt/event consistently, expose unknown values, and retain source run identity without treating a retry as verified recovery.
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->

**Non-Goals:** No auth/session/token transport, account UI, permission, workflow, package, policy, deployment or runtime-administration changes. No execution/recovery control or new source request. No accepted-model or architecture edits. All existing safety assertions and verification inputs stay frozen except additive metadata cases within the three exact #99 test exceptions.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## Decisions

### Additive observation contract

Add `runAttempt` (nullable exact positive safe integer) and `event` (nullable source string) to mapped run records. Use JSON null for unknown in both snapshots and explicit `Source attempt: unknown` / `Triggering event: unknown` in cards. Known events remain source text, not a local enum or translated outcome; non-string/empty event input is unknown. Follow existing bounded-text handling consistently. Preserve every existing field, repository association and link. Do not key cards or caches by attempt: a refreshed attempt remains evidence on the same repository/run identity. An independent retry object or synthetic attempt 1 would misrepresent the source.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->

### Validate exact numeric evidence before conversion

Keep parsing helpers local to the two allowed collector files; add no dependency or shared transport change. In Node, the production raw-response parser must inspect the numeric token before ordinary floating-point validation loses precision, for example with `JSON.parse` reviver source context supported by the admitted Node runtime. Normalize the decimal coefficient/exponent exactly, rejecting non-integral/nonpositive values before conversion. Bound work for extreme exponents. Do not use a global regex rewrite of JSON or coerce strings. Preserve the existing injected `get(path)` object-returning caller contract and unchanged parsing of other source fields.

In .NET, inspect the attempt `JsonElement` numeric kind and `GetRawText()` locally during mapping. Validate exact coefficient/exponent integrality before conversion; do not validate through `double`, or a decimal conversion that can itself round. Both paths accept exactly integral numeric forms such as `1`, `1.0` and `2e0`, reject `1.00000000000000001`, and project only exactly representable values up to 9,007,199,254,740,991. Values outside this shared JSON-number representation remain unknown rather than approximated. If raw-token context is unavailable, fail the field closed instead of trusting a rounded value.

An integer predicate on an already parsed float was rejected because the diagnosed raw fraction rounds to 1. A new JSON package or changes to `GitHubTransport`/`SourceJson` would exceed the small additive mapping boundary.

### Preserve authenticated authority and rendering paths

Extend `ObservedRun`, its mapping and field-local helpers only; leave permission-before-cache, session/generation guards, collection budgets, coalescing, cancellation, read-stop, stale retention and authority-loss clearing intact. No browser request or route change is required. Extend `runCard` with the existing `textContent`-based node helper and original safe link. Use existing text styles; adjust allowed CSS/HTML only if focused layout checks demonstrate a need. No new interactive control or focus identity is needed.

### Test at the evidence boundary

In `tests/observation.test.mjs`, exercise the production raw parser together with collection and serialized output, not merely an object whose fraction already rounded. In `GitHubAuthorizationTests.cs`, add a raw workflow-response override limited to the metadata fixture, so the exact JSON lexeme reaches actual transport parsing and observation mapping; do not change identity fixtures, permission logic or existing assertions. Cover attempts 1/2, missing/null, wrong types, nonpositive/fractional values, exact integral notation, shared range limits, known/missing events and preserved fields.

In `tests/browser/observation.spec.mjs`, add known/unknown metadata cases for every shared card caller, hostile event text, retained stale metadata and a refresh from attempt 1 to 2 with unchanged link/focus. Retain filtering, counts, keyboard, authority-loss and accessibility assertions. Update `README.md` alongside the projection/presentation slices to explain nullable fields, unknown labels and retry-not-recovery semantics.

## Risks / Trade-offs

- Precision loss before validation → raw-number regressions through both production parsing paths, including `1.00000000000000001`; no nearest-integer repair.
- Cross-adapter drift → identical semantic input matrix and serialized-field checks; adapters remain separate to preserve their authentication boundaries.
- Added text overflows narrow cards → safe-text, 390px, light/dark and accessibility cases using the existing layout.
- Fixtures mistaken for live source evidence → label observations fixture-backed and separate them from authenticated hosted evidence.
- Frozen-test scope creep → inspect the diff against the baseline and the exact three metadata exceptions; no assertion removal or unrelated helper refactor.

## Migration Plan

No database migration or source configuration change. Deliver additive fields and renderer together through the existing protected publication path; old snapshots without the fields display unknown. Rollback is an ordinary reviewed revert of this issue's additive implementation, not a reset of unrelated work. No credentials, `gh`, Docker socket or model is added to the web application. The historical CLI retains its existing explicit operator-authentication contract.

## Verification and Definition of Done

The three admitted commands are future trusted implementation checks: `npm ci --ignore-scripts`; `env CI=true npm run verify:container`; and `npx --yes --package=@fission-ai/openspec@1.15.0 openspec validate issue-99-proposal --strict --no-interactive`. The container wrapper invokes the complete existing `verify` chain, including Node, docs, security, product/integrity/doctor, strict specs, citations, architecture, .NET and browser checks; do not weaken it. Host materialization independently validates the proposal and ProductShape citations. Keep short normative paragraphs and the single scope marker immediately after ADDED Requirements; following the issue's proven layout correction, citation comments sit after the last scenario assertions of their own requirement, not in the pre-scenario length budget.

Additional agent observations must use the real app with the existing browser GitHub fixture for known/missing values and the actual unconfigured/unavailable path without new credentials. Save their revision, provenance and outcomes separately. They supplement trusted checks, not authenticated App CI. Completion also requires unchanged safety assertions, current citations, updated README and no unresolved acceptance defects. Independent native reviews, full hosted CI, applicable authenticated App/publication evidence, actual PR/head/protected merge and accepted post-merge evidence are later trusted-host gates before closure. Prior failed native attempts and local format probes do not qualify this delivery. No commands or probes were run during this proposal.
