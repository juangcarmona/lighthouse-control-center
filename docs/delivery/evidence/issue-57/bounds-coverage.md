# Local inventory bounds evidence

This checkpoint extends the approved #57 Plan's task1.1 evidence without changing the reviewed helper implementation. The independent bounds audit accepted head `7251e1959d143a9d45a0bd76f5f765cba75fb7e2` and supports task1.1; [its receipt](bounds-review.json) retains remaining Done gates. The source is [runtime-inventory.mjs](../../../../src/workspace-tools/runtime-inventory.mjs); the cases below are in [runtime-inventory.test.mjs](../../../../tests/runtime-inventory.test.mjs).

| Boundary | Evidence and limit |
| --- | --- |
| Source counts and identities | Ten registrations/checkouts and eleven-source refusal; case-insensitive duplicates; exact allowed fields; alias64/65 and repository100/101 characters per component |
| Trusted groups and paths | Ten/eleven groups, unique unsigned32-bit IDs at/over bounds; normalized absolute UTF-8 paths at4096 bytes and over; invalid traversal, controls and unpaired surrogates |
| Directory traversal | Actual64-component registration path succeeds;65 components are unavailable |
| Registration contents | Actual32768/32769-byte files; agent name256/257 characters; positive safe-integer agent IDs at/over bound, zero, negative and fractional values; malformed UTF-8, FIFO and symlink refusal |
| Source writers and ownership | Actual group/world-writable file modes; trusted/untrusted group behavior; runtime-UID comparison fixture rejects a different UID. The UID fixture does not change host credentials or file ownership |
| Git metadata | Actual HEAD, gitdir/commondir/backlink8192/8193 bytes, config65536/65537, loose refs1024/1025, packed refs2MiB/2MiB+1; five/six reference hops, cycles and traversal |
| Linked layout | Real selected worktree and detached HEAD, name255/256 characters, wrong layout/common-directory redirect/backlink, and actual pinned-parent replacement |
| Committed data | Actual2MiB/2MiB+1 committed JSON blobs; dirty files ignored; loose and packed storage; exact SHA/object type/hash validation |
| Origins and versions | Supported literal HTTPS/SSH origins, ambiguous/quoted/foreign/credential-bearing origins refused without credential output; committed version128/129 characters |
| Pack inventories | Actual64/65 selected pack/index files and128/129 total directory entries |
| Object storage bytes | A stat fixture on an actual valid pinned pack tests512MiB/512MiB+1 without allocating large contents. This is a guard test, not a claim that a physical512MiB pack was observed |
| Input and platform | Real tokenless CLI input128KiB/128KiB+1; simulated unsupported platform rejects configuration. No Windows execution is claimed |
| Isolation and source races | Hostile source Git config never launches its sentinel; source config/HEAD remain unchanged; actual file/parent replacement cannot redirect pinned reads; source credentials are not read |

Some defensive limits cannot be reached through valid configured inputs. Four fixed committed files need at most nine distinct commit/tree/blob objects, so64 selected packs plus those loose objects remain below the128 descriptor guard. Twenty bounded source records cannot fill the1MiB projection guard. Neither guard is reported as exercised at its maximum.

Git stdout at2MiB is exercised by the committed-file boundary. Git stderr8192, per-command2-second and collection9.5-second limits remain defensive failure bounds; this checkpoint does not claim exhaustive operating-system fault injection for them. Existing .NET bridge tests exercise held-helper cancellation, owner lifetime and nonqueuing slot release. The independent bounds audit accepted these structural explanations and reachable-bound evidence for task1.1. Full Done, current App-user acceptance and prerequisite integration remain pending.

The first attempt to pad a pack for a physical-size boundary produced invalid Git data. The final test uses a stat fixture and preserves a valid pack; fixture rejection is not classified as an application defect.
