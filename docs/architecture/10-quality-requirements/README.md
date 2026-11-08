---
title: Quality requirements
arc42-section: "10"
description: Quality goals and concrete scenarios for evaluating them.
---

# 10. Acceptance scenarios

Stop SoFa and run repository refinement: the workflow must publish its result. Refresh an inaccessible repository: the observer must report unavailable evidence. Inspect a run: preparation, execution, validation, publication and cleanup must be distinguishable. Change the issue during execution: publication must stop. A read refresh must never dispatch or cancel work.

<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->

See [ADR-0006](../09-architecture-decisions/0006-observe-repository-owned-workflows.md) for the accepted boundary and superseded design.

## Implemented development evidence and remaining gaps

Owner admission, real middleware callbacks, deadlines, concurrent refresh, source-state isolation and CSRF have deterministic coverage. The host-only provider harness exercises the exact pinned Keycloak image through trusted HTTPS, development password login without OTP, wrong-password/wrong-owner denial, fresh password despite provider SSO, online refresh, revocation and provider outage. Full host CI also checks account UI accessibility using explicitly identified source fixtures. The [provider harness](../../../scripts/verify-identity-provider.mjs) and [tests](../../../tests/SoFa.Web.Tests/) are the evidence owners.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:9f39dd08a392db995a75f26c9a30ed4d4ec43f73ad0ccafbdfaa3d0eabc1528a" -->

Phone-width browser automation remains distinct from a physical device. Actual GitHub App user consent/repository permission and actual-phone reachability/login/link/logout are open delivery acceptance; neither synthetic source fixtures nor issuer discovery satisfy them.

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Proposed delivery acceptance

| Journey boundary | Evidence required |
| --- | --- |
| Authentication and source authority | Actual local Keycloak login through Aspire; denied owner, expired session, CSRF rejection; separately verified GitHub actor |
| Context | Real issue with paginated conversation, previous stage result, missing artifact and stale refresh shown honestly |
| Command | Eligible Refine and Propose, changed-state denial, repeated click, lost response, restart, competing source reservation and exact run mapping |
| Conversation | Ordinary comment on needs-info does not resume; explicit supported reply does; uncertain post creates at most one source comment |
| Independent execution | Close SoFa after source admission and recover the same result after reopening |
| Mobile and accessibility | Complete the real issue journey on a phone over LAN/VPN; keyboard/focus behavior and readable status without color-only meaning |
| Later capabilities | Inbox resolution uses source evidence; search includes non-attention issues; boards preserve scope; signal inputs reproduce a calculation; idea promotion reconciles a lost response |

Fixtures establish deterministic behavior but do not substitute for the real source/mobile acceptance. Run the repository's verify pipeline and preserve relevant screenshots, source identities, run attempts and outcome limitations in the delivery PR. Production recovery is checked independently from the local development demonstration.

## Proposed provider and portability acceptance

These checks realize the [proposed product overlay](../../product/changes/active/chg-lcc-evolution-001/change.md); none is claimed passed by this architecture document.

| Boundary | Independent evidence required |
| --- | --- |
| Identity/source/provider separation | Direct API probes with anonymous, admitted read-only, wrong-project and wrong-provider actors; no dependent mutation and no cross-scope cached data |
| Current-state and occupancy race | Change resource/grant after preview; revoke before provider mutation; busy or unknown work blocks disruption; provider-side fence proven independently |
| Durable effects | Double confirm, two tabs/processes, timeout after provider acceptance, LCC restart and restored audit retain one request or explicit uncertainty without resend |
| Actual provider outcome | Start one allowlisted inactive service and independently read its exact unit/provider state; pending and failed startup stay distinct; no job or mission result inferred |
| Portable configuration | Fresh installation with different owner, origin, paths and provider ID; no original host prerequisite; repository delivery continues while LCC is stopped |
| Capability extensibility | Local actual provider plus Kubernetes/VMSS doubles with asynchronous scaling, unavailable telemetry and unsupported drain; no change in mission/lifecycle semantics |
| Metrics and telemetry | Duplicate events, partial token fields, cursor loss, expired artifact, malformed producer, missing incident/deployment/cost data and incomparable windows retain explicit coverage |
| Fleet scale | Pagination/rate-limit/failure-isolation checks at a declared repository/sample count and collection budget before any scale claim |

The first real source journey and per-gate evidence are in the [vertical slice](../../delivery/plans/116-lcc-first-vertical-slice.md). Existing recorded physical-phone waivers remain valid; responsive browser evidence cannot be described as a device rehearsal.
