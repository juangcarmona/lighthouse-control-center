# Workspace tooling snapshot

The CQRS interfaces and LH1001/LH1002 analyzer source were copied from published Lighthouse CLI 0.12.53 (source `dd1694735391f54241604a1686ccd627de7b2036`). Their Apache-2.0 LICENSE and NOTICE are retained here. The compiler diagnostic ledgers use the matching published source rules; local table formatting preserves their diagnostic content.

These copies are adopter-owned. Project files retain explicit package versions and the existing repository layout instead of introducing central package management. The new workspace module enables the analyzer, nullable/SDK analysis, warnings as errors and all-dependency NuGet audit. Retired runtime projects keep their existing policy during migration. Existing host/CI SDK selection and the separately pinned isolated verification image remain unchanged; this partial migration does not claim a new universal SDK pin.

The authenticated web host, real middleware/provider verification, CQRS use cases and standalone `verify:dotnet` rejection rehearsal are still implementation work in #49. The new identity/session tests are included in the root solution and its full runtime verification. These internal components do not add an operational listener or grant an anonymous route privileges.
