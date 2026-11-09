# Control Center visual contract

The maintainer selected [the Lighthouse website](https://lighthouse.jgcarmona.com/) as Control Center's visual reference. Apply the installed [Lighthouse guide](DESIGN.md) together with this product composition. Lighthouse's UI package owns the generated guide and tokens; maintain this supplement in the product repository.

## Reference and composition

Use Lighthouse's compact engineering workspace: a persistent navigation rail on desktop, a clear current location, a compact header, and a bounded content column. On narrow screens navigation remains accessible without horizontal page overflow. Account, Operations, Fleet, Issues, Attention and Runtime share that identity. Navigation represents actual available routes and authority.

- Use Lighthouse's real lighthouse mark. Preserve the accepted bench banner separately; a letter monogram does not replace the mark.
- Match the website's 15px interface typography, restrained heading scale, monospace metadata and blue/night semantic palette. Do not enlarge body text to fill a panel.
- Use the website's nearly square 2px component edges, thin boundaries and compact field/button variants. Retain 44px interactive targets and visible keyboard focus.
- Use alignment and concise grouping to distinguish a comment, a Lighthouse operation and its outcome. Explain a shared failure once beside the affected controls; reserve individual explanations for distinct action restrictions.
- Preserve the same hierarchy and legibility in light, dark and system appearance. Semantic tokens provide colors; they do not by themselves provide a conforming composition.
- Use the reference's sun, moon and system segmented buttons on every screen; retain the chosen appearance across navigation and reload. Use consistent line icons beside navigation labels and the canonical lighthouse favicon.
- The authenticated entry opens the operational overview. Lead with work needing attention, active workflows and projects with direct issue access. Keep source coverage inspectable in a disclosure; workflow activity remains distinct from mission delivery.
- Put technical identifiers, exact timestamps, revisions and permission diagnostics in labelled disclosures. Primary rows show the project, useful title, state and next action. Prefer compact rows to nested explanatory panels.
- Returning to a page restores bounded display data after verifying its current owner/account scope, then refreshes in the background. Show that restored data needs refreshing. Cache display projections only; source actions always recheck current authority.
- Keep a local comment draft editable while submission checks are unavailable. Explain the concrete blocking reason beside the send/review control and provide its recovery action. Clear the draft when the verified actor or repository scope changes.

The website's composition is implemented in [Lighthouse's public-site stylesheet](https://github.com/juangcarmona/lighthouse/blob/main/src/public-site/site.css); its native control recipes come from the installed `@juangcarmona/lighthouse-ui` package. Public landing-page prose and promotional hero dimensions are not application requirements.

## Verification and completion

Run `npm run test:visual` and the full browser suite for affected routes. Retain desktop and narrow screenshots in both themes. Check actual computed typography, edges, navigation geometry, focus and page overflow in addition to accessibility. Review screenshots against Lighthouse's reference composition before declaring visual conformance.

A functional check must exercise the intended operation through its verified source boundary and inspect the exact outcome. A screenshot of a disabled composer, a synthetic API response, or a successful workflow does not establish a working connected-user action. If the source check fails, expose its safe diagnostic category and fix or identify that specific cause; do not change authority or substitute operator credentials.
