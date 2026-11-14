---
pdac-scope: cited
---

# Tasks

## 1. Approved source scope

- [x] 1.1 Record the owner's existing PR #214 authorization for one exact run-attempt artifact and keep later families/history out of this slice.
- [x] 1.2 Use only the approved usage summary and adjacent correlation records; require exact repository, issue, revision, run, attempt and one session ID.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## 2. Bounded authenticated reader

- [x] 2.1 Recheck connected-user Actions-read authority and exact run-attempt source metadata before reading the named artifact.
- [x] 2.2 Reject absent/ambiguous/expired artifacts, unsupported summaries, inconsistent correlation, and archive/member bounds violations; never persist telemetry.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## 3. Health run detail

- [x] 3.1 Show the output-token value only for matching observed evidence, with exact run/attempt, source link, revision, source time and observation time.
- [x] 3.2 Keep unknown evidence explicit and do not infer cost, billing, health, delivery or other metric families.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->

## 4. Verification and review

- [x] 4.1 Add malformed/oversized archive and authority-loss coverage; run the focused .NET tests and repository verification.
- [x] 4.2 Verify the run detail in light/dark and narrow/desktop layouts, including unknown, loaded, source-link and focus behavior.
- [x] 4.3 Run strict OpenSpec, citation, documentation and browser checks; update this task list from actual receipts.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## Later work under #54

- GH-54-S2: separately accepted delivery, adoption and engineering-quality sources.
- GH-54-S3: compatible retained history, cohort/window definitions and cross-run comparisons.
- Keep #54 open until its remaining scope is implemented and accepted.
