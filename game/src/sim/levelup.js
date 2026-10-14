import { weapons as weaponDefs, passives as passiveDefs, maxSlots, maxWeaponLevel, maxPassiveLevel } from '../data/items.js';

// FUNCTIONS
function pairedWeaponOwned(world, passiveId) {
  return world.weapons.some((w) => !w.evolved && weaponDefs[w.id].pair === passiveId);
}

function candidates(world, includeNew) {
  const list = [];
  for (const w of world.weapons) {
    if (!w.evolved && w.level < maxWeaponLevel && !world.banished.has(w.id)) list.push({ type: 'weapon', id: w.id, level: w.level + 1, weight: 1.3 });
  }
  for (const p of world.passives) {
    if (p.level < maxPassiveLevel && !world.banished.has(p.id)) list.push({ type: 'passive', id: p.id, level: p.level + 1, weight: pairedWeaponOwned(world, p.id) ? 1.25 : 0.9 });
  }
  if (includeNew && world.weapons.length < maxSlots) {
    for (const id in weaponDefs) {
      if (world.ownsWeapon(id) || world.banished.has(id) || !world.isUnlocked(id)) continue;
      list.push({ type: 'weapon', id, level: 1, weight: world.weapons.length < 3 ? 1.1 : 0.7 });
    }
  }
  if (includeNew && world.passives.length < maxSlots) {
    for (const id in passiveDefs) {
      if (world.ownsPassive(id) || world.banished.has(id) || !world.isUnlocked(id)) continue;
      list.push({ type: 'passive', id, level: 1, weight: pairedWeaponOwned(world, id) ? 1.0 : 0.6 });
    }
  }
  return list;
}

export function rollChoices(world) {
  const pool = candidates(world, true);
  const extraChance = Math.min(0.5, (world.stats.luck - 1) * 0.6);
  const count = world.rng.next() < extraChance ? 4 : 3;
  const picks = [];
  while (picks.length < count && pool.length > 0) {
    const choice = world.rng.weighted(pool, (c) => c.weight);
    picks.push(choice);
    pool.splice(pool.indexOf(choice), 1);
  }
  if (picks.length === 0) {
    picks.push({ type: 'heal', id: 'fish' });
    picks.push({ type: 'gold', id: 'coin', amount: 10 + world.zoneIndex * 10 });
  }
  return picks;
}

export function applyChoice(world, choice) {
  if (!choice) return;
  if (choice.type === 'weapon') {
    const owned = world.weapons.find((w) => w.id === choice.id);
    if (owned) owned.level = Math.min(maxWeaponLevel, owned.level + 1);
    else world.addWeapon(choice.id);
  } else if (choice.type === 'passive') {
    const owned = world.passives.find((p) => p.id === choice.id);
    if (owned) {
      owned.level = Math.min(maxPassiveLevel, owned.level + 1);
      world.refreshStats();
    } else {
      world.addPassive(choice.id);
    }
  } else if (choice.type === 'heal') {
    world.healPlayer(world.player.maxHp * 0.3);
  } else if (choice.type === 'gold') {
    world.gold += choice.amount;
  } else if (choice.type === 'evolution') {
    const weapon = world.weapons.find((w) => w.id === choice.id);
    if (weapon) world.evolveWeapon(weapon);
  }
  world.emit('choice', choice);
}

export function evolutionCandidates(world) {
  const list = [];
  for (const w of world.weapons) {
    if (w.evolved || w.level < maxWeaponLevel) continue;
    const def = weaponDefs[w.id];
    if (world.ownsPassive(def.pair)) list.push({ type: 'evolution', id: w.id, evolution: def.evolution });
  }
  return list;
}

export function rollChestContents(world, kind) {
  const luck = world.stats.luck;
  let count = 1;
  const roll = world.rng.next();
  if (kind === 'boss') count = roll < 0.12 * luck ? 5 : 3;
  else if (roll < 0.04 * luck) count = 5;
  else if (roll < 0.22 * luck) count = 3;
  const items = [];
  const evolutions = world.zoneIndex >= 1 ? evolutionCandidates(world) : [];
  const maxEvolutions = 1;
  for (const evo of evolutions) {
    if (items.length >= Math.min(count, maxEvolutions)) break;
    items.push(evo);
  }
  const simulated = new Map();
  for (const w of world.weapons) simulated.set('w:' + w.id, w.evolved ? 99 : w.level);
  for (const p of world.passives) simulated.set('p:' + p.id, p.level);
  for (const evo of items) simulated.set('w:' + evo.id, 99);
  while (items.length < count) {
    const pool = [];
    for (const w of world.weapons) {
      const level = simulated.get('w:' + w.id);
      if (level < maxWeaponLevel) pool.push({ type: 'weapon', id: w.id, level: level + 1, weight: 1.3 });
    }
    for (const p of world.passives) {
      const level = simulated.get('p:' + p.id);
      if (level < maxPassiveLevel) pool.push({ type: 'passive', id: p.id, level: level + 1, weight: 1 });
    }
    if (pool.length === 0) break;
    const pick = world.rng.weighted(pool, (c) => c.weight);
    simulated.set((pick.type === 'weapon' ? 'w:' : 'p:') + pick.id, pick.level);
    items.push(pick);
  }
  const gold = Math.round((kind === 'boss' ? 15 : 6) * (1 + world.zoneIndex * 0.4) * (1 + world.rng.next()));
  if (items.length === 0) items.push({ type: 'gold', id: 'coin', amount: gold * 2 });
  return { kind, items, gold };
}

export function applyChest(world, contents) {
  for (const item of contents.items) applyChoice(world, item);
  world.gold += Math.round(contents.gold * world.stats.greed);
}
