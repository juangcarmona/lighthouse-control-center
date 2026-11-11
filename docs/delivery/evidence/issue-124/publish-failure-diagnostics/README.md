# Release publish failure diagnostics

Related work: [#124](https://github.com/juangcarmona/lighthouse-control-center/issues/124). This operator-owned verification correction leaves the native PR #154 source, archive, identity and blocked result intact.

## Problem and change

The independent host in [native run 43042266133](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/43042266133) installed dependencies successfully and reached Release build/analyzer checks, then the publish assertion failed with exit 1. Its captured child stdout/stderr was discarded, leaving the underlying error unavailable. The agent's separate installation timed out; those are distinct failures.

On publish failure, the verifier now prints captured stdout, stderr and any spawn error before its existing assertion. The exact publish command, failure condition, offline SDK validation, safety assertions and cleanup remain required. Successful publication stays quiet except for the established success receipt. This changes verification diagnostics only; it changes no product requirement, architecture, permission or delivery authority and requires no ProductShape change or product specification delta. It does not revise the completed archived documentation plan.

## Executed checks

- A temporary `dotnet` shim returned 23 after writing distinct stdout/stderr diagnostics. The actual verifier retained both diagnostics, failed its original assertion, and removed its temporary output directory.
- An absent executable produced ENOENT diagnostics and retained the same failure/cleanup behaviour. Original logs are retained beside this record.
- A separate unchanged-source capsule probe at `60a191ebde7207d968bac7bb1caf515218779475` completed restore, Release build, analyzer fixtures and the original publish check successfully. It used pinned image `sha256:6f24370d28f2e471430aa06e5fa507a913e36792d7e54a9484c472439e218d14`, read-only root, 2 CPUs, 4 GiB memory, 1,024 PIDs and private 1 GiB scratch. Public installed dependencies were mounted read-only with a separate writable Aspire cache; this was not a cold npm installation. The unprivileged diagnostic UID was 1000, whereas the native image uses 20003. No private host credentials or source grants were mounted. Its original log is retained.

That one probe passed while its scratch was 974 MiB used before publishing. It neither identifies the original publish failure nor establishes that native qualification passes. No ENOSPC, OOM, network fault or archived-plan defect is inferred from the original opaque assertion. PR #154 remains draft and broader #124 acceptance stays open. On the corrected source, `npm run verify:dotnet` completed successfully: restore, Release publish/offline SDK checks, architecture/analyzer rejection fixtures and all 305 .NET tests (267 web + 38 runtime). The original log is retained. Separate Luna High review accepted the five-line correction; final evidence review and exact-head hosted CI remain required before integration.
