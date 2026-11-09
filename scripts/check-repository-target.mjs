import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const { repository } = JSON.parse(readFileSync(new URL('../.lighthouse/github.json', import.meta.url), 'utf8'));
const requested = process.argv[2];

try {
  if (process.argv.length !== 3 || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)
    || requested !== repository) {
    throw Error('Target does not match this checkout.');
  }
  const observed = JSON.parse(execFileSync('gh', ['api', '--hostname', 'github.com',
    `repos/${requested}`, '--jq', '{repository: .full_name, repositoryId: .id}'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }));
  if (observed.repository !== repository || !Number.isSafeInteger(observed.repositoryId)
    || observed.repositoryId <= 0) throw Error('Repository identity was not confirmed.');
  console.log(JSON.stringify(observed));
} catch {
  console.error(`Repository target unverified. Expected ${repository}; no write is authorized by this check.`);
  process.exitCode = 1;
}
