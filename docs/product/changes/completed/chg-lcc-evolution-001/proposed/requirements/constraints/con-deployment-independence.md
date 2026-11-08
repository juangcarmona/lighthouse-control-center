---
id: CON-DEPLOYMENT-INDEPENDENCE
type: constraint
title: Deploy the same product independently of personal infrastructure
status: draft
applies-to:
- BC-PORTFOLIO-PROJECT-CONFIGURATION
- BC-RUNTIME-OPERATIONS
- BC-ENGINEERING-HEALTH
---

## Constraint

Lighthouse Control Center MUST be self-hostable by a new operator using explicit configuration for identity, repositories, providers and protected storage. Product contracts MUST support one machine, several hosts and multiple provider types without embedding personal identities, hostnames, networks or a cloud. A personal deployment MUST remain operationally simple. Lighthouse MUST remain usable without Control Center.

## Rationale

The product serves independent operators and organizations while validating its contracts first against one host.

## Consequences

Team access and provider capabilities require explicit grants. Large fleets and additional providers require measured acceptance before readiness claims; extensible contracts alone do not establish enterprise readiness.
