import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const exec = promisify(execFile);
// Validate the decimal token before JSON's binary floating-point conversion loses evidence.
function exactAttempt(source) {
  if (typeof source !== 'string') return null;
  const [coefficient, exponent = '0'] = source.toLowerCase().split('e');
  const power = Number(exponent);
  if (!Number.isInteger(power) || Math.abs(power) > 2147483647 || coefficient.startsWith('-')) return null;
  const [whole, fraction = ''] = coefficient.split('.');
  const digits = (whole + fraction).replace(/^0+/, '');
  let scale = power - fraction.length;
  if (!digits) return null;
  const significant = digits.replace(/0+$/, '');
  scale += digits.length - significant.length;
  if (scale < 0 || significant.length + scale > 16) return null;
  const value = Number(significant + '0'.repeat(scale));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
export function parseGitHubResponse(json) {
  return JSON.parse(json, (key, value, context) => key === 'run_attempt'
    ? typeof value === 'number' ? exactAttempt(context?.source) : null : value);
}
export async function observeRepositories(repositories, get = async path => parseGitHubResponse((await exec('gh', ['api', path], { timeout: 30000, maxBuffer: 2 * 1024 * 1024 })).stdout)) {
  return Promise.all(repositories.map(async repository => {
    if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repository)) throw Error('Expected owner/repository');
    const observedAt = new Date().toISOString();
    try {
      const [runs, issues] = await Promise.all([get(`repos/${repository}/actions/runs?per_page=20`), get(`repos/${repository}/issues?state=open&per_page=100`)]);
      return { repository, observedAt, availability: 'available', scope: 'Latest 20 workflow runs and first 100 open issue records; not a complete delivery audit', runs: runs.workflow_runs.map(run => ({ id: run.id, name: run.name, status: run.status, conclusion: run.conclusion, sourceRevision: run.head_sha, url: run.html_url, startedAt: run.run_started_at, updatedAt: run.updated_at, runAttempt: Number.isSafeInteger(run.run_attempt) && run.run_attempt > 0 ? run.run_attempt : null, event: typeof run.event === 'string' && run.event.length > 0 && run.event.length <= 256 ? run.event : null })), attention: issues.filter(issue => !issue.pull_request && issue.labels.some(label => ['needs-info', 'agent-working', 'ready', 'waiting-review'].includes(label.name))).map(issue => ({ number: issue.number, title: issue.title, labels: issue.labels.map(label => label.name), url: issue.html_url, updatedAt: issue.updated_at })) };
    } catch { return { repository, observedAt, availability: 'unavailable', reason: 'GitHub evidence could not be collected; no delivery or health conclusion is available' }; }
  }));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repositories = process.argv.slice(2);
  if (!repositories.length) throw Error('Usage: npm run observe -- owner/repository [...]');
  console.log(JSON.stringify(await observeRepositories(repositories), null, 2));
}
