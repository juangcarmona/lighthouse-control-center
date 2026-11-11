---
pdac-scope: cited
---

# Tasks

## 1. Source-backed navigation

- [x] 1.1 Add authenticated routes, shared navigation and fleet/project/run views; verify route, permission-loss, exact-source and read-only tests and document limits.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## 2. Honest presentation

- [x] 2.1 Explain supported metadata and missing families; test partial/stale/unavailable states, keyboard and accessibility and retain desktop/390px light/dark screenshots.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 3. Integration verification

- [ ] 3.1 Run policy checks, strict OpenSpec and citations; retain receipts, source-linked observation and retrospective and report missing human acceptance.

The recovered candidate passed JavaScript and .NET tests, strict OpenSpec, citations, documentation, security, ProductShape and architecture checks. Browser checks passed for Health, account and shared navigation at desktop and 390px, including light/dark screenshots and axe. The container profile cannot run locally without a host-provisioned `SOFA_TEST_DATABASE`; hosted exact-head CI must exercise that gate. Real connected-source observation and owner visual/content acceptance remain outstanding; fixture success does not resolve these boundaries.

## Workflow follow-up

- Owner reviews visual/content evidence and confirms connected-source behavior.
- Host independently verifies the clean candidate; forge CI and integration remain separate.
