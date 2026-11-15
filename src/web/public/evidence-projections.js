// Read-only projections. No transport, persistence or lifecycle inference belongs here.
const date = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
const id = value => Number.isSafeInteger(value) && value > 0 ? value : null;
export function evidenceLink(value, repository) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com' && !url.port && !url.username && !url.password
      && url.pathname.toLowerCase().startsWith('/' + repository.toLowerCase() + '/') ? url.href : null;
  } catch { return null; }
}
export function issueHistory(input, previous = [], window = {}) {
  const repository = input.repository;
  const scope = { repository, repositoryId: id(input.repositoryId), issueId: id(input.issueId), number: input.number };
  const rows = [];
  function add(kind, identity, time, sourceUrl, detail, revision = null, attempt = null) {
    rows.push({ ...scope, kind, identity, time: date(time), sourceUrl: evidenceLink(sourceUrl, repository),
      detail, revision, attempt: id(attempt), observedAt: date(input.observedAt) });
  }
  for (const report of (input.reports ?? []).slice(0, 10)) {
    if (report.runId) add('workflow execution', id(report.runId), report.runStartedAt,
      `https://github.com/${repository}/actions/runs/${report.runId}`,
      `${report.executionStatus ?? 'unknown'} / ${report.executionConclusion ?? 'unknown'}; jobs not collected; accepted delivery unknown`, report.runRevision, report.attempt);
    const limitations = [...(report.missingEvidence ?? []), ...(report.pendingReview ?? [])].slice(0, 60).join('; ');
    add('stage report', id(report.commentId), report.reportCreatedAt, report.sourceUrl,
      (report.availability === 'available' ? `${report.stage ?? 'unknown'} / ${report.result ?? 'unknown'}` : `Unverified result: ${report.reason ?? 'unavailable'}`)
      + (limitations ? ` · Missing evidence / pending review: ${limitations}` : ''), report.sourceRevision, report.attempt);
    if (report.availability === 'available' && report.question) add('source question', id(report.commentId), report.reportCreatedAt,
      report.sourceUrl, `${report.question} · Resolution and protected approval unknown`, report.sourceRevision, report.attempt);
  }
  for (const pull of (input.pullRequests ?? []).slice(0, 10)) {
    add('PR created', id(pull.number), pull.createdAt, pull.sourceUrl, `PR #${pull.number} · ${pull.state ?? 'unknown'}; accepted delivery unknown`, pull.headRevision);
    if (pull.mergedAt) add('PR merged', id(pull.number), pull.mergedAt, pull.sourceUrl, 'Merge observed; accepted delivery unknown', pull.mergeRevision);
    for (const check of (pull.checks ?? []).slice(0, 100)) add('head check', id(check.id), check.completedAt ?? check.startedAt,
      check.sourceUrl, `${check.name}: ${check.status ?? 'unknown'} / ${check.conclusion ?? 'unknown'}`, pull.headRevision);
    for (const review of (pull.reviews ?? []).slice(0, 20)) add('PR review', id(review.id), review.submittedAt, review.sourceUrl,
      `${review.actor ?? 'unknown actor'} (${review.actorType ?? 'unknown type'}): ${review.state ?? 'unknown'} · Protected human approval unknown`, review.commitId);
  }
  const sameScope = row => row.repository === repository && row.number === input.number && row.issueId === scope.issueId && row.repositoryId === scope.repositoryId;
  // Unknown IDs never authorize a cross-name join. Original repository bindings stay intact.
  const retained = previous.filter(sameScope);
  const seen = new Set(), events = [];
  let size = 0, omitted = 0;
  for (const row of [...retained, ...rows]) {
    const { observedAt: _, ...version } = row;
    const key = row.identity === null ? null : JSON.stringify(version);
    if (key && seen.has(key)) continue;
    const bytes = new TextEncoder().encode(JSON.stringify(row)).length;
    if (events.length >= 1000 || size + bytes > 1024 * 1024) { omitted++; continue; }
    if (key) seen.add(key);
    size += bytes; events.push(row);
  }
  const start = date(window.start), end = date(window.end);
  const dated = events.filter(row => row.time && (!start || row.time >= start) && (!end || row.time <= end))
    .sort((a, b) => a.time.localeCompare(b.time) || JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return { events, dated, undated: events.filter(row => !row.time), omitted,
    start: start ?? dated[0]?.time ?? null, end: end ?? dated.at(-1)?.time ?? null,
    gaps: 'Queued, running, human-wait and PR-wait durations unknown: versioned interval endpoints unavailable. Label/event history uncollected. Reviews partial or unavailable. Intervention totals, denominator and autonomy rates unavailable. A completed run is not accepted delivery.' };
}

export function adoptionFacts(receipt) {
  const fields = [['CLI declaration', 'declaredCli', 'package.json'], ['CLI lock resolution', 'lockedCli', 'package-lock.json'],
    ['SDLC declaration', 'sdlcVersion', '.lighthouse/sdlc.json'], ['Workflow / harness reference', 'workflowRef', '.github/workflows/lighthouse-sdlc-unattended.yml']];
  return { facts: fields.map(([component, key, path]) => ({ component, category: 'declared', value: receipt?.[key] ?? 'unknown',
    path, revision: receipt?.revision ?? null, observedAt: receipt?.collectedAt ?? null })),
  installed: 'unknown — no installation receipt', policy: 'unknown — no current-policy receipt',
  baseline: 'No compatible baseline available; no drift verdict', observedRun: 'unknown — inspect an exactly associated issue run' };
}
