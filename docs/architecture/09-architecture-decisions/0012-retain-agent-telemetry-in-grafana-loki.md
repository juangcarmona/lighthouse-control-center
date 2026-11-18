---
id: ADR-0012
title: Report agent telemetry through Grafana Loki and Prometheus
status: Accepted
date: "2026-11-18"
deciders: [Maintainer]
---

<!-- markdownlint-disable-next-line MD025 -->
# ADR-0012: Report agent telemetry through Grafana Loki and Prometheus

## Context

Lighthouse SDLC 0.29.0 publishes correlated, metadata-only agent and runner events in OTLP/HTTP JSON. The exporter checkpoints acknowledged batches, so a lost acknowledgement can replay events and receivers need the stable event IDs. The Control Center product change adds attributable health and usage reporting while repository workflows and independent runners keep execution ownership.

The maintainer approved Grafana and the agent-observability scope. Operators need event fields for source investigation, a small set of indexed labels and a clear separation between provider billing and runtime token observations. The local runner example is for operator evaluation; it does not establish production hosting.

## Decision

Grafana with Loki and Prometheus is the first retained telemetry reporting stack. Lighthouse sends its existing OTLP log envelope through an OpenTelemetry Collector to Loki; native agent metrics such as Claude Code usage flow through the Collector to Prometheus. The Control Center repository provides a local stack, datasources and dashboards for operators to adapt to their runtime.

Index only bounded service and environment attributes. Store repository, issue, workflow run, attempt, runner, session, event ID, model and action values in Loki's body or structured metadata. Deduplicate dashboard usage by Lighthouse event ID before summing. Native completed model steps supply Lighthouse event token totals; Claude metrics provide native token and approximate cost observations by their source-reported attributes. Fallback, compaction and lifecycle events stay separate. Label Claude costs as estimates, not billed cost.

Control Center Health links to telemetry reporting tied to source records. Operators configure runners, OTLP credentials, retention and any external deployment. The Control Center does not collect events or schedule execution. The local Collector endpoints bind to loopback; remote runner adoption requires authenticated TLS, operator-managed access and retention controls.

## Alternatives considered

- **Emit directly to a metrics backend:** loses the event-level source context and requires a separate cardinality and attribution scheme before the current event contract is proven.
- **Use Elasticsearch or a new analytics database:** adds another service and schema without a demonstrated query need beyond Loki's structured metadata and LogQL.
- **Keep only the in-memory or local health projection:** does not provide retained cross-run trends or the Grafana exploration the maintainer requested.
- **Index run, session, issue and model values as Loki labels:** creates high-cardinality streams and harms Loki query and index performance.

## Consequences

Operators can explore retained events and native metrics in Grafana. Dashboards use stable event IDs to avoid counting replayed Lighthouse usage twice; raw event counts can still include replayed observations. Producer and provider evidence sets the limits for cost, completeness and source authenticity. Operators must qualify retention, access, storage, availability and runner deployment for their environment.

## References

- [Product Change CHG-AGENT-OBSERVABILITY-001](../../product/changes/completed/chg-agent-observability-001/change.md)
- [Lighthouse runner telemetry contract](https://github.com/juangcarmona/lighthouse/blob/main/src/packages/sdlc/telemetry.md)
- [Grafana Loki OTLP ingestion](https://grafana.com/docs/loki/latest/send-data/otel/)
- [Grafana Loki label cardinality](https://grafana.com/docs/loki/latest/get-started/labels/cardinality/)
- [OpenTelemetry Collector Prometheus exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusexporter)
- [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage)
- [ADR-0006: Observe repository-owned workflows](0006-observe-repository-owned-workflows.md)
