# Source-backed intervention inbox

<!-- pdac-scope: cited -->

## Why

The factory views already expose bounded issue pages and historical execution evidence, but the owner still has to find each wait and open its context manually. Add the accepted intervention inbox so opening SoFa answers what needs information or a decision, with source identity, original times and visible collection limits.

## What changes

Add an authenticated `/workspace/attention` view using the existing configured-repository collection and shared issue reader. Start with read-only source observations without waiting for every write control. Source-labeled waits have a factual label reason and unknown question/owner until verified; a historical report is never presented as a current pending question. Once the shared #48/#47 adapter adopts the released Lighthouse issue-control contract, consume its current question, eligibility and receipt state in the same view. The inbox never evaluates admission policy or sends an independent command.

Stable source-request keys reconcile refreshes and keep distinct questions/reviews for one issue separate. Each row shows the issue/run, reason or verified question, source link, original source time, observation age, actor when explicitly known and current/partial/stale/unsupported state. Opening or commenting does not resolve it. Resolution or supersession needs refreshed source proof and keeps the historical context.

## Scope and dependencies

Depends on #50 for shared context/evidence and #48/#47 for supported actions and their receipts; #52 supplies the existing configured issue-page collector reused by this implementation. The stacked base includes #57 to preserve the current navigation/demo, without making runner inventory an inbox prerequisite. Lighthouse #119 publication/adoption is needed for the complete source-control path. Read-only delivery may precede that path; it cannot close the complete issue.

No notification service, new approval stage, local scheduler, automatic reply, local admission policy or new credential/persistence boundary. Accepted product artifacts are unchanged. ADR-0006 owns the execution boundary; ADR-0008 remains a proposed control design and is not asserted as accepted or implemented by this plan.

## Product basis

UC-RESOLVE-INTERVENTION, FR-INTERVENTION-INBOX, BR-GITHUB-SOURCE, BR-EXPLICIT-WORK-COMMANDS and BR-HUMAN-DECISION-BOUNDARIES already define this behavior. The completed authenticated-operations Product Change is the current traceability source; the issue's old reference to an active change needs correction. Planning and implementation remain separate from product acceptance, actual-user acceptance, merge and deployment.

<!-- pdac:cite id="UC-RESOLVE-INTERVENTION" digest="sha256:c431ce770ce77f9212138e76558d6bd99641231a54ecc39231a673d1dc929b2b" -->
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->
