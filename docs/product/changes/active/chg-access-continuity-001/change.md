---
id: CHG-ACCESS-CONTINUITY-001
type: product-change
title: Keep verified access and source connections across return visits
status: draft
base-revision: '6c2a8e24fea9a1c01f3c5eb04ed147e1a352490d'
operations:
  add: []
  modify: [UC-ACCESS-FACTORY]
  remove: []
---

## Problem

Short application sessions and process-local source connections repeatedly interrupt ordinary work. A new login can leave an operator without their observations and require GitHub consent again. The entrypoint can ask an already admitted operator to sign in. Returning to a page discards previously collected display data.

## Intended Product Outcome

Return visits keep the operator's verified access and separately authorized source connection within explicit lifetime and revocation boundaries. The application opens a concise operational summary. Source data and actions remain subject to current identity, repository and provider authority.

## Rationale

On 2026-11-09 the maintainer explicitly rejected login every fifteen to thirty minutes, repeated GitHub connection, lost observations and opaque blocked comments, and requested an implemented improvement. This overlay records that requested behavior; it does not claim baseline acceptance or production qualification.

## Affected Product Areas

Authenticated entry, session continuity, separately connected GitHub identity and restored display observations. Existing actors, external authorities and repository workflow ownership are retained.

## Open Questions

None about the requested outcome. Deployment custody and wider operator policies remain separate work under #58.

## Product Acceptance

A valid returning operator opens the operational summary. A restart preserves a valid session. Reauthentication of the same operator reuses the independently retained GitHub grant after source verification. Sign-out ends local authority; explicit disconnect or recognized revocation prevents source-grant reuse. Restored rows cannot authorize an action.

## Out of Scope

Repository scheduling, workflow lifecycle, automatic consent, operator-token fallbacks, public access, infrastructure commands and production readiness. Session storage, renewal intervals and implementation evidence belong to architecture and delivery.
