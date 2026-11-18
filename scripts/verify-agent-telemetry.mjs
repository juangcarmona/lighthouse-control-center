import { spawnSync } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

const root = new URL('../src/telemetry/', import.meta.url);
const compose = ['compose', '-f', new URL('compose.yaml', root).pathname, '-p', 'lcc-agent-telemetry-e2e'];
const loki = 'http://127.0.0.1:3100';
const grafana = 'http://127.0.0.1:3000';
process.env.GRAFANA_ADMIN_PASSWORD ??= randomBytes(24).toString('base64url');

function run(args) {
  const result = spawnSync('docker', [...compose, ...args], { encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) throw Error(result.stderr || result.stdout || `docker ${args.join(' ')} failed`);
  return result.stdout;
}

async function ready(url, path) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(url + path);
      if (response.ok) return;
    } catch { /* service is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw Error(`Service did not become ready: ${url}${path}`);
}

async function json(url, options) {
  const response = await fetch(url, options);
  const body = await response.text();
  if (!response.ok) throw Error(`${response.status} ${url}: ${body}`);
  return body ? JSON.parse(body) : {};
}

const stream = randomUUID();
const eventId = createHash('sha256').update(`${stream}:1`).digest('hex');
const event = {
  schemaVersion: 1,
  id: eventId,
  stream,
  sequence: 1,
  type: 'session.step.ended',
  time: new Date().toISOString(),
  observedAt: new Date().toISOString(),
  producer: { component: 'opencode-telemetry', packageVersion: '2.1.0', installationId: 'f'.repeat(32), environment: 'local' },
  correlation: {
    repository: 'sample/project', issue: '42', pullRequest: null, revision: 'a'.repeat(40), worker: 'sample-worker', stage: 'implement', runId: 'sample-run', workflowRunId: '1001', workflowAttempt: '1', job: 'agent', runner: 'sample-runner', sessionId: 'sample-session', parentSessionId: null, requestId: null, routerRunId: null, routerAttempt: null, signalId: null,
  },
  traceId: 'a'.repeat(32),
  spanId: 'b'.repeat(16),
  source: { kind: 'opencode', id: 'sample-step', sequence: 1, artifact: 'native-events.jsonl' },
  attributes: { model: 'gpt-test-model', provider: 'openai', modelSource: 'executed', action: 'lighthouse-sdlc-implement', inputTokens: 120, outputTokens: 30, reasoningTokens: 5, cacheReadTokens: 50, cacheWriteTokens: 0, durationMs: 1200, status: 'completed' },
};
const payload = {
  resourceLogs: [{
    resource: { attributes: [{ key: 'service.name', value: { stringValue: 'lighthouse' } }, { key: 'service.version', value: { stringValue: '0.29.0' } }] },
    scopeLogs: [{
      scope: { name: 'lighthouse.telemetry', version: '1' },
      logRecords: [{
        timeUnixNano: String(BigInt(Date.parse(event.time)) * 1_000_000n),
        observedTimeUnixNano: String(BigInt(Date.parse(event.observedAt)) * 1_000_000n),
        severityNumber: 9,
        body: { stringValue: JSON.stringify(event) },
        traceId: event.traceId,
        spanId: event.spanId,
        attributes: [{ key: 'event.name', value: { stringValue: event.type } }, { key: 'lighthouse.event.id', value: { stringValue: event.id } }],
      }],
    }],
  }],
};

let started = false;
try {
  run(['up', '-d']);
  started = true;
  await ready(loki, '/ready');
  await ready(grafana, '/api/health');

  const body = JSON.stringify(payload);
  for (let replay = 0; replay < 2; replay++) {
    await json(`${loki}/otlp/v1/logs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
  }

  const query = async expression => json(`${loki}/loki/api/v1/query?query=${encodeURIComponent(expression)}`);
  const raw = await query(`sum(count_over_time({service_name="lighthouse"} | json | id="${eventId}" [10m]))`);
  const rawCount = Number(raw.data?.result?.[0]?.value?.[1]);
  if (rawCount !== 1) throw Error(`Expected Loki to collapse the exact replayed line, got ${rawCount}`);

  const dashboard = await json(`${grafana}/api/dashboards/uid/lighthouse-agent-usage`, { headers: { authorization: `Basic ${Buffer.from(`admin:${process.env.GRAFANA_ADMIN_PASSWORD}`).toString('base64')}` } });
  const panels = dashboard.dashboard?.panels ?? [];
  if (!panels.some(panel => panel.title.includes('replay-deduplicated')) || !panels.some(panel => panel.title === 'Cost provenance')) throw Error('Provisioned Grafana dashboard is missing usage or cost-provenance panels');
  const usagePanel = panels.find(panel => panel.title.includes('replay-deduplicated'));
  const inputQuery = usagePanel.targets.find(target => target.refId === 'A').expr.replace('$__interval', '10m');
  const outputQuery = usagePanel.targets.find(target => target.refId === 'B').expr.replace('$__interval', '10m');
  const actionQuery = usagePanel.targets.find(target => target.refId === 'C').expr.replace('$__interval', '10m');
  const inputUsage = await query(inputQuery);
  const outputUsage = await query(outputQuery);
  const actionUsage = await query(actionQuery);
  const inputSample = inputUsage.data?.result?.find(sample => sample.metric.model === event.attributes.model && sample.metric.stage === event.correlation.stage);
  const outputSample = outputUsage.data?.result?.find(sample => sample.metric.model === event.attributes.model && sample.metric.stage === event.correlation.stage);
  const actionSample = actionUsage.data?.result?.find(sample => sample.metric.action === event.attributes.action);
  const tokenCount = Number(inputSample?.value?.[1]);
  if (tokenCount !== event.attributes.inputTokens) throw Error(`Dashboard input query must return ${event.attributes.inputTokens} replay-deduplicated tokens by model; got ${JSON.stringify(inputUsage)}`);
  if (Number(outputSample?.value?.[1]) !== event.attributes.outputTokens) throw Error(`Dashboard output query must return ${event.attributes.outputTokens} replay-deduplicated tokens by model; got ${JSON.stringify(outputUsage)}`);
  if (Number(actionSample?.value?.[1]) !== event.attributes.inputTokens) throw Error(`Dashboard action query must return ${event.attributes.inputTokens} replay-deduplicated tokens by reported action; got ${JSON.stringify(actionUsage)}`);

  console.log(JSON.stringify({ status: 'passed', replayedPayloads: 2, storedRawRecords: rawCount, deduplicatedInputTokens: tokenCount, dashboardPanels: panels.length }, null, 2));
} finally {
  if (started) run(['down', '-v', '--remove-orphans']);
}
