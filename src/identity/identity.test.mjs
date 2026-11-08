import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { assetRoot, shellPreview } from './preview.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
test('canonical mark bytes and every original remain intact', async () => {
  const expected = {
    'lighthouse-icon.svg': '775e7674efa07f17ac02d10d321bbd591813bc4ba0ddc0c9f26f2eb4a1d42903',
    'lighthouse-icon-light.svg': '0be4d7cccc9d753317a9ff1dcb419cbf019dae30e9864f146eb4e4ebadaaa8de',
    '../socialpreview_1.png': '65784f3108c66c9121c7a25e8746087ec72712db4a30fc514bdfe440a67e4f26',
    '../sofa-banner-v2.png': '90ff57db067989b3d511752bcc8cec1e97f4f3efaa332e46fb083a2feb6dbc9d',
    '../sofa-banner-v3.png': '3abd48c7bdd91b05423ca590344d38e51a52a7d6c8461603c21df2dab7ac913d',
    '../sofa-banner-v4.png': 'a9946ba73e78bf3c7d7365e59ce9aa79bda1621c8489df696a10b4efd022d473',
    '../sofa-banner.png': 'e147b7425af67853e1b1d66e690ff2331fb819c6ece9812809c01c961aaa90d0',
    '../sofa-linear-banner.png': 'a1c0e0de37688f6c1fc58bffd84147c2f014b0d14f606e5bdea4e58e0f03f3db',
  };
  for (const [file, digest] of Object.entries(expected)) assert.equal(hash(await readFile(new URL(file, assetRoot))), digest, file);
});

test('raster exports have documented dimensions and ICO contains three PNG sizes', async () => {
  for (const [name, width, height] of [
    ['mark-transparent', 512, 512], ['mark-light-transparent', 512, 512],
    ['favicon-16', 16, 16], ['favicon-32', 32, 32], ['favicon-48', 48, 48],
    ['apple-touch-icon', 180, 180], ['icon-192', 192, 192], ['icon-512', 512, 512],
    ['readme-banner', 1280, 640], ['social-preview', 1200, 630],
  ]) {
    const png = await readFile(new URL(`${name}.png`, assetRoot));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), width, name);
    assert.equal(png.readUInt32BE(20), height, name);
  }
  const ico = await readFile(new URL('favicon.ico', assetRoot));
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry], size);
    const png = await readFile(new URL(`favicon-${size}.png`, assetRoot));
    const offset = ico.readUInt32LE(entry + 12);
    assert.deepEqual(ico.subarray(offset, offset + ico.readUInt32LE(entry + 8)), png);
  }
});

test('candidate copy and composite mark are correct; publication remains unchanged', async () => {
  const shell = await shellPreview();
  assert.match(shell, /Lighthouse Control Center/);
  assert.doesNotMatch(shell, /SoFa|Software factory|Factory operations|FACTORY OVERVIEW/);
  for (const theme of ['dark', 'light']) {
    const svg = await readFile(new URL(`wordmark-${theme}.svg`, assetRoot), 'utf8');
    const encoded = svg.match(/base64,([^\"]+)/)[1];
    const canonical = await readFile(new URL(theme === 'dark' ? 'lighthouse-icon.svg' : 'lighthouse-icon-light.svg', assetRoot));
    assert.deepEqual(Buffer.from(encoded, 'base64'), canonical);
  }
  const readme = await readFile(new URL('../../README.md', import.meta.url), 'utf8');
  assert.match(readme, /\]\(assets\/socialpreview_1.png\)/);
  const production = await readFile(new URL('../web/public/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(production, /lighthouse-control-center|identity\.css/);
  const manifest = JSON.parse(await readFile(new URL('site.webmanifest', assetRoot), 'utf8'));
  assert.equal(manifest.name, 'Lighthouse Control Center');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
});
