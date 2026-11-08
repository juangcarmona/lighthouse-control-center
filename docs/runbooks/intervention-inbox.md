# Read-only intervention inbox

Open `/workspace/attention` after signing in and connecting the GitHub account. The view reuses the factory's bounded, authorized issue-page reader and opens the same issue detail as discovery. It performs only reads. Load more explicitly extends project coverage; Refresh starts another collection.

Each `needs-info` or `waiting-review` label is its own source context. The same issue may have both. Repeated observations retain one card per context. These labels do not identify an actual question, its start time, a responsible actor or an approval. The card preserves the issue update and successful observation times separately. Current label observations sort before stale or no-longer-observed contexts, then by issue update and stable identity; this is an explanation of ordering, not inferred urgency.

A missing label, incomplete page, unavailable repository or ordinary comment cannot establish a resolved question. Earlier same-scope contexts may remain marked unobserved with their original time. History is in browser memory, bounded to 1 MiB and 1,000 contexts; omitted history and closing the page do not resolve source work. Repository denial, removal or account change discards affected private history. No browser storage or new server-side execution store is introduced.

Use the shared issue reader or the exact GitHub issue link for context. Verified current questions, source-authorized responses and proof of resolution await the released shared Lighthouse controls and their #47/#48 integration. This view neither estimates their eligibility nor exposes a replacement write path. Protected approvals remain at their source.

The synthetic browser checks cover distinct/repeated contexts, removed labels, stale reads, permission loss, account replacement, safe text, keyboard focus, accessibility, and 390px light / desktop dark layouts. They do not prove actual connected-user question/continuation acceptance or a physical-phone session. The owner waived the latter rehearsal; full #51 remains open until the shared-control acceptance trace exists.

Architecture significance check: no architecture documentation impact. This is an additional read-only presentation of the existing authenticated factory query and issue reader; execution ownership, boundaries, deployment and admission mechanisms are unchanged. Existing canonical views remain authoritative.
