---
pdac-scope: cited
---

## Context

The native editing image has an executable /tmp and noexec /home/engine/.cache. Lighthouse already supplies XDG_CACHE_HOME=/tmp/cache to both the editing and trusted-check environments. SoFa's scanner currently ignores it. The trusted verification used HOME=/tmp and passed, so the native blocked result is preserved rather than rewritten. The separate editing container intentionally has no GitHub credentials.

## Goals and non-goals

Restore the real scanner check in the actual editing environment and prepare a genuine bounded native delivery. Preserve all verification and independent execution ownership. Do not pass source tokens to the agent, make home caches executable, replace the scanner with a mock, relax checks, build authenticated controls or change product meaning.
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

## Decisions

Use absolute XDG_CACHE_HOME on non-Windows systems and append sofa; ignore relative values and retain ~/.cache/sofa otherwise. Windows continues to use LOCALAPPDATA/SoFa/Cache. This is cache placement, not scanner trust: archive hash, binary hash/version, real secret detection and lock ownership remain unchanged.

Use official upgrade and workflow installation for the verified published tuple. Review ownership before apply and preserve project policies, ProductShape/ArcShape, pending proposals and future holds. No provider publication or private operator configuration change is needed.

The native qualification issue adds exact run attempt/trigger evidence, a useful 1–3 point observer slice. Its issue must state honest browser fixture/live-unavailable coverage in the credential-free editing context; actual authenticated GitHub App CI and source effects remain trusted publisher duties. A full normal verification chain and independent planning/candidate/final reviews remain mandatory.

## Verification

Run a subprocess regression RED before changing scanner selection, then GREEN for absolute, unset and relative XDG roots. Retain actual scanner detection/redaction tests. Reproduce that real scanner test in the pinned editing image with the original noexec mount and XDG supplied; do not widen mounts.

Run npm run verify, Lighthouse foundation verification and generated workflow compilation. Review the final maintenance head independently across all eleven Done dimensions and require current-head hosted verify. Test disabled/out-of-scope native admission locally without modifying credentials or protections.

## Integration and follow-up

Fold/archive this maintenance delta before its final-head review and merge. Native dispatch occurs only after the grant reaches main, with App and runner preflight. Preserve the original blocked run and keep88 open until a new real native delivery provides the complete linked acceptance chain. No workflow success alone is merge, release or deployment evidence.
