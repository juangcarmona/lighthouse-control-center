import { updateWorkspaceAccount } from './workspace-ui.js';
import { renderActions, renderUnavailableActions } from './issue-actions.js';
import { markdown, sourceLink } from './markdown.js';
const byId = id => document.getElementById(id);
const maximumTextBytes = 8 * 1024 * 1024;
const encoder = new TextEncoder();
let renderingBudget = { remaining: 5000 };
let current, comments = [], bytes = 0, nextPage = null, pending = false, controller, revision = 0;
const initial = location.pathname.match(/^\/workspace\/issues\/([^/]+)\/([^/]+)\/(\d+)$/);
if (initial) { byId('issue-picker').hidden = true; byId('issue-repository').value = initial[1] + '/' + initial[2]; byId('issue-number').value = initial[3]; }
else {
  const repository = new URLSearchParams(location.search).get('repository');
  if (repository && /^[a-zA-Z0-9][a-zA-Z0-9-]*\/[a-zA-Z0-9_.-]+$/.test(repository)) byId('issue-repository').value = repository;
}
function status(text, error = false) { byId('issue-status').textContent = text; byId('issue-status').dataset.state = error ? 'error' : 'ready'; }
function controlsStatus(text) {
  byId('controls-status').textContent = text;
  renderUnavailableActions(byId('control-actions'), text);
}
function controlReason(data) {
  const reason = typeof data?.reason === 'string' ? data.reason : 'Shared source facts are unavailable.';
  const diagnostic = reason.match(/^source-read-(actor|repository|issue|commits|comments)-(http-(?:401|403|404|408|409|429|500|502|503)|status-unknown)$/);
  if (!diagnostic) return reason;
  const names = { actor: 'the connected GitHub identity', repository: 'the repository', issue: 'this issue', commits: "the repository's current revision", comments: 'the issue conversation' };
  const scopes = { contents: 'Contents: read', pull_requests: 'Pull requests: read', variables: 'Variables: read', actions: 'Actions: read' };
  const missing = (Array.isArray(data.missingReadScopes) ? data.missingReadScopes : []).filter(scope => Object.hasOwn(scopes, scope)).map(scope => scopes[scope]);
  return 'Could not read ' + names[diagnostic[1]] + ' (' + diagnostic[2].replace('http-', 'HTTP ') + '). '
    + (missing.length ? 'Missing or unverified GitHub App access: ' + missing.join(', ') + '. Verify installation permissions and reconnect GitHub after authorization changes.'
      : diagnostic[2] === 'http-429' ? 'GitHub is rate limiting these checks. Refresh after the source limit resets.' : 'Refresh the source. If this persists, check the GitHub connection and source availability.');
}
function clear() {
  renderingBudget = { remaining: 5000 };
  current = null; comments = []; bytes = 0; nextPage = null;
  byId('issue-title').textContent = initial ? 'Issue #' + initial[3] : 'Issue'; byId('issue-state').hidden = true; byId('evidence-status').textContent = '';
  for (const id of ['issue-body', 'issue-facts', 'issue-comments', 'issue-evidence', 'issue-controls']) byId(id).replaceChildren();
  controlsStatus('Shared source authority has not been observed.');
  byId('source-eligibility').open = false;
  byId('source-provenance').open = false;
  byId('issue-facts-details').open = false;
  byId('conversation-panel').querySelector('details').open = false;
  byId('conversation-coverage').textContent = ''; byId('issue-age').textContent = ''; byId('issue-more').hidden = true;
}
function selection() {
  const repository = byId('issue-repository').value.trim();
  const number = Number(byId('issue-number').value);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\/[a-zA-Z0-9_.-]+$/.test(repository) || !Number.isInteger(number) || number < 1 || number > 2147483647) return null;
  return { repository, number, key: repository.toLowerCase() + '#' + number };
}
function paragraph(text, className) { const p = document.createElement('p'); p.textContent = text; if (className) p.className = className; return p; }
function show(data, append) {
  if (!append) {
    byId('issue-title').textContent = data.issue.title;
    document.title = '#' + data.number + ' · ' + data.issue.title + ' · Lighthouse Control Center';
    const repositoryLink = document.createElement('a'); repositoryLink.href = '/workspace/repositories/' + data.repository; repositoryLink.textContent = data.repository.split('/')[1]; repositoryLink.title = data.repository;
    document.querySelector('.header-context').replaceChildren(repositoryLink, document.createTextNode(' / #' + data.number));
    const badge = byId('issue-state'); badge.hidden = false; badge.textContent = data.issue.state === 'open' ? 'Open' : data.issue.state === 'closed' ? 'Closed' : 'Unknown'; badge.className = 'badge' + (data.issue.state === 'open' ? ' positive' : '');
    byId('issue-body').replaceChildren(markdown(data.issue.body, renderingBudget));
    byId('issue-facts-details').open = false;
    byId('issue-facts').replaceChildren(paragraph('Issue state: ' + data.issue.state + ' · Author: ' + (data.issue.author ?? 'unknown')),
      paragraph('Source labels: ' + (data.issue.labels.join(', ') || 'none observed')),
      paragraph('Source updated: ' + (data.issue.updatedAt ?? 'unknown')),
      sourceLink('Inspect source issue', data.issue.sourceUrl));
    if (Array.isArray(data.issue.labelFacts)) {
      const requested = data.issue.labelFacts.filter(label => label.role === 'command');
      byId('issue-facts').append(paragraph('Requested command labels: ' + (requested.map(label => label.name).join(', ') || 'none observed')));
      const detail = document.createElement('details'), summary = document.createElement('summary');
      summary.textContent = 'Understand source labels'; detail.append(summary,
        paragraph('Descriptions use the installed shared reference catalog. Source authority, execution and results are verified separately.'));
      for (const label of data.issue.labelFacts) detail.append(paragraph(`${label.name} · ${label.role}: ${label.description}`));
      byId('issue-facts').append(detail);
    }
  }
  for (const comment of data.conversation.items) {
    const li = document.createElement('li'); li.id = 'source-comment-' + comment.id;
    const heading = document.createElement('h3'); heading.textContent = comment.author ?? 'Unknown source author';
    const details = document.createElement('details'), summary = document.createElement('summary'); summary.textContent = 'Source details';
    details.append(summary, paragraph('Comment ID: ' + comment.id + ' · Updated: ' + (comment.updatedAt ?? 'unknown'), 'source-byline'),
      sourceLink('Inspect source comment', comment.sourceUrl));
    li.append(heading, details, markdown(comment.body, renderingBudget));
    byId('issue-comments').append(li);
  }
  nextPage = data.conversation.nextPage;
  const capped = data.conversation.page >= 10 || comments.length >= 1000 || bytes >= maximumTextBytes;
  if (capped) nextPage = null;
  byId('issue-more').hidden = nextPage === null;
  byId('conversation-coverage').textContent = `${comments.length} comments read · Source count: ${data.conversation.sourceCount ?? 'unknown'} · ${data.conversation.complete ? 'End observed' : 'Partial coverage'}. `
    + (capped ? 'The read budget was reached; later records require source inspection. ' : '') + (data.conversation.reason ?? '');
  byId('issue-age').textContent = 'Observed: ' + data.observedAt + ' · Acting GitHub user ID: ' + data.actingUserId;
  status(data.conversation.availability === 'unavailable' ? 'Issue read; conversation unavailable. Previous pages may be stale.' : 'Issue context loaded from GitHub.');
}
async function read(append = false) {
  const target = selection(); if (!target) { status('Choose owner/repository and a positive issue number.', true); return; }
  if (pending || append && (nextPage === null || bytes >= maximumTextBytes || comments.length >= 1000)) return;
  if (!append && current?.key !== target.key) clear();
  const draft = append ? byId('comment-composer-slot').querySelector('textarea')?.value ?? '' : '';
  controlsStatus('Refreshing source context; previous shared observations may be stale.');
  pending = true; const operation = ++revision; controller?.abort(); controller = new AbortController();
  byId('issue-refresh').disabled = true; byId('issue-more').disabled = true;
  const page = append ? nextPage : 1;
  const query = new URLSearchParams({ page: String(page) }); if (append) query.set('snapshot', current.snapshot);
  try {
    const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '?' + query,
      { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' });
    if (operation !== revision) return;
    if ([401, 403, 409].includes(response.status)) {
      if (response.status === 401) updateWorkspaceAccount({ state: 'expired' });
      const failure = await response.json().catch(() => null); clear();
      const reason = typeof failure?.reason === 'string' ? failure.reason : 'Source authority changed. Verify the account and refresh.';
      status(reason, true); controlsStatus('Actions unavailable. ' + reason); return;
    }
    const data = await response.json();
    if (current && data.dataScope && data.dataScope !== current.dataScope) {
      clear();
      if (append) { status('The connected account changed. Refresh to read a new source snapshot.', true); return; }
    }
    if (!response.ok) throw Error('Source temporarily unavailable');
    if (data.availability !== 'available' || data.repository.toLowerCase() !== target.repository.toLowerCase()
        || typeof data.dataScope !== 'string' || !data.dataScope || data.number !== target.number || !data.issue || !data.conversation || !Array.isArray(data.conversation.items)) throw Error('Unverified source response');
    if (data.evidenceReadAllowed === false) {
      byId('issue-evidence').replaceChildren();
      byId('evidence-status').textContent = 'Actions-read access is unavailable; previous execution evidence was removed.';
    }
    if (!append && current?.key === target.key && data.conversation.availability === 'unavailable') {
      show(data, false);
      byId('conversation-coverage').textContent = `${comments.length} previously read comments retained as stale. Source times are unchanged. ${data.conversation.reason ?? ''}`;
      if (data.evidenceReadAllowed !== false) byId('evidence-status').textContent = 'Previous evidence remains stale; its source observations have not refreshed.';
      status('Issue refreshed; previous conversation pages remain stale because their source refresh failed.', true);
      void readControls(target, operation);
      return;
    }
    const oldIds = new Set(append ? comments.map(item => item.id) : []);
    if (data.conversation.items.some(item => oldIds.has(item.id))) throw Error('Conversation changed between pages');
    const size = data.conversation.items.reduce((sum, item) => sum + encoder.encode(item.body).length, 0);
    if ((append ? bytes : 0) + size > maximumTextBytes) {
      nextPage = null; byId('issue-more').hidden = true;
      status('The conversation text budget was reached. No further pages will be fetched; inspect the source for remaining records.', true); return;
    }
    if (!append) { clear(); bytes = size; comments = data.conversation.items; }
    else { bytes += size; comments.push(...data.conversation.items); }
    current = { ...target, snapshot: data.snapshot, dataScope: data.dataScope }; show(data, append);
    void readEvidence(target, page, data.snapshot, operation);
    void readControls(target, operation, draft);
  } catch (error) {
    if (error.name !== 'AbortError' && operation === revision) {
      status(current ? 'Refresh unavailable; displayed source context is stale. Source times are unchanged.' : 'Source context unavailable; no issue or empty conversation is inferred.', true);
      controlsStatus(current ? 'Source refresh unavailable. Previous shared observations are stale; their source times are unchanged.'
        : 'The issue could not be read. Refresh the source before commenting or requesting a Lighthouse action.');
    }
  } finally { if (operation === revision) { pending = false; byId('issue-refresh').disabled = false; byId('issue-more').disabled = false; } }
}
byId('issue-picker').addEventListener('submit', event => {
  event.preventDefault(); const target = selection(); if (!target) { status('Choose a valid repository and issue number.', true); return; }
  location.assign('/workspace/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number);
});
byId('issue-refresh').addEventListener('click', () => read());
byId('issue-more').addEventListener('click', () => read(true));
controlsStatus('Open a mission to check whether commenting and Lighthouse actions are available.');
if (initial) await read(); else status('Choose a configured repository and ordinary issue number.');

async function readEvidence(target, page, snapshot, operation) {
  try {
    const query = new URLSearchParams({ page: String(page), snapshot });
    const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '/evidence?' + query,
      { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' });
    if (operation !== revision || current?.key !== target.key) return;
    if ([401, 403, 409].includes(response.status)) {
      if (response.status === 401) updateWorkspaceAccount({ state: 'expired' }); clear(); status('Source authority changed; previous context was removed.', true); return; }
    if (!response.ok) throw Error('Unavailable evidence');
    const data = await response.json();
    if (!data.dataScope || data.dataScope !== current.dataScope) {
      clear(); status('The connected account changed. Refresh to read a new source snapshot.', true); return;
    }
    if (data.availability === 'restricted') {
      byId('issue-evidence').replaceChildren(); byId('evidence-status').textContent = data.reason; return;
    }
    if (data.availability !== 'available' || !Array.isArray(data.reports)) throw Error('Unavailable evidence');
    byId('evidence-status').textContent = data.scope + ' Evidence observed: ' + (data.observedAt ?? 'unknown') + '. ' + (data.reason ?? '');
    for (const pull of data.pullRequests ?? []) {
      if (byId('related-pr-' + pull.number)) continue;
      const item = document.createElement('article'); item.id = 'related-pr-' + pull.number;
      const heading = document.createElement('h3'); heading.append(sourceLink('PR #' + pull.number + (pull.title ? ' · ' + pull.title : ''), pull.sourceUrl));
      item.append(paragraph('Evidence observed: ' + (data.observedAt ?? 'unknown')));
      item.append(heading, paragraph(`Source: ${pull.availability} · State ${pull.state ?? 'unknown'} · Draft ${pull.draft ?? 'unknown'}`));
      if (pull.headRevision) item.append(paragraph('Head revision: ' + pull.headRevision));
      item.append(paragraph('Checks: ' + (pull.checksAvailability ?? 'unavailable')));
      for (const check of pull.checks ?? []) {
        const row = paragraph(`${check.name}: ${check.status ?? 'unknown'} / ${check.conclusion ?? 'unknown'} · Check ID ${check.id ?? 'unknown'}`);
        if (check.sourceUrl) row.append(sourceLink(' Inspect check', check.sourceUrl)); item.append(row);
      }
      for (const source of pull.referencedBy ?? []) item.append(sourceLink('Referenced by source', source));
      item.append(paragraph(pull.reason ?? 'Source PR evidence is unavailable.')); byId('issue-evidence').append(item);
    }
    for (const report of data.reports) {
      if (byId('evidence-' + report.commentId)) continue;
      const item = document.createElement('article'); item.id = 'evidence-' + report.commentId;
      const heading = document.createElement('h3'); heading.textContent = report.availability === 'available'
        ? (report.stage ?? 'Unknown stage') + ' · ' + (report.result ?? 'unknown result') : 'Unverified source report';
      item.append(heading, sourceLink('Inspect source report', report.sourceUrl), paragraph('Evidence observed: ' + (data.observedAt ?? 'unknown')));
      if (report.runId) item.append(paragraph(`Workflow ${report.runId} · Attempt ${report.attempt ?? 'unknown'} · Execution ${report.executionStatus ?? 'unknown'} / ${report.executionConclusion ?? 'unknown'}`),
        sourceLink('Inspect workflow execution', `https://github.com/${target.repository}/actions/runs/${report.runId}`));
      if (report.executionRequestId) item.append(paragraph('Source execution request: ' + report.executionRequestId));
      if (report.question) item.append(paragraph('Source question: ' + report.question));
      for (const artifact of report.artifacts ?? []) item.append(paragraph(`Artifact ${artifact.name} · ID ${artifact.id ?? 'unknown'} · ${artifact.availability} · ${artifact.compressedBytes ?? 'unknown'} compressed bytes`));
      if (report.sourceRevision) item.append(paragraph('Result source revision: ' + report.sourceRevision));
      if (report.gate) item.append(paragraph('Source gate: ' + report.gate));
      for (const text of [...(report.missingEvidence ?? []), ...(report.pendingReview ?? [])]) item.append(paragraph(text));
      item.append(paragraph(report.reason ?? 'Evidence limits unknown.')); byId('issue-evidence').append(item);
    }
  } catch (error) {
    if (error.name !== 'AbortError' && operation === revision && current?.key === target.key)
      byId('evidence-status').textContent = 'Lifecycle artifacts are unavailable. Issue text and source reports remain readable; no result, lease or command authority is inferred.';
  }
}

async function readControls(target, operation, initialBody = '') {
  controlsStatus('Refreshing shared source facts; previous observations may be stale.');
  try {
    const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '/controls',
      { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' });
    if (operation !== revision || current?.key !== target.key) return;
    const data = await response.json().catch(() => null);
    const reason = controlReason(data);
    if ([401, 403, 409].includes(response.status)) {
      if (response.status === 401) updateWorkspaceAccount({ state: 'expired' });
      clear(); status('Source authority changed; previous context was removed. ' + reason, true);
      controlsStatus('Actions unavailable. ' + reason);
      return;
    }
    if (!response.ok) {
      controlsStatus('Action checks are unavailable. Previous observations may be stale. ' + reason);
      if (typeof data?.reason === 'string') {
        byId('issue-controls').replaceChildren(paragraph('Source diagnostic: ' + data.reason));
        byId('source-eligibility').open = true;
      }
      return;
    }
    if (!data) throw Error('Shared source facts unavailable');
    if (!data.dataScope || data.dataScope !== current.dataScope) { clear(); status('The connected account changed. Refresh to read a new source snapshot.', true); return; }
    byId('issue-controls').replaceChildren();
    if (data.availability !== 'available') {
      controlsStatus('Shared source observation: ' + (data.availability ?? 'unavailable') + '. ' + (data.reason ?? 'No current question or eligibility is inferred.'));
      return;
    }
    const facts = data.facts;
    if (!facts || facts.repository?.name?.toLowerCase() !== target.repository.toLowerCase() || facts.issue?.number !== target.number
        || !Number.isSafeInteger(data.actingUserId) || data.actingUserId <= 0
        || !Number.isSafeInteger(facts.actor?.id) || facts.actor.id <= 0 || facts.actor.id !== data.actingUserId
        || typeof data.observedAt !== 'string') throw Error('Unverified shared source identity');
    if (typeof facts.actor.login === 'string' && facts.actor.login.trim()) {
      updateWorkspaceAccount({ state: 'linked', login: facts.actor.login.trim() });
    }
    const area = byId('issue-controls'), question = facts.question;
    const eligible = ['comment', 'refine', 'propose', 'continue'].some(name => facts.actions?.[name]?.eligible === true);
    byId('source-eligibility').open = !data.submissionAvailable || !eligible || question?.current === true;
    controlsStatus(!data.submissionAvailable
      ? 'Sending actions and recovery are disabled because protected command storage is not ready. Opening this page does not send an action. You can still inspect the issue and source checks below.'
      : !eligible ? 'No action is currently permitted. Current question and action availability below explain the source checks.'
        : 'Available actions are shown below. Prepare first, then review and confirm the exact effect before sending.');
    area.append(paragraph('Shared observation: ' + data.observedAt + ' · GitHub user ID ' + data.actingUserId + '. Source eligibility and application submission are separate.'));
    if (question?.availability === 'available') {
      area.append(paragraph(question.current === true ? 'Verified current question' : 'Verified source question; current input or wait no longer matches'),
        paragraph(question.text), paragraph('Question source updated: ' + (question.sourceUpdatedAt ?? 'unknown') + ' · Observed: ' + data.observedAt));
      if (question.source) area.append(sourceLink('Inspect source question', question.source));
    } else area.append(paragraph('Current question: ' + (question?.availability ?? 'unavailable') + '. ' + (question?.reason ?? 'Source labels and historical reports do not identify a current question.')));
    area.append(paragraph('Reservation observation: ' + (facts.reservation?.availability ?? 'unavailable') + '. ' + (facts.reservation?.reason ?? facts.reservation?.coverage ?? 'Coverage unknown.')));
    for (const [name, label] of [['comment', 'Ordinary comment'], ['refine', 'Refine'], ['propose', 'Propose'], ['continue', 'Continue']]) {
      const action = facts.actions?.[name];
      area.append(paragraph(label + ' · Source: ' + (action?.eligible === true ? 'eligible' : action?.availability ?? 'unavailable')
        + (action?.reason ? ' · ' + action.reason : '') + ' · Lighthouse Control Center submission: ' + (data.submissionAvailable ? 'available with confirmation' : 'unavailable')));
    }
    renderActions(byId('control-actions'), facts, target, data.dataScope,
      () => operation === revision && current?.key === target.key && current?.dataScope === data.dataScope,
      reason => {
        clear();
        status('The action is unavailable. Previous source context was cleared. ' + (reason || 'Verify your account and refresh.'), true);
        controlsStatus('Actions unavailable. ' + (reason || 'Verify your account and refresh.'));
      }, '', { submissionAvailable: data.submissionAvailable === true, initialBody,
        reason: !data.submissionAvailable ? 'Protected command storage is not ready. Sending and recovery are disabled.' : '' });
    if (data.missingReadScopes?.length) area.append(paragraph('Missing or unknown App read scopes: ' + data.missingReadScopes.join(', ')));
  } catch (error) {
    if (error.name !== 'AbortError' && operation === revision && current?.key === target.key)
      controlsStatus('Shared source refresh unavailable. Previous observations may be stale; no current eligibility or question is inferred.');
  }
}
