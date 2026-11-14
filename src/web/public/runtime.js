import { updateWorkspaceAccount } from './workspace-ui.js';
const byId = id => document.getElementById(id);
const node = (tag, text) => { const value = document.createElement(tag); if (text !== undefined) value.textContent = text; return value; };
const time = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : 'Unknown';
const validRepository = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(value);
let host, scope, hostEpoch = 0, githubEpoch = 0, ownerDeadline, ownerCheck;
const sources = new Map();
function link(text, repository, suffix) {
  const value = node('a', text); value.href = 'https://github.com/' + repository + suffix; value.rel = 'noreferrer noopener'; value.dataset.runtimeFocus = repository.toLowerCase() + suffix; return value;
}
function card(title) { const value = node('article'); value.className = 'runtime-card'; value.append(node('h3', title)); return value; }
function facts(value, rows) {
  const list = node('dl'); for (const [name, text] of rows) list.append(node('dt', name), node('dd', text ?? 'Unknown')); value.append(list);
}
function clearGitHub(message) { githubEpoch++; scope = undefined; sources.clear(); byId('runners-status').textContent = message; render(); }
function clearAll() {
  updateWorkspaceAccount({ state: 'expired' });
  clearTimeout(ownerDeadline);
  hostEpoch++; host = undefined; clearGitHub('Owner session ended. Sign in again.');
  byId('host-status').textContent = 'No owner-authorized host evidence is available.';
  byId('runtime-status').textContent = 'Sign in to read runtime evidence.';
}
async function verifyOwner() {
  ownerCheck ??= (async () => {
    const response = await fetch('/api/session', { cache: 'no-store' });
    if (response.status === 401 || response.status === 403) { clearAll(); return false; }
    if (!response.ok) throw Error('Owner authority is unavailable.');
    const session = await response.json();
    const deadline = Math.min(Date.parse(session.idleDeadline), Date.parse(session.absoluteDeadline));
    if (!session.authenticated || !Number.isFinite(deadline) || deadline <= Date.now()) { clearAll(); return false; }
    clearTimeout(ownerDeadline); ownerDeadline = setTimeout(clearAll, deadline - Date.now());
    byId('runtime-status').textContent = 'Each source is read independently. Use its refresh button for a new observation.';
    return true;
  })().finally(() => { ownerCheck = undefined; });
  return ownerCheck;
}
function render() {
  const previous = document.activeElement, key = previous?.dataset?.runtimeFocus;
  byId('host-registrations').replaceChildren(); byId('runtime-adoptions').replaceChildren(); byId('github-runners').replaceChildren();
  for (const registration of host?.observation?.registrations ?? []) {
    const value = card(registration.alias); value.dataset.registration = registration.alias;
    if (registration.availability !== 'available') value.append(node('p', registration.reason ?? 'Registration unavailable; process health is unknown.'));
    else {
      facts(value, [['Repository', registration.repository], ['Registered runner ID', String(registration.id)], ['Registration name', registration.name], ['File modified', time(registration.modifiedAt)], ['Collected', time(registration.collectedAt)]]);
      const source = sources.get(registration.repository?.toLowerCase());
      const match = source?.runners?.find(runner => runner.id === registration.id);
      value.append(node('p', match ? (match.name !== registration.name ? 'Name conflict: GitHub reports ' + match.name + '.' : 'Repository and runner ID match the GitHub observation.')
        + (source.stale ? ' The GitHub observation is stale.' : '') : 'No scoped GitHub identity match observed.'));
      value.append(node('p', 'Process health and available capacity are unobserved.'));
    }
    if (host.stale) { value.classList.add('runtime-stale'); value.append(node('p', 'Stale host observation; original collection time retained.')); }
    byId('host-registrations').append(value);
  }
  for (const adoption of host?.observation?.adoptions ?? []) {
    const value = card(adoption.repository);
    if (adoption.availability !== 'available') value.append(node('p', adoption.reason ?? 'Committed evidence unavailable.'));
    else {
      facts(value, [['Declared CLI', adoption.declaredCli], ['Locked CLI', adoption.lockedCli], ['SDLC manifest', adoption.sdlcVersion], ['Workflow source ref', adoption.workflowRef], ['Observed commit', adoption.revision], ['Collected', time(adoption.collectedAt)]]);
      value.append(node('p', adoption.complete ? 'Selected committed files observed.' : 'Partial committed evidence; missing values remain unknown.'));
      if (validRepository(adoption.repository) && /^[a-f0-9]{40}$/.test(adoption.revision ?? '')) value.append(link('Open source commit', adoption.repository, '/tree/' + adoption.revision));
    }
    if (host.stale) { value.classList.add('runtime-stale'); value.append(node('p', 'Stale host observation.')); }
    byId('runtime-adoptions').append(value);
  }
  for (const [repository, source] of sources) {
    const value = card(repository); value.dataset.repository = repository;
    if (source.availability !== 'available') value.append(node('p', source.reason ?? 'GitHub inventory unavailable.'));
    else {
      value.append(node('p', `Collected ${source.runners.length} / ${source.sourceTotal ?? 'unknown'} source runners · ${source.complete ? 'complete source page' : 'partial coverage'}. Collected: ${time(source.observedAt)}.`));
      if (source.complete && source.sourceTotal === 0) value.append(node('p', 'GitHub reports no repository runners.'));
      for (const runner of source.runners) {
        const item = node('section'); item.append(node('h4', runner.name));
        facts(item, [['Runner ID', String(runner.id)], ['GitHub status', runner.status ?? 'unknown'], ['Busy', runner.busy === true ? 'Yes' : runner.busy === false ? 'No' : 'Unknown'], ['OS', runner.os], ['Labels', runner.labelsComplete ? runner.labels.join(', ') || 'None reported' : 'Unknown / incomplete']]);
        const registration = host?.observation?.registrations?.find(r => r.availability === 'available' && r.repository.toLowerCase() === repository && r.id === runner.id);
        item.append(node('p', registration ? 'Matches a configured local registration identity; process health remains unknown.' : 'Physical location unknown.'));
        value.append(item);
      }
    }
    if (source.stale) { value.classList.add('runtime-stale'); value.append(node('p', (source.reason ? source.reason + ' ' : '') + 'Stale GitHub evidence; original collection time retained.')); }
    value.append(link('Runner settings', repository, '/settings/actions/runners'), link('Workflow activity', repository, '/actions'));
    byId('github-runners').append(value);
  }
  if (key && !previous.isConnected) {
    const next = [...document.querySelectorAll('[data-runtime-focus]')].find(element => element.dataset.runtimeFocus === key)
      ?? document.querySelector('header a[href="/workspace"]');
    next?.focus();
  }
}
async function refreshHost() {
  const epoch = ++hostEpoch; byId('host-refresh').disabled = true;
  try {
    if (!await verifyOwner() || epoch !== hostEpoch) return;
    const response = await fetch('/api/runtime/host', { cache: 'no-store' });
    if (epoch !== hostEpoch) return;
    if (response.status === 401 || response.status === 403) { clearAll(); return; }
    const value = await response.json();
    if (!response.ok || value.availability !== 'available') throw Error(response.status === 429 ? 'Host observation is busy. Retry explicitly.' : 'Host evidence is unavailable.');
    if (epoch !== hostEpoch) return;
    host = value; render();
    byId('host-status').textContent = value.observation?.configured ? `${value.registrationCount} configured registrations, ${value.checkoutCount} configured checkouts · ${value.complete ? 'complete' : 'incomplete'} selected coverage. Collected: ${time(value.observedAt)}.` : 'Host sources are not configured; the total runner/adopter inventory is unknown.';
  } catch (error) {
    if (epoch !== hostEpoch) return;
    if (host) host.stale = true; render(); byId('host-status').textContent = error.message + ' Earlier evidence, if present, is stale.';
  } finally { byId('host-refresh').disabled = false; }
}
async function refreshGitHub() {
  let epoch = ++githubEpoch; byId('runners-refresh').disabled = true;
  try {
    if (!await verifyOwner() || epoch !== githubEpoch) return;
    const response = await fetch('/api/connections/github', { cache: 'no-store' });
    if (epoch !== githubEpoch) return;
    if (response.status === 401 || response.status === 403) { clearAll(); return; }
    const account = await response.json(); updateWorkspaceAccount(account);
    if (epoch !== githubEpoch) return;
    if (['unlinked', 'unconfigured'].includes(account.state)) { clearGitHub('Connect and verify GitHub to read repository runners. Host evidence is separate.'); return; }
    if (!response.ok || account.state !== 'linked' || typeof account.dataScope !== 'string' || !Array.isArray(account.repositories)) throw Error('Current GitHub authority is unavailable.');
    if (scope !== account.dataScope) { clearGitHub('Reading the current GitHub account…'); epoch = githubEpoch; scope = account.dataScope; }
    const catalog = account.repositories.filter(row => validRepository(row.repository));
    const allowed = new Set(catalog.map(row => row.repository.toLowerCase()));
    for (const key of sources.keys()) if (!allowed.has(key)) sources.delete(key);
    for (const row of catalog) {
      const key = row.repository.toLowerCase();
      if (row.availability === 'denied' || row.administrationAvailability === 'denied' || row.availability === 'available' && row.administrationRead !== true && row.administrationAvailability !== 'unavailable')
        sources.set(key, { availability: 'denied', reason: 'Administration-read authority for this user and matching App installation is not confirmed.' });
      else if (row.availability !== 'available' || row.administrationAvailability === 'unavailable') {
        const previous = sources.get(key);
        sources.set(key, previous?.availability === 'available' ? { ...previous, stale: true } : { availability: 'unavailable', reason: 'Current repository authority is unavailable.' });
      }
    }
    render();
    const pending = catalog.filter(row => row.availability === 'available' && row.administrationRead === true && !['unavailable', 'denied'].includes(row.administrationAvailability));
    async function worker() {
      while (pending.length && epoch === githubEpoch) {
        const row = pending.shift(), repository = row.repository.toLowerCase();
        try {
          const result = await fetch('/api/runtime/' + repository, { cache: 'no-store' });
          if (epoch !== githubEpoch) return;
          if (result.status === 401) { clearAll(); return; }
          if (result.status === 409) { clearGitHub('The GitHub account changed or disconnected. Refresh after verification.'); return; }
          if (result.status === 403) { sources.set(repository, { availability: 'denied', reason: 'GitHub denied this repository; earlier inventory was removed.' }); render(); continue; }
          const value = await result.json();
          if (epoch !== githubEpoch) return;
          if (!result.ok || value.availability !== 'available') throw Error(result.status === 429 ? 'Runner read is busy. Retry explicitly.' : 'Source evidence is unavailable.');
          if (value.dataScope !== scope) { clearGitHub('The GitHub account changed. Refresh after verification.'); return; }
          sources.set(repository, value); render();
        } catch (error) {
          if (epoch !== githubEpoch) return;
          const previous = sources.get(repository);
          sources.set(repository, previous?.availability === 'available' ? { ...previous, stale: true, reason: error.message } : { availability: 'unavailable', reason: error.message + ' Coverage is unknown.' }); render();
        }
      }
    }
    await Promise.all([worker(), worker()]);
    if (epoch === githubEpoch) byId('runners-status').textContent = 'GitHub observations cover configured repositories only. Unavailable, denied and stale sources do not establish current host health or capacity.';
  } catch {
    if (epoch !== githubEpoch) return;
    for (const [key, source] of sources) if (source.availability === 'available') sources.set(key, { ...source, stale: true });
    render(); byId('runners-status').textContent = 'GitHub authority is unavailable. Earlier source evidence is stale; host observations remain separate.';
  } finally { byId('runners-refresh').disabled = false; }
}
byId('host-refresh').addEventListener('click', refreshHost);
byId('runners-refresh').addEventListener('click', refreshGitHub);
byId('runtime-status').textContent = 'Each source is read independently. Use its refresh button for a new observation.';
Promise.allSettled([refreshHost(), refreshGitHub()]);
