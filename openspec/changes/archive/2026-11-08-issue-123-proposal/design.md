---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation. The selected 1280×640 source shows a lighthouse on the left, coastal village, boats and a foreground sofa on the right. The maintainer supplied the Loira reference photograph during review. The installed UI package already supplies semantic tokens to the observation shell and authenticated workspace. Existing verification inputs are frozen.

## Goals / Non-Goals

**Goals:** deliver reviewable identity sources, practical exports, crop previews and a faithful shell rehearsal; preserve all originals and publish the approved banner in the three documentation READMEs.

**Non-Goals:** no automatic visual publication, namespace migration, authentication change, new theme engine, layout rewrite or modification of frozen tests/checks.

Keyboard and narrow-layout rehearsal preserves QR-MOBILE-OPERATIONS; physical-phone authentication and source operations are not claimed by this preview.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Decisions

1. Use an additive candidate directory rather than overwrite the selected original. After the maintainer rejected the SVG reconstruction, edit the original raster using the supplied Loira photograph only for bench shape. Preserve its blue angular illustration style. The exact corrected banner has now received maintainer acceptance; retain raster provenance and editable wordmarks separately.
2. Fetch the two public canonical SVGs from the issue-pinned upstream revision and preserve their bytes. Compose wordmarks around those originals without changing mark geometry. Record URLs and SHA-256 digests. Do not invent an upstream license grant.
3. Keep artwork palette values in illustration sources; interface styling references only installed semantic roles. Use the existing shell HTML/CSS/JS for an isolated local preview, applying only identity copy and mark changes in the preview renderer. No new application route or active icon/manifest reference is installed before approval.
4. Export PNGs and multi-size ICO using Chromium through Playwright and Node. Keep generation deterministic in dimensions and inputs, with no network dependency after the canonical sources are retained. Avoid adding image libraries or changing package locks.
5. Put identity-specific checks beside the preview tooling, outside frozen verification inputs. Test canonical-source hashes, output dimensions, crop-safe content, absence of legacy wording in new visible assets, responsive themes, keyboard focus and axe accessibility. Existing checks run unchanged.

## Risks / Trade-offs

- [Reference and acceptance] → The supplied Loira photograph informed the accepted banner. Other identity assets retain their separate review boundary.
- [Stylized recreation differs from selected raster] → Retain the original beside review previews; owner judges viewpoint and atmosphere.
- [Small favicon detail] → Export full canonical geometry at 16/32/48 pixels and present enlarged size samples for human inspection.
- [Preview is not activation] → Document exact existing surfaces and publication steps; leave activation tasks unfinished until approval.
- [Browser/font raster differences] → Retain editable SVG and pinned source hashes; record Chromium-produced dimensions, not cross-platform pixel equality.

## Migration Plan

Review the candidate board, shell themes and crops. Banner acceptance is recorded for `084436060f9ac820ad6c278fefc1b1c3fe79e77b`; publish it in the root, architecture and product READMEs in this increment. Registering favicon/touch assets in both hosts, updating authenticated page copy and activating the shell identity remain a reviewed follow-up under #123. Rollback restores those references; originals remain intact. No data migration.
