# Opaque source-link checked-tree adoption

## Failure and authorized scope

Native [run 42440808113](https://github.com/juangcarmona/sofa/actions/runs/42440808113) passed planning, all three trusted host commands and independent candidate review. It created draft [PR #109](https://github.com/juangcarmona/sofa/pull/109), then stopped at the checked/published-tree guard. The tested tree omitted the 33 authenticated `.claude/skills` source links, while publication retained them. Removing those exact entries from the published tree reproduces the checked hash; the guard remains enforced and this attempt does not qualify #88.

The owner has authorized autonomous completion, necessary dependencies and routine merges for #88/#51/#52/#57. This is a bounded technical workflow adoption under ADR-0006 and BR-HUMAN-DECISION-BOUNDARIES. The existing product, security, production and protected publication boundaries remain applicable.

## Proposed adoption

Adopt merged [Lighthouse #572](https://github.com/juangcarmona/lighthouse/pull/572), exact source `59ded863109b045e399931dbad61e6cfdb698107`, through the installed official immutable-source workflow installer. The source preserves opaque link path/mode/blob identity in a separate check index without materializing links or reading target contents, binds that metadata into command evidence and reconstructs it from the admitted commit when accepting evidence. The publisher's exact tree equality is unchanged. Require actual source post-merge checks before activation.

Regenerate every installed harness pin, including the primary unattended workflow, and update the project-owned CI App preflight pin and existing exact-pin guard. Update current tooling and runbooks with the failed attempt, draft PR and subsequent qualification limits. Installed public CLI/SDLC stay 0.12.55/0.21.6; the independently pinned workflow source manifest stays SDLC 0.21.11. Preserve the 6,600-second route window, 125-minute job, one correction, exact #99 grant, merge delegation, models, resources, execution environment, trusted inputs, checks, identity and accepted product model.

## Verification and activation

1. Obtain independent planning acceptance before installer/configuration changes.
2. Preview/apply the official installer, run `npm run verify`, foundation verification and all seven worker compilations; require actual candidate CI and an independent audit of all eleven Done dimensions before merge.
3. After integration/default-branch CI, refresh the scoped App, selected providers, pinned environment and cleanup proof. Preserve the failed #109 draft and its exact negative receipts; reconcile and retire that superseded candidate before a single fresh #99 request so it cannot be confused with new success.
4. Dispatch once from current main, reconcile uncertain responses without resend, and avoid manual model calls while native qualification runs. Qualify #88 only from the native candidate, trusted commands, independent acceptance, required CI, delegated merge and post-merge receipts.

Rollback restores the previous source pins through a reviewed change. Neither source merge, adoption checks nor a repaired metadata fixture retroactively qualifies the failed native run. Registry publication and future public issue-control SDK adoption remain separate work.
