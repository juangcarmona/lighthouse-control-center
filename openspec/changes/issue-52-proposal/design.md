# Factory discovery design

<!-- pdac-scope: cited -->

## Source and server boundary

Add an internal query handler and protected GET routes inside the established workspace module. Only configured repositories are accepted. Recheck effective connected-user issue authority before any metadata or issue collection, use the mandatory atomic source request guard, and bind all returned records to connection scope/generation. There is no operator credential fallback. Disconnect/replacement cannot start a subsequent old-token read or return prior-scope rows.
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->

Read fixed GitHub repository/issue paths. Pages contain at most 25 source issue-shaped records, excluding PR records from issue results while preserving raw page coverage. Permit pages1–10 with an explicit Load more operation; the response cap remains2MiB and a request has a35-second budget. Reaching a bound leaves coverage incomplete. Title search and local filters cover collected rows only, prominently stated; exact-number search reads that ordinary issue directly across the selected configured repositories. No source query syntax comes from search text. A four-MiB retained browser collection bound rejects an entire further page, preserves prior rows and exposes incomplete coverage; it never silently drops a page or automatically retries it.

Accept an optional repository-to-default-branch configuration map while preserving existing repository-only configuration. A source default branch is a separate observed fact. Show configured/observed disagreement and unavailable values without changing registration or permissions. All source collection times, issue update times, page coverage and failures are independent fields. Missing authority clears related rows; transient failure retains explicitly stale same-scope display only, with current totals unknown.
<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:18b4ae82857bb3098cb0b39f7cdfce4e0e9f308f23907f66d876b8c572b12bbf" -->
<!-- pdac:cite id="FR-PROJECT-DISCOVERY" digest="sha256:834d2e20c321db40d8151f30c5b9f26075f7fa3068b6b13dfc6b68ae62bea427" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->

## Presentation and evidence

One page owns a bounded collection keyed by repository/issue ID. Both list and board apply the identical predicate. The board groups by open/closed source issue state; it never guesses a lifecycle from state. Source labels remain labels, including overlapping waits. Explicit per-issue evidence loading reuses #50's issue-page/evidence handoff and installed validator; validated report stages and exactly linked run statuses are historical associated evidence, never proof of a current reservation or command eligibility. Unread, unsupported or conflicting facts remain visible and filterable as unknown/multiple. Filtering incomplete evidence cannot prove absence.
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->

Filters and view selection survive navigation/refresh through URL state. All cards open the same existing issue workspace. Project detail includes source metadata, collected work, source links and explicit health/configuration limitations; #57 supplies richer signals later. Add primary factory navigation to existing account/operations/issue pages without changing authentication callbacks.

Use existing Lighthouse tokens, semantic controls, visible focus and inert DOM text; no remote images or source HTML. Do not add drag-to-transition or a framework. Test keyboard and390px layouts. Physical-device proof remains unclaimed at the owner's instruction.
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->

## Trade-offs and verification

Explicit bounded REST pages reuse the installed transport and avoid a new query language/parser. A large source page can exceed the existing response limit; report it unavailable with a GitHub fallback, never empty. Collected-title search offers immediate useful discovery and states its limit instead of implying exhaustive source search. A future indexed source query can be a separate improvement if this bounded behavior proves insufficient.

Tests cover two repositories, ordinary/closed issues, PR exclusion, second page, exact issue outside the collection, invalid scope/page, source denial/failure, generation invalidation, metadata conflict and unknown evidence. Browser tests compare list/board results under combined filters, multiple waits/unknown stages, preserved navigation state, stale-vs-empty/failure, safe source text and keyboard/narrow layouts. Run npm run verify and existing hosted checks; independent planning and implementation reviews remain gates.
