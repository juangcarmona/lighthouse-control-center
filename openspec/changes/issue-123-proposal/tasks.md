---
pdac-scope: cited
---

# Tasks

## 1. Identity candidate

- [x] 1.1 Preserve selected/original artwork and retain canonical upstream marks with provenance; verify original and canonical SHA-256 hashes.
- [x] 1.2 Deliver preserved-original raster bench edit with prompt/provenance, editable light/dark wordmarks and practical icon/banner/social exports with inventory and reproduction instructions; verify dimensions, transparency and crop previews with identity checks.

## 2. Shell rehearsal

- [x] 2.1 Provide an isolated preview of the existing shell using candidate identity and installed tokens without active reference changes; verify light/dark/system, narrow layout, focus and accessibility with browser evidence.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## 3. Integration and acceptance

- [ ] 3.1 Run required installation, container verification and strict OpenSpec validation; retain terminal receipts and a retrospective.
- [ ] 3.2 Obtain maintainer visual acceptance against the supplied Loira photograph and exact rendered assets; verify an explicit owner acceptance record.
- [ ] 3.3 Activate accepted README/social/icon and application identity references only after acceptance; verify both application hosts and applicable browser checks on the activated candidate.

Verification attempted: installation and strict OpenSpec passed. Container verification passed lint, 51 Node tests, security, product validation/integrity/doctor, specifications, citations and architecture, then .NET restore failed with ENOSPC. The separately attempted existing browser suite also could not start due to ENOSPC. Dedicated identity browser checks passed with rendered evidence. Task 3.1 remains open because complete verification did not pass. No visual acceptance exists; tasks 3.2 and 3.3 remain open.

## Workflow follow-up

- Host independently verifies the candidate and opens a draft while required visual review is pending.
- Required forge CI, authorized review and integration remain separate; no merge or publication is inferred from local checks.

## Maintainer correction

The first SVG reconstruction was rejected for losing the original illustrated style. It is retained as superseded evidence, while the gallery and export pipeline now use `bench-banner-edited-v2.png`: an edit of the preserved original coastal artwork, informed by the supplied Loira bench photograph. The raster scene is not claimed as editable vector art; wordmark/canonical mark sources remain SVG. Exact candidate visual acceptance and activation remain tasks 3.2/3.3.

## Current verification receipt

The operator reran `npm ci --ignore-scripts`, installed Playwright Chromium, exported both corrected crops and canonical icons, and passed the three identity tests and gallery/six shell accessibility, focus and overflow combinations. Full `npm run verify` then passed: 51 Node, 112 workspace, 38 retained runtime and 18 browser tests. This supersedes ENOSPC as a current blocker; the original failed attempt remains historical. See `docs/delivery/evidence/issue-123/candidate-v2/`. New-head hosted checks remain required.
