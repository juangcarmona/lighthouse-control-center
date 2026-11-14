---
pdac-scope: cited
---

# Tasks

These unchecked tasks describe the documentation increment only. They are not authorization to implement, provision or rehearse. Keep #120 open and future and coordinate sequencing on #116. Any change to application behavior requires its existing owner and a separately scoped specification/proposal.

## 1. Establish canonical scope and version inventory

- [ ] 1.1 Reconcile docs/runbooks/control-center-installation.md with the verified refinement and #124 adoption path; verify there is one installation entrypoint and explicit links, no duplicate installer, no change to #121 continuity or #123 assets.
- [ ] 1.2 Add the AC-1 inventory from design.md with source references, pinned/operator-supplied/unresolved classification and owners; verify historical runbook pin, inspected main and unaccepted #100 head remain distinct and no unresolved artifact is called a supported release.
- [ ] 1.3 Add the dependency/authorization register for #100/#48, #58 and the operator baseline; verify each deferred version, custody and execution decision has Juan's responsible role, required receipt and stop condition, without silently releasing future or claiming dependency acceptance.

Independent configuration remains a documented prerequisite, not personal infrastructure embedded in the installation.
<!-- pdac:cite id="CON-DEPLOYMENT-INDEPENDENCE" digest="sha256:8e325bbc00521d12e730cb0d5faacbd737c749504b5bfe3888ce0d14e6c0b2c0" -->

## 2. Document configuration and access acceptance

- [ ] 2.1 Extend the AC-2 prerequisite table with exact OIDC/GitHub callback formulas, origin/issuer/client/owner/assurance, private configuration/TLS ownership, allowlist and optional runtime absence; verify entries against selected source validators and link shared identity guidance without including private values or inventing keys.
- [ ] 2.2 Record the current App-permission wording discrepancy and a version-bound effective App/user permission review gate; verify documentation does not pre-grant administration, contents-write or dispatch authority or imply provider sign-in grants GitHub access.
- [ ] 2.3 Document R2/R3/R6 cases for AC-2/AC-3/AC-6, including positive/negative configuration, partial/unadopted reads with runtime absent, anonymous/direct-route denial, logout/disconnect, expiry, actual revocation and outage; verify every case has prerequisites, expected outcome and safe receipt, labelled planned rather than passed.
- [ ] 2.4 Add deterministic/isolated-provider/real-source evidence distinctions and visual redaction guidance alongside those cases; verify references to existing tests and separate identity E2E lane, keyboard/focus expectations and owner-deferred physical phone acceptance are accurate.

These tasks preserve separate authority and credential containment.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

## 3. Document custody, recovery and independence acceptance

- [ ] 3.1 Add the AC-4 custody decision table and R4 restore outline: state/journal/key/binding locations, owners/modes, consistency, retention, order and compatibility remain version-specific #58/#100 gates; verify current ephemeral sessions are not misrepresented as durable and no private files are requested as public evidence.
- [ ] 3.2 Document AC-5/R5 retained-command reconciliation and failure cases for missing keys, incompatible bindings and incomplete evidence; verify the plan reuses accepted #48 and requires original command/source IDs and no-resend evidence rather than authorizing a test send.
- [ ] 3.3 Document AC-7/R7/R8 stop/reconnect, compatible upgrade/rollback and incompatible-state stop cases; verify expected receipts include unchanged source run identity/outcome and app stop times, with no workflow cancellation/redispatch or retired supervisor startup.

Repository delivery and recovery remain independently owned.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
<!-- pdac:cite id="QR-EXECUTION-RECOVERY" digest="sha256:735fb5afb4c75ba744b7864c7ead1822b6e5ef1f1397460de6df582feaee38a6" -->

## 4. Verify the integrated documentation candidate

- [ ] 4.1 Add the AC-8 receipt index format and AC-1–AC-8 traceability table to the canonical runbook; verify every criterion maps to R1–R9, names a later evidence source and distinguishes development install, external security acceptance and production approval.
- [ ] 4.2 Run `npm run lint:docs`, `npm run spec:validate` and `npm run product:citations` on the actual documentation candidate through the trusted host; verify strict validation/citations and cross-links pass without changing provider-owned schemas, verification inputs or product intent.
- [ ] 4.3 Review the final documentation against design.md and the repository Definition of Done; verify no actual install/security/recovery result is claimed, unresolved gates remain explicit, the developer review is recorded and required exact-head CI is linked before integration.

## Workflow follow-up

- Owner reviews the proposal; planned does not mean approved. Archive only through the installed workflow after the documentation increment's review requirements are met.
- Retain the rest of #120: after accepted #100 executable, #58 custody/security decisions, exact operator baseline and explicit hold release, separately authorize packaging needs demonstrated by rehearsal and run R1–R9 with real safe receipts. Do not infer that this documentation increment finishes those acceptance criteria.
- Later executable work reuses existing tests, `npm run verify`, separate `npm run verify:identity:host`, actual external/source matrix and independent credential-free evidence review. No live effect is authorized here.
- Keep #121/#123/#124 ownership and production release/deployment decisions separate; update coordination on #116 through the existing lifecycle.
