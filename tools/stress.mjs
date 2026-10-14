import { World } from '../game/src/sim/world.js';
import { Bot } from '../game/src/sim/bot.js';
import { applyChest } from '../game/src/sim/levelup.js';
import { weapons, passives } from '../game/src/data/items.js';
import { zones } from '../game/src/data/zones.js';

// VARIABLES
const allUnlocked = [...Object.keys(weapons), ...Object.keys(passives)];

// FUNCTIONS
function makeWorld(seed) {
  return new World({ seed, characterId: 'bigode', unlocked: allUnlocked, viewW: 216, viewH: 480 });
}

function resolve(world, bot) {
  while (world.pendingLevelUps > 0) world.chooseLevelUp(bot.choose(world.levelUpChoices()));
  while (world.pendingChests.length > 0) {
    const kind = world.pendingChests.shift();
    applyChest(world, world.openChest(kind));
    if (kind === 'boss') world.completeZone();
  }
  world.events.length = 0;
}

function checkFinite(world) {
  const bad = [];
  const p = world.player;
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.hp)) bad.push('player');
  for (const e of world.enemies) if (!Number.isFinite(e.x) || !Number.isFinite(e.y) || !Number.isFinite(e.hp)) bad.push('enemy ' + e.type);
  for (const q of world.projectiles) if (!Number.isFinite(q.x) || !Number.isFinite(q.y)) bad.push('projectile ' + q.kind);
  for (const b of world.bullets) if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) bad.push('bullet ' + b.sprite);
  return bad;
}

function weaponTest(id, evolved, zone) {
  const world = makeWorld(7);
  world.weapons.length = 0;
  const weapon = world.addWeapon(id);
  weapon.level = 5;
  if (evolved) world.evolveWeapon(weapon);
  world.options.godMode = true;
  if (zone > 0) world.startZone(zone);
  world.zoneTime = 60;
  const bot = new Bot(world, 0.8, 3);
  const dt = 1 / 30;
  for (let i = 0; i < 30 * 45; i++) {
    bot.update(dt);
    world.update(dt);
    resolve(world, bot);
    const bad = checkFinite(world);
    if (bad.length) return { error: bad.slice(0, 3).join(', ') };
    if (world.weapons.length > 1) world.weapons.length = 1;
  }
  return { damage: Math.round(world.weaponDamage[id] || 0), kills: world.kills, projectiles: world.projectiles.length };
}

function bossTest(zone, levels) {
  const world = makeWorld(11 + zone);
  const bot = new Bot(world, 0.8, 3);
  for (let i = 0; i < levels; i++) {
    world.player.level++;
    world.pendingLevelUps++;
  }
  resolve(world, bot);
  for (const w of world.weapons) if (w.level >= 5 && world.ownsPassive(weapons[w.id].pair)) world.evolveWeapon(w);
  if (zone > 0) world.startZone(zone);
  world.zoneTime = zones[zone].duration - 0.1;
  const dt = 1 / 30;
  let t = 0;
  const hp0 = world.player.hp;
  let taken = 0;
  let lastHp = world.player.hp;
  while (t < 240) {
    bot.update(dt);
    world.update(dt);
    t += dt;
    if (world.player.hp < lastHp) taken += lastHp - world.player.hp;
    lastHp = world.player.hp;
    resolve(world, bot);
    const bad = checkFinite(world);
    if (bad.length) return { error: bad.join(', ') };
    if (world.phase === 'cleared' || world.phase === 'victoryPending' || world.result || world.zoneIndex !== zone) break;
    if (!world.player.alive) break;
  }
  return { zone, sources: world.statsTrack.damageBySource, time: Math.round(t), alive: world.player.alive, taken: Math.round(taken), hpStart: hp0, phase: world.phase, bossLeft: world.boss ? (world.boss.hp / world.boss.maxHp).toFixed(2) : 0, weapons: world.weapons.map((w) => w.id + (w.evolved ? '*' : w.level)).join(' ') };
}

// INITIALIZATION
const mode = process.argv[2] || 'weapons';
if (mode === 'weapons') {
  for (const id of Object.keys(weapons)) {
    for (const evolved of [false, true]) {
      try {
        const result = weaponTest(id, evolved, evolved ? 2 : 0);
        console.log(id.padEnd(10), evolved ? 'evo ' : 'lv5 ', JSON.stringify(result));
      } catch (error) {
        console.log(id.padEnd(10), evolved ? 'evo ' : 'lv5 ', 'EXCEPTION', error.stack.split('\n').slice(0, 4).join(' | '));
      }
    }
  }
} else {
  const levels = [10, 22, 33, 44, 54];
  for (let zone = 0; zone < zones.length; zone++) {
    try {
      console.log(JSON.stringify(bossTest(zone, levels[zone])));
    } catch (error) {
      console.log('zone', zone, 'EXCEPTION', error.stack.split('\n').slice(0, 5).join(' | '));
    }
  }
}
