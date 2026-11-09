---
pdac-scope: cited
---

# Tasks

All tasks are future work and remain unchecked. Groups are dependency ordered. Do not start implementation while `future` or a required protected decision remains unresolved.

The grants and authority intersections below implement the existing operator and security baseline, not product approval.

<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

## 1. Protected pickup and dependency reconciliation

- [ ] 1.1 Record Juan García Carmona's review of exact admission, non-inheriting read/operate/admin semantics, target mappings, personal compatibility and restart-applied revocation; verify an explicit review receipt exists before implementation (AC1).
- [ ] 1.2 Reconcile integrated #48/#117 source heads, source acceptance, action classifications, qualified provider IDs and ADR statuses through the authorized host/owner; deliver a dependency/API inventory retaining existing budgets and identify unavailable surfaces without duplicating work (AC4, AC5).
- [ ] 1.3 Obtain separate implementation authorization and resolution of `future` through the existing lifecycle; verify protected decisions are recorded, not inferred from this proposal or any label (AC1).

## 2. Configuration and admission slice

- [ ] 2.1 Add credential-free legacy and A/B/C configuration fixtures; verify the existing exact owner retains the configured repositories and previously supported actions, while C and matching-email identities are denied (AC2).
- [ ] 2.2 Compile optional `SoFa:Access` configuration into immutable exact identities, project mappings and qualified provider/resource references; verify duplicate/invalid/ambiguous/wildcard/unknown grants and explicit-empty mode fail closed without legacy fallback (AC1, AC2).
- [ ] 2.3 Implement independent read/operate/admin grants with named actions and required matching read grants; verify truth-table unit tests show no inheritance, cross-target expansion or implicit source authority (AC1, AC4).
- [ ] 2.4 Bind sessions to admitted identity and active policy while retaining existing assurance, bounds, capacity, reference rotation and CSRF; verify admission/session/boundary suites for both A and B, including forged callbacks and cross-session callback denial (AC2, AC6).
- [ ] 2.5 Document explicit versus legacy mode, selected issuer, synthetic grant examples and restart-required application of changes; verify examples against configuration tests and rehearse old-cookie rejection after scope/identity removal and restart (AC1, AC2, AC5).

## 3. Scoped reads and observation isolation slice

- [ ] 3.1 Scope account/session summaries, repository enumeration and observations before I/O and aggregation; verify direct API A/B/C tests exclude other users' names, links, unavailable placeholders, records and counts, including guessed IDs and unknown-equivalent denial (AC3).
- [ ] 3.2 Add exact provider/resource read checks against the accepted integrated #117 projections; verify P/X versus Q/Y and same-named cross-provider resources with contract doubles, documenting any unavailable real projection rather than fabricating an adapter (AC3).
- [ ] 3.3 Extend permission-before-cache and coalescing bindings with identity/session/policy/connection/target scope; verify cache-hit and zero-cross-sharing tests, including separate application identities linking the same GitHub user ID and separate sessions of one identity (AC5).
- [ ] 3.4 Guard read completion and cached publication against logout, idle/absolute expiry, recognized revocation, source permission loss and account replacement; verify paused-read races and late callbacks cannot restore data or old authority (AC5, AC6).
- [ ] 3.5 Update read/API documentation for permitted-only lists/counts, qualified identifiers, error behavior, stale evidence and bounded coalescing; verify documented examples match direct API response assertions (AC3, AC5).

## 4. Existing action, intention and receipt slice

- [ ] 4.1 Add scope and named-action checks before supported command previews, confirmations and submission using integrated GitHub authorization/Lighthouse SDK controls; verify read-only denial and local-admin-without-upstream-authority denial produce zero mutation calls (AC4).
- [ ] 4.2 Bind integrated #48 intentions and receipt lookup to originating identity/session/policy/connection generation and target scope; verify cross-user, cross-session, replaced-account, removed-scope and replayed-ID requests disclose nothing and cannot confirm/send (AC3, AC5).
- [ ] 4.3 Preserve journal duplicate/uncertainty history and original correction budgets during invalidation; verify scope/session changes cannot trigger automatic resend, erase deduplication or reset an exhausted budget (AC5).
- [ ] 4.4 Keep non-owner Lighthouse v1 writes and unavailable provider effects unsupported; verify explicit outcome distinctions for in-scope callers and zero bot/CLI/shell/helper fallback or provider mutation, using doubles only for unavailable contracts (AC4, AC6).
- [ ] 4.5 Document application admission versus source/provider authority, receipt visibility after invalidation and supported-action limitations; verify all documented actions exist in the reconciled owning contract and no team-write or enterprise-readiness claim is introduced (AC4, AC6).

Provider effect qualification remains outside this change; local grants cannot bypass the provider rule.

<!-- pdac:cite id="BR-PROVIDER-OPERATIONS" digest="sha256:d341e8822a5a44a5cc2b67b5a79f37a1a106ba3e0b77a2566e1ad567dce3bf87" -->

## 5. Scoped presentation and accessible evidence slice

- [ ] 5.1 Present own application identity, separate source actor and permitted filters/counts/capabilities in existing views; verify browser tests cover read-only, denied, unavailable and unsupported explanations without color-only or disabled-only messaging (AC3, AC4, AC6).
- [ ] 5.2 Discard older-generation UI responses and clear protected records/counts on authority loss; verify replacement, expiry and revoked-session browser races cannot redraw old data and focus returns to a persistent safe control (AC5).
- [ ] 5.3 Capture sanitized post-callback account/operations evidence at desktop and 390px in light/dark themes, with keyboard/accessibility results; verify screenshots exclude credentials and excluded targets, and record real-device acceptance or its remaining limitation separately (AC6).
- [ ] 5.4 Update operator/runbook documentation and relevant architecture views through their owning workflows; verify restart/removal, rollback, provider/source limitations and #58's separate production boundary match delivered behavior and links (AC1, AC6).
- [ ] 5.5 Refresh affected ProductShape citations through the prepared/current provider payloads without editing accepted intent; verify `npm run product:citations` and strict specification validation pass on the candidate (AC6).

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->

## 6. Integration acceptance

- [ ] 6.1 Run the full direct API matrix and controlled race suites independently of UI assertions, including provider outage, permission loss, CSRF, no-store, host checks and token custody; verify zero unauthorized reads/mutations and no cancellation of independent repository execution (AC2–AC6).
- [ ] 6.2 Run `npm run verify` and required exact-head CI; link actual results and resolve or explicitly block on failures rather than treating missing checks as passes (AC6).
- [ ] 6.3 Arrange authorized real identity/source acceptance and provider read acceptance where supported; retain actual A/B/C evidence and distinguish doubles from real authority. Run separate `npm run verify:identity:host` outside PR/push CI where required and record remaining physical-device limitations (AC3, AC6).
- [ ] 6.4 Obtain independent security review of scope enforcement, provenance, invalidation/races, disclosure and credential boundaries; verify findings are resolved and Juan García Carmona records every protected acceptance/DoD judgement before integration (AC1, AC5, AC6).

## Workflow follow-up

- Owner acceptance, integration and eventual archive follow the existing Lighthouse/OpenSpec lifecycle; this unchecked plan authorizes none of them.
- Preserve original dependency receipts and correction budgets. Provider effects, upstream actor extensions and production deployment remain separate work; #58 is not closed by this change.
