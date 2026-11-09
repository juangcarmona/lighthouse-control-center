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

Delivery depends on accepted #52/#103 discovery and #50/#48 reader delivery, currently evidenced only in candidate #100 at `6079e6f7964d0e2c5a992c470489e065131e33b9`. Do not duplicate or implement those prerequisites. ADR-0006/0007/0009 remain authoritative; ADR-0010 remains proposed and ADR-0008 reconciliation stays with #48/#112. Keep `future` until the maintainer explicitly resolves the existing release conditions.

## Product Authority and Evidence

Consumes the applied model from CHG-LCC-EVOLUTION-001 accepted through #126, not a new Product Change. `docs/product/README.md` identifies model/ as accepted despite individual draft frontmatter. Impact review used the host-prepared baseline reports and direct canonical requirements. The primary dependencies are FR-CONFIGURATION-DRIFT, FR-PROJECT-DISCOVERY and BR-EXPLAINABLE-SIGNALS, cited above. Security and accessible inspection also depend on QR-EXECUTION-SECURITY and QR-MOBILE-OPERATIONS.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

Checked neighbouring concerns: project health/trends, runtime capacity/provider operations, delivery verification and scheduling do not change. Issue navigation and project discovery are reused, not replaced. Questioned graph links in BR-EXPLAINABLE-SIGNALS do not confer authority or change the directly read rule. No product-definition drift is proposed.

The verified owner packet at issue #53 comments 6751369894 and 6751906719 supplies released CLI 0.12.65 / SDLC 0.22.4 provenance and candidate interfaces. It explicitly permits unassessed exception validity and does not accept implementation. Package versions, manifest baseline 0.1.0 and SDLC contract 0.5.0 are distinct dimensions.

## Completion Boundary

This is a planned candidate for owner review, not an approved design or implementation. Definition of Done later requires all AC-1–AC-8 evidence, current citations, required CI at the exact implementation head, documentation, independent review and the lifecycle's explicit protected decisions. See design.md for support limits and tasks.md for ordered implementation and validation.

## Operator recovery provenance

Native proposal run `42704809531` produced these four candidate documents, then failed strict validation in its publisher. This operator recovery removes the archive-unsafe preamble and keeps the configured citation placement, shortens six requirement summaries and retains every original clause in explicit scenarios. The new repository-scoped route uses the current candidate’s repository terminology. Validation and independent draft review are recorded separately; the native run remains failed, `future` stays in place, and no product acceptance, prerequisite acceptance or implementation is claimed.
