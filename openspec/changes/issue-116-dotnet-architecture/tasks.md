# #116 .NET architecture tasks

<!-- pdac-scope: none reason="Tasks verify implementation architecture and add no product behavior." -->

- [x] Add compiled reflection assertions for the actual Workspace assembly's exported CQRS handlers and module-family references.
- [x] Verify all solution implementation modules expose `LighthouseModule`, `CompilerVisibleProperty`, and the analyzer-only project reference in `scripts/check-dotnet-profile.mjs`.
- [x] Compile a valid semantic handler and separate invalid LH1001/LH1002 projects; assert each invalid build fails with the corresponding diagnostic.
- [x] Add no test-project references or locks; preserve all existing assertions and verifier execution.
- [x] Update `tests/README.md` and run focused tests plus the .NET verification components.
- [x] Keep the rollback limited to additive quality checks, their dependencies, documentation and this OpenSpec change; do not revert application behavior.

## Verification record

The actual-assembly architecture tests passed (2/2); the Release solution build succeeded with zero warnings/errors; `scripts/check-dotnet-profile.mjs` and `scripts/check-workspace-publish.mjs` passed; `npm run test:runtime` passed 38 runtime and 254 web tests; OpenSpec strict validation, ProductShape citation verification, Markdown lint and `git diff --check` passed. The `npm run verify:dotnet` wrapper was attempted repeatedly but failed during its initial Node-spawned `dotnet restore` with an Internal CLR error. Its relevant build, profile, publish and solution-test components were run independently and passed.
