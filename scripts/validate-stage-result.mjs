// Tokenless, offline adapter to the installed shared contract. Never executes source text.
import { validateStageEnvelope } from '@juangcarmona/lighthouse-sdlc/host-contract';
const chunks = []; let length = 0;
try {
  for await (const chunk of process.stdin) {
    length += chunk.length;
    if (length > 2 * 1024 * 1024 + 1024) throw Error('Bound exceeded');
    chunks.push(chunk);
  }
  const { request, envelope } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  process.stdout.write(JSON.stringify({ valid: validateStageEnvelope(envelope, request).length === 0 }));
} catch { process.stdout.write('{"valid":false}'); }
