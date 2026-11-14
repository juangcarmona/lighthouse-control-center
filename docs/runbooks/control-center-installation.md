# Independent source installation: current development baseline

This procedure installs Lighthouse Control Center with a new operator's configuration. Existing `SoFa` configuration keys and .NET assembly names remain in use. Production packaging and a clean-operator recovery rehearsal are tracked by [#120](https://github.com/juangcarmona/lighthouse-control-center/issues/120) and [#58](https://github.com/juangcarmona/lighthouse-control-center/issues/58). This document does not attest that those release gates passed.

## Prerequisites and source

Use a non-root Linux x64 account with Node 22 or newer, .NET 10 SDK, Git, Docker, OpenSSL and the Chromium prerequisites. The application host needs Docker for the development Keycloak container; the web application and agent workloads receive no new Docker privilege from this procedure. The pinned Aspire CLI is supplied by `npm ci`. Repository workflows, runners and inference services are independently configured and do not need to run on this machine.

The following commands reproduce the **historical development baseline**, not the current candidate or a supported production release, in a new directory:

```sh
git clone https://github.com/juangcarmona/lighthouse-control-center.git lighthouse-control-center
cd lighthouse-control-center
git checkout --detach 4c457c337640795a31492f7219cb0e497df9e232
npm ci
npm run verify
```

That immutable revision provides the authenticated observer and development identity foundation. The issue workspace, controls, discovery, inventory and inbox are active candidates identified in the [assessment](../roadmap/lighthouse-control-center-assessment.md); do not install an unreviewed combined preview as a release. Future releases must publish an equally explicit supported artifact/version. Issue #121 reports the repository renamed; the command now uses its new direct clone path while preserving the selected commit and configuration compatibility. Existing moved checkouts follow the [continuity runbook](repository-rename-continuity.md), not a replacement clone.

## Configure and start

Follow the canonical [development identity procedure](development-identity.md#prepare-private-development-configuration) to create a new private setup outside the checkout. Choose your own explicit HTTPS application and issuer origins. The setup generator requires its configured `sofa-dev` realm path and refuses an existing directory. It creates development credentials and certificates locally; no original operator account, ambient `gh` login, provider credentials or personal host is required.

Set `SoFa.Repositories` in that private configuration to your permitted repositories rather than retaining the generator's sample list. Keep the exact configured owner subject. Trust the generated development CA only in the designated browser after checking its fingerprint; do not disable TLS verification or expand private file modes. Use the documented `SOFA_CONFIG_FILE` launch command. An unavailable GitHub source is an explicit application state until you connect an authorized source account.

Follow [Connect the real GitHub user](development-identity.md#connect-the-real-github-user) for the current read-observation App permission set, exact callback, private client configuration and browser consent. This baseline does not dispatch workflow actions. The later #48 controls and #57 administration-read inventory require their independently accepted capability and permission changes; do not pre-grant broader access as part of installation.

An operator using an existing identity provider selects the existing External profile instead of provisioning the development container. Its HTTPS issuer, client, owner/assurance policy, redirects, trust and protected secrets require the actual external-provider checks in #58 before production operation. The development synthetic-account setup is not a production identity installer.

## Verify operation and recovery

Open the configured HTTPS origin and sign in with the local development owner. Confirm anonymous/denied API access fails, inspect the connected GitHub numeric actor and allowed repository observations, then disconnect/logout and verify protected data clears. Empty, denied, stale and unavailable repositories remain distinct. Use `npm run verify:identity:host` for the actual isolated provider harness where Docker and the documented certificate tools are available; synthetic source fixtures in that harness do not prove real App consent.

For the historical pinned baseline above, stop the launcher/AppHost and confirm independently admitted repository work remains unaffected. Restart with the same private configuration; that baseline's process-local login/source connections require fresh linking and it has no runtime command journal. Do not apply that behavior to newer access-continuity/journal candidates: use the version-specific inventory and custody outline below. #58/#120 must prove actual restore before a supported production claim.

For rollback, select the last verified source/artifact and compatible private configuration; keep source IDs, provider state and protected key-purpose names stable. Do not start the retired supervisor, cancel source work or silently expose an anonymous observer. A product rename alone requires neither changing the issuer/client nor migrating namespaces, storage or runtime registrations. The [rename checklist](../roadmap/lighthouse-control-center-rename.md) governs those separate decisions.

## Independent rehearsal status and version inventory

This retains the documentation increment of [#120](https://github.com/juangcarmona/lighthouse-control-center/issues/120), based on [proposal #153](https://github.com/juangcarmona/lighthouse-control-center/pull/153), with additive restart/configuration regressions in draft PR #195. **No operator installation, external security acceptance, restore or production approval is claimed.** One non-root, single-instance Linux x64 installation is the bounded target. Other operating systems, concurrent writers, HA and enterprise infrastructure are excluded. Reuse [#124's adoption and dogfooding guide](lighthouse-dogfooding.md), [#121's continuity runbook](repository-rename-continuity.md) and [#123's asset inventory](../../assets/lighthouse-control-center/); this is not another installation or branding path.

The [owner's 2026-11-14 decision](https://github.com/juangcarmona/lighthouse-control-center/pull/195#issuecomment-6871544869) makes their first installation, authenticated source connection, restart and recovery in their own environment sufficient for the #120 rehearsal once performed and recorded. A second clean machine is not required. That rehearsal remains pending and does not establish production approval, #58 security/custody acceptance, a released artifact or deployment.

Relative source links below refer to host-supplied inspected revision `d3a166bc2de76a0aa4b25c970baba30c29eb00f2`. Values are checked-in declarations, not installed-version or acceptance receipts. Reconcile every row against the exact executable selected for the later rehearsal.

| Input | Observed value / source | Classification and responsible action |
| --- | --- | --- |
| Historical source | `4c457c337640795a31492f7219cb0e497df9e232`, commands above | Pinned development baseline only; not current-source or supported-release acceptance |
| Original proposal inspection | `d24953debaab37dfedf7745add1b47dae538a6d7` | Historical plan input, distinct from this inspection |
| Assembled workspace | Owner reported #100 head `281bb63a0782b986603d9275fa1d38350404b00e`, including #112/#103/#105/#111 | Not an accepted artifact receipt. Juan, integration owner, must nominate the accepted #100/#48 executable; current code presence does not prove real-source acceptance |
| Distributed release | No accepted artifact/checksum supplied | Unresolved/conditional. Juan, release owner, selects artifact plus digest if distributed, otherwise records not distributed; no binary install route is promised |
| Aspire CLI / SDK / Hosting | **13.6.5**, [npm manifest](../../package.json) and [AppHost project](../../src/SoFa.AppHost/SoFa.AppHost.csproj) | Pinned inputs; earlier proposal's 13.6.1 is historical |
| Development provider | Keycloak **26.8.1**, SHA256 `a78d6b79572168cb25886b80a8b5b8d4ed4390743e3eecb810538683e209dd6b`, [composition](../../src/SoFa.AppHost/WorkspaceComposition.cs) | Pinned development dependency; not external-provider acceptance |
| Dependency graphs | [npm lockfile](../../package-lock.json) v3 and .NET `packages.lock.json` files; [launcher](../../scripts/start-workspace.mjs) uses locked restore | Pinned inputs. Developer records lockfile hashes with the selected revision |
| Shared tooling | Lighthouse CLI **0.12.68**, UI **0.2.1**, OpenSpec **1.15.0**, ProductShape **0.23.0**, direct ArcShape **0.1.6**, Playwright **1.64.1** | Pinned direct declarations in manifest/lock, not observed installed tools or a release tuple |
| Linux/toolchain | Linux x64, Node >=22, .NET 10 target; exact distribution and patch versions not nominated here | Unresolved support baseline. Juan/release owner and operator select and record exact OS, Node/npm, SDK/runtime and Git versions |
| Profile-specific tools | Docker host for development provider; OpenSSL/certificate tools and Chromium for documented verification | Operator-supplied; record exact versions and profile. External mode provisions no provider. Docker-in-Docker is unsupported in the worker |
| Protected storage | Current source contains session data/keys and optional command journal/keys | Implemented candidate surfaces, not approved production custody. Reconcile formats/bindings with accepted executable and #58 |

### Dependency and authorization register

| Gate | Responsible role / required receipt | Stop condition |
| --- | --- | --- |
| Accepted executable and controls | Juan, integration owner: exact accepted revision/artifact and #100/#48 source qualification | Do not install an unaccepted feature head as a release or rebuild an alternate workspace/journal/auth path |
| External security and custody | Juan, #58 security owner: real external identity/TLS/custody/recovery matrix, encryption, retention and restore policy | No production origin, credentials, deployment or recovery acceptance inferred from this document |
| Tested environment | Operator with Juan/release owner: nominated Linux/toolchain tuple and first-startup receipt in the owner's environment | No support or production claim from version ranges; no second clean machine required |
| Actual rehearsal | Juan/operator: explicit authorization, permitted sources, test cases and safe evidence reviewer | Do not create source commands, change provider grants or perform installation merely to populate receipts |

These gates do not block documenting prerequisites. They do block the later executable acceptance. Keep the remaining #120 outcome open and coordinate sequencing on #116; this document does not remove an implementation/rehearsal hold or approve deployment.

## Independent configuration contract

The operator supplies their own origin, identity, repositories and optional runtime sources. Provider login never grants GitHub authority. The web application has no original-machine, ambient `gh`, PAT or installation-token fallback.

| Input | Requirement and source |
| --- | --- |
| `SOFA_CONFIG_FILE` | Absolute private file outside checkout, owned/access-controlled by operator; [launcher](../../scripts/start-workspace.mjs). Record only a sanitized profile identifier, not contents |
| `SoFa.Origin` | Exact HTTPS origin, no userinfo/query/fragment/path; operator-owned DNS and certificate trust |
| `SoFa.Identity.Mode` | Explicit `Development` or `External`; no mixed active profile credentials. External provisions no identity resource |
| `SoFa.Identity.External` | Independently managed Keycloak issuer, ClientId, ClientSecret and exact OwnerSubject; HTTPS issuer, accepted claims and assurance2/MFA. Development assurance1 is not an external-security waiver |
| OIDC registration | Exact callback `<SoFa.Origin>/signin-oidc` (origin without trailing slash). Confirm any logout registration against accepted version; do not invent a route |
| GitHub registration | Exact callback `<SoFa.Origin>/connections/github/callback`; independently managed App, selected-repository installation and separate browser user consent |
| `SoFa.GitHub` | ClientId/ClientSecret both supplied or both absent. `AppId` is the intended positive numeric App ID for source controls, not an OIDC owner identifier |
| `SoFa.Repositories` | Explicit one-to-ten distinct permitted `owner/repository` names; never retain sample repositories as authority. Optional `RepositoryBranches` names only configured repositories and supplies expected metadata, not permission |
| `SoFa.Identity.SessionDirectory` / `SessionKeyDirectory` | Required separate absolute private data/key paths in current source, outside checkout/publish tree; see custody below |
| `SoFa.Controls.JournalDirectory` / `KeyDirectory` | Both configured or both absent; four storage directories must be pairwise separate/non-overlapping. Missing/unsafe command storage blocks controls, not ordinary authorized reads |
| Optional runtime | `SoFa.Runtime.Registrations`, `Checkouts`, `TrustedGroupIds` only when explicitly selected; follow [runtime inventory guidance](runtime-inventory.md). Absent telemetry/administration is unavailable, not healthy/zero, and does not block supported repository/mission reads |
| TLS and private material | Operator owns application/issuer reachability, exact redirects and certificate/key custody. No TLS bypass, broad file modes, private configuration dump or public backup |

Validation comes from [WorkspaceOptions](../../src/SoFa.Modules.Workspace/WorkspaceOptions.cs), [RuntimeOptions](../../src/SoFa.Modules.Workspace/Runtime/RuntimeOptions.cs) and [composition](../../src/SoFa.AppHost/WorkspaceComposition.cs). R2 below must exercise both valid and negative configurations on the selected version; documentation is not a configuration-validation receipt.

### Capability-specific GitHub grants

The historical installation text calls the App read-observation, while the [identity runbook](development-identity.md#connect-the-real-github-user) lists Metadata/read, Issues/read-write and Actions/read. That wording is not evidence of a universally minimal permission set. Reconcile the selected executable's actual capabilities and effective App/user intersection before rehearsal, recording the result without private grant contents.

The [controls runbook](issue-controls.md#contract-and-permissions) separately requires numeric App identity, source contract and effective write/dispatch-related grants; [runtime inventory](runtime-inventory.md) separately gates administration reads. Do not automatically grant Administration, Contents/write or workflow dispatch to install the observer. Missing permission leaves the dependent capability explicitly unavailable, without using another account. Login, link, disconnect and logout do not request repository work.

## Version-specific custody and recovery outline

The historical pin uses process-local sessions. **Current inspected source instead persists protected access continuity and command intentions.** The identity runbook's older Stop and rollback sentence about discarding process-local connections applies to the former baseline; its [access-continuity migration section](development-identity.md#access-continuity-storage-and-migration) describes the current candidate. First migration from the in-memory version requires fresh owner login and source consent; subsequent valid sessions require online provider verification after restart and source identity/permission verification before reuse. Do not promise unconditional session survival or extend expiry.

Complete the following custody worksheet for the accepted version. Each row additionally needs custodian/process user, exact protected location, access mode, encryption/key custody, backup consistency method, retention, restore order and compatibility/stop receipt. Private values belong only in the operator's protected record. Juan/#58 must supply production policy; the development implementation is not that approval.

| Item / observed surface | Custody and consistency boundary | Restore order / stop condition |
| --- | --- | --- |
| Configuration, TLS and external-provider references | Private outside checkout; independent operator/provider custody; record protected references, never keys/configuration contents | Establish trusted origin/issuer and compatible identity/source bindings first; stop on missing trust or unknown ownership |
| `Identity.SessionDirectory` | Private session/grant SQLite data, including any required WAL; separate from key and command directories | Restore stopped, together with its matching key pair; unsafe/corrupt storage blocks access. Never expose or inspect credential payloads in evidence |
| `Identity.SessionKeyDirectory` | Private Data Protection ring; separate mode0700 directory. Session application name `LighthouseControlCenter.OwnerSessions.v1` | Preserve purposes and issuer/client/subject bindings; grant also binds GitHub client/App. Missing keys require fresh authentication/consent, not an authority bypass |
| `Controls.JournalDirectory` | Private `intents.sqlite` plus required companion files; [command backup procedure](issue-controls.md#operation-and-recovery) requires stopping the writer and capturing the complete directory | Restore with matching key/marker directory while stopped; old preparations become uncertain and reconciliation-only |
| `Controls.KeyDirectory` | Private keys and `.sofa-journal-v1` marker; application name `SoFa.IssueControls.v1`, purpose `SoFa.IssueControls.PreparedAndReceipt.v1` plus journal binding | Missing/wrong keys, marker or schema block actions; never delete/reset journal or regenerate bindings to clear an uncertain send |
| Version/binding metadata | Exact artifact/revision, lock hashes, schema/key-purpose compatibility and sanitized binding/profile references; protected original command/source correlation | Validate before enabling access. Stop on incompatible rollback, incomplete backup or uncertain custody; never overwrite newer journal state |

Current setup uses non-root application ownership, separate mode0700 directories and private files; command SQLite/marker/key files require mode0600. Preserve ownership/modes and private parents. See [identity storage](development-identity.md#access-continuity-storage-and-migration) and [journal setup](issue-controls.md#private-journal-setup); do not merge directories or loosen permissions to fix a startup failure. Provider recovery is independent. Browser observation projections, pending OAuth transactions and action eligibility are not durable authority.

### Planned restore, upgrade and rollback sequence

1. Record the selected candidate, Linux baseline, applicable custody decisions and owner/operator rehearsal authorization. Record a metadata-only compatibility manifest and protected backup destination. Production recovery acceptance still requires #58.
2. Stop the single application writer without stopping independent repository execution. Use the accepted version's consistent backup method; capture complete session data/key and command data/key-marker pairs, including required WAL files, plus protected configuration/TLS references. Never copy only a live database.
3. Restore while stopped under approved access controls. Preserve bindings and key purposes; validate artifact/schema/configuration compatibility before enabling access. Do not publish backup contents as receipts.
4. Start the documented launcher with the operator's private configuration. Verify online provider/source authority or fresh login/linking as required by the selected version; inspect retained original command/source IDs and reconcile against original source evidence. An absent result remains uncertain, not permission to resend.
5. Upgrade only with a verified compatible artifact and backup. Roll back only with a verified prior artifact and compatible state/configuration; incompatible state stops the procedure. Do not downgrade over newer records, cancel/redispatch work, revive the retired supervisor or expose an anonymous observer.

## Owner/operator rehearsal matrix — planned, not executed

All rows require an exact selected executable, recorded operator environment and operator authorization. The owner's first startup/connection/restart/recovery is sufficient; no second clean machine is required. Production external identity/security/recovery acceptance requires #58's real matrix. No fixture, package installation, screenshot or development-provider pass substitutes for actual external/source acceptance. Failure retains its receipt and existing upstream owner; it does not justify alternate implementation or weakened checks.

| Case | Additional prerequisites | Expected observable result | Safe receipt |
| --- | --- | --- | --- |
| R1: install | Nominated source and locks; checksum if release distributed | Documented locked source install starts the exact accepted application; conditional artifact checksum matches | Revision/artifact digest, lock hashes, exact tools/OS, install/build result |
| R2: configuration | Independent HTTPS/issuer/client/owner; exact callbacks; #58 external policy | Valid External selects no provider provisioning. Missing required values, mixed profiles, unsafe origin, partial GitHub pair and overlapping storage fail closed without values in errors | Case outcomes, sanitized profile/version, callback-registration confirmation |
| R3: source journey | Real permitted repositories including partial/unadopted; actual App/user consent | Sign in, separately connect, inspect numeric actor/effective scope; useful repository/mission reads work with optional runtime absent. Empty, denied, stale, unavailable and partial remain distinct; inaccessible is not unadopted | Safe post-callback identity/read outcomes, source/check times, capability coverage |
| R4: restore | #58 custody; accepted data/key formats and complete consistent backup | Clean-instance restore preserves readable retained data and version policy for sessions/source verification; metadata traces custody/retention/compatibility | Metadata-only backup/restore outcomes and access/compatibility review; never backup contents |
| R5: uncertainty | Accepted #48 path; separately authorized uncertain-command setup | Restart/restore retains original command/source IDs, claims and uncertainty; reconcile without another send. Missing keys, incompatible binding or incomplete evidence stop safely | Original receipt correlation and no-resend/send-count evidence from authorized instrumentation |
| R6: denied/revoked/outage | #58 real external provider/source matrix | Anonymous pages/direct APIs and wrong owner disclose no protected data. Expiry, logout/disconnect, actual source revocation, due provider outage and restart follow selected version policy with no fallback or extended deadline | Deterministic results separately labelled from actual-provider/source outcomes and independent evidence review |
| R7: independence | Already admitted independent workflow; authorized stop interval | Workflow continues/publishes while Control Center is stopped; reconnect observes the same source run/outcome or explicit evidence gap, without cancellation/replacement dispatch | Original source run/link and outcome plus application stop/restart times |
| R8: upgrade/rollback | Compatible prior/candidate artifacts and protected backup | Upgrade/rollback preserves compatible configuration/state/bindings; incompatible combination stops; retired supervisor remains off | Version/compatibility table, procedure outcome and process-composition receipt |
| R9: receipt review | Completed applicable cases and independent credential-free reviewer | Reviewer traces criteria to exact-version receipts and visible gaps; development install, external security acceptance and production approval remain separate | Reviewed receipt index linked here and from #124 adoption path |

### Acceptance traceability

The issue has six acceptance bullets. The proposal's AC-1–AC-8 split the last two bullets into separately reviewable concerns; these labels are not additional issue requirements.

| Proposal label / issue acceptance | Cases | Later evidence source |
| --- | --- | --- |
| AC-1 / bullet 1: reuse composition/identity/source/UI; versions and validation | R1, R2 | Exact revision, lock/toolchain inventory, install and configuration receipts |
| AC-2 / bullet 2: reproducible installation, protected configuration, HTTPS and rollback | R1, R2, R8 | Operator-owned configuration/registration confirmation and compatibility outcomes |
| AC-3 / bullet 3: clean-operator sign-in/source/partial reads/disconnect/restart | R3, R4, R6 | Real identity/source journey and recovery outcomes |
| AC-4 / bullet 4: protected state/key bindings and backup/restore | R4 | #58 custody decision and consistent restore receipt |
| AC-5 / bullet 4: retained/uncertain commands reconcile without resend | R5 | Original command/source correlation and send-count evidence |
| AC-6 / bullet 4: anonymous/denied access and credential-free evidence | R6, R9 | Negative-access matrix and independent redaction review |
| AC-7 / bullet 5: independent delivery and optional runtime absence | R3, R7, R8 | Source run before/during outage, useful reads with absent telemetry |
| AC-8 / bullet 6: exact artifacts/actual receipts; development is not production | R1–R9 | Reviewed receipt index, #58 external matrix and separately authorized production decision |

### Receipt format and evidence handling

For each attempt record: case/criterion IDs; planned/executed status; exact application revision and conditional artifact digest; lock hashes; sanitized configuration profile identifier; exact OS/tool versions; start/end times; prerequisites and authorization reference; expected and actual result; exit code where applicable; safe evidence path/link; reviewer and unresolved gaps. Never prefill an actual result as passed. Keep protected original source identities where disclosure is not authorized; use safe correlation references publicly.

Run existing WorkspaceOptions/Composition, owner/provider/session, GitHub authority and ControlJournal tests through the repository checks. `npm run verify` is the full deterministic/host lane; `npm run verify:identity:host` is the separate isolated real-provider E2E lane on a capable host, not a new PR/push requirement. Actual external-provider and real App consent/revocation receipts remain separate from both. The host independently rechecks this candidate and exact-head CI/integration remain future requirements.

For later R3/R6, retain sanitized post-callback account/repository and cleared/denied views only. Reuse light/dark desktop/narrow keyboard/focus checks when applicable. Exclude login setup, callback URLs/queries, codes, credentials, private source content, HARs, traces and raw browser logs. An independent reviewer must check logs/screenshots/artifacts before publication. Physical-phone acceptance remains owner-deferred; viewport checks do not prove it. This documentation and regression-test increment changes no UI or assets and requires no new visual publication decision.
