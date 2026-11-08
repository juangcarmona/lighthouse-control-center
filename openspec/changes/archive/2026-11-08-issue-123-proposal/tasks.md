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

- [x] 3.1 Run the full local verification and strict OpenSpec validation; retain results below. Native independent container checks and exact-head CI remain mandatory integration gates; retrospective follows integration.
- [x] 3.2 Obtain maintainer acceptance of the exact corrected banner, recorded below. Wordmark/favicon/application acceptance is deferred to the remaining #123 increment.
- [x] 3.3 Activate only the approved banner in the root, architecture and product READMEs. Social settings, icons and both application hosts are explicitly deferred under #123.

Historical first attempt: installation and strict OpenSpec passed. Container verification passed lint, 51 Node tests, security, product validation/integrity/doctor, specifications, citations and architecture, then .NET restore failed with ENOSPC. The separately attempted existing browser suite also could not start due to ENOSPC. Dedicated identity browser checks passed with rendered evidence. That first attempt did not pass complete verification and had no visual acceptance; the later receipts and maintainer decision below supersede those blockers.

## Workflow follow-up

- Host independently verifies the candidate and opens a draft while required visual review is pending.
- Required forge CI, authorized review and integration remain separate; no merge or publication is inferred from local checks.

## Maintainer correction

The first SVG reconstruction was rejected for losing the original illustrated style. It is retained as superseded evidence, while the gallery and export pipeline now use `bench-banner-edited-v2.png`: an edit of the preserved original coastal artwork, informed by the supplied Loira bench photograph. The raster scene is not claimed as editable vector art; wordmark/canonical mark sources remain SVG. The later owner decision accepts the corrected banner; application identity activation remains deferred.

## Current verification receipt

The operator reran `npm ci --ignore-scripts`, installed Playwright Chromium, exported both corrected crops and canonical icons, and passed the three identity tests and gallery/six shell accessibility, focus and overflow combinations. Full `npm run verify` then passed: 51 Node, 112 workspace, 38 retained runtime and 18 browser tests. This supersedes ENOSPC as a current blocker; the original failed attempt remains historical. See `docs/delivery/evidence/issue-123/candidate-v2/`. New-head hosted checks remain required.

## Approved documentation banner increment

On 2026-11-08, the maintainer accepted the exact corrected banner at `084436060f9ac820ad6c278fefc1b1c3fe79e77b`: “Me encanta el banner... Lo quiero en el readme y en arc42 y product shape si se puede”. This authorizes the banner in the three documentation entrypoints, not acceptance or activation of every application identity surface. Earlier pending-banner statements above describe the previous review state.

- [x] Reference the same accepted banner from the root, architecture and product READMEs; preserve original artwork.
- [x] Record the banner acceptance and distinguish it from remaining wordmark/favicon/application acceptance.

The installed ArcShape HTML reader renders Markdown images as placeholders and the installed ProductShape CLI has no snapshot command. The supported increment uses canonical Markdown; no generated files or dependencies are patched. The remaining identity surfaces stay tracked in #123, which must stay open after this documentation increment. This scoped plan covers candidate preparation and the approved documentation banner; it does not declare the full issue delivered.

Full local `npm run verify` passed again after the documentation references and identity-test adjustment: 51 Node, 112 workspace, 38 retained runtime and 18 browser tests. Three focused identity checks, Markdown lint, strict OpenSpec validation, ArcShape local links, ProductShape doctor and 63 current citations also passed. All three relative image paths resolve to the same existing approved PNG. Native independent checks and hosted CI on the final commit remain separate integration gates.
