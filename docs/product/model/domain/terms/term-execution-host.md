---
id: TERM-EXECUTION-HOST
type: domain-term
title: Execution host
status: draft
defined-in: BC-RUNTIME-OPERATIONS
synonyms: []
uses-terms:
- TERM-RUNTIME-PROVIDER
---

## Definition

A physical or virtual compute environment hosting runners, containers or agent runtimes, with its own resource and maintenance lifecycle.

## Distinguish From

A host may have several runner registrations and agent runtimes. Neither registration nor process existence establishes usable capacity.

## Usage

Host inventory and resource observations correlate only through explicit provider identities.
