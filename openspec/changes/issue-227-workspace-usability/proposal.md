# Workspace usability

## Why

Issue #227 documents interrupted navigation, lost drafts and an operational workspace dominated by diagnostics. Juan authorized implementation in a dedicated worktree through a PR, with manual coordination. The audit and original prototypes are evidence, not production data.

## What Changes

- Make operational work the sign-in entry and offer a cross-project board over the existing source collection, with explicit source-label versus execution evidence.
- Restore bounded display projections from a server-verified current owner/connection context, refreshing source authority independently; never cache write eligibility.
- Preserve same-actor issue drafts, filters and reading context; lead with issue description.
- Unify mobile navigation, compact dates, shared stale warnings, collection paging and secondary view composition.
- Improve Health investigation using available source evidence, without new metrics or copied scores.

## Capabilities

### New Capabilities

- `workspace-usability`: coherent operational entry, bounded display continuity and accessible source-backed views.

### Modified Capabilities

None. Existing factory, issue operations, runtime and Health source contracts remain authoritative.

## Impact

Native browser assets, workspace document rendering, display-only source-scope receipts, browser/source regressions and revision-bound screenshots. No framework, dependency, authentication grant, workflow, scheduler or product-model change. The five-minute display receipt expires with the current owner/connection and never replaces source checks.

## Product grounding

The artifacts cited below define source identity, explainable board grouping, issue context, available health signals and authorization. Their impact neighbors include project/work/command terms, operator/use cases, source permissions, human decisions and delivery evidence. Those meanings remain unchanged. Provider administration, inferred schedules, aggregate health scores and missing source action permissions remain outside implementation authority. This implements existing intent; no product-definition drift or Product Change is proposed.

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
