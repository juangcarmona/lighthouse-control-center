# Engineering practice evidence adoption

The owner authorized the upstream [Lighthouse #594 train](https://github.com/juangcarmona/lighthouse/issues/594), including publication and existing-adopter qualification. This adoption selects CLI 0.13.17 and SDLC 0.25.0 from the public registry. Upstream publication [43922711600](https://github.com/juangcarmona/lighthouse/actions/runs/43922711600) binds both package gitHead values and tags to `c9aa6e31dcb2baebc644a7ef4183fedfb200ca0b`.

The desired SDLC selection is in `lighthouse.json`. The owning CLI previews and applies the upgrade to generated guidance, command inventory, ownership hashes and the maintenance package pins. Source-mode worker pins retain their separate reviewed selection. The registry-installed CLI verifies the resulting projection without drift. The application does not gain a new screen or claim a level from installation.

## Evidence

| Evidence | Result |
| --- | --- |
| Public SDLC 0.25.0 archive | Installed with its published SHA-512 integrity |
| Public CLI 0.13.17 archive | Installed after its registry download became available |
| Installed SDK fixture | Missing observations stay unverified; common coverage floors and nonblocking mutation rules are retained; history deduplicates and cannot certify current code |
| Connected native source | [Run 43708843880, attempt 1](https://github.com/juangcarmona/lighthouse-control-center/actions/runs/43708843880/attempts/1), commit `251120e3e18f76d88165aa1b039f6c9ac6d1f254`: 120/120 Node tests executed and passed |
| Configured enforcement | Authenticated effective rules require `verify` from GitHub Actions integration 15368; the committed npm command propagates test failures |

The connected report establishes the tests practice for that exact source and declared Node-test scope. Other required practice observations remain missing, so its overall level is `unverified`. The local SDK fixture does not establish connected-provider execution; the native source read above supplies that separate receipt. Candidate and postmerge CI retain their own exact revisions in the PR and upstream issue.

Initial metadata and CLI archive queries returned 404 after the publish workflow completed. Installation was checked again after actual registry availability. An initial extended local check also encountered CLR error `0x80131506`; its bounded-parallelism retry passed 38 runtime and 276 web tests. The subsequent registry-installed full command uses a private TMPDIR and `DOTNET_PROCESSOR_COUNT=4`, retaining all tests. The earlier failed command is not counted as a full pass.
