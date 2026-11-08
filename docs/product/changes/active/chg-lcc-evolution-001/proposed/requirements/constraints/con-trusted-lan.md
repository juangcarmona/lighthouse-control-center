---
id: CON-TRUSTED-LAN
type: constraint
title: Authenticate the configured operational workspace
status: draft
applies-to: [BC-PORTFOLIO-PROJECT-CONFIGURATION, BC-BACKLOG-TRIAGE, BC-EXECUTION, BC-DELIVERY, BC-RUNTIME-OPERATIONS]
---

## Constraint

The operational Control Center workspace MUST require authentication through the configured external identity provider for reading as well as acting. It MUST support desktop and phone through protected transport in the operator's selected deployment. LAN or VPN is the initial validation environment. Network reachability MUST NOT establish identity, permission or approval.

Privileged operations MUST pass a separately defined and verified server authorization boundary and the applicable repository or runtime provider controls. The existing anonymous observation implementation MUST NOT acquire write privileges through deployment or configuration alone. Its replacement by the authenticated workspace requires the reviewed security design.

## Rationale

The fleet must be operable from a phone without extending trust to every device on the network or every account at an identity provider.

## Consequences

Loopback-only control is no longer the product requirement. Identity-provider trust, session policy, source-account linking and protected transport must be established before enabling operations. A wider network or multiple identities require independently verified deployment and scope policies; personal deployment defaults grant no additional authority.
