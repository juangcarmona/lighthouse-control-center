---
id: ACT-RUNTIME-PROVIDER
type: actor
title: Independent runtime provider
status: draft
actor-kind: external-system
---

## Purpose

Operate and report the actual execution infrastructure to which Control Center connects.

## Goals

Expose supported inventory, telemetry and administrative operations under its own credentials and policies.

## Responsibilities

Enforce provider-side grants, resource limits, lifecycle transitions and operation outcomes.

## Boundaries

The provider does not define Lighthouse delivery semantics. Provider acknowledgement alone does not establish a completed infrastructure change or mission delivery.
