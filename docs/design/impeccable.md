# Design workflow with Impeccable

Impeccable is a design aid for Control Center's web interface. The installed
project skill is version 4.10.0; update it with the upstream installer and review
the resulting changes. Reload the coding tool after installation or update.

## Context and authority

Impeccable's context loader discovers the two small adapters in `.agents/context/`.
They direct the agent to the actual sources; they are not copies of product or
design truth. Before design work, read the relevant ProductShape artifacts, the
[Lighthouse design guide](DESIGN.md), and the [Control Center visual contract](control-center.md).
The authenticated workspace is an **Operate** surface. Choose a mode separately
for any other surface.

ProductShape owns product intent, and intent changes through a Product Change.
ArcShape owns architecture. The Lighthouse UI package owns its generated guide
and tokens; the visual contract owns this product's composition. Resolve any
conflict in favor of those sources and the repository instructions.

Impeccable's usual context fields already have owners here:

| Context | Canonical source |
| --- | --- |
| Users, roles and their jobs | [ProductShape actors](../product/model/actors/) and [journeys](../product/model/journeys/) |
| Capabilities, limits and outcomes | [ProductShape requirements](../product/model/requirements/), [use cases](../product/model/use-cases/) and [business rules](../product/model/business-rules/) |
| Implemented structure and constraints | [Architecture](../architecture/README.md) and the relevant [specifications](../../openspec/specs/) |
| Brand, visual roles and composition | The Lighthouse guide and Control Center visual contract linked above |

For this repository, bypass Impeccable's `init` and `document` write steps,
including when a build or finish workflow calls them. Do not generate, overwrite,
or replace product or design context as a prerequisite for design. Update the
canonical source through its owner workflow when the user has authorized that
change; keep the adapters as pointers. A surface brief, critique snapshot, or
other Impeccable artifact is optional working evidence and cannot create product
requirements or supersede the design contract. Never write through a link to a
managed source. If a command requires its own generated metadata, treat it as
non-authoritative and report what is unavailable rather than inventing values.

The detector cannot extract Lighthouse token values from these pointers. Its
checks for documented design-system values therefore do not establish token
conformance. Run Lighthouse's checks and inspect rendered screens as well.

## Iteration

1. Choose a specific route or workflow and inspect the implementation, applicable
   ProductShape artifacts and rendered interface. Capture desktop and narrow
   layouts in light and dark themes.
2. Use `$impeccable critique` for hierarchy and usability, and `$impeccable audit`
   for accessibility, responsive behavior and other technical findings. Rank
   findings against the operator's tasks and source-evidence boundaries.
3. Use `$impeccable shape` for a proposed redesign and work within the existing
   visual contract. Preserve real content, action authority and interaction states.
4. Run the Impeccable detector on changed UI files as advisory feedback. Evaluate
   findings against the visual contract; a generic detector preference does not
   override a deliberate Lighthouse design decision. Source scans do not replace
   checks on rendered pages.
5. Complete the browser, visual and functional verification in the
   [visual contract](control-center.md), along with repository verification.
   Review actual screenshots and report failures or missing evidence explicitly.

The project installation does not enable an automatic design hook. Run the detector
explicitly after UI edits:

```sh
.agents/skills/impeccable/scripts/impeccable detect --json --changed
```

For a rendered page, pass its local URL to `detect` and inspect the result in a
browser. Follow upstream guidance for live mode and avoid using it against deployed
sites. Do not treat fixture results as connected-user acceptance.
