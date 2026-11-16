import { readProjectionCache, writeProjectionCache, clearProjectionCache, readDraft, writeDraft, readCollection } from './read-projection-cache.js';
import { displayContext, formatDate, relativeDate, projectWorkspaceSourceIdentity, updateWorkspaceAccount, validateWorkspaceSourceIdentity, workspaceSourceIdentityGeneration } from './workspace-ui.js';
import { renderActions, renderUnavailableActions } from './issue-actions.js';
import { markdown, sourceLink } from './markdown.js';
import { issueHistory } from './evidence-projections.js';
const byId = id => document.getElementById(id);
const maximumTextBytes = 8 * 1024 * 1024;
const encoder = new TextEncoder();
let renderingBudget = { remaining: 5000 };
let current, comments = [], bytes = 0, nextPage = null, pending = false, controller, revision = 0;
let historyEvents = [];
const initial = location.pathname.match(/^\/workspace\/issues\/([^/]+)\/([^/]+)\/(\d+)$/);
if (initial) { byId('issue-picker').hidden = true; byId('issue-repository').value = initial[1] + '/' + initial[2]; byId('issue-number').value = initial[3]; }
else {
  const repository = new URLSearchParams(location.search).get('repository');
  if (repository && /^[a-zA-Z0-9][a-zA-Z0-9-]*\/[a-zA-Z0-9_.-]+$/.test(repository)) byId('issue-repository').value = repository;
}
function status(text, error = false) { byId('issue-status').textContent = text; byId('issue-status').dataset.state = error ? 'error' : 'ready'; }
function controlsStatus(text) {
  byId('controls-status').textContent = text;
  const target = selection();
  const draft = current && target ? readDraft(current.dataScope, current.actingUserId, target.repository, target.number) : '';
  renderUnavailableActions(byId('control-actions'), text, draft);
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
function clearPrivate() { clearProjectionCache(current?.dataScope); clear(); byId('issue-description-details').open = false; }
function clear() {
  historyEvents = [];
  renderingBudget = { remaining: 5000 };
  current = null; comments = []; bytes = 0; nextPage = null;
  byId('issue-title').textContent = initial ? 'Issue #' + initial[3] : 'Issue'; byId('issue-state').hidden = true; byId('evidence-status').textContent = '';
  for (const id of ['issue-body', 'issue-facts', 'issue-comments', 'issue-evidence', 'issue-controls']) byId(id).replaceChildren();
  controlsStatus('Shared source authority has not been observed.');
  byId('source-eligibility').open = false;
  byId('source-provenance').open = false;
  byId('issue-facts-details').open = false;
  byId('issue-description-details').open = true;
  byId('conversation-history').open = false;
  byId('conversation-provenance').open = false;
  byId('conversation-summary').textContent = 'Conversation history';
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
  const previous = readCollection(data.dataScope);
  if (previous && !document.querySelector('.collection-return')) { const back = document.createElement('a'); back.href = previous; back.textContent = '← Back to collection'; back.className = 'collection-return'; byId('issue-main').prepend(back); }

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
      paragraph('Source updated: ' + formatDate(data.issue.updatedAt)),
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
    const heading = document.createElement('h3'); heading.textContent = (comment.author ?? 'Unknown source author') + ' · ' + relativeDate(comment.updatedAt);
    const details = document.createElement('details'), summary = document.createElement('summary'); summary.textContent = 'Source details';
    details.append(summary, paragraph('Comment ID: ' + comment.id + ' · Updated: ' + formatDate(comment.updatedAt), 'source-byline'),
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
  byId('conversation-summary').textContent = `Conversation history · ${comments.length} read / ${data.conversation.sourceCount ?? 'unknown'} source comments · ${data.conversation.complete ? 'End observed' : 'Partial coverage'}`;
  byId('issue-age').dataset.observedAt = data.observedAt;
  byId('issue-age').title = data.observedAt;
  byId('issue-age').textContent = 'Observed: ' + formatDate(data.observedAt) + ' · Acting GitHub user ID: ' + data.actingUserId;
  status(data.conversation.availability === 'unavailable' ? 'Issue read; conversation unavailable. Previous pages may be stale.' : 'Issue context loaded from GitHub.');
}
async function read(append = false) {
  const target = selection(); if (!target) { status('Choose owner/repository and a positive issue number.', true); return; }
  if (pending || append && (nextPage === null || bytes >= maximumTextBytes || comments.length >= 1000)) return;
  if (!append && current?.key !== target.key) clear();
  const draft = byId('comment-composer-slot').querySelector('textarea')?.value ?? (current ? readDraft(current.dataScope, current.actingUserId, target.repository, target.number) : '');
  controlsStatus('Refreshing source context; previous shared observations may be stale.');
  pending = true; const operation = ++revision; controller?.abort(); controller = new AbortController();
  byId('issue-refresh').disabled = true; byId('issue-more').disabled = true;
  const page = append ? nextPage : 1;
  const query = new URLSearchParams({ page: String(page) }); if (append) query.set('snapshot', current.snapshot);
  const identityGeneration = workspaceSourceIdentityGeneration();
  try {
    const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '?' + query,
      { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' });
    if (operation !== revision) return;
    const data = await response.json().catch(() => null);
    if ([401, 403, 409].includes(response.status)) {
      if (response.status === 401) updateWorkspaceAccount({ state: 'expired' });
      else if (!validateWorkspaceSourceIdentity(data, current?.dataScope, current?.actingUserId, identityGeneration)) { clearPrivate(); status('The connected account changed or is no longer available. Refresh to read a new source snapshot.', true); return; }
      clearPrivate();
      const reason = typeof data?.reason === 'string' ? data.reason : 'Source authority changed. Verify the account and refresh.';
      status(reason, true); controlsStatus('Actions unavailable. ' + reason); return;
    }
    if (!validateWorkspaceSourceIdentity(data, current?.dataScope, current?.actingUserId, identityGeneration)) { clearPrivate(); status('The connected account changed or is no longer available. Refresh to read a new source snapshot.', true); return; }
    if (current && data.dataScope && data.dataScope !== current.dataScope) {
      clearPrivate();
      if (append) { status('The connected account changed. Refresh to read a new source snapshot.', true); return; }
    }
    if (!response.ok) throw Error('Source temporarily unavailable');
    if (data.availability !== 'available' || data.repository.toLowerCase() !== target.repository.toLowerCase()
        || typeof data.dataScope !== 'string' || !data.dataScope || data.number !== target.number || !data.issue || !data.conversation || !Array.isArray(data.conversation.items)) throw Error('Unverified source response');
    if (data.evidenceReadAllowed === false) {
      historyEvents = [];
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
    if (!append) {
      const disclosures = current?.key === target.key && current.dataScope === data.dataScope && current.actingUserId === data.actingUserId
        ? ['issue-description-details', 'conversation-history'].map(id => [id, byId(id).open]) : [];
      clear();
      for (const [id, open] of disclosures) byId(id).open = open;
      bytes = size; comments = data.conversation.items;
    }
    else { bytes += size; comments.push(...data.conversation.items); }
    current = { ...target, snapshot: data.snapshot, dataScope: data.dataScope, actingUserId: data.actingUserId }; show(data, append);
    writeProjectionCache(data.dataScope, { issueContext: { ...data, conversation: { ...data.conversation, items: comments } } }, 'issue');
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
const display = displayContext(), target = selection();
if (display && target && display.repositories.some(row => row.issuesRead && row.repository.toLowerCase() === target.repository.toLowerCase())) {
  const data = readProjectionCache(display.dataScope, 'issue')?.issueContext;
  if (data?.dataScope === display.dataScope && data.actingUserId === display.actingUserId && data.repository?.toLowerCase() === target.repository.toLowerCase()
      && data.number === target.number && data.issue && Array.isArray(data.conversation?.items)) {
    current = { ...target, snapshot: data.snapshot, dataScope: data.dataScope, actingUserId: data.actingUserId };
    comments = data.conversation.items; bytes = comments.reduce((n, item) => n + encoder.encode(item.body).length, 0);
    show(data, false); status('Saved issue context · refreshing source checks…', true);
    controlsStatus('Refreshing source authority. Your draft remains editable; no action is enabled from saved data.');
  }
}
byId('comment-composer-slot').addEventListener('input', event => {
  if (event.target.tagName !== 'TEXTAREA' || !current) return;
  const saved = writeDraft(current.dataScope, current.actingUserId, current.repository, current.number, event.target.value);
  let hint = byId('draft-persistence'); if (!hint) { hint = paragraph('', 'lh-hint'); hint.id = 'draft-persistence'; event.target.closest('.lh-field')?.append(hint); }
  hint.textContent = saved ? 'Draft saved in this tab for this issue.' : 'Draft storage unavailable. Keep this page open to retain your text.';
});

if (initial) await read(); else status('Choose a configured repository and ordinary issue number.');

async function readEvidence(target, page, snapshot, operation) {
  const identityGeneration = workspaceSourceIdentityGeneration();
  try {
    const query = new URLSearchParams({ page: String(page), snapshot });
    const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '/evidence?' + query,
      { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' });
    if (operation !== revision || current?.key !== target.key) return;
    const data = await response.json().catch(() => null);
    if ([401, 403, 409].includes(response.status)) {
      if (response.status === 401) updateWorkspaceAccount({ state: 'expired' });
      else if (!validateWorkspaceSourceIdentity(data, current.dataScope, current.actingUserId, identityGeneration)) { clearPrivate(); status('The connected account changed or is no longer available. Refresh to read a new source snapshot.', true); return; }
      clearPrivate(); status('Source authority changed; previous context was removed.', true); return;
    }
    if (!validateWorkspaceSourceIdentity(data, current.dataScope, current.actingUserId, identityGeneration)) { clearPrivate(); status('The connected account changed or is no longer available. Refresh to read a new source snapshot.', true); return; }
    if (!response.ok) throw Error('Unavailable evidence');
    if (!data.dataScope || data.dataScope !== current.dataScope) {
      clear(); status('The connected account changed. Refresh to read a new source snapshot.', true); return;
    }
    if (data.availability === 'restricted') {
      historyEvents = [];
      byId('issue-evidence').replaceChildren(); byId('evidence-status').textContent = data.reason; return;
    }
    if (data.availability !== 'available' || !Array.isArray(data.reports)) throw Error('Unavailable evidence');
    showHistory({ ...data, repository: target.repository, number: target.number });
    byId('evidence-status').textContent = data.scope + ' Evidence observed: ' + (data.observedAt ?? 'unknown') + '. ' + (data.reason ?? '');
    for (const pull of data.pullRequests ?? []) {
      if (byId('related-pr-' + pull.number)) continue;
      const item = document.createElement('article'); item.id = 'related-pr-' + pull.number;
      const heading = document.createElement('h3'); heading.append(sourceLink('PR #' + pull.number + (pull.title ? ' · ' + pull.title : ''), pull.sourceUrl));
      item.append(heading, paragraph(`Source: ${pull.availability} · State ${pull.state ?? 'unknown'} · Draft ${pull.draft ?? 'unknown'}`));
      const head = disclosure('PR head, checks and reviews');
      head.append(paragraph('Head revision: ' + (pull.headRevision ?? 'unknown')),
        paragraph('Checks: ' + (pull.checksAvailability ?? 'unavailable') + '. Inventory does not establish required-check policy or approval.'));
      appendChecks(head, pull.checks);
      head.append(paragraph('Reviews: ' + (pull.reviewsAvailability ?? 'unavailable') + ' · Protected human approval and integration authorization are not established.'));
      for (const review of pull.reviews ?? []) {
        const binding = review.commitId && pull.headRevision ? review.commitId === pull.headRevision ? 'exact' : 'stale' : 'unknown';
        const row = paragraph(`${review.actor ?? 'Unknown actor'} · ${review.state ?? 'unknown'} · Review ID ${review.id ?? 'unknown'} · Revision ${review.commitId ?? 'unknown'} · Binding ${binding} · Source submitted ${formatDate(review.submittedAt)}`);
        if (review.sourceUrl) row.append(sourceLink(' Inspect review', review.sourceUrl)); head.append(row);
      }
      const integrated = disclosure('Integration and exact-commit observations');
      const integration = pull.integration;
      integrated.append(paragraph('Integration: ' + (integration?.availability ?? 'unavailable')));
      if (integration?.revision) integrated.append(paragraph('Integrated revision: ' + integration.revision),
        sourceLink('Inspect integrated commit', `https://github.com/${target.repository}/commit/${integration.revision}`));
      integrated.append(paragraph(`Target branch: ${integration?.targetBranch ?? 'unknown'} · Source default branch: ${integration?.defaultBranch ?? 'unknown'} · Source merged: ${formatDate(integration?.mergedAt)}`),
        paragraph('Exact-commit checks: ' + (integration?.checksAvailability ?? 'unavailable')));
      appendChecks(integrated, integration?.checks);
      integrated.append(paragraph('Exact default-branch push runs: ' + (integration?.runsAvailability ?? 'unavailable')));
      for (const run of integration?.runs ?? []) {
        const detail = disclosure(`Workflow ${run.id} · Attempt ${run.attempt ?? 'unknown'} · ${run.status ?? 'unknown'} / ${run.conclusion ?? 'unknown'}`);
        detail.append(sourceLink('Inspect post-integration execution', run.sourceUrl),
          paragraph(`Revision: ${run.revision} · Branch: ${run.branch} · Event: ${run.event}`),
          paragraph(`Source started: ${formatDate(run.startedAt)} · Source updated: ${formatDate(run.updatedAt)}`),
          paragraph(`Artifact inventory: ${run.artifactsAvailability} · Metadata only; contents and provenance are not verified.`));
        if (!run.artifacts?.length) detail.append(paragraph('No artifact records collected; required artifacts remain unknown.'));
        for (const artifact of run.artifacts ?? []) detail.append(paragraph(`Artifact ${artifact.name} · ID ${artifact.id ?? 'unknown'} · ${artifact.availability} · ${artifact.compressedBytes ?? 'unknown'} compressed bytes`));
        integrated.append(detail);
      }
      integrated.append(paragraph(integration?.reason ?? 'Integration evidence is unavailable. No verified delivery is claimed.'),
        paragraph('Human decisions, required verification and artifact provenance remain separate. Deployment evidence is unavailable; this view does not establish production delivery.'));
      const provenance = disclosure('PR source details');
      provenance.append(paragraph('Evidence observed: ' + (data.observedAt ?? 'unknown')),
        paragraph('Source updated: ' + formatDate(pull.updatedAt)), paragraph(pull.reason ?? 'Source PR evidence is unavailable.'));
      for (const source of pull.referencedBy ?? []) provenance.append(sourceLink('Referenced by source', source));
      item.append(head, integrated, provenance); byId('issue-evidence').append(item);
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

function disclosure(title) {
  const detail = document.createElement('details'), summary = document.createElement('summary');
  summary.textContent = title; detail.append(summary); return detail;
}

function appendChecks(area, checks) {
  if (!checks?.length) area.append(paragraph('No check records collected; verification remains unknown.'));
  for (const check of checks ?? []) {
    const detail = disclosure(`${check.name}: ${check.status ?? 'unknown'} / ${check.conclusion ?? 'unknown'} · Binding ${check.revisionBinding ?? 'unknown'}`);
    detail.append(paragraph(`Check ID: ${check.id ?? 'unknown'} · Revision: ${check.headRevision ?? 'unknown'}`),
      paragraph(`Source started: ${formatDate(check.startedAt)} · Source completed: ${formatDate(check.completedAt)}`));
    if (check.revisionBinding !== 'exact') detail.append(paragraph('This check does not establish verification for the displayed revision.'));
    if (check.sourceUrl) detail.append(sourceLink('Inspect check', check.sourceUrl)); area.append(detail);
  }
}

function showHistory(data) {
  const retained = historyEvents;
  byId('issue-history')?.remove();
  const history = document.createElement('details'); history.id = 'issue-history';
  const summary = document.createElement('summary'); summary.textContent = 'Lighthouse history';
  const content = document.createElement('div');
  const start = document.createElement('input'), end = document.createElement('input');
  start.type = end.type = 'datetime-local';
  const startLabel = document.createElement('label'), endLabel = document.createElement('label');
  startLabel.append('Window start (UTC) ', start); endLabel.append('Window end (UTC) ', end);
  const apply = document.createElement('button'); apply.type = 'button'; apply.textContent = 'Apply history window';
  history.append(summary, startLabel, endLabel, apply, content);
  function render() {
    const projection = issueHistory(data, retained, { start: start.value ? start.value + 'Z' : null, end: end.value ? end.value + 'Z' : null });
    historyEvents = projection.events;
    content.replaceChildren(paragraph(`Observed: ${data.observedAt ?? 'unknown'} · Conversation page: ${data.conversationPage ?? 'unknown'} · Repository ID: ${data.repositoryId ?? 'unknown'} · Issue ID: ${data.issueId ?? 'unknown'}`),
      paragraph(`Source window: ${projection.start ?? 'unknown'} — ${projection.end ?? 'unknown'} · Equal times do not imply causality.`),
      paragraph(projection.gaps), paragraph('Only this issue’s bounded evidence is retained in memory. Navigation or refresh may discard observations. ' + (projection.omitted ? `${projection.omitted} observations omitted by the 1,000-row / 1 MiB limit.` : '')));
    for (const [title, rows] of [['Dated evidence', projection.dated], ['Undated evidence', projection.undated]]) {
      const heading = document.createElement('h3'); heading.textContent = title; content.append(heading);
      if (!rows.length) content.append(paragraph('No matching records collected; history is incomplete.'));
      const list = document.createElement('ul');
      for (const row of rows) {
        const item = document.createElement('li');
        item.append(paragraph(`${row.time ?? 'Source time unknown'} · ${row.kind} · ${row.detail}`));
        const detail = document.createElement('details'), label = document.createElement('summary'); label.textContent = 'Event provenance';
        detail.append(label, paragraph(`Source ID: ${row.identity ?? 'unknown'} · Attempt: ${row.attempt ?? 'unknown'} · Revision: ${row.revision ?? 'unknown'} · Observed: ${row.observedAt ?? 'unknown'}`));
        if (row.sourceUrl) detail.append(sourceLink('Inspect history source', row.sourceUrl));
        item.append(detail); list.append(item);
      }
      content.append(list);
    }
  }
  apply.addEventListener('click', render); render(); byId('issue-evidence').prepend(history);
}

async function readControls(target, operation, initialBody = '') {
  controlsStatus('Refreshing shared source facts; previous observations may be stale.');
  const identityGeneration = workspaceSourceIdentityGeneration();
  try {
    const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '/controls',
      { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' });
    if (operation !== revision || current?.key !== target.key) return;
    const data = await response.json().catch(() => null);
    const reason = controlReason(data);
    if ([401, 403, 409].includes(response.status)) {
      if (response.status === 401) updateWorkspaceAccount({ state: 'expired' });
      else if (!validateWorkspaceSourceIdentity(data, current.dataScope, current.actingUserId, identityGeneration)) { clearPrivate(); status('The connected account changed or is no longer available. Refresh to read a new source snapshot.', true); controlsStatus('Actions unavailable. ' + reason); return; }
      clearPrivate(); status('Source authority changed; previous context was removed. ' + reason, true);
      controlsStatus('Actions unavailable. ' + reason);
      return;
    }
    if (!validateWorkspaceSourceIdentity(data, current.dataScope, current.actingUserId, identityGeneration)) { clearPrivate(); status('The connected account changed or is no longer available. Refresh to read a new source snapshot.', true); return; }
    if (!response.ok) {
      controlsStatus('Action checks are unavailable. Previous observations may be stale. ' + reason);
      if (typeof data?.reason === 'string') {
        byId('issue-controls').replaceChildren(paragraph('Source diagnostic: ' + data.reason));
        byId('source-eligibility').open = true;
      }
      return;
    }
    if (!data) throw Error('Shared source facts unavailable');
    if (!data.dataScope || data.dataScope !== current.dataScope) { clearPrivate(); status('The connected account changed. Refresh to read a new source snapshot.', true); return; }
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
    current.actingUserId = data.actingUserId;
    if (typeof facts.actor.login === 'string' && facts.actor.login.trim()) {
      if (!projectWorkspaceSourceIdentity({ state: 'linked', login: facts.actor.login.trim(), userId: facts.actor.id, dataScope: data.dataScope }, identityGeneration)) {
        clear(); status('The connected GitHub identity changed. Refresh to read a new source snapshot.', true); return;
      }
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
        clearPrivate();
        status('The action is unavailable. Previous source context was cleared. ' + (reason || 'Verify your account and refresh.'), true);
        controlsStatus('Actions unavailable. ' + (reason || 'Verify your account and refresh.'));
      }, '', { submissionAvailable: data.submissionAvailable === true, initialBody: initialBody || readDraft(data.dataScope, data.actingUserId, target.repository, target.number),
        reason: !data.submissionAvailable ? 'Protected command storage is not ready. Sending and recovery are disabled.' : '' });
    if (data.missingReadScopes?.length) area.append(paragraph('Missing or unknown App read scopes: ' + data.missingReadScopes.join(', ')));
  } catch (error) {
    if (error.name !== 'AbortError' && operation === revision && current?.key === target.key)
      controlsStatus('Shared source refresh unavailable. Previous observations may be stale; no current eligibility or question is inferred.');
  }
}
