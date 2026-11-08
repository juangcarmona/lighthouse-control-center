import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { assetRoot, startPreview } from './preview.mjs';

for (const theme of ['dark', 'light']) {
  const mark = await readFile(new URL(theme === 'dark' ? 'lighthouse-icon.svg' : 'lighthouse-icon-light.svg', assetRoot));
  const color = theme === 'dark' ? '#f8faff' : '#0d0f17';
  const muted = theme === 'dark' ? '#aab6c9' : '#26344b';
  await writeFile(new URL(`wordmark-${theme}.svg`, assetRoot), `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="128" viewBox="0 0 600 128" role="img" aria-labelledby="title"><title id="title">Lighthouse Control Center</title><image width="128" height="128" href="data:image/svg+xml;base64,${mark.toString('base64')}"/><g font-family="system-ui, sans-serif"><text x="152" y="61" fill="${color}" font-size="44" font-weight="750" letter-spacing="-1">Lighthouse</text><text x="154" y="100" fill="${muted}" font-size="27">Control Center</text></g></svg>\n`);
}

const preview = await startPreview();
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const outputs = [
    ['lighthouse-icon.svg', 'mark-transparent.png', 512, 512],
    ['lighthouse-icon-light.svg', 'mark-light-transparent.png', 512, 512],
    ['lighthouse-icon.svg', 'favicon-16.png', 16, 16],
    ['lighthouse-icon.svg', 'favicon-32.png', 32, 32],
    ['lighthouse-icon.svg', 'favicon-48.png', 48, 48],
    ['lighthouse-icon.svg', 'apple-touch-icon.png', 180, 180],
    ['lighthouse-icon.svg', 'icon-192.png', 192, 192],
    ['lighthouse-icon.svg', 'icon-512.png', 512, 512],
    ['bench-banner.svg', 'readme-banner.png', 1280, 640],
    ['bench-banner.svg', 'social-preview.png', 1200, 630],
  ];
  for (const [source, output, width, height] of outputs) {
    await page.setViewportSize({ width, height });
    await page.goto(preview.origin);
    await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:${width}px;height:${height}px;object-fit:cover}</style><img src="${preview.origin}/assets/${source}" alt="">`);
    await page.locator('img').evaluate(image => image.decode());
    await page.screenshot({ path: new URL(output, assetRoot).pathname, omitBackground: true });
    console.log(`${output}: ${width}x${height} from ${source}`);
  }
  // ICO directory with lossless PNG payloads: retain full canonical geometry.
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(size => readFile(new URL(`favicon-${size}.png`, assetRoot))));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((size, index) => {
    const entry = 6 + index * 16;
    header[entry] = size; header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(pngs[index].length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += pngs[index].length;
  });
  await writeFile(new URL('favicon.ico', assetRoot), Buffer.concat([header, ...pngs]));
} finally { await browser.close(); await preview.close(); }
