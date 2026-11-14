---
pdac-scope: cited
---

# Tasks

This proposal records the first output-token slice authorized by the owner in [PR #214](https://github.com/juangcarmona/lighthouse-control-center/pull/214#issuecomment-6874864694). The implementation candidate is under review in that PR. A passing check does not accept or merge it. The remaining signal families and comparisons stay with parent issue #54.

## 1. Use the approved source

- [x] 1.1 Record the owner's exact scope: one read-only OpenCode output-token value for one GitHub Actions run and attempt, from the existing retained artifact.
- [x] 1.2 Confirm the owner-approved summary fields and correlation records; leave missing, expired, partial, unsupported or mismatched evidence unknown.
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->

## 2. Implement and verify the slice in #214

- [ ] 2.1 Check the connected user's Actions-read authority and bind the read to the selected repository, revision, run and attempt.
- [ ] 2.2 Read only the named summary and correlation members from the matching retained artifact. Do not persist the telemetry or add a general artifact browser.
- [ ] 2.3 Show the reported output-token count with its source, exact run/attempt and observation time. Keep unknown evidence explicit; do not infer cost, billing, quality or delivery success.
<!-- pdac:cite id="TERM-HEALTH-MEASUREMENT" digest="sha256:b830117f98118d9b596ec1f2947dc1b2b292eafea90bed9645db61fed664c0b0" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:8b54c80507f22f6883aaad91a53f479da5892bcc8def4f0e836076d1cf2063d5" -->
- [ ] 2.4 Complete exact-head review and required CI in #214; update this record from those receipts before integration.
<!-- pdac:cite id="UC-INSPECT-PROJECT-SIGNAL" digest="sha256:093d5d32237804a971d189d3074ea46fc2bc8d16e9b731307ad48145c955f52c" -->

## Later work under #54

- Delivery, adoption and engineering-quality signals need their own accepted sources and proposals.
- Health detail/history, retained comparisons and compatible windows need a separate shared contract before downstream work relies on them.
- Keep #54 open for those items. This proposal and #214 do not claim parent completion.
