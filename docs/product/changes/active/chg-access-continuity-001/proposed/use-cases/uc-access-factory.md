---
id: UC-ACCESS-FACTORY
type: use-case
title: Access Control Center with an external identity
status: draft
primary-actor: ACT-OPERATOR
supporting-actors: [ACT-IDENTITY-PROVIDER, ACT-GITHUB-BACKLOG]
bounded-context: BC-PORTFOLIO-PROJECT-CONFIGURATION
governed-by: [BR-LAN-PRIVILEGE-BOUNDARY, BR-WORK-AUTHORIZATION]
uses-terms: [TERM-PROJECT]
---

## Goal

Read and operate the configured fleet from desktop or phone with a verified identity and understandable access boundaries.

## Trigger

The operator opens Lighthouse Control Center or must authenticate again after the current session is no longer valid.

## Preconditions

The trusted identity provider and admitted operator identities/scopes are configured. LAN or VPN access alone is insufficient.

## Main Flow

1. Lighthouse Control Center requires authentication before disclosing protected operational content.
2. The external provider authenticates the person, and Lighthouse Control Center verifies that identity against its configured access boundary.
3. Lighthouse Control Center establishes a renewable, bounded session and opens an operational summary when an already admitted operator returns. It shows the signed-in identity and sign-out action without requiring another sign-in while that session remains valid.
4. When an action needs GitHub access, the operator explicitly connects the intended GitHub account. Lighthouse Control Center verifies the association and the applicable source permissions instead of inferring them from the sign-in identity or matching email addresses.
5. A return visit or application restart preserves the separately authorized GitHub connection for the same verified operator. A new valid application session can reuse that connection after current source verification, without repeating consent merely because the application session expired.
6. The operator opens repository work within the verified access boundary. Previously collected display data can reappear after checking its current identity and repository scope; it remains distinguishable from a fresh source observation.

## Alternative Flows

A valid existing session can continue according to the effective session policy. Provider renewal retains the original absolute lifetime and cannot override revocation. Explicit GitHub disconnect or recognized source revocation removes the retained source connection; application sign-out ends the local session separately. Protected credential storage failure blocks dependent access instead of silently losing the connection or falling back to another identity. Missing or revoked GitHub access requires reconnection or a permission correction and blocks dependent actions with an explanation. Sign-out ends access through that Lighthouse Control Center session; it does not cancel admitted repository executions.

## Failure Conditions

An untrusted identity, wrong provider boundary, missing authentication or expired session cannot read protected content or submit a mutation. Provider failures offer a clear retry path without a local password bypass. Loss of provider availability does not extend session validity. Recognized revocation takes effect according to the defined session policy.

## Postconditions

The operator has authenticated access with an explicit session boundary and a separately verified GitHub connection, or receives an explanation of the missing access. No repository work was requested by signing in or reconnecting.
