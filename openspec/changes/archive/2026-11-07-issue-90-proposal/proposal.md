---
pdac-scope: cited
---

# Proposal

## Why

Juan needs to distinguish observed active workflows and source-labeled human waits at a glance, rather than interpret a mixed attention list and truncated execution history. Issue #90 delivers only the first read-only operational slice of #51, #52 and #57.
<!-- pdac:cite id="JRN-DAILY-FACTORY-OPERATIONS" digest="sha256:a604012667b4b06339399a2f496380b24657fa3e71fc93d72d01187b2d4a272e" -->

## What Changes

- Foreground all collected running, queued/pending/requested and waiting runs with repository, title, exact source status, revision, source link and available timing; retain completed runs separately.
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
- Add a prominent needs-info/waiting-review section, retaining source labels and age since issue update. Agent-working/ready alone are not human waits; preserve the collector's original attention facts.
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
- Add a repository filter retained across observation refreshes, stable source identities and keyboard-focus continuity. Explain the selected scope and counts.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->
- Expose observation time, bounded collection, unavailable timing, unknown repositories and stale refreshes without substituting zero or health claims for missing evidence.
<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
- Preserve safe links/text, native Lighthouse themes and keyboard/390px usability; extend the two admitted test suites, capture browser evidence and update README usage. This does not establish the full authenticated mobile journey.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Capabilities

### New Capabilities

- `factory-overview`: bounded, read-only cross-repository workflow and human-wait observation, including scope, freshness, selection and accessible source inspection.

### Modified Capabilities

None. The mounted `openspec/specs/` inventory is empty except `.gitkeep`, consistent with the recorded initial provider inventory in `docs/delivery/evidence/issue-88/planning-prerequisites.json`. Fresh CLI discovery was not run here; no related existing specs require full reads. Behavior changes require `specs/factory-overview/spec.md`; do not set `skip_specs`.

## Impact

Production changes are confined to `src/observation/`, `src/web/` and `README.md`; test changes are confined to `tests/observation.test.mjs` and `tests/browser/observation.spec.mjs`. Add only run-start timing to existing observations; do not replace their shape, remove labels or infer run/issue associations. GitHub retains source authority. No dependency, credential, persistence or new endpoint is required.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

Preserve ADR-0006, independent repository execution, the configured allowlist, GET/HEAD boundary and shared bounded cache. No authentication change, mutation, embedded agent, scheduling or framework is introduced. The anonymous observer must remain non-privileged; this is not the protected operational workspace.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->

## Product discovery and boundaries

The previous plan compared the whole 71-artifact model to #90 and widened the seven issue-named artifacts with the host-prepared impact reports. This correction reread the index and relevant reports; it does not change that discovery or product scope. The impacted dependency set is JRN-DAILY-FACTORY-OPERATIONS, FR-FACTORY-DISCOVERY, FR-PROJECT-WORKSPACE, FR-INTERVENTION-INBOX, FR-RUNTIME-HEALTH, BR-EXPLAINABLE-SIGNALS, BR-GITHUB-SOURCE, BR-EXPLICIT-WORK-COMMANDS, QR-MOBILE-OPERATIONS, CON-FACTORY-RUNTIME and BR-LAN-PRIVILEGE-BOUNDARY, cited above. These are consumed, not altered.

Checked neighbours UC-EXPLORE-FACTORY, UC-RESOLVE-INTERVENTION and UC-MAINTAIN-RUNTIME for discovery, wait and missing-evidence context; their full journeys are not delivered. ACT-FACTORY-OWNER, ACT-GITHUB-BACKLOG, the bounded contexts and TERM-PROJECT/WORK-UNIT/EXECUTION-RUN/DELIVERY-EVIDENCE retain their existing definitions; no new domain model is introduced. Checked and excluded UC-ACCESS-FACTORY, UC-OPERATE-ISSUE, FR-AUTHORIZED-ENTRY, FR-ISSUE-CONTEXT, FR-ISSUE-CONVERSATION, QR-EXECUTION-SECURITY and CON-TRUSTED-LAN: authenticated commands/conversation remain on their separate protected path. Checked UC-INSPECT-PROJECT-SIGNAL, FR-PROJECT-HEALTH, FR-CONFIGURATION-DRIFT, BR-CAPACITY-DEFAULTS, BR-PRIORITY-DEFAULTS, BR-RECOVERABLE-EXECUTION, FR-RECOVERABLE-EXECUTION and FR-RETENTION-POLICY; trends, upgrades, capacity, recommendations, recovery and retention management remain excluded. Other graph neighbours concern intake, execution, delivery or authority, not additional work in this slice.

Product definition drift: none proposed. This is partial realization of the existing baseline, not a new Product Change or a claim of complete compliance with those broader requirements. No CHG overlay is created or applied. Search, boards, shared detail, resolving interventions, runner/session inventory and capacity remain later work; #49 future and all existing holds remain intact. Verification inputs, scripts, manifests, locks, workflows and provider-owned files remain frozen. Planning artifacts live only under this issue root.

## Delivery evidence

Implement in dependency order: additive collector timing and compatibility tests/README; native overview and browser tests/README; then full integration verification. All tasks stay unchecked at planning. The admitted commands, supplementary UI observations and later hosted verify are distinct future obligations in design.md and tasks.md. Independent plan/candidate acceptance and effective forge rules remain prerequisites; this plan grants no product, security, architecture, merge, release or deployment authority.
