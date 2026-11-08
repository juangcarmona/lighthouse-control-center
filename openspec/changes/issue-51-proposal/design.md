# Intervention projection and source confirmation

<!-- pdac-scope: cited -->

## Existing implementation

Reuse `GetFactoryPageHandler` for configured repository pages (25 raw records, at most ten explicit pages), `GetIssueContextHandler`/`GetIssueEvidenceHandler` for the same shared reader, and the existing source authorization/generation/stop guards. The current factory collector exposes partial pages and raw PR exclusions. Its report summaries are historical observations, not current-question eligibility. The accepted source boundary remains repository execution independent of SoFa.

Add the protected inbox HTML/static assets through the existing workspace module. Keep the query adapter read-only. Initial navigation can collect the first bounded page per configured repository; Load more and Refresh explicitly extend/restart that scope. Do not introduce a parallel collector service, cache authority, execution store or transition machine.

## Read-only projection first

A source label such as needs-info or waiting-review is a labeled wait with that exact reason, not proof of a question, approval, responsible approver or live lease. Show unread/unknown context explicitly and link the shared issue detail. Optional historical report reads retain their own source identity and uncertainty. A workflow status of waiting alone is not a confirmed human intervention. Unsupported workflow approvals and protected actions link to their actual GitHub source when known and state the limitation.

A verified current question comes only from the shared source contract supplied by #47/#48 after compatible public release/adoption. The inbox consumes that result; it does not approximate pending-question or reservation rules from labels/artifacts. Until available, render the read-only collection and an explicit unsupported current-question/action state. No local fake question, actor or successful resolution fills that gap.

## Identity, ordering and time

Use stable repository/issue source identity plus request kind and original source identifier (question comment/execution request; explicit PR/head/review context when supported). Repeated observations reconcile one key. Multiple different contexts on the same issue remain separate. Suppress a label placeholder only when verified source evidence identifies that same wait; never collapse unrelated reviews/questions by issue number alone.

Preserve source-created/source-updated times and successful observation time separately. A label-only row can show issue-updated age; it cannot claim the wait started then. A verified question uses its source comment time. Default ordering groups confirmed current requests, incomplete source-labeled waits and unavailable/stale contexts, then uses source time with a stable identity tie-breaker. Explain this grouping and any user-selected sort; age alone never establishes urgency or permission.

## Actions, races and resolution

All links enter the same #50 issue reader with exact context. Supported comment/Continue controls are supplied by #48 and keep their distinct effects. Before a write, that adapter recollects current source authority and persists/reconciles its intent. The inbox never calls an executor, changes a label or duplicates the command journal.

Viewing, ordinary commenting, submitting, rejection, failed execution and uncertainty leave the wait unresolved. Consume the shared source-confirmed continuation/result or a complete fresh source observation proving that the context is no longer current. Preserve explicit resolved/superseded history with its proof; missing pages, unavailable reads and disappearing local filters cannot prove resolution. If a newer verified question replaces one, show that source supersession rather than inventing successful completion.

Scope every response to the owner session, acting GitHub account, source generation and repository authority. Account/repository denial removes affected private rows, counts, questions and actions; a late old-scope response cannot restore them. Same-scope transport failure may retain clearly stale source times with actions disabled. Failed refresh does not advance source-observed time. Retain keyboard focus by stable request identity and handle a removed/replaced row accessibly.

## Verification and rollout

Cover new/repeated requests, two contexts on one issue, label-only unknown questions/actors, stale data, incomplete pages, malformed source times, revoked permissions, late old-account responses, a source-resolved or replaced question, ordinary comment, rejected/uncertain response and unsupported approval fallback. Exercise the protected backend and browser behavior at narrow viewport, light/dark, keyboard and safe text/link rendering. Reuse shared adapter denial/receipt tests rather than a second policy suite.

Run `npm run verify`, configured CI and independent review of all eleven Done dimensions. Use the existing real-identity host lane; actual connected-user inbox/current-question/continuation proof remains separate from browser fixtures. The owner deferred physical-phone rehearsal; do not request it again or claim it ran. A read-only code checkpoint can be previewed and reviewed while controls remain unavailable, but complete #51 acceptance needs #50/#48 dependencies and the real pending/resolved source trace. Rollback removes the new view/navigation and preserves repository execution, source records and existing issue controls.

<!-- pdac:cite id="UC-RESOLVE-INTERVENTION" digest="sha256:c431ce770ce77f9212138e76558d6bd99641231a54ecc39231a673d1dc929b2b" -->
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->
