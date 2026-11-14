import { updateWorkspaceAccount, workspaceSourceIdentityGeneration, validateWorkspaceSourceIdentity } from './workspace-ui.js';
const byId = id => document.getElementById(id);
const node = (tag, text, className) => { const value = document.createElement(tag); if (text !== undefined) value.textContent = text; if (className) value.className = className; return value; };
const validRepository = name => typeof name === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(name);
const time = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : 'Unknown';
const path = location.pathname.match(/^\/workspace\/health\/([^/]+)\/([^/]+)(?:\/runs\/([1-9][0-9]*))?$/);
const selected = path ? path.slice(1, 3).map(decodeURIComponent).join('/') : null;
const runId = path?.[3];
let repositories = new Map(), scope, busy = false, epoch = 0, deadline, fleetFilter = 'all', fleetQuery = '';
let tokenReadKey, tokenReadController, tokenReadResult;
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
function observed(row) { return ['available', 'stale'].includes(row.availability) && Array.isArray(row.runs); }
function failedRuns(row) { return observed(row) ? row.runs.filter(run => run.conclusion === 'failure').length : null; }
function metric(label, value, explanation) {
  const item = node('div', undefined, 'health-metric');
  item.append(node('span', label, 'health-metric-label'), node('strong', value), node('small', explanation));
  return item;
}
function runStrip(row, repository) {
  const strip = node('div', undefined, 'health-run-strip');
  strip.setAttribute('aria-label', 'Latest collected Actions runs, source order');
  for (const run of row.runs ?? []) {
    if (!Number.isSafeInteger(run.id) || run.id <= 0) continue;
    const item = link('', healthHref(repository) + '/runs/' + run.id);
    item.className = 'health-run-mark ' + (run.conclusion === 'failure' ? 'is-failed' : run.conclusion === 'success' ? 'is-success' : 'is-unknown');
    item.setAttribute('aria-label', `${run.name || 'Workflow run ' + run.id}: ${run.status || 'unknown status'}, ${run.conclusion || 'conclusion unknown'}`);
    item.title = `${run.name || 'Workflow run ' + run.id} · ${run.conclusion || run.status || 'unknown'}`;
    strip.append(item);
  }
  return strip;
}
function applyFleetFilter() {
  const rows = [...byId('health-results').querySelectorAll('.health-row')];
  for (const row of rows) row.hidden = (fleetFilter === 'attention' && row.dataset.attention !== 'true')
    || (fleetFilter === 'unknown' && row.dataset.unknown !== 'true')
    || !row.dataset.repository.toLowerCase().includes(fleetQuery.toLowerCase());
  for (const button of byId('health-results').querySelectorAll('[data-health-filter]'))
    button.setAttribute('aria-pressed', String(button.dataset.healthFilter === fleetFilter));
  const count = rows.filter(row => !row.hidden).length;
  const result = byId('health-results').querySelector('.health-filter-result');
  if (result) result.textContent = `${count} of ${rows.length} configured projects shown`;
}
function fleetView() {
  const fragment = document.createDocumentFragment();
  const rows = [...repositories], known = rows.filter(([, row]) => observed(row));
  const failures = known.filter(([, row]) => failedRuns(row) > 0);
  const unknown = rows.filter(([, row]) => !observed(row));
  const intro = node('div', undefined, 'health-intro');
  intro.append(node('h2', 'Projects'), node('p', 'Engineering evidence across configured repositories. Source coverage is bounded; no overall score is calculated.'));
  if (!rows.length) {
    fragment.append(intro, node('p', 'No authorized repository observation is available. This does not establish an empty or healthy fleet.'));
    return fragment;
  }
  const summary = node('div', undefined, 'health-metrics');
  summary.append(metric('Configured projects', String(rows.length), 'Authorized repository catalog'),
    metric('Actions observed', String(known.length) + ' / ' + rows.length, 'Latest 20 runs per readable project'),
    metric('Needs investigation', String(failures.length), 'A failure in the collected Actions runs'),
    metric('Evidence unknown', String(unknown.length), 'Denied or unavailable source read'));
  fragment.append(intro, summary);
  if (failures.length) {
    const attention = node('section', undefined, 'health-attention');
    const header = node('div', undefined, 'health-section-head');
    const filter = node('button', 'Show only these'); filter.type = 'button'; filter.className = 'health-quiet-button';
    filter.addEventListener('click', () => { fleetFilter = 'attention'; applyFleetFilter(); byId('health-project-search')?.focus(); });
    header.append(node('h2', `Needs investigation (${failures.length})`), filter); attention.append(header);
    const list = node('div', undefined, 'health-attention-list');
    for (const [repository, row] of failures) {
      const item = link(repository, healthHref(repository)); item.className = 'health-attention-item';
      item.append(node('small', `${failedRuns(row)} failed of ${row.runs.length} collected Actions runs · ${state(row)}`)); list.append(item);
    }
    attention.append(list); fragment.append(attention);
  }
  const toolbar = node('div', undefined, 'health-toolbar');
  const tabs = node('div', undefined, 'health-filters'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Filter projects');
  for (const [key, label, count] of [['all', 'All', rows.length], ['attention', 'Needs investigation', failures.length], ['unknown', 'Evidence unknown', unknown.length]]) {
    const button = node('button', `${label} ${count}`); button.type = 'button'; button.dataset.healthFilter = key;
    button.dataset.healthKey = 'filter:' + key;
    button.addEventListener('click', () => { fleetFilter = key; applyFleetFilter(); }); tabs.append(button);
  }
  const search = node('input'); search.id = 'health-project-search'; search.type = 'search'; search.placeholder = 'Filter projects';
  search.setAttribute('aria-label', 'Filter projects by repository'); search.value = fleetQuery;
  search.addEventListener('input', () => { fleetQuery = search.value; applyFleetFilter(); });
  toolbar.append(tabs, search); fragment.append(toolbar, node('p', '', 'health-filter-result'));
  const heading = node('div', undefined, 'health-list-head');
  heading.append(node('span', 'Project'), node('span', 'Engineering'), node('span', 'Actions evidence'), node('span', 'Environment'));
  const list = node('section', undefined, 'health-list'); list.setAttribute('aria-label', 'Configured projects'); list.append(heading);
  for (const [repository, row] of rows) {
    const item = node('article', undefined, 'health-row'); item.dataset.repository = repository;
    item.dataset.attention = String(failedRuns(row) > 0); item.dataset.unknown = String(!observed(row));
    const project = node('div', undefined, 'health-project-cell');
    const title = node('h3'); title.append(link(repository, healthHref(repository)));
    project.append(title, node('small', state(row) + ' · ' + age(row.observedAt)));
    const engineering = node('div', undefined, 'health-evidence-cell');
    engineering.append(node('strong', 'Unavailable'), node('small', 'No comparable engineering assessment'));
    const actions = node('div', undefined, 'health-evidence-cell');
    if (observed(row)) {
      actions.append(node('strong', `${failedRuns(row)} failed / ${row.runs.length} collected`), runStrip(row, repository));
    } else actions.append(node('strong', state(row)), node('small', 'Workflow results unknown'));
    const environment = node('div', undefined, 'health-evidence-cell');
    environment.append(node('strong', 'Unknown'), node('small', 'PRE / PRO / production not verified'));
    item.append(project, engineering, actions, environment, provenance(row)); list.append(item);
  }
  fragment.append(list);
  return fragment;
}
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
  section.append(outputTokenSignal(repository, run));
  return section;
}
function outputTokenKey(repository, run) {
  return Number.isSafeInteger(run.runAttempt) && run.runAttempt > 0
    ? `${scope}|${repository}|${run.id}|${run.runAttempt}` : null;
}
function outputTokenSignal(repository, run) {
  const section = node('section', undefined, 'health-output-tokens');
  section.append(node('h3', 'OpenCode output tokens'), node('p', 'Tokens reported by the native telemetry source for this exact run and attempt. This is not a cost or billing measure.'));
  const key = outputTokenKey(repository, run), result = key && tokenReadKey === key ? tokenReadResult : null;
  if (!key) section.append(facts([['Output tokens', 'Unknown'], ['Reason', 'This run does not report an exact attempt number.']]));
  else if (!result || result.availability === 'loading') section.append(node('p', 'Checking the exact attempt artifact…', 'health-empty-signal'));
  else if (result.availability === 'available' && Number.isSafeInteger(result.outputTokens) && result.outputTokens >= 0) {
    section.append(facts([['Output tokens', result.outputTokens.toLocaleString()], ['Source run / attempt', `${result.runId} / ${result.attempt}`],
      ['Observed', time(result.observedAt)], ['Source updated', time(result.sourceUpdatedAt)], ['Definition', 'opencode-native · schema 1 · observed coverage'],
      ['Revision', result.revision || 'Unknown']]));
    if (typeof result.sourceUrl === 'string') { const source = link('Open this exact run attempt', result.sourceUrl); source.rel = 'noreferrer noopener'; section.append(source); }
    section.append(node('p', 'Only this retained run attempt is shown. No history, provider cost or billed amount is inferred.', 'health-empty-signal'));
  } else section.append(facts([['Output tokens', 'Unknown'], ['Reason', result.reason || 'Matching telemetry evidence is unavailable.']]));
  return section;
}
function resetOutputTokens() {
  tokenReadController?.abort(); tokenReadController = undefined; tokenReadKey = undefined; tokenReadResult = undefined;
}
async function loadOutputTokens(repository, run) {
  const key = outputTokenKey(repository, run);
  if (!key || !scope || key === tokenReadKey) return;
  tokenReadController?.abort(); tokenReadKey = key; tokenReadResult = { availability: 'loading' };
  const controller = new AbortController(); tokenReadController = controller;
  try {
    const response = await fetch('/api/health/' + repository.split('/').map(encodeURIComponent).join('/')
      + '/runs/' + run.id + '/output-tokens/' + run.runAttempt, { cache: 'no-store', signal: controller.signal });
    const result = await response.json();
    if (tokenReadKey !== key || controller.signal.aborted) return;
    tokenReadResult = response.ok && result.availability === 'available' ? result
      : { availability: 'unavailable', reason: result.reason || 'The current source authority or matching evidence is unavailable.' };
  } catch {
    if (tokenReadKey !== key || controller.signal.aborted) return;
    tokenReadResult = { availability: 'unavailable', reason: 'The exact source read failed; no token value is inferred.' };
  }
  if (selected === repository && runId === String(run.id)) render();
}
function projectView(repository, row) {
  const fragment = document.createDocumentFragment();
  const header = node('div', undefined, 'health-project-header');
  header.append(node('h2', repository), node('p', `${state(row)} · ${coverage(row)}`), provenance(row)); fragment.append(header);
  const summary = node('div', undefined, 'health-metrics');
  summary.append(metric('Actions runs', observed(row) ? String(row.runs.length) : 'Unavailable', 'Latest collected source records'),
    metric('Failed runs', observed(row) ? String(failedRuns(row)) : 'Unavailable', 'Source conclusions in this collection'),
    metric('Engineering level', 'Unavailable', 'No comparable assessment source'),
    metric('Environment', 'Unknown', 'PRE / PRO / production not verified'));
  fragment.append(summary);
  const nav = node('nav', undefined, 'health-section-nav'); nav.setAttribute('aria-label', 'Project health sections');
  for (const [id, label] of [['delivery', 'Delivery'], ['engineering', 'Engineering quality'], ['adoption', 'Lighthouse adoption/autonomy'], ['resources', 'Resources']]) {
    const anchor = link(label, '#' + id); nav.append(anchor);
  }
  fragment.append(nav);
  const delivery = family('Delivery', 'GitHub Actions workflow outcomes in the latest collected scope. These are execution results, not deployment or delivery acceptance.');
  delivery.id = 'delivery';
  if (observed(row) && row.runs.length) {
    const sampled = node('div', undefined, 'health-sample');
    sampled.append(node('div', `${row.runs.length} latest collected runs · ${failedRuns(row)} failed`, 'health-sample-label'), runStrip(row, repository));
    delivery.append(sampled);
  }
  for (const run of row.runs ?? []) {
    if (!Number.isSafeInteger(run.id) || run.id <= 0) continue;
    const item = node('article', undefined, 'health-run');
    item.append(link(run.name || 'Workflow run ' + run.id, healthHref(repository) + '/runs/' + run.id),
      node('span', (run.status || 'Unknown status') + ' · ' + (run.conclusion || 'Conclusion unknown'), 'badge'));
    delivery.append(item);
  }
  if (!row.runs?.length) delivery.append(node('p', row.availability === 'available' ? 'No workflow runs in the successfully collected scope; this is not a health verdict.' : 'Workflow evidence unavailable; Actions and Issues read permission and a successful source observation are required.'));
  fragment.append(delivery);
  const engineering = family('Engineering quality', 'Engineering level, gates, coverage, mutation and security are unavailable until their source assessments and definitions are supplied.');
  engineering.id = 'engineering'; engineering.append(node('p', 'No engineering score, level or passing gate is inferred from workflow conclusions.', 'health-empty-signal'));
  const adoption = family('Lighthouse adoption/autonomy', 'Agentic and code measurements are unavailable. Committed version inventory is separate from installed adoption.');
  adoption.id = 'adoption'; adoption.append(node('p', 'No agent success, autonomy, AI usage or code quality value is inferred from this Actions collection.', 'health-empty-signal'));
  const resources = family('Resources', 'One exact run detail may show matching OpenCode output tokens. Cost, billing, CPU, memory, storage and comparable history are unavailable.');
  resources.id = 'resources'; resources.append(node('p', 'Environment deployment is unknown: no verified PRE, PRO or production target result is in this collection.', 'health-empty-signal'));
  fragment.append(engineering, adoption, resources, link('Inspect runtime and version inventory', '/workspace/runtime'));
  return fragment;
}
function render() {
  const active = document.activeElement, key = active?.dataset.healthKey, searchFocused = active?.id === 'health-project-search';
  const root = byId('health-results'), fragment = document.createDocumentFragment();
  root.className = !selected ? 'health-fleet' : runId ? 'health-detail-view' : 'health-project';
  byId('health-title').textContent = selected ? 'Project health' : 'Health';
  document.title = (selected ? selected + ' · Health' : 'Health') + ' · Lighthouse Control Center';
  const breadcrumb = byId('health-breadcrumb'); breadcrumb.replaceChildren();
  if (selected) breadcrumb.append(link('Health', '/workspace/health'), document.createTextNode(' / '), link(selected, healthHref(selected)));
  if (!selected) fragment.append(fleetView());
  else {
    const row = repositories.get(selected);
    if (!row) fragment.append(node('p', 'This repository is not in the current authorized collection.'));
    else {
      if (runId) {
        fragment.append(node('p', state(row), 'notice'), provenance(row));
        const run = row.runs?.find(value => String(value.id) === runId);
        fragment.append(link('Back to project health', healthHref(selected)));
        fragment.append(run ? detail(selected, row, run) : node('p', 'This run is unavailable in the current bounded collection. No result is inferred.'));
      } else fragment.append(projectView(selected, row));
      fragment.append(node('p', 'Trends unavailable: no comparable historical samples or definition-change boundaries are supplied yet. No missing interval is treated as zero.', 'notice'));
    }
  }
  root.replaceChildren(fragment);
  if (selected && runId) {
    const row = repositories.get(selected), run = row?.runs?.find(value => String(value.id) === runId);
    if (run) loadOutputTokens(selected, run);
  }
  if (!selected) applyFleetFilter();
  if (searchFocused) byId('health-project-search')?.focus();
  if (key && !active.isConnected) ([...root.querySelectorAll('[data-health-key]')].find(value => value.dataset.healthKey === key) || byId('health-title')).focus();
}
function clear(message, expired = false) {
  epoch++; scope = undefined; repositories.clear(); resetOutputTokens(); clearTimeout(deadline); updateWorkspaceAccount({ state: expired ? 'expired' : 'unavailable' });
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
    if (account.state === 'unavailable') {
      resetOutputTokens();
      for (const row of repositories.values()) if (row.availability === 'available' && Array.isArray(row.runs)) row.availability = 'stale';
      render();
      byId('health-status').textContent = repositories.size
        ? 'Account verification unavailable. Previously shown observations may be stale; current authority is unknown.'
        : 'Account verification unavailable. No stored observations were opened. Refresh to try again.';
      return;
    }
    if (account.state !== 'linked' || typeof account.dataScope !== 'string' || !Array.isArray(account.repositories)) { clear('Connect and verify GitHub in Account to read Health.'); return; }
    if (scope !== account.dataScope) repositories.clear();
    resetOutputTokens(); scope = account.dataScope;
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
