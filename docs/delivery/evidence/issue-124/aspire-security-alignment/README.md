# Aspire dependency security alignment

The owner-authorized dependency upgrade under #124 is blocked by NU1903 for Aspire.Hosting and Aspire.Hosting.AppHost 13.6.1. The failure is preserved in [bootstrap CI 43032444249](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/43032444249); local cached restore had passed, so it did not establish the current advisory result.

## Corrective plan

Reuse Dependabot PRs #165 and #166: retain Aspire.Hosting 13.6.5, MessagePack 2.5.307 and the matching Aspire CLI 13.6.5. Also update Aspire.AppHost.Sdk to 13.6.5 so the implicit Hosting.AppHost dependency is patched. Regenerate AppHost and consuming web-test locks with real restore, then run locked restore/build and the full repository checks. Retain warnings-as-errors and audit settings.

The [Microsoft advisory](https://github.com/advisories/GHSA-f7vh-h5g3-7jrh) identifies both hosting packages before 13.6.5 and requires the SDK update for its implicit package. Updating only the CLI is insufficient. Inspect the entire consuming dependency graph after restore rather than only the explicitly requested package.

Independent Luna High reviewed this minimal repair. The combined authored PR supersedes the two dependency PRs: #165's NuGet branch and original commit fail the existing branch/commit conventions before verification; #166 updates only the CLI. Preserve those conventions and reuse their patches in one qualifying change instead of broadening the verification policy. Close the superseded PRs only after the combined update integrates.

## Acceptance and limits

Require both AppHost and web-test locks to resolve Aspire.Hosting and Aspire.Hosting.AppHost to 13.6.5, retain the patched MessagePack resolution, align SDK/CLI, and pass exact-head required CI plus independent review. No application authority, product intent, authentication, Lighthouse package selection or delivery policy changes.

This unblocks current dependency restoration; it does not establish application deployment, native #154 completion or whole #124 acceptance. Existing source/provider receipts remain authoritative. Do not roll back to vulnerable dependencies to unblock delivery; use a newer verified patch or stop the affected operation if servicing needs further correction.
