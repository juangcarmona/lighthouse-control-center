# OpenCode and runner telemetry

Inspection date: 2026-11-18. Follow-up: [#263](https://github.com/juangcarmona/lighthouse-control-center/issues/263), within runtime [#57](https://github.com/juangcarmona/lighthouse-control-center/issues/57) and Health [#54](https://github.com/juangcarmona/lighthouse-control-center/issues/54).

## What exists

Lighthouse SDLC 0.29.0 already publishes a metadata-only event contract, cursor reader, usage summary and OTLP HTTP JSON log exporter. It observes runner lifecycle, workflow jobs, execution phases, native OpenCode 2.1 model steps and tools, with CLI fallback and coverage states. Resource samples include cumulative CPU time, memory, process counts, block IO and container-network bytes where available. See the [released telemetry contract](https://github.com/juangcarmona/lighthouse/blob/b8f63b0846bbc3368b429c8b28523b79834c7116/src/packages/sdlc/telemetry.md) and [OpenCode adapter](https://github.com/juangcarmona/lighthouse/blob/b8f63b0846bbc3368b429c8b28523b79834c7116/src/packages/sdlc/src/telemetry-opencode.mjs).

The exporter sends correlated log events; it does not itself install Grafana, Loki, a metrics store or a model tracing SDK. Native usage takes precedence over CLI fallback. Its billed-cost field is deliberately unavailable. Skill activation events are observed, but the sanitized metadata contract does not currently retain a skill name. Their count cannot establish cost attributable to each skill.

The existing #95 telemetry adoption is closed. #159 covers Actions/storage accounting, #156 quality and #179 practices. The missing increment is current producer coverage, attributable usage and a real historical chart, rather than another generic Health epic.

## What was actually inspected

All reads below were metadata-only. No agent database, runner image, telemetry settings, exporter endpoint or application behavior was changed.

| Source | Observation | Limit |
| --- | --- | --- |
| Host OpenCode executable | Version 2.1.0 | Does not identify the engine inside an isolated job |
| Host SQLite, opened with `mode=ro` and `query_only` | `session_v2` and `session_message`; 4,586 sessions and 20,857 messages | A legacy `session`/`message`/`part` query would fail here; no issue/runner binding was established |
| Session rollups | Token buckets exist; every inspected engine-cost value was zero | This is not a provider invoice, proof of completeness or zero spend |
| Assistant content | Stored text and tool records exist | Payloads were not exported; safe counts are a separate extraction from prompts and results |
| Default operator Lighthouse telemetry | 129 health records; 890 retained events dated November 7–8 | One default directory is not the complete runner fleet; old `active` flags are not live health |
| Retained event kinds | Admission, host wait, phases, capability and one source signal | No model-step or resource event exists in this inspected sample |
| Correlation | Repository present on 890 events, issue on 889, runner on none | Cannot produce a per-runner cost chart from this sample |

The host database had no recorded `session.skill.activated` event in the queried event table. That does not prove no skills were used: schema, retention and the actual recording path must be established first. Likewise, available or configured skills are different from activated skills.

OpenCode's [official CLI documentation](https://opencode.ai/docs/cli/) provides `opencode debug paths db` without starting a server or opening the database. The inspected source checkout was anomalyco/opencode commit `60c68d145a14127ce633e26aa5fdfb882a7baa6d`; its [session-message schema](https://github.com/anomalyco/opencode/blob/60c68d145a14127ce633e26aa5fdfb882a7baa6d/packages/schema/src/session-message.ts) describes models, tools, tokens, costs and skills. Source inspection is separate from deployed runner qualification.

## Useful dimensions and measurements

| Question | Primary source | Required qualification |
| --- | --- | --- |
| Usage per issue | Lighthouse repository/issue/run correlation | Numeric repository identity, exact issue/run/attempt; title is mutable display metadata |
| Usage per model | Native executed-step provider/model plus token buckets | Distinguish runtime-reported identity from requested configuration and billing-provider identity |
| Usage per command or action | Stage/action and safe tool events | Tool category is available; shell arguments and output stay excluded |
| Activity per skill | Native activation event, where recorded | Counts only; named attribution needs a safe producer extension and reviewed semantics |
| Runner health | Startup/heartbeat/job identity and resource samples | Fresh producer, supported counters, clock and retention coverage; no inference from registration alone |
| Resource trends | Cgroup samples linked to an execution | Delta cumulative CPU/IO counters; keep memory gauges separate; detect reset and namespace scope |
| Monetary cost | Attributable provider billing or a versioned estimate | Display billed, engine-reported, estimated and unavailable separately |

Deduplicate stable source event IDs and resume by stream/sequence. Choose a single usage grain: never add session rollups to step totals, native usage to fallback usage, or already-included child-session totals to parents. Retries remain separate attempts. Compaction/title calls need explicit coverage rather than silently being included in primary-step totals.

## Next delivery

1. Qualify one existing runner and one exact issue/run/attempt through the public Lighthouse telemetry reader. Record actual engine and adapter versions, freshness, available fields, gaps and permission boundaries. Preserve unsupported dimensions as unknown.
2. Freeze a sanitized sample and derive tokens, elapsed time and available resources. Reconcile one execution against its source records; retain missing/duplicate/retry and uncorrelated cases. Compare SQLite only as an optional version-specific diagnostic or backfill source.
3. Add one reproducible historical usage chart and source drill-down to the Health experience, with explicit window, units, coverage and grouping by supported issue/model/action/runner dimensions. Existing Lighthouse measurement collection/rendering can supply a bounded report before persistent ingestion is justified.
4. Evaluate persistent export separately. A Collector plus Grafana/Loki is plausible for event exploration. Select a metrics store only if the required queries need one; select trace storage only if actual spans are produced. No backend or deployment was selected by this inspection.

For Loki, use a small set of bounded source labels. Keep issue titles, run IDs and session IDs as structured metadata, not index labels; see [Grafana's cardinality guidance](https://grafana.com/docs/loki/latest/get-started/labels/cardinality/). OTLP transport does not turn logs into metrics or independently verify their source claims.

FR-EVIDENCE-CORRELATION, FR-RUNTIME-HEALTH, FR-PROJECT-HEALTH and BR-EXPLAINABLE-SIGNALS govern the follow-up. New product semantics require a Product Change; architecture selection follows that boundary. Raw prompts, code, transcripts, tool arguments/results and credentials remain excluded. Observation does not dispatch work or establish delivery acceptance.
