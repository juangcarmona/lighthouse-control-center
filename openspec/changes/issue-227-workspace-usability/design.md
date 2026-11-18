# Design

## Composition

Reuse the existing factory reader for a Work board; keep issue state, source label hints and confirmed associated execution distinct. Empty or unread collections never claim successful emptiness. Scope and paging stay visible. The issue reader shows context before action controls and uses one scoped draft store, cleared on recognized source/actor change.

## Display continuity

Retain last successful read-authority receipts in the existing per-owner GitHub session, bounded to configured repositories. Protected document rendering emits only a recent matching scope/actor and readable repository list, after the owner gate. Receipt expiry is the earliest of five minutes, owner idle/absolute deadlines, GitHub verification age and token expiry. Denied reads remove receipts; account replacement/disconnection clears them. No receipt is persisted, and no server query or mutation trusts it for authorization.

The browser validates the document context before opening a bounded ten-minute saved projection. It marks restoration stale and refreshes independently. Source denial, actor/scope change and expiry clear dependent display and drafts. No protected cache opens from a storage-provided identity. Browser fixtures emulate the trusted document boundary explicitly; .NET tests cover real receipt validation.

## Drafts and navigation

One bounded sessionStorage draft per verified scope/actor/repository/issue, maximum ten drafts with a 24-hour upper lifetime and cleanup on authority loss. No command intent, token or confirmation is stored in the draft. Plain text is retained; existing prepare/confirm/source receipt behavior remains unchanged. Navigation/filter preferences live in the URL or session-scoped display projection.

## Verification

Meaningful source tests for expiry, denial and connection replacement; browser regressions for loading/stale/return/draft/mobile/date behavior. Run visual and full browser suites plus npm verify. Capture desktop/narrow and light/dark implementation screenshots; report fixture versus connected-user evidence.

<!-- pdac-scope: cited -->

<!-- pdac:cite id="FR-FACTORY-DISCOVERY" digest="sha256:4ebd9c84897af61f0fb570eaf7a91e17a230b13192f37d470f810cd1984e94f9" -->
<!-- pdac:cite id="FR-PROJECT-WORKSPACE" digest="sha256:9836a4ebc561438e2fb98dcd05fd97bd3e066720f368c620545975321e4f7462" -->
<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="FR-PROJECT-HEALTH" digest="sha256:69da1f100227df86cc26fdad78c38a336e38d039bdedc1c097a1b6a5f4e8dceb" -->
<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
