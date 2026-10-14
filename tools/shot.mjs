import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

// VARIABLES
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'build', 'www');
const outDir = process.env.SHOT_DIR || join(root, 'build', 'shots');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.ogg': 'audio/ogg' };
const script = process.argv[2] || 'tour';

// FUNCTIONS
function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      try {
        const data = await readFile(join(www, path === '/' ? 'index.html' : path));
        res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
        res.end(data);
      } catch (error) {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, () => resolve(server));
  });
}

async function main() {
  const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
  mkdirSync(outDir, { recursive: true });
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (msg) => { if (!msg.text().includes('404')) logs.push(`[${msg.type()}] ${msg.text()}`); });
  page.on('pageerror', (error) => logs.push(`[pageerror] ${error.stack || error.message}`));
  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForTimeout(2500);
  const shot = async (name) => {
    await page.screenshot({ path: join(outDir, name + '.png') });
    console.log('shot', name);
  };
  const steps = await import(join(root, 'tools', 'shots', script + '.mjs'));
  await steps.run(page, shot);
  console.log(logs.slice(-40).join('\n'));
  await browser.close();
  server.close();
}

// INITIALIZATION
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
