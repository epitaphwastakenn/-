import { blessings } from '../data/meta.js';
import { xpForLevel } from './stats.js';

// FUNCTIONS
export function rollBlessings(world) {
  const ids = Object.keys(blessings);
  world.rng.shuffle(ids);
  return ids.slice(0, 3);
}

export function campHeal(world) {
  world.healPlayer(world.player.maxHp * 0.4);
}

export function applyBlessing(world, id) {
  const p = world.player;
  switch (id) {
    case 'feast':
      world.healPlayer(p.maxHp);
      break;
    case 'training':
      for (let i = 0; i < 2; i++) {
        p.level++;
        p.xpNext = xpForLevel(p.level);
        world.pendingLevelUps++;
      }
      break;
    case 'strength':
      world.bonus.might = (world.bonus.might || 0) + 0.12;
      break;
    case 'toughness':
      world.bonus.maxHp = (world.bonus.maxHp || 0) + 0.15;
      world.refreshStats();
      world.healPlayer(p.maxHp * 0.3);
      break;
    case 'swiftness':
      world.bonus.moveSpeed = (world.bonus.moveSpeed || 0) + 0.1;
      break;
    case 'treasure':
      world.gold += Math.round((40 + world.zoneIndex * 35) * world.stats.greed);
      break;
    case 'fortune':
      world.bonus.luck = (world.bonus.luck || 0) + 0.2;
      break;
    case 'focus':
      world.bonus.cooldown = (world.bonus.cooldown || 0) - 0.06;
      break;
    case 'chest':
      world.pendingChests.push('elite');
      break;
    case 'rerolls':
      world.rerolls += 2;
      break;
    default:
      break;
  }
  world.refreshStats();
}
