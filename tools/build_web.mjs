import { build } from 'esbuild';
import { cpSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// VARIABLES
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'build', 'www');
const dev = process.argv.includes('--dev');

// INITIALIZATION
mkdirSync(out, { recursive: true });
await build({
  entryPoints: [join(root, 'game', 'src', 'main.js')],
  bundle: true,
  format: 'iife',
  target: ['chrome70'],
  minify: !dev,
  sourcemap: dev ? 'inline' : false,
  outfile: join(out, 'game.js'),
  legalComments: 'none',
});
copyFileSync(join(root, 'game', 'index.html'), join(out, 'index.html'));
copyFileSync(join(root, 'game', 'style.css'), join(out, 'style.css'));
mkdirSync(join(out, 'fonts'), { recursive: true });
for (const file of ['Jersey10-Regular.ttf', 'PixelifySans.ttf']) copyFileSync(join(root, 'game', 'fonts', file), join(out, 'fonts', file));
if (!existsSync(join(out, 'atlas.png'))) console.warn('atlas missing: run npm run art');
console.log('web build ok' + (dev ? ' (dev)' : ''));
