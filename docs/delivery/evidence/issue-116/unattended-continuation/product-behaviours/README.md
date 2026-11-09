# Executed product behaviour evidence

Recorded 2026-11-09 for `juangcarmona/lighthouse-control-center` (repository ID `1425429121`). Initial source qualification used application `6079e6f7964d0e2c5a992c470489e065131e33b9`. Development now serves `399fcd74649eb5f17fbdfbf295156003226b405e`, including verified source identity and disconnection/replacement handling. All three served issue/action/shared-shell JavaScript hashes match that source. Reports retain their individual application/harness scope. This is development qualification, not main integration, production deployment or product acceptance.

## Product traceability

The inspected baseline has requirement verification scenarios and no Structured Behaviour artifacts. The nine Given/When/Then examples therefore belong to the **draft**, unapplied CHG-LCC-STRUCTURED-BEHAVIOURS-001. Each report retains their identifiers, source hashes, clauses, requirement digests and limitations. Execution does not approve the Product Change or establish every conjunctive requirement.

The initial full fixture browser run passed 89 cases; 20 executed cases contribute evidence to eight proposed examples. The updated full suite passed 90 cases at `eccdcac`; after adding the new recovery case binding, its focused check passed again at clean `9f1e2f8`. The anonymous-access example is exercised against the actual application. Actual source tests use fresh development Keycloak authentication and the application's retained GitHub user grant. No source token, operator CLI credential or anonymous-source fallback is supplied to the application.

The latest full fixture suite at `399fcd7` passed **97 cases**, with 21 mapped cases contributing to eight draft examples. The latest actual-service read/recovery suite passed **five cases in one minute** on the same application and harness revision. Its response-bound authority case also checks that the header names the actual verified GitHub actor.

The [binding ledger](../../../../../../tests/product-behaviours/bindings.json) connects each example to its baseline requirement, exact source digest and executed test names. Read the original result clauses alongside this coverage guide; a contribution is not acceptance of the complete example.

| Draft structured behaviour | Executed evidence and practical limit |
| --- | --- |
| `SB-FIND-REPOSITORY-ISSUE` | Fixture navigation and real configured-repository navigation/exact lookup. The real lookup uses the existing application API after UI navigation. |
| `SB-PARTIAL-REPOSITORY-COLLECTION` | Fixtures inject incomplete collections. The real run observes collection coverage; it does not force GitHub to return a partial collection. |
| `SB-READ-ISSUE-CONTEXT` | Fixtures and real issue title, description, conversation count, source coverage and narrow layout. This does not establish complete historical delivery correlation. |
| `SB-UNAVAILABLE-ISSUE-ACTION` | Fixtures and actual browser controls response. Eligible comments require a visible editor and enabled review; denied actions retain their source explanation. No dispatch is performed by this case. |
| `SB-ORDINARY-ISSUE-COMMENT` | Fixture confirmation plus a separately opted-in real prepare/send and confirmed GitHub comment identity. Later read/recovery runs do not publish another comment. |
| `SB-UNCERTAIN-ISSUE-COMMENT` | Fixture response-loss injection, retained failed real send and separate exact-comment recovery with zero prepare/submit requests. The passing recovery alone does not prove a new response-loss event. |
| `SB-EXPLICIT-QUESTION-CONTINUATION` | Fixtures only. Actual current-question/continuation acceptance remains open; missing source policy input is not a passing continuation result. |
| `SB-UNRESOLVED-INTERVENTION` | Fixtures only. No actual pending intervention was resolved or accepted by these runs. |
| `SB-ANONYMOUS-WORKSPACE-DENIAL` | Actual application rejects the unauthenticated protected issue request without returning issue content. This contributes to `QR-EXECUTION-SECURITY`, not every security boundary. |

## Executed results

| Evidence | Result and scope |
| --- | --- |
| `fixture-6079e6f/` | Full browser suite passed; mapped results are integration evidence using simulated source responses. |
| `live-c8f8231/` | Five actual-service cases passed in 59.3 seconds: repository navigation/exact source lookup, issue description/conversation, unavailable-action explanation, anonymous denial and existing-comment recovery. Its anonymous evidence initially cited a business rule, which the official evidence verifier rejects. The replacement run uses QR-EXECUTION-SECURITY; the original report is retained without alteration. |
| `live-498da8c/` | Final corrected read/recovery suite: five cases passed in 1.1 minutes. The original three retained passing report documents validate through the official ProductShape evidence command with no diagnostics. |
| `live-recovery-f3b382a/` | Actual recovery passed in 17.3 seconds. The report retains source comment ID, actor, source link and zero prepare/submit requests. |
| `fixture-eccdcac/` | Updated full browser suite: 90 passed, with 20 mapped cases under the earlier binding ledger. |
| `fixture-guidance-9f1e2f8/` | New existing-action guidance case passed at the clean head with its explicit partial ordinary-comment binding. |
| `live-guidance-9f1e2f8/` | Five read/recovery cases passed against the updated development binary in 1.1 minutes; recovery matched comment 6752272812 with zero prepare/submit requests. |
| `live-settled-78f40e6/` | Two read-only cases passed after requiring source checks to settle. The context capture shows a settled unavailable-controls state; it establishes issue reading, not comment readiness. |
| `live-authority-2d7f3f8/` | The stricter case passed using the actual browser controls response. An eligible comment requires a visible editor and enabled Review comment; a generic fallback cannot satisfy that branch. |
| `live-authority-be24388/` | The same stricter case passed with an explicit settled action-authority capture. Actual Refine/Propose/Continue restrictions remain visible; no source write occurred. |
| `live-publication-4a7ca88/` | Fresh full publishing case passed: one prepare, one submit, confirmed GitHub receipt, refreshed conversation and explicit receipt/comment captures. Together with the five read/recovery cases, six real-service cases have passed across the recorded runs. |
| `failed-fixture-1dbcfb4/` | Full suite failed: 96 passed and one retained pagination test rejected changed status wording. Its mapped subset passed, so the original full Playwright log is retained alongside the reports. This is not a passing full-suite receipt. |
| `fixture-identity-399fcd7/` | Corrected full suite passed all 97 cases in 2.3 minutes, including both old/new account-change checks, disconnection, same-scope denial/conflict and no-resend cases. Status wording was corrected; existing data-removal assertions were retained. |
| `interrupted-live-identity-399fcd7/` | First sign-in failed; the next worker authenticated and passed issue reading. The operator then interrupted the next case; two did not run. The original report keeps failed/interrupted outcomes. No publication was requested. |
| `live-identity-399fcd7/` | After a separate successful sign-in diagnostic, all five real read/recovery cases passed in one minute. Five sanitized captures and the original Playwright log are retained. Recovery matched comment 6752272812 with zero prepare/submit requests. |
| `failed-existing-confirmation/` | A preparation left an unsubmitted intent; the test inspected stale confirmation text and could not click send. No source effect occurred. |
| `failed-existing-preparation/` | The corrected preparation assertion exposed `existing`, preventing substitution of the prior intent. No source effect occurred. |
| `failed-prepared-capture/` | Explicit recovery confirmed and sent the original unsubmitted intent once. Functional source assertions passed, but capture after refresh failed because refresh clears the receipt panel. This case remains failed. |
| `failed-publication-first/` | The first publishing case timed out. No corresponding source comment was observed. Its precise blocked step was not established. |
| `failed-publication-second/` | The instrumented publishing case reached submit, then its 15-second response wait expired. GitHub subsequently confirmed the action. This test remains failed. |

The final harness waits for the current prepare response and verifies its intent matches the entered body. It captures the receipt before source refresh clears it. It also waits for current comment authority before entering the draft, bounds navigation and allows 45 seconds for a server operation's receipt. Publication remains opt-in, without retries. Recovery requires an exact existing source comment ID and never prepares or submits another action.

## Confirmed source effect and recovery

The application published [comment 6751624256](https://github.com/juangcarmona/lighthouse-control-center/issues/116#issuecomment-6751624256) at `2026-11-09T21:13:57Z`, attributed to GitHub user `2834629`. Its body requests no continuation and carries the shared ordinary-comment marker. The source timestamp follows the failed test's response wait; a timeout did not establish absence of an effect.

The separate recovery cases recovered or reconciled the original journal entry, matched that exact source URL and comment ID, checked `questionResolved: false`, found the original body in the source conversation, and asserted zero prepare/submit requests. No replacement comment was posted. These results establish ordinary-comment effects and recovery, not delivery of issue #116 or successful Refine/Propose/Continue.

The unsubmitted intent was later explicitly recovered and confirmed once as [comment 6752210620](https://github.com/juangcarmona/lighthouse-control-center/issues/116#issuecomment-6752210620). Its test failed only at a screenshot after source refresh; its original failure is retained. After that confirmed outcome, a fresh generated intent completed the full publishing case as [comment 6752272812](https://github.com/juangcarmona/lighthouse-control-center/issues/116#issuecomment-6752272812), created at `2026-11-09T21:44:35Z` by the same verified user. Each has a distinct intent and source comment ID. No claimed or uncertain intent was resubmitted, no journal row was changed directly, and no protection was relaxed. [Confirmed source metadata](confirmed-source-comments.json) records all three test effects.

## Quality and authority boundaries

The full application verification at `6079e6f` passed 104 Node tests, 267 workspace .NET tests, 38 retained-runtime tests and 89 fixture browser cases, together with product/model checks, 17 strict OpenSpec changes, current citations, documentation, secrets and architecture checks. It exercises compiled module boundaries, evaluated Roslyn activation, independently rejected LH1001/LH1002 compiler fixtures and frontend module/transport boundaries. [Hosted repository verification](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42698348644) and [foundation verification](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/42698346916) also passed. The added receipt reporter regression raises the Node suite to 105 passing cases. Updated guidance verification passed all 90 fixture browser cases, 18 strict OpenSpec items, 216 current citations and documentation lint. Independent review approved exact `9f1e2f8` for partial integration/development qualification; protected product/source acceptance remains open.

Identity qualification passed 105 Node tests, 19 strict OpenSpec items, 220 current citations and the final 97-case browser suite. The selected different-model reviewer approved `399fcd7` for development activation after that full rerun; this is a delegated engineering review, not a forge approval. [The activation record](development-identity-activation.json) retains source fingerprints, three terminal/zero nonterminal journal entries before restart and rollback availability. No credential, journal row, provider permission or private store was changed by activation.

`actual-source-authority.json` records real source reads after development activation. Ordinary comments are eligible for the Control Center repository. Refine/Propose remain denied by the actual App Actions grant; Continue lacks its policy input. Lighthouse repository control-contract support is separately unavailable. No grant was broadened to obtain a pass. Actual dispatch and current pending-question acceptance remain open under #48/#51.

Actual identity/source E2E remains outside PR/push CI. Private CA validation is enabled. Live tracing, video and automatic screenshots are disabled; retained images were explicitly captured after authentication. No cookies, passwords, raw private configuration or token-bearing traces are included. The previous development binary and service override remain available for rollback.

A settled unavailable-controls state occurred in one context capture while a separate API preflight was available. A later direct browser observation and the stricter response-bound case both showed available comment controls. The cause of that intermittent unavailability is unresolved; these passing checks do not establish its correction. Original captures remain intact. Independent review approved the stricter harness at `be24388a56933c75f61ea7a28f64f6542b2eff75`.

The initial sign-in failure after the latest activation is also unresolved. A separate [readiness diagnostic](signin-readiness-diagnostic.json) subsequently reached the real issuer form and an authenticated application session, followed by the passing five-case run. No authentication setting or test was weakened. A later pass does not identify or correct the first failure's cause; cold-start/session robustness remains an acceptance limitation.

## Artifacts and reproduction

Use the explicit parameters in [the test instructions](../../../../../../tests/README.md). The existing publishing failures must not be replayed as automatic write retries. The read/recovery suite uses `--grep-invert 'live ordinary comment is confirmed'`, the selected repository/issue and exact recovery comment ID.

[Repository](repository.png), [issue](issue.png), [narrow issue](issue-narrow.png) and [recovered comment](recovered-comment.png), [fresh confirmed receipt](confirmed-comment.png) and [exact source comment](source-comment.png) are Playwright captures. [The manifest](manifest.json) identifies application/harness revisions and hashes the copied artifacts. Reports are original reporter outputs, not reconstructed passing claims.

ProductShape's current evidence verifier requires v1alpha2 configuration. Verification uses a disposable view containing 87 byte-identical baseline Markdown artifacts; tracked v1alpha1 adoption remains unchanged. Twelve passing-suite report documents validate with zero diagnostics; failed/interrupted suites are excluded from that count and retained separately. The report validation outcome is recorded alongside the final run. A valid report schema does not replace application/source acceptance.
