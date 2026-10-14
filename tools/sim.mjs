import { World } from '../game/src/sim/world.js';
import { Bot } from '../game/src/sim/bot.js';
import { applyChest } from '../game/src/sim/levelup.js';
import { rollBlessings, applyBlessing, campHeal } from '../game/src/sim/camp.js';

// VARIABLES
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));

// FUNCTIONS
export function simulateRun(options) {
  const world = new World({ seed: options.seed, characterId: options.characterId || 'bigode', difficulty: options.difficulty || 0, meta: options.meta || {}, unlocked: options.unlocked || [], viewW: 216, viewH: 480 });
  const bot = new Bot(world, options.skill ?? 0.7, options.seed);
  const dt = options.dt || 1 / 30;
  const log = [];
  let steps = 0;
  const zoneTimes = [];
  let zoneStart = 0;
  while (!world.result && steps < 60 * 60 * 30) {
    bot.update(dt);
    world.update(dt);
    steps++;
    while (world.pendingLevelUps > 0) {
      const options = world.levelUpChoices();
      world.chooseLevelUp(bot.choose(options));
    }
    while (world.pendingChests.length > 0) {
      const kind = world.pendingChests.shift();
      const contents = world.openChest(kind);
      applyChest(world, contents);
      if (kind === 'boss') world.completeZone();
    }
    for (const event of world.events.splice(0)) {
      if (event.type === 'zoneClear') {
        zoneTimes.push(world.time - zoneStart);
        log.push({ zone: event.zone, time: Math.round(world.time), boss: Math.round(world.lastBossTime || 0), level: world.player.level, hp: world.player.hp, kills: world.kills, weapons: world.weapons.map((w) => w.id + (w.evolved ? '*' : w.level)).join(' '), passives: world.passives.map((p) => p.id + p.level).join(' ') });
        campHeal(world);
        applyBlessing(world, bot.chooseBlessing(rollBlessings(world)));
        world.advanceZone();
        zoneStart = world.time;
      }
    }
  }
  const r = world.result || { victory: false, zoneReached: world.zoneIndex, time: world.time, kills: world.kills, level: world.player.level, gold: world.gold, goldFinal: world.gold };
  return { ...r, stats: world.statsTrack, log, zoneTimes, bossHpLeft: world.boss ? world.boss.hp / world.boss.maxHp : null, phase: world.phase, zoneTime: world.zoneTime, sources: world.statsTrack.damageBySource, xpCollected: world.statsTrack.xpCollected || 0, xpDropped: world.statsTrack.xpDropped || 0, weaponsNow: world.weapons.map((w) => w.id + (w.evolved ? '*' : w.level)).join(' ') };
}

// INITIALIZATION
if (import.meta.url === `file://${process.argv[1]}`) {
  const runs = Number(args.runs || 1);
  const started = Date.now();
  for (let i = 0; i < runs; i++) {
    const result = simulateRun({ seed: Number(args.seed || 1) + i, skill: Number(args.skill || 0.7), characterId: args.char || 'bigode' });
    console.log(`run ${i}: ${result.victory ? 'WIN' : 'died'} zone=${result.zoneReached + 1} phase=${result.phase} zoneTime=${result.zoneTime.toFixed(0)} time=${(result.time / 60).toFixed(1)}m kills=${result.kills} lvl=${result.level} gold=${result.gold} bossHp=${result.bossHpLeft === null ? '-' : result.bossHpLeft.toFixed(2)}`);
    for (const entry of result.log) console.log('   ', JSON.stringify(entry));
    console.log('    end:', result.weaponsNow, 'xp', Math.round(result.xpCollected), '/', Math.round(result.xpDropped), JSON.stringify(result.sources));
  }
  console.log(`elapsed ${(Date.now() - started) / 1000}s`);
}
