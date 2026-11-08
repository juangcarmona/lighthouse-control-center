# Design

<!-- pdac-scope: cited -->

## Context

See proposal.md for motivation and the factory-overview delta for behavior. The historical CLI collector parses GitHub JSON in its default getter. The supported .NET observer maps JsonElement rows in CollectAsync and serializes its snapshot through the existing HTTP boundary. The browser shares runCard across active, completed, unclassified and stale views. ADR-0006 and the authenticated runtime view remain authoritative; no architecture documents change.

## Goals / Non-Goals

**Goals:** Add two source facts with identical known/unknown semantics and no loss of run identity, source times or limitations. A greater attempt is evidence of a retry, not proof of recovery.
<!-- pdac:cite id="FR-RECOVERABLE-EXECUTION" digest="sha256:02460c262c7ad33b35456a43d2f878a3791494aae51aa1b70f2578069054f176" -->
<!-- pdac:cite id="BR-RECOVERABLE-EXECUTION" digest="sha256:91ee12d11c59c0ce7c865014a1d44f800b69733a8b915de25f57c4cb4631f014" -->
<!-- pdac:cite id="TERM-EXECUTION-RUN" digest="sha256:642146e1d05adc446743fc42425532ad889bcc8ecb6b03d2e26fec133bb59ba6" -->

**Non-Goals:** No execution/recovery control, inferred event, new source lookup, source-link rewrite, schema migration, account UI or authority change. Preserve source guards, permission-before-cache checks, coalescing, connection-generation invalidation and session deadlines. Do not introduce gh or operator authentication into the application.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:9f39dd08a392db995a75f26c9a30ed4d4ec43f73ad0ccafbdfaa3d0eabc1528a" -->

## Decisions

### Add nullable evidence to existing run objects

Map `run_attempt` to `runAttempt` (positive exact integer representable as a safe JSON/JavaScript integer, through 9007199254740991) and `event` to `event` (nonblank string, preserved as source text). Serialize both properties explicitly, using null for absent, null, malformed or unrepresentable values. Do not coerce strings/booleans to attempts or derive event from workflow name, status or labels. Keep other fields and the CLI array versus HTTP wrapper unchanged. Explicit nulls are preferable to omitted keys or mixed number/string sentinels because both clients can express unknown consistently.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

### Validate source numbers before precision is lost

In github.mjs, use the native JSON.parse reviver's primitive source context to validate numeric `run_attempt` tokens in the actual default stdout parsing path. Keep other JSON numbers untouched and retain the existing injected-object getter contract for tests/callers. Expose a small parsing helper from this same allowed file so raw transport JSON can exercise exactly the parser used by the default collector. A path without raw-token support must fail closed for source attempts rather than trust a rounded number. Object-injected test values still require positive safe integers, but cannot prove raw-source precision.

In GitHubObservations.cs, read the attempt JsonElement's GetRawText and apply the same exact lexical-value rule in a local helper. Extend only ObservedRun and its mapping; do not reuse or alter shared number/transport/authority helpers.

Evaluate sign, decimal digits and exponent exactly: account for decimal scale and trailing zeros, reject a remaining fractional part, then range-check the positive integer before conversion. Thus `1`, `1.0` and `1e0` retain 1, `2` retains 2, and `1.00000000000000001` remains unknown. Bound exponent handling by token length and the safe-integer range rather than constructing arbitrarily large powers or allocating by the exponent. Reject post-parse integer checks and decimal/double conversions as the sole validator: rounding can erase the defect. No dependency or general JSON parser replacement is needed.

### Extend the shared renderer, not identity or navigation

Append labeled Source attempt and Triggering event text in runCard; use unknown for null/missing values, including older snapshots. Use the existing textContent-based node creation and unchanged repository-bound source link. Do not add attempt to sourceKey: refreshed metadata belongs to the same run. Preserve groups, counts, disclosures, filters, timestamps and stale handling. Prefer existing styles; touch app.css/index.html only for necessary text/layout support. Long hostile event strings must wrap and remain inert.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Risks / Trade-offs

- [Numeric precision or parser mismatch] → Run identical raw JSON cases through the actual Node parser/collector and .NET transport/projection; assert serialized output, not only helper results.
- [Unbounded exponent processing] → Compare scale/range before constructing a number; cover huge exponents and safe-integer boundaries.
- [Authority regression hidden by metadata tests] → Keep all existing assertions, identity fixtures, permissions and verification entrypoints frozen; use only the exact three metadata-test exceptions.
- [Fixture evidence mistaken for real source acceptance] → Label browser fixtures separately and retain later host authenticated-source and forge evidence.

## Verification and Definition of Done

Collector work lands with known/missing/malformed metadata tests and README JSON semantics. Browser work lands with all-card coverage, hostile text, attempt changes under stable focus, filter/stale preservation, light/dark desktop/390px layout and accessibility checks. The .NET raw fractional case must pass through HttpResponseMessage JSON transport and the production observer before serialization, without changing authentication fixtures.

Planned admitted commands, not execution receipts:

```sh
npm ci --ignore-scripts
env CI=true npm run verify:container
npx --yes --package=@fission-ai/openspec@1.15.0 openspec validate issue-99-proposal --strict --no-interactive
```

The existing container suite includes documentation, Node, product/model/integration/citation, strict specs, architecture, container-scoped .NET and browser checks. Preserve all checks and report their actual receipts. The host also independently validates returned proposal citations. For delta formatting use the issue's diagnosed exception: scope immediately after ADDED Requirements, short normative paragraphs, and unchanged canonical citation payloads after the assertions of each requirement's last scenario.

Runtime observations may use the real app and existing GitHub browser fixture plus the actual unconfigured/unavailable path; no new credential or tool dependency is required. Later native independent plan/candidate reviews, full hosted CI including host-only lanes, positive authenticated App/publication evidence, actual PR/head/merge and post-merge acceptance remain mandatory. A blocked native run stays blocked. Implementation command receipts are recorded in tasks.md and the evidence output; they do not establish forge delivery or acceptance.

## Migration Plan

Additive nullable fields need no data migration. Existing snapshots without them display unknown. Deploy through the existing reviewed delivery path only; rollback removes the additions without changing source state, credentials, policy or persistence.
