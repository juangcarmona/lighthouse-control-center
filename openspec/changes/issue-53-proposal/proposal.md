---
pdac-scope: cited
---

# Proposal

## Why

Operators need to inspect configuration differences before deciding on maintenance. A read-only projection can distinguish repository declarations, lock resolutions and selected expectations without inventing an upgrade policy or treating missing access as non-adoption.
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->

## What Changes

- Add a project configuration inspection view reached from the existing configured project workspace. Retain partially adopted and inaccessible repositories in discovery.
- Show separate source facts with repository, exact path, revision, observation time, fact kind and contract identity. Preserve conflicts rather than choosing a winner.
- Compare an observed fact only with an explicitly selected compatible source fact. Name the expectation and origin; report unsupported or missing comparisons as unassessed. Latest, installed and required-by-policy remain unknown without their own evidence.
- Show declared exceptions through existing source evidence with validity unsupported/unassessed. They do not suppress a difference.
- Open revision-bound configuration evidence and explicitly linked maintenance work without writes, upgrades, new commands or dispatch.
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="FR-PROJECT-DISCOVERY" digest="sha256:fb93a1c32232be6a679aa7aa074e9b6c0efd871cd48592b6b8d56996c36a2382" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Capabilities

### New Capabilities

- `repository-configuration`: provenance-bearing configuration facts, compatible comparisons, explicit limitations and safe evidence navigation for configured repositories.

### Modified Capabilities

None. `factory-overview` covers workflow observations, not configuration comparison. `github-user-connection` retains its authority and connection contract unchanged.

## Impact

Extend the existing ASP.NET Core workspace module and connected-user GitHub transport; add a read-only project query and browser presentation under the existing web assets. Add projection, permission, budget and browser tests in the current test suites. No database migration, new adapter service, runtime/provider administration, registry integration, repository registration change or mutation API.

PR #100 merged into `main` as `877bb1fd6219becdbd07e342d0bbc6eeedec517b` on 2026-11-10, integrating the discovery and reader components. Issue #52 was accepted and closed on 2026-11-13. Issues #48 and #50 remain open and separate; their broader acceptance is not a gate on the bounded #53 implementation the owner authorized through existing PR #197. That authorization covers read-only repository configuration comparison with source provenance, explicit comparison scope, honest unknowns and safe evidence links. It excludes upgrades, registry lookups, workflow dispatch, scheduling and provider operations. Verify that implementation against the exact interfaces on current `main`; do not duplicate those components or expand the authorized scope. ADR-0008 remains Proposed on `main`; reconcile its source-bound #48 decision receipts only if a change depends on that issue-command contract. ADR-0006/0007/0009 remain authoritative and ADR-0010 remains proposed. Implementation, merge, release and deployment decisions remain separate.

## Product Authority and Evidence

Consumes the applied model from CHG-LCC-EVOLUTION-001 accepted through #126, not a new Product Change. `docs/product/README.md` identifies model/ as accepted despite individual draft frontmatter. Impact review used the host-prepared baseline reports and direct canonical requirements. The primary dependencies are FR-CONFIGURATION-DRIFT, FR-PROJECT-DISCOVERY and BR-EXPLAINABLE-SIGNALS, cited above. Security and accessible inspection also depend on QR-EXECUTION-SECURITY and QR-MOBILE-OPERATIONS.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

Checked neighbouring concerns: project health/trends, runtime capacity/provider operations, delivery verification and scheduling do not change. Issue navigation and project discovery are reused, not replaced. Questioned graph links in BR-EXPLAINABLE-SIGNALS do not confer authority or change the directly read rule. No product-definition drift is proposed.

The verified owner packet at issue #53 comments 6751369894 and 6751906719 supplies released CLI 0.12.65 / SDLC 0.22.4 provenance and candidate interfaces. It explicitly permits unassessed exception validity and does not accept implementation. Package versions, manifest baseline 0.1.0 and SDLC contract 0.5.0 are distinct dimensions.

## Proposal verification matrix

The groups below organize the evidence planned by this proposal. They are proposal-local verification groups, not numbered acceptance criteria from the original issue and not new ProductShape requirements. Each group maps to the named requirements/scenarios in the proposed `repository-configuration` capability, existing ProductShape sources cited above, and concrete implementation tasks.

| Group | Evidence boundary | Named `repository-configuration` requirements and scenarios | Tasks |
| --- | --- | --- | --- |
| VG-1 — Provenance | Every supported fact retains repository, path, immutable revision, observation time, fact kind and contract identity. | Configuration facts retain provenance: Separate source dimensions; Complete configuration facts retain provenance contract. | 2.2, 2.4, 3.1, 3.4 |
| VG-2 — Compatible expectations | A comparison names its selected compatible expectation and origin; unsupported comparisons stay unassessed. | Comparisons name compatible expectations: Matching baseline; Outdated comparable declaration; Unsupported baseline comparison. | 4.1, 4.6 |
| VG-3 — Version dimensions | Declared, lock-resolved, installed, latest and policy-required values stay separate; unsupported values remain unknown. | Version evidence categories remain distinct: Declarations do not establish runtime or policy; Independently evidenced registry value. | 2.2, 4.2, 4.6 |
| VG-4 — Scope, freshness, conflicts and budgets | Coverage and freshness stay independent; conflicts remain inspectable; applicability requires complete evidence; collection obeys explicit bounds. | Coverage freshness and applicability are explained: Conflicting declarations; Stale partial observation; Inaccessible configuration; No applicable package within an evidenced scope; Read limit reached. | 2.3, 2.4, 3.2, 3.3, 4.5, 4.6 |
| VG-5 — Exception validity unassessed | A declared exception is inspectable but cannot suppress a difference or acquire invented validity semantics. | Declared exceptions do not imply validity: Intentional exception without validation contract. | 4.3, 4.6 |
| VG-6 — Authorized read-only navigation | Reads use the configured connected-user scope, immutable source paths and safe authorized links; inspection causes no writes or dispatch. | Safe read-only evidence navigation: Exact evidence and linked work; No or unsafe maintenance link. | 3.1, 3.4, 4.4 |
| VG-7 — Released schemas and unsupported facts | Only pinned released definitions support validation; incompatible/unknown contracts keep raw facts separate from validated interpretations. | Unsupported contracts retain honest source facts: Released SDLC contract conflicts with its schema; Unknown schema version. | 2.1, 2.2, 2.4 |
| VG-8 — Authority, accessibility and fixtures | Authority loss clears scoped projections and rejects late results; keyboard/narrow-screen behavior is accessible; evidence covers matching, exception-unassessed, outdated, stale, conflicting, no applicable package, inaccessible and unsupported fixtures. | Authority changes invalidate inspection: Lost or changed source authority; Unconfigured repository. Accessible explainable inspection: Keyboard and narrow-screen evidence review. | 3.3, 4.5, 5.1, 5.2, 5.3 |

## Completion Boundary

The owner authorized implementing this bounded scope through existing PR #197. That authorization does not approve merging, release, deployment or scope expansion. Definition of Done still requires evidence for proposal verification groups VG-1–VG-8, current citations, required CI at the exact implementation head, documentation, independent review and the lifecycle's explicit protected decisions. See design.md for support limits and tasks.md for ordered implementation and validation.

## Operator recovery provenance

Native proposal run `42704809531` produced these four candidate documents, then failed strict validation in its publisher. This operator recovery removes the archive-unsafe preamble and keeps the configured citation placement, shortens six requirement summaries and retains every original clause in explicit scenarios. The new repository-scoped route uses the current candidate’s repository terminology. Validation and independent draft review are recorded separately; the native run remains failed. At that recovery point the `future` hold was still present. The owner later accepted #52 and authorized the bounded implementation in existing PR #197; that decision supersedes the earlier hold without accepting broader work or authorizing integration, release or deployment.
