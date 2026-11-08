# Lighthouse Control Center identity candidate

**Unpublished draft for issue #123.** No existing artwork, README banner or application reference has been replaced. The maintainer must accept the exact rendered candidate before activation. The Loira photograph mentioned by the issue was not included in this run; the rear-view slatted bench is a composition proposal, not a verified match to that photograph.

## Provenance and editable sources

- Selected composition: `../socialpreview_1.png`, owner-selected in issue #123, preserved by PR #125 at `ba4228f67deb943bb91cab9cbbe252de3d1ee048`. SHA-256: `65784f3108c66c9121c7a25e8746087ec72712db4a30fc514bdfe440a67e4f26`.
- Canonical marks: [dark-surface source](https://github.com/juangcarmona/lighthouse/blob/e6ea62ab0184f517ab2653d3a91c3a90a1d8b567/assets/lighthouse-icon.svg) and [light-surface source](https://github.com/juangcarmona/lighthouse/blob/e6ea62ab0184f517ab2653d3a91c3a90a1d8b567/assets/lighthouse-icon-light.svg), Juan García Carmona / Lighthouse, revision `e6ea62ab0184f517ab2653d3a91c3a90a1d8b567`. Local files retain upstream bytes; their hashes are asserted in `src/identity/identity.test.mjs`. Reuse follows the maintainer's issue brief; this document grants no new trademark or asset license.
- `bench-banner.svg` is the editable illustration source authored for this issue. It reconstructs the selected coastal viewpoint rather than modifying or obscuring the original raster. Wood is rendered as open horizontal slats with no sofa upholstery. The illustrated coastal lighthouse is scenery, not a substitute application mark.
- `wordmark-dark.svg` / `wordmark-light.svg` embed the complete canonical source as a data URI, preserving geometry and proportions. Export code owns the text composition. System fonts are retained as editable text; font rasterization can differ by platform.
- UI styling consumes installed `@juangcarmona/lighthouse-ui` 0.2.1 and its DESIGN.md/tokens.css unchanged. No package/profile update or alternate color system. Artwork colors use the upstream night/navy/blue palette, plus wood tones confined to illustration.

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
| `bench-banner.svg`, `readme-banner.png` | 1280 × 640 | Editable banner and README export |
| `social-preview.png` | 1200 × 630 | GitHub social preview, centered cover crop |

The 2:1 and 1200:630 crops retain the name, left lighthouse, boats and bench. Only about 30.5 source pixels are removed from each horizontal edge for social output. No arbitrary square or ultrawide crop is promised. Review small favicon samples at native size; automated dimension checks do not establish recognizable detail.

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
node src/identity/export.mjs
node --test src/identity/identity.test.mjs
node src/identity/check-browser.mjs /output/evidence/identity
node src/identity/preview.mjs
```

Open the printed loopback URL for the review board and `/shell` for the shell fixture. Stop the local preview with Ctrl+C. The renderer binds only loopback on an allocated port, reads an explicit asset map, and uses fixed fictitious observations. It never contacts GitHub or an identity provider. The export/check commands start and stop their own preview servers and browser workers. In the harness, run each through its managed-command wrapper.

## Required maintainer decision

Supply or identify the Loira reference photograph and accept/reject the exact bench composition, coastal atmosphere, wordmarks, native-size favicon and supported crops shown in the evidence board. Record accepted filenames/revision. Until then, tasks for visual acceptance and live reference activation remain unfinished, and this delivery is blocked rather than publication-ready.
