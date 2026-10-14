import { passives } from '../data/items.js';
import { characters, upgrades } from '../data/meta.js';

// VARIABLES
const baseHp = 100;
const baseSpeed = 62;
const baseMagnet = 30;
const percentStats = { maxHp: true, moveSpeed: true, magnet: true };

// FUNCTIONS
export function computeStats(world) {
  const stats = {
    maxHp: 0, regen: 0, armor: 0, moveSpeed: 0, magnet: 0, might: 1, area: 1, cooldown: 1, projSpeed: 1, duration: 1,
    amount: 0, luck: 1, growth: 1, greed: 1, crit: 0.05, critMult: 2, revives: 0, rerolls: 0, skips: 0, banishes: 0,
  };
  const add = (stat, value) => {
    stats[stat] = (stats[stat] || 0) + value;
  };
  const character = characters[world.characterId];
  if (character) for (const key in character.bonus) add(key, character.bonus[key]);
  for (const id in world.meta) {
    const level = world.meta[id];
    const upgrade = upgrades[id];
    if (upgrade && level > 0) add(upgrade.stat, upgrade.per * level);
  }
  for (const item of world.passives) {
    const def = passives[item.id];
    add(def.stat, def.per * item.level);
    if (item.id === 'sharkTooth') add('critMult', 0.1 * item.level);
  }
  for (const key in world.bonus) add(key, world.bonus[key]);
  stats.maxHp = Math.round(baseHp * (1 + stats.maxHp));
  stats.moveSpeed = baseSpeed * (1 + stats.moveSpeed);
  stats.magnet = baseMagnet * (1 + stats.magnet);
  stats.cooldown = Math.max(0.4, stats.cooldown);
  stats.armor = Math.min(0.7, Math.max(0, stats.armor));
  stats.crit = Math.min(0.9, stats.crit);
  for (const key in percentStats) stats[key] = Math.max(1, stats[key]);
  return stats;
}

export function xpForLevel(level) {
  const l = level - 1;
  return Math.round(5 + l * 7 + l * l * 0.8);
}
