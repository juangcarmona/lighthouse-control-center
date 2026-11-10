# Compact repository and issue workspace

The maintainer requested this presentation correction on 2026-11-09: remove repeated headings,
large controls, oversized navigation and repository prefixes that add no information inside a
repository. It extends the existing PR #100 and retains the accepted product/domain definitions.
The UI now names the source objects Repositories and Issues; it does not redefine Lighthouse
missions, workflow state, authorization or delivery evidence.

## Result

| Surface | Implemented behavior |
| --- | --- |
| Navigation | 184px rail, optionally collapsed to 60px; persistent preference and accessible route names |
| Header | One 48px desktop header; existing page refresh moved beside appearance; current identity shown in the rail or narrow header |
| Controls | 32px desktop height, matching Lighthouse's native theme buttons; at least 44px targets on coarse pointers |
| Repository inventory | `/workspace/repositories`; selecting a row opens `/workspace/repositories/{owner}/{name}` |
| Issues | `/workspace/issues` lists cross-repository work; a repository scope shows `#number · title`, textual/color state badges and compact update age |
| Filtering | One compact toolbar; title filtering reacts to input, Enter requests an exact-number lookup; evidence filters and coverage remain inspectable below results |
| Issue detail | Full-width description, no nested issue-body scrollbar, compact actions and optional evidence disclosure |
| Compatibility | `/workspace/factory` remains a list alias; existing source APIs and individual issue URLs remain unchanged |

A scoped repository path takes precedence over contradictory query parameters. An unconfigured
repository path returns 404 after authentication. The shared identity clears after owner-session
401 responses, including issue actions; a delayed initial session response cannot restore an
expired claim. Credentials are never placed in the browser identity widget.

## Verification

- 252 workspace .NET tests passed, including authenticated canonical routes, unknown-repository
  denial, anonymous rejection and safe session display-name availability.
- 94 Node tests passed. The full browser suite passed 87/87, followed by two new focused
  owner-expiry regressions for the issue list and individual issue page.
- Desktop/narrow, light/dark, keyboard, accessibility, semantic badges, collapsed navigation,
  coarse-pointer targets, conflicting path/query scopes and existing authority/cache negative
  cases were exercised. Source actions retain their Prepare/Confirm, CSRF and no-resend checks.
- Markdown, changed C# whitespace verification, secret scanning and `git diff --check` passed.
- Independent review identified stale identity claims, conflicting repository scope and narrow
  touch targets; those findings were corrected and covered before activation.

The [real development receipt](real-development-verification.json) identifies deployed code
`62ff524ddc50fa2525340034250d84d1d2ad01d0` and exact served asset hashes. Trusted HTTPS, actual
Keycloak sign-in and the retained connected GitHub grant showed two repositories. The LCC-scoped
collection displayed 16 issues; the first row started at y128.4375, the header measured 48px,
refresh measured 32×32 and the native theme button measured approximately 37.6×32. The rail
measured 184px and collapsed to 60px. Narrow identity and lack of page overflow were checked;
the issue description used the main content width without a second vertical scrollbar.

Initial live attempts timed out awaiting a fresh GitHub collection; a later read completed and
verified the real rows. No source-latency fix is claimed. Counts retain their partial-coverage
qualification. No issue comment, workflow dispatch or other repository write was performed by
the UI verification, and no production deployment or connected-source action acceptance is
claimed. The earlier source-control permission blocker remains separate from this layout change.

The development service points to a versioned publication; the preceding service override and
binary are retained. Session keys, source grants, protected command storage, provider settings
and GitHub App permissions were not changed for this increment. The
[design contract](../../../../design/control-center.md) records the density requirements and
the README documents the canonical navigation paths.
