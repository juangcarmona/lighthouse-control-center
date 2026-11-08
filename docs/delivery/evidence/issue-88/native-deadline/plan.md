# Native delivery deadline correction

## Observed failure and authority

Native [run 42429047634](https://github.com/juangcarmona/sofa/actions/runs/42429047634) stopped at the 3,600-second route limit during its one allowed candidate correction. Its first trusted verification passed. The candidate reviewer found a real precision defect: a fractional attempt such as `1.00000000000000001` can round to an integer during JSON parsing. Correction began but final trusted verification, candidate acceptance and PR publication did not finish. The attempt remains failed and does not qualify #88.

The owner authorized autonomous completion and necessary technical dependencies and merges for #88/#51/#52/#57. This plan uses that authorization for a bounded operational correction. Product intent, protected publication and production decisions retain their existing owners. SoFa remains an observer; repository workflows own delivery under ADR-0006 and BR-HUMAN-DECISION-BOUNDARIES.

## Proposed change

Adopt the independently reviewed, merged source of [Lighthouse #569](https://github.com/juangcarmona/lighthouse/pull/569) through the installed immutable-source workflow installer. The selected immutable merge revision is `ee3f2e591b8ad78db87bc28e6242f1d0f0b7b34c`; its post-merge checks must pass before activation. This source shares the original route deadline with CI waiting and final authority checks; it also retains per-command verification windows and the reviewed recovery-provenance correction. Public CLI 0.12.55 and installed SDLC 0.21.6 remain separate from the workflow source manifest.

Set the project-owned route limit to 6,600 seconds. This leaves fifteen minutes inside the existing 125-minute workflow job for setup and cleanup, while allowing one real correction and full CI. Keep one shared correction, existing models, container limits, checks and the exact #99 implementation override. Update every installed workflow source pin through the official installer, explicitly including the primary `.github/workflows/lighthouse-sdlc-unattended.yml` harness checkout. Keep that execution pin and the separately maintained CI App preflight pin consistent with the selected revision; update the existing exact-pin guard and owning runbooks together.

## Delivery and verification

1. Obtain independent planning acceptance before applying the installer or policy correction.
2. Preview then apply official workflow generation; retain the exact source, package tuple, policy diff and prior failed-run evidence. Clarify the already-required fractional-attempt behavior in #99 with the observed precision case before a fresh request.
3. Run `npm run verify`, foundation verification and all seven installed worker compilations. Require current forge checks and an independent audit of all eleven Done dimensions before integration.
4. After integration and default-branch CI, recheck the App installation, both selected providers, the pinned execution environment and cleanup. Dispatch one fresh #99 request from current `main`; reconcile an uncertain response instead of repeating it.
5. Require the native candidate, trusted checks, independent acceptance, required CI, delegated merge and post-merge review receipts before qualifying #88. Avoid manual model work during native qualification.

Adoption and a longer finite route window do not establish successful native delivery. Rollback restores the previous source pin and 3,600-second setting through a reviewed change; it preserves all retained execution evidence.
