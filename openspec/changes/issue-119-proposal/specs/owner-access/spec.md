## Purpose

Admit explicitly configured identities while preserving the compatible personal-owner mode and keeping admission separate from source and provider authority.
<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac-scope: cited -->

## MODIFIED Requirements

### Requirement: Owner-only operational access

Lighthouse Control Center SHALL authenticate operational reads and writes on the server and admit only exact explicitly configured issuer/subject pairs. With no explicit operator configuration, only the existing configured owner pair SHALL be admitted. Network location, display name, email or provider sign-in alone MUST NOT grant access. Admission MUST NOT imply project, source or provider action authority.

<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Configured owner enters

- **WHEN** the trusted provider authenticates the configured issuer/subject with the required assurance
- **THEN** the owner can access protected content within configured grants and see the signed-in identity and sign-out action

#### Scenario: Anonymous direct request

- **WHEN** an anonymous caller requests an operational page or directly calls its data or mutation route
- **THEN** a page offers sign-in and an API returns an authentication-required response without protected data or side effects

#### Scenario: Valid but different identity

- **WHEN** a valid callback contains an unconfigured subject or issuer, even with the owner's email
- **THEN** access is denied without issuing an operational session or disclosing protected content

#### Scenario: Explicitly configured additional operator

- **WHEN** the trusted provider authenticates an additional exact configured identity with the existing required assurance and fresh authentication time
- **THEN** a separate bounded session is established with only that identity's configured grants
- **AND** the identity provider remains responsible for authentication and group authority; group claims alone add no local grant

#### Scenario: Personal configuration is unchanged

- **WHEN** the operator-access section is absent and the existing personal configuration is used
- **THEN** the same owner pair, configured repository visibility and previously supported actions remain available subject to their existing source checks
- **AND** no additional identity, provider scope or runtime administration privilege is introduced
