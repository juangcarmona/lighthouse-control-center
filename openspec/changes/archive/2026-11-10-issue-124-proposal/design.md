# Design

<!-- pdac-scope: none reason="Operational documentation design only; no new architecture, product semantics or runtime behavior." -->

## Context

See `proposal.md` for the bounded increment. Source baseline is `d24953debaab37dfedf7745add1b47dae538a6d7`. The owner supplied current stack facts before this request; those are attributed observations, not live checks by this worker. Some existing runbooks retain older package/grant descriptions and immutable historical receipts.

## Goals / Non-Goals

**Goals:** make the present adoption inspectable and the next operator's evidence collection reproducible within existing authorities.

**Non-Goals:** no installer invocation or new installer, no mission implementation, live source effect, private runner inspection, new review grant, visual acceptance, production qualification or issue closeout.

## Decisions

1. Keep the inventory and procedure together in an existing admitted `docs/runbooks/` path. Use README/workflow links rather than editing protected policy or creating a second lifecycle. Alternative: rewrite tooling/architecture authorities; rejected as unnecessary and outside the bounded operational-documentation grant.
2. Separate committed exact pins, target/range declarations, installed observations and historical/live receipts. Source declarations cannot establish the current runtime patch, App authority, runner availability, provider identity or billing. Alternative: treat configuration as runtime proof; rejected as misleading.
3. Use four explicit status classes, qualifying their scope and evidence. An implemented producer can coexist with partial LCC consumption. Keep the latest owner-supplied PR #100 checkpoint distinct from main and prior assessment snapshots.
4. Reuse the existing rename receipts, #99 qualification, #126 upgrade and #128 continuity evidence. For the future mission, record issue → plan → run/attempt → PR/head/checks → integration/post-merge outcome, with absent links left absent. Never replay uncertain source requests.
5. No specification delta: this change adds no externally visible application behavior. Preserve host schema/date bytes and append only `skip_specs: true`.

## Risks / Trade-offs

- [Inventory ages] → Bind it to the inspected revision and require a fresh revision/date and observed evidence on replay.
- [Historical facts mistaken for current success] → Label attribution, exact heads and limits; retain old receipts untouched.
- [Operator reads procedure as authorization] → Separate local checks, operator preflights and deferred authenticated effects; require existing authority before writes.
- [Verification environment unavailable] → Retain command receipts and return blocked, without modifying checks or resources.

## Migration Plan

No runtime migration. Review and publish documentation with its plan through the existing implementation PR. Rollback is a normal reviewed documentation revert; it must not roll back packages, grants or source requests.
