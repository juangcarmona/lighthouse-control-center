## Purpose

Keep each operator's explicit GitHub user connection separate from provider login and from other application identities.
<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac-scope: cited -->

## MODIFIED Requirements

### Requirement: Explicit actor-preserving connection

An admitted operator SHALL explicitly initiate GitHub user authorization independently of provider login. Lighthouse Control Center MUST verify the source user, bind the connection to the initiating application identity and session and display the verified account. Email matching, another operator's connection, operator credentials and installation bot tokens MUST NOT substitute for user authority.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->

#### Scenario: Explicit connection

- **WHEN** an admitted operator initiates and completes separate GitHub authorization
- **THEN** Lighthouse Control Center verifies the user through GitHub, associates the returned stable user ID with that application identity and session and displays its account login and source profile link
- **AND** the provider subject and GitHub account remain distinct facts

#### Scenario: Callback belongs to another session

- **WHEN** a GitHub callback is unsolicited, expired, replayed or belongs to a different initiating session
- **THEN** Lighthouse Control Center rejects it and leaves the existing connection unchanged

#### Scenario: Provider login only

- **WHEN** an operator signs in through Keycloak, including with an email matching a GitHub account
- **THEN** no GitHub account is implicitly linked and no source authority is inferred

#### Scenario: Different application identities connect the same GitHub account

- **WHEN** two admitted application identities separately authorize the same verified numeric GitHub user ID
- **THEN** their local connections remain separate and neither receives the other's grants, cache, intentions or receipts
