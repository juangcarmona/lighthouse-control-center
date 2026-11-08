---
title: Architecture constraints
arc42-section: "02"
description: Technical, organizational, and convention constraints that shape the architecture.
---

# 02. Independent execution

No SoFa service, store, queue or lease is required by repository delivery. The authenticated application reads source evidence; workflow controls remain source-owned and are not implemented by the identity foundation. The retained Node collector has no mutation authority.

<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->

[ADR-0006](../09-architecture-decisions/0006-observe-repository-owned-workflows.md) owns the execution boundary. [ADR-0009](../09-architecture-decisions/0009-dotnet-and-aspire.md) selects the .NET/Aspire application direction; the existing browser presentation is retained.

## Identity and environment constraints

The server enforces the configured owner and separately verifies source authority. LAN access, a successful identity-provider login and a GitHub account connection do not substitute for one another. Configuration selects one identity profile and rejects mixed credentials; development composes its own provider, while external mode composes no provider.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

The six stages remain triage → refine → propose → implement → integrate → review. A proposed durable journal under ADR-0008 would record application requests, without owning agent scheduling. Production provisioning and protected persistence remain separate release work.

## Proposed LCC extension boundaries

[Proposed ADR-0010](../09-architecture-decisions/0010-administer-independent-runtime-providers.md) extends infrastructure administration without altering ADR-0006 delivery ownership. The [Product Change](../../product/changes/completed/chg-lcc-evolution-001/change.md) defines `CON-DEPLOYMENT-INDEPENDENCE`, modified `CON-FACTORY-RUNTIME` and `BR-PROVIDER-OPERATIONS`. ProductShape applied the maintainer-approved delta on this branch; the citations above bind its retained delivery and identity boundaries. Provider implementation and ADR-0010 acceptance remain separate.

The first deployment remains one .NET application with optional development Keycloak composition. No scheduler, event broker, extra database or cloud provider is required. Runtime control cannot grant Lighthouse stage, merge or deployment authority. Infrastructure credentials do not enter repository code, agent containers or browser content. Protected configuration supplies identity, origin, callback, source and provider scope; no personal host or network constant becomes an API contract.
