# Workspace design and acceptance specification

Proposal for manual review under [#227](https://github.com/juangcarmona/lighthouse-control-center/issues/227). Sample records are invented. This document specifies behavior to evaluate; it does not approve product or architecture changes.

## Information architecture

| Destination | Operator's question | First useful content | Secondary content |
| --- | --- | --- | --- |
| Work | What is planned, queued, running or waiting for me? | Cross-project scope and work groups | Grouping evidence, coverage, individual execution records |
| Repositories | Where is the project I need? | One row per configured repository, access and direct work link | Configuration/permission detail |
| Issues | Which issue am I looking for? | Compact searchable rows using the same records as Work | Exact lookup, paging, labels and coverage |
| Issue | What is this, and what should happen next? | Title, state, source context and any verified question | Conversation, full source identifiers, recorded events |
| Attention | Which question or decision needs me now? | Explicit source questions/decisions | Independently retrying work and evidence problems remain separate |
| Health | Which evidence should I investigate? | Project exceptions and comparable evidence rows | Check definitions, contributing runs, source gaps and history |
| Runtime | What is known about the runtime? | Resource registration and observed provider state | Exact records, capabilities and authorized operations |
| Account | Which identity and connection am I using? | Actor, connection status and relevant recovery | Permissions, expiry, disconnection and sign-out |

Account stays a secondary route. Existing source-object vocabulary remains Repositories/Issues. A board card is not a new domain object. Public documentation references remain outside the primary operator task.

## Desktop composition and visual cues

- One 184px rail, one 48px application header, compact 32px controls and 15px body type. The proposal review bar is outside the application shell.
- All configured projects have a visible entry near the top. Work cards use project, issue identity, title, one useful signal, next step and age. No repeated permission paragraph per card.
- Five work groups use available width at 1440px; intermediate layouts wrap. Empty groups retain their count/header without large empty panels. Board/list read the same sample collection.
- Line icons carry consistent roles beside text. Blue identifies navigation/actions; caution marks a decision or uncertainty; negative marks a concrete failed/below-floor result. Unknown is not automatically a failure.
- Tables align like facts for comparison. Independent data sources do not share a generic green “healthy” label.
- Exact IDs, revisions and dates remain available in labelled source details. A relative date does not replace its exact value.

## Board semantics to decide before implementation

| Group | Minimum evidence | Insufficient evidence |
| --- | --- | --- |
| Future | Explicit applicable future hold in the source policy | An old issue or guessed future date |
| Queued | Acknowledged source request/admission, with identity and current validity | `ready`, a stage label, or an issue merely being open |
| In progress | Active source execution explicitly associated with this work | Any running repository workflow |
| Needs you | Current source question/decision with required actor/context | A crash still retrying independently |
| Unclassified | No supported grouping or unresolved conflict | Silently assigning the most convenient group |

Proposed display precedence: verified human wait, associated active execution, acknowledged queue, explicit future hold, then unclassified. This is a review question, especially where a future hold conflicts with an active execution or source records disagree. Keep all signals visible in detail; do not erase a conflict by choosing a column. An owner decision and source-contract mapping are required before changing accepted product semantics.

No drag-and-drop: navigating a board cannot change lifecycle or schedule work. Every real action uses Lighthouse's current source semantics, existing confirmation and result evidence.

## Mobile behavior

A named menu reveals all routes and returns focus to its trigger when dismissed. The current destination remains visible in the header. Repository scope is selectable without horizontal scrolling. At 390px the board initially shows Needs you, with counts and a group selector; the operator can select active/future/all or use the list. Desktop and mobile retain the same data and grouping.

Comparison tables become labelled rows. Source details use a bounded native dialog, Escape and deliberate focus return. At 320px/200% text, long identities wrap rather than disappear. Verify each screen, including opened dialogs/menu and validation feedback, rather than relying on a global overflow check.

## Continuity and cache state matrix

| State / transition | Display | Action rule | Evidence needed in implementation |
| --- | --- | --- | --- |
| First visit, no usable saved data | Stable shell and loading placeholders | Current authority still required | No confirmed-empty text before successful collection |
| Return within permitted verified scope | Last display immediately with age/refresh marker | Saved display never enables writes | First retained row timing, stable scope/filter/scroll/disclosure |
| Background refresh succeeds | Update changed rows and last-checked time | Recheck relevant current authority for action | No reset of draft, selection or scroll; explain removed records |
| Refresh returns 503/timeout | Keep last permitted display; one warning and retry | State current uncertainty beside affected actions | Retained row identities and original ages; retry outcome |
| Saved view expired | Explicit expired/loading state per agreed retention policy | Do not silently treat expired data as current | TTL and retention tests, no false empty |
| Current actor/repository scope changes | Remove prior protected display and clear its draft per policy | Fresh read/authority for new scope | Actor switch and cross-repository isolation |
| 401/403 or explicit revocation | Remove protected saved content; recovery route | Deny source actions | Actual revocation/authority-loss qualification, not just a simulated screen |
| Successful empty collection | Scoped empty message and next navigation | No inferred fleet-wide absence | Received scope, collection success and count |
| Filter has no matches | Retain scope/filter and offer clear/change filter | No change to source state | Distinct from empty source and failed collection |
| Partial pagination | Collected count, partial coverage, visible load more | No claim of full backlog | Preserve added pages on return or explicitly describe reset |

Candidate review targets: retain a permissible existing display within **200ms** of a same-session view return; preserve identity/row count during a delayed refresh; make all configured projects reachable in the first desktop viewport. These are proposed targets, not measured production results or promises. Establish a repeatable baseline and a safe verified-scope design before using them as acceptance thresholds.

Draft policy needs explicit storage location, lifetime, actor/repository/issue key, cleanup on loss of authority, multi-tab behavior and sensitive-content handling. The prototype proves only a fixed-demo-identity sessionStorage interaction. A real source action also needs prepare/review/confirm, current authority and a source receipt. Uncertain write outcome must offer source reconciliation before retry.

## Screen-state coverage

| Interaction | Required states | Covered in prototype | Still requires application evidence |
| --- | --- | --- | --- |
| Work/list | First load, restored, refreshing, empty, no match, stale, revoked | State selector, filter/list/return | Actual read cache, authority and latency |
| Issue draft | Empty validation, dirty, saved, restored, scope change | Same sample issue retained; different issue isolated; literal preview | Real actor switch, expiry, revocation and conflict policy |
| Comment/answer | Review, confirmation, pending, success, rejected, uncertain | Review only, explicitly nothing sent | Source prepare/confirm/result and recovery |
| Health | Measured, failed, unavailable, not applicable, history gap | Sample check evidence and provenance | Live producer trust, definitions and exact revisions |
| Runtime | Available read, partial, unavailable provider | Separate local/provider columns and shared warning | Actual provider query and authorized operation |
| Navigation | Desktop, menu, deep link, back, appearance | Links, URL filters, menu, theme persistence | Auth callback/return and all real routes |

## Manual acceptance tasks

1. Start a new session, sign in, find a project and open a known issue. Capture landing route, first useful content and successful deep-link return.
2. Find an issue by title and exact number outside the first page; switch board/list without changing scope. Compare collected counts and loaded pages.
3. Write an answer, open another route, return and reload. Confirm correct draft, reading context and filters. Repeat after actor/scope change according to the agreed policy.
4. Return with slow reads. Retain the last permitted display while refreshing; inject 503 and recover. Separately qualify 401/403 and revocation in an authorized test environment.
5. Identify what needs a person and what is still executing independently. Open the exact question/run. Explain every group using current source receipts.
6. Investigate a Health concern through project and check to exact run/revision. Repeat with absent producer, stale source, missing history and not-applicable deployment.
7. Inspect runtime with provider access absent. Distinguish local registration from availability; locate the recovery route without interpreting missing data as zero capacity.
8. On 390px and 320px/200% text, repeat navigation, project selection, reading, draft and source detail by keyboard and touch. Check both themes, system theme, focus and a screen reader.
9. For an explicitly authorized real operation, retain prepare/review/confirmation and exact source outcome; reconcile uncertainty before retry. A visible button or successful unrelated workflow is insufficient.

Record completion/failure, route, source revision, viewport/theme, task time, mistakes, lost context and the operator's interpretation. Compare with the initial audit; do not turn exploratory samples into an SLA. Juan's manual review remains distinct from CI and prototype checks.

## Proposed slices and product decisions

The eight slices in [README.md](README.md) form the draft epic. Existing visual-contract corrections can be scoped separately from new semantics. Resolve these before implementation: grouping precedence/conflicts; queue/source associations; draft custody; which Health producers are authoritative; whether retained history is in scope; and the canonical mobile default. Product Change/ADR work follows only where the actual product or architecture decision requires it.
