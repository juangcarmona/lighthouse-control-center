# Access continuity and operational workspace

The maintainer requested implementation of the access and usability corrections on 2026-11-09.
This increment remains in draft PR #100; its development activation does not establish main
integration, product acceptance, production readiness or actual connected GitHub-user delivery.

## Implemented behavior

- Existing OIDC refresh is retained. Owner sessions now use an encrypted server-side SQLite store
  and stable Data Protection keys, with a two-hour idle limit and twelve-hour absolute limit from
  the original authentication. Background polling does not extend those limits. Online provider
  revalidation remains every five minutes; external-provider assurance requirements are preserved.
- The GitHub grant is protected separately and bound to the configured owner, issuer, OIDC client
  and GitHub App/client. Owner logout or session expiry does not erase it. Explicit source disconnect
  and source revocation remove it across aliases. Restart restoration requires fresh provider/source
  verification; OAuth attempts, command eligibility and observations are not persisted as authority.
- Authenticated `/` opens the operational overview. Attention, active work and projects precede
  technical provenance. Navigation has consistent icons and labels; the favicon and sun/moon/system
  selector use the existing Lighthouse identity and design system. Account remains server-owned.
- Overview and discovery/inbox can restore bounded, explicitly stale tab-local read projections
  after current account and repository-read checks. Scope, TTL and size limits apply. Factory evidence
  is excluded from persistent caching; losing Actions-read cannot reveal previously stored reports.
- Project actions open the collected mission list. Comment drafts remain editable during unavailable
  checks, with a nearby reason and account recovery. Prepare/confirm, source authority, CSRF,
  protected journal, receipts and no-resend behavior remain enforced.

The [design contract](../../../../design/control-center.md) records visual and interaction requirements.
[CHG-ACCESS-CONTINUITY-001](../../../../product/changes/active/chg-access-continuity-001/change.md)
is a validated draft overlay; accepted product artifacts were not silently rewritten.
[ADR-0011](../../../../architecture/09-architecture-decisions/0011-preserve-verified-access.md)
is Proposed. Single-host development does not qualify production custody, backup or multi-instance
operation; those gates remain with #58.

## Independent verification

- Independent exact auth review approved original commit
  `273e995cb9846929074c4b9e8644b1156e6c9456`, integrated as `ad7162d`.
  Rotation, logout, alias disconnect, concurrent OAuth completion and stale durable-grant
  invalidation were reviewed; focused auth tests passed 119/119.
- Integrated workspace .NET tests passed 252/252; Node tests passed 94/94, including the setup
  ancestry regression. The complete UI suite passed 84/84; subsequent mission navigation and
  comment/account recovery checks passed independently. Markdown and product overlay validation
  passed, and all 27 architecture citations were current.
- [Real development verification](real-development-verification.json) records trusted HTTPS,
  actual Keycloak login, bounded session deadlines, exact served asset hashes, authenticated-root
  navigation, editable local draft and same-browser owner-session survival across an application
  service restart. Provider authority was revalidated after restoration. It performed no source write.
- The actual connected owner's browser was not inspected. GitHub grant restoration, expired-owner
  reattachment and revocation are proven by controlled tests here, not by a live GitHub-user receipt.
  Actual authorized comment, receipt and source-effect acceptance remain open under #48/#50.

Real-provider verification stays outside PR/push CI. This change does not restore the rejected
wall-clock E2E suite to the required CI path.

## Development activation and rollback

The prior preview mixed three revisions. The new preview runs a single published candidate with
matching served assets; its exact code revision is in the verification receipt. A protected backup
retains the previous configuration and service override, and the old binary remains available.
The live realm changed only its SSO idle/maximum settings to 7200/43200 seconds; its five-minute
access token, refresh rotation and zero-reuse settings, users, clients and secrets were preserved.

The old application held grants only in memory. This first migration therefore needs one new login
and GitHub connection; no token was extracted from process memory or substituted from CLI credentials.
Subsequent valid restarts use the protected store. Rollback restores the saved service/configuration
and realm values, retains new session and command stores, and requires fresh owner/source verification;
it must not copy, delete or resend journal entries to make a rollback appear successful.

Live activation also found an existing private-storage configuration failure: the empty command
journal was below a group-writable ancestor, which `PrivateJournalDirectory` correctly rejected.
Fresh separate session, session-key, command and command-key directories were placed below an
operator-owned private root whose ancestors satisfy the existing policy. The original empty
journal/key directories remain intact. A constructor-level probe confirmed the command store was
available. Neither access checks nor isolation were weakened.
