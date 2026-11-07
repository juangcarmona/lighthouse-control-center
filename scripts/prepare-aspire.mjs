import { spawnSync } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the project-pinned native CLI, including SDKs without the DNX fallback.
// Keep both extraction and validation under the same isolated Aspire home.
export async function prepareAspire(environment = process.env) {
  const root = resolve(import.meta.dirname, '..');
  const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (process.platform !== 'linux' || process.arch !== 'x64') throw Error('The verified development host requires Linux x64.');
  const version = manifest.devDependencies['@microsoft/aspire-cli-linux-x64'];
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw Error('Pin the Aspire CLI to the AppHost SDK version.');
  const home = join(root, 'node_modules', '.cache', 'sofa', 'aspire', version);
  const runtimeHome = join(environment.XDG_CACHE_HOME || join(homedir(), '.cache'), 'sofa', 'aspire-runtime', version);
  // Public installer payloads must not compete with NuGet in the SDK capsule's
  // bounded temporary filesystem. Private runtime state remains outside checkout.
  const setup = { PATH: environment.PATH, HOME: environment.HOME || homedir(), ASPIRE_HOME: home,
    ASPIRE_CLI_TELEMETRY_OPTOUT: '1' };
  const configured = { ...environment, ASPIRE_HOME: runtimeHome, ASPIRE_CLI_TELEMETRY_OPTOUT: '1', AspireCliBundlePath: home };
  await mkdir(runtimeHome, { recursive: true, mode: 0o700 });
  await mkdir(home, { recursive: true });
  const entrypoint = join(root, 'node_modules/@microsoft/aspire-cli-linux-x64/bin/aspire');
  const selected = spawnSync(entrypoint, ['--version'], { cwd: root, env: setup, encoding: 'utf8', timeout: 30000 });
  if (selected.status !== 0 || !selected.stdout.trim().startsWith(version + '+')) throw Error(`The pinned Aspire CLI version check failed (exit ${selected.status ?? 'none'}, signal ${selected.signal ?? 'none'}, code ${selected.error?.code ?? 'none'}).`);
  const result = spawnSync(entrypoint, ['setup', '--install-path', home],
    { cwd: root, env: setup, stdio: 'inherit', timeout: 120000 });
  if (result.error || result.status !== 0) throw Error('The pinned Aspire bundle must be prepared before building the workspace.');
  return configured;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await prepareAspire();
