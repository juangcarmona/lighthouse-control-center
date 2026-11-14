---
pdac-scope: cited
---

# Tasks

All boxes are future work. This candidate neither accepts ADR-0010 nor releases the issue's `future` hold. Groups 2-5 depend on group 1; each subsequent group depends on the contracts it uses.

## 1. Establish implementation entry evidence

- [ ] 1.1 The maintainer records the proposal decision, ADR-0010 disposition and explicit implementation-hold release through Lighthouse; verify linked owner decisions before implementation starts. If the accepted architecture changes this design, revise the proposal first.
- [ ] 1.2 Verify PR #100 integrates the already-assembled #57/#105 inventory into `main`, then obtain the existing #57 source acceptance and deliver a preservation map of handlers, configured roots, permission checks, session/source isolation, file/process/page/item/byte/time budgets, cursors and regression tests; verify every adapter dependency against the accepted source and preserve correction/review history. Material mismatch requires re-refinement, not a replacement collector. (AC1, AC4)

## 2. Define the read contract and conformance fixtures

- [ ] 2.1 Add internal provider/resource identity records within the existing Workspace module; verify cross-instance, namespace and entity-kind collisions and display renames with unit tests, and document identity encoding and absent-ID behavior. (AC2)
- [ ] 2.2 Add typed source-provenance relationship projections; verify positive joins and absent/contradictory runner-host, job-runner, execution-runtime, runtime-model-provider and pool-member evidence, with identical-label negative fixtures and documented unknowns. (AC2)
<!-- pdac:cite id="FR-EVIDENCE-CORRELATION" digest="sha256:cb4235a9d512635a47acaaf73e155e478b04f887a0b22c60c36b1acc5e949e85" -->
- [ ] 2.3 Add independently versioned inventory, telemetry and operation discovery descriptors; verify supported/absent/unsupported versions, scoped targets, limitations and non-permissive missing metadata, and document that discovery grants no operation authority. (AC3)
<!-- pdac:cite id="FR-RUNTIME-PROVIDER-OPERATIONS" digest="sha256:59e7f1eb588e54c5d52773b7a30e5384e0d6b0eb8bb6ff5c1c625382a3a3ad05" -->
- [ ] 2.4 Add page/provenance/result records and reusable fixtures; verify preserved IDs, source/observed times, optional revision/ETag, invalid/scope-confused continuations, budget exhaustion and independent availability/completeness/freshness, and document inherited bounds and unknown measurements. (AC4)
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 3. Wrap the integrated local inventory

- [ ] 3.1 Implement the observation-only adapter by delegating to mapped #57 local/GitHub reads; compare old/new fixtures for lossless IDs, relationships, timestamps, coverage and error states and document the adapter-to-source mapping. Preserve existing consumer projections rather than adding a parallel reader. (AC1, AC2)
- [ ] 3.2 Retain baseline path/read/process bounds and live permission/session checks before reuse; run inherited negative fixtures plus denial, disconnect/reconnect, mid-read authority loss, truncated enumeration and unsafe-path regression tests, and document each preserved boundary. No privileged probe is needed. (AC1, AC4, AC6)
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
- [ ] 3.3 Advertise only actual supported local reads, with explicit unsupported telemetry where absent and no executable start/drain/restart/scaling; verify no added operation route, sender, shell fallback, helper, privilege or source mutation and document these exclusions. (AC3, AC6)

## 4. Prove platform variation without platform effects

- [ ] 4.1 Add Kubernetes and VMSS doubles to the shared conformance suite; verify desired 5/ready 2 and requested 5/provisioned 3, pagination, denied/partial/unsupported reads and missing measurements, and label all results contract-only in documentation. (AC5)
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:24fdf64ce66a09fa35b21d0cbf75b7e38235f289cefdb30c1849981cc14f55fa" -->
- [ ] 4.2 Add read-only synthetic accepted/pending/uncertain-timeout/failed/completed outcome sequences; verify stable source-operation identity, no resubmission and no inferred independent verification or usable capacity, and document limitations without adding a production reconciler. (AC5)
<!-- pdac:cite id="QR-PROVIDER-EXTENSIBILITY" digest="sha256:060c4af7c05abe49f1c348cc68e1e54715a8174acf42928f9ba5d43b477164bf" -->

## 5. Integration and acceptance evidence

- [ ] 5.1 Obtain independent contract/security review of the actual candidate; retain findings and resolutions covering scoped identity, source/session isolation, safe bounded reads, inert data and absence of administrative effects, with no unresolved acceptance-blocking finding. (AC6, AC7)
- [ ] 5.2 Authorized local operator records actual configured-local inventory evidence with source IDs, scope, source/observation times, completeness and limitations; maintainer reviews it independently of doubles. Verify reports omit private configuration, credentials and sensitive paths. (AC7)
- [ ] 5.3 Run `npm run verify` and all configured checks on the actual candidate in the supported environment; retain exact-head CI and regression receipts, including source independence and existing owner/session/browser checks, without counting unavailable checks as passed. (AC7)
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:31409f2106c4b0abc626f54b05e1715289edf1e29dc9e653c72d3318a379e704" -->
- [ ] 5.4 If inventory rendering changed, verify safe desktop/390px light/dark screenshots, textual unknown/unsupported/partial states, keyboard focus, refresh and authority-loss clearing; otherwise record unchanged presentation and passing browser regressions. Do not claim new visual publication or physical-device acceptance.
- [ ] 5.5 Refresh affected OpenSpec/ProductShape citations and source-preservation documentation after integration; verify `npm run spec:validate`, `npm run product:citations` and `npm run lint:docs`, and deliver the AC1-AC7 evidence index with real-local and contract-only results separated.
- [ ] 5.6 Developer and maintainer review every repository Definition of Done dimension, known limitations and evidence on the implementation PR; verify explicit acceptance and required forge decisions rather than inferring approval from this proposal or green CI.

## Workflow follow-up

- Archive through the installed OpenSpec workflow only after required implementation and integration decisions; verify the archived specification and citation result.
- Deployment, #57 telemetry follow-ons and #118 administration remain separately authorized work.
