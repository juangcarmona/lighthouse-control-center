import { spawnSync } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

const root = new URL('../src/telemetry/', import.meta.url);
const compose = ['compose', '-f', new URL('compose.yaml', root).pathname, '-p', 'lcc-agent-telemetry-e2e'];
const loki = 'http://127.0.0.1:3100';
const grafana = 'http://127.0.0.1:3000';
const collector = 'http://127.0.0.1:4318';
const prometheus = 'http://127.0.0.1:9090';
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
const claudeMetrics = {
  resourceMetrics: [{
    resource: { attributes: [{ key: 'service.name', value: { stringValue: 'claude-code' } }, { key: 'user.email', value: { stringValue: 'private@example.test' } }] },
    scopeMetrics: [{ scope: { name: 'com.anthropic.claude_code', version: '1' }, metrics: [
      { name: 'claude_code.token.usage', unit: 'tokens', sum: { aggregationTemporality: 1, isMonotonic: true, dataPoints: [{ attributes: [
        { key: 'model', value: { stringValue: 'claude-test-model' } }, { key: 'type', value: { stringValue: 'input' } }, { key: 'skill.name', value: { stringValue: 'test-skill' } }, { key: 'user.email', value: { stringValue: 'private@example.test' } },
      ], timeUnixNano: String(BigInt(Date.now()) * 1_000_000n), asDouble: 250 }] } },
      { name: 'claude_code.cost.usage', unit: 'USD', sum: { aggregationTemporality: 1, isMonotonic: true, dataPoints: [{ attributes: [
        { key: 'model', value: { stringValue: 'claude-test-model' } }, { key: 'skill.name', value: { stringValue: 'test-skill' } },
      ], timeUnixNano: String(BigInt(Date.now()) * 1_000_000n), asDouble: 0.0125 }] } },
    ] }],
  }],
};

let started = false;
try {
  run(['up', '-d']);
  started = true;
  await ready(loki, '/ready');
  await ready(grafana, '/api/health');
  await ready('http://127.0.0.1:13133', '/');
  await ready(prometheus, '/-/ready');

  const body = JSON.stringify(payload);
  for (let replay = 0; replay < 2; replay++) {
    await json(`${collector}/v1/logs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
  }
  await json(`${collector}/v1/metrics`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(claudeMetrics) });

  const query = async expression => json(`${loki}/loki/api/v1/query?query=${encodeURIComponent(expression)}`);
  let raw;
  let rawCount = 0;
  for (let attempt = 0; attempt < 15; attempt++) {
    raw = await query(`sum(count_over_time({service_name="lighthouse"} | json | id="${eventId}" [10m]))`);
    rawCount = Number(raw.data?.result?.[0]?.value?.[1] ?? 0);
    if (rawCount === 1) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (rawCount !== 1) throw Error(`Expected Loki to collapse the exact replayed line, got ${JSON.stringify(raw)}`);

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

  const claudePanel = panels.find(panel => panel.title.includes('Claude Code cumulative tokens'));
  const claudeCostPanel = panels.find(panel => panel.title.includes('Claude-reported estimated cost'));
  if (!claudePanel || !claudeCostPanel || !panels.some(panel => panel.title === 'Claude-reported cost provenance')) throw Error('Provisioned Grafana dashboard is missing Claude token, cost and provenance panels');
  const claudeQuery = claudePanel.targets.find(target => target.refId === 'A').expr.replace('$__rate_interval', '5m');
  let claudeUsage;
  for (let attempt = 0; attempt < 30; attempt++) {
    claudeUsage = await json(`${prometheus}/api/v1/query?query=${encodeURIComponent(claudeQuery)}`);
    if (Number(claudeUsage.data?.result?.[0]?.value?.[1]) > 0) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  const claudeSample = claudeUsage.data?.result?.find(sample => sample.metric.model === 'claude-test-model' && sample.metric.type === 'input');
  if (!claudeSample || Number(claudeSample.value?.[1]) !== 250) throw Error(`Claude token metric did not reach Prometheus with its model and type attributes: ${JSON.stringify(claudeUsage)}`);
  const privateLabel = await json(`${prometheus}/api/v1/query?query=${encodeURIComponent('target_info{user_email="private@example.test"}')}`);
  if (privateLabel.data?.result?.length) throw Error('Claude resource identity must be removed before Prometheus storage');
  const costQuery = claudeCostPanel.targets[0].expr;
  let claudeCost;
  for (let attempt = 0; attempt < 30; attempt++) {
    claudeCost = await json(`${prometheus}/api/v1/query?query=${encodeURIComponent(costQuery)}`);
    if (Number(claudeCost.data?.result?.[0]?.value?.[1]) > 0) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!claudeCost.data?.result?.some(sample => sample.metric.model === 'claude-test-model' && Number(sample.value?.[1]) === 0.0125)) throw Error(`Claude estimated cost metric was not queryable from Prometheus: ${JSON.stringify(claudeCost)}`);

  console.log(JSON.stringify({ status: 'passed', replayedPayloads: 2, storedRawRecords: rawCount, deduplicatedInputTokens: tokenCount, claudeMetric: claudeSample.metric.__name__, claudeMetricModel: claudeSample.metric.model, dashboardPanels: panels.length }, null, 2));
} finally {
  if (started) run(['down', '-v', '--remove-orphans']);
}
