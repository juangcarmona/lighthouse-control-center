import { spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export function parseCoberturaSummary(xml) {
  const root = xml.match(/<coverage\b([^>]*)>/)?.[1];
  if (!root) throw new Error('Cobertura coverage root is missing.');
  const fields = Object.fromEntries([...root.matchAll(/([a-z][a-z-]*)="([^"]*)"/g)].map(([, name, value]) => [name, value]));
  const linesCovered = Number(fields['lines-covered']);
  const linesValid = Number(fields['lines-valid']);
  if (!Number.isSafeInteger(linesCovered) || !Number.isSafeInteger(linesValid) || linesCovered < 0 || linesValid <= 0 || linesCovered > linesValid)
    throw new Error('Cobertura line totals are missing or invalid.');
  return { linesCovered, linesValid, percentage: Math.round((linesCovered / linesValid) * 10000) / 100 };
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  const repositoryId = Number(process.env.GITHUB_REPOSITORY_ID);
  const runId = Number(process.env.GITHUB_RUN_ID);
  const attempt = Number(process.env.GITHUB_RUN_ATTEMPT);
  const testedCommit = process.env.GITHUB_SHA;
  const ref = process.env.GITHUB_REF;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!/^[^/]+\/[^/]+$/.test(repository ?? '') || !Number.isSafeInteger(repositoryId) || repositoryId <= 0
      || !Number.isSafeInteger(runId) || runId <= 0 || !Number.isSafeInteger(attempt) || attempt <= 0
      || !/^[a-f0-9]{40}$/.test(testedCommit ?? '') || !ref || !eventPath)
    throw new Error('GitHub repository, commit, run and attempt identity is incomplete.');

  const output = process.env.COVERAGE_OUTPUT ?? 'test-results/coverage-evidence';
  const raw = join(output, 'raw');
  const test = spawnSync('dotnet', ['test', 'tests/SoFa.Web.Tests/SoFa.Web.Tests.csproj', '--no-restore', '--collect:XPlat Code Coverage', '--settings', 'tests/coverage.runsettings', '--results-directory', raw], { encoding: 'utf8', stdio: 'inherit' });
  if (test.status !== 0) throw new Error('The optional coverage test run did not complete.');
  const reports = [];
  async function find(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await find(path);
      else if (entry.name === 'coverage.cobertura.xml') reports.push(path);
    }
  }
  await find(raw);
  if (reports.length !== 1) throw new Error(`Expected one bounded Cobertura report, found ${reports.length}.`);
  const counts = parseCoberturaSummary(await readFile(reports[0], 'utf8'));
  const event = JSON.parse(await readFile(eventPath, 'utf8'));
  const sourceHeadCommit = event.pull_request?.head?.sha ?? testedCommit;
  if (!/^[a-f0-9]{40}$/.test(sourceHeadCommit)) throw new Error('The source commit is malformed.');
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'coverage.json'), JSON.stringify({
    schemaVersion: 1,
    definitionVersion: 'coverage-lines-v1',
    repository,
    repositoryId,
    ref,
    testedCommit,
    sourceHeadCommit,
    runId,
    attempt,
    workflowPath: '.github/workflows/verify.yml',
    scope: 'SoFa.Web.Tests exercising SoFa.Modules.Workspace and SoFa.Web',
    tool: 'coverlet.collector 6.0.4 / Cobertura',
    generatedAt: new Date().toISOString(),
    ...counts,
  }, null, 2) + '\n', { mode: 0o600 });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
