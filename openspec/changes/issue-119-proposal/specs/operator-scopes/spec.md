## Purpose

Bound each admitted operator's observations and requests to explicit project and provider/resource grants without replacing upstream authority.
<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac-scope: cited -->

## ADDED Requirements

### Requirement: Explicit non-inheriting grants

Each identity SHALL receive explicit grants for named targets, permissions and actions; a grant MUST NOT imply another permission or target, and an action grant requires read on its target.

<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: No inheritance or implicit visibility

- **WHEN** an operator has read on project A, operate on an explicitly allowed action in A and admin on a named provider resource
- **THEN** those grants confer no access to project B, another resource, another provider or an unlisted action
- **AND** application admin does not confer repository ownership, human approval authority or runtime authority

#### Scenario: Missing mapping

- **WHEN** an admitted identity has no grant covering a requested project/provider/resource/action tuple
- **THEN** the dependent read or action is denied without protected data or upstream mutation

### Requirement: Invalid access configuration fails closed

Explicit access configuration SHALL reject duplicate identities, ambiguous mappings, unknown target references, unknown grant verbs, wildcard targets and action grants without matching read grants. A present but empty or invalid operator configuration MUST NOT fall back to legacy owner grants.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Invalid mapping at startup

- **WHEN** explicit configuration contains an invalid identity, grant or target mapping
- **THEN** protected operational startup fails with a sanitized configuration explanation rather than enabling a broader default

### Requirement: Scope changes require fresh sessions

Access configuration SHALL take effect only through validated application restart, which invalidates prior local sessions, connections and reusable authority. Editing configuration alone MUST NOT be represented as applied revocation. A removed identity or scope MUST be denied under the newly active configuration.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Grant removal is applied

- **WHEN** the administrator removes operator A's project grant and restarts with the validated configuration
- **THEN** A's old cookie, connection, cache and intention cannot authorize access
- **AND** a fresh admitted session cannot read the removed project or replay its old receipt

#### Scenario: Configuration is edited without restart

- **WHEN** access configuration has been edited but the application has not restarted
- **THEN** the active policy remains unchanged and documented instructions require restart to apply the change

### Requirement: Protected projections are scoped server-side

Protected lists, details, filters, account projections and counts SHALL include only records allowed by current local and authoritative read permissions. Provider/resource identifiers MUST be qualified by provider scope.

<!-- pdac:cite id="ACT-OPERATOR" digest="sha256:3c7098ab0c9185df4aa56b88f3837b6aedf1f56362bb3a718e90260c531f47dd" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Two operators and one denied identity

- **WHEN** admitted A reads only project A/provider P/resource X and admitted B reads only project B/provider Q/resource Y
- **THEN** their direct API lists, details, account projections and counts contain only their own permitted data
- **AND** an unadmitted C cannot establish a protected session or read either set

#### Scenario: Cross-scope identifiers are guessed

- **WHEN** A requests B's project, provider, resource or receipt identifier directly, including a same-named resource in a different provider
- **THEN** the response reveals no protected data or existence distinction from an unknown out-of-scope target

### Requirement: Actions intersect independent authority

A supported action SHALL require a live admitted session, matching local grants, current acting-user authority and supported source/provider capability. Missing or unverifiable authority MUST block submission.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="BR-PROVIDER-OPERATIONS" digest="sha256:d341e8822a5a44a5cc2b67b5a79f37a1a106ba3e0b77a2566e1ad567dce3bf87" -->

#### Scenario: Read-only or locally privileged actor lacks authority

- **WHEN** a read-only operator requests a mutation, or an operator with operate/admin lacks current required upstream authority
- **THEN** the direct action request is blocked and no upstream mutation is sent

#### Scenario: Qualified supported action

- **WHEN** all independent local and authoritative checks succeed for an existing supported action and its current target
- **THEN** the request uses the existing authorized source/provider entrypoint and preserves its confirmation, correlation and source enforcement
- **AND** local admission is not described as upstream acceptance or completion

### Requirement: Unsupported capabilities remain unsupported

Unsupported Lighthouse v1 non-owner writes and unimplemented provider operations MUST remain unavailable; the application MUST NOT substitute other credentials or privileged helpers.

<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->
<!-- pdac:cite id="BR-PROVIDER-OPERATIONS" digest="sha256:d341e8822a5a44a5cc2b67b5a79f37a1a106ba3e0b77a2566e1ad567dce3bf87" -->

#### Scenario: Local admin requests unavailable effects

- **WHEN** an in-scope local admin requests a non-owner Lighthouse v1 write or an unavailable provider operation
- **THEN** it is explained as unsupported without any mutation, fallback credential or claim of successful execution

#### Scenario: Distinct action outcomes

- **WHEN** an in-scope caller encounters a missing capability, denied authority or a supported action that is submitted
- **THEN** the response distinguishes those outcomes without representing a denial or unavailable capability as submission

### Requirement: Permission precedes reuse

Observations and coalesced reads SHALL be reusable only within the same admitted identity, live session, current connection generation and permitted scope. Current permission MUST be checked before reuse and before publishing completed reads. Sharing a GitHub user ID MUST NOT allow cross-identity or cross-session reuse.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Same source account with separate identities

- **WHEN** A warms a cache and B independently connects the same GitHub user ID with a different local scope
- **THEN** B cannot reuse A's cache or coalesced request; B's authority is checked independently

#### Scenario: Safe coalescing within authority

- **WHEN** concurrent reads share the same live identity, session, connection generation and read scope
- **THEN** bounded observation coalescing remains available after permission checks without sharing across a different authority binding

### Requirement: Intentions and receipts preserve authority provenance

Intention confirmation, submission and receipt lookup SHALL verify identity, session, connection, scope and permission. Receipt IDs MUST NOT grant access, and invalidation MUST NOT make an uncertain request eligible for resubmission.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Receipt replay from another binding

- **WHEN** another identity, session or replacement connection presents a recorded receipt or intention identifier
- **THEN** it cannot retrieve protected contents, confirm or submit the old intention
- **AND** the existing duplicate/uncertainty record remains effective without automatic resend

### Requirement: Invalidation defeats late responses

Logout, expiry, recognized revocation, applied scope removal, disconnect, permission loss and account replacement SHALL invalidate affected authority. Late reads or callbacks MUST NOT restore it or publish protected data under the old binding.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Concurrent replacement during a read

- **WHEN** a controlled read or authorization callback is paused, the source account is replaced, and the old response then completes
- **THEN** neither old observations nor old authority are published or restored and the replacement's data remains isolated

#### Scenario: Expiry, logout and revocation races

- **WHEN** logout, idle/absolute expiry, recognized revocation or source permission loss occurs before a pending read is released
- **THEN** the next protected request and the late response cannot return affected protected data or reuse an old intention or receipt
- **AND** provider revocation not yet recognized retains only the existing five-minute revalidation bound, not an instant-detection claim

### Requirement: Existing security boundaries remain effective

All operators SHALL retain existing OIDC assurance, bounded session, CSRF, exact HTTPS host, no-store and server-side token custody protections. Provider outage or source permission loss MUST fail closed without extending sessions or using fallback authority. Access loss MUST NOT cancel independently admitted repository work.

<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:314e97415b3211a4f4e6187bb16495661d31129062e6bda38ceb8a2a4d4e9790" -->

#### Scenario: Outage and boundary regression

- **WHEN** provider revalidation is due during outage, a forged callback or wrong host is used, or a mutation lacks valid same-session CSRF proof
- **THEN** the dependent request is blocked without protected data, token disclosure, session extension or credential fallback
- **AND** no cancellation is sent to independent repository execution

### Requirement: Understandable scope and capability explanations

Existing desktop and mobile views SHALL explain application admission, the connected source account and scoped capabilities without relying only on color or disabled controls, and without exposing excluded targets.

<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

#### Scenario: Keyboard and narrow-view explanation

- **WHEN** an operator inspects scoped account/operations views with a keyboard at desktop and 390px widths in light and dark themes
- **THEN** focus, labels and readable explanations remain usable without horizontal overflow or disclosure of another operator's targets
