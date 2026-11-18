# Workspace usability

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

## ADDED Requirements

### Requirement: Continuous source-scoped workspace

The workspace SHALL lead with operational work, retain permitted source identity across views, explain board grouping and preserve reading/draft context within its verified scope. Display restoration SHALL NOT grant source action authority.

#### Scenario: Return while source refresh is slow

- **GIVEN** a protected document contains a recent matching display-only read context
- **WHEN** the operator returns to a saved view
- **THEN** the permitted previous projection is visible as stale while fresh source checks run
- **AND** unknown or denied source access does not become a successful empty collection

#### Scenario: Source identity or authority changes

- **WHEN** a source denies a repository, the owner session expires or the connected actor/scope changes
- **THEN** dependent cached display and drafts are removed and recovery is shown
- **AND** no cached eligibility enables a source operation

#### Scenario: Read and respond from a narrow layout

- **WHEN** the operator opens an issue from the board or list
- **THEN** context, next permitted actions and source evidence remain distinguishable
- **AND** navigation, a scoped draft and action confirmation remain usable by keyboard and at narrow widths
