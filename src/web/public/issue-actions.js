let composerId = 0;

export function renderUnavailableActions(area, reason) {
  renderActions(area, {}, {}, null, () => false, () => {}, '', { submissionAvailable: false, reason });
}

export function renderActions(area, facts, target, scope, live, clear, contextLabel = '', { submissionAvailable = true, reason = '', initialBody = '' } = {}) {
  area.classList.add('source-actions');
  let busy = false, preparation = null;
  const allowed = action => submissionAvailable && facts.actions?.[action]?.eligible === true;
  const message = document.createElement('p'); message.className = 'action-message'; message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite');
  const body = document.createElement('textarea'); body.className = 'lh-textarea'; body.rows = 5; body.maxLength = 12288;
  body.placeholder = 'Write a comment for this issue…'; body.disabled = !allowed('comment') && !allowed('continue');
  body.value = initialBody;
  const field = document.createElement('div'); field.className = 'lh-field';
  const label = document.createElement('label'); label.textContent = 'Your comment or answer'; label.append(body);
  const hint = document.createElement('p'); hint.className = 'lh-hint'; hint.id = 'comment-hint-' + ++composerId;
  hint.textContent = !allowed('comment') && allowed('continue') ? 'Enter an answer for the verified question, then review answer and continue. Ordinary commenting is unavailable.'
    : !allowed('comment') ? (reason ? 'Commenting is unavailable. See the source status above.' : facts.actions?.comment?.reason || 'Commenting is unavailable until source permissions and action checks are confirmed.')
    : 'Publishes a GitHub comment as the connected account. It does not resume work. Review it before sending.';
  body.setAttribute('aria-describedby', hint.id); field.append(label, hint);
  const composer = document.createElement('section'); composer.className = 'comment-composer';
  if (area.id === 'control-actions') { composer.id = 'comment-composer'; composer.tabIndex = -1; }
  const heading = document.createElement(contextLabel ? 'h5' : 'h3'); heading.textContent = 'Add a comment';
  composer.append(heading, field);
  const confirmation = document.createElement('section'); confirmation.setAttribute('aria-label', 'Action confirmation' + (contextLabel ? ' · ' + contextLabel : ''));
  confirmation.className = 'action-confirmation'; confirmation.hidden = true;
  const controls = document.createElement('div'); controls.className = 'mission-workflow-actions';
  const workflowHeading = document.createElement(contextLabel ? 'h5' : 'h3'); workflowHeading.textContent = 'Lighthouse actions'; controls.append(workflowHeading);
  const layout = document.createElement('div'); layout.className = 'mission-action-layout'; layout.append(composer, controls);
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
      if ([401, 403, 409].includes(csrf.status)) { clear(); return; }
      if (!csrf.ok) throw Error('Confirmation token unavailable');
      const token = (await csrf.json()).token;
      if (!live() || typeof token !== 'string') return;
      const response = await fetch('/api/issues/' + target.repository.split('/').map(encodeURIComponent).join('/') + '/' + target.number + '/controls',
        { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-SoFa-Csrf': token }, body: JSON.stringify(value) });
      if (!live()) return;
      const data = await response.json().catch(() => null);
      if ([401, 403, 409].includes(response.status)) { clear(typeof data?.reason === 'string' ? data.reason : undefined); return; }
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
    if (action !== 'comment' && (allowed(action) || !reason && facts.actions?.[action]?.reason)) {
      const help = text(!allowed(action) ? facts.actions[action].reason
        : action === 'continue' ? 'Use your answer above to explicitly resume the verified question under its original grant.' : 'Review a ' + action + ' request before sending it to Lighthouse.');
      help.className = 'lh-hint'; group.append(help);
    }
  }
  button('Recover previous action', () => command({ operation: 'receipt' }), recovery, !submissionAvailable, true);
  area.replaceChildren(layout, message, confirmation, recovery);
}
