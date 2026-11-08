# Lighthouse Control Center identity candidate

**Unpublished draft for issue #123.** No existing artwork, README banner or application reference has been replaced. The maintainer must accept the exact rendered candidate before activation. The maintainer rejected the first reconstructed banner because it lost the original illustration style. The corrected `bench-banner-edited-v2.png` edits the preserved original using the supplied Loira photograph as a bench-shape reference. It is still awaiting acceptance.

## Provenance and editable sources

- Selected composition: `../socialpreview_1.png`, owner-selected in issue #123, preserved by PR #125 at `ba4228f67deb943bb91cab9cbbe252de3d1ee048`. SHA-256: `65784f3108c66c9121c7a25e8746087ec72712db4a30fc514bdfe440a67e4f26`.
- Canonical marks: [dark-surface source](https://github.com/juangcarmona/lighthouse/blob/e6ea62ab0184f517ab2653d3a91c3a90a1d8b567/assets/lighthouse-icon.svg) and [light-surface source](https://github.com/juangcarmona/lighthouse/blob/e6ea62ab0184f517ab2653d3a91c3a90a1d8b567/assets/lighthouse-icon-light.svg), Juan García Carmona / Lighthouse, revision `e6ea62ab0184f517ab2653d3a91c3a90a1d8b567`. Local files retain upstream bytes; their hashes are asserted in `src/identity/identity.test.mjs`. Reuse follows the maintainer's issue brief; this document grants no new trademark or asset license.
- `bench-banner-edited-v2.png` is the corrected raster edit source. Its image-generation prompt and provenance are in `banner-edit-v2.md`. The original raster remains intact. `bench-banner.svg` is retained only as the rejected first reconstruction; it is no longer an export or preview input. The illustrated coastal lighthouse is scenery, not a substitute application mark.
- `wordmark-dark.svg` / `wordmark-light.svg` embed the complete canonical source as a data URI, preserving geometry and proportions. Export code owns the text composition. System fonts are retained as editable text; font rasterization can differ by platform.
- UI styling consumes installed `@juangcarmona/lighthouse-ui` 0.2.1 and its DESIGN.md/tokens.css unchanged. No package/profile update or alternate color system. Artwork colors use the upstream night/navy/blue palette, with the bench rendered in the same blue illustrated style as the original scene.

## Asset inventory

| Candidate | Dimensions | Intended use |
| --- | --- | --- |
| `lighthouse-icon.svg`, `lighthouse-icon-light.svg` | 128 × 128 viewBox | Canonical application marks, theme variants |
| `wordmark-dark.svg`, `wordmark-light.svg` | 600 × 128 | Mark plus Control Center wordmark |
| `mark-transparent.png`, `mark-light-transparent.png` | 512 × 512 RGBA | Transparent outside canonical rounded tile; tile background retained |
| `favicon.ico` | 16, 32, 48 px | Multi-resolution browser icon, complete canonical geometry |
| `favicon-16.png`, `favicon-32.png`, `favicon-48.png` | Named pixel sizes | Native-size review and fallback exports |
| `apple-touch-icon.png` | 180 × 180 | Touch icon candidate |
| `icon-192.png`, `icon-512.png` | Named pixel sizes | App icons, purpose `any`, not maskable |
| `site.webmanifest` | JSON | Candidate name/icon inventory only, not an installed PWA |
| `bench-banner-edited-v2.png` | 1774 × 887 | Corrected raster source; original composition edit |
| `readme-banner.png` | 1280 × 640 | README export of the corrected source |
| `bench-banner.svg` | 1280 × 640 | Rejected first reconstruction, retained for history only |
| `social-preview.png` | 1200 × 630 | GitHub social preview, centered cover crop |

The 2:1 and 1200:630 crops retain the name, left lighthouse, boats and bench. The centered social crop removes about 2.38% of the raster source width from each horizontal edge. No arbitrary square or ultrawide crop is promised. Review small favicon samples at native size; automated dimension checks do not establish recognizable detail.

## Existing surfaces and activation boundary

| Existing surface | Current location | Candidate / activation after acceptance |
| --- | --- | --- |
| Repository banner | Root README references `assets/socialpreview_1.png` | Switch reference to accepted `readme-banner.png`; keep original |
| GitHub social preview | Repository setting, not controlled by tracked source | Maintainer uploads accepted `social-preview.png`; no setting changed here |
| Observation shell | `src/web/public/index.html`, `app.css`, `app.js` | Local rehearsal uses these exact sources with identity copy/mark substitutions |
| Historical Node host | `src/web/server.mjs` explicit route map | Register accepted icon routes only in reviewed activation |
| Supported authenticated host | `WorkspaceModule.cs` route map and generated account HTML | Register accepted assets and align account/header copy after approval; identity/session logic stays unchanged |
| Admission/error pages | `Identity/OwnerIdentity.cs` page title | Visible title alignment only after approval; no identity-flow changes |
| Token delivery | `src/SoFa.Web/SoFa.Web.csproj` and host `/tokens.css` | Existing installed package; no edit required |
| Web manifest / favicon / touch references | None currently registered by these shells | Candidate files only; no PWA, start URL, scope or installability claim |
| Legacy artwork | Other files under `assets/` | All preserved; no local candidate selected by filename |

Repository/package/namespace renaming and generated Lighthouse/ProductShape/ArcShape projections are outside this visual increment. The rehearsal intentionally does not activate candidate assets in either host, including authenticated pages.

## Reproduce and review

From repository root after `npm ci --ignore-scripts`:

```sh
npx playwright install chromium
node src/identity/export.mjs
node --test src/identity/identity.test.mjs
node src/identity/check-browser.mjs /output/evidence/identity
node src/identity/preview.mjs
```

Open the printed loopback URL for the review board and `/shell` for the shell fixture. Stop the local preview with Ctrl+C. The renderer binds only loopback on an allocated port, reads an explicit asset map, and uses fixed fictitious observations. It never contacts GitHub or an identity provider. The export/check commands start and stop their own preview servers and browser workers. In the harness, run each through its managed-command wrapper.

## Required maintainer decision

The supplied Loira reference is already available. Accept/reject the exact bench composition, coastal atmosphere, wordmarks, native-size favicon and supported crops shown in the evidence board. Record accepted filenames/revision. Until then, tasks for visual acceptance and live reference activation remain unfinished, and this delivery is blocked rather than publication-ready.
