---
pdac-scope: cited
---

# identity-environments Specification

## Purpose

Keep isolated password-based development identity and external multi-factor identity as explicitly selected, separate configurations without weakening owner admission.

## Requirements

### Requirement: Isolated development composition

The development startup SHALL compose SoFa and a dedicated version-pinned identity provider with non-secret test realm/client configuration. It MUST NOT start production identity connectivity, the retired supervisor or an execution database.
<!-- pdac:cite id="UC-ACCESS-FACTORY" digest="sha256:a1636b3cd8f0bce9d58c51beca3b349491e8e1f50de2cd10366f9effc9ce46a7" -->

#### Scenario: Development startup

- **WHEN** the configured developer starts the existing Aspire solution
- **THEN** the application and dedicated test provider start with recorded version pins and test realm/client settings
- **AND** no production provider, supervisor or execution database is started

#### Scenario: Missing development credential configuration

- **WHEN** required local test credentials have not been supplied
- **THEN** startup reports a safe configuration failure without falling back to production credentials or committing credentials into the realm seed

### Requirement: Reachable protected endpoints

The application and selected issuer SHALL expose stable HTTPS addresses reachable by the desktop and real phone on the permitted LAN/VPN. Redirects MUST use exact registered callback addresses and trusted certificates without disabling certificate validation.
<!-- pdac:cite id="CON-TRUSTED-LAN" digest="sha256:e9cb07b2f01016597b13223fa0f517b9be7f56b26354042f99fc79591e124edd" -->

#### Scenario: Phone follows redirects

- **WHEN** the owner signs in from a real phone on LAN/VPN
- **THEN** issuer, application and callback addresses resolve and are trusted on that phone
- **AND** redirects do not depend on desktop loopback addresses

#### Scenario: Callback origin is not registered

- **WHEN** an authorization request uses an unregistered callback or untrusted origin
- **THEN** authorization fails without creating an application session

### Requirement: External issuer configuration

The same application boundary SHALL accept an externally configured production issuer and client without provisioning that provider. Development accounts, clients, callbacks and credentials MUST remain separate; configuration validation MUST reject mixed environment settings.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Alternate external issuer configuration

- **WHEN** an isolated configuration test supplies an external issuer profile
- **THEN** the application selects only that issuer and client and creates no provider resource
- **AND** the test requires no production credential or live production login

#### Scenario: Mixed environment settings

- **WHEN** development mode references production-profile client or callback settings
- **THEN** configuration validation rejects the combination before authentication is enabled

### Requirement: Shared identity guidance and runtime proof

Delivery SHALL record the adopted Lighthouse package and matching identity guidance, and verify the implemented boundary against that contract. Documentation, package restoration and provider discovery MUST NOT substitute for actual sign-in and source-identity evidence.
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Delivery evidence review

- **WHEN** the developer presents the completed authentication slice
- **THEN** evidence identifies the adopted package, matching guide revision/hash, runtime pins, real Keycloak sign-in and actual GitHub user connection
- **AND** owner-reported preliminary probes are distinguished from the implementation's own results
