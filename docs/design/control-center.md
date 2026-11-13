# Control Center visual contract

The maintainer selected [the Lighthouse website](https://lighthouse.jgcarmona.com/) as Control Center's visual reference. Apply the installed [Lighthouse guide](DESIGN.md) together with this product composition. Lighthouse's UI package owns the generated guide and tokens; maintain this supplement in the product repository.

## Reference and composition

Use Lighthouse's compact engineering workspace: a 184px navigation rail that can collapse to 60px on desktop, one 48px header, and content that uses the remaining width. On narrow screens navigation remains accessible without horizontal page overflow. Account, Operations, Fleet, Issues, Attention and Runtime share that identity. Navigation represents actual available routes and authority.

- Use Lighthouse's real lighthouse mark. Preserve the accepted bench banner separately; a letter monogram does not replace the mark.
- Match the website's 15px interface typography, restrained heading scale, monospace metadata and blue/night semantic palette. Do not enlarge body text to fill a panel.
- Use the website's nearly square 2px component edges, thin boundaries and compact field/button variants. Use compact 32px desktop controls, matching the public Lighthouse theme buttons (2.35rem wide by 2rem high). On coarse pointers retain targets at least 44px wide and high, with visible keyboard focus.
- Use alignment and concise grouping to distinguish a comment, a Lighthouse operation and its outcome. Explain a shared failure once beside the affected controls; reserve individual explanations for distinct action restrictions.
- Preserve the same hierarchy and legibility in light, dark and system appearance. Semantic tokens provide colors; they do not by themselves provide a conforming composition.
- Use the reference's sun, moon and system segmented buttons on every screen; retain the chosen appearance across navigation and reload. Use consistent line icons beside navigation labels and the canonical lighthouse favicon.
- The authenticated entry opens the operational overview. Lead with work needing attention, active workflows and projects with direct issue access. Keep source coverage inspectable in a disclosure; workflow activity remains distinct from mission delivery.
- Put technical identifiers, exact timestamps, revisions and permission diagnostics in labelled disclosures. Primary rows show the project, useful title, state and next action. Prefer compact rows to nested explanatory panels.
- Returning to a page restores bounded display data after verifying its current owner/account scope, then refreshes in the background. Show that restored data needs refreshing. Cache display projections only; source actions always recheck current authority.
- Keep a local comment draft editable while submission checks are unavailable. Explain the concrete blocking reason beside the send/review control and provide its recovery action. Clear the draft when the verified actor or repository scope changes.
- Underline recovery links inside explanatory text in both themes. Color alone must not distinguish a link from its surrounding hint.

The website's composition is implemented in [Lighthouse's public-site stylesheet](https://github.com/juangcarmona/lighthouse/blob/main/src/public-site/site.css); its native control recipes come from the installed `@juangcarmona/lighthouse-ui` package. Public landing-page prose and promotional hero dimensions are not application requirements.

### Health composition

Use [Platform Project Health](https://health.platform.plainconcepts.dev/) as the interaction and information-hierarchy reference for `/workspace/health`: a fleet summary, work needing investigation, compact project comparison, useful filters, and a project view grouped by delivery, engineering, agentic/code and resource evidence. Its published numbers are demonstration data. Reuse Control Center's Lighthouse tokens, shell and source vocabulary; source-backed measurements and levels only appear when their own producers and definitions exist. Show PRE, PRO and production as unknown until a verified deployment source establishes a target environment. Keep the comparison usable at 390px without horizontal page overflow. The [reference and candidate captures](../delivery/evidence/issue-155/platform-reference.md) document this interpretation and its current limits.

## Verification and completion

Run `npm run test:visual` and the full browser suite for affected routes. Retain desktop and narrow screenshots in both themes. Check actual computed typography, edges, navigation geometry, focus and page overflow in addition to accessibility. Review screenshots against Lighthouse's reference composition before declaring visual conformance.

A functional check must exercise the intended operation through its verified source boundary and inspect the exact outcome. A screenshot of a disabled composer, a synthetic API response, or a successful workflow does not establish a working connected-user action. If the source check fails, expose its safe diagnostic category and fix or identify that specific cause; do not change authority or substitute operator credentials.

## Density and source vocabulary

- Navigation names the source objects: Repositories and Issues. A mission remains a delivery-domain concept; do not relabel an ordinary GitHub issue as a delivered mission.
- `/workspace/repositories` lists repositories; `/workspace/repositories/{owner}/{name}` scopes the issue collection; `/workspace/issues` lists issues across repositories. Keep the legacy factory route as a compatibility alias.
- Give each view one visible page title in the header. Do not stack an eyebrow, title, subtitle, successful connection notice and section title above the same content.
- The first repository or issue row should start within 230px of the viewport top on a desktop. Keep filtering in one compact toolbar; local title filtering reacts as the user types and Enter performs an exact-number lookup.
- Inside a repository, issue rows show `#number · title`; retain repository identity in the route and breadcrumb. Cross-repository rows include the repository to avoid ambiguity.
- Use flat rows with textual status badges and semantic colors. Color never establishes a delivery result. Keep timestamps, coverage, source evidence and uncommon filters inspectable below the primary work.
- Put refresh beside appearance in the shared header. Show the signed-in identity and connection state in the rail, or the compact header on narrow screens. Clear the connected-account claim when authority is lost.
- Issue descriptions use the content width; do not put them in a half-width panel opposite empty evidence, or inside a second vertical scrollbar.
- Keep review progress, explicit confirmation, source result and recovery beside the invoking editor. Bring user-requested results into view with deliberate keyboard focus. A review click must clearly say that nothing has been sent; publication requires a confirmed source receipt.
- Keep long issue descriptions and conversation history independently collapsible. Put the editor before the history, preserve source counts/coverage and pagination, and retain the operator's disclosure choice during same-issue updates. A long thread must not separate an action from its feedback.
