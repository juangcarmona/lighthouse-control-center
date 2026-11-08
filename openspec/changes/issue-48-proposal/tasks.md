# Source control delivery tasks

<!-- pdac-scope: cited -->

## 1. Plan and prerequisite decisions

- [x] 1.1 Read #48/#47 scope, accepted product intent, current reader/identity/transport, shared contract and Proposed ADR-0008.
- [x] 1.2 Reconcile tracker drift and independently review this concrete design/test plan.
- [x] 1.3 Obtain maintainer acceptance of ADR-0008 and the persistent journal design before storage/source-write implementation; owner accepted PR #112 on 2026-11-08, retained in the acceptance record.
- [x] 1.4 Verify and adopt the compatible public Lighthouse release; retain exact package/source/contract evidence.

## 2. Shared read observation

The historical read checkpoint retained the missing-export/prerelease limits. The current candidate adopts public CLI 0.12.61 / SDK 0.22.0 and the official source contract at release commit d7ce30a91a9d6c195cc9b6a34e7a42a36737099d. Owner acceptance of task 1.3 unlocked protected persistence and explicit effects. Consumer fixtures do not establish actual App-user delivery acceptance.

- [x] 2.1 Add the fixed bounded tokenless SDK bridge with existing guarded source transport and effective App-user authority.
- [ ] 2.2 Feed shared current question, action, reservation and denial facts into #50/#51 while preserving historical/source labels separately.
- [ ] 2.3 Verify unknown, malformed, revoked, late-source and missing-contract/grant behavior; no source write is enabled by this phase.

## 3. Journal and explicit effects

- [ ] 3.1 Implement protected SQLite/protector storage, migrations, bounded unique claims and immutable reconciliation inputs after the acceptance gate.
- [ ] 3.2 Add explicit server prepare/submit/reconcile handlers, exact effect matching, CSRF/current-generation guards and no resend for existing claims.
- [ ] 3.3 Add Refine/Propose and distinct ordinary-comment/Continue controls using only the common SDK; preserve #47 evidence and original grants.
- [ ] 3.4 Exercise transactions, competing tabs/claims, crash/lost response, restart/restore, permission changes, protocol limits and source-only resolution.

## 4. Complete acceptance

- [ ] 4.1 Verify browser/keyboard/narrow layouts, full deterministic and hosted identity checks, and actual connected App-user source evidence with required consent.
- [ ] 4.2 Update realized architecture, operating/rollback docs and ADR status through the owning workflows; preserve remaining production limits.
- [ ] 4.3 Independently audit all eleven Done dimensions at final head, reconcile every criterion/dependency, integrate only after applicable gates, and retain post-merge/retrospective evidence.

<!-- pdac:cite id="UC-OPERATE-ISSUE" digest="sha256:e1c11763cbb6a3f3ff8aa2a7101bc672a6a45595a256134fb04d1d2070f66d2f" -->
<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:11f4c196c15675fa20c05bb320f02a2bab4bdbf96cf275a408c849924faed270" -->
<!-- pdac:cite id="FR-ISSUE-CONVERSATION" digest="sha256:936e13fb5556657bf62b15f7b5fb8c943b1aaa00736100b5ba4bc6c51689e463" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="QR-EXECUTION-SECURITY" digest="sha256:9f39dd08a392db995a75f26c9a30ed4d4ec43f73ad0ccafbdfaa3d0eabc1528a" -->
