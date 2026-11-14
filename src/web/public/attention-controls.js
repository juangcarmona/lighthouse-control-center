import { renderActions } from './issue-actions.js';
const text = value => { const element = document.createElement('p'); element.textContent = value; return element; };

export async function inspectAttention(area, entry, scope, live, clear) {
  area.replaceChildren(text('Verifying the current source question and supported actions…'));
  try {
    const response = await fetch('/api/issues/' + entry.repository.split('/').map(encodeURIComponent).join('/') + '/' + entry.issue.number + '/controls',
      { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(25000) });
    if (!live()) return;
    if ([401, 403, 409].includes(response.status)) { clear(); return; }
    const data = await response.json();
    if (!live()) return;
    if (!response.ok) throw Error('The current source question is unavailable. Collected labels do not establish a current wait.');
    if (data.dataScope !== scope) { clear(); return; }
    if (data.availability !== 'available') { area.replaceChildren(text('Source controls: ' + (data.availability ?? 'unavailable') + '. ' + (data.reason ?? 'No question is inferred.'))); return; }
    const facts = data.facts;
    if (!facts || facts.actor?.id !== data.actingUserId || facts.issue?.id !== entry.issue.id || facts.issue?.number !== entry.issue.number
        || facts.repository?.name?.toLowerCase() !== entry.repository.toLowerCase()) throw Error('The collected issue identity changed. Refresh the collection.');
    const heading = document.createElement('h4'); heading.tabIndex = -1; heading.textContent = 'Verified source context';
    area.replaceChildren(heading, text('Observed: ' + data.observedAt + ' · Acting GitHub user ID ' + data.actingUserId));
    const question = facts.question;
    if (question?.availability === 'available') {
      area.append(text(question.current === true ? 'Verified current question' : 'This source question is not current for the observed inputs or wait.'),
        text(question.text), text('Question source updated: ' + (question.sourceUpdatedAt ?? 'unknown')));
      if (Number.isSafeInteger(question.commentId) && question.commentId > 0) {
        const link = document.createElement('a'); link.href = 'https://github.com/' + entry.repository + '/issues/' + entry.issue.number + '#issuecomment-' + question.commentId;
        link.textContent = 'Inspect source question'; link.rel = 'noreferrer noopener'; area.append(link);
      }
    } else area.append(text('Current question: ' + (question?.availability ?? 'unavailable') + '. ' + (question?.reason ?? 'No current question has been verified.')));
    area.append(text('Reservation: ' + (facts.reservation?.availability ?? 'unavailable') + '. ' + (facts.reservation?.reason ?? facts.reservation?.coverage ?? 'Coverage unknown.')));
    for (const [action, label] of [['comment', 'Ordinary comment'], ['continue', 'Continue'], ['refine', 'Refine'], ['propose', 'Propose']]) {
      const value = facts.actions?.[action];
      area.append(text(label + ': ' + (value?.eligible === true ? 'eligible' : value?.availability ?? 'unavailable') + (value?.reason ? ' · ' + value.reason : '')));
    }
    if (data.submissionAvailable) {
      const actions = document.createElement('div'); area.append(actions);
      renderActions(actions, facts, { repository: entry.repository, number: entry.issue.number }, scope, live, clear, entry.repository + '#' + entry.issue.number + ' · ' + entry.label);
    } else area.append(text('Actions cannot be submitted from this application right now. The source issue remains available.'));
    heading.focus();
  } catch (error) {
    if (live()) area.replaceChildren(text(error.message || 'Current source context is unavailable.'));
  }
}
