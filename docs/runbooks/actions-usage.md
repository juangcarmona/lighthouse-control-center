# Inspect Actions usage

Open a repository under Health and select **Read Actions usage** for current cache bytes and the first 100 artifact records. Select a contributing run, then read its exact displayed attempt for up to 100 jobs. Collection is explicit, read-only and requires the connected user's current repository Actions-read grant; Issues-read and runner administration are not needed by the usage endpoint.

Completed-job seconds use source start and completion intervals. Attempt elapsed span is latest completion minus earliest start only when all source jobs are collected and have valid completed intervals. Parallel job seconds are not wall time or billed minutes. Missing starts, completions, mismatched identities and omitted jobs prevent an exact attempt span.

Cache bytes are GitHub's snapshot (refreshed approximately every five minutes). Artifact bytes sum only nonexpired records on the collected page; partial pages are not repository totals. Expired records are counted separately. These are metadata reads, not archive downloads, billing-period storage or billable GB-hours.

The provenance disclosures show fixed API source, observed time, unit, definition and scope. Billing stays unsupported and unknown: repository Actions-read does not supply separately verified account Plan permission or repository attribution. No broader grant is requested. Public/private repositories and explicitly labelled self-hosted jobs retain different semantics; zero billed Actions minutes would not mean zero CPU, host or model-provider cost.

Refresh Health rechecks authority and marks retained usage stale. Read Actions usage explicitly to replace it. Failed reads retain original times with a stale warning; permission loss, disconnection and account changes clear affected samples. There is no retained comparable history, automatic budget alarm or copied alert threshold. Reads have a 25-second collection budget, two global nonqueuing slots and a 2 MiB limit per source response; no provider pagination URLs are followed.

Credential-free source and browser fixtures establish candidate behaviour, not connected-user acceptance. Qualify a real supported observation under the installed account separately; never substitute operator credentials, a fixture or a source workflow's success for that evidence. Owner visual publication acceptance and repository review/CI remain separate.
