// The host owns credentials, HTTP initiation and artifact downloads. This child only runs the shared SDK.
import { TextDecoder } from 'node:util';

const maximum = 4 * 1024 * 1024;
const diagnosticStatuses = new Set([401, 403, 404, 408, 409, 429, 500, 502, 503]);
const iterator = process.stdin[Symbol.asyncIterator]();
const decoder = new TextDecoder('utf-8', { fatal: true });
let buffered = Buffer.alloc(0), sequence = 0, broken = false, tail = Promise.resolve();
let failedRead = null;
const positive = value => Number.isSafeInteger(value) && value > 0;
const emit = value => process.stdout.write(JSON.stringify(value) + '\n');

function initialReadCategory(request, number) {
  if (request.scope === 'account' && request.path === 'user') return 'actor';
  if (request.scope !== 'repository' || typeof request.path !== 'string') return null;
  if (request.path === '') return 'repository';
  if (request.path === `issues/${number}`) return 'issue';
  if (request.path.startsWith('commits/')) return 'commits';
  if (new RegExp(`^issues/${number}/comments\\?per_page=100&page=[1-9][0-9]*$`).test(request.path)) return 'comments';
  return null;
}

function diagnosticReason(failure) {
  const status = diagnosticStatuses.has(failure.status) ? `http-${failure.status}` : 'status-unknown';
  return `source-read-${failure.category}-${status}`;
}

async function frame() {
  while (true) {
    const newline = buffered.indexOf(10);
    if (newline >= 0) {
      const bytes = buffered.subarray(0, newline);
      buffered = buffered.subarray(newline + 1);
      if (!bytes.length || bytes.length > maximum || bytes.includes(13)) throw Error('Invalid frame');
      return JSON.parse(decoder.decode(bytes));
    }
    const next = await iterator.next();
    if (next.done || buffered.length + next.value.length > maximum + 1) throw Error('Incomplete or oversized frame');
    buffered = Buffer.concat([buffered, next.value]);
  }
}

function callback(kind, parameters) {
  const pending = tail.then(async () => {
    if (broken || ++sequence > 64) { broken = true; throw Error('Callback bound'); }
    emit({ type: 'request', id: sequence, kind, ...parameters });
    let reply;
    try { reply = await frame(); }
    catch { broken = true; throw Error('Protocol unavailable'); }
    if (reply?.type !== 'response' || reply.id !== sequence || typeof reply.ok !== 'boolean'
        || Object.keys(reply).some(key => !['type', 'id', 'ok', 'value', 'status'].includes(key))) {
      broken = true; throw Error('Invalid callback response');
    }
    if (!reply.ok) throw Object.assign(Error('Source request unavailable'), { status: Number.isInteger(reply.status) ? reply.status : 0 });
    return reply.value;
  });
  tail = pending.catch(() => {});
  return pending;
}

// The SDK must use the injected transport even if a future implementation accidentally calls fetch.
globalThis.fetch = async () => { broken = true; throw Error('Only host transport is available'); };

try {
  const input = await frame();
  if (input?.version !== 1 || !['observe', 'prepare', 'submit', 'reconcile'].includes(input.operation) || !positive(input.number) || input.number > 2147483647
      || typeof input.repository !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(input.repository)
      || Object.keys(input).some(key => !['version', 'operation', 'repository', 'number', 'action', 'id', 'body', 'prepared'].includes(key))
      || input.operation === 'observe' && Object.keys(input).length !== 4
      || input.operation === 'prepare' && (!['refine', 'propose', 'comment', 'continue'].includes(input.action)
          || typeof input.id !== 'string' || typeof input.body !== 'string' || Buffer.byteLength(input.body) > 12288)
      || ['submit', 'reconcile'].includes(input.operation) && (!input.prepared || Object.keys(input).length !== 5)) throw Error('Invalid observation');
  let createIssueControl;
  try { ({ createIssueControl } = await import('@juangcarmona/lighthouse-sdlc/issue-control')); }
  catch (error) {
    if (!['ERR_PACKAGE_PATH_NOT_EXPORTED', 'ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(error.code)) throw error;
  }
  if (typeof createIssueControl !== 'function') {
    emit({ type: 'result', result: { availability: 'unsupported', reason: 'installed-issue-control-contract-unavailable' } });
  } else {
    const sdk = createIssueControl({ repository: input.repository,
      transport: async request => {
        if (!['GET', 'POST'].includes(request.method) || request.method === 'GET' && request.body !== undefined || !['account', 'repository'].includes(request.scope)
            || request.scope === 'account' && request.path !== 'user'
            || request.scope === 'repository' && request.repository !== input.repository) {
          broken = true; throw Error('Transport boundary');
        }
        if (request.method === 'POST') {
          if (input.operation !== 'submit' || request.scope !== 'repository') { broken = true; throw Error('Effect boundary'); }
          return callback('effect', { scope: request.scope, path: request.path, method: 'POST', body: request.body, apiVersion: request.apiVersion ?? null });
        }
        try { return await callback('transport', { scope: request.scope, path: request.path }); }
        catch (error) {
          const category = initialReadCategory(request, input.number);
          if (category) failedRead = { category, status: error.status };
          if (request.optional === true && error.status === 404) return null;
          throw error;
        }
      },
      readAuthority: ({ actor, metadata }) => callback('authority', { actorId: actor?.id, repositoryId: metadata?.id }),
      readArtifact: async (api, repository, runId, name, member, optional = false) => {
        if (repository !== input.repository || !/^[1-9][0-9]{0,15}$/.test(String(runId))
            || typeof name !== 'string' || !/^lighthouse-[a-z0-9-]{1,190}$/.test(name)
            || !['request.json', 'envelope.json', 'result.json'].includes(member)) throw Error('Unsupported artifact');
        const inventory = await api('actions/runs/' + runId + '/artifacts?per_page=100');
        if (!Array.isArray(inventory?.artifacts) || inventory.total_count !== inventory.artifacts.length
            || inventory.total_count > 100) throw Error('Incomplete artifact coverage');
        const matches = inventory.artifacts.filter(item => item.name === name);
        if (optional && !matches.length) return null;
        if (matches.length !== 1 || matches[0].expired !== false || !positive(matches[0].id)
            || !Number.isSafeInteger(matches[0].size_in_bytes) || matches[0].size_in_bytes < 0
            || matches[0].size_in_bytes > 2 * 1024 * 1024) throw Error('Artifact unavailable');
        return callback('artifact', { artifactId: matches[0].id, member });
      },
    });
    let result = input.operation === 'observe' ? await sdk.observe({ number: input.number })
      : input.operation === 'prepare' ? await sdk.prepare({ number: input.number, action: input.action, id: input.id, body: input.body })
      : input.operation === 'reconcile' ? await sdk.reconcile(input.prepared)
      : await sdk.submit(input.prepared, { claim: value => callback('claim', value) });
    if (broken) throw Error('Observation protocol failed');
    if (input.operation === 'observe' && result.availability === 'unavailable'
        && result.reason === 'source-observation-unavailable' && failedRead) {
      result = { ...result, reason: diagnosticReason(failedRead) };
    }
    emit({ type: 'result', result });
  }
} catch {
  emit({ type: 'result', result: { availability: 'unavailable', reason: 'source-control-read-unavailable' } });
}
