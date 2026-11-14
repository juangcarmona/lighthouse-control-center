---
id: ADR-0011
title: Preserve bounded owner sessions and separately authorized source connections
status: Proposed
date: "2026-11-09"
deciders: [Maintainer]
---

<!-- markdownlint-disable-next-line MD025 -->
# ADR-0011: Preserve verified access

## Context

The maintainer rejected repeated fifteen-to-thirty-minute login prompts, reconnecting GitHub after login and lost observations, and requested an implemented improvement. The previous process-local credential design loses both sessions and source connections on restart. OIDC and GitHub refresh-token mechanisms already exist; another client-side token manager would duplicate them.

## Decision

The development candidate retains opaque owner sessions and the separately authorized GitHub grant in protected local persistence. Use the existing SQLite dependency and ASP.NET Data Protection, with separately provisioned private session and key directories. Keep this store separate from the command journal. Bind a retained source grant to the exact configured provider/client/subject and GitHub App/client; it never establishes owner admission.

Use a two-hour idle limit and a twelve-hour original-authentication limit for this candidate, with five-minute online provider revalidation. Refresh cannot move the original absolute deadline, and background observation polling cannot count as user activity. The development realm uses matching SSO bounds; external-provider constraints remain authoritative and external mode retains MFA.

After restart, require online provider validation before protected access and current source identity/permissions before source operations. A newly admitted session for the same operator can reuse the retained source grant after verification. Local sign-out ends that owner session; explicit source disconnect or recognized source revocation prevents retained-grant reuse. Serialize shared source refresh and preserve cancellation, account-replacement and generation checks.

Session/reference rotation and removal must survive restart. Missing, unsafe, corrupt or unavailable credential storage blocks access; credentials never fall back to the operator CLI, an installation token or browser storage.

This proposal extends credential custody under ADR-0007. It leaves ADR-0006 execution ownership and ADR-0008 command intent/claim semantics intact. Its acceptance is distinct from implementing and exercising the development candidate.

## Alternatives considered

- **Only increase timeouts:** leaves restart loss and repeated GitHub consent unresolved.
- **Only persist session records:** loses the source connection when a session expires and a new one is created.
- **Store tokens in the browser:** expands credential exposure and duplicates existing provider renewal.
- **Introduce a remote identity/session service:** adds an operational dependency without evidence of need for the initial single-instance deployment.

## Consequences

Operators must provision private persistence and preserve its key ring. Losing keys requires fresh authentication/consent. Existing process-local sessions cannot be migrated from an old running binary; the first upgrade requires one fresh login/link. Wider deployments still need explicit custody, backup, concurrency and recovery qualification under #58. A single-host development proof does not establish enterprise readiness.

## References

- [Requested access-continuity Product Change](../../product/changes/active/chg-access-continuity-001/change.md)
- [Identity implementation](../../../src/SoFa.Modules.Workspace/Identity/)
- [Separate GitHub authority](../../../src/SoFa.Modules.Workspace/Source/GitHubAuthorization.cs)
- [Development identity operation](../../runbooks/development-identity.md)
- [External identity boundary](0007-shared-identity-custody-and-recovery.md)
- [Independent command journal](0008-source-correlated-issue-commands.md)
