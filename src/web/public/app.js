import './workspace-ui.js';
import { readProjectionCache, writeProjectionCache, clearProjectionCache } from './read-projection-cache.js';
const $ = id => document.getElementById(id);
const node = (tag, text, className) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (className) n.className = className; return n; };
function showObservationControls(visible) {
  document.querySelectorAll('.metrics, .repository-filter, .scope, .boundary').forEach(element => { element.hidden = !visible; });
}
function showWorkspaceNavigation(visible) {
  const navigation = $('workspace-navigation');
  if (!navigation || !['/workspace', '/workspace/operations'].includes(location.pathname)) return;
  if (!visible) { navigation.hidden = true; return; }
  if (!navigation.childElementCount) {
    for (const [label, href, key] of [
      ['Overview', '/workspace/operations', 'workspace:operations'],
      ['Projects', '/workspace/factory', 'workspace:factory'],
      ['Inbox', '/workspace/attention', 'workspace:attention'],
      ['Missions', '/workspace/issues', 'workspace:issues'],
      ['Runtime', '/workspace/runtime', 'workspace:runtime'],
      ['Account', '/workspace', 'workspace:account'],
    ]) {
      const item = workspaceLink(label, href, '', '', key);
      if (location.pathname === href || (href === '/workspace' && location.pathname === '/workspace')) item.setAttribute('aria-current', 'page');
      navigation.append(item);
    }
  }
  navigation.hidden = false;
}
const active = run => ['queued', 'in_progress', 'waiting', 'pending', 'requested'].includes(run.status);
const humanWait = issue => issue.labels.some(label => ['needs-info', 'waiting-review'].includes(label));
const sourceKey = (repository, kind, id) => JSON.stringify([repository, kind, id]);
function link(text, href, repository, kind, key) {
  const n = node('a', text);
  try {
    const u = new URL(href), prefix = `/${repository}/`;
    if (u.origin !== 'https://github.com' || u.username || u.password || !u.pathname.startsWith(prefix) || (kind && !u.pathname.startsWith(prefix + kind))) throw Error();
    n.href = u.href; n.rel = 'noreferrer';
  } catch { n.removeAttribute('href'); }
  n.dataset.key = key; n.dataset.repository = repository;
  return n;
}
function workspaceLink(text, href, repository, kind, key) {
  const n = node('a', text, kind);
  n.href = href; n.dataset.key = key; n.dataset.repository = repository;
  return n;
}
function badge(text, tone = '') { return node('span', text, `badge ${tone}`); }
function timestamp(value) { return typeof value === 'string' && value.trim() && Number.isFinite(Date.parse(value)) ? Date.parse(value) : NaN; }
function absolute(value) { return Number.isFinite(timestamp(value)) ? new Date(value).toISOString() : 'Time unavailable'; }
function timing(label, value, observedAt) {
  const interval = timestamp(observedAt) - timestamp(value);
  if (!Number.isFinite(interval) || interval < 0) return node('p', `${label}: unavailable`, 'timestamp');
  const minutes = Math.floor(interval / 60000);
  const count = minutes < 60 ? minutes : minutes < 1440 ? Math.floor(minutes / 60) : Math.floor(minutes / 1440);
  const unit = minutes < 60 ? 'minute' : minutes < 1440 ? 'hour' : 'day';
  const age = minutes < 1 ? 'less than 1 minute' : `${count} ${unit}${count === 1 ? '' : 's'}`;
  const p = node('p', `${label}: ${age} as of observation · `, 'timestamp');
  const time = node('time', absolute(value)); time.dateTime = value; p.append(time);
  return p;
}
function uniqueIssues(repo) { return [...new Map(repo.attention.map(issue => [issue.number, issue])).values()]; }
function issueCard(repo, issue) {
  const li = node('li');
  const issueKey = sourceKey(repo.repository, 'issue', issue.number);
  const source = link(`GitHub: #${issue.number} ${issue.title} ↗`, issue.url, repo.repository, 'issues/', `${issueKey}:source`);
  source.className = 'issue-source-link';
  const row = node('div', undefined, 'operational-row');
  row.append(source);
  const labels = node('div', undefined, 'labels');
  for (const label of issue.labels) labels.append(badge(label, ['waiting-review', 'needs-info'].includes(label) ? 'caution' : label === 'agent-working' ? 'activity' : ''));
  row.append(labels);
  if (location.pathname === '/workspace/operations' && Number.isSafeInteger(issue.number) && issue.number > 0) {
    const href = '/workspace/issues/' + repo.repository.split('/').map(encodeURIComponent).join('/') + '/' + issue.number;
    row.append(workspaceLink('Open mission', href, repo.repository, 'mission-link', `${issueKey}:mission`));
  }
  const evidence = node('details', undefined, 'record-details'); evidence.dataset.key = `${issueKey}:evidence`;
  evidence.append(node('summary', repo.repository + ' · Source details'), timing('Since source update (not wait duration)', issue.updatedAt, repo.observedAt));
  li.append(row, evidence);
  return li;
}
function runCard(repo, run) {
  const li = node('li'), heading = node('div', undefined, 'run-heading');
  heading.append(link(run.name || `Run ${run.id}`, run.url, repo.repository, 'actions/runs/', sourceKey(repo.repository, 'run', run.id)), badge(run.status || 'Status unavailable', active(run) ? 'activity' : ''));
  const evidence = node('details', undefined, 'record-details'); evidence.dataset.key = sourceKey(repo.repository, 'run-details', run.id);
  evidence.append(node('summary', repo.repository + ' · Source details'), node('p', `Source revision: ${run.sourceRevision || 'unavailable'}`, 'timestamp'));
  evidence.append(node('p', `Source attempt: ${Number.isSafeInteger(run.runAttempt) && run.runAttempt > 0 ? run.runAttempt : 'unknown'}`, 'timestamp'),
    node('p', `Triggering event: ${typeof run.event === 'string' && run.event.trim() ? run.event : 'unknown'}`, 'timestamp'));
  if (run.conclusion) heading.append(badge(run.conclusion, run.conclusion === 'failure' ? 'negative' : ''));
  if (run.status === 'in_progress') li.append(timing('Elapsed from source start', run.startedAt, repo.observedAt));
  evidence.append(timing('Since source update', run.updatedAt, repo.observedAt));
  li.prepend(heading); li.append(evidence);
  return li;
}
function list(items) { const ul = node('ul', undefined, 'items'); ul.append(...items); return ul; }
let snapshot, busy = false, projectionScope, projectionEpoch = 0;
function validSnapshot(data) {
  return Array.isArray(data?.repositories) && data.repositories.every(repository => typeof repository.repository === 'string'
    && (!['available', 'stale'].includes(repository.availability) || Array.isArray(repository.runs) && Array.isArray(repository.attention)));
}
async function restoreProjection() {
  if (location.pathname !== '/workspace/operations') return;
  const epoch = projectionEpoch;
  try {
    const response = await fetch('/api/connections/github', { cache: 'no-store', signal: AbortSignal.timeout(35000) });
    if ([401, 403, 409].includes(response.status)) { clearProjectionCache(); return; }
    if (!response.ok) return;
    const account = await response.json();
    if (epoch !== projectionEpoch || snapshot) return;
    if (account.state !== 'linked' || typeof account.dataScope !== 'string') { clearProjectionCache(); return; }
    projectionScope = account.dataScope;
    const cached = readProjectionCache(projectionScope, 'operations');
    if (snapshot || !validSnapshot(cached) || cached.dataScope !== projectionScope) return;
    const allowed = new Set((account.repositories ?? []).filter(repository => repository.availability === 'available' && repository.issuesRead && repository.actionsRead).map(repository => repository.repository.toLowerCase()));
    const restored = { ...cached, repositories: cached.repositories.filter(repository => allowed.has(repository.repository.toLowerCase())).map(repository => ({ ...repository, availability: repository.availability === 'available' ? 'stale' : repository.availability })) };
    showObservationControls(true); showWorkspaceNavigation(true); render(restored); snapshot = restored;
    $('connection').textContent = 'Restored previous observations · refreshing in the background. Current activity is not yet confirmed.';
  } catch { /* A failed scope check never opens stored private observations. */ }
}
function render(data) {
  const root = $('repositories'), focused = document.activeElement;
  const hadFocus = root.contains(focused), key = hadFocus ? focused.dataset.key : undefined;
  const repository = hadFocus ? focused.dataset.repository : undefined;
  const disclosures = new Map([...root.querySelectorAll('details')].map(n => [n.dataset.key, n.open]));
  const filter = $('repository-filter'), selected = filter.value;
  const names = data.repositories.map(repo => repo.repository);
  if (JSON.stringify([...filter.options].slice(1).map(o => o.value)) !== JSON.stringify(names)) {
    const all = node('option', 'All repositories'); all.value = '';
    filter.replaceChildren(all, ...names.map(name => { const option = node('option', name); option.value = name; return option; }));
    filter.value = names.includes(selected) ? selected : '';
  }
  const rows = data.repositories.filter(r => !filter.value || r.repository === filter.value);
  const available = rows.filter(r => r.availability === 'available'), unknown = rows.length - available.length;
  $('repo-count').textContent = `${available.length} / ${rows.length}`;
  $('active-count').textContent = available.length ? available.reduce((n, r) => n + r.runs.filter(active).length, 0) : 'Unavailable';
  $('attention-count').textContent = available.length ? available.reduce((n, r) => n + uniqueIssues(r).filter(humanWait).length, 0) : 'Unavailable';
  $('unknown-count').textContent = unknown;
  $('count-scope').textContent = `${filter.value || 'All configured repositories'}: counts include only collected active runs and needs-info / waiting-review issues, counted once per issue. ${unknown ? 'Known collected counts only; unavailable repositories leave an unknown remainder.' : 'No matching collected records does not prove inactivity or health.'}`;
  const fragment = document.createDocumentFragment(), waits = node('section'), workflows = node('section');
  waits.append(node('h2', 'Needs your attention'));
  const waitingIssues = available.flatMap(repo => uniqueIssues(repo).filter(humanWait).map(issue => issueCard(repo, issue)));
  waits.append(waitingIssues.length ? list(waitingIssues) : node('p', available.length ? 'No human waits in the collected issues.' : 'Human waits unavailable.', 'empty'));
  workflows.append(node('h2', 'Active workflows'));
  for (const [title, statuses] of [['Running', ['in_progress']], ['Queued / pending / requested', ['queued', 'pending', 'requested']], ['Waiting', ['waiting']]]) {
    const group = node('section'), cards = available.flatMap(repo => repo.runs.filter(run => statuses.includes(run.status)).map(run => runCard(repo, run)));
    if (!cards.length) continue;
    group.append(node('h3', title), list(cards));
    workflows.append(group);
  }
  if (workflows.children.length === 1) workflows.append(node('p', available.length ? 'No active workflow runs in the collected observation.' : 'Workflow evidence unavailable.', 'empty'));
  fragment.append(waits, workflows, node('h2', 'Projects'));
  for (const repo of rows) {
    const card = node('article', undefined, 'repository'); card.dataset.repository = repo.repository;
    const heading = node('div', undefined, 'repo-heading');
    heading.append(node('h3', repo.repository), badge(repo.availability === 'available' ? 'Observed' : repo.availability === 'stale' ? 'Stale evidence' : 'Evidence unavailable', repo.availability === 'available' ? 'positive' : 'caution'));
    card.append(heading);
    const provenance = node('details', undefined, 'record-details'); provenance.dataset.key = sourceKey(repo.repository, 'observation', ''); provenance.append(node('summary', 'Observation details'), node('p', `Source observation time: ${absolute(repo.observedAt)}`, 'timestamp')); card.append(provenance);
    const actions = node('nav', undefined, 'repo-actions'); actions.setAttribute('aria-label', `${repo.repository} actions`);
    if (location.pathname === '/workspace/operations') {
      const href = '/workspace/factory?repository=' + encodeURIComponent(repo.repository);
      actions.append(workspaceLink('Browse missions', href, repo.repository, 'repository-mission-link', sourceKey(repo.repository, 'mission-picker', '')));
    }
    actions.append(link('Open workflow actions ↗', `https://github.com/${repo.repository}/actions/workflows/lighthouse-sdlc-router.yml`, repo.repository, 'actions/', sourceKey(repo.repository, 'actions', '')), link('Issues ↗', `https://github.com/${repo.repository}/issues`, repo.repository, undefined, sourceKey(repo.repository, 'issues', '')));
    card.append(actions);
    if (repo.availability === 'stale') {
      card.append(node('p', 'Temporary GitHub collection failure. Last known evidence is shown below; current activity is unknown. These records are excluded from current counts.', 'notice'),
        node('h4', 'Last known workflow runs'), list(repo.runs.map(run => runCard(repo, run))),
        node('h4', 'Last known source labels'), list(uniqueIssues(repo).map(issue => issueCard(repo, issue))));
    } else if (repo.availability !== 'available') card.append(node('p', 'GitHub evidence could not be collected. Activity and backlog are unknown; this does not mean the repository is idle.', 'notice'));
    else {
      const other = uniqueIssues(repo).filter(issue => !humanWait(issue));
      const backlog = node('details'); backlog.dataset.key = sourceKey(repo.repository, 'backlog', ''); backlog.append(node('summary', `Other collected work (${other.length})`), other.length ? list(other.map(issue => issueCard(repo, issue))) : node('p', 'No other attention labels in the collected issues.', 'empty')); card.append(backlog);
      if (!repo.attention.length) card.append(node('p', 'No attention labels in the collected issues.', 'empty'));
      if (!repo.runs.length) card.append(node('p', 'No workflow runs returned.', 'empty'));
      for (const [title, predicate, kind] of [['Recent completed runs', run => run.status === 'completed', 'completed'], ['Unclassified source statuses', run => !active(run) && run.status !== 'completed', 'unclassified']]) {
        const details = node('details'), summary = node('summary', title), key = sourceKey(repo.repository, 'history', kind);
        details.dataset.key = key; details.open = disclosures.get(key) || false;
        summary.dataset.key = key; summary.dataset.repository = repo.repository;
        const records = repo.runs.filter(predicate);
        details.append(summary, records.length ? list(records.map(run => runCard(repo, run))) : node('p', 'No matching collected runs.', 'empty')); card.append(details);
      }
    }
    fragment.append(card);
  }
  root.replaceChildren(fragment);
  for (const details of root.querySelectorAll('details')) details.open = disclosures.get(details.dataset.key) || false;
  if (hadFocus) {
    const controls = [...root.querySelectorAll('a[href], summary')];
    const target = controls.find(n => n.dataset.key === key) || controls.find(n => n.dataset.key === sourceKey(repository, 'actions', '')) || filter;
    for (let details = target.matches('summary') ? target.parentElement.parentElement.closest('details') : target.closest('details'); details; details = details.parentElement.closest('details')) details.open = true;
    target.focus({ preventScroll: true });
  }
}
async function refresh() {
  if (busy) return;
  const refreshFocused = document.activeElement === $('refresh');
  busy = true; $('refresh').disabled = true; $('repositories').setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/observations', { signal: AbortSignal.timeout(35000) });
    if ([401, 403, 409].includes(response.status)) {
      const failure = await response.json().catch(() => null);
      const setupRequired = response.status === 409 && failure?.state === 'unconfigured';
      const heldFocus = $('repositories').contains(document.activeElement);
      showObservationControls(false);
      showWorkspaceNavigation(response.status === 409);
      snapshot = undefined;
      projectionEpoch++;
      clearProjectionCache(); projectionScope = undefined;
      $('repository-filter').replaceChildren(Object.assign(node('option', 'All repositories'), { value: '' }));
      for (const id of ['repo-count', 'active-count', 'attention-count', 'unknown-count']) $(id).textContent = '—';
      $('count-scope').textContent = 'No authorized observation is available.';
      $('connection').textContent = setupRequired ? 'GitHub setup required before operations can load.'
        : response.status === 409 ? 'Connect or verify your GitHub account to view observations.'
        : response.status === 401 ? 'Your owner session has ended. Sign in again to view observations.' : 'Access to this workspace is denied.';
      const account = node('a', 'Open account'); account.href = '/workspace';
      const heading = node('h2', setupRequired ? 'Complete the GitHub connection' : 'Account verification required');
      const explanation = node('p', setupRequired
        ? 'Your Lighthouse Control Center sign-in is verified. Register the development GitHub App, install it on the selected repositories, then connect your account.'
        : 'Open your account to check the connection and repository access.');
      $('repositories').replaceChildren(heading, explanation, account);
      if (heldFocus) account.focus({ preventScroll: true });
      return;
    }
    if (!response.ok) throw Error();
    const data = await response.json();
    if (!validSnapshot(data)) throw Error();
    if (typeof data.dataScope === 'string') {
      if (projectionScope && projectionScope !== data.dataScope) clearProjectionCache(projectionScope);
      projectionScope = data.dataScope; writeProjectionCache(projectionScope, data, 'operations');
    }
    showObservationControls(true); showWorkspaceNavigation(true); render(data); snapshot = data;
    $('connection').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · refreshes automatically`;
  } catch {
    $('connection').textContent = snapshot ? 'Refresh failed. Previously shown observations may be stale. Try refreshing again.' : 'Refresh failed. No observation is available. Try refreshing again.';
  } finally {
    busy = false; $('refresh').disabled = false; $('repositories').setAttribute('aria-busy', 'false');
    if (refreshFocused && [document.body, $('refresh')].includes(document.activeElement)) $('refresh').focus({ preventScroll: true });
  }
}
$('refresh').addEventListener('click', refresh);
$('repository-filter').addEventListener('change', () => { if (snapshot) render(snapshot); });
showWorkspaceNavigation(true);
restoreProjection();
refresh();
setInterval(() => { if (!document.hidden) refresh(); }, 30000);
