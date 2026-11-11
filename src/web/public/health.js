import { updateWorkspaceAccount, workspaceSourceIdentityGeneration, validateWorkspaceSourceIdentity } from './workspace-ui.js';
const byId = id => document.getElementById(id);
const node = (tag, text, className) => { const value = document.createElement(tag); if (text !== undefined) value.textContent = text; if (className) value.className = className; return value; };
const validRepository = name => typeof name === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(name);
const time = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : 'Unknown';
const path = location.pathname.match(/^\/workspace\/health\/([^/]+)\/([^/]+)(?:\/runs\/([1-9][0-9]*))?$/);
const selected = path ? path.slice(1, 3).map(decodeURIComponent).join('/') : null;
const runId = path?.[3];
let repositories = new Map(), scope, busy = false, epoch = 0, deadline;
function link(text, href) { const value = node('a', text); value.href = href; value.dataset.healthKey = href; return value; }
function healthHref(repository) { return '/workspace/health/' + repository.split('/').map(encodeURIComponent).join('/'); }
function age(value) {
  const elapsed = Date.now() - Date.parse(value);
  return Number.isFinite(elapsed) && elapsed >= 0 ? Math.floor(elapsed / 60000) + ' min ago' : 'Unknown age';
}
function facts(rows) {
  const value = node('dl'); for (const [key, text] of rows) value.append(node('dt', key), node('dd', text ?? 'Unknown')); return value;
}
function coverage(row) {
  return row.scope || 'Latest 20 workflow runs and first 100 open issue records; not a complete delivery audit';
}
function state(row) {
  return row.availability === 'denied' ? 'Access denied' : row.availability === 'stale' ? 'Stale · partial coverage'
    : row.availability === 'available' ? 'Observed · partial coverage' : 'Evidence unavailable';
}
function provenance(row) {
  const value = node('details'); value.append(node('summary', 'Collection scope and freshness'),
    facts([['Scope', coverage(row)], ['Observed', time(row.observedAt)], ['Age', age(row.observedAt)], ['Coverage', 'Bounded collection; total and omitted records unknown']]));
  if (row.reason) value.append(node('p', row.reason)); return value;
}
function family(title, explanation) { const section = node('section', undefined, 'health-family'); section.append(node('h2', title), node('p', explanation)); return section; }
function detail(repository, row, run) {
  const section = node('section', undefined, 'health-detail'); section.append(node('h2', run.name || 'Workflow run ' + run.id));
  section.append(node('p', 'GitHub Actions · exact contributing run', 'health-kicker'));
  const summary = facts([
    ['Source result', (run.status || 'Unknown status') + ' · ' + (run.conclusion || 'Conclusion unknown')],
    ['Observed', time(row.observedAt) + ' · ' + age(row.observedAt)],
    ['Purpose', 'Investigate this workflow execution. Delivery acceptance and deployment require separate evidence.']
  ]); summary.className = 'health-summary'; section.append(summary);
  try {
    const url = new URL(run.url);
    if (url.origin !== 'https://github.com' || url.username || url.password || url.pathname !== '/' + repository + '/actions/runs/' + run.id) throw Error();
    const source = link('Open exact contributing GitHub run', url.href); source.rel = 'noreferrer noopener'; source.className = 'health-source'; section.append(source);
  } catch { section.append(node('p', 'Exact source link unavailable.')); }
  const provenance = node('details', undefined, 'health-provenance'); provenance.append(node('summary', 'Source fields and limitations'), facts([
    ['Decision purpose', 'Inspect this workflow execution and decide whether its source evidence needs investigation.'],
    ['Source', 'GitHub Actions workflow run'], ['Definition', 'Source-reported status and conclusion; no calculated score'],
    ['Definition version', 'Not supplied by this source observation'], ['Unit', 'Categorical source verdict; numeric unit not applicable'],
    ['Window', 'One workflow run in the latest-20 collection; not a fixed historical interval'],
    ['Coverage', 'One contributing run; repository collection is bounded and may omit runs'],
    ['Freshness', state(row) + ' · observed ' + time(row.observedAt) + ' · ' + age(row.observedAt)],
    ['Applicability', 'Workflow execution only; deployment and delivery acceptance are not assessed'],
    ['Status', run.status || 'Unknown'], ['Conclusion', run.conclusion || 'Unknown / not reported'],
    ['Source run ID', String(run.id)], ['Source attempt', Number.isSafeInteger(run.runAttempt) && run.runAttempt > 0 ? String(run.runAttempt) : 'Unknown'],
    ['Triggering event', run.event || 'Unknown'], ['Revision', run.sourceRevision || 'Unknown'],
    ['Source start', time(run.startedAt)], ['Source update', time(run.updatedAt)],
    ['Limitations', 'A green run is not a deployment, accepted delivery, quality score or evidence of available capacity. Missing fields remain unknown.']
  ])); section.append(provenance);
  return section;
}
function render() {
  const active = document.activeElement, key = active?.dataset.healthKey;
  const root = byId('health-results'), fragment = document.createDocumentFragment();
  root.className = !selected ? 'health-fleet' : runId ? 'health-detail-view' : 'health-project';
  byId('health-title').textContent = selected ? 'Project health' : 'Health';
  document.title = (selected ? selected + ' · Health' : 'Health') + ' · Lighthouse Control Center';
  const breadcrumb = byId('health-breadcrumb'); breadcrumb.replaceChildren();
  if (selected) breadcrumb.append(link('Health', '/workspace/health'), document.createTextNode(' / '), link(selected, healthHref(selected)));
  if (!selected) {
    for (const [repository, row] of repositories) {
      const item = node('article', undefined, 'health-row'); item.dataset.repository = repository;
      const heading = node('h2'); heading.append(link(repository, healthHref(repository)));
      const failed = row.runs?.some(run => run.conclusion === 'failure');
      item.append(heading, node('span', state(row), 'badge caution'),
        node('p', failed ? 'Source workflow failure observed · inspect evidence' : 'Overall health is not assessed.'),
        node('p', age(row.observedAt), 'muted'), provenance(row)); fragment.append(item);
    }
    if (!repositories.size) fragment.append(node('p', 'No authorized repository observation is available. This does not establish an empty or healthy fleet.'));
  } else {
    const row = repositories.get(selected);
    if (!row) fragment.append(node('p', 'This repository is not in the current authorized collection.'));
    else {
      fragment.append(node('p', state(row), 'notice'), provenance(row));
      if (runId) {
        const run = row.runs?.find(value => String(value.id) === runId);
        fragment.append(link('Back to project health', healthHref(selected)));
        fragment.append(run ? detail(selected, row, run) : node('p', 'This run is unavailable in the current bounded collection. No result is inferred.'));
      } else {
        const delivery = family('Delivery', 'Workflow execution observations, not deployment or delivery acceptance.');
        for (const run of row.runs ?? []) {
          if (!Number.isSafeInteger(run.id) || run.id <= 0) continue;
          const item = node('article', undefined, 'health-run'); item.append(link(run.name || 'Workflow run ' + run.id, healthHref(selected) + '/runs/' + run.id),
            node('span', (run.status || 'Unknown status') + ' · ' + (run.conclusion || 'Conclusion unknown'), 'badge')); delivery.append(item);
        }
        if (!row.runs?.length) delivery.append(node('p', row.availability === 'available' ? 'No workflow runs in the successfully collected scope; this is not a health verdict.' : 'Workflow evidence unavailable; Actions and Issues read permission and a successful source observation are required.'));
        fragment.append(delivery,
          family('Engineering quality', 'Unavailable: coverage, mutation and security reports are not supplied by this observation source.'),
          family('Lighthouse adoption/autonomy', 'Unavailable: this source does not supply comparable adoption or autonomy assessments. Committed version inventory is separate from installed adoption.'),
          family('Resources', 'Unavailable: attributable provider usage, cost, CPU, memory and storage measurements are not supplied. Runner registrations do not establish free capacity.'));
        fragment.append(link('Inspect existing runtime and version inventory', '/workspace/runtime'));
      }
      fragment.append(node('p', 'Trends unavailable: no comparable historical samples or definition-change boundaries are supplied yet. No missing interval is treated as zero.', 'notice'));
    }
  }
  root.replaceChildren(fragment);
  if (key && !active.isConnected) ([...root.querySelectorAll('[data-health-key]')].find(value => value.dataset.healthKey === key) || byId('health-title')).focus();
}
function clear(message, expired = false) {
  epoch++; scope = undefined; repositories.clear(); clearTimeout(deadline); updateWorkspaceAccount({ state: expired ? 'expired' : 'unavailable' });
  render(); byId('health-status').textContent = message;
}
async function refresh() {
  if (busy) return; busy = true; const requestEpoch = ++epoch;
  byId('refresh').disabled = true; byId('health-status').textContent = 'Verifying current source authority…';
  try {
    const sessionResponse = await fetch('/api/session', { cache: 'no-store', signal: AbortSignal.timeout(35000) });
    if ([401, 403].includes(sessionResponse.status)) { clear('Sign in again to read Health.', true); return; }
    if (!sessionResponse.ok) throw Error();
    const session = await sessionResponse.json();
    if (requestEpoch !== epoch) return;
    const expires = Math.min(Date.parse(session.idleDeadline), Date.parse(session.absoluteDeadline));
    if (!session.authenticated || !Number.isFinite(expires) || expires <= Date.now()) { clear('Owner session ended. Sign in again.', true); return; }
    clearTimeout(deadline); deadline = setTimeout(() => clear('Owner session ended. Sign in again.', true), expires - Date.now());
    const accountResponse = await fetch('/api/connections/github', { cache: 'no-store', signal: AbortSignal.timeout(35000) });
    if (requestEpoch !== epoch) return;
    if ([401, 403, 409].includes(accountResponse.status)) { clear('Account authority ended. Verify Account again.'); return; }
    if (!accountResponse.ok) throw Error();
    const account = await accountResponse.json(); if (requestEpoch !== epoch) return;
    updateWorkspaceAccount(account);
    if (account.state !== 'linked' || typeof account.dataScope !== 'string' || !Array.isArray(account.repositories)) { clear('Connect and verify GitHub in Account to read Health.'); return; }
    if (scope !== account.dataScope) repositories.clear(); scope = account.dataScope;
    const catalog = account.repositories.filter(row => validRepository(row.repository));
    const previous = repositories; repositories = new Map();
    for (const row of catalog) {
      const allowed = row.availability === 'available' && row.actionsRead === true && row.issuesRead === true;
      repositories.set(row.repository, allowed ? { ...previous.get(row.repository), availability: previous.get(row.repository)?.runs ? 'stale' : 'unavailable' }
        : { availability: row.availability === 'denied' || row.availability === 'available' ? 'denied' : 'unavailable', reason: 'Actions and Issues read authority is not confirmed.' });
    }
    render(); const generation = workspaceSourceIdentityGeneration();
    const response = await fetch('/api/observations', { cache: 'no-store', signal: AbortSignal.timeout(35000) });
    if (requestEpoch !== epoch) return;
    if ([401, 403, 409].includes(response.status)) { clear('Source authority changed. Verify Account and refresh.'); return; }
    if (!response.ok) throw Error();
    const data = await response.json(); if (requestEpoch !== epoch) return;
    if (!validateWorkspaceSourceIdentity(data, scope, account.userId, generation) || data.dataScope !== scope) { clear('Source account changed. Refresh after verification.'); return; }
    if (!Array.isArray(data.repositories)) throw Error();
    for (const row of data.repositories) {
      const permission = catalog.find(value => value.repository === row.repository);
      if (!permission || permission.availability !== 'available' || !permission.actionsRead || !permission.issuesRead) continue;
      repositories.set(row.repository, ['available', 'stale'].includes(row.availability) && Array.isArray(row.runs) ? row
        : { ...row, runs: undefined, availability: 'unavailable' });
    }
    render(); byId('health-status').textContent = 'Configured repositories only · read-only observations · no overall health score.';
  } catch {
    if (requestEpoch !== epoch) return;
    for (const row of repositories.values()) if (row.runs) row.availability = 'stale';
    render(); byId('health-status').textContent = 'Source check unavailable. Retained evidence is stale with original timestamps; current health is unknown.';
  } finally { busy = false; byId('refresh').disabled = false; }
}
byId('refresh').addEventListener('click', refresh);
refresh();
