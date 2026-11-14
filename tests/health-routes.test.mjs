import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('health page routes reuse the authenticated module and configured repository boundary', async () => {
  const source = await readFile(new URL('../src/SoFa.Modules.Workspace/WorkspaceModule.cs', import.meta.url), 'utf8');
  for (const route of ['/workspace/health', '/workspace/health/{owner}/{repository}', '/workspace/health/{owner}/{repository}/runs/{run:long}']) assert.ok(source.includes('"' + route + '"'));
  const health = source.slice(source.indexOf('foreach (var route in new[] { "/workspace/health"'), source.indexOf('app.MapGet("/workspace/runtime"'));
  assert.match(health, /settings.Repositories.Contains/); assert.match(health, /sessions.Get\(context.User\)/); assert.match(health, /health.html/);
});
