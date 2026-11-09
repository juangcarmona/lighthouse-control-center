---
pdac-scope: cited
---

# Design

## Context

See proposal.md — Why. The canonical installation runbook already supplies a source installation and delegates identity setup. Current `WorkspaceComposition.cs` validates configuration, composes one web process and adds pinned development Keycloak only in Development mode. External mode provisions no identity provider. `start-workspace.mjs` requires an absolute private configuration outside the checkout, performs locked restore/Release AppHost build and directly executes that build.

`WorkspaceOptions.cs` validates selected profiles, exact HTTPS addresses, owner subject/client, repository names and paired GitHub settings. Current `OwnerIdentity.cs` uses ephemeral data protection and process-local sessions. The runbook says this baseline has no command journal. Therefore neither backup of an imagined key directory nor session continuity after restore can be asserted from main. The integrated #48 journal must be inspected only after #100 acceptance.

## Goals / Non-Goals

**Goals:** produce a usable prerequisite document, decision register, version-specific custody outline and acceptance matrix. Each input and each row has an owner, expected outcome and safe evidence form. Preserve one canonical installation path.

**Non-Goals:** implement missing upstream behavior, choose security policy for #58, create an installer/service manager, distribute a binary, change identity/binding names, or perform installation. Other OS/architectures, concurrent writers, HA, enterprise and provider administration remain outside this five-point delivery.

## Decisions

### 1. Extend the source-install runbook; do not introduce packaging machinery

Use `docs/runbooks/control-center-installation.md` as the entrypoint and link `development-identity.md` for shared setup details and #124 for adoption. Retain the historical pin with its development-only qualification until an accepted version is nominated. Source installation is the initial documented route; a binary release is conditional on a separately selected distributed artifact and checksum. Do not promise both distribution forms without evidence.

Alternative: a new container installer or deployment platform. Rejected for this increment because it duplicates existing composition and adds an unaccepted support surface. Trade-off: an independent operator still needs the documented build toolchain.

Self-hosting must not embed the original operator's infrastructure.
<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->

### 2. Keep a classified, version-bound inventory

Each future runbook row records input, source reference, observed value, classification, responsible owner and acceptance receipt. A checked-in pin is not a supported-release claim. No floating `latest`, feature-branch installation or inferred SDK patch version is permitted as a release instruction.

| Input | Observed source/value | Classification for rehearsal | Owner/action |
| --- | --- | --- | --- |
| Application source | Main `d24953debaab37dfedf7745add1b47dae538a6d7`; runbook pin `4c457c337640795a31492f7219cb0e497df9e232` | Unresolved accepted executable | Juan, integration owner: nominate accepted revision after #100 |
| Source-control stack | Owner-reported #100 head `281bb63a0782b986603d9275fa1d38350404b00e` | Unresolved, not release | Juan: provide integration/acceptance receipt; inspect that accepted version |
| Distributed release | No accepted artifact/checksum established | Unresolved/conditional | Juan, release owner: choose artifact only if distributing; otherwise mark not distributed |
| Aspire CLI/SDK/hosting | package.json, package-lock.json, AppHost project: 13.6.1 | Pinned on inspected main | Developer: reconcile against accepted executable |
| Development provider | Keycloak 26.8.1, SHA256 `a78d6b79572168cb25886b80a8b5b8d4ed4390743e3eecb810538683e209dd6b` | Pinned development dependency only | Developer: retain digest; not external-provider acceptance |
| Application dependencies | npm lockfile v3 and .NET package locks; launcher uses `--locked-mode` | Pinned dependency inputs | Developer: record lockfile hashes with accepted revision |
| Shared tooling | Lighthouse CLI 0.12.65/UI 0.2.1; OpenSpec 1.15.0; ProductShape CLI 0.23.0; ArcShape 0.1.6; Playwright 1.64.1 | Pinned on inspected main | Developer: record actual accepted tuple; host evidence provider 0.25.0 is not installed CLI 0.23.0 |
| Linux x64 baseline | Non-root single instance; distro/patch unspecified | Unresolved support choice | Juan, release owner: select one exact tested OS baseline |
| Node/npm, .NET SDK/runtime | Node >=22 and net10.0 are ranges/targets, not exact tested versions | Unresolved exact versions | Operator: supply tested versions, developer: document them |
| Git, Docker host, OpenSSL, Chromium, certificate tools | Required by documented source/verification routes; exact versions absent | Operator-supplied; exact receipts unresolved | Operator: record versions and which profile needs each |
| Journal/key/binding formats | Not established by main | Unresolved | #100/#48 integration owner and #58 custody owner |

Alternative: treat package version pins or the historical runbook commit as a complete release manifest. Rejected because neither proves the accepted executable or tested environment.

### 3. Preserve separate identity and source authority

Document configuration names, constraints and ownership, never private values. Operator-owned application origin and issuer require trusted HTTPS and exact registered redirects. OIDC callback is `<SoFa.Origin>/signin-oidc`; GitHub callback is `<SoFa.Origin>/connections/github/callback`. Confirm any additional provider logout registration against the accepted version rather than inventing a route.

| Configuration | Contract/documentation |
| --- | --- |
| `SOFA_CONFIG_FILE` | Absolute private file outside checkout; owned/access-controlled by operator; record reference only |
| `SoFa.Origin` | Exact HTTPS origin, no userinfo/query/fragment/path; DNS/trust supplied independently |
| `SoFa.Identity.Mode` | Explicit Development or External; no mixed active settings |
| `SoFa.Identity.External` | Issuer, ClientId, ClientSecret, exact OwnerSubject; issuer/subject admission, external assurance2/MFA and required claims remain unchanged |
| Development identity | Follow existing isolated setup only; password assurance1 is not an external-security waiver |
| `SoFa.GitHub` | ClientId/ClientSecret both present or both absent; independent App registration, installation and user consent |
| `SoFa.Repositories` | Explicit permitted owner/repository allowlist; main validates one to ten distinct names; recheck accepted version |
| TLS/private material | Operator-owned certificate/trust and protected references; no TLS bypass, private contents or broad file-mode instructions |
| Optional runtime/provider | Record selected accepted schema/capability and explicit absence; no invented configuration keys or mandatory grant for repository/mission reads |
| State/journal/data protection | Version-specific protected locations and bindings supplied after accepted integration and #58 policy |

The identity runbook lists Metadata/read, Issues/read-write and Actions/read for its existing App, while the installation text describes read observation. Record that discrepancy for version-bound permission reconciliation, not as permission to broaden grants. Document effective App/user intersection for selected capabilities; no automatic Administration, contents-write or workflow-dispatch permission. Missing GitHub configuration permits only the documented disconnected shell, not unauthorized reads. Missing optional runtime configuration does not justify hiding useful reads already supported upstream.

Alternative: provision identity from the installer or use ambient gh/PAT access. Rejected: provider identity, owner admission, GitHub user authority and runtime grants remain separate. Credentials stay server-side and out of evidence.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

### 4. Document a custody contract, not a new storage engine

Provide one row per durable item after the selected executable is accepted: configuration/TLS references, retained application data, integrated journal including any companion files required for consistency, data-protection keys, binding identifiers and version/compatibility metadata. Each row needs location, custodian, process owner, required access modes, encryption/custody, backup consistency method, retention, restore order and stop condition. Mark process-local sessions/connections as non-durable. #58 supplies actual storage/key policy, retention and recovery decisions; do not fill them with guessed defaults.

Planned recovery order: stop the application writer without stopping independent repository work; establish a consistent protected backup using the accepted journal's supported method; record compatible artifact/configuration/binding metadata; restore under approved access controls on the clean configured instance; validate compatibility before enabling access; require fresh authentication/source linking where the version's session policy requires it; read retained records and reconcile against original source evidence. Missing keys, mismatched bindings or incomplete evidence stop acceptance and keep uncertainty visible. Never reset authority, recreate intentions or send again to make recovery appear successful. Identity-provider recovery remains independent.

Alternative: copy a running database alone or replace the journal/key purposes during rebranding. Rejected because it risks inconsistent state and loss of recoverability. No multi-instance write guarantee follows from SQLite. No new storage schema, migration or API is introduced here.

### 5. Rehearse source independence without becoming execution authority

Use the accepted #48 journal and source reconciliation path only. Separately authorize any test command or repository workflow setup; observe an already admitted independent run while Control Center is stopped. Record its original source identity, not a replacement dispatch. The retired supervisor remains disabled, including during rollback.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->

Alternative: send a new command after uncertain recovery or restart the legacy execution stack. Rejected because source-owned work and original command uncertainty must survive application outage.

## Acceptance and evidence plan

All rows below are **planned, not executed**. Common prerequisites are an accepted exact executable, nominated Linux/toolchain baseline, clean operator-owned environment and separate rehearsal authorization. External security/recovery rows also require #58 decisions. A failure records a gap with the existing owner, not a packaging workaround. Receipts use criterion/scenario IDs, revision/artifact digest, sanitized configuration profile identifier, environment versions, start/end times, expected/actual result, safe evidence link and unresolved gaps. Omit private values and sensitive identifiers where disclosure is not authorized.

| Case / criteria | Additional prerequisites | When / expected observable result | Safe receipt |
| --- | --- | --- | --- |
| R1 / AC-1 | Nominated source; release digest only if distributed | Install on chosen baseline using documented locked inputs; application starts from exact accepted revision; distributed artifact checksum matches if applicable | Build/install outcome, revision, lock hashes, tool versions and conditional artifact digest |
| R2 / AC-2 | Independent HTTPS/issuer/client/owner and exact callbacks; #58 external matrix | Valid configuration selects external profile without provider provisioning; missing required field, mixed profile, unsafe origin or partial GitHub pair fails closed with value-free error; absent optional runtime does not block supported reads | Sanitized case outcomes, profile/version and callback-registration confirmation, no configuration dump |
| R3 / AC-3 | Permitted real repositories including partial/unadopted cases; actual separate App/user grant | Sign in, separately connect GitHub and inspect numeric actor/effective scope; available data stays usable with runtime absent; denied, empty, stale and unavailable remain distinct, inaccessible is not unadopted | Safe post-callback account/read receipts with source/check times and supported capability coverage |
| R4 / AC-4 | #58-approved custody; accepted journal/key locations/formats | Restore a consistent protected backup on clean instance in documented order; retained records readable; expected fresh login/linking occurs; custody/retention/compatibility are traceable | Backup/restore job outcomes and metadata-only compatibility/access review, never backup contents |
| R5 / AC-5 | Accepted #48 path; separately authorized uncertain-command setup | Restart/restore preserves command/source IDs and uncertainty; reconciliation uses original evidence without another send; missing key, incompatible binding or insufficient evidence stops safely | Original IDs/receipt correlation and send-count evidence from authorized test instrumentation, no token-bearing transport |
| R6 / AC-6 | #58 actual external-provider/source matrix | Anonymous direct page/API and wrong owner cannot access protected data; expiry, disconnect/logout, actual source revocation, due provider outage and restart follow version policy; no fallback authority or deadline extension | Deterministic result links plus separately labelled actual-provider/real-source outcomes and independent evidence review |
| R7 / AC-7 | Independently admitted workflow; authorized stop interval | Workflow continues/publishes while Control Center is down; reconnect observes same source run/outcome or explicit evidence gap without cancellation/redispatch | Source run ID/link, app stop/restart times, before/after source outcome |
| R8 / AC-7 | Verified compatible prior/candidate artifact and protected backup | Upgrade then rollback uses verified compatible artifact/configuration/bindings; incompatible combination stops; retired supervisor remains off | Version/compatibility table, procedure outcome and process composition receipt |
| R9 / AC-8 | Completed rows and independent credential-free evidence review | Reviewer traces all criteria to exact-version receipts and visible gaps; development install, external security acceptance and production approval remain separate | Reviewed receipt index linked from canonical runbook and #124 path |

### Test impact and visual evidence

This documentation increment adds no runtime tests or UI changes. Verify the document's inventory against source, cross-links and AC coverage, then use repository Markdown/OpenSpec/citation checks. The publisher runs OpenSpec strict validation; it is not executed inside this engine.

Later executable acceptance reuses `WorkspaceOptionsTests`, `WorkspaceCompositionTests`, owner admission/boundary/session/provider tests and GitHub authorization/source gate tests, plus the accepted #48 journal tests. `npm run verify` is the deterministic/full host lane; run `npm run verify:identity:host` separately on a capable host, not as a newly required PR/push check. Docker-in-Docker is unsupported here. Development-provider results and source UI fixtures do not prove #58's external matrix or actual GitHub consent/revocation. Do not weaken or replace existing tests to accommodate missing upstream behavior.

For later R3/R6, retain only sanitized post-callback views of account identity, repository states and cleared/denied access. Reuse existing light/dark desktop and narrow-layout keyboard/focus checks where applicable; no new artwork or layout is proposed. Screenshots must exclude login setup, callback URLs, codes, secrets and private source content. No HAR, raw browser logs or token-bearing traces. An independent evidence reviewer checks retained logs/screenshots/artifacts before publication. Physical-phone acceptance remains owner-deferred, not inferred from viewport tests or reopened as a requirement of this increment.

## Risks / Trade-offs

- Historical pin and unaccepted stack → label development evidence accurately; replace only after exact-version acceptance.
- Open #58 custody decisions → publish decision slots and stop conditions, never a supported recovery claim.
- Read/write App permission wording differs across runbooks → reconcile against selected accepted capabilities and actual effective permissions before rehearsal.
- Packaging discovers an upstream gap → retain failed receipt and route it to #100/#48/#58 owner; no alternate engine or hidden scope growth.
- Partial source evidence mistaken for inactivity/recovery → preserve timestamps, IDs, stale/unknown states and no-resend rule.
- Five-point delivery mistaken for routine unattended work → keep future hold and explicit authorization boundaries.

## Migration Plan

1. Owner reviews this prerequisite-only candidate. No repository/runtime migration occurs in this stage.
2. If separately authorized, land only the canonical runbook inventory, custody outline and rehearsal/receipt plan. Rollback is a reviewed documentation revert that preserves historical evidence.
3. Retain the remaining executable delivery on #120. Juan nominates the accepted #100 artifact, resolves #58 policy and selects the exact supported baseline, then explicitly authorizes the relevant implementation/rehearsal.
4. At that later stage, rehearse upgrade/rollback with verified compatible artifacts and a consistent protected backup. Stop rather than downgrade incompatible state; do not overwrite newer journal data, change key purposes or restart the supervisor. Production release/deployment requires its own decision.

## Deferred dependency decisions

These are release/rehearsal gates, not unanswered product-scope questions in this documentation candidate. Juan is the responsible integration/security/release owner: accepted executable and conditional release form (#100); exact tested OS/tool versions (operator environment); external identity/TLS matrix, storage/key custody, retention, backup consistency and restore/session policy (#58). The document records their status and required evidence now; final commands and support claims wait for their decisions. #121 continuity, #123 assets and #124 adoption remain separately owned.

## Definition of Done

For this increment: canonical runbook contains the classified inventory, named dependency gates, custody outline, AC-1–AC-8 rehearsal/receipt mapping and links to the existing identity/adoption path; relevant documentation and strict OpenSpec/citation checks pass on the actual candidate; developer reviews accuracy and limitations. It contains no claimed live acceptance.

For the retained overall #120 outcome: exact accepted-version receipts establish every applicable AC, relevant trusted CI and independent review pass, and all unavailable/deferred results remain visible. Completion of documentation alone cannot close the installation/recovery issue or establish production approval.
