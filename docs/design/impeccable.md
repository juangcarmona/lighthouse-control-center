# Design workflow with Impeccable

Impeccable is a design aid for Control Center's web interface. The installed
project skill is version 4.10.0; update it with the upstream installer and review
the resulting changes. Reload the coding tool after installation or update.

## Authority and context

Start with the accepted [ProductShape model](../product/README.md), the
[Lighthouse design guide](DESIGN.md), and the [Control Center visual contract](control-center.md).
The operator's authenticated workspace is an **Operate** surface: prioritize
finding work, understanding source evidence and completing authorized actions.
Select a mode separately for any other surface.

ProductShape owns product intent. The Lighthouse UI package owns its generated
guide and tokens; the visual contract owns this product's composition. Impeccable
context files and surface briefs are aids, not replacement authorities. Reconcile
any disagreement with those sources before changing the interface. Product
behavior changes still follow the Product Change and Lighthouse delivery process.

Impeccable looks for `PRODUCT.md` and `DESIGN.md` in supported context locations;
it does not automatically discover `docs/design/DESIGN.md`. Run `$impeccable init`
with the maintainer before a redesign or a new surface, and make its product
context refer to the accepted model. Record the existing visual system without
overwriting the Lighthouse-managed guide; any Impeccable design context must point
back to the guide and the visual contract. Review generated context for drift.

## Iteration

1. Choose a specific route or workflow and inspect the current implementation and
   rendered interface. Capture desktop and narrow layouts in light and dark themes.
2. Use `$impeccable critique` for hierarchy and usability, and `$impeccable audit`
   for accessibility, responsive behavior and other technical findings. Rank
   findings against the operator's tasks and source-evidence boundaries.
3. Use `$impeccable shape` for a proposed redesign, agree on the direction and
   scope, then implement a bounded surface. Use the targeted refinement commands
   where appropriate. Preserve real content, action authority and interaction states.
4. Run the Impeccable detector on changed UI files as advisory feedback. Investigate
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
