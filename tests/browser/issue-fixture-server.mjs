// Static assets only. Browser routes provide explicit synthetic source responses.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = new URL('../../src/web/public/', import.meta.url);
const assets = new Map(['workspace-ui.js', 'read-projection-cache.js', 'lighthouse.svg', 'account.css', 'account.js', 'attention.html', 'attention.js', 'attention-controls.js', 'runtime.html', 'runtime.js', 'runtime.css', 'factory.html', 'factory.js', 'factory.css', 'issue.html', 'issue.js', 'issue-actions.js', 'markdown.js', 'app.css', 'issue.css'].map(file => ['/' + file, new URL(file, root)]));
assets.set('/tokens.css', require.resolve('@juangcarmona/lighthouse-ui/tokens.css'));
createServer(async (request, response) => {
  const path = request.url.split('?')[0];
  const file = path === '/workspace/attention' ? new URL('attention.html', root) : path === '/workspace/factory' || path === '/workspace/issues' || path.startsWith('/workspace/repositories') ? new URL('factory.html', root) : path.startsWith('/workspace/issues/') ? new URL('issue.html', root) : assets.get(path);
  if (request.method !== 'GET' || !file) { response.writeHead(404); response.end(); return; }
  const extension = String(file).split('.').at(-1);
  response.writeHead(200, { 'Content-Type': extension === 'html' ? 'text/html' : extension === 'js' ? 'text/javascript' : extension === 'svg' ? 'image/svg+xml' : 'text/css',
    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'", 'Cache-Control': 'no-store' });
  response.end(await readFile(file));
}).listen(Number(process.env.SOFA_ISSUE_FIXTURE_PORT || '5171'), '127.0.0.1');
