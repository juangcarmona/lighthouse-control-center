---
pdac-scope: cited
---

# Tasks

This retains the documentation increment from PR #153 and the two owner-authorized additive regression-test paths in PR #195. Actual installation, source effects, security acceptance and deployment remain separately gated. No checkbox below claims a live rehearsal result.

<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->

## 1. Canonical scope and inventory

- [x] 1.1 Reconcile the canonical installation entrypoint, source/version inventory and #100/#48/#58/baseline dependency register; verify source references, named owners, stop conditions and #121/#123/#124 cross-links without promoting a candidate to a supported release.

## 2. Configuration and access

- [x] 2.1 Document exact callback/configuration prerequisites, separate App/user authority and permission wording discrepancy, optional runtime absence, R2/R3/R6 and safe visual/evidence guidance; verify against current validators and existing identity/control runbooks without changing policy or including private values.

## 3. Custody, recovery and independence

- [x] 3.1 Document current separate session/journal data/key surfaces and version-specific custody decision slots, R4/R5/R7/R8 backup/restore, no-resend reconciliation and compatible rollback; verify against storage implementations and keep #58 decisions unresolved.

## 4. Integrated documentation verification

- [x] 4.1 Add R1–R9 receipt fields and AC-1–AC-8 traceability, then manually review links, source accuracy, developer limitations and prose; verify no live acceptance is claimed.
- [x] 4.2 Run policy dependency installation, container verification and strict implementation-plan check plus Markdown/OpenSpec/citation checks; record completed exit statuses and evidence, marking this task done only if required checks pass.

Container verification is supported by the [owner's exact-head receipt](https://github.com/juangcarmona/lighthouse-control-center/pull/195#issuecomment-6865640781) for `bb4738d4b712a4c2dc3ff279ff6cd9854ca74711`: `npm ci` followed by `npm run verify:container`, exit 0. The owner reports 106 Node, 22 security and 120 browser tests, strict OpenSpec, 279 valid citations, all 12 architecture sections, and .NET build/tests. Per that later feedback, the worker did not repeat container verification for this head; it reran policy installation and the documentation/plan checks with terminal receipts retained in the workflow evidence. This verifies the documentation increment only, not an external installation, deployment or #58 acceptance. The earlier browser timeout remains a failed historical attempt.

## 5. Authorized installation and restart regressions

- [x] 5.1 Preserve exact persisted idle and absolute session deadlines through restart in OwnerSessionsTests and reject access at the idle deadline; retain existing session and grant-custody assertions. Verification: the supplied exact-head report for `a0f39a7` records passing web tests and full container verification.
- [x] 5.2 Verify selected Development and External profiles load operator identity/repository inputs without runtime registrations, checkouts or control-journal providers in WorkspaceOptionsTests; preserve configuration and identity-denial assertions. Verification: the same exact-head report records passing web tests and full container verification.
- [x] 5.3 Align the proposal, design and canonical runbook with the owner's single-environment first-startup decision; verify the rehearsal remains explicitly pending and separate from fixture checks, release, deployment and #58 acceptance.

## Workflow follow-up

- Host independently checks the exact candidate; require applicable independent review, exact-head forge CI and authorized integration. Archive through the installed workflow, not this worker.
- Keep the remaining #120 installation outcome open. Juan/operator records the selected candidate and baseline and performs installation, authenticated source connection, restart and recovery in their own environment; a second clean machine is not required. Retain missing or failed real receipts and separate #58 production custody/security acceptance.
- Later executable work reuses full `npm run verify`, separate `npm run verify:identity:host`, actual external/source matrix and independent credential-free evidence review. No live effect is authorized here.
- Keep #121 continuity, #123 visual publication and #124 adoption separate; coordinate sequencing on #116.
