---
pdac-scope: cited
---

## Purpose

Define engineering verification behavior for the independent repository delivery toolchain, preserving the accepted boundary that SoFa is an optional observer and verifier.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## ADDED Requirements

### Requirement: Portable executable scanner cache

On non-Windows systems the scanner SHALL use an absolute XDG_CACHE_HOME when supplied and otherwise retain the home cache; relative values SHALL be ignored. Windows cache behavior SHALL remain unchanged.

#### Scenario: Executable temporary cache in the editing image

- **WHEN** the image supplies XDG_CACHE_HOME=/tmp/cache and the home cache is noexec
- **THEN** the real verified scanner executes from /tmp/cache/sofa and detects/redacts an ignored synthetic secret without relaxing the mount or scan requirements

#### Scenario: Existing cache defaults

- **WHEN** XDG_CACHE_HOME is absent or relative, or the platform is Windows
- **THEN** existing platform cache defaults remain applicable

### Requirement: Independent delivery acceptance

SoFa qualification SHALL retain repository-owned orchestration, independent execution and source-bound verification without depending on the SoFa application service.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

#### Scenario: Blocked native result and operator delivery

- **WHEN** a native author reports blocked but trusted checks pass and an operator finishes that UI delivery
- **THEN** the native result remains blocked and is not counted as native end-to-end qualification

#### Scenario: Real native qualification

- **WHEN** qualification is claimed
- **THEN** a real bounded issue supplies linked independent reviews, trusted checks, App-backed native push CI at the actual head, authorized merge and accepted post-merge completion; an unsuitable grant stops safely
