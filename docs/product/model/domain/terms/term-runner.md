---
id: TERM-RUNNER
type: domain-term
title: GitHub Actions runner
status: draft
defined-in: BC-RUNTIME-OPERATIONS
synonyms: []
uses-terms:
- TERM-EXECUTION-HOST
---

## Definition

A scoped GitHub runner registration and its observed lifecycle, availability and source-confirmed job assignments.

## Distinguish From

A runner registration is distinct from its host, an agent runtime, a model provider and the individual job or execution.

## Usage

Runner/job correlation uses scoped source IDs; labels or matching display names alone do not establish identity.
