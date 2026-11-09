---
title: Deployment view
arc42-section: "07"
description: Infrastructure and environment mapping for the system.
---

# 07. Development and execution separation

The supported application entrypoint builds and directly launches the pinned Release AppHost. It composes a workspace process and, only for Development mode, a dedicated Keycloak container. Both browser-visible application and issuer addresses are explicit HTTPS configuration. Secrets, imported synthetic accounts and TLS keys are local private setup files outside the checkout.

| Building block | Development mapping | External / production direction |
| --- | --- | --- |
| Workspace | One .NET process composed by Aspire | Same selected external-issuer profile; final production packaging remains release work |
| Identity provider | Isolated pinned Keycloak image, private test realm and credentials | No provider provisioned by AppHost |
| Application state | Protected session/source credential store and separate key ring in the access-continuity candidate; bounded memory observations and optional independent command journal | Protected durable custody/recovery remains unresolved release work |
| Repository delivery | Independently operated workflows and executor | Independent of either workspace or development provider |

<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

[Composition source](../../../src/SoFa.AppHost/WorkspaceComposition.cs) is the infrastructure truth. AppHost provisions no supervisor, execution database or anonymous Node listener. Aspire's project-rebuilder helper is development tooling, not a delivery worker. The application dashboard is disabled for this entrypoint.

## Operational boundary

The [development identity runbook](../../runbooks/development-identity.md) owns setup, exact callbacks, trusted browser/device certificates and rollback. The [launcher](../../../scripts/start-workspace.mjs) bypasses the CLI run hook so an older Debug output or certificate-setup wizard cannot replace the reviewed Release entrypoint. Existing framework runtime certificates are distinct from the isolated application's CA.

The external profile is configuration/composition coverage, not evidence of production deployment or provider connectivity. Production TLS/DNS, protected storage, backups and recovery belong to infrastructure under [ADR-0007](../09-architecture-decisions/0007-shared-identity-custody-and-recovery.md) and release-readiness work.

## Optional local inventory sources

The application process can read explicitly configured, operator-owned host registrations and checkouts through its bounded Node/Git child process. This Linux-only observation path requires no worker agent, Docker socket, repository installation or runtime restart. Temporary object-view files are private and request-scoped. The [runbook](../../runbooks/runtime-inventory.md) owns filesystem trust, private configuration and operational limits; unsupported environments expose unavailable observations. Independent repository execution retains its existing deployment and supervision.

<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

## Optional command persistence

Explicit issue controls require two pre-created private Linux directories configured by `SoFa:Controls:JournalDirectory` and `SoFa:Controls:KeyDirectory`. SQLite files and the separate persistent protector ring live outside the checkout and published application. The single application instance owns them; the identity provider and repository runners do not. Missing/unsafe paths disable submission without blocking source observation. Deployments must retain both directories, preserve 0700/0600 ownership/modes and account for WAL/key storage independently of the logical database cap. See the [operating and recovery procedure](../../runbooks/issue-controls.md). This checkpoint does not establish production backup/custody readiness.

## Proposed portable deployment evolution

Retain one configured .NET application and its current native frontend. Aspire composes development dependencies; it does not provision personal production infrastructure by implication. Runtime adapters use independent provider credentials and protected endpoints. The local provider can be colocated for the first acceptance; privileged operations use a reviewed bounded provider API/helper, not elevated web-process permissions. Existing operator-owned runner and model services remain independently managed.

| Deployment | Same application configuration | Evidence before a readiness claim |
| --- | --- | --- |
| Personal | One admitted operator, explicit repository list, external/development identity, one local provider, protected application state | New-operator install, source action, one safe provider operation, backup/recovery and independent-workflow test |
| Small team | Multiple explicitly scoped identities, several hosts/providers and shared pools | Cross-user cache isolation, revocation and provider grants; current owner-only source SDK cannot authorize additional actors |
| Enterprise target | Bounded fleet pagination, teams, provider instances and separately managed Kubernetes/VMSS/GPU capacity | Representative load, identity/group changes, rate limits, data isolation and provider-specific acceptance; not implied by local contract doubles |

No broker, separate analytics service or database server is required by this proposal. Storage choice and replication depend on accepted retention/availability needs. Start single-instance; the #48 private SQLite/key custody is not a multi-instance write guarantee. Distribution and identity/custody acceptance follow the [roadmap](../../roadmap/lighthouse-control-center.md); renaming infrastructure identifiers is separately gated by the [rename plan](../../roadmap/lighthouse-control-center-rename.md).

## Candidate access-continuity custody

[Proposed ADR-0011](../09-architecture-decisions/0011-preserve-verified-access.md) adds separately provisioned private session data and key directories through `SoFa:Identity:SessionDirectory` and `SoFa:Identity:SessionKeyDirectory`. The development generator provisions them outside the checkout; they must also remain outside the published application and separate from command-journal custody. Provider and source revalidation remain required after restart. Initial migration from the former process-local binary needs fresh login/linking; subsequent restart recovery is a separate acceptance check. Production backup, recovery and multi-instance operation remain unqualified.
