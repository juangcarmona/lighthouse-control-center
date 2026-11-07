---
pdac-scope: cited
---

# Design

## Context

See proposal.md for motivation and product discovery; `specs/factory-overview/spec.md` defines this slice's behavior. `observeRepositories` already returns bounded runs and attention issues with source identities and update times. The CLI and web server share it. The server coalesces collection with a 15-second cache; the browser refreshes every 30 seconds, safely renders text/links and retains the previous DOM on fetch failure. It currently shows only eight runs and counts every attention label as attention.

## Goals / Non-Goals

**Goals:** an additive observer contract and a small client-side projection with inspectable provenance. GitHub remains authoritative; cards never join runs to issues by timing, title or branch guesses.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

**Non-Goals:** authentication, commands, scheduling, pagination expansion, storage, session/runner monitoring, capacity and the complete project/intervention journeys. Preserve ADR-0006 and independent execution; do not redesign the server.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->

## Decisions

### 1. Add source timing; derive presentation locally

Add optional `startedAt` from GitHub `run_started_at` to each run, preserving existing fields, values, issue labels and the entire attention collection. Preserve absent/invalid source timestamps as unavailable; never coerce null to epoch or invent a start from updated time. Use the existing `updatedAt`, `observedAt`, availability and scope fields. No additional GitHub request, pagination or server query parameter is needed. Replacing attention with only human waits was rejected because it breaks CLI/observer clients.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

For in-progress runs, show elapsed time from valid startedAt to that repository's observedAt, explicitly as of observation; show age since source update separately when available. Queued/requested/pending/waiting cards show source-update age, not invented execution duration. Completed history shows source update time/age, not an inferred completion duration. Missing, invalid, future-relative or negative intervals are unavailable, not zero. Retain an inspectable absolute source timestamp alongside understandable minute/hour/day ages. Do not let a failed refresh make stale timings look newly observed.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

### 2. One overview projection, no new subsystem

Use existing native markup/styles and tokens: repository filter and scoped metrics; a prominent Human intervention section; Active workflows grouped as running (`in_progress`), queued (`queued`, `pending`, `requested`) and waiting (`waiting`); then repository evidence/history. Display exact source status even when grouped. Each active card includes repository, title/fallback run id, revision/fallback unavailable, safe source link and timing. Render every collected active run, not the existing first-eight slice. Keep collected completed runs inspectable in a keyboard-operable disclosure, excluded from active metrics. Unknown source statuses remain explicitly unclassified and inspectable rather than being called completed or active.
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->

Human waits are issues containing needs-info or waiting-review, counted once per repository/issue even with both labels. Display both reasons if present, repository/number, title, safe issue link and age since source update; label the latter explicitly, not as wait duration. Preserve the other collected attention items in a secondary source-label list so agent-working/ready remain inspectable but do not suggest owner action. Retain source order within each group rather than inventing urgency. A workflow waiting status does not populate the human-wait count or identify an approver.
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->

### 3. Filter, identity and focus are client state

Keep a native labeled select outside replaced results, default All repositories, plus one option per configured repository. Keep the selection in page state across automatic/manual refresh, including failed refresh; reload persistence is not required. Filter the cached snapshot locally, including all sections and metric denominators; unavailable repositories remain selectable. This avoids changing the shared cache or implying unconfigured access.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->

Key runs by repository + run id, issues by repository + issue number, and controls by purpose; never key by title, ordering or href. Preserve focused source control across redraw/reorder/status transition even when its href changes. Preserve history disclosure state by repository; a focused run moving to history remains reachable. If a card disappears or becomes an unsafe non-link, focus the same repository's safe actions link when present, otherwise the persistent filter (refresh is also a persistent final fallback). Do not steal focus from controls outside results. Restore only after refresh controls are enabled, avoiding focus on a disabled button. Retain visible focus, skip link and polite refresh status.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

### 4. Keep evidence dimensions separate

Metrics say collected active runs, collected human-wait issues and unavailable repositories within the selected scope; show observed/selected repository coverage. When any selected repository is unavailable, label available counts as known collected counts with unknown remainder; if all are unavailable, totals are unavailable rather than authoritative zeros. Available empty results mean no matching collected records, not an idle or healthy factory. Always state latest 20 workflow runs and first 100 open issue records, with PR records excluded from attention. No exhaustive active inventory is promised.
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

Keep repository observedAt separate from browser response-received time. A repository collection failure renders unknown evidence, without synthesized empty arrays; the existing all-or-unavailable repository contract is retained even if only one source call failed. A failed HTTP/JSON refresh retains the last valid snapshot, selection and focus, adds the stale warning and leaves old observation times intact. Initial failure states that no observation is available. Coverage and staleness can coexist. A partial-success API redesign was rejected as unnecessary scope.
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

### 5. Reuse safety and design-system boundaries

Use textContent and the existing repository-bound HTTPS GitHub link validation for every new source link; malicious/off-repository URLs render as non-clickable text. Preserve GET/HEAD, allowlist, host/cross-site checks, CSP and bounded shared cache. Long names, labels, revisions and controls wrap within 390px; do not hide overflow to conceal broken layout. No new framework or tokens. Browser tests retain XSS/link/keyboard/axe assertions and add all new visible paths in both themes. Screenshots demonstrate this fixture view, not the complete authenticated phone journey.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Risks / Trade-offs

- Bounded reads omit older active runs or later issues → always display bounds; never claim exhaustive activity.
- Source update age is not wait duration; run starts may be absent → explicit labels and unavailable timing.
- Redraw changes grouping or removes a focused item → source keys, disclosure preservation and tested safe fallback.
- Fixture success may be mistaken for live health → label fixture artifacts and keep later real observation separate.
- Frozen inputs expose an unrelated failure → report the concrete blocker; do not edit other tests, tooling or policy.

## Migration Plan

No persisted data or deployment migration. Deliver collector addition first, then UI with its tests and README, then integration checks. Existing clients may ignore the optional field. Rollback is a reviewed revert of this bounded change; no source mutations or state repair are required. Release/deployment is not authorized by this plan.

## Verification and Definition of Done

All verification is planned, not executed here. Run the complete admitted inventory in order:

```sh
npm ci --ignore-scripts
env CI=true npm run verify:container
npx --yes --package=@fission-ai/openspec@1.15.0 openspec validate issue-90-proposal --strict --no-interactive
```

The container chain must retain Node tests, docs lint, secrets, ProductShape integrity/validation/citations, OpenSpec, architecture, container-scoped .NET and Playwright. Its product citation step must discover every returned Markdown document as bound and current; refresh cited payloads through provider inspect/cite if text dependencies change, never by deleting bindings. Do not narrow the chain or modify frozen inputs.

Additional agent observations: exercise filter, refresh, history, links and focus; inspect desktop and 390px light/dark screenshots for layout and semantics. Identify these as fixtures. Separately inspect the live read-only view with source observation times and collection limits, recording unavailable access honestly. Neither observation replaces trusted check receipts.

Later forge CI: obtain the required full hosted `verify` on the actual candidate, including full .NET/Docker EngineTests, effective required check context and retained browser reports/screenshots. Container-scoped exclusions cannot satisfy that gate. Obtain distinct independent plan and candidate acceptance and all effective forge approvals before integration.

Done requires AC1–AC8 coverage, intact observer compatibility and safety assertions, all admitted receipts bound to the candidate, inspected UI artifacts/live-view evidence, accurate README, current citations, recorded limitations and each lifecycle DoD dimension reviewed under the existing issue-specific authority. Missing/failed required evidence stops delivery. This is not production readiness or completion of #51/#52/#57. No unresolved design question changes this breakdown.
