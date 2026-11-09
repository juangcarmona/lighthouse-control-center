# Lighthouse Control Center development identity and workspace

The supported application uses one HTTPS workspace and a separate development Keycloak container. Repository workflows and agent execution remain independent. The external-issuer profile provisions no provider; production storage, credentials and deployment belong to #58.

## Prepare private development configuration

On the verified Linux x64 development host, install Node 22+, .NET 10, Docker, OpenSSL and Chromium prerequisites. `npm ci` supplies the exact Linux x64 Aspire CLI paired with the AppHost SDK, including SDK 10.0.100 environments; no global CLI installation is required. Public bundle files stay under ignored `node_modules/.cache/sofa/`; runtime state stays in the user cache outside the checkout. The setup process receives no workspace/provider/source credentials. Create the private setup as a non-root user. The generated `ProviderUser` matches that user UID with the image group 0 so 0600 files remain private and readable on GitHub runners as well as local hosts. Recreate the isolated setup when moving between OS users; do not make its keys world-readable. Keep Docker available to the AppHost host. Choose stable HTTPS application and issuer addresses reachable from the intended browser or phone. Both must use the same registered issuer hostname; an internal container hostname is not a replacement.

For a loopback development example:

```sh
npm ci
npx playwright install --with-deps chromium
node scripts/setup-development-identity.mjs \
  --directory "$HOME/.config/sofa-dev" \
  --origin https://127.0.0.1:5443 \
  --issuer https://127.0.0.1:8443/realms/sofa-dev \
  --test-accounts
SOFA_CONFIG_FILE="$HOME/.config/sofa-dev/development.json" npm start
```

For LAN/VPN use, replace the loopback addresses with stable reachable hostnames or the selected host address before generating configuration. [The versioned development Keycloak realm](../../.config/keycloak/sofa-dev-realm.json) defines `admin` and `test`, both with password `Test1234@`. The generator imports them and writes the same values to `test-accounts.json`. It refuses an existing destination and any destination inside the checkout. It creates a private directory, separate application/provider certificates and the non-production realm import. The client secret, owner subject and TLS keys remain in private files; output contains only setup locations and addresses. No global certificate trust is changed by this setup command.

Trust the generated public `ca.crt` only in the designated development browser/device, checking its fingerprint out of band. Keep `ca.key`, TLS keys, `provider.env`, `development.json` and TOTP secrets private. The two shared test passwords are intentionally tracked for the isolated development realm. The automated host test creates its own browser HOME/NSS database and removes its setup afterwards. It never disables HTTPS validation.

Sign in to Lighthouse Control Center with `admin` / `Test1234@`. The `test` user has the same password but is denied owner access. Development requests assurance1 and does not require OTP enrollment. External mode retains assurance2/MFA. Existing enrolled factors need not be removed. The configured `(issuer, subject)` admits the owner only. Recreating the disposable provider discards its accounts; preserve the exact owner subject rather than mapping an account by email. A setup without synthetic accounts requires an explicit `--owner-subject` and operator-provisioned account in that development realm.

## Connect the real GitHub user

Create a separate **development GitHub App** in [GitHub developer settings](https://github.com/settings/apps/new). Use the configured application origin as its homepage and the exact callback:

```text
https://<application-host>:<port>/connections/github/callback
```

Configure repository permissions Metadata/read, Issues/read-write and Actions/read, expiring user access tokens, and no webhook. Install it only on the designated test repositories. These permissions cover observations and ordinary issue reads. The shared issue-action contract additionally reads Contents, Pull requests and Actions variables, requires the intended numeric App ID, and may require Actions/write for supported dispatch operations: follow [issue controls setup](issue-controls.md) before expecting action eligibility. A successful issue read does not establish those additional grants. Administration and contents-write remain unnecessary for this slice. A GitHub App registration alone does not constitute user consent.

Add its **client ID** and **client secret** to the private configuration, alongside `SoFa.Identity` and `SoFa.Repositories`:

```json
{
  "SoFa": {
    "GitHub": {
      "ClientId": "operator-supplied-development-client-id",
      "ClientSecret": "operator-supplied-private-client-secret"
    }
  }
}
```

Merge that fragment into the existing private file; preserve its identity, certificates and repository allowlist. Supply both fields or leave both absent. Restart the workspace, sign in and choose **Connect GitHub account**. Complete GitHub's user authorization in the browser. Confirm a different acting account explicitly before replacement. Verify the displayed numeric user identity, repository permission result and check time.

Keep generated client secrets, GitHub grants and TLS keys out of issues, PRs, chats, screenshots and tracked files. The two development account passwords in the realm are intentionally tracked. The application has no operator `gh`, PAT or installation-token fallback. Linking, checking, disconnecting and signing out do not post issue comments, change labels or request workflows. Native GitHub links remain source inspection paths; source command controls are separate work.

## Session and failure behavior

The browser holds an opaque Secure/HttpOnly owner cookie. Provider and source tokens stay server-side. The access-continuity development candidate expires after two idle hours or twelve hours from the original provider authentication, whichever comes first. Provider renewal retains that original absolute deadline. The development realm must have matching SSO limits; external-provider constraints remain authoritative. Observation/account polling does not extend it. Identity-provider authority is checked online at least every five minutes; a due failure blocks protected access, and recognized revocation destroys local authority.

Local sign-out and disconnect require CSRF-protected POSTs and remain available during provider outage. Sign-out removes the application session. Explicit GitHub disconnect removes the retained source grant and prevents its reuse by active or future sessions. The provider may retain its own browser SSO session; the next Lighthouse Control Center sign-in still requires a fresh password in development; the external profile still requires MFA. GitHub's separate grant can be revoked in [authorized GitHub Apps](https://github.com/settings/apps/authorizations). Restart preserves valid protected sessions and the independently retained source grant. Every restored session requires fresh online provider verification; reused GitHub identity and repository permissions are checked again before source access. A recognized source revocation removes the retained grant.

`npm start` restores/builds the pinned Release AppHost, then executes that exact assembly. Its application dashboard is disabled. Calling `dotnet run` directly can invoke Aspire's CLI setup/run hook and select another configuration; the launcher avoids that path. AppHost starts the workspace and development provider, with no execution database, supervisor or anonymous legacy listener. Aspire's stopped project-rebuilder helper is development tooling.

## CI, separate E2E and physical-device acceptance

```sh
npm run verify
# Separate E2E; requires Docker and certutil (libnss3-tools on Ubuntu):
npm run verify:identity:host
```

PR/push CI runs `npm run verify`. The separate `Development identity E2E` workflow runs only nightly or by manual request; it is not a PR/push trigger or a required merge check. Its real five-minute session windows remain unchanged.

The deterministic lane checks real middleware with signed synthetic issuer responses, callback forgery/replay, session deadlines, permission/callback isolation, no source fallback and module/compiler gates. The separate E2E suite composes the actual pinned provider through Aspire, validates TLS, password-only development login, wrong-password rejection, logout, online refresh, revocation, provider outage, keyboard operation and axe checks. Linked/insufficient source UI states are explicitly browser fixtures. Safe screenshots and summary receipts go to `test-results/identity`; no HARs, traces, callback screenshots or raw browser call logs are retained.

The owner confirmed actual GitHub connection and operations data on a computer on2026-11-07 and deferred additional physical-phone rehearsal. Insufficient/revoked source states have deterministic transport coverage; no actual owner grant-revocation rehearsal is claimed. For optional future device verification, use a phone on LAN/VPN to:

1. Reach both trusted HTTPS application and issuer addresses.
2. Complete development password sign-in, inspect the separate GitHub acting account and permissions, and finish source linking.
3. Sign out and confirm direct workspace/API access is denied.
4. Record device/browser, time and safe post-callback outcomes. Keep codes, secrets and provider-setup screens out of evidence.

Phone-width emulation does not prove these device steps. A successful unit suite, issuer discovery or synthetic source UI does not close the actual-source/device acceptance.

## Stop and rollback

Stop the launcher/AppHost to stop its workspace and disposable development provider. Process-local sessions and connections are discarded. Rollback never requests workflow cancellation or silently starts an anonymous observer. The historical `npm run observe -- owner/repository` CLI is separate read-only tooling using the operator's explicit `gh` authorization.

For the later #48 explicit-control capability, additional App permissions and separate protected command storage are described in [Development issue controls](issue-controls.md). Its accepted persistent journal does not change authentication/session credential lifetime.

## Access-continuity storage and migration

The development generator provisions two separate private directories, configured as `SoFa:Identity:SessionDirectory` and `SoFa:Identity:SessionKeyDirectory`. Existing private configurations must add those settings before starting the candidate. Create each directory as the application user with mode0700, outside the checkout and published application; keep files and keys private. They are separate from the command journal and its key directory.

The store protects server-held provider session tickets and the owner-bound GitHub grant. It persists no browser observation projection, pending OAuth transaction or action eligibility. Protect and recover the data and key directories together; missing, unsafe or corrupt storage must block access. Never print their contents into troubleshooting output. Loss of the key ring requires fresh authentication and source consent.

The previous binary held credentials only in memory and cannot export them for this migration. The first upgrade therefore needs one fresh owner login and GitHub connection. Subsequent application restarts must preserve a valid session, and session expiry alone must not require another GitHub consent for the same admitted operator. Verify this separately from browser fixtures. The candidate's [Product Change](../product/changes/active/chg-access-continuity-001/change.md) and [Proposed ADR-0011](../architecture/09-architecture-decisions/0011-preserve-verified-access.md) retain the requested behavior and review boundary; production custody remains #58.
