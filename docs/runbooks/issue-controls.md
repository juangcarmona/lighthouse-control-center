# Development issue controls

## Contract and permissions

The #48 candidate selects public CLI 0.12.61 / SDLC 0.22.0 and officially installs the issue-control projection from release commit `d7ce30a91a9d6c195cc9b6a34e7a42a36737099d`. The source repository must adopt that contract before dispatch controls become eligible. Source policy and runtime own admission and execution; Lighthouse Control Center remains optional.

Keep the existing development App, numeric `SoFa:GitHub:AppId`, owner identity and selected repository installation. Source controls require effective connected-user write permission together with App Issues/write and Actions/write; shared fact/provenance reads additionally need Contents/read, Pull requests/read and Variables/read. Metadata/read is retained. Administration/read is a separate runner-view concern. Never substitute the operator CLI, a PAT or an installation token for the acting user. Registration/install permission changes and GitHub user consent remain separate owner actions. A missing contract or grant remains visible and unavailable.

## Private journal setup

Provision two distinct empty directories as the non-root application user, outside the repository, publish directory and disposable identity-provider storage. Use mode 0700 and private parent directories. Add their absolute canonical paths to the existing private configuration:

```json
{
  "SoFa": {
    "Controls": {
      "JournalDirectory": "/private/operator-selected/sofa-control-state",
      "KeyDirectory": "/private/operator-selected/sofa-control-keys"
    }
  }
}
```

The application does not create or loosen those directories. SQLite and marker/key files must remain owned by that user with mode 0600; symlinks, hard-linked files and unsafe parents are rejected. A separate persistent Data Protection ring protects command payloads; provider and GitHub credentials remain process-local and are not journaled. Unconfigured/unsafe storage disables controls and preserves ordinary reads. Source-controlled metadata is not a place for either directory contents.

The logical SQLite database cap is 50 MiB and 10,000 retained intentions, including terminal tombstones. WAL/key files need additional disk space. A busy or full database fails closed; no automatic deletion or retry occurs. Monitor filesystem capacity externally. A new process treats every prior prepared intention as uncertain, which can conservatively abandon a preparation that was never sent.

## Operation and recovery

1. In **Operations**, select **Open mission** on an issue card. For an issue not in the collected overview, use **Choose an issue** on its repository card, enter the issue number, then select **Open issue**. The **Mission actions** panel appears before the description and history. Shared facts show the current question, reservation coverage and action eligibility separately from historical labels/reports.
2. Enter an ordinary comment or explicit Continue answer, or choose Refine/Propose. Prepare first and inspect the effect. An ordinary comment does not resume work and may invalidate an earlier input digest. Continue binds the verified question and original grant.
3. Confirm the protected local ID. The SDK receives one committed claim and can request one exact POST; repository admission still rechecks authority and inputs. Submission alone does not prove source acknowledgement, a worker or a passed stage.
4. If the response is lost, use **Recover previous action**, then **Reconcile source result**. The same identity and immutable intent are retained; no automatic resend occurs. A new unresolved preparation cannot replace the previous one for that source scope. A terminal source receipt keeps its tombstone and permits a deliberately new action.
5. After process restart, sign in and reconnect GitHub before recovery. A restored preparation is reconciliation-only. If its effect was never observed, it can remain uncertain and block a replacement; this checkpoint provides no operator reset/delete bypass.

The panel explains unavailable actions using the source response and the current question/eligibility details. If protected command storage is unavailable, submission and recovery are disabled while issue reading remains available. Opening a mission or preparing an effect does not send it; **Confirm and send** is the explicit write. A confirmed comment is distinguished from an unconfirmed request or completed delivery.

For a private backup, stop the single workspace instance and capture **both** the database directory (including any WAL) and its separate key-ring/marker directory with ownership/modes intact. Store backups privately; do not attach them as evidence. Restore both as a pair while stopped. Restored claims/preparations cannot authorize another send. Missing/wrong keys, marker or schema block actions; do not delete the journal to resolve an unknown transmission. Production custody and disaster recovery need their separate acceptance.

Rollback the application/projection through reviewed commits. Preserve the private journal and keys. Stopping or rolling back Lighthouse Control Center does not cancel repository work; inspect retained source receipts in GitHub. Consumer fixtures cover real SQLite, the released SDK and synthetic GitHub responses/browser layouts. They do not replace actual connected App-user consent or source acceptance.
