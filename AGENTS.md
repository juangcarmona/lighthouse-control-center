# Lighthouse Control Center repository instructions

Read [README.md](README.md) and [docs/README.md](docs/README.md) before making changes. Read the relevant ProductShape and ArcShape documents before changing product behavior or architecture.

## GitHub target verification

Before a GitHub write, run `node scripts/check-repository-target.mjs <owner/repository>` from this checkout. Require success and use the returned canonical repository and numeric ID in the action and any delegated handoff. The expected target comes from `.lighthouse/github.json`; verify the issue/PR title and current state in that same repository before changing it. A mismatch or unavailable identity stops the write. A cross-repository task needs an explicitly authorized target and verification from that repository's checkout. Issue numbers alone are not a target.

## Sources of truth

- Product intent belongs to ProductShape under `docs/product/`. Change it through a Product Change; do not edit an accepted model directly. The applied LCC product definition governs fleet observation, missions and independently authorized runtime operations. GitHub workflows and an independent runtime own execution; Control Center remains optional to repository delivery.
- Architecture belongs to `docs/architecture/` and explains how the implementation realizes accepted product intent. Use ArcShape's generated structure and the installed `architecture-docs` skill. Do not invent product requirements or architectural facts.
- Significant architecture decisions belong in `docs/architecture/09-architecture-decisions/` through the ArcShape ADR workflow.
- Implementation and tests belong under `src/` and `tests/`.

## Working agreements

- Keep product definition changes distinct from implementation plans and delivery work.
- Keep generated ProductShape, ArcShape, and shared skill files under their installers' ownership. Update them through the relevant CLI or installer.
- Do not choose an application framework, runtime, domain model, or deployment shape until product intent and architecture have been established.

## Architecture skill ownership

- Use `arcshape-adr` to create and maintain decision records under `docs/architecture/09-architecture-decisions/`. It owns the ADR shape, status, history, numbering, index, and maintainer review boundary for this repository.
- Use `architecture-docs` to maintain the common arc42 views. It owns evidence classification, product-intent boundaries, architecture citations, migration, and review of architecture claims.
- Use `arcshape-adr` as the repository's standalone ADR workflow. The shared `adr` skill is not installed here.
- Use `arcshape-architecture` for ArcShape evidence sessions, selective arc42 reference guidance, CLI validation, and reader builds. Follow `architecture-docs` for common documentation policy when both are installed.
- Keep these skills complementary: architecture documentation describes the realized system, while ADRs preserve the rationale for durable choices. A proposed ADR is not current architecture until accepted.

## Autonomous continuation

For unattended work, read [the current delivery grant](docs/runbooks/lighthouse-unattended.md). Use the existing Lighthouse entrypoints and exact issue policy; retain source-bound independent review, required CI and protected human decisions.

## Validation

For every interface change, read [the Lighthouse design guide](docs/design/DESIGN.md) and [the Control Center visual contract](docs/design/control-center.md). Use the Lighthouse website as the visual reference for shell, density, typography and component shape. Verify the changed screen in light/dark and narrow/desktop layouts with the visual and browser checks. Token usage and green accessibility checks alone do not establish visual conformance. For an action, separately prove its source result or report the exact unresolved failure; a visible disabled form is not a working action.

Use `npm run verify` for the scaffold's deterministic checks. Update it and the CI workflow when new build, test, lint, or security tools are adopted. Report checks actually run and any known limitations.
