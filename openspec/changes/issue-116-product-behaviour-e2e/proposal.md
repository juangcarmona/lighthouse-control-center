<!-- pdac-scope: cited -->
# Executed product-behaviour evidence for #116

The maintainer explicitly requested executed Playwright E2E based on structured behaviours on 2026-11-09. The current model contains requirement verification examples but no structured-behaviour artifacts. CHG-LCC-STRUCTURED-BEHAVIOURS-001 formalizes nine existing examples as a draft ProductShape overlay; accepted model files remain unchanged. Tests may execute those examples while reports retain the draft/accepted distinction. No new product semantics are introduced by this implementation plan.

<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->
<!-- pdac:cite id="FR-ISSUE-CONVERSATION" digest="sha256:936e13fb5556657bf62b15f7b5fb8c943b1aaa00736100b5ba4bc6c51689e463" -->
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:4ebd9c84897af61f0fb570eaf7a91e17a230b13192f37d470f810cd1984e94f9" -->
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

## Changes

Add a checked-in behaviour binding ledger with exact source hashes and existing fixture-backed Playwright case names. Annotate executed cases and emit a ProductShape-compatible verification report against baseline requirement digests, separately recording proposed example clauses and per-case limitations. Add a separate opt-in live Playwright configuration for the already configured development environment, using fresh sessions and real GitHub reads. Run canonical repository discovery, exact lookup, issue context, narrow layout and anonymous denial; probe actual comment eligibility and report a blocked positive journey honestly. No token/CLI substitution or implicit source write.

## Authorization and scope

The current operator grant explicitly permits these verification changes: tests/product-behaviours/**, tests/e2e/**, a separate playwright.e2e.config.mjs, browser annotations/config reporters where needed, one focused mapping test, package scripts and an exact YAML parser dev dependency only if existing package tooling cannot supply parsing. Existing regular verify commands and safety assertions remain intact; real-provider tests stay outside PR/push CI. The candidate cannot edit its own authority or change production/private credentials. The root records the grant in docs/delivery/plans/116-unattended-continuation.md.

## Product impact and neighbours

Inspected source requirements plus their `prodshape impact` neighbours: UC-OPERATE-ISSUE, UC-EXPLORE-FACTORY, UC-RESOLVE-INTERVENTION and their source/explicit-command/authorization rules. UI rendering and negative controls are consumer verification, not model acceptance. Runtime providers, health metrics, lifecycle execution, production custody and access-continuity proposal acceptance remain outside this slice.

## Verification and rollback

Use negative ledger examples for stale/missing sources and unmapped tests; run all browser cases with annotations and exact result mapping. Execute live reads using trusted HTTPS and a fresh Keycloak session, retaining safe post-auth screenshots and bounded receipts only; the separate live config MUST set `trace: 'off'`, `screenshot: 'off'` and `video: 'off'`, with no cookies, login traces, HAR, raw URLs with auth codes, or token payloads. Explicit screenshots may be captured only after successful authentication, never automatically on login failure. A missing source grant is an unresolved acceptance gate, not a skipped successful journey. Run product overlay validation, citations, full repository verification and exact-head CI. Revert additive harness/ledger/annotations and draft Product Change if needed; preserve existing application data and command receipts.
