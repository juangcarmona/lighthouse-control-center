# Issue 116: repository target incident review

Date: 2026-11-09. This records an orchestration incident, not acceptance of the product increment.

## Observation and evidence

The intended queue action concerned existing issues in `juangcarmona/lighthouse-control-center`.
A delegated agent instead added `refine` to `juangcarmona/lighthouse#119` and initially reported
that the other requested issues were closed. The repositories have independent issue-number spaces;
the corresponding Control Center issues were open. The parent detected the wrong repository in the
returned workflow URL before accepting the queue report.

Wrong-target [router 42579544145](https://github.com/juangcarmona/lighthouse/actions/runs/42579544145)
dispatched [worker 42579580173](https://github.com/juangcarmona/lighthouse/actions/runs/42579580173).
The parent cancelled that worker and removed the mistakenly added request label. The worker's package
load was cancelled; context loading and agent execution were skipped. Native finalization retained
the cancelled receipt and released the working label. The issue returned to its original
`enhancement` label; its body was unchanged. No refinement result, implementation, PR or merge was
produced. The cancelled source records remain available.

Correct Control Center work was then requested on #56 and #117 through their existing `refine`
labels, retaining the implementation holds. Those requests are separate from the cancelled run.

## Process gap and ownership

The handoff relied on surrounding repository context and bare issue numbers. The parent delegated
a remote write without requiring a repository-identity receipt, and the executor inferred the wrong
repository. This was a target-binding failure in orchestration, not a Lighthouse workflow defect.
The parent owns the incomplete handoff and the delayed detection.

## Durable correction

[AGENTS.md](../../AGENTS.md#github-target-verification) owns the mandatory pre-write and delegation
criterion. Its preflight reads the existing `.lighthouse/github.json` target, rejects a different
requested repository before contacting GitHub, then requires a read-only response with the canonical
name and numeric repository ID. The same confirmed identity must accompany the subsequent action.
Tests cover the exact neighboring-repository error, mismatched live identity, unavailable API and
invalid numeric identity. The preflight has no write operation.

Counterfactual: requesting `juangcarmona/lighthouse` from this checkout fails before dispatch, so the
original action cannot satisfy the new criterion. This is a checkable agent instruction and preflight;
it does not intercept unrelated clients or change GitHub's authorization policy.

## Effort and remaining verification

Human time, agent time, tokens and attributable cost for this incident are unavailable: no measured
session-to-incident mapping was captured. Workflow elapsed time is not used as a substitute.
Required repository checks and an independent review must cover the final correction commit.
No engineering-lifecycle gate, generated skill, approval policy or correction budget was changed.
