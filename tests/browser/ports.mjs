import { createServer } from 'node:net';

// Choose a free loopback port immediately before Playwright starts its servers.
// Workers inherit the selected value instead of allocating a second endpoint.
export async function testPort(name) {
  let value = process.env[name];
  if (!value) {
    const server = createServer();
    await new Promise((ready, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', ready); });
    value = String(server.address().port);
    await new Promise((done, reject) => server.close(error => error ? reject(error) : done()));
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Choose a valid isolated browser port.');
  process.env[name] = String(port);
  return port;
}
