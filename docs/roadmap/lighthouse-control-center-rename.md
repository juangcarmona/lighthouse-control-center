# Rename the existing repository and distribute Lighthouse Control Center

Owner: [#121](https://github.com/juangcarmona/lighthouse-control-center/issues/121), under [#116](https://github.com/juangcarmona/lighthouse-control-center/issues/116). Canonical repository: `juangcarmona/lighthouse-control-center`. Retain repository numeric ID `1425429121` and node ID `R_kgDOVPZSgQ`.

## Current status — 2026-11-08

Issue #121 reports that the maintainer renamed the existing repository and moved the main checkout to `/srv/repos/juangcarmona/lighthouse-control-center`, retaining node identity and updating origin. These are issue-supplied observations, not fresh live checks by the implementation workspace. The plan itself performs no remote rename, namespace edit, callback change or infrastructure migration.

The issue also reports linked-worktree `.git` pointers still referring to the old main checkout, including the #116 documentation worktree. Repair and continuity verification remain outstanding. Follow the [post-rename continuity runbook](../runbooks/repository-rename-continuity.md); retain actual repair, direct Git, open-PR-base and required-CI receipts before closing #121. Do not repeat the completed rename or cancel unrelated delivery.

GitHub redirects repository web/Git operations after rename, but Pages URLs and hosted Actions references need separate handling; old names must not be reused. Verify each integration directly rather than relying on redirects. See [GitHub repository rename behavior](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository). App callback/permission changes are separate administrative settings; new permissions need installation/user consent before becoming effective. See [GitHub App registration changes](https://docs.github.com/en/apps/maintaining-github-apps/modifying-a-github-app-registration).

## Early repository and folder rename

The following preparation guidance is retained for context and recovery planning, not as an instruction to repeat the completed administrative cutover. Missing pre-cutover receipts must be recorded as missing, not reconstructed as passing checks.

The repository/folder rename can precede the remaining #116 implementation, #58 production hardening and #120 independent distribution. The maintainer accepted the Product Change on 2026-11-08 and explicitly requested this earlier sequencing. Those delivery items are not repository-rename prerequisites. Internal .NET names, configuration keys, OIDC client/issuer IDs and cryptographic purposes can remain unchanged.

Rename the existing repository in GitHub Settings to `lighthouse-control-center`; retain its history, issues and PRs. Update the existing checkout rather than cloning again:

```sh
git remote set-url origin https://github.com/juangcarmona/lighthouse-control-center.git
git fetch origin
```

The main checkout has linked worktrees. After moving `/srv/repos/juangcarmona/sofa` to `/srv/repos/juangcarmona/lighthouse-control-center`, run `git worktree repair` inside the moved main checkout and verify `git worktree list` from an existing linked worktree. Update any configured absolute checkout paths. Linked worktree folders themselves do not need renaming.

Check active deliveries before the administrative cutover. Reconcile any pending source requests created under the old repository name first: the Lighthouse source contract compares both repository ID and full name. Preserve completed historical requests unchanged; create subsequent requests using the new name. The absence of pending requests does not require an alias migration. Afterward verify direct Git access, open PR bases and required CI. The broader inventory below governs integrations that actually change and the later distribution work; it does not require changing origins, credentials or storage just to rename a repository.

## Dependency inventory

Observed paths are source anchors, not an assertion that private environment configuration was inspected. Before execution, complete the owner-controlled private inventory with actual values and safe verification receipts. Never publish credentials, subjects, callback query parameters or raw token responses.

| Surface | Current source / observed dependency | Migration and compatibility check | Owner / current evidence gap |
| --- | --- | --- | --- |
| Repository identity, history, issues, PRs, releases | Existing repository now named `juangcarmona/lighthouse-control-center`, formerly `juangcarmona/sofa`; stable numeric/node ID above | Preserve same repository; compare identity, refs/tags, issue/PR/release IDs/counts and open stack before/after; no clone into a replacement repository | Repository administrator; issue reports retained node identity, full continuity receipts still required |
| Git remotes and worktrees | Issue reports main origin updated and some linked-worktree pointers broken after the main folder move | Verify common remotes, fetch new direct path and compare refs; repair registration without renaming linked folders | Operator; run repair and verify each linked checkout, preserving dirty/untracked assets and active branches |
| Repository metadata | `package.json` repository/bugs/homepage; `README.md`, `lighthouse.json`, default setup repository list | Change current canonical links/labels; preserve historical URLs and immutable source evidence | Application maintainer; current scan establishes paths |
| Lighthouse adoption/workflow source | `.lighthouse/sdlc.json`, `issue-control.json`, generated router/source/locks and immutable upstream pin | Reinstall only through owning installer after reviewed diff; preserve flags, stage policy, checks and exact grants; immutable Lighthouse references are a different repository and are not renamed | Lighthouse adopter; real post-rename source receipt probe required |
| Hash-bound source intents and evidence | #48 candidate protected journal; Lighthouse request keys, repository names and digests; original reports and task digests | Prove old intent/repository-alias resolution without rewriting signed/hashed bytes. Unknown/missing evidence remains uncertain; never resend an old key under a new path | Lighthouse/source contract owner; pending old-name requests must be reconciled before cutover |
| .NET names and assemblies | `SoFa.slnx`, `src/SoFa.*`, namespaces `JuanGCarmona.SoFa`, tests/project refs and Aspire generated project types | Public product identity can change first. Rename internal namespaces/projects only in a separate verified increment if useful; update build/publish/test/generated references together | Application maintainer; namespace migration is optional and not a remote-rename prerequisite |
| Protected persistence/cryptography | #48 `ControlJournal`: `.sofa-journal-v1`, `SoFa.IssueControls.v1` application/purpose strings, SQLite binding and private key directory | Preserve compatibility identifiers across rebrand. Rehearse actual old-state backup/restore and uncertain claims; any format/key-purpose migration needs dual-read/rollback design | Security/custody owner; current main has no journal implementation yet |
| Config/environment and cookies | `SOFA_CONFIG_FILE`, `SoFa:*`, startup/setup scripts, OIDC/cookie boundary | Retain aliases or provide explicit versioned conversion; detect conflicts rather than choosing an identity silently. Restart requires fresh process-local login/source linking | Application/operator; no blanket environment-variable substitution |
| GitHub App and CI identity | User App connection, scoped CI App configuration, installation selection, callback `/connections/github/callback` | Preserve App IDs and installation identity unless a separate reason requires change; verify repository selection, acting user, permitted reads/writes, refresh/revoke, CI attribution and callbacks at intended origin | App administrator; actual registration/settings and consent must be verified privately |
| OIDC/Keycloak | `OwnerIdentity.cs` callback `/signin-oidc`, configured issuer/client/owner in private profile, generated development realm | Do not rename issuer/client merely because repository changed. Register exact redirect/logout origins if origin changes; verify sign-in, denied user, expiry, revocation, logout and outage | Identity administrator/#58; actual external registration is outside source-only evidence |
| Hostnames, TLS and networking | Explicit application/issuer HTTPS origins; development setup creates private CA/TLS | Repository rename does not require origin change. If branding changes DNS, pre-provision/test certificates and callbacks, retain old route through compatibility period and rollback | Infrastructure owner; no personal address is a product contract |
| CI/CD, secrets and environments | `.github/workflows/`, required check names/rulesets, secrets/variables names, scoped App integration | Inventory names/permissions/environments without values; compare effective required checks/events/identities; test new direct repository context and immutable source checkout | Repository administrator; final settings backup required |
| Packages, images and deployment IDs | npm name `sofa`, private package flag, Lighthouse dependency pins; existing build/container labels | Inventory any published package/image and registry permissions first. Keep compatibility tags/config names; published package rename is not inferred from repository rename | Release owner; registry/deployment inventories not yet verified |
| Runtime providers/runners | #57 configured registration/checkout paths, GitHub runner scope and optional telemetry state | Preserve provider/runner/host IDs; verify repository URL in registrations and actual job correlation, event provenance and read-only journal access. Host path is configuration, not fleet identity | Runtime operator; no service restart while occupied |
| Documentation, architecture and publication | ProductShape IDs, ArcShape ADRs/views, existing reports, source/permalink references; potential hosted docs | Update navigation/current branding. Preserve immutable historical reports and signed source metadata; Pages/custom domains and external references need direct probes | Documentation/release owner; actual hosting endpoints need inventory |
| Webhooks, schedules and integrations | GitHub native workflows and any externally configured subscriptions | Verify actual payload `repository.id/full_name`, allowlists, webhook destinations, installation events and source routing; no duplicate subscription/continuation | Respective integration owner; private external inventory must be completed |

## Migration sequence

1. Select the bounded repository/folder rename above or a later distribution cutover. Product Change approval is recorded; apply/merge and ADR-0010 acceptance remain separate. Continue existing delivery, #58 and #120 independently. Keep protected names stable.
2. Read live open PR bases/heads/checks, active workflow attempts, source reservations, provider operations and current rules. Coordinate an idle administrative window with existing work owners; do not cancel unrelated delivery. Snapshot repo metadata/IDs/refs/issue-PR-release inventory and settings. Back up private app state and keys under custody policy; restoration must be tested, not assumed.
3. Run a tracked source-reference scan and private environment inventory. Record every integration owner, changed field, old/new value location, verification and rollback receipt. Verify target-name availability immediately before execution. Hosted Action references to this repo must migrate explicitly; never create another repository to reserve/reuse the old name.
4. Rehearse a compatibility build against retained old configuration and old journal/evidence. Validate the installed Lighthouse tuple, new path alias and repository ID; prove a pre-rename uncertain intention can reconcile without a POST. If an old-name request remains uncertain, reconcile it before cutover or use a supported migration; do not replay it. A deployment without such outstanding requests needs no request-alias migration.
5. Prepare current branding/link/configuration changes as small reviewed increments. Retain namespaces, cryptographic purposes, provider registrations and OIDC issuer/client IDs where they carry no user-facing requirement. If the application origin changes, establish new TLS and allowed callbacks before cutover and test them in the approved environment. Separate cosmetic identity from storage migration.
6. After the required migration/rollback evidence and applicable owner-controlled gates are satisfied, perform the single existing-repository rename. Record time, actor and before/after repository ID. Do not change source permissions or lifecycle rules as a convenience.
7. Update remotes and current canonical paths through reviewed configuration changes. Use provider-owned installers for generated Lighthouse/ProductShape/ArcShape surfaces. Keep old names only as documented aliases/history; archive nothing and create no replacement repository.
8. Run the post-rename probes applicable to changed integrations. Complete the independent install procedure under the final identity as separate #120 delivery. Retain exact new artifact/revision, CI/source/provider receipts and any compatibility names that remain. Remove transitional aliases only after their agreed observation window and unresolved receipts are reconciled.

## Compatibility probes for changed integrations and distribution

| Probe | Pass evidence |
| --- | --- |
| Repository continuity | Same numeric/node ID; expected refs, commits/tags/releases, issue/PR IDs and stack intact; direct old/new Git access inspected |
| CI and source integration | New-path push/PR eligible required checks on exact SHA; App actor scope; existing router/stage admission and a supported read/command receipt under actual user authority |
| Historical evidence | Old immutable links remain inspectable or explicitly unavailable; pre-rename request/mission records retain original identity and correlate through accepted aliases; no altered digest or resend |
| Authentication | Actual issuer trust/HTTPS, exact App and OIDC callbacks, denied identity, expiry/revocation/logout and no source-token fallback |
| Storage and restart | Old protected keys/markers/claims remain readable; restored prepared/uncertain requests are reconciliation-only; no secret in logs/artifacts |
| Runtime independence | Same runner/provider IDs, correct source job mapping and no admission disruption; repository delivery completes with LCC stopped |
| Distribution | New operator follows pinned install, configures own origin/issuer/repositories, views useful data and can recover/revoke without original infrastructure |

Checks must identify exact source version, environment and limitations. Repository continuity and direct Git/CI checks apply to the early rename. Authentication, storage, runtime and distribution probes apply when those surfaces change or their owning delivery is accepted; they are not blanket prerequisites for the early repository rename.

## Rollback and stop conditions

Stop before rename if any current integration lacks an owner/verification path, source-name/digest compatibility fails, safe backups cannot restore, active grants cannot be preserved, target name is unavailable or callbacks cannot be exercised. After rename, a failed identity boundary, missing evidence/receipts or broken required CI blocks further actions. Freeze affected application writes, keep source delivery independent and retain uncertain intents for reconciliation.

Prefer rolling back the application build/configuration and callbacks to the last verified compatible state while preserving the same repository ID and all audit. A remote rename-back is a separately reviewed recovery step only after verifying the old name is still available, redirects and external references, active source work and actual authority. It does not restore credentials, database state, callbacks or consumed intentions automatically. Never erase provider effects or replay uncertain writes to make rollback appear complete.

## Reproducible installation work to finish in #120

The [independent source installation procedure](../runbooks/control-center-installation.md) gives a pinned fresh-clone route using operator-owned configuration. Current development startup is documented in [development identity setup](../runbooks/development-identity.md): pinned dependencies, private setup outside checkout, explicit HTTPS origins, exact callbacks and the supported `npm start`/configuration route. This is a working development procedure, not a completed production distribution contract.

The independent install runbook must pin application artifact/SDK/Node/OS prerequisites; separate development-provider composition from external OIDC mode; state exact GitHub App permissions and user consent; validate repository allowlist and optional provider configuration; create protected data/key directories; verify anonymous/denied/connected access; back up/restore and reconcile without resend; upgrade/rollback using compatible identifiers; record exact version and health/source evidence. Optional runtime administration stays disabled unless its provider grant and actual outcome tests pass. #58 remains the actual production identity/custody gate.
