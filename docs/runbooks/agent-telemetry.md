# Agent and runner telemetry

The optional stack in [`src/telemetry/`](../../src/telemetry/) stores Lighthouse SDLC events in Loki and provisions a Grafana dashboard. Control Center does not collect the events or take part in runner scheduling.

Set `SoFa:Telemetry:DashboardUrl` to the Grafana HTTPS base URL to show its dashboard link in Control Center Health. Local development may use loopback HTTP. Health displays the link only in an authorized session; the Control Center sends no telemetry credentials or event data to Grafana.

## Run locally

From the repository root, set a private `GRAFANA_ADMIN_PASSWORD`, then start the stack with `docker compose -f src/telemetry/compose.yaml up -d`. Open Grafana at `http://127.0.0.1:3000` and Loki at `http://127.0.0.1:3100/ready`. The example binds to loopback, uses local filesystem volumes and keeps data for 14 days. This single-node setup has no authentication on Loki and is for local evaluation only; do not expose either port to a network.

Set the runner's private `otlpEndpoint` to `http://<telemetry-host>:3100/otlp/v1/logs`, or pass the same address through `LIGHTHOUSE_TELEMETRY_OTLP_ENDPOINT` to the public export command. The address must be reachable from inside the runner container. Store authentication headers in `LIGHTHOUSE_TELEMETRY_OTLP_HEADERS` or the operator's protected runner secret store. Keep credentials out of URLs, workflow output and repository configuration. Runners on another machine require an authenticated TLS endpoint.

The exporter delivers at least once and saves a per-stream checkpoint after a successful response. If it stops between acknowledgement and checkpoint, the next export may replay events. Loki collapses an exact timestamp and line replay, and the dashboard deduplicates native-step token totals by event ID. Raw event exploration may include changed observations; do not use its row count as a usage total.

## Read the dashboard

The **Lighthouse agent usage** dashboard groups input and output tokens for completed native model steps by executed model and workflow stage. It also groups input tokens by source-reported action. The event explorer includes CLI fallback and compaction events; native totals exclude them. The cost panel reports unavailable because token usage does not show provider billing. When supplied by the producer, event details include repository, issue, workflow run, attempt, runner, action, source, model and observation times. Loki stores these values as log metadata, not index labels. The safe event contract does not retain skill names, so skill totals are unavailable.

Coverage depends on the installed Lighthouse version, runner adoption, producer retention and delivery. Missing model, skill, command, billing, event or source correlation stays unknown. Workflow artifacts and telemetry associations are observations; they do not verify a provider bill or accepted delivery. Skill-specific totals need a safe skill identity and documented activation semantics from the producer.

## Verify and stop

Run `npm run test:e2e:telemetry` to start disposable real Loki and Grafana containers, send the same native-step event twice, verify Loki stores one exact log line and assert that the dashboard's LogQL usage aggregation returns the event's token count once. The test checks the provisioned dashboard API and removes its containers and volumes on completion. Stop an operator stack with `docker compose -f src/telemetry/compose.yaml down`; add `-v` only when intentionally deleting retained local data.
