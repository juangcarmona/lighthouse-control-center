export function renderActions(area, facts, target, scope, live, clear) {
  let busy = false, preparation = null;
  const message = document.createElement('p'); message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite');
  const body = document.createElement('textarea'); body.rows = 5; body.maxLength = 12288;
  const label = document.createElement('label'); label.textContent = 'Your comment or answer'; label.append(body);
  const confirmation = document.createElement('section'); confirmation.setAttribute('aria-label', 'Action confirmation');
  const controls = document.createElement('div'); controls.className = 'issue-tools';
  const buttons = [];
  const text = value => { const p = document.createElement('p'); p.textContent = value; return p; };
  function button(name, action, parent = controls) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.addEventListener('click', action); parent.append(b); buttons.push(b); return b;
  }
  function display(data) {
    preparation = data; confirmation.replaceChildren();
    if (!data.id) { message.textContent = 'No previous action was found in this source scope.'; return; }
    confirmation.append(text('Action: ' + (data.intent?.action ?? 'unknown')),
      text('Confirmation ID: ' + data.id), text('Journal: ' + data.journalState));
    if (data.intent?.body) confirmation.append(text(data.intent.body));
    if (data.effect?.kind === 'comment') confirmation.append(text(data.intent?.action === 'continue'
      ? 'Publishes an explicit Continue answer for the verified question under its original grant. Source acknowledgement is checked separately.'
      : 'Publishes an ordinary comment. It does not resume work. The new input can make an earlier result stale.'));
    else confirmation.append(text('Requests ' + data.intent?.action + ' for this issue in GitHub. Admission, worker execution and stage outcome are verified separately.'));
    if (data.receipt) {
      confirmation.append(text('Source receipt: ' + data.receipt.state), text(data.receipt.reason ?? ''),
        text('Source acknowledged: ' + (data.receipt.sourceAcknowledged === true ? 'yes' : 'unconfirmed')),
        text('Question resolved: ' + (data.receipt.questionResolved === true ? 'yes' : 'unconfirmed')));
      if (data.receipt.execution) confirmation.append(text('Execution: ' + (data.receipt.execution.availability ?? 'unknown')
        + ' · Worker: ' + (data.receipt.execution.workerRunId ?? 'unconfirmed') + ' · Stage result: ' + (data.receipt.execution.result ?? 'unconfirmed')
        + ' · ' + (data.receipt.execution.reason ?? '')));
      if (typeof data.receipt.source === 'string' && data.receipt.source.startsWith('https://github.com/' + target.repository + '/')) {
        const link = document.createElement('a'); link.href = data.receipt.source; link.textContent = 'Inspect source receipt'; link.rel = 'noreferrer noopener'; confirmation.append(link);
      }
    }
    if (data.journalState === 'prepared') button('Confirm and send', () => command({ operation: 'submit', id: preparation.id }), confirmation);
    button('Reconcile source result', () => command({ operation: 'reconcile', id: preparation.id }), confirmation);
  }
  async function command(value) {
    if (busy || !live()) return;
    if (value.operation === 'submit' && preparation) display({ ...preparation, journalState: 'uncertain' });
    busy = true; for (const b of buttons) b.disabled = true;
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
      if ([401, 403, 409].includes(response.status)) { clear(); return; }
      const data = await response.json();
      if (!response.ok || data.availability !== 'available') throw Error(data.reason ?? 'Source result is uncertain. Recover and reconcile the existing action; do not prepare a replacement.');
      if (data.dataScope !== scope || data.actingUserId !== facts.actor.id) { clear(); return; }
      message.textContent = 'Observed: ' + data.observedAt + '. A submitted request does not prove completed work.';
      display(data);
    } catch (error) { if (live()) message.textContent = error.message + ' No automatic resend was attempted.'; }
    finally { busy = false; for (const b of buttons) b.disabled = false; }
  }
  for (const [action, name] of [['comment', 'Prepare ordinary comment'], ['refine', 'Prepare Refine'], ['propose', 'Prepare Propose'], ['continue', 'Prepare Continue']]) {
    if (facts.actions?.[action]?.eligible !== true) continue;
    button(name, () => {
      if (['comment', 'continue'].includes(action) && !body.value.trim()) { message.textContent = 'Enter your comment or answer first.'; body.focus(); return; }
      void command({ operation: 'prepare', action, body: ['comment', 'continue'].includes(action) ? body.value : '' });
    });
  }
  button('Recover previous action', () => command({ operation: 'receipt' }));
  area.replaceChildren(label, controls, message, confirmation);
}
