---
pdac-scope: cited
---

# Design

## Context

The existing Health page already has a source-backed detail for one GitHub Actions run. The owner has authorized a single read-only resource measure on that page: OpenCode output tokens from the exact run attempt's retained Lighthouse telemetry artifact. Other signal families and comparison history remain later work under #54.

## Goals and limits

- Show a value only when the current connected GitHub user has Actions-read authority and the requested run, attempt, artifact and telemetry records agree.
- Display the reported `tokens.outputTokens`, exact run-attempt link, revision and source observation times.
- Leave missing, expired, partial, ambiguous or mismatched evidence unknown.
- Do not persist, aggregate or infer billing, provider cost, health, quality or success.

<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:00496ba5f763ca6f4062a45e000bda8fb429cfd674b0e638cd59fb3858449130" -->
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## Source contract

The approved artifact is named `lighthouse-<workflowRunId>-<attempt>` and contains:

- `evidence/host/telemetry-usage.json`: schema 1, source `opencode-native`, coverage `observed`, and a non-negative integer at `tokens.outputTokens`.
- `evidence/host/telemetry.jsonl`: records whose correlation fields all agree on repository, positive issue number, revision, workflow run ID, workflow attempt and one non-empty session ID.

The server rechecks Actions-read authority, retrieves metadata for the exact GitHub run attempt, verifies the run revision and repository, then finds exactly one unexpired matching artifact. It requires the artifact age and declared retention to be no more than 14 days. The archive reader accepts only the two exact member paths for this projection, rejects malformed/unsafe/oversized archives, and never returns a signed download URL. Existing issue-control artifact access remains unchanged.

The artifact is read on demand through the existing connected-user GitHub transport. Only the summary's output-token field is projected. The adjacent records establish correlation; they are not exposed to the browser. GitHub source time and local observation time are shown separately. No output is cached or persisted by this feature.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## Evidence states

An unknown result is shown if authority cannot be verified, the run attempt is absent, the artifact is missing/ambiguous/expired, either exact member is missing, the summary is unsupported or incomplete, or any correlation differs. A source-identity or authority change clears the displayed private value. A numeric zero is shown only when the supported source explicitly reports zero with observed coverage.

The value means only the OpenCode-native output-token total reported for that attempt. Input, reasoning and cache tokens are separate fields. It does not state billed units, cost, human effort or delivery outcome.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## Later work

Delivery, adoption and engineering-quality producers require their own accepted source definitions. Cross-run history and comparisons require compatible definitions, units, cohorts, windows and retention evidence. They remain pending under #54; this slice neither implements nor claims them. No composite score or threshold is added.

## Verification and risks

- **Exact source:** cover permission loss, exact run/attempt, revision and artifact identity, expiry/14-day retention, malformed archives and correlation mismatch.
- **Projection:** cover the supported schema, observed coverage, zero versus missing, and never deriving cost.
- **Presentation:** cover loading and unknown states, the exact source link, authority clearing, narrow/desktop and light/dark views.

An expired or unavailable artifact can make an old run unknown; that reflects the producer's 14-day retention, not zero usage. The real artifact attached to the owner's handoff was a format example only and is not presented as current product evidence.

## Migration and rollback

No data migration is required. Removing the new endpoint, projection and run-detail section restores the prior view. Existing artifact readers and credentials are not changed.
