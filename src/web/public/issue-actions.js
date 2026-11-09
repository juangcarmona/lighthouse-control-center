import { updateWorkspaceAccount } from './workspace-ui.js';
let composerId = 0;

export function renderUnavailableActions(area, reason) {
  renderActions(area, {}, {}, null, () => false, () => {}, '', { submissionAvailable: false, reason });
}

export function renderActions(area, facts, target, scope, live, clear, contextLabel = '', { submissionAvailable = true, reason = '', initialBody = '' } = {}) {
  area.classList.add('source-actions');
  let busy = false, preparation = null;
  const allowed = action => submissionAvailable && facts.actions?.[action]?.eligible === true;
  const actionReasons = {
    'write-authority-denied': 'The connected GitHub user or GitHub App installation lacks issue-write permission. Check the connected account and repository access, then refresh.',
    'write-authority-unavailable': 'Issue-write permission could not be verified for the connected GitHub user and App installation. Check the connection and repository access, then refresh.',
    'installed-contract-unsupported': 'This repository does not expose a supported Lighthouse issue-control contract at its current revision.',
    'stage-contract-unsupported': 'The installed Lighthouse contract does not support this action for the repository.',
    'policy-unavailable': 'The repository automation policy could not be verified, so this action is unavailable.',
    'automation-disabled': 'Repository automation is disabled, so this Lighthouse action is unavailable.',
    'authenticated-source-reservation': 'A source-confirmed action is already active for this issue. Review its source result before requesting another.',
    'pending-question-not-verified': 'A current source question could not be verified, so Continue is unavailable.',
    'pending-question-inputs-unavailable': 'The inputs needed to verify the current question are unavailable.',
    'pending-question-inputs-changed': 'The issue or source question changed. Refresh before continuing.',
    'source-wait-not-current': 'The source no longer shows this question as the current wait.',
    'reservation-evidence-unavailable': 'Current source activity could not be verified. Refresh later; no new action can be prepared safely.',
  };
  const explain = value => actionReasons[value] ?? (typeof value === 'string' ? value.replaceAll('-', ' ') : 'The source did not confirm this action. Refresh the issue and review current source checks.');
  const message = document.createElement('p'); message.className = 'action-message'; message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite');
  const body = document.createElement('textarea'); body.className = 'lh-textarea'; body.rows = 5; body.maxLength = 12288;
  body.placeholder = 'Write a comment for this issue…';
  body.value = initialBody;
  const field = document.createElement('div'); field.className = 'lh-field';
  const label = document.createElement('label'); label.textContent = 'Your comment or answer'; label.append(body);
  const hint = document.createElement('p'); hint.className = 'lh-hint'; hint.id = 'comment-hint-' + ++composerId;
  const commentEligible = facts.actions?.comment?.eligible === true;
  hint.textContent = commentEligible
    ? submissionAvailable ? 'Publishes a GitHub comment as the connected account. It does not resume work. Review it before sending.'
      : 'The source permits ordinary comments, but protected command storage is unavailable. You can keep a draft here; sending and recovery are disabled.'
    : allowed('continue') ? 'Enter an answer for the verified question, then review answer and continue. Ordinary commenting is unavailable.'
      : explain(facts.actions?.comment?.reason || reason || 'write-authority-unavailable');
  if (!commentEligible && (!facts.actions?.comment || ['write-authority-denied', 'write-authority-unavailable'].includes(facts.actions.comment.reason))) {
    const link = document.createElement('a'); link.href = '/workspace'; link.textContent = 'Review connected account'; hint.append(' ', link);
  }
  body.setAttribute('aria-describedby', hint.id); field.append(label, hint);
  const composer = document.createElement('section'); composer.className = 'comment-composer';
  if (area.id === 'control-actions') { composer.id = 'comment-composer'; composer.tabIndex = -1; }
  const heading = document.createElement(contextLabel ? 'h5' : 'h3'); heading.textContent = 'Add a comment';
  composer.append(heading, field);
  const confirmation = document.createElement('section'); confirmation.setAttribute('aria-label', 'Action confirmation' + (contextLabel ? ' · ' + contextLabel : ''));
  confirmation.className = 'action-confirmation'; confirmation.hidden = true;
  const controls = document.createElement('div'); controls.className = 'mission-workflow-actions';
  const workflowHeading = document.createElement(contextLabel ? 'h5' : 'h3'); workflowHeading.textContent = 'Lighthouse actions'; controls.append(workflowHeading);
  const layout = document.createElement('div'); layout.className = 'mission-action-layout';
  const recovery = document.createElement('div'); recovery.className = 'action-recovery';
  const buttons = new Map();
  const text = value => { const p = document.createElement('p'); p.textContent = value; return p; };
  function button(name, action, parent = controls, disabled = false, secondary = false) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'lh-button'; b.textContent = name; b.disabled = disabled;
    if (secondary) b.dataset.variant = 'secondary';
    b.addEventListener('click', action); parent.append(b); buttons.set(b, disabled); return b;
  }
  function display(data) {
    preparation = data; confirmation.replaceChildren(); confirmation.hidden = !data.id;
    if (!data.id) { message.textContent = 'No previous action was found in this source scope.'; return; }
    const action = data.intent?.action;
    const heading = document.createElement(contextLabel ? 'h5' : 'h3'); heading.textContent = data.journalState === 'prepared' ? 'Review before sending' : 'Action result'; confirmation.append(heading);
    confirmation.append(text('Destination: ' + target.repository + ' #' + target.number));
    const progress = data.journalState === 'prepared' ? 'Ready for your confirmation.'
      : action === 'comment' && data.receipt?.state === 'comment-published' ? 'GitHub confirmed that the comment was published.'
        : data.receipt ? 'A source receipt was observed. Review its details; the result may still be unconfirmed.'
          : 'Request recorded. Reconcile to check its source result.';
    confirmation.append(text('Action: ' + ({ comment: 'Ordinary comment', continue: 'Continue', refine: 'Refine', propose: 'Propose' }[action] ?? 'unknown')),
      text(progress));
    const details = document.createElement('details'), summary = document.createElement('summary'); summary.textContent = 'Request details';
    details.append(summary, text('Confirmation ID: ' + data.id), text('Journal: ' + data.journalState));
    if (data.intent?.body) confirmation.append(text(data.intent.body));
    if (data.effect?.kind === 'comment') confirmation.append(text(data.intent?.action === 'continue'
      ? 'Publishes an explicit Continue answer for the verified question under its original grant. Source acknowledgement is checked separately.'
      : 'Publishes an ordinary comment. It does not resume work. The new input can make an earlier result stale.'));
    else confirmation.append(text('Requests ' + data.intent?.action + ' for this issue in GitHub. Admission, worker execution and stage outcome are verified separately.'));
    if (data.receipt) {
            const states = { 'comment-published': 'Comment published.', submitted: 'Request sent. Source admission is unconfirmed.',
        'source-admitted': 'Source admitted the request.', 'source-alias': 'Source reused an existing request.',
        'equivalent-observed': 'An equivalent source request was found. Admission is unconfirmed.', unknown: 'Source result is not yet confirmed.',
        rejected: 'The source declined this request.', conflict: 'The source reports a conflict.' };
      confirmation.append(text(states[data.receipt.state] ?? 'Source result is unavailable.'), text('Receipt observed: ' + (data.receiptObservedAt ?? 'unknown')));
      details.append(text('Source receipt: ' + data.receipt.state), text(data.receipt.reason ?? ''));
      if (action !== 'comment') confirmation.append(text('Source admission: ' + (data.receipt.sourceAcknowledged === true ? 'confirmed' : 'unconfirmed')));
      if (action === 'continue') confirmation.append(text('Question resolved: ' + (data.receipt.questionResolved === true ? 'yes' : 'unconfirmed')));
      if (data.receipt.execution) confirmation.append(text('Execution: ' + (data.receipt.execution.availability ?? 'unknown')
        + ' · Worker: ' + (data.receipt.execution.workerRunId ?? 'unconfirmed') + ' · Stage result: ' + (data.receipt.execution.result ?? 'unconfirmed')
        + ' · ' + (data.receipt.execution.reason ?? '')));
      if (typeof data.receipt.source === 'string' && data.receipt.source.startsWith('https://github.com/' + target.repository + '/')) {
        const link = document.createElement('a'); link.href = data.receipt.source; link.textContent = 'Inspect source receipt'; link.rel = 'noreferrer noopener'; confirmation.append(link);
      }
    }
    confirmation.append(details);
    if (data.journalState === 'prepared') button('Confirm and send', () => command({ operation: 'submit', id: preparation.id }), confirmation);
    button('Reconcile source result', () => command({ operation: 'reconcile', id: preparation.id }), confirmation);
  }
  async function command(value) {
    if (!submissionAvailable || busy || !live() || value.operation === 'prepare' && !allowed(value.action)) return;
    if (value.operation === 'submit' && preparation) display({ ...preparation, journalState: 'uncertain' });
    busy = true; for (const b of buttons.keys()) b.disabled = true;
    message.textContent = value.operation === 'submit' ? 'Sending the prepared action once…' : 'Verifying source and confirmation…';
    try {
      const csrf = await fetch('/api/controls/csrf', { credentials: 'same-origin', cache: 'no-store' });
      if ([401, 403, 409].includes(csrf.status)) { if (csrf.status === 401) updateWorkspaceAccount({ state: 'expired' }); clear(); return; }
      if (!csrf.ok) throw Error('Confirmation token unavailable');
      const token = (await csrf.json()).token;
      if (!live() || typeof token !== 'string') return;
      const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '/controls',
        { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-SoFa-Csrf': token }, body: JSON.stringify(value) });
      if (!live()) return;
      const data = await response.json().catch(() => null);
      if ([401, 403, 409].includes(response.status)) {
      if (response.status === 401) updateWorkspaceAccount({ state: 'expired' }); clear(typeof data?.reason === 'string' ? data.reason : undefined); return; }
      if (!data) throw Error('Source result is uncertain. Recover and reconcile the existing action; do not prepare a replacement.');
      if (!response.ok || data.availability !== 'available') throw Error(data.reason ?? 'Source result is uncertain. Recover and reconcile the existing action; do not prepare a replacement.');
      if (data.dataScope !== scope || data.actingUserId !== facts.actor.id) { clear(); return; }
      message.textContent = 'Observed: ' + data.observedAt + '. A submitted request does not prove completed work.';
      display(data);
    } catch (error) { if (live()) message.textContent = error.message + ' No automatic resend was attempted.'; }
    finally { busy = false; for (const [b, disabled] of buttons) b.disabled = disabled; }
  }
  for (const [action, name] of [['comment', 'Review comment'], ['refine', 'Review Refine'], ['propose', 'Review Propose'], ['continue', 'Review answer and continue']]) {
    const group = document.createElement('div'); group.className = 'workflow-action';
    (action === 'comment' ? composer : controls).append(group);
    button(name, () => {
      if (['comment', 'continue'].includes(action) && !body.value.trim()) { message.textContent = 'Enter your comment or answer first.'; body.focus(); return; }
      void command({ operation: 'prepare', action, body: ['comment', 'continue'].includes(action) ? body.value : '' });
    }, group, !allowed(action), action !== 'comment');
    if (action !== 'comment' && allowed(action)) {
      const help = text(action === 'continue' ? 'Use your answer above to explicitly resume the verified question under its original grant.' : 'Review a ' + action + ' request before sending it to Lighthouse.');
      help.className = 'lh-hint'; group.append(help);
    }
  }
  const actionLabels = { refine: 'Refine', propose: 'Propose', continue: 'Continue' }, restrictions = new Map();
  for (const action of Object.keys(actionLabels)) {
    const code = facts.actions?.[action]?.reason;
    if (!allowed(action) && code) restrictions.set(code, [...(restrictions.get(code) ?? []), actionLabels[action]]);
  }
  for (const [code, names] of restrictions) {
    const help = text(names.join(', ') + ' unavailable: ' + explain(code));
    help.className = 'lh-hint'; controls.append(help);
  }
  button('Recover previous action', () => command({ operation: 'receipt' }), recovery, !submissionAvailable, true);
  layout.append(controls);
  area.replaceChildren(layout, message, confirmation, recovery);
  const slot = document.getElementById('comment-composer-slot');
  if (slot && area.id === 'control-actions') slot.replaceChildren(composer);
  else layout.prepend(composer);
}
