import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zones, bosses } from '../game/src/data/zones.js';
import { enemies, elites, enemyShots } from '../game/src/data/enemies.js';
import { weapons, evolutions, passives } from '../game/src/data/items.js';
import { characters, upgrades, blessings } from '../game/src/data/meta.js';

// VARIABLES
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const atlas = JSON.parse(readFileSync(join(root, 'build', 'www', 'atlas.json'), 'utf8'));
const names = new Set(Object.keys(atlas.frames));
const wanted = new Map();

// FUNCTIONS
function want(name, from) {
  if (!wanted.has(name)) wanted.set(name, from);
}

function exists(name) {
  return names.has(name) || names.has(name + '_0');
}

function sourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (path.endsWith('.js')) out.push(path);
  }
  return out;
}

// INITIALIZATION
for (const zone of zones) {
  zone.ground.forEach((n) => want(n, 'zone ground'));
  zone.decor.forEach((n) => want(n, 'zone decor'));
  want(zone.prop, 'zone prop');
}
for (const def of Object.values(enemies)) if (def.sprite !== 'prop_pot') want(def.sprite, 'enemy');
for (const def of Object.values(elites)) want(def.sprite, 'elite');
for (const def of Object.values(bosses)) want(def.sprite, 'boss');
for (const def of Object.values(enemyShots)) want(def.sprite, 'shot');
for (const def of Object.values(weapons)) want(def.icon, 'weapon icon');
for (const def of Object.values(evolutions)) want(def.icon, 'evolution icon');
for (const def of Object.values(passives)) want(def.icon, 'passive icon');
for (const def of Object.values(characters)) want(def.sprite, 'character');
for (const def of Object.values(upgrades)) want(def.icon, 'upgrade icon');
for (const def of Object.values(blessings)) want(def.icon, 'blessing icon');
for (const file of sourceFiles(join(root, 'game', 'src'))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/(?:frame|anim|icon|animatedIcon)\(\s*'([a-z][a-zA-Z0-9_]+)'/g)) want(match[1], file.replace(root + '/', ''));
  for (const match of text.matchAll(/'((?:pk|ic|fx|pj|sh|ar|font)_[a-zA-Z0-9_]+)'/g)) want(match[1], file.replace(root + '/', ''));
}
for (let i = 0; i < 4; i++) want('pk_gem_' + i, 'gem tiers');
for (let i = 0; i < 10; i++) want('font_' + i, 'digits');
const missing = [...wanted.entries()].filter(([name]) => !name.endsWith('_') && !exists(name));
const dynamic = ['pk_magnet', 'pk_bomb', 'pk_clock', 'pk_fish'];
const unused = [...names].filter((n) => !/_\d+$/.test(n) && !wanted.has(n) && !dynamic.includes(n) && !/^(circle|ring|glow|shadow|zone|px|missing|zonerect)/.test(n));
console.log(`checked ${wanted.size} sprite references, ${missing.length} missing`);
for (const [name, from] of missing) console.log('  MISSING', name, '<-', from);
if (unused.length) console.log('unused frames:', unused.join(' '));
process.exitCode = missing.length ? 1 : 0;
