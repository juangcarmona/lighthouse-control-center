# Runtime inventory design

<!-- pdac-scope: cited -->

## Context

The supported .NET Workspace already provides owner/provider admission, independent connected-user GitHub authority, mandatory atomic source request guards, bounded query responses and static JS/CSS. The first #57 slice uses those seams. Canonical architecture is sections 05/07/08 and ADR-0006/0007/0009. No new execution, persistence or deployment choice needs an ADR.

## Goals / Non-Goals

Show verifiable registrations, GitHub runner facts and committed adoption. Do not infer process liveness, physical placement of unmatched GitHub runners, free capacity, scheduling, source reservations or measured cost/tokens/storage. Broader source telemetry is future work through the existing shared SDK. Organization-only registrations are explicitly unsupported in this repository-scoped increment, rather than silently matched to repository-scoped IDs.

## Decisions

### 1. Private allowlisted local observations

Optional `SoFa:Runtime:Registrations` entries contain a bounded public alias and private absolute runner-installation directory; max10. `SoFa:Runtime:Checkouts` entries contain one configured repository and private absolute checkout path; max10, distinct repositories. Configuration is operator-owned, loaded at startup, not browser input. Paths never appear in API output/errors. Empty configuration means unconfigured/incomplete, not no runners/adopters.

A tokenless Node helper under `src/workspace-tools/` receives only the selected local configuration on bounded stdin, through the same clean-environment/process-budget pattern as SourceContract. No secret environment, shell, network, Docker socket, execution engine, npm lifecycle or source scripts. .NET bounds input/output and the process tree lifetime; cancellation kills owned children. Node uses fixed commands/argument arrays and per-command time/output limits. Host refresh requires the current exact-owner session and rechecks it before publishing. Disconnecting GitHub does not revoke separately authorized host observations; logout/owner-session loss clears all browser data. No local results cached server-side.

Read only fixed `.runner` from each configured directory, no symlink final file, regular file <=32KiB. Validate bounded positive safe-integer agentId, bounded name and exact HTTPS github.com owner/repository scope; output only alias, repository, ID/name and collection time. Never read `.credentials` or publish the raw file, private directory, server URL or work folder. A registration file is a registration observation, not proof that a process/container is running. Modification time is file metadata, not heartbeat; show both modified/collected times without invented expiry thresholds.

For each checkout, read its GitHub origin and current exact committed HEAD through fixed read-only Git commands with clean environment, no pager/hooks/filters or network. Verify normalized GitHub HTTPS/SSH origin equals its configured repository. Read only `package.json`, `package-lock.json`, `.lighthouse/sdlc.json` and the fixed installed unattended workflow at that SHA. Output selected Lighthouse CLI declaration, root lockfile resolution, SDLC manifest version and immutable reusable workflow reference separately, with source revision/links. Missing files/invalid origin/failure preserve unknown and partial evidence. Bound every file/command and report oversized inputs as unavailable, never empty adoption. Reading committed files does not prove installed/deployed versions or a policy deviation. Do not clone/pull/install/upgrade. Configured-source coverage does not establish all repositories using Lighthouse.

Alternative: host Docker socket, process scan or operator `gh` fallback. Rejected: broad authority, credentials and guessed mappings are unnecessary for a registration overview. Direct .NET Git/process parsing is possible; the existing bounded tokenless Node bridge is easier to test using built-in Node and public Git behavior without new dependencies.

### 2. Connected-user GitHub repository runners

A separate query per configured repository uses RepositoryAccess and GitHubAuthorization. Extend authority with `AdministrationRead`: effective user admin AND current installation administration read/write grant AND metadata authority. Do not expose another App's runners or infer permissions from successful issue reads. Missing grant returns denied without calling `/actions/runners`; uncertain authority stays unavailable. Every credentialed call uses the existing mandatory atomic source guard and connection stop token; connection/session/generation are rechecked before response.

Call only fixed `/repos/{configured}/actions/runners?per_page=100&page=1` with existing 2MiB transport bound and query deadline. Return up to100 runners with source total_count, collected count, complete/partial coverage; do not enumerate unbounded pages. Validate identities, bounded names/status/labels and boolean busy. Unknown status remains unknown; missing busy is unknown, never idle. total_count=0 plus a valid empty collection is the only no-runners claim. Unauthorized invalidates the connection; 403/404 clears affected GitHub data as denied; transient failure may preserve original browser data marked stale, never a fresh healthy count. DataScope binds browser GitHub inventory to account generation. No operator token/anonymous fallback.

### 3. Presentation and correlations

One protected `/workspace/runtime` and owner-protected local `/api/runtime/host`, plus connected-user `/api/runtime/{owner}/{repository}`. Public static assets contain no observations. Navigation links from existing workspace views. Explicit refresh only, initial read on navigation; no poller/storage. Fetch local and GitHub facts independently, retaining source times and bounds. DOM text nodes and fixed source URLs only; no raw Markdown/HTML or private paths.

Show local registration and GitHub inventory as separate facts. A registration-to-GitHub match requires identical normalized repository scope AND numeric runner ID; a differing name is a visible conflict, not silently overwritten. Equal IDs from different repositories do not match. This proves matching registration identity only, never process health/placement. Unmatched GitHub runners have unknown physical location; even `self-hosted`/host-like labels cannot locate them. Process health, capacity/usage and leases are explicitly unobserved. Actions/Factory/Issues/settings links supply source recovery without mutations.

GitHub disconnect/replacement/global denial clears GitHub facts immediately; repository denial clears that scope before sibling reads settle. Keep host facts independent of GitHub grants and clear everything on owner401. A partial catalog remains incomplete. Errors preserve original collection times only where explicitly stale; successful empty source does not retain deleted records. No mixed account/pagination join. Desktop keyboard and390px layouts retain accessible headings/statuses/focus.

## Test and Evidence Plan

- Node fixtures: valid/malformed/oversized/symlink registration, organization scope, safe output/redaction; actual temporary committed Git checkout proves remote normalization, exact committed values despite dirty files, absent/oversized configs and no mutation. Same runner ID across different scopes stays separate.
- .NET: options and owner route boundary; denied administration with zero runner calls; source busy/offline/unknown/empty/partial/malformed/401/403/transport and connection-generation/read-stop behavior through existing transport fixture. Preserve all current assertions.
- Browser: independent local/GitHub views, source-scoped joins/conflict/unknown host, permissions, retained-time stale state, immediate denial/account change clearing while sibling read held, refresh and narrow/keyboard accessibility. Fixture evidence labeled synthetic.
- Actual selected host `.runner` and committed-adoption observations with safe receipt, source revision/times and current real GitHub grant limitation. Do not reset owner credentials or claim acting-user success from operator `gh`. Observe independent runner supervision before/after application observation or stop without manipulating workers. Existing99 native run may supply independence evidence only for its observed interval/outcome.
- Run full `npm run verify`, hosted CI and fresh independent review of every configured Done dimension on final candidate. CI/provider/owner acceptance limitations remain explicit. Deploy only a reviewable reversible development preview; production stays separate.

## Migration / Rollback

Configuration is optional and private; existing setups display unconfigured host evidence. No schema/storage migration, worker hook or permission auto-escalation. Roll back the view/query/helper and optional configuration through the reviewed source path; independent runtime remains untouched. #50/#52 acceptance and integration remain prerequisites for merging this stacked branch.

<!-- pdac:cite id="FR-RUNTIME-HEALTH" digest="sha256:3566c2bc7919a04b15a3e0e89d2cc2947a9ba38962673d6eb67f7d4addb6dce2" -->
<!-- pdac:cite id="FR-CONFIGURATION-DRIFT" digest="sha256:abb59ea4de5de304e41806960f9d7cc593cd9086082a2c04ce7fe1b4dc67eff7" -->
<!-- pdac:cite id="UC-MAINTAIN-RUNTIME" digest="sha256:bd92d57c9e69c4dfad43ad798ab0ee63d299976202fc18d18361522eaa8d4d23" -->
<!-- pdac:cite id="BR-CAPACITY-DEFAULTS" digest="sha256:1fae00c2b56b581a8562883217b9f7c720c0fcc74f3d820c271dbc8686558af9" -->
<!-- pdac:cite id="BR-EXPLAINABLE-SIGNALS" digest="sha256:1b8ec288714357b03b030a921f70b7f1dd0e82a590d05430cc8b4bf638c933a9" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:318c7d8d4d3b2e27109e24628f99dd1825494fa9858dc13410032d73650f1cc8" -->
<!-- pdac:cite id="CON-FACTORY-RUNTIME" digest="sha256:3e183bdd765a663d966e19e3c645ee91e36c8e30b14dacc9f4724c670fd21a2d" -->
<!-- pdac:cite id="QR-MOBILE-OPERATIONS" digest="sha256:2485b5877f0872af3dbdaa0a7ac00ac7651b28173adf6e3cf8d9ed643029bb35" -->
