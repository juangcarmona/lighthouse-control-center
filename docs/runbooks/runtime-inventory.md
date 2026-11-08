# Read-only runtime inventory

Open `/workspace/runtime` with the configured owner session. The view reads local host sources independently from the connected GitHub account. An unavailable GitHub grant does not authorize an operator-token fallback or hide the separately authorized local observations.

## Private source configuration

Add optional entries to the existing private application configuration, outside the checkout. Keep existing HTTPS, identity and GitHub connection settings. This example contains no usable credential or real installation directory:

```json
{
  "SoFa": {
    "GitHub": { "AppId": 123 },
    "Runtime": {
      "TrustedGroupIds": [1000],
      "Registrations": [
        { "Alias": "selected-runner", "Directory": "/private/runner-installation" }
      ],
      "Checkouts": [
        { "Repository": "owner/repository", "Directory": "/private/selected-checkout" }
      ]
    }
  }
}
```

Checkouts must name repositories already configured in `SoFa:Repositories`. Select the intended local checkout: the observation describes its committed HEAD, including a feature or detached revision, and does not claim that it is the default branch, installed package or deployed application. No checkout is pulled, cloned, upgraded or modified. Missing configuration means unknown total coverage.

The supported host reader requires Linux, Node and `/usr/bin/git`. Source paths are canonical absolute paths without control characters or symlink components. Linked worktrees support only a canonical absolute `.git/worktrees/name` target with its exact `../..` common-directory marker and an absolute `gitdir` backlink to the configured checkout. Common/worktrees/selected directories are pinned before reads; other redirects, relative targets and bare-repository layouts remain unavailable. Metadata must belong to the application Unix user or root. Explicitly list only trusted groups that may write selected source ancestors; default group trust is empty. Root-owned sticky ancestor directories retain their normal protection of owned children. Do not grant filesystem access or add a group merely to make an observation pass. Unsupported ownership/layout/storage returns unavailable evidence.

The host helper receives no identity/GitHub secret environment. It reads fixed `.runner` metadata and selected committed files. It never reads `.credentials`, accesses a Docker socket, scans processes, executes source hooks or controls workers. A private bare object view pins selected object file descriptors, disables source/system/global Git configuration and protocols, and verifies object hashes. Its temporary files and owned children are removed after completion or cancellation. Cleanup failure prevents a successful observation.

## GitHub runner authority

The numeric App ID identifies the intended GitHub App; entering it does not change permissions. Repository runner reads require the connected user to be an administrator, a current matching App installation with metadata and administration-read/write grants, and matching repository identity. Incomplete authority stays unavailable. Known denial removes the affected GitHub inventory; an invalid credential removes the connection. Host observations remain separate until the owner session ends.

No GitHub permission is automatically escalated. Source recovery links open repository settings or workflow activity. The read API covers page one, up to100 runners, retaining `total_count` and partial coverage. Only a valid empty collection with source total0 establishes no repository runners. Missing busy/status/labels remain unknown. A match requires the same repository and runner ID; differing names are conflicts. Runner labels do not establish physical location or available capacity.

## Bounds and failure behavior

| Surface | Bound |
| --- | --- |
| Configured registrations / checkouts / trusted groups | Ten of each; distinct aliases/repositories/groups |
| Aliases / private paths / directory traversal | 64 ASCII alias characters / 4,096 UTF-8 path bytes / 64 components |
| Metadata redirections / symbolic refs | One `.git` redirect plus one `commondir`; five reference hops with cycle detection |
| `.runner` / HEAD, `.git`, commondir, gitdir / config | 32 KiB / 8 KiB each / 64 KiB |
| Loose ref / packed refs / selected committed file | 1 KiB / 2 MiB / 2 MiB |
| Object storage view | 32 pack pairs, 128 inherited object handles, 512 MiB per storage file; unsupported layouts remain unknown |
| Helper protocol | 128 KiB stdin, 1 MiB stdout, 8 KiB stderr; 128 MiB Node heap |
| Time and concurrent reads | Ten-second helper; Git commands at most two seconds within its deadline; one host helper and two GitHub runtime queries globally, without queueing |
| GitHub query / source and final response | Thirty seconds including authority checks / 2 MiB each |

Busy means an observation request slot is occupied; it says nothing about execution capacity. Refresh explicitly. A transient failure can retain an earlier browser observation with its original collection time and a stale warning. A successful empty source replaces earlier records. Owner loss clears all sources; a one-shot admitted owner deadline also clears displayed evidence without polling or renewing the session. Cookie reference rotation preserves the existing session lifetime and cannot extend its absolute limit.

## Evidence and release boundary

Browser fixtures prove rendering and clearing behavior, including keyboard and390px layouts, and are labeled synthetic. Selected real-host metadata proves only those configured observations. Operator `gh` or a fixture does not prove acting-user App access. Process health, capacity, reservations, cost, tokens and storage usage remain unobserved. Production identity/custody/deployment remain separate under #58; this view introduces no runtime scheduling dependency.
