---
pdac-scope: cited
---

# Design

## Scope

The owner authorized one read-only output-token measure for one exact GitHub Actions run and attempt in [PR #214](https://github.com/juangcarmona/lighthouse-control-center/pull/214#issuecomment-6874864694). This proposal records that boundary. It does not define the other #54 signal families or cross-run history.

## Source and access

Use the existing artifact named `lighthouse-<workflowRunId>-<attempt>`. Read `evidence/host/telemetry-usage.json` and the adjacent `evidence/host/telemetry.jsonl` through the connected user's existing GitHub authority. The owner-approved usage summary has `schemaVersion: 1`, `source: opencode-native`, `coverage: observed` and `tokens.outputTokens`. The telemetry records must agree on repository, issue, revision, workflow run, attempt and one non-empty session ID.

Check Actions-read authority and exact source metadata before reading. Accept a value only when the artifact matches the selected repository, revision, run and attempt; the summary is supported; and the correlation records agree. The existing producer retains the artifact for 14 days. Read on demand. Do not store or aggregate telemetry, expose arbitrary artifacts, or add another credential path.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## Value and unavailable states

Show the reported `tokens.outputTokens` with its unit, source link, exact run and attempt, revision and separate source and observation times. A reported zero is valid only when the supported summary explicitly reports zero with observed coverage.

Leave the value unknown if authority is unavailable, the run attempt cannot be matched, the artifact is absent, expired or ambiguous, either required member is missing, the summary is unsupported, or any correlation field differs. Clear a displayed value when the connected identity or authority changes. Never infer cost, billing, provider usage, quality, delivery success or overall project health from this field.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Later work

Delivery, adoption and engineering-quality signals need their own accepted source definitions. A reusable Health detail/history contract, retention and cross-run comparisons also remain under #54. Those decisions must be made before downstream issues rely on them. This slice adds no history, comparison, score or threshold.

## Verification and limits

The implementation in #214 must cover exact repository/revision/run/attempt matching, current permission, supported summary fields, correlation mismatch, absent and expired artifacts, malformed or oversized input, and authority loss. The view must show the source and observation times and leave unavailable evidence unknown.

The owner supplied an artifact as a format example, not current product evidence. A passing fixture or check does not establish ongoing collection, complete population coverage or a production metric. Review and CI on the exact #214 head, integration and parent #54 completion remain distinct.

## Rollback

Remove the new reader and projection and return to the existing Health view. Do not change source artifacts, permissions, retention or repository delivery.
