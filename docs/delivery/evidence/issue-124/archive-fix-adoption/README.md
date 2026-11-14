# Archived-plan workflow repair adoption

## Scope and plan

Owner: existing issue #124 in `juangcarmona/lighthouse-control-center` (repository ID `1425429121`). This is a prerequisite bootstrap increment for the existing documentation PR #154, not another implementation of its archived plan. The maintainer authorized dependency upgrades and routine continuation. Independent Luna High reviewed this plan before finalization on 2026-11-11.

1. Preserve the published dependency tuple: CLI 0.12.65, SDLC 0.22.4 and UI 0.2.1.
2. Regenerate the existing source-mode workflows and their locks with the installed public SDLC installer and gh-aw 0.93.2, selecting immutable Lighthouse commit `d601fd70412a4c2dd3bdc7bcb6cb9678ad59e01b`.
3. Retain enabled worker selection, issue control, existing policies, source grants, CI and independent review. Update the router digest through its installer.
4. Run foundation and repository checks; review the final diff independently. Integrate this prerequisite through a separate reviewed bootstrap PR so default-branch host execution can use the repair.
5. Only after default-branch checks pass, request supported requalification of the same #154 candidate. Require a new exact-head completion proof and normal review/CI/forge gates before integration.

## Source and installer evidence

[Lighthouse #587](https://github.com/juangcarmona/lighthouse/pull/587) merged at the selected commit. Its implementation-plan preparation validates a unique completed issue-bound archive without recreating an empty active plan. Missing, conflicting, incomplete or modified archives remain blocked; the archive does not substitute for delivery checks or a completion receipt.

The published CLI/SDLC versions were checked against the registry on 2026-11-11. SDLC 0.22.5 was unavailable. An earlier interrupted preparation used local source-packed future versions; its patch was preserved outside the repository, dependencies were restored with locked `npm ci`, and version metadata was restored to the actual selected public tuple. No unreleased package is claimed installed.

The public SDLC 0.22.4 installer was previewed and applied using the commands in the [workflow runbook](../../../../runbooks/repository-workflows.md). All seven worker sources/locks compiled with gh-aw 0.93.2. The generated workflow changes select the repaired source checkout; source mode executes that checkout rather than the unchanged application SDK package. The existing policy and request form were preserved. No remote dispatch, grant change or runtime operation is part of installation.

## Verification and limits

Validation and independent final-diff review are recorded in the bootstrap PR. Package-mode execution still needs the published SDLC repair; this increment adopts source-mode host execution only. Native #154 requalification, merge, development activation and full own-repository mission acceptance are separate outcomes. This bootstrap does not close #124.

Rollback restores the preceding source pin `879c4e75efebd945f8aea5b8ee09b97db62edbea` through the same installer and reviewed integration. Such rollback also restores the known archived-plan limitation: do not retry #154 against that host. Preserve source receipts and uncertain command records.
