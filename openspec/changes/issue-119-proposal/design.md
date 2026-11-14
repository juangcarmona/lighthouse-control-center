---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation and product impact. `WorkspaceOptions.Load` currently requires one selected identity profile's `OwnerSubject` and one to ten configured repository names. `OwnerAdmission.Validate` checks exact issuer/subject, assurance and authentication time. `OwnerSessions` has bounded in-memory sessions, a 32-session capacity and expiry/revalidation mechanics. Preserve those limits rather than claiming fleet-scale capacity.

`RepositoryAccess.CheckAsync` intersects actual user permissions with App installation grants. `GetObservationsHandler` currently enumerates every configured repository, checks permissions before its 15-second session/connection cache, and guards late reads with connection generation. `GitHubAuthorization` verifies numeric user identity and cancels/invalidates the old connection on replacement. Extend these mechanisms rather than adding a parallel authorizer.

ADR-0006 is Accepted. `main` at `d24953debaab37dfedf7745add1b47dae538a6d7` records ADR-0008 and ADR-0010 as Proposed and has no command journal or provider adapter. The current PR #100 feature candidate at `eb9d51a7bb7bd883b97b139d57c9553d8f51d8e4` already contains the #48 command journal/controls and records ADR-0008 as Accepted; it has no #117 provider adapter, and ADR-0010 remains Proposed. PR #100 is not integrated into `main`, and #48 source acceptance remains open. Verify the #48 decision receipt through the existing owner/source records; this proposal changes neither ADR. The supplied refinement is ready evidence, not acceptance of either ADR. Current active OpenSpec changes #121/#123 contain metadata only.

## Goals / Non-Goals

**Goals:** a small immutable configured policy; exact identity admission; one reusable server scope check; isolation across all supported projections and available entrypoints; personal compatibility.

**Non-Goals:** hot-reloaded policy, a grant editor, group synchronization, tenancy, a new identity service, receipt persistence selection, new provider effects or upstream actor-contract work. A local grant cannot approve a Lighthouse stage or change repository delivery ownership.

<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->

## Decisions

These are proposed implementation decisions for owner review, not accepted architecture.

Implementation pickup for PR #196: the supplied verified owner answers approve this scope and release the implementation hold. Comment 6865582011 explicitly confirms restart invalidation in multiuser mode and legacy-only access continuity. Preserve the specification unchanged. The current checkout contains the existing source command journal but no qualified provider projection contract. The first correction slice adds exact project read ceilings and process-local explicit-mode sessions/connections; source commands in explicit mode and host-wide runtime inventory remain unavailable. Provider grants, complete direct API/race/browser acceptance and independent security review remain outstanding; this slice is not completion of issue #119.

### 1. Opt-in exact identities and restart-applied configuration

Add an optional `SoFa:Access` section. Its presence selects explicit mode; it contains `Operators`, `Projects` and provider/resource references. Each operator has `Issuer`, `Subject` and `Grants`. Only the selected trusted profile issuer is valid; this does not introduce multiple simultaneous identity providers. Compare issuer/subject exactly using the validated provider identity, never email or group display claims. The external provider retains authentication and group authority; this increment does not map groups to grants.

Each project reference maps a configuration-local stable ID to an existing configured repository. Retain the existing repository allowlist and its bounds. Resolve source numeric IDs through existing authorized discovery where available; a rename never silently retargets a grant. Provider references use the owning #117 contract's qualified provider/resource IDs, not an invented adapter schema. Missing providers are unavailable, not an invitation to create one. Malformed/ambiguous configured references fail startup. Provider doubles may supply identifiers in tests only.

The section absent means legacy personal mode: synthesize the owner identity and existing repository read/supported source-action ceilings, never a provider-admin grant. In explicit mode all admitted identities, including the personal owner if desired, must be listed; do not silently merge legacy defaults. An empty or invalid section fails protected startup. Validate duplicate pairs, duplicate/ambiguous mappings, unknown verbs/actions/references and wildcard attempts. Identity entries without grants can access only their own account/session shell, not fleet data.

Compile an immutable policy at startup and bind sessions to its instance/version. Configuration edits are staged, not effective until restart. Restart clears all in-memory sessions/source connections, so grant removal cannot leave old cookies valid; invalid new configuration starts no protected workspace. Existing provider revocation remains recognized immediately when detected, with the existing five-minute online revalidation bound for undetected revocation.

Alternative: hot reload with per-identity epochs could avoid signing everyone out, but adds concurrent policy publication and rollback complexity. Restart application is the smallest explicit revocation model and preserves current process-memory custody. Alternative: provider groups as automatic grants creates a second synchronization/revocation dependency and is deferred.

<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

### 2. Independent permissions, no role hierarchy

A grant is `(target, permission, allowedActions)`. A project target is a configured project ID. A runtime target is an exact provider/resource tuple, with any contract-required parent scope retained. There are no glob/prefix/global grants. Matching repeated valid grants forms a union for that exact target only; conflicting or ambiguous mappings are invalid.

| Permission | Local ceiling | Does not imply |
| --- | --- | --- |
| read | Inspect this target and its permitted projections | operate, admin, other targets |
| operate | Request named existing ordinary actions on this target, with a separate read grant | admin, upstream write permission |
| admin | Request named existing administrative actions on this exact target, with a separate read grant | operate, repository ownership, runtime authority, human approval |

The owning source/provider capability classifies actions; do not invent administrative operations for this issue. Unknown action names fail validation. There is no in-application access-policy management action. A supported action requires admission AND live session AND read grant AND matching named operate/admin grant AND current source/provider permission AND capability/eligibility. Source actions reuse GitHub user/App/repository checks and Lighthouse admission; provider actions require their separately qualified provider enforcement. Additional local privileges cannot remove v1 owner-only restrictions.

Alternative: hierarchical roles are terser but make admin easy to mistake for ownership and grant unnecessary actions. Explicit verbs are more verbose but reviewable. Email matching or copying the personal connection is rejected because neither preserves actor authority.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="BR-PROVIDER-OPERATIONS" digest="sha256:d341e8822a5a44a5cc2b67b5a79f37a1a106ba3e0b77a2566e1ad567dce3bf87" -->

### 3. Filter at server boundaries, not just in the browser

Resolve the admitted identity and live policy from the session, not client claims. Apply local scope checks before source I/O, enumeration and aggregation. Enumerate only permitted configured repositories in observations and account status; apply the same rule to provider inventory when integrated. Do not leak excluded target names in errors, unavailable placeholders, global totals, links or filter options. Direct out-of-scope target/receipt lookups return the same sanitized not-found response as unknown identifiers; anonymous requests retain authentication-required behavior. In-scope missing authority and unsupported/unavailable capabilities retain distinct safe explanations.

Keep current endpoints (`/api/session`, account projection and `/api/observations`) rather than introducing a public policy API. Add only safe own-scope/capability summaries where the existing UI needs them; never expose the operator registry or credentials. Filter before computing derived counts. Browser filtering remains presentation only. Existing bounded collection, source identity/time, freshness and safe links remain unchanged.

Alternative: browser-only filtering is insufficient because direct APIs, counts and cached responses bypass it. Fetching the whole fleet then trimming also risks metadata leakage and unnecessary credential-bearing I/O.

### 4. Extend existing generation guards and provenance

Add immutable application identity and policy binding to each session. Keep each source connection session-local even when two identities authorize the same numeric GitHub account. Cache/coalescing selection includes identity, session, policy instance, connection generation, qualified target and required scope; do not share across sessions to improve hit rate. Retain permission-before-cache, the 15-second observation interval, bounded collection and source request cancellation.

Validate bindings before every credential-bearing request and again before returning or committing its result. Reuse the existing session lock/source request guard for connection transitions; do not create an unrelated lock that can race with disconnect. Losing authority clears affected observations/counts and invalidates pending authorization/replacement and intention authority. UI responses carry an opaque authority generation so older requests cannot redraw after account change or access loss; reset selections and move focus to a persistent safe control. Transient collection failure can retain stale records only under a still-current binding and permission.

When reusing the #48 path already assembled in PR #100, store the application actor, origin session provenance, policy/connection generation and qualified target with intentions/receipt ownership. Enforce that binding and current permissions at preview/confirmation/send/lookup after PR #100 is integrated into `main` and #48 source acceptance is recorded. Old-session or replaced-connection receipts are not transferable local access tokens; newly authenticated users may separately read source evidence through authorized source reads. Keep the existing journal's correlation, duplicate prevention, uncertainty ledger and correction budgets intact even when a receipt becomes undisclosable. Do not duplicate or replace its history, manufacture a new command or retry on invalidation. This issue selects no store or restoration behavior and does not decide ADR-0008.

Alternative: source-account-only keys merge distinct application identities; scope-blind session caches can retain removed authority. Both are rejected. A second receipt journal would duplicate #48 and is also rejected.

### 5. Capability adapters are dependencies, not new effects

Implement provider read guards only against the #117 projection contract after it is accepted and integrated; #117 remains a proposal and the current candidate has no provider adapter. Contract doubles prove target qualification and negative access behavior, not real authority or provider effects. Unavailable provider operations stay unsupported; #118 retains operation implementation and qualification. The #48 source command controls are already assembled in PR #100, but remain outside `main` and lack parent-issue source acceptance; reuse them after those gates rather than building another path. No shell, bot-token fallback, helper or upstream request is added.

## Review matrix

| Fixture | Admission and explicit grants | Expected evidence |
| --- | --- | --- |
| Personal | Legacy exact owner; existing repositories/actions | Compatibility without new identity or provider authority |
| A | Exact configured identity; project A read; P/X read | Only A and P/X records/counts; denied mutation without action grant |
| B | Different exact identity; project B read; Q/Y read | Only B and Q/Y; no A receipt, cache or counts |
| C | Valid provider identity, not configured | No operational session or protected API data |
| Privileged A variant | Read plus named operate/admin grants | Still denied without current upstream permission; unsupported v1 non-owner/provider writes send nothing |

Repeat A/B with the same GitHub user ID and with identical resource names in different provider scopes. Use direct API requests, not screenshots, as isolation evidence.

## Risks / Trade-offs

- Configuration error or legacy fallback broadens access → explicit-mode startup rejection, exact mapping tests and owner-reviewed examples.
- Restarts revoke all sessions, not only the changed operator → document the interruption; do not claim hot revocation from file edits.
- Counts and account summaries leak metadata → scope enumeration and aggregation server-side, with negative response assertions.
- Late reads restore old authority → generation checks at I/O initiation, completion and browser publication; controlled race tests.
- Receipt isolation conflicts with existing recovery assumptions → reconcile #48 at pickup without resetting its ledger/budgets; stop and revise if that requires changed behavior.
- Provider identifiers or action classes differ from assumptions → bind only to the accepted contract; no new provider/schema invented here.
- Scoped read success is mistaken for team-write or enterprise readiness → explicit unsupported explanations and no production claim.

## Migration Plan

1. Before implementation, record the maintainer's review of this configuration, grant matrix and restart/invalidation semantics; preserve `future` until separately released through the lifecycle. Reconcile current #48/#117 heads, integration and protected architecture decisions through the host/owner.
2. Add legacy fixtures first. Introduce explicit policy and own-scope projections without changing personal configuration. Provide synthetic credential-free examples for A/B/C and named action grants.
3. Integrate scoped reads, then available intentions/receipts and action guards, with tests and documentation in each slice. No new operation is enabled to demonstrate a grant.
4. Rehearse changing/removing grants by restarting the candidate; require fresh authentication/linking and demonstrate that old cookies/receipts cannot be reused.
5. Roll back by restoring a reviewed prior policy/application and restarting, never by sharing a connection or widening grants to mask failure. Re-enter personal mode only intentionally by removing the explicit section, with its documented visibility consequences. Preserve source duplicate/uncertainty records across application rollback and never automatically resend.

## Validation and visual evidence plan

Extend `WorkspaceOptionsTests`, `OwnerAdmissionTests`, `OwnerSessionsTests`, `OwnerBoundaryTests`, `GitHubAuthorizationTests`, `ProviderSessionsTests` and `SourceRequestGateTests`; add focused policy/projection/receipt tests against the integrated source path. Use synthetic identities and deterministic clocks and transport/provider doubles for direct positive/negative cases, same-account isolation, grant removal, expiry/revocation, source permission loss and paused-read/replacement races. Assert zero mutation calls for every denied/unsupported request.

Exercise existing browser suites at desktop and 390px in both themes: separate app/source identities, scoped filters/counts, read-only and unsupported explanations, access-loss clearing, keyboard focus and accessibility. Retain sanitized post-callback screenshots and accessibility results only; no HARs, callback queries, credentials or excluded target records. Screenshots prove presentation, not API isolation. Existing physical-phone limitations remain explicit; arrange authorized real-device acceptance where applicable rather than treating viewport emulation as device proof.

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

The publisher runs strict OpenSpec validation. The eventual implementation candidate runs `npm run verify`, required exact-head CI and `npm run product:citations`; separate real-provider identity E2E remains `npm run verify:identity:host`, outside PR/push CI. Real authorized source/provider read acceptance and independent security review are required before integration where those surfaces are supported. These are plans, not executed checks. Docker-in-Docker is unavailable in this proposal engine and no runtime acceptance is attempted here.

## Definition of Done

All AC1–AC6 have traceable tests/evidence; personal compatibility and the A/B/C direct API matrix pass; unavailable effects remain unavailable; races and receipt isolation pass independently; user/runbook/API docs match the implemented policy; configured verification and exact-head CI pass; independent security judgement and owner-required acceptance are recorded. Any design deviation is reviewed, not silent. Deployment/custody acceptance remains #58. No proposal gate releases the implementation hold or approves either Proposed ADR.
