# Independent source installation: current development baseline

This procedure installs the existing application with a new operator's configuration. The product is evolving into Lighthouse Control Center; compatible SoFa configuration and assembly names remain in use. Production packaging and a clean-operator recovery rehearsal are tracked by [#120](https://github.com/juangcarmona/sofa/issues/120) and [#58](https://github.com/juangcarmona/sofa/issues/58). This document does not attest that those release gates passed.

## Prerequisites and source

Use a non-root Linux x64 account with Node 22 or newer, .NET 10 SDK, Git, Docker, OpenSSL and the Chromium prerequisites. The application host needs Docker for the development Keycloak container; the web application and agent workloads receive no new Docker privilege from this procedure. The pinned Aspire CLI is supplied by `npm ci`. Repository workflows, runners and inference services are independently configured and do not need to run on this machine.

Install the inspected default-branch baseline in a new directory:

```sh
git clone https://github.com/juangcarmona/lighthouse-control-center.git lighthouse-control-center
cd lighthouse-control-center
git checkout --detach 4c457c337640795a31492f7219cb0e497df9e232
npm ci
npm run verify
```

That immutable revision provides the authenticated observer and development identity foundation. The issue workspace, controls, discovery, inventory and inbox are active candidates identified in the [assessment](../roadmap/lighthouse-control-center-assessment.md); do not install an unreviewed combined preview as a release. Future releases must publish an equally explicit supported artifact/version. Issue #121 reports the repository renamed; the command now uses its new direct clone path while preserving the selected commit and configuration compatibility. Existing moved checkouts follow the [continuity runbook](repository-rename-continuity.md), not a replacement clone.

## Configure and start

Follow the canonical [development identity procedure](development-identity.md#prepare-private-development-configuration) to create a new private setup outside the checkout. Choose your own explicit HTTPS application and issuer origins. The setup generator requires its configured `sofa-dev` realm path and refuses an existing directory. It creates development credentials and certificates locally; no original operator account, ambient `gh` login, provider credentials or personal host is required.

Set `SoFa.Repositories` in that private configuration to your permitted repositories rather than retaining the generator's sample list. Keep the exact configured owner subject. Trust the generated development CA only in the designated browser after checking its fingerprint; do not disable TLS verification or expand private file modes. Use the documented `SOFA_CONFIG_FILE` launch command. An unavailable GitHub source is an explicit application state until you connect an authorized source account.

Follow [Connect the real GitHub user](development-identity.md#connect-the-real-github-user) for the current read-observation App permission set, exact callback, private client configuration and browser consent. This baseline does not dispatch workflow actions. The later #48 controls and #57 administration-read inventory require their independently accepted capability and permission changes; do not pre-grant broader access as part of installation.

An operator using an existing identity provider selects the existing External profile instead of provisioning the development container. Its HTTPS issuer, client, owner/assurance policy, redirects, trust and protected secrets require the actual external-provider checks in #58 before production operation. The development synthetic-account setup is not a production identity installer.

## Verify operation and recovery

Open the configured HTTPS origin and sign in with the local development owner. Confirm anonymous/denied API access fails, inspect the connected GitHub numeric actor and allowed repository observations, then disconnect/logout and verify protected data clears. Empty, denied, stale and unavailable repositories remain distinct. Use `npm run verify:identity:host` for the actual isolated provider harness where Docker and the documented certificate tools are available; synthetic source fixtures in that harness do not prove real App consent.

Stop the launcher/AppHost and confirm independently admitted repository work remains unaffected. Restart with the same private configuration; process-local login/source connections require fresh linking. Preserve private setup/key files under operator custody. The baseline has no runtime command journal; once #48 integrates, use its version-specific protected journal/key backup and restore procedure, and reconcile old intentions without resending them. #58/#120 must prove that restore before a supported production claim.

For rollback, select the last verified source/artifact and compatible private configuration; keep source IDs, provider state and protected key-purpose names stable. Do not start the retired supervisor, cancel source work or silently expose an anonymous observer. A product rename alone requires neither changing the issuer/client nor migrating namespaces, storage or runtime registrations. The [rename checklist](../roadmap/lighthouse-control-center-rename.md) governs those separate decisions.
