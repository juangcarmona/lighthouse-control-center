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
| Application state | Bounded process-memory authentication/observations; optional protected SQLite command journal and separate key ring | Protected durable custody/recovery remains unresolved release work |
| Repository delivery | Independently operated workflows and executor | Independent of either workspace or development provider |

<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

[Composition source](../../../src/SoFa.AppHost/WorkspaceComposition.cs) is the infrastructure truth. AppHost provisions no supervisor, execution database or anonymous Node listener. Aspire's project-rebuilder helper is development tooling, not a factory worker. The application dashboard is disabled for this entrypoint.

## Operational boundary

The [development identity runbook](../../runbooks/development-identity.md) owns setup, exact callbacks, trusted browser/device certificates and rollback. The [launcher](../../../scripts/start-workspace.mjs) bypasses the CLI run hook so an older Debug output or certificate-setup wizard cannot replace the reviewed Release entrypoint. Existing framework runtime certificates are distinct from the isolated application's CA.

The external profile is configuration/composition coverage, not evidence of production deployment or provider connectivity. Production TLS/DNS, protected storage, backups and recovery belong to infrastructure under [ADR-0007](../09-architecture-decisions/0007-shared-identity-custody-and-recovery.md) and release-readiness work.

## Optional local inventory sources

The application process can read explicitly configured, operator-owned host registrations and checkouts through its bounded Node/Git child process. This Linux-only observation path requires no worker agent, Docker socket, repository installation or runtime restart. Temporary object-view files are private and request-scoped. The [runbook](../../runbooks/runtime-inventory.md) owns filesystem trust, private configuration and operational limits; unsupported environments expose unavailable observations. Independent repository execution retains its existing deployment and supervision.

<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## Optional command persistence

Explicit issue controls require two pre-created private Linux directories configured by `SoFa:Controls:JournalDirectory` and `SoFa:Controls:KeyDirectory`. SQLite files and the separate persistent protector ring live outside the checkout and published application. The single application instance owns them; the identity provider and repository runners do not. Missing/unsafe paths disable submission without blocking source observation. Deployments must retain both directories, preserve 0700/0600 ownership/modes and account for WAL/key storage independently of the logical database cap. See the [operating and recovery procedure](../../runbooks/issue-controls.md). This checkpoint does not establish production backup/custody readiness.
