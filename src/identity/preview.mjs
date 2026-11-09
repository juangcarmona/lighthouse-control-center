import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
export const assetRoot = new URL('../../assets/lighthouse-control-center/', import.meta.url);
const publicRoot = new URL('../web/public/', import.meta.url);

// A local review surface only. No production route, provider or credentials.
export async function shellPreview() {
  const original = await readFile(new URL('index.html', publicRoot), 'utf8');
  return original
    .replace('<title>Lighthouse Control Center · Fleet overview</title>', '<title>Lighthouse Control Center · Preview</title>')
    .replace('<link rel="stylesheet" href="/app.css">', '<link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/identity.css">')
    .replace('<span class="mark" aria-hidden="true">S</span>Lighthouse Control Center<span class="brand-note">Fleet operations</span>', '<img class="identity-mark" src="/assets/lighthouse-icon.svg" alt="" width="40" height="40"><span class="identity-name">Lighthouse<span>Control Center</span></span>')
    .replace('FLEET OVERVIEW', 'REPOSITORY OVERVIEW')
    .replace('Fleet operations', 'Repository operations');
}

const fixture = { repositories: [{ repository: 'example/coastal-project', availability: 'available', observedAt: '2026-11-08T18:00:00Z', runs: [{ id: 1, name: 'Verify repository', status: 'in_progress', runAttempt: 1, event: 'workflow_dispatch', sourceRevision: '1234567', updatedAt: '2026-11-08T17:59:00Z', url: 'https://github.com/example/coastal-project/actions/runs/1' }], attention: [{ number: 2, title: 'Review the identity candidate', labels: ['waiting-review'], updatedAt: '2026-11-08T17:00:00Z', url: 'https://github.com/example/coastal-project/issues/2' }] }] };
const files = new Map([
  ['/app.css', [new URL('app.css', publicRoot), 'text/css']],
  ['/app.js', [new URL('app.js', publicRoot), 'text/javascript']],
  ['/tokens.css', [require.resolve('@juangcarmona/lighthouse-ui/tokens.css'), 'text/css']],
  ['/identity.css', [new URL('./preview.css', import.meta.url), 'text/css']],
]);

export async function startPreview() {
  const server = createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      const path = new URL(req.url, 'http://localhost').pathname;
      let body, type;
      if (path === '/') { body = await readFile(new URL('./review.html', import.meta.url)); type = 'text/html'; }
      else if (path === '/shell') { body = await shellPreview(); type = 'text/html'; }
      else if (path === '/api/observations') { body = JSON.stringify(fixture); type = 'application/json'; }
      else if (files.has(path)) { const [file, mime] = files.get(path); body = await readFile(file); type = mime; }
      else if (/^\/assets\/[a-z0-9-]+\.(svg|png|ico|webmanifest)$/.test(path)) {
        body = await readFile(new URL(path.slice(8), assetRoot));
        type = { svg: 'image/svg+xml', png: 'image/png', ico: 'image/x-icon', webmanifest: 'application/manifest+json' }[path.split('.').at(-1)];
      } else { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const preview = await startPreview();
  console.log(`Unpublished identity review: ${preview.origin}`);
}
