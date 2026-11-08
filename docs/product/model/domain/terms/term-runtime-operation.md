---
id: TERM-RUNTIME-OPERATION
type: domain-term
title: Runtime operation
status: draft
defined-in: BC-RUNTIME-OPERATIONS
synonyms: []
uses-terms:
- TERM-RUNTIME-PROVIDER
- TERM-RUNTIME-POOL
---

## Definition

An explicitly authorized request to change a named provider resource, recording target, parameters, actor, authority, current state, impact and confirmed provider outcome.

## Distinguish From

A prepared request or accepted API response is not a completed operation. Infrastructure administration does not grant repository lifecycle or mission authority.

## Usage

Supported scaling, drain, maintenance and recovery actions expose denial, pending, uncertain, failed and independently verified states.
