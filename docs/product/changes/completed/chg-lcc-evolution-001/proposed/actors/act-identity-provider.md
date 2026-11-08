---
id: ACT-IDENTITY-PROVIDER
type: actor
title: External Control Center identity provider
status: draft
actor-kind: external-system
---

## Purpose

Authenticate the person accessing Control Center through the configured external identity authority.

## Goals

Provide a verifiable identity without Lighthouse Control Center operating its own password directory.

## Responsibilities

Supply identity and authentication evidence within the configured trust boundary, and make authentication failures explicit.

## Boundaries

Provider identity does not establish GitHub repository access, permission to request a stage, a human approval or domain authority in another application. Control Center remains responsible for admitting only its explicitly configured identities and scopes, protecting its sessions and checking the actual repository or provider action authority.
