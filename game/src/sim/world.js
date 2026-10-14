import { Rng } from '../core/rng.js';
import { SpatialGrid } from '../core/grid.js';
import { clamp } from '../core/mathx.js';
import { enemies as enemyDefs, elites as eliteDefs, enemyShots } from '../data/enemies.js';
import { zones, bosses as bossDefs } from '../data/zones.js';
import { weapons as weaponDefs, evolutions, passives as passiveDefs, maxSlots } from '../data/items.js';
import { characters, difficulties } from '../data/meta.js';
import { computeStats, xpForLevel } from './stats.js';
import { updateWeapons, updateProjectiles, makeProjectile, resetWeaponState } from './weapons.js';
import { spawnBoss, updateBoss } from './bosses.js';
import { rollChoices, applyChoice, rollChestContents } from './levelup.js';

// VARIABLES
const maxEnemies = 420;
const maxPickups = 420;
const contactInvulnerability = 0.45;
const noop = () => {};

// FUNCTIONS
function makeEnemy() {
  return {
    id: 0, def: null, type: '', sprite: '', x: 0, y: 0, kx: 0, ky: 0, r: 5, hp: 1, maxHp: 1, speed: 0, dmg: 0, xp: 0,
    mass: 1, armor: 0, flash: 0, slowT: 0, slowAmt: 0, freezeT: 0, bleedT: 0, bleedDps: 0, bleedSlot: -1, animT: 0,
    facing: 1, state: 0, stateT: 0, dirX: 0, dirY: 0, elite: false, boss: false, prop: false, flying: false, scale: 1,
    spawnT: 0, behavior: '', shotT: 0, hitCds: new Float64Array(20), alpha: 1, swarm: false, eliteDef: null,
    bossDef: null, ai: null, hopZ: 0, summonT: 0, propKind: '', noSeparate: false, lastHitSlot: -1, moving: false,
  };
}

function makePickup() {
  return { kind: '', x: 0, y: 0, value: 0, magnet: false, vx: 0, vy: 0, age: 0, tier: 0, bob: 0, dropT: 0, data: null, speedBoost: 0 };
}

function makeBullet() {
  return { def: null, sprite: '', x: 0, y: 0, vx: 0, vy: 0, r: 4, dmg: 0, life: 0, age: 0, slow: 0, rotate: false, homing: 0, accel: 0, split: 0, splitShot: '', animated: false, scale: 1, spin: 0, rot: 0 };
}

function makeHazard() {
  return { kind: '', x: 0, y: 0, r: 0, r2: 0, w: 0, angle: 0, warn: 0, warnMax: 0, life: 0, dmg: 0, done: false, color: 0, grow: 0, thickness: 0, fx: '', age: 0, speed: 0, slow: 0, tickT: 0 };
}

export class World {
  constructor(options) {
    this.options = options;
    this.rng = new Rng(options.seed || (Math.random() * 4294967296) >>> 0);
    this.fx = options.fx || noop;
    this.characterId = options.characterId || 'bigode';
    this.heroSprite = characters[this.characterId].sprite;
    this.difficulty = options.difficulty || 0;
    this.diff = difficulties[this.difficulty];
    this.meta = options.meta || {};
    this.unlocked = new Set(options.unlocked || []);
    this.knownBlueprints = options.knownBlueprints || [];
    this.frozenBonus = 0;
    this.viewW = options.viewW || 270;
    this.viewH = options.viewH || 585;
    this.grid = new SpatialGrid(32, 96, 96);
    this.enemies = [];
    this.enemyPool = [];
    this.projectiles = [];
    this.projectilePool = [];
    this.bullets = [];
    this.bulletPool = [];
    this.pickups = [];
    this.pickupPool = [];
    this.hazards = [];
    this.hazardPool = [];
    this.events = [];
    this.nextEnemyId = 1;
    this.time = 0;
    this.zoneIndex = 0;
    this.zoneTime = 0;
    this.phase = 'waves';
    this.paused = false;
    this.kills = 0;
    this.gold = 0;
    this.blueprints = [];
    this.bonus = {};
    this.weapons = [];
    this.passives = [];
    this.banished = new Set();
    this.input = { x: 0, y: 0 };
    this.boss = null;
    this.arena = null;
    this.spawnAcc = 0;
    this.eventIndex = 0;
    this.freezeAllT = 0;
    this.pendingLevelUps = 0;
    this.pendingChests = [];
    this.zoneDamageTaken = 0;
    this.statsTrack = { damageTaken: 0, fishEaten: 0, flawlessZones: 0, bossKills: {}, evolved: {}, eliteKills: 0, chests: 0 };
    this.weaponDamage = {};
    this.propT = 0;
    this.result = null;
    this.camX = 0;
    this.camY = 0;
    this.shakeT = 0;
    this.player = {
      x: 0, y: 0, hp: 100, maxHp: 100, iframes: 0, facingX: 1, facingY: 0, moveX: 0, moveY: 0, level: 1, xp: 0,
      xpNext: xpForLevel(1), animT: 0, flipX: false, alive: true, moving: false, hurtT: 0, regenAcc: 0, deathT: 0, slowT: 0, slowAmt: 0,
      kx: 0, ky: 0,
    };
    this.stats = computeStats(this);
    const resume = options.resume;
    if (resume) {
      this.loadCheckpoint(resume);
    } else {
      this.rerolls = this.stats.rerolls;
      this.skips = this.stats.skips;
      this.banishes = this.stats.banishes;
      this.revives = this.stats.revives;
      const character = characters[this.characterId];
      this.addWeapon(character.weapon);
      this.refreshStats();
      this.player.hp = this.player.maxHp;
    }
    this.startZone(this.zoneIndex);
  }

  get zone() {
    return zones[this.zoneIndex];
  }

  emit(type, a, b, c, d) {
    this.fx(type, a, b, c, d);
  }

  refreshStats() {
    const oldMax = this.player.maxHp;
    this.stats = computeStats(this);
    this.player.maxHp = this.stats.maxHp;
    if (this.player.maxHp > oldMax) this.player.hp += this.player.maxHp - oldMax;
    this.player.hp = Math.min(this.player.hp, this.player.maxHp);
  }

  addWeapon(id) {
    const weapon = { id, level: 1, evolved: false, t: 0.3, state: {}, slot: this.weapons.length };
    this.weapons.push(weapon);
    resetWeaponState(this, weapon);
    return weapon;
  }

  addPassive(id) {
    this.passives.push({ id, level: 1 });
    this.refreshStats();
  }

  ownsWeapon(id) {
    return this.weapons.some((w) => w.id === id);
  }

  ownsPassive(id) {
    return this.passives.some((p) => p.id === id);
  }

  isUnlocked(id) {
    return this.unlocked.has(id) || (weaponDefs[id] && weaponDefs[id].unlocked) || (passiveDefs[id] && passiveDefs[id].unlocked);
  }

  startZone(index) {
    this.zoneIndex = index;
    this.zoneTime = 0;
    this.phase = 'waves';
    this.eventIndex = 0;
    this.spawnAcc = 0;
    this.eliteSpawned = false;
    this.boss = null;
    this.arena = null;
    this.zoneDamageTaken = 0;
    this.player.x = 0;
    this.player.y = 0;
    this.camX = 0;
    this.camY = 0;
    for (const e of this.enemies) this.enemyPool.push(e);
    this.enemies.length = 0;
    for (const p of this.projectiles) this.projectilePool.push(p);
    this.projectiles.length = 0;
    for (const b of this.bullets) this.bulletPool.push(b);
    this.bullets.length = 0;
    for (const p of this.pickups) this.pickupPool.push(p);
    this.pickups.length = 0;
    for (const h of this.hazards) this.hazardPool.push(h);
    this.hazards.length = 0;
    for (const weapon of this.weapons) resetWeaponState(this, weapon);
    this.propT = 0;
    for (let i = 0; i < 6; i++) this.spawnProp(true);
    this.emit('zoneStart', index);
  }

  update(dt) {
    if (this.paused || this.result) return;
    this.tickPhases(dt);
    if (this.result) return;
    this.time += dt;
    if (this.phase === 'waves') this.zoneTime += dt;
    this.grid.rebuild(this.enemies, this.enemies.length, this.player.x, this.player.y);
    this.updatePlayer(dt);
    if (!this.player.alive) {
      this.player.deathT += dt;
      if (this.player.deathT > 1.6 && !this.result) this.finish(false);
      this.updateEnemies(dt);
      return;
    }
    updateWeapons(this, dt);
    updateProjectiles(this, dt);
    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.updateHazards(dt);
    this.updatePickups(dt);
    this.updateDirector(dt);
    this.updateCamera(dt);
    if (this.freezeAllT > 0) this.freezeAllT -= dt;
    if (this.shakeT > 0) this.shakeT -= dt;
  }

  updateCamera(dt) {
    let targetX = this.player.x;
    let targetY = this.player.y;
    if (this.arena) {
      const a = this.arena;
      const marginX = this.viewW / 2 - 10;
      const marginY = this.viewH / 2 - 60;
      targetX = a.x1 - a.x0 > this.viewW - 20 ? clamp(targetX, a.x0 + marginX, a.x1 - marginX) : (a.x0 + a.x1) / 2;
      targetY = a.y1 - a.y0 > this.viewH - 120 ? clamp(targetY, a.y0 + marginY, a.y1 - marginY) : (a.y0 + a.y1) / 2;
    }
    const k = this.arena ? Math.min(1, dt * 4) : 1;
    this.camX += (targetX - this.camX) * k;
    this.camY += (targetY - this.camY) * k;
  }

  updatePlayer(dt) {
    const p = this.player;
    const s = this.stats;
    if (!p.alive) return;
    let mx = this.input.x;
    let my = this.input.y;
    const length = Math.sqrt(mx * mx + my * my);
    if (length > 1) {
      mx /= length;
      my /= length;
    }
    p.moving = length > 0.08;
    let speed = s.moveSpeed;
    if (p.slowT > 0) {
      p.slowT -= dt;
      speed *= 1 - p.slowAmt;
    }
    if (p.moving) {
      p.x += mx * speed * dt;
      p.y += my * speed * dt;
      const norm = Math.sqrt(mx * mx + my * my) || 1;
      p.facingX = mx / norm;
      p.facingY = my / norm;
      if (Math.abs(mx) > 0.05) p.flipX = mx < 0;
      p.animT += dt * (0.6 + 0.4 * Math.min(1, length));
    }
    if (p.kx !== 0 || p.ky !== 0) {
      p.x += p.kx * dt;
      p.y += p.ky * dt;
      const decay = Math.exp(-8 * dt);
      p.kx *= decay;
      p.ky *= decay;
      if (Math.abs(p.kx) + Math.abs(p.ky) < 2) {
        p.kx = 0;
        p.ky = 0;
      }
    }
    if (this.arena) {
      const a = this.arena;
      p.x = clamp(p.x, a.x0 + 8, a.x1 - 8);
      p.y = clamp(p.y, a.y0 + 10, a.y1 - 6);
    }
    if (p.iframes > 0) p.iframes -= dt;
    if (p.hurtT > 0) p.hurtT -= dt;
    if (s.regen > 0 && p.hp < p.maxHp) {
      p.regenAcc += s.regen * dt;
      if (p.regenAcc >= 1) {
        const amount = Math.floor(p.regenAcc);
        p.regenAcc -= amount;
        p.hp = Math.min(p.maxHp, p.hp + amount);
      }
    }
  }

  damagePlayer(amount, sourceX, sourceY, source = 'unknown') {
    const p = this.player;
    if (!p.alive || p.iframes > 0 || amount <= 0 || this.options.godMode) return false;
    const dealt = Math.max(1, Math.round(amount * (1 - this.stats.armor)));
    const bySource = this.statsTrack.damageBySource || (this.statsTrack.damageBySource = {});
    bySource[source] = (bySource[source] || 0) + dealt;
    const byZone = this.statsTrack.damageByZone || (this.statsTrack.damageByZone = {});
    const key = this.zoneIndex + (this.phase === 'boss' ? 'b' : 'w');
    byZone[key] = (byZone[key] || 0) + dealt;
    this.lastDamageSource = source;
    p.hp -= dealt;
    p.iframes = contactInvulnerability;
    p.hurtT = 0.25;
    this.zoneDamageTaken += dealt;
    this.statsTrack.damageTaken += dealt;
    this.emit('playerHurt', dealt, sourceX, sourceY);
    if (p.hp <= 0) {
      if (this.revives > 0) {
        this.revives--;
        p.hp = Math.round(p.maxHp * 0.5);
        p.iframes = 2.5;
        this.emit('revive');
        this.blast(p.x, p.y, 90, 0, true);
      } else {
        p.hp = 0;
        p.alive = false;
        p.deathT = 0;
        this.emit('playerDeath');
      }
    }
    return true;
  }

  healPlayer(amount) {
    const p = this.player;
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + Math.round(amount));
    if (p.hp > before) this.emit('heal', p.hp - before);
  }

  allocEnemy() {
    if (this.enemies.length >= maxEnemies) return null;
    const enemy = this.enemyPool.pop() || makeEnemy();
    enemy.id = this.nextEnemyId++;
    enemy.hitCds.fill(0);
    enemy.kx = 0;
    enemy.ky = 0;
    enemy.flash = 0;
    enemy.slowT = 0;
    enemy.slowAmt = 0;
    enemy.freezeT = 0;
    enemy.bleedT = 0;
    enemy.bleedDps = 0;
    enemy.state = 0;
    enemy.stateT = 0;
    enemy.elite = false;
    enemy.boss = false;
    enemy.prop = false;
    enemy.swarm = false;
    enemy.scale = 1;
    enemy.alpha = 1;
    enemy.spawnT = 0.35;
    enemy.shotT = 0;
    enemy.eliteDef = null;
    enemy.bossDef = null;
    enemy.ai = null;
    enemy.hopZ = 0;
    enemy.summonT = 0;
    enemy.noSeparate = false;
    enemy.armor = 0;
    enemy.mass = 1;
    enemy.lastHitSlot = -1;
    enemy.animT = this.rng.next() * 2;
    this.enemies.push(enemy);
    return enemy;
  }

  spawnEnemy(type, x, y, options = {}) {
    const def = enemyDefs[type];
    const enemy = this.allocEnemy();
    if (!enemy) return null;
    const zone = this.zone;
    const ramp = 1 + 0.8 * Math.min(1, this.zoneTime / zone.duration);
    enemy.def = def;
    enemy.type = type;
    enemy.sprite = def.sprite;
    enemy.behavior = def.behavior;
    enemy.flying = !!def.flying;
    enemy.x = x;
    enemy.y = y;
    enemy.r = def.radius;
    enemy.maxHp = enemy.hp = Math.max(1, Math.round(def.hp * zone.hp * ramp * this.diff.hp * (options.hpMult || 1)));
    enemy.speed = def.speed * this.diff.speed * (0.92 + this.rng.next() * 0.16);
    enemy.dmg = Math.round(def.dmg * zone.dmg * this.diff.dmg);
    enemy.xp = def.xp;
    enemy.mass = def.mass || 1;
    enemy.armor = def.armor || 0;
    enemy.shotT = 1 + this.rng.next() * (def.fireRate || 2);
    enemy.facing = x < this.player.x ? 1 : -1;
    enemy.noSeparate = def.behavior === 'phase';
    if (options.swarm) {
      enemy.swarm = true;
      enemy.dirX = options.dirX;
      enemy.dirY = options.dirY;
      enemy.speed *= 1.5;
      enemy.noSeparate = true;
    }
    return enemy;
  }

  spawnElite(id) {
    const def = eliteDefs[id];
    const base = enemyDefs[def.base];
    const position = this.edgePoint(30);
    const enemy = this.allocEnemy();
    if (!enemy) return null;
    enemy.def = base;
    enemy.eliteDef = def;
    enemy.type = id;
    enemy.sprite = def.sprite;
    enemy.behavior = def.behavior;
    enemy.elite = true;
    enemy.x = position.x;
    enemy.y = position.y;
    enemy.r = def.radius;
    enemy.maxHp = enemy.hp = Math.round(def.hp * this.diff.eliteHp);
    enemy.speed = def.speed * this.diff.speed;
    enemy.dmg = Math.round(def.dmg * this.diff.dmg);
    enemy.xp = def.xp;
    enemy.mass = def.mass || 6;
    enemy.summonT = 4;
    this.emit('eliteSpawn', enemy);
    return enemy;
  }

  spawnProp(initial) {
    const zone = this.zone;
    let x;
    let y;
    if (initial) {
      const angle = this.rng.angle();
      const distance = 90 + this.rng.next() * 260;
      x = this.player.x + Math.cos(angle) * distance;
      y = this.player.y + Math.sin(angle) * distance;
    } else {
      const point = this.edgePoint(40);
      x = point.x;
      y = point.y;
    }
    const enemy = this.allocEnemy();
    if (!enemy) return;
    enemy.def = enemyDefs.prop;
    enemy.type = 'prop';
    enemy.sprite = zone.prop;
    enemy.behavior = 'prop';
    enemy.prop = true;
    enemy.x = x;
    enemy.y = y;
    enemy.r = 6;
    enemy.hp = enemy.maxHp = 1;
    enemy.speed = 0;
    enemy.dmg = 0;
    enemy.xp = 0;
    enemy.mass = 1000;
    enemy.spawnT = 0;
    enemy.noSeparate = true;
  }

  edgePoint(margin) {
    const halfW = this.viewW / 2 + margin;
    const halfH = this.viewH / 2 + margin;
    const p = this.player;
    const moving = p.moving && this.rng.chance(0.55);
    let side;
    if (moving) {
      if (Math.abs(p.facingX) * halfH > Math.abs(p.facingY) * halfW) side = p.facingX > 0 ? 1 : 3;
      else side = p.facingY > 0 ? 2 : 0;
    } else {
      const roll = this.rng.next() * (halfW + halfH) * 2;
      side = roll < halfW ? 0 : roll < halfW + halfH ? 1 : roll < halfW * 2 + halfH ? 2 : 3;
    }
    const cx = this.camX;
    const cy = this.camY;
    switch (side) {
      case 0: return { x: cx + (this.rng.next() * 2 - 1) * halfW, y: cy - halfH };
      case 1: return { x: cx + halfW, y: cy + (this.rng.next() * 2 - 1) * halfH };
      case 2: return { x: cx + (this.rng.next() * 2 - 1) * halfW, y: cy + halfH };
      default: return { x: cx - halfW, y: cy + (this.rng.next() * 2 - 1) * halfH };
    }
  }

  updateDirector(dt) {
    const zone = this.zone;
    if (this.phase === 'waves') {
      const t = this.zoneTime;
      let segment = zone.segments[zone.segments.length - 1];
      let start = 0;
      for (const s of zone.segments) {
        if (t < s.until) {
          segment = s;
          break;
        }
        start = s.until;
      }
      const progress = clamp((t - start) / Math.max(1, segment.until - start), 0, 1);
      const rate = segment.rate[0] + (segment.rate[1] - segment.rate[0]) * progress;
      this.spawnAcc += rate * dt;
      let living = 0;
      for (const e of this.enemies) if (!e.prop) living++;
      while (this.spawnAcc >= 1) {
        this.spawnAcc -= 1;
        if (living >= segment.cap) {
          this.spawnAcc = 0;
          break;
        }
        const type = this.rng.weighted(Object.keys(segment.spawns), (k) => segment.spawns[k]);
        const point = this.edgePoint(14);
        if (this.spawnEnemy(type, point.x, point.y)) living++;
      }
      while (this.eventIndex < zone.events.length && zone.events[this.eventIndex].at <= t) {
        this.runEvent(zone.events[this.eventIndex]);
        this.eventIndex++;
      }
      if (t >= zone.duration) this.beginBoss();
    }
    this.propT -= dt;
    if (this.propT <= 0) {
      this.propT = 6;
      let props = 0;
      for (const e of this.enemies) if (e.prop) props++;
      if (props < 6 && !this.arena) this.spawnProp(false);
    }
  }

  runEvent(event) {
    const p = this.player;
    if (event.kind === 'elite') {
      this.spawnElite(this.zone.elite);
    } else if (event.kind === 'ring') {
      const rx = this.viewW / 2 + 26;
      const ry = this.viewH / 2 + 26;
      for (let i = 0; i < event.count; i++) {
        const angle = (i / event.count) * Math.PI * 2;
        this.spawnEnemy(event.type, p.x + Math.cos(angle) * rx, p.y + Math.sin(angle) * ry);
      }
      this.emit('waveWarning', 'ring');
    } else if (event.kind === 'swarm') {
      const vertical = this.rng.chance(0.5);
      const sign = this.rng.chance(0.5) ? 1 : -1;
      const dirX = vertical ? 0 : sign;
      const dirY = vertical ? sign : 0;
      const startX = vertical ? p.x : p.x - sign * (this.viewW / 2 + 30);
      const startY = vertical ? p.y - sign * (this.viewH / 2 + 30) : p.y;
      for (let i = 0; i < event.count; i++) {
        const spread = (this.rng.next() - 0.5) * (vertical ? this.viewW * 0.9 : this.viewH * 0.55);
        const back = this.rng.next() * 90;
        const x = startX + (vertical ? spread : -dirX * back);
        const y = startY + (vertical ? -dirY * back : spread);
        this.spawnEnemy(event.type, x, y, { swarm: true, dirX, dirY });
      }
      this.emit('waveWarning', 'swarm');
    }
  }

  beginBoss() {
    this.phase = 'boss';
    const p = this.player;
    const width = Math.max(250, Math.min(this.viewW - 12, 300));
    const height = Math.max(340, Math.min(this.viewH - 120, 430));
    this.arena = { x0: p.x - width / 2, x1: p.x + width / 2, y0: p.y - height / 2 + 10, y1: p.y + height / 2 + 10 };
    for (const e of this.enemies) {
      if (!e.boss) {
        e.hp = 0;
        e.dead = true;
      }
    }
    this.cullDead(true);
    for (const b of this.bullets) this.bulletPool.push(b);
    this.bullets.length = 0;
    this.boss = spawnBoss(this, this.zone.boss);
    this.bossStartTime = this.time;
    this.emit('bossStart', this.boss);
  }

  updateEnemies(dt) {
    const p = this.player;
    const shotRate = this.zone.shotRate || 2;
    this.shotTokens = Math.min(3, (this.shotTokens || 0) + shotRate * dt);
    const list = this.enemies;
    const frozenAll = this.freezeAllT > 0;
    const despawnDistance = Math.max(this.viewW, this.viewH) * 0.85 + 60;
    let touching = 0;
    let toucher = null;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.hp <= 0) continue;
      e.animT += dt;
      if (e.flash > 0) e.flash -= dt;
      if (e.spawnT > 0) e.spawnT -= dt;
      if (e.bleedT > 0) {
        e.bleedT -= dt;
        e.bleedAcc = (e.bleedAcc || 0) + e.bleedDps * dt;
        if (e.bleedAcc >= 1) {
          const amount = Math.floor(e.bleedAcc);
          e.bleedAcc -= amount;
          this.damageEnemy(e, amount, e.bleedSlot, { noCrit: true, noFlash: true, color: 'bleed' });
          if (e.hp <= 0) continue;
        }
      }
      if (e.prop) continue;
      if (e.boss) {
        updateBoss(this, e, dt);
      } else {
        const frozen = e.freezeT > 0 || frozenAll;
        if (e.freezeT > 0) e.freezeT -= dt;
        let slow = 1;
        if (e.slowT > 0) {
          e.slowT -= dt;
          slow = 1 - e.slowAmt;
        }
        if (!frozen) this.moveEnemy(e, dt, slow);
      }
      e.x += e.kx * dt;
      e.y += e.ky * dt;
      const decay = Math.exp(-9 * dt);
      e.kx *= decay;
      e.ky *= decay;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d2 = dx * dx + dy * dy;
      if (!e.boss && !e.elite && d2 > despawnDistance * despawnDistance) {
        if (e.swarm) {
          e.hp = 0;
          e.dead = true;
          e.silent = true;
          continue;
        }
        const point = this.edgePoint(14);
        e.x = point.x;
        e.y = point.y;
        continue;
      }
      const reach = (e.boss ? e.r * 0.8 : e.r) + 5;
      if (p.alive && e.dmg > 0 && d2 < reach * reach && e.spawnT <= 0 && e.freezeT <= 0 && !frozenAll && !(e.ai && (e.ai.airborne || e.ai.invulnerable))) {
        if (e.dmg > touching) {
          touching = e.dmg;
          toucher = e;
        }
      }
      if (this.arena && !e.boss) {
        const a = this.arena;
        e.x = clamp(e.x, a.x0 + 4, a.x1 - 4);
        e.y = clamp(e.y, a.y0 + 4, a.y1 - 4);
      }
    }
    if (touching > 0 && this.damagePlayer(touching, toucher.x, toucher.y, 'contact:' + toucher.type) && (toucher.boss || toucher.elite)) {
      const dx = p.x - toucher.x;
      const dy = p.y - toucher.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      p.kx = (dx / d) * 300;
      p.ky = (dy / d) * 300;
      p.iframes = Math.max(p.iframes, toucher.boss ? 0.75 : 0.55);
    }
    this.separate();
    this.cullDead(false);
  }

  moveEnemy(e, dt, slow) {
    const p = this.player;
    let dx = p.x - e.x;
    let dy = p.y - e.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= d;
    dy /= d;
    let speed = e.speed * slow;
    e.moving = true;
    if (e.swarm) {
      e.x += e.dirX * speed * dt;
      e.y += e.dirY * speed * dt;
      e.facing = e.dirX !== 0 ? e.dirX : e.facing;
      return;
    }
    if (e.elite) this.updateEliteAbility(e, dt, d);
    switch (e.behavior) {
      case 'hop': {
        e.stateT -= dt;
        if (e.state === 0) {
          e.hopZ = 0;
          if (e.stateT <= 0) {
            e.state = 1;
            e.stateT = 0.5;
          }
          speed = 0;
          e.moving = false;
        } else {
          const t = 1 - e.stateT / 0.5;
          e.hopZ = Math.sin(t * Math.PI) * (e.elite ? 10 : 5);
          speed *= 1.9;
          if (e.stateT <= 0) {
            e.state = 0;
            e.stateT = 0.35 + this.rng.next() * 0.15;
            if (e.elite) this.emit('land', e);
          }
        }
        break;
      }
      case 'flutter': {
        const wobble = Math.sin(e.animT * 6 + e.id) * 0.7;
        const nx = dx - dy * wobble;
        const ny = dy + dx * wobble;
        const n = Math.sqrt(nx * nx + ny * ny) || 1;
        dx = nx / n;
        dy = ny / n;
        break;
      }
      case 'dash': {
        e.stateT -= dt;
        if (e.state === 0) {
          if (d < 90 && e.stateT <= 0) {
            e.state = 1;
            e.stateT = e.elite ? 0.55 : 0.65;
            e.dirX = dx;
            e.dirY = dy;
            e.flash = 0.1;
          }
        } else if (e.state === 1) {
          speed = 0;
          e.moving = false;
          if (e.stateT <= 0) {
            e.state = 2;
            e.stateT = 0.42;
          }
        } else if (e.state === 2) {
          dx = e.dirX;
          dy = e.dirY;
          speed = ((e.eliteDef && e.eliteDef.dashSpeed) || e.def.dashSpeed || 150) * this.diff.speed * slow;
          if (e.stateT <= 0) {
            e.state = 3;
            e.stateT = 0.5;
          }
        } else {
          speed *= 0.4;
          if (e.stateT <= 0) {
            e.state = 0;
            e.stateT = 1.2 + this.rng.next();
          }
        }
        break;
      }
      case 'ranged': {
        const range = e.def.range || 100;
        if (d < range * 0.75) {
          const side = (e.id & 1) ? 1 : -1;
          const tx = -dy * side;
          const ty = dx * side;
          dx = tx * 0.6 - dx * 0.4;
          dy = ty * 0.6 - dy * 0.4;
          speed *= 0.6;
        }
        e.shotT -= dt;
        if (e.shotT <= 0 && d < range * 1.25) {
          if (this.shotTokens >= 1) {
            this.shotTokens -= 1;
            e.shotT = e.def.fireRate * (0.85 + this.rng.next() * 0.3);
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            this.fireBullet(e.def.shot, e.x, e.y, angle, e.dmg);
            e.flash = 0.08;
          } else {
            e.shotT = 0.3 + this.rng.next() * 0.6;
          }
        }
        break;
      }
      case 'explode': {
        if (e.state === 0 && d < 18) {
          e.state = 1;
          e.stateT = 0.6;
        }
        if (e.state === 1) {
          speed *= 0.3;
          e.stateT -= dt;
          e.flash = (Math.floor(e.stateT * 12) % 2) * 0.1;
          if (e.stateT <= 0) {
            this.addHazard('blast', e.x, e.y, 26, 0, e.dmg * 1.4, { fx: 'pumpkinBlast' });
            e.hp = 0;
            e.dead = true;
            e.silent = true;
            this.emit('explode', e.x, e.y, 26);
          }
        }
        break;
      }
      case 'phase': {
        e.alpha = 0.55 + 0.35 * Math.sin(e.animT * 3 + e.id);
        break;
      }
      default:
        break;
    }
    if (speed > 0) {
      e.x += dx * speed * dt;
      e.y += dy * speed * dt;
      if (Math.abs(dx) > 0.15) e.facing = dx > 0 ? 1 : -1;
    }
  }

  updateEliteAbility(e, dt, distance) {
    const def = e.eliteDef;
    e.summonT -= dt;
    if (def.summon && e.summonT <= 0) {
      e.summonT = 7;
      for (let i = 0; i < def.summonCount; i++) {
        const angle = (i / def.summonCount) * Math.PI * 2;
        this.spawnEnemy(def.summon, e.x + Math.cos(angle) * 24, e.y + Math.sin(angle) * 24);
      }
      this.emit('summon', e);
    }
    if (def.slam && e.summonT <= 0) {
      e.summonT = 5;
      this.addHazard('ring', e.x, e.y, 10, 0, Math.round(e.dmg * 0.7), { grow: 100, life: 0.9, thickness: 8, fx: 'slam' });
      this.emit('slam', e);
    }
  }

  separate() {
    const list = this.enemies;
    const grid = this.grid;
    const near = this.nearBuffer || (this.nearBuffer = new Array(512));
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.noSeparate || e.hp <= 0 || e.boss) continue;
      const ex = e.x;
      const ey = e.y;
      const er = e.r;
      let pushX = 0;
      let pushY = 0;
      let checks = 0;
      const count = grid.gather(ex, ey, er + 8, near);
      for (let k = 0; k < count && checks < 9; k++) {
        const o = near[k];
        if (o === e || o.noSeparate || o.hp <= 0) continue;
        const dx = ex - o.x;
        const dy = ey - o.y;
        const min = er + o.r - 2;
        const d2 = dx * dx + dy * dy;
        if (d2 < min * min && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const overlap = (min - d) / d;
          const ratio = o.mass / (o.mass + e.mass);
          pushX += dx * overlap * ratio;
          pushY += dy * overlap * ratio;
          checks++;
        }
      }
      e.x += pushX * 0.5;
      e.y += pushY * 0.5;
    }
  }

  damageEnemy(e, amount, slot, options = {}) {
    if (e.hp <= 0) return 0;
    if (e.boss && e.ai && e.ai.invulnerable) return 0;
    let damage = amount;
    let crit = false;
    if (!options.noCrit) {
      const chance = this.stats.crit + (options.critBonus || 0);
      if (this.rng.next() < chance) {
        crit = true;
        damage *= this.stats.critMult;
      }
    }
    if (this.frozenBonus && (e.freezeT > 0 || this.freezeAllT > 0)) damage *= 1 + this.frozenBonus;
    if (e.armor > 0) damage *= 1 - e.armor;
    damage = Math.max(1, Math.round(damage));
    e.hp -= damage;
    if (!options.noFlash) e.flash = 0.12;
    if (options.knockback && !e.boss && !e.prop) {
      const resist = e.elite ? 0.15 : 1 / e.mass;
      let kx = options.kx;
      let ky = options.ky;
      if (kx === undefined) {
        kx = e.x - this.player.x;
        ky = e.y - this.player.y;
      }
      const length = Math.sqrt(kx * kx + ky * ky) || 1;
      e.kx += (kx / length) * options.knockback * resist;
      e.ky += (ky / length) * options.knockback * resist;
    }
    if (slot >= 0) {
      const weapon = this.weapons[slot];
      if (weapon) this.weaponDamage[weapon.id] = (this.weaponDamage[weapon.id] || 0) + damage;
      e.lastHitSlot = slot;
    }
    this.emit('damage', e, damage, crit, options.color);
    if (e.hp <= 0) {
      e.dead = true;
      e.killSlot = slot;
    }
    return damage;
  }

  cullDead(silent) {
    const list = this.enemies;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (e.hp > 0) continue;
      if (e.boss) this.onBossDefeated(e);
      else if (!silent && !e.silent) this.onEnemyDeath(e);
      e.silent = false;
      e.dead = false;
      list[i] = list[list.length - 1];
      list.pop();
      this.enemyPool.push(e);
    }
  }

  onEnemyDeath(e) {
    if (e.prop) {
      this.dropPropLoot(e.x, e.y);
      this.emit('propBreak', e);
      return;
    }
    if (e.boss) return;
    this.kills++;
    const weapon = e.killSlot >= 0 ? this.weapons[e.killSlot] : null;
    if (weapon) {
      weapon.kills = (weapon.kills || 0) + 1;
      if (weapon.evolved && weapon.id === 'catnip') {
        weapon.state.healKills = (weapon.state.healKills || 0) + 1;
        if (weapon.state.healKills >= 8) {
          weapon.state.healKills = 0;
          this.healPlayer(1);
        }
      }
      if (weapon.evolved && weapon.id === 'fireworks' && this.rng.chance(0.1)) this.dropPickup('coin', e.x, e.y, 1);
    }
    this.emit('kill', e);
    const zone = this.zone;
    const xp = e.xp * zone.xp;
    if (e.elite) {
      this.statsTrack.eliteKills++;
      this.dropGemShower(e.x, e.y, xp, 10);
      this.dropPickup('chest', e.x, e.y, 0, 'elite');
      this.dropPickup('coin', e.x + 8, e.y, 5 + this.zoneIndex * 3);
      if (this.rng.chance(0.4)) this.dropBlueprint(e.x - 10, e.y);
      if (e.eliteDef.splitInto) this.splitEnemy(e, e.eliteDef.splitInto, e.eliteDef.splitCount);
      this.emit('eliteDeath', e);
      return;
    }
    this.dropGem(e.x, e.y, xp);
    const def = e.def;
    if (def.splitInto) this.splitEnemy(e, def.splitInto, def.splitCount);
    if (def.deathCloud) this.addHazard('cloud', e.x, e.y, 16, 0, Math.round(e.dmg * 0.4), { life: 1.8, fx: 'spores' });
    const goldChance = 0.025 * this.stats.luck;
    if (this.rng.next() < goldChance) this.dropPickup('coin', e.x, e.y, 1);
    if (this.rng.next() < 0.0015 * this.stats.luck) this.dropPickup('fish', e.x, e.y, 0);
  }

  splitEnemy(e, type, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.rng.next();
      const child = this.spawnEnemy(type, e.x + Math.cos(angle) * 6, e.y + Math.sin(angle) * 6, { hpMult: 0.6 });
      if (child) {
        child.kx = Math.cos(angle) * 80;
        child.ky = Math.sin(angle) * 80;
        child.spawnT = 0.2;
      }
    }
  }

  dropPropLoot(x, y) {
    const roll = this.rng.next();
    if (roll < 0.38) this.dropPickup('coin', x, y, 1 + this.rng.int(0, 2));
    else if (roll < 0.62) this.dropPickup('fish', x, y, 0);
    else if (roll < 0.74) this.dropPickup('magnet', x, y, 0);
    else if (roll < 0.83) this.dropPickup('bomb', x, y, 0);
    else if (roll < 0.91) this.dropPickup('clock', x, y, 0);
    else this.dropGem(x, y, 10 * this.zone.xp);
  }

  dropBlueprint(x, y) {
    const pool = [];
    for (const id in weaponDefs) if (!weaponDefs[id].unlocked && !this.unlocked.has(id) && !this.blueprints.includes(id) && !(this.knownBlueprints || []).includes(id)) pool.push(id);
    for (const id in passiveDefs) if (!passiveDefs[id].unlocked && !this.unlocked.has(id) && !this.blueprints.includes(id) && !(this.knownBlueprints || []).includes(id)) pool.push(id);
    if (pool.length === 0) return false;
    this.dropPickup('blueprint', x, y, 0, this.rng.pick(pool));
    return true;
  }

  allocPickup() {
    const pickup = this.pickupPool.pop() || makePickup();
    pickup.magnet = false;
    pickup.vx = 0;
    pickup.vy = 0;
    pickup.age = 0;
    pickup.data = null;
    pickup.bob = this.rng.next() * 6;
    pickup.dropT = 0;
    pickup.speedBoost = 0;
    this.pickups.push(pickup);
    return pickup;
  }

  dropGem(x, y, value) {
    this.statsTrack.xpDropped = (this.statsTrack.xpDropped || 0) + value;
    let gems = 0;
    for (const p of this.pickups) if (p.kind === 'gem') gems++;
    if (gems > 260) {
      let target = null;
      let best = -1;
      for (const p of this.pickups) {
        if (p.kind !== 'gem' || p.magnet) continue;
        const d = (p.x - this.player.x) ** 2 + (p.y - this.player.y) ** 2;
        if (d > best) {
          best = d;
          target = p;
        }
      }
      if (target) {
        target.value += value;
        target.tier = gemTier(target.value);
        return;
      }
    }
    if (this.pickups.length >= maxPickups) return;
    const pickup = this.allocPickup();
    pickup.kind = 'gem';
    pickup.x = x + (this.rng.next() - 0.5) * 4;
    pickup.y = y + (this.rng.next() - 0.5) * 4;
    pickup.value = value;
    pickup.tier = gemTier(value);
  }

  dropGemShower(x, y, total, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pickup = this.allocPickup();
      pickup.kind = 'gem';
      pickup.x = x;
      pickup.y = y;
      pickup.value = total / count;
      pickup.tier = gemTier(pickup.value);
      pickup.vx = Math.cos(angle) * 70;
      pickup.vy = Math.sin(angle) * 70;
      pickup.dropT = 0.4;
    }
  }

  dropPickup(kind, x, y, value, data) {
    const pickup = this.allocPickup();
    pickup.kind = kind;
    pickup.x = x;
    pickup.y = y;
    pickup.value = value;
    pickup.data = data || null;
    pickup.dropT = 0.3;
    const angle = this.rng.angle();
    pickup.vx = Math.cos(angle) * 30;
    pickup.vy = Math.sin(angle) * 30 - 20;
    return pickup;
  }

  updatePickups(dt) {
    const p = this.player;
    const magnet = this.stats.magnet;
    const list = this.pickups;
    for (let i = list.length - 1; i >= 0; i--) {
      const item = list[i];
      item.age += dt;
      if (item.dropT > 0) {
        item.dropT -= dt;
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.vx *= Math.exp(-6 * dt);
        item.vy *= Math.exp(-6 * dt);
        continue;
      }
      const dx = p.x - item.x;
      const dy = p.y - item.y;
      const d2 = dx * dx + dy * dy;
      const grabRange = item.kind === 'gem' || item.kind === 'coin' ? magnet : 14;
      if (!item.magnet && d2 < grabRange * grabRange) item.magnet = true;
      if (!item.magnet && this.phase === 'cleared' && (item.kind === 'gem' || item.kind === 'coin')) item.magnet = true;
      if (!item.magnet && item.kind === 'chest' && this.phase === 'cleared' && item.age > 1.6) item.magnet = true;
      if (item.magnet) {
        const d = Math.sqrt(d2) || 1;
        const speed = 90 + item.speedBoost;
        item.speedBoost += 420 * dt;
        item.x += (dx / d) * speed * dt;
        item.y += (dy / d) * speed * dt;
        if (d < 8) {
          this.collect(item);
          list[i] = list[list.length - 1];
          list.pop();
          this.pickupPool.push(item);
        }
      } else if (item.kind === 'gem' && d2 > 900 * 900) {
        item.x = p.x + Math.sign(item.x - p.x) * 400;
        item.y = p.y + Math.sign(item.y - p.y) * 400;
      }
    }
  }

  collect(item) {
    switch (item.kind) {
      case 'gem':
        this.statsTrack.xpCollected = (this.statsTrack.xpCollected || 0) + item.value;
        this.gainXp(item.value);
        this.emit('gem', item);
        break;
      case 'coin': {
        const amount = Math.max(1, Math.round(item.value * this.stats.greed));
        this.gold += amount;
        this.emit('coin', amount);
        break;
      }
      case 'fish':
        this.healPlayer(this.player.maxHp * 0.3 * this.diff.heal);
        this.statsTrack.fishEaten++;
        this.emit('fish');
        break;
      case 'magnet':
        for (const other of this.pickups) if (other.kind === 'gem' || other.kind === 'coin') other.magnet = true;
        this.emit('magnet');
        break;
      case 'bomb':
        this.blast(this.player.x, this.player.y, Math.max(this.viewW, this.viewH), 0, true);
        this.emit('bomb');
        break;
      case 'clock':
        this.freezeAllT = 6;
        this.emit('clock');
        break;
      case 'chest':
        this.pendingChests.push(item.data || 'elite');
        this.statsTrack.chests++;
        this.emit('chestPickup', item.data);
        break;
      case 'blueprint':
        if (!this.blueprints.includes(item.data)) this.blueprints.push(item.data);
        this.emit('blueprint', item.data);
        break;
      default:
        break;
    }
  }

  blast(x, y, radius, damage, killNormal) {
    const r2 = radius * radius;
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.prop || e.boss) continue;
      const d2 = (e.x - x) ** 2 + (e.y - y) ** 2;
      if (d2 > r2) continue;
      if (killNormal && !e.elite) this.damageEnemy(e, e.hp + 1, -1, { noCrit: true });
      else if (killNormal && e.elite) this.damageEnemy(e, e.maxHp * 0.1, -1, { noCrit: true });
      else if (damage > 0) this.damageEnemy(e, damage, -1, { noCrit: true });
    }
  }

  gainXp(amount) {
    const p = this.player;
    p.xp += amount * this.stats.growth;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = xpForLevel(p.level);
      this.pendingLevelUps++;
      this.emit('levelUp', p.level);
    }
  }

  fireBullet(shotId, x, y, angle, dmg, options = {}) {
    const def = enemyShots[shotId];
    const bullet = this.bulletPool.pop() || makeBullet();
    const speed = (options.speed || def.speed) * this.diff.speed;
    bullet.def = def;
    bullet.sprite = def.sprite;
    bullet.x = x;
    bullet.y = y;
    bullet.vx = Math.cos(angle) * speed;
    bullet.vy = Math.sin(angle) * speed;
    bullet.r = options.radius || def.radius;
    bullet.dmg = dmg;
    bullet.life = options.life || def.life;
    bullet.age = 0;
    bullet.slow = def.slow || 0;
    bullet.rotate = !!def.rotate;
    bullet.homing = options.homing || 0;
    bullet.accel = options.accel || 0;
    bullet.split = options.split || 0;
    bullet.splitShot = options.splitShot || '';
    bullet.animated = !!def.animated;
    bullet.scale = options.scale || 1;
    bullet.spin = options.spin || 0;
    bullet.rot = angle;
    this.bullets.push(bullet);
    return bullet;
  }

  updateBullets(dt) {
    const p = this.player;
    const list = this.bullets;
    const frozen = this.freezeAllT > 0;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.age += dt;
      if (!frozen) {
        if (b.homing > 0) {
          const angle = Math.atan2(b.vy, b.vx);
          const target = Math.atan2(p.y - b.y, p.x - b.x);
          let diff = target - angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const turn = Math.max(-b.homing * dt, Math.min(b.homing * dt, diff));
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          b.vx = Math.cos(angle + turn) * speed;
          b.vy = Math.sin(angle + turn) * speed;
        }
        if (b.accel !== 0) {
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1;
          const next = Math.max(10, speed + b.accel * dt);
          b.vx *= next / speed;
          b.vy *= next / speed;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot = b.spin ? b.rot + b.spin * dt : Math.atan2(b.vy, b.vx);
      }
      let remove = b.age >= b.life;
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const reach = b.r + 4;
      if (!remove && p.alive && dx * dx + dy * dy < reach * reach) {
        if (this.damagePlayer(b.dmg, b.x, b.y, 'bullet:' + b.sprite) && b.slow > 0) {
          p.slowT = 1.5;
          p.slowAmt = b.slow;
        }
        remove = true;
      }
      if (remove) {
        if (b.split > 0) {
          for (let k = 0; k < b.split; k++) {
            const angle = (k / b.split) * Math.PI * 2;
            this.fireBullet(b.splitShot || 'snowball', b.x, b.y, angle, Math.round(b.dmg * 0.6));
          }
          this.emit('bulletSplit', b.x, b.y);
        }
        list[i] = list[list.length - 1];
        list.pop();
        this.bulletPool.push(b);
      }
    }
  }

  addHazard(kind, x, y, r, warn, dmg, options = {}) {
    const h = this.hazardPool.pop() || makeHazard();
    h.kind = kind;
    h.x = x;
    h.y = y;
    h.r = r;
    h.r2 = options.r2 || 0;
    h.w = options.w || 0;
    h.angle = options.angle || 0;
    h.warn = warn;
    h.warnMax = warn;
    h.life = options.life || 0.25;
    h.dmg = dmg;
    h.done = false;
    h.grow = options.grow || 0;
    h.thickness = options.thickness || 8;
    h.fx = options.fx || '';
    h.age = 0;
    h.speed = options.speed || 0;
    h.slow = options.slow || 0;
    h.tickT = 0;
    this.hazards.push(h);
    return h;
  }

  updateHazards(dt) {
    const p = this.player;
    const list = this.hazards;
    for (let i = list.length - 1; i >= 0; i--) {
      const h = list[i];
      h.age += dt;
      if (h.warn > 0) {
        h.warn -= dt;
        if (h.warn <= 0) this.emit('hazardTrigger', h);
        continue;
      }
      h.life -= dt;
      const dx = p.x - h.x;
      const dy = p.y - h.y;
      let hit = false;
      if (h.kind === 'blast' || h.kind === 'circle') {
        hit = !h.done && dx * dx + dy * dy < (h.r + 4) * (h.r + 4);
        if (hit) h.done = true;
      } else if (h.kind === 'cloud') {
        h.tickT -= dt;
        if (h.tickT <= 0 && dx * dx + dy * dy < (h.r + 3) * (h.r + 3)) {
          hit = true;
          h.tickT = 0.5;
        }
      } else if (h.kind === 'ring') {
        h.r += h.grow * dt;
        const d = Math.sqrt(dx * dx + dy * dy);
        hit = !h.done && Math.abs(d - h.r) < h.thickness / 2 + 4;
        if (hit) h.done = true;
      } else if (h.kind === 'line') {
        const cos = Math.cos(h.angle);
        const sin = Math.sin(h.angle);
        const along = dx * cos + dy * sin;
        const across = -dx * sin + dy * cos;
        hit = !h.done && along > 0 && along < h.r && Math.abs(across) < h.w / 2 + 4;
        if (hit) h.done = true;
      } else if (h.kind === 'cone') {
        const d = Math.sqrt(dx * dx + dy * dy);
        let diff = Math.atan2(dy, dx) - h.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        hit = !h.done && d < h.r && Math.abs(diff) < h.w;
        if (hit) h.done = true;
      }
      if (hit) this.damagePlayer(h.dmg, h.x, h.y, 'hazard:' + h.kind + ':' + h.fx);
      if (h.life <= 0) {
        list[i] = list[list.length - 1];
        list.pop();
        this.hazardPool.push(h);
      }
    }
  }

  onBossDefeated(boss) {
    const id = boss.bossDef.id;
    this.lastBossTime = this.time - (this.bossStartTime || this.time);
    this.statsTrack.bossKills[id] = (this.statsTrack.bossKills[id] || 0) + 1;
    this.emit('bossDeath', boss);
    for (const e of this.enemies) {
      if (!e.boss && !e.prop) {
        e.hp = 0;
        e.dead = true;
      }
    }
    for (const b of this.bullets) this.bulletPool.push(b);
    this.bullets.length = 0;
    for (const h of this.hazards) this.hazardPool.push(h);
    this.hazards.length = 0;
    this.boss = null;
    if (this.zoneIndex === zones.length - 1) {
      this.gold += Math.round(boss.bossDef.gold * this.stats.greed);
      this.phase = 'victoryPending';
      this.victoryT = 3;
      return;
    }
    this.dropGemShower(boss.x, boss.y, boss.bossDef.xp * this.zone.xp, 16);
    this.dropPickup('coin', boss.x + 10, boss.y, boss.bossDef.gold);
    this.dropPickup('chest', boss.x, boss.y + 6, 0, 'boss');
    this.dropBlueprint(boss.x - 12, boss.y);
    this.phase = 'cleared';
  }

  completeZone() {
    if (this.zoneDamageTaken === 0) this.statsTrack.flawlessZones++;
    this.events.push({ type: 'zoneClear', zone: this.zoneIndex });
  }

  advanceZone() {
    this.startZone(this.zoneIndex + 1);
  }

  levelUpChoices() {
    return rollChoices(this);
  }

  chooseLevelUp(choice) {
    applyChoice(this, choice);
    this.pendingLevelUps = Math.max(0, this.pendingLevelUps - 1);
  }

  openChest(kind) {
    return rollChestContents(this, kind);
  }

  evolveWeapon(weapon) {
    weapon.evolved = true;
    weapon.level = 6;
    this.statsTrack.evolved[weapon.id] = true;
    resetWeaponState(this, weapon);
    this.emit('evolve', weapon);
  }

  finish(victory) {
    if (this.result) return;
    const zoneReached = this.zoneIndex;
    const survivalGold = Math.floor((this.time / 60) * 8);
    const gold = this.gold + survivalGold;
    this.result = {
      victory,
      zoneReached,
      time: this.time,
      kills: this.kills,
      level: this.player.level,
      gold,
      collectedGold: this.gold,
      survivalGold,
      goldFinal: Math.round(gold * this.diff.gold),
      weaponDamage: { ...this.weaponDamage },
      weapons: this.weapons.map((w) => ({ id: w.id, level: w.level, evolved: w.evolved })),
      passives: this.passives.map((p) => ({ id: p.id, level: p.level })),
      blueprints: [...this.blueprints],
      stats: this.statsTrack,
      difficulty: this.difficulty,
      characterId: this.characterId,
    };
    this.events.push({ type: victory ? 'victory' : 'gameOver' });
  }

  checkpoint() {
    return {
      zoneIndex: this.zoneIndex,
      characterId: this.characterId,
      difficulty: this.difficulty,
      time: this.time,
      kills: this.kills,
      gold: this.gold,
      bonus: { ...this.bonus },
      rerolls: this.rerolls,
      skips: this.skips,
      banishes: this.banishes,
      revives: this.revives,
      banished: [...this.banished],
      blueprints: [...this.blueprints],
      weapons: this.weapons.map((w) => ({ id: w.id, level: w.level, evolved: w.evolved, kills: w.kills || 0 })),
      passives: this.passives.map((p) => ({ id: p.id, level: p.level })),
      player: { level: this.player.level, xp: this.player.xp, hp: this.player.hp },
      weaponDamage: { ...this.weaponDamage },
      statsTrack: JSON.parse(JSON.stringify(this.statsTrack)),
    };
  }

  loadCheckpoint(data) {
    this.zoneIndex = data.zoneIndex;
    this.time = data.time;
    this.kills = data.kills;
    this.gold = data.gold;
    this.bonus = { ...data.bonus };
    this.rerolls = data.rerolls;
    this.skips = data.skips;
    this.banishes = data.banishes;
    this.revives = data.revives;
    this.banished = new Set(data.banished);
    this.blueprints = [...data.blueprints];
    this.weaponDamage = { ...data.weaponDamage };
    this.statsTrack = data.statsTrack;
    for (const w of data.weapons) {
      const weapon = this.addWeapon(w.id);
      weapon.level = w.level;
      weapon.evolved = w.evolved;
      weapon.kills = w.kills;
    }
    for (const p of data.passives) this.passives.push({ id: p.id, level: p.level });
    this.refreshStats();
    this.player.level = data.player.level;
    this.player.xp = data.player.xp;
    this.player.xpNext = xpForLevel(data.player.level);
    this.player.hp = Math.min(this.player.maxHp, data.player.hp);
  }

  tickPhases(dt) {
    if (this.phase === 'victoryPending') {
      this.victoryT -= dt;
      if (this.victoryT <= 0) {
        this.phase = 'victory';
        this.finish(true);
      }
    }
  }
}

function gemTier(value) {
  if (value >= 60) return 3;
  if (value >= 15) return 2;
  if (value >= 4) return 1;
  return 0;
}

export { makeProjectile, gemTier };
