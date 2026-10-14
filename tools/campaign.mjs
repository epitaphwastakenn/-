import { simulateRun } from './sim.mjs';
import { upgrades, blueprintCosts, achievements, characters } from '../game/src/data/meta.js';
import { weapons, passives } from '../game/src/data/items.js';

// VARIABLES
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v === undefined ? true : v];
}));
const priority = ['vitality', 'might', 'recovery', 'armor', 'greed', 'cooldown', 'magnet', 'area', 'growth', 'agility', 'luck', 'crit', 'revival', 'duration', 'projSpeed', 'reroll', 'amount', 'banish', 'skip'];
const menuOverhead = 1.2;

// FUNCTIONS
function newSave() {
  return {
    gold: 0, meta: {}, unlocked: [], blueprints: [], characters: ['bigode'], achievements: {},
    stats: { runs: 0, wins: 0, kills: 0, goldEarned: 0, bestTime: 0, bestLevel: 0, bossKills: {}, evolved: {}, fishEaten: 0, flawlessZones: 0 },
    difficultyBeaten: -1,
  };
}

function shop(save) {
  let bought = true;
  while (bought) {
    bought = false;
    let best = null;
    let bestScore = Infinity;
    for (const [index, id] of priority.entries()) {
      const level = save.meta[id] || 0;
      const cost = upgrades[id].costs[level];
      if (cost === undefined) continue;
      const score = cost * (1 + index * 0.08);
      if (score < bestScore) {
        bestScore = score;
        best = { id, cost };
      }
    }
    for (const id of save.blueprints) {
      const cost = blueprintCosts[id] || 200;
      const score = cost * 1.1;
      if (score < bestScore) {
        bestScore = score;
        best = { id, cost, blueprint: true };
      }
    }
    if (best && save.gold >= best.cost) {
      save.gold -= best.cost;
      if (best.blueprint) {
        save.blueprints = save.blueprints.filter((b) => b !== best.id);
        save.unlocked.push(best.id);
      } else {
        save.meta[best.id] = (save.meta[best.id] || 0) + 1;
      }
      bought = true;
    }
  }
}

function applyResult(save, result) {
  save.gold += result.goldFinal;
  save.stats.runs++;
  if (result.victory) save.stats.wins++;
  save.stats.kills += result.kills;
  save.stats.goldEarned += result.goldFinal;
  save.stats.bestTime = Math.max(save.stats.bestTime, result.time);
  save.stats.bestLevel = Math.max(save.stats.bestLevel, result.level);
  for (const id in result.stats.bossKills) save.stats.bossKills[id] = (save.stats.bossKills[id] || 0) + result.stats.bossKills[id];
  for (const id in result.stats.evolved) save.stats.evolved[id] = true;
  save.stats.fishEaten += result.stats.fishEaten;
  save.stats.flawlessZones += result.stats.flawlessZones;
  for (const id of result.blueprints) if (!save.blueprints.includes(id) && !save.unlocked.includes(id)) save.blueprints.push(id);
  for (const ach of achievements) {
    if (save.achievements[ach.id] || !ach.check(save)) continue;
    save.achievements[ach.id] = true;
    save.gold += ach.gold;
    for (const id in characters) if (characters[id].unlock === ach.id && !save.characters.includes(id)) save.characters.push(id);
  }
}

function campaign(seed, skill, maxRuns = 40) {
  const save = newSave();
  let total = 0;
  const runs = [];
  for (let run = 0; run < maxRuns; run++) {
    const unlocked = [...save.unlocked];
    for (const id of save.characters) if (!unlocked.includes(characters[id].weapon)) unlocked.push(characters[id].weapon);
    const characterId = save.characters[run % save.characters.length];
    const result = simulateRun({ seed: seed * 1000 + run, skill, meta: { ...save.meta }, unlocked, characterId });
    total += result.time;
    applyResult(save, result);
    runs.push(`${result.victory ? 'W' : result.zoneReached + 1}`);
    shop(save);
    if (result.victory) return { won: true, runs: run + 1, minutes: total / 60, path: runs.join(''), spent: save.stats.goldEarned - save.gold, meta: save.meta };
  }
  return { won: false, runs: maxRuns, minutes: total / 60, path: runs.join(''), spent: save.stats.goldEarned - save.gold, meta: save.meta };
}

// INITIALIZATION
const count = Number(args.count || 4);
const skill = Number(args.skill || 0.7);
const results = [];
for (let i = 0; i < count; i++) {
  const r = campaign(Number(args.seed || 1) + i, skill, Number(args.max || 40));
  results.push(r);
  console.log(`campaign ${i}: ${r.won ? 'WON' : 'not won'} after ${r.runs} runs, ${r.minutes.toFixed(0)} min in-run (~${(r.minutes * menuOverhead / 60).toFixed(1)} h) path=${r.path} spent=${r.spent}`);
}
const won = results.filter((r) => r.won);
if (won.length) {
  const mins = won.map((r) => r.minutes).sort((a, b) => a - b);
  console.log(`median ${(mins[Math.floor(mins.length / 2)] * menuOverhead / 60).toFixed(2)} h, range ${(mins[0] * menuOverhead / 60).toFixed(2)}-${(mins[mins.length - 1] * menuOverhead / 60).toFixed(2)} h, won ${won.length}/${results.length}`);
}
