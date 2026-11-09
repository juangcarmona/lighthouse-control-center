import './workspace-ui.js';
import { inspectAttention } from './attention-controls.js';
import { reconcileAttention } from './attention.js';
import { clearProjectionCache, readProjectionCache, writeProjectionCache } from './read-projection-cache.js';
const byId = id => document.getElementById(id);
const node = (tag, text, className) => { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; };
const filterIds = ['repository', 'search', 'state', 'stage', 'execution', 'wait', 'view'];
const filters = () => Object.fromEntries(filterIds.map(key => [key, byId('factory-' + key).value]));
const attentionView = document.body.dataset.view === 'attention';
let attentionHistory = new Map();
const repositories = new Map();
const evidence = new Map();
let dataScope, busy = false, epoch = 0, lookupNumber = null;
const identity = (repository, issue) => repository.toLowerCase() + ':' + issue.id;
const exactNumber = search => /^#?[1-9][0-9]{0,9}$/.test(search.trim()) && Number(search.replace('#', '')) <= 2147483647 ? Number(search.replace('#', '')) : null;
const time = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : 'Unknown';
function status(message) { byId('factory-status').textContent = message; }
function saveProjection() {
  if (!dataScope) return;
  writeProjectionCache(dataScope, {
    repositories: [...repositories], attentionHistory: [...attentionHistory],
  });
}
function restoreProjection(scope, readable) {
  const cached = readProjectionCache(scope);
  if (!Array.isArray(cached?.repositories) || !Array.isArray(cached?.attentionHistory)) return false;
  const mayRead = repository => typeof repository === 'string' && [...readable].some(name => name.toLowerCase() === repository.toLowerCase());
  let restored = false;
  for (const [repository, collection] of cached.repositories) {
    if (!mayRead(repository) || !collection || typeof collection !== 'object' || !Array.isArray(collection.issues)) continue;
    repositories.set(repository, { ...collection, stale: true }); restored = true;
  }
  for (const [key, value] of cached.attentionHistory) if (typeof key === 'string' && mayRead(value?.repository)) attentionHistory.set(key, value);
  return restored;
}
function remember() {
  const url = new URL(location.href); for (const [key, value] of Object.entries(filters())) value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
  history.replaceState(null, '', url);
}
function setBusy(value) { busy = value; byId('factory-refresh').disabled = value; for (const button of document.querySelectorAll('#factory-projects button, #factory-results button')) button.disabled = value; }
function clearSource(message) {
  epoch++; clearProjectionCache(); repositories.clear(); evidence.clear(); attentionHistory.clear(); dataScope = undefined; render();
  byId('factory-count').textContent = 'No authorized collection is available.';
  const account = node('a', 'Open account'); account.href = '/workspace';
  byId('factory-results').replaceChildren(node('p', 'Verify your account to read fleet work.'), account);
  status(message);
}
function removeRepositoryDetails(repository) {
  repositories.delete(repository);
  for (const key of evidence.keys()) if (key.startsWith(repository.toLowerCase() + ':')) evidence.delete(key);
  for (const [key, entry] of attentionHistory) if (entry.repository === repository) attentionHistory.delete(key);
}
function denyRepository(repository) {
  removeRepositoryDetails(repository);
  repositories.set(repository, { availability: 'denied', issues: [], complete: false, reason: 'Current repository authority is denied.' });
  saveProjection(); render(); status('Repository authority was denied; its earlier issue context was removed.');
}
function sourceLink(text, repository, suffix) {
  const link = node('a', text); link.href = 'https://github.com/' + repository + suffix; link.rel = 'noreferrer noopener'; return link;
}
function facts(repository, issue) {
  const value = evidence.get(identity(repository, issue));
  const reports = value?.availability === 'available' ? value.reports.filter(report => report.availability === 'available') : [];
  return { stages: [...new Set(reports.map(report => report.stage).filter(Boolean))], executions: [...new Set(reports.map(report => report.executionStatus).filter(Boolean))], reports, value };
}
function options(id, values) {
  const select = byId(id), selected = select.value;
  const all = node('option', 'Any / unread'); all.value = '';
  const unknown = node('option', 'Unknown / unread'); unknown.value = 'unknown';
  const known = [...new Set([...values, ...(!['', 'unknown'].includes(selected) ? [selected] : [])])].sort().map(value => { const option = node('option', value); option.value = value; return option; });
  select.replaceChildren(all, unknown, ...known); select.value = selected;
}
function matches(repository, issue, selected) {
  if (selected.repository && selected.repository !== repository) return false;
  const number = exactNumber(selected.search);
  if (selected.search && (number ? issue.number !== number : !issue.title.toLocaleLowerCase().includes(selected.search.trim().toLocaleLowerCase()) && !(`${repository}#${issue.number}`.toLocaleLowerCase().includes(selected.search.trim().toLocaleLowerCase())))) return false;
  const state = ['open', 'closed'].includes(issue.state) ? issue.state : 'unknown';
  if (selected.state && selected.state !== state) return false;
  const source = facts(repository, issue);
  for (const [filter, values] of [[selected.stage, source.stages], [selected.execution, source.executions]]) if (filter && (filter === 'unknown' ? values.length !== 0 : !values.includes(filter))) return false;
  const waits = issue.labels.filter(label => ['needs-info', 'waiting-review'].includes(label));
  if (selected.wait === 'unknown' && issue.labelsComplete) return false;
  if (selected.wait === 'none' && (!issue.labelsComplete || waits.length)) return false;
  if (selected.wait === 'both' && waits.length !== 2) return false;
  if (['needs-info', 'waiting-review'].includes(selected.wait) && !waits.includes(selected.wait)) return false;
  return true;
}
function issueCard(repository, issue, stale) {
  const card = node('article', undefined, 'factory-issue' + (stale ? ' factory-stale' : '')); card.dataset.issueKey = identity(repository, issue);
  const title = node('h3'), open = node('a', `${repository}#${issue.number} · ${issue.title}`);
  open.href = `/workspace/issues/${repository}/${issue.number}`; open.dataset.focusKey = identity(repository, issue); title.append(open);
  const source = facts(repository, issue);
  card.append(title, node('p', `${issue.state ?? 'unknown'} · Updated ${time(issue.updatedAt)}`));
  if (stale) card.append(node('p', 'Stale collection; current activity and labels are unknown.', 'notice'));
  const provenance = node('details', undefined, 'factory-provenance'); provenance.append(node('summary', 'Source details'));
  provenance.append(node('p', `Collected labels: ${issue.labels.join(', ') || 'none'}${issue.labelsComplete ? '' : ' · incomplete'}`, 'factory-labels'),
    node('p', `Reported stages: ${source.stages.join(', ') || 'unknown / unread'} · Linked runs: ${source.executions.join(', ') || 'unknown / unread'}`));
  if (source.value) {
    provenance.append(node('p', `Evidence observed: ${time(source.value.observedAt)} · ${source.value.reason || source.value.scope || ''}`));
    const reports = node('ul');
    for (const report of source.reports) reports.append(node('li', `${report.stage ?? 'unknown'} · Result ${report.result ?? 'unknown'} · Workflow ${report.runId ?? 'unknown'} / attempt ${report.attempt ?? 'unknown'} · ${report.executionStatus ?? 'unknown'} / ${report.executionConclusion ?? 'unknown'}`));
    if (reports.childElementCount) provenance.append(reports);
  }
  card.append(provenance);
  const actions = node('div', undefined, 'project-actions'), inspect = node('button', source.value ? 'Refresh issue evidence' : 'Read issue evidence');
  inspect.type = 'button'; inspect.disabled = busy || stale; inspect.addEventListener('click', () => readEvidence(repository, issue));
  actions.append(inspect, sourceLink('GitHub issue', repository, '/issues/' + issue.number)); card.append(actions); return card;
}
function render() {
  const selected = filters(), focusKey = document.activeElement?.dataset.focusKey;
  const projects = document.createDocumentFragment(), all = [];
  for (const [repository, collection] of repositories) {
    for (const issue of collection.issues ?? []) all.push({ repository, issue, stale: collection.stale });
    if (selected.repository && repository !== selected.repository) continue;
    const project = node('article', undefined, 'factory-project'); project.dataset.repository = repository;
    const heading = node('h3'), select = node('a', repository); const target = new URL(location.href); target.searchParams.set('repository', repository); select.href = target.pathname + target.search;
    select.addEventListener('click', event => { event.preventDefault(); byId('factory-repository').value = repository; remember(); render(); }); heading.append(select);
    project.append(heading, node('p', `${collection.issues?.length ?? 0} collected issues · ${collection.stale ? 'stale' : collection.availability ?? 'unread'} · Observed ${time(collection.observedAt)}`));
    const coverage = node('details', undefined, 'factory-provenance'); coverage.append(node('summary', 'Branch and source coverage'),
      node('p', `Default branch · configured: ${collection.configuredBranch ?? 'unknown'} · observed: ${collection.observedBranch ?? 'unknown'}`),
      node('p', `Pages: ${collection.pages?.join(', ') || 'none'} · Source records: ${collection.sourceRecords ?? 'unknown'} · ${collection.complete ? 'source end reached for this collection' : 'coverage incomplete / unknown'}`),
      node('p', collection.reason || 'Source evidence has not been read.'),
      node('p', 'Health and harness/version signals are not collected here; unavailable values do not mean healthy.'));
    if (collection.configuredBranch && collection.observedBranch && collection.configuredBranch !== collection.observedBranch) coverage.append(node('p', 'Configured and observed default branches conflict.', 'notice'));
    project.append(coverage);
    const actions = node('div', undefined, 'project-actions'); actions.append(sourceLink('Source project', repository, ''), sourceLink('Workflow evidence', repository, '/actions'));
    if (collection.nextPage && !exactNumber(selected.search)) {
      const more = node('button', 'Load next issue page'); more.type = 'button'; more.disabled = busy; more.addEventListener('click', () => loadMore(repository)); actions.append(more);
    }
    project.append(actions); projects.append(project);
  }
  byId('factory-projects').replaceChildren(projects);
  const limited = [...repositories.values()].filter(value => value.availability !== 'available' || value.stale || !value.complete).length;
  byId('factory-project-summary').textContent = `Projects and source coverage · ${repositories.size} repositories · ${limited} incomplete or unavailable`;
  if (attentionView) { renderAttention(selected, focusKey); return; }
  const sourceFacts = all.map(row => facts(row.repository, row.issue));
  options('factory-stage', sourceFacts.flatMap(source => source.stages)); options('factory-execution', sourceFacts.flatMap(source => source.executions));
  const visible = all.filter(row => matches(row.repository, row.issue, selected));
  const rows = selected.repository ? [...repositories].filter(([name]) => name === selected.repository).map(([, value]) => value) : [...repositories.values()];
  const unknown = rows.some(row => row.availability !== 'available' || row.stale || !row.complete);
  byId('factory-count').textContent = `${visible.length} matching collected issues${unknown ? '; source coverage is incomplete, stale or unavailable' : '; source end reached for the collected scope'}. Unread stage/run evidence remains unknown.`;
  byId('factory-scope').textContent = exactNumber(selected.search) ? 'Exact-number lookup across selected configured repositories. Other filters still apply.' : 'Title search and filters cover collected issues only. Open project coverage to load more. Refresh starts a new collection; live pages can change.';
  const results = document.createDocumentFragment();
  if (selected.view === 'board') {
    const board = node('div', undefined, 'factory-board');
    for (const state of ['open', 'closed', 'unknown']) {
      const column = node('section', undefined, 'board-column'); column.append(node('h3', state === 'unknown' ? 'Unknown issue state' : state === 'open' ? 'Open issues' : 'Closed issues'));
      const members = visible.filter(row => (['open', 'closed'].includes(row.issue.state) ? row.issue.state : 'unknown') === state);
      for (const row of members) column.append(issueCard(row.repository, row.issue, row.stale));
      if (!members.length) column.append(node('p', 'No matching collected issues.')); board.append(column);
    }
    results.append(board);
  } else {
    const list = node('div', undefined, 'factory-list'); for (const row of visible) list.append(issueCard(row.repository, row.issue, row.stale)); results.append(list);
  }
  if (!visible.length) results.append(node('p', unknown ? 'No match in the collected scope. Remaining or unavailable source records may contain work.' : all.length ? 'No collected issues match these filters.' : 'The successfully collected scope contains no ordinary issues.'));
  byId('factory-results').replaceChildren(results);
  if (focusKey) ([...byId('factory-results').querySelectorAll('a')].find(link => link.dataset.focusKey === focusKey) || byId('factory-repository')).focus();
}
function renderAttention(selected, focusKey) {
  const projection = reconcileAttention(repositories, attentionHistory); attentionHistory = projection.entries;
  saveProjection();
  const visible = [...attentionHistory.values()].filter(entry => matches(entry.repository, entry.issue, selected));
  byId('factory-count').textContent = `${visible.length} collected label contexts. Inspect a context to verify its current question and supported actions.`;
  byId('factory-scope').textContent = 'Order: source-label observations, then stale or unobserved contexts; oldest issue update first, source identity breaks ties. Age does not establish urgency. Collection coverage is shown per project.';
  const list = node('div', undefined, 'factory-list');
  for (const entry of visible) {
    const card = node('article', undefined, 'factory-issue' + (entry.state === 'source-label' ? '' : ' factory-stale'));
    card.dataset.attentionKey = entry.key;
    const heading = node('h3'), link = node('a', `${entry.repository}#${entry.issue.number} · ${entry.issue.title}`);
    link.href = `/workspace/issues/${entry.repository}/${entry.issue.number}`; link.dataset.focusKey = entry.key; heading.append(link);
    card.append(heading, node('p', `${entry.label === 'needs-info' ? 'Needs information' : 'Waiting for review'} · ${entry.issue.state ?? 'unknown'} issue`));
    const provenance = node('details', undefined, 'factory-provenance'); provenance.append(node('summary', 'Source history'),
      node('p', `GitHub label: ${entry.label} · Issue updated: ${time(entry.sourceTime)} (not wait duration)`),
      node('p', `Observed: ${time(entry.observedAt)}`)); card.append(provenance);
    if (entry.state === 'stale') card.append(node('p', 'Stale observation; current source context is unknown.', 'notice'));
    if (entry.state === 'not-observed') card.append(node('p', 'Not observed in this collection; resolution is unknown. Missing pages or a removed label do not establish a resolved question.', 'notice'));
    card.append(sourceLink('GitHub issue', entry.repository, '/issues/' + entry.issue.number));
    const inspect = node('button', 'Inspect current question'); inspect.type = 'button';
    const detail = node('section'); detail.setAttribute('aria-label', 'Current source context · ' + entry.repository + '#' + entry.issue.number + ' · ' + entry.label);
    const scope = dataScope, version = epoch;
    inspect.addEventListener('click', async () => {
      if (busy) return; inspect.disabled = true;
      const live = () => card.isConnected && dataScope === scope && epoch === version;
      await inspectAttention(detail, entry, scope, live, () => clearSource('Source authority changed. Verify your account and refresh.'));
      if (live()) inspect.disabled = false;
    });
    if (entry.state === 'source-label') card.append(inspect, detail);
    list.append(card);
  }
  if (!visible.length) list.append(node('p', 'No labeled waits in the collected scope. Unread, unavailable or remaining pages may contain interventions.'));
  if (projection.limited) list.append(node('p', 'The retained 1 MiB / 1,000-context bound was reached; omitted history is not a resolved intervention.', 'notice'));
  byId('factory-results').replaceChildren(list);
  if (focusKey) ([...byId('factory-results').querySelectorAll('a')].find(link => link.dataset.focusKey === focusKey) || byId('factory-repository')).focus();
}
async function getPage(repository, page, requestEpoch, number) {
  const parameters = new URLSearchParams(number ? { number } : { page });
  const response = await fetch('/api/factory/' + repository + '?' + parameters, { signal: AbortSignal.timeout(35000) });
  if (requestEpoch !== epoch) return;
  if ([401, 409].includes(response.status)) { clearSource('The owner session or source connection changed. Open Account to connect again.'); return; }
  const data = await response.json().catch(() => null);
  if (requestEpoch !== epoch) return;
  if (response.status === 403) { denyRepository(repository); return; }
  if (!response.ok || data?.availability !== 'available' || data.repository !== repository || !Array.isArray(data.issues) || typeof data.dataScope !== 'string') throw Error('Unavailable source page');
  if (data.dataScope !== dataScope) { clearSource('The source account changed during collection. Refresh to start a new source scope.'); return; }
  const previous = page > 1 ? repositories.get(repository) : undefined;
  const merged = new Map((previous?.issues ?? []).map(issue => [issue.id, issue]));
  for (const issue of data.issues) merged.set(issue.id, issue);
  const retained = [...repositories].filter(([name]) => name !== repository).flatMap(([, value]) => value.issues ?? []).concat([...merged.values()]);
  if (new TextEncoder().encode(JSON.stringify(retained)).byteLength > 4 * 1024 * 1024) {
    repositories.set(repository, { ...previous, availability: 'available', complete: false, nextPage: null, reason: 'The4MiB retained collection bound was reached. This page was not retained; refresh starts a new collection.' }); return;
  }
  repositories.set(repository, { ...data, issues: [...merged.values()], pages: [...(previous?.pages ?? []), page], sourceRecords: (previous?.sourceRecords ?? 0) + data.sourceRecords, stale: false });
  saveProjection();
}
async function refresh() {
  if (busy) return;
  setBusy(true); const requestEpoch = ++epoch; remember();
  for (const collection of repositories.values()) if (collection.availability === 'available') collection.stale = true;
  render(); status('Checking current source authority…');
  try {
    const response = await fetch('/api/connections/github', { signal: AbortSignal.timeout(35000) });
    if ([401, 403, 409].includes(response.status)) { clearSource('The owner session or source access ended. Open Account to sign in again.'); return; }
    const account = await response.json();
    if (!response.ok || account.state !== 'linked' || !Array.isArray(account.repositories) || typeof account.dataScope !== 'string') { clearSource('Connect or verify the GitHub account in Account before reading fleet work.'); return; }
    const configured = new Set(account.repositories.map(row => row.repository));
    const readable = new Set(account.repositories.filter(row => row.availability === 'available' && row.issuesRead === true).map(row => row.repository));
    for (const repository of repositories.keys()) if (!configured.has(repository)) removeRepositoryDetails(repository);
    if (dataScope && dataScope !== account.dataScope) { clearProjectionCache(); repositories.clear(); evidence.clear(); attentionHistory.clear(); }
    const restore = !dataScope && repositories.size === 0;
    dataScope = account.dataScope;
    if (restore) restoreProjection(account.dataScope, readable);
    lookupNumber = exactNumber(byId('factory-search').value);
    const picker = byId('factory-repository'), selected = picker.value || new URL(location.href).searchParams.get('repository') || '';
    const all = node('option', 'All repositories'); all.value = '';
    picker.replaceChildren(all, ...account.repositories.map(row => { const option = node('option', row.repository); option.value = row.repository; return option; }));
    picker.value = account.repositories.some(row => row.repository === selected) ? selected : '';
    const selectedRepositories = account.repositories.filter(row => !picker.value || row.repository === picker.value);
    for (const row of account.repositories) if (row.availability === 'denied' || row.availability === 'available' && !row.issuesRead) {
      removeRepositoryDetails(row.repository);
      repositories.set(row.repository, { availability: 'denied', issues: [], complete: false, reason: 'Current issue-read authority is denied.' });
    }
    for (const row of account.repositories) if (!repositories.has(row.repository)) repositories.set(row.repository, { availability: 'unread', issues: [], complete: false, reason: 'Source collection has not completed.' });
    saveProjection();
    render();
    await Promise.all(selectedRepositories.map(async row => {
      if (repositories.get(row.repository)?.availability === 'denied' && (row.availability !== 'available' || !row.issuesRead)) return;
      try { await getPage(row.repository, 1, requestEpoch, exactNumber(byId('factory-search').value)); }
      catch { if (requestEpoch !== epoch) return; const previous = repositories.get(row.repository); repositories.set(row.repository, { ...previous, availability: 'unavailable', stale: !!previous?.issues?.length, complete: false, reason: 'Source refresh failed. Previous same-scope rows retain their original times and may be stale; this is not an empty backlog.' }); }
    }));
    if (requestEpoch === epoch) { saveProjection(); render(); status(`Fleet collection received for ${account.login}. Source times and coverage are shown per project.`); }
  } catch { if (requestEpoch === epoch) { for (const collection of repositories.values()) { collection.stale = true; collection.complete = false; } saveProjection(); render(); status('Source refresh failed. Previously collected rows may be stale; no current authority or empty-backlog conclusion is inferred.'); } }
  finally { setBusy(false); }
}
async function loadMore(repository) {
  if (busy) return; setBusy(true); const requestEpoch = epoch;
  try { await getPage(repository, repositories.get(repository).nextPage, requestEpoch); if (requestEpoch === epoch) { render(); status('Another explicit source page was read; coverage is shown above.'); } }
  catch { const collection = repositories.get(repository); if (collection) { collection.stale = true; collection.complete = false; collection.reason = 'The next page could not be read. Previous source times remain unchanged; coverage is incomplete.'; } saveProjection(); render(); status('Next source page unavailable. Previously read issues remain visible as stale.'); }
  finally { setBusy(false); }
}
async function readEvidence(repository, issue) {
  if (busy) return; setBusy(true); const requestEpoch = epoch, key = identity(repository, issue);
  try {
    const path = `/api/issues/${repository}/${issue.number}`;
    const response = await fetch(path, { signal: AbortSignal.timeout(35000) });
    if (requestEpoch !== epoch) return;
    if ([401, 409].includes(response.status)) { clearSource('Source authority changed. Refresh the connected account.'); return; }
    if (response.status === 403) { denyRepository(repository); return; }
    const context = await response.json();
    if (!response.ok || context.dataScope !== dataScope || context.issue?.id !== issue.id || typeof context.snapshot !== 'string') throw Error('Issue evidence context unavailable');
    const result = await fetch(path + '/evidence?snapshot=' + encodeURIComponent(context.snapshot), { signal: AbortSignal.timeout(35000) });
    if ([401, 409].includes(result.status)) { clearSource('The source connection changed while reading evidence.'); return; }
    if (result.status === 403) { denyRepository(repository); return; }
    const source = await result.json();
    if (requestEpoch !== epoch) return;
    if (!result.ok || source.dataScope !== dataScope || !Array.isArray(source.reports)) throw Error('Source evidence unavailable');
    evidence.set(key, source); render(); status('Historical source evidence loaded.');
  } catch { if (requestEpoch === epoch) { evidence.set(key, { availability: 'unavailable', reports: [], reason: 'Associated evidence is unavailable; stage and workflow state remain unknown.' }); render(); status('Source evidence unavailable; readable issue collection is retained.'); } }
  finally { setBusy(false); }
}
for (const [key, value] of new URL(location.href).searchParams) {
  const control = byId('factory-' + key); if (!control) continue;
  if (control.tagName === 'INPUT') control.value = value.slice(0, 200);
  else if ([...control.options].some(option => option.value === value)) control.value = value;
  else if (['repository', 'stage', 'execution'].includes(key)) { const option = node('option', value); option.value = value; control.append(option); control.value = value; }
}
byId('factory-filters').addEventListener('submit', event => { event.preventDefault(); remember(); if (exactNumber(byId('factory-search').value) !== lookupNumber) refresh(); else render(); });
for (const key of ['state', 'stage', 'execution', 'wait', 'view']) byId('factory-' + key).addEventListener('change', () => { remember(); render(); });
byId('factory-repository').addEventListener('change', () => { remember(); refresh(); });
byId('factory-refresh').addEventListener('click', refresh);
window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
refresh();
