import { rgba, hexColor, withAlpha, white } from '../render/renderer.js';
import { hash2 } from '../core/rng.js';
import { Particles } from './particles.js';

// VARIABLES
const tau = Math.PI * 2;
const black = rgba(0, 0, 0, 1);
const shadowColor = rgba(20, 10, 30, 0.28);
const frozenTint = hexColor('#a8dcff');
const gemColors = [hexColor('#6cb4f5'), hexColor('#7ccf5a'), hexColor('#c49af0'), hexColor('#f8605f')];
const fireworkColors = [hexColor('#ff9eb8'), hexColor('#ffe066'), hexColor('#86f0d4'), hexColor('#c49af0')];
const yarnColors = [hexColor('#f57ba0'), hexColor('#6cb4f5'), hexColor('#ffcf4a'), hexColor('#7ccf5a')];
const hazardFx = {
  slimeWave: hexColor('#9be060'),
  leafWave: hexColor('#7ccf5a'),
  snowWave: hexColor('#dff4ff'),
  slam: hexColor('#ffffff'),
};

// FUNCTIONS
export class View {
  constructor(renderer) {
    this.r = renderer;
    this.frames = new Map();
    this.animCounts = new Map();
    this.particles = new Particles();
    this.numbers = [];
    this.numberPool = [];
    this.drawables = [];
    this.time = 0;
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.showNumbers = true;
    this.screenShake = true;
    this.flashT = 0;
    this.f = {};
  }

  frame(name) {
    let index = this.frames.get(name);
    if (index === undefined) {
      index = this.r.hasFrame(name) ? this.r.frame(name) : this.r.hasFrame(name + '_0') ? this.r.frame(name + '_0') : this.r.frame('missing');
      this.frames.set(name, index);
    }
    return index;
  }

  animCount(name) {
    let count = this.animCounts.get(name);
    if (count === undefined) {
      count = 0;
      while (this.r.hasFrame(name + '_' + count)) count++;
      this.animCounts.set(name, count);
    }
    return count;
  }

  anim(name, t, fps) {
    const count = this.animCount(name);
    if (count === 0) return this.frame(name);
    const index = Math.floor(t * fps) % count;
    return this.frame(name + '_' + index);
  }

  addShake(amount) {
    if (this.screenShake) this.shake = Math.min(6, this.shake + amount);
  }

  number(x, y, value, kind) {
    if (!this.showNumbers) return;
    let n;
    if (kind === 'normal' && this.numbers.length > 30) return;
    if (this.numbers.length >= 48) {
      n = this.numbers.shift();
    } else {
      n = this.numberPool.pop() || { x: 0, y: 0, text: '', life: 0, kind: '', vy: 0 };
    }
    n.x = x + (Math.random() - 0.5) * 10;
    n.y = y - Math.random() * 4;
    n.text = String(value);
    n.life = kind === 'normal' ? 0.5 : 0.75;
    n.kind = kind;
    n.vy = -38;
    this.numbers.push(n);
  }

  update(dt) {
    this.time += dt;
    this.particles.update(dt);
    for (let i = this.numbers.length - 1; i >= 0; i--) {
      const n = this.numbers[i];
      n.life -= dt;
      n.y += n.vy * dt;
      n.vy *= Math.exp(-5 * dt);
      if (n.life <= 0) {
        this.numberPool.push(n);
        this.numbers.splice(i, 1);
      }
    }
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 18);
      this.shakeX = (Math.random() - 0.5) * this.shake;
      this.shakeY = (Math.random() - 0.5) * this.shake;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  render(world) {
    const r = this.r;
    const zone = world.zone;
    r.begin(world.camX + this.shakeX, world.camY + this.shakeY, zone.clear);
    this.drawGround(world, zone);
    this.particles.draw(r, true);
    this.drawHazards(world, true);
    this.drawGroundEffects(world);
    this.drawPickups(world);
    this.drawEntities(world);
    this.drawProjectiles(world);
    this.drawWeaponStates(world);
    this.drawBullets(world);
    this.drawHazards(world, false);
    this.particles.draw(r, false);
    this.drawArena(world);
    this.drawNumbers();
    this.drawPlayerBar(world);
    r.end();
  }

  drawGround(world, zone) {
    const r = this.r;
    const tile = 16;
    const left = Math.floor((r.camX - r.viewW / 2) / tile) - 1;
    const right = Math.floor((r.camX + r.viewW / 2) / tile) + 1;
    const top = Math.floor((r.camY - r.viewH / 2) / tile) - 1;
    const bottom = Math.floor((r.camY + r.viewH / 2) / tile) + 1;
    const ground = zone.ground;
    const seed = world.zoneIndex * 101;
    if (!this.groundFrames || this.groundZone !== zone) {
      this.groundZone = zone;
      this.groundFrames = ground.map((name) => this.frame(name));
      this.decorFrames = zone.decor.map((name) => this.frame(name));
    }
    const frames = this.groundFrames;
    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        const h = hash2(tx, ty, seed);
        let index = 0;
        if (h > 0.62) index = 1 + Math.floor(((h - 0.62) / 0.38) * (frames.length - 1));
        r.draw(frames[Math.min(index, frames.length - 1)], tx * tile + 8, ty * tile + 8);
      }
    }
    const cell = 36;
    const dl = Math.floor((r.camX - r.viewW / 2) / cell) - 1;
    const dr = Math.floor((r.camX + r.viewW / 2) / cell) + 1;
    const dt = Math.floor((r.camY - r.viewH / 2) / cell) - 1;
    const db = Math.floor((r.camY + r.viewH / 2) / cell) + 1;
    const decor = this.decorFrames;
    for (let cy = dt; cy <= db; cy++) {
      for (let cx = dl; cx <= dr; cx++) {
        const h = hash2(cx, cy, seed + 7);
        if (h > 0.42) continue;
        const kind = Math.floor(hash2(cx, cy, seed + 13) * decor.length);
        const ox = hash2(cx, cy, seed + 17) * (cell - 8) + 4;
        const oy = hash2(cx, cy, seed + 19) * (cell - 8) + 4;
        const flip = hash2(cx, cy, seed + 23) > 0.5 ? -1 : 1;
        r.draw(decor[kind], cx * cell + ox, cy * cell + oy, flip, 1);
      }
    }
  }

  drawShadow(x, y, width) {
    const name = width <= 12 ? 'shadow_12' : width <= 20 ? 'shadow_20' : width <= 32 ? 'shadow_32' : 'shadow_48';
    const base = width <= 12 ? 12 : width <= 20 ? 20 : width <= 32 ? 32 : 48;
    const s = width / base;
    this.r.draw(this.frame(name), x, y, s, s, 0, shadowColor);
  }

  drawGroundEffects(world) {
    const r = this.r;
    for (const p of world.projectiles) {
      if (p.delay > 0) continue;
      if (p.kind === 'puddle') {
        const fade = Math.min(1, p.life * 2.5, p.age * 6);
        const s = (p.r * 2) / 32;
        r.draw(this.frame('fx_puddle'), p.x, p.y, s, s * 0.75, 0, withAlpha(white, 0.5 * fade));
      } else if (p.kind === 'galaxy') {
        const fade = Math.min(1, p.life * 2.5, p.age * 6);
        const s = (p.r * 2) / 32;
        r.draw(this.frame('fx_galaxy'), p.x, p.y, s, s * 0.8, p.rot, withAlpha(white, 0.8 * fade));
        r.draw(this.frame('glow_64'), p.x, p.y, s * 0.8, s * 0.6, 0, withAlpha(hexColor('#a97ef0'), 0.5 * fade), 0, true);
      }
    }
    for (const w of world.weapons) {
      if (w.id !== 'catnip') continue;
      const radius = w.state.radius || 34;
      const pulse = w.state.pulse || 0;
      w.state.pulse = Math.max(0, pulse - 0.06);
      const color = w.evolved ? hexColor('#45cfb4') : hexColor('#7ccf5a');
      const s = (radius * 2) / 64;
      r.draw(this.frame('circle_64'), world.player.x, world.player.y, s, s, 0, withAlpha(color, 0.12 + pulse * 0.1));
      r.draw(this.frame('ring_64'), world.player.x, world.player.y, s, s, this.time * 0.5, withAlpha(color, 0.45 + pulse * 0.3));
      if (Math.random() < (w.evolved ? 0.5 : 0.25)) {
        const angle = Math.random() * tau;
        const d = Math.random() * radius;
        this.particles.spawn(this.frame('fx_leaf'), world.player.x + Math.cos(angle) * d, world.player.y + Math.sin(angle) * d, { vy: -12, vx: (Math.random() - 0.5) * 10, life: 0.9, spin: 3, color: withAlpha(white, 0.8), scale: 1 });
      }
    }
  }

  drawPickups(world) {
    const r = this.r;
    const t = this.time;
    for (const item of world.pickups) {
      const bob = Math.sin(t * 4 + item.bob) * 1.5;
      let frame;
      let glow = 0;
      switch (item.kind) {
        case 'gem':
          frame = this.frame('pk_gem_' + item.tier);
          break;
        case 'coin':
          frame = this.frame(item.value >= 10 ? 'pk_coinbag' : 'pk_coin');
          break;
        case 'chest':
          frame = this.frame(item.data === 'boss' ? 'pk_chest_boss' : 'pk_chest');
          glow = hexColor('#ffe066');
          break;
        case 'blueprint':
          frame = this.frame('pk_scroll');
          glow = hexColor('#86f0d4');
          break;
        default:
          frame = this.frame('pk_' + item.kind);
          glow = item.kind === 'fish' ? 0 : hexColor('#ffffff');
          break;
      }
      if (item.kind !== 'gem' && item.kind !== 'coin') this.drawShadow(item.x, item.y + 5, 10);
      if (glow) r.draw(this.frame('glow_32'), item.x, item.y + bob, 0.9, 0.9, 0, withAlpha(glow, 0.35 + Math.sin(t * 5) * 0.12), 0, true);
      r.draw(frame, item.x, item.y + bob - (item.kind === 'gem' ? 0 : 2));
    }
  }

  drawEntities(world) {
    const list = this.drawables;
    list.length = 0;
    for (const e of world.enemies) list.push(e);
    list.push(world.player);
    list.sort((a, b) => a.y - b.y);
    for (const e of list) {
      if (e === world.player) this.drawPlayer(world);
      else this.drawEnemy(world, e);
    }
  }

  drawEnemy(world, e) {
    const r = this.r;
    const radius = e.r;
    if (e.prop) {
      this.drawShadow(e.x, e.y + 5, 12);
      r.draw(this.frame(e.sprite), e.x, e.y, 1, 1, 0, white, e.flash > 0 ? 1 : 0);
      return;
    }
    const z = e.hopZ || 0;
    if (!e.flying) this.drawShadow(e.x, e.y + radius * 0.8, Math.max(10, radius * 2.2 - Math.min(z, 40) * 0.1));
    else this.drawShadow(e.x, e.y + radius + 4, Math.max(8, radius * 1.6));
    let sx = e.facing < 0 ? -1 : 1;
    let sy = 1;
    if (e.behavior === 'hop' || (e.boss && e.ai && e.ai.id === 'kingGloop')) {
      if (z > 0.5) {
        sx *= 0.9;
        sy = 1.12;
      } else if (e.state === 0) {
        const squash = Math.sin(this.time * 10 + e.id) * 0.04;
        sx *= 1.06 + squash;
        sy = 0.94 - squash;
      }
    }
    if (e.spawnT > 0) {
      const t = 1 - e.spawnT / (e.boss ? 1.2 : 0.35);
      const k = Math.max(0.1, Math.min(1, t * 1.3));
      sx *= k;
      sy *= k;
    }
    const frozen = e.freezeT > 0 || world.freezeAllT > 0;
    let color = frozen ? frozenTint : white;
    if (e.alpha < 1) color = withAlpha(color, e.alpha);
    const moving = !frozen && (e.moving || e.flying);
    const frame = this.anim(e.sprite, moving ? e.animT : 0, e.flying ? 8 : 5);
    if (e.boss && e.ai && e.ai.phase === 2) {
      const pulse = 0.4 + Math.sin(this.time * 6) * 0.15;
      r.draw(this.frame('glow_64'), e.x, e.y - z, radius / 12, radius / 13, 0, withAlpha(hexColor('#f8605f'), pulse), 0, true);
    }
    if (e.elite) {
      const pulse = 0.35 + Math.sin(this.time * 4 + e.id) * 0.12;
      r.draw(this.frame('glow_64'), e.x, e.y - z, radius / 16, radius / 16, 0, withAlpha(hexColor('#ff6a6a'), pulse), 0, true);
    }
    if (e.boss && e.ai && e.ai.airborne) {
      r.draw(frame, e.x, e.y - z, sx, sy, 0, color, e.flash > 0 ? 1 : 0);
      return;
    }
    r.draw(frame, e.x, e.y - z, sx, sy, 0, color, e.flash > 0 ? 1 : 0);
    if (frozen) r.draw(this.frame('fx_ice'), e.x, e.y + radius * 0.3, radius / 6, radius / 6, 0, withAlpha(white, 0.7));
  }

  drawPlayer(world) {
    const r = this.r;
    const p = world.player;
    if (!p.alive) {
      const t = Math.min(1, p.deathT / 0.8);
      r.draw(this.frame(world.heroSprite + '_0'), p.x, p.y + t * 4, (p.flipX ? -1 : 1) * (1 + t * 0.3), 1 - t * 0.6, 0, withAlpha(white, 1 - t));
      return;
    }
    this.drawShadow(p.x, p.y + 7, 14);
    const moving = p.moving;
    const frame = this.anim(world.heroSprite, moving ? p.animT : 0, 8);
    const bob = moving ? Math.abs(Math.sin(p.animT * Math.PI * 4)) * -1.5 : Math.sin(this.time * 3) * 0.4;
    const squash = moving ? 1 : 1 + Math.sin(this.time * 3) * 0.03;
    const blink = p.iframes > 0 && Math.floor(p.iframes * 20) % 2 === 0;
    const sx = (p.flipX ? -1 : 1) / squash;
    r.draw(frame, p.x, p.y + bob, sx, squash, 0, blink ? withAlpha(white, 0.55) : white, p.hurtT > 0.12 ? 1 : 0);
  }

  drawPlayerBar(world) {
    const p = world.player;
    if (!p.alive) return;
    const r = this.r;
    const width = 18;
    const x = p.x - width / 2;
    const y = p.y + 11;
    const ratio = Math.max(0, p.hp / p.maxHp);
    r.rect(x - 1, y - 1, width + 2, 4, rgba(42, 29, 52, 0.9));
    r.rect(x, y, width, 2, rgba(110, 26, 46, 1));
    r.rect(x, y, Math.max(0, width * ratio), 2, ratio > 0.3 ? rgba(124, 207, 90, 1) : rgba(248, 96, 95, 1));
  }

  drawProjectiles(world) {
    const r = this.r;
    for (const p of world.projectiles) {
      if (p.delay > 0) continue;
      switch (p.kind) {
        case 'slash': {
          const t = 1 - p.life / p.maxLife;
          const name = p.evo ? 'fx_slash_evo' : 'fx_slash';
          const count = this.animCount(name) || 1;
          const frame = this.frame(name + '_' + Math.min(count - 1, Math.floor(t * count)));
          const dist = 14 * p.scale;
          const flip = p.variant === 1 ? -1 : 1;
          r.draw(frame, p.x + Math.cos(p.rot) * dist, p.y + Math.sin(p.rot) * dist, p.scale, p.scale * flip, p.rot, withAlpha(white, 1 - t * 0.5));
          break;
        }
        case 'yarn':
        case 'yarnMini': {
          const cosmic = p.evo && p.kind === 'yarn';
          const name = cosmic ? 'pj_yarn_cosmic' : 'pj_yarn';
          const s = p.kind === 'yarnMini' ? 0.7 : p.scale;
          if (cosmic) {
            r.draw(this.frame('glow_32'), p.x, p.y, s * 0.9, s * 0.9, 0, withAlpha(hexColor('#c49af0'), 0.5), 0, true);
            if (Math.random() < 0.5) this.particles.spawn(this.frame('fx_star'), p.x + (Math.random() - 0.5) * 8, p.y + (Math.random() - 0.5) * 8, { life: 0.5, scale: 0.8, scaleEnd: 0.2, additive: true, color: fireworkColors[(Math.random() * 4) | 0] });
          } else if (Math.random() < 0.15) {
            this.particles.spawn(this.frame('fx_confetti'), p.x, p.y, { life: 0.4, color: yarnColors[p.variant % 4], ground: true });
          }
          r.draw(this.frame(name), p.x, p.y, s, s, p.rot, cosmic ? white : yarnColors[p.variant % 4]);
          break;
        }
        case 'beam': {
          const t = p.life / p.maxLife;
          const ex = p.x + Math.cos(p.angle) * p.length;
          const ey = p.y + Math.sin(p.angle) * p.length;
          r.line(p.x, p.y, ex, ey, p.width * 2.4 * t, withAlpha(hexColor('#f8605f'), 0.55 * t), true);
          r.line(p.x, p.y, ex, ey, Math.max(1, p.width * 0.8 * t), withAlpha(hexColor('#ffe1ea'), t), true);
          r.draw(this.frame('glow_16'), p.x + Math.cos(p.angle) * 6, p.y + Math.sin(p.angle) * 6, 1, 1, 0, withAlpha(hexColor('#f8605f'), t), 0, true);
          break;
        }
        case 'sweep': {
          const fade = Math.min(1, p.life * 4, p.age * 6);
          const ex = p.x + Math.cos(p.angle) * p.length;
          const ey = p.y + Math.sin(p.angle) * p.length;
          r.line(p.x, p.y, ex, ey, p.width * 2.2, withAlpha(hexColor('#f57ba0'), 0.45 * fade), true);
          r.line(p.x, p.y, ex, ey, p.width * 0.9, withAlpha(hexColor('#ffe1ea'), 0.95 * fade), true);
          r.draw(this.frame('glow_32'), ex, ey, 1.4, 1.4, 0, withAlpha(hexColor('#f57ba0'), fade), 0, true);
          if (Math.random() < 0.6) this.particles.spawn(this.frame('fx_spark'), ex, ey, { vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, life: 0.35, additive: true, color: hexColor('#ffb3c8') });
          break;
        }
        case 'boomerang': {
          const name = p.evo ? 'pj_shark' : 'pj_fish';
          if (Math.random() < (p.evo ? 0.7 : 0.3)) this.particles.spawn(this.frame('fx_drop'), p.x + (Math.random() - 0.5) * 6, p.y + (Math.random() - 0.5) * 6, { vz: 30, gravity: 160, life: 0.35, color: hexColor(p.evo ? '#a8dcff' : '#dff4ff') });
          const angle = p.evo ? Math.atan2(p.vy, p.vx) : p.rot;
          const flip = p.evo && Math.cos(angle) < 0 ? -1 : 1;
          r.draw(this.frame(name), p.x, p.y, p.scale, p.scale * flip, angle);
          break;
        }
        case 'bolt': {
          this.drawBolt(p);
          break;
        }
        case 'chain': {
          const t = p.life / p.maxLife;
          this.jagged(p.x, p.y, p.tx, p.ty, 5, 2, withAlpha(hexColor('#fff9c4'), t), p.age);
          break;
        }
        case 'lob': {
          this.drawShadow(p.x, p.y + 4, 8);
          r.draw(this.frame(p.evo ? 'pj_milk_star' : 'pj_milk'), p.x, p.y - (p.extraZ || 0), 1, 1, p.rot);
          break;
        }
        case 'crane': {
          const flip = Math.cos(p.rot) < 0 ? -1 : 1;
          if (p.evo && Math.random() < 0.4) this.particles.spawn(this.frame('fx_spark'), p.x, p.y, { life: 0.3, additive: true, color: hexColor('#ffe066') });
          r.draw(this.frame(p.evo ? 'pj_crane_gold' : 'pj_crane'), p.x, p.y, 1, flip, p.rot);
          break;
        }
        case 'star':
          if (p.evo) {
            r.draw(this.frame('pj_shuriken_evo'), p.x - p.vx * 0.02, p.y - p.vy * 0.02, 1, 1, p.rot - 0.6, withAlpha(hexColor('#c49af0'), 0.35), 0, true);
            r.draw(this.frame('pj_shuriken_evo'), p.x - p.vx * 0.04, p.y - p.vy * 0.04, 1, 1, p.rot - 1.2, withAlpha(hexColor('#a97ef0'), 0.2), 0, true);
          }
          r.draw(this.frame(p.evo ? 'pj_shuriken_evo' : 'pj_shuriken'), p.x, p.y, 1, 1, p.rot);
          break;
        case 'bullet':
          r.draw(this.frame('pj_bullet'), p.x, p.y, 1, 1, Math.atan2(p.vy, p.vx));
          break;
        case 'missile':
          r.draw(this.frame('pj_missile'), p.x, p.y, 1, 1, Math.atan2(p.vy, p.vx));
          if (Math.random() < 0.5) this.particles.spawn(this.frame('fx_puff_0'), p.x, p.y, { life: 0.35, scale: 0.5, scaleEnd: 0.9, color: withAlpha(white, 0.6) });
          break;
        case 'rocket':
          r.draw(this.frame('pj_rocket'), p.x, p.y, 1, 1, p.rot, fireworkColors[p.variant]);
          if (Math.random() < 0.8) this.particles.spawn(this.frame('fx_spark'), p.x - Math.cos(p.rot) * 5, p.y - Math.sin(p.rot) * 5, { vx: -Math.cos(p.rot) * 20 + (Math.random() - 0.5) * 20, vy: -Math.sin(p.rot) * 20 + (Math.random() - 0.5) * 20, life: 0.3, additive: true, color: hexColor('#ffcf4a') });
          break;
        case 'frostCone': {
          if (p.age < 0.15) {
            for (let i = 0; i < 4; i++) {
              const angle = p.angle + (Math.random() - 0.5) * 1.1;
              const speed = p.length * (2.2 + Math.random() * 1.6);
              this.particles.spawn(this.frame('fx_snow'), p.x, p.y, { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, drag: 4, life: 0.4, scale: 1 + Math.random(), scaleEnd: 0.4, spin: 4, color: withAlpha(white, 0.9) });
            }
          }
          break;
        }
        case 'nova': {
          const t = 1 - p.life / p.maxLife;
          const s = (p.r * 2 * (0.3 + t * 0.7)) / 128;
          r.draw(this.frame('ring_128'), p.x, p.y, s, s, 0, withAlpha(hexColor('#a8dcff'), 1 - t), 0, true);
          break;
        }
        case 'ghost': {
          const flip = p.vx < 0 ? -1 : 1;
          const fade = Math.min(1, p.life * 4, p.age * 8);
          if (Math.random() < 0.35) this.particles.spawn(this.frame('fx_puff_0'), p.x - p.vx * 0.03, p.y - p.vy * 0.03, { life: 0.35, scale: 0.6, scaleEnd: 1, color: withAlpha(hexColor('#d3b0ff'), 0.5) });
          r.draw(this.frame('glow_32'), p.x, p.y, 0.7 * p.scale, 0.7 * p.scale, 0, withAlpha(hexColor('#c49af0'), 0.4 * fade), 0, true);
          r.draw(this.anim('pj_ghostcat', p.age, 10), p.x, p.y, flip * p.scale, p.scale, 0, withAlpha(white, 0.85 * fade));
          break;
        }
        default:
          break;
      }
    }
  }

  drawBolt(p) {
    const r = this.r;
    const t = p.life / p.maxLife;
    const top = p.y - 120;
    this.jagged(p.x + 6, top, p.x, p.y, 8, 2.5 * p.scale, withAlpha(hexColor('#fff9c4'), t), p.variant);
    r.draw(this.frame('glow_32'), p.x, p.y, 1.2 * p.scale, 0.9 * p.scale, 0, withAlpha(hexColor('#ffe066'), 0.8 * t), 0, true);
  }

  jagged(x1, y1, x2, y2, segments, width, color, seed) {
    const r = this.r;
    let px = x1;
    let py = y1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const offset = i === segments ? 0 : (hash2(i, Math.floor(seed * 30), 3) - 0.5) * 14;
      const x = x1 + dx * t + nx * offset;
      const y = y1 + dy * t + ny * offset;
      r.line(px, py, x, y, width * 2.2, withAlpha(hexColor('#ffcf4a'), ((color >>> 24) & 255) / 255 * 0.5), true);
      r.line(px, py, x, y, width, color, true);
      px = x;
      py = y;
    }
  }

  drawWeaponStates(world) {
    const r = this.r;
    for (const w of world.weapons) {
      if (w.id === 'orbs') {
        for (const orb of w.state.orbs) {
          const name = w.evolved ? (orb.ring === 0 ? 'pj_orb_moon' : 'pj_orb_sun') : 'pj_orb';
          const glowColor = w.evolved && orb.ring === 1 ? hexColor('#ffcf4a') : hexColor('#a8dcff');
          if (Math.random() < (w.evolved ? 0.25 : 0.12)) this.particles.spawn(this.frame('fx_star'), orb.x, orb.y, { life: 0.4, scale: 0.7, scaleEnd: 0.1, additive: true, color: glowColor });
          r.draw(this.frame('glow_32'), orb.x, orb.y, 0.7, 0.7, 0, withAlpha(glowColor, 0.5), 0, true);
          r.draw(this.frame(name), orb.x, orb.y, 1, 1, this.time * 2);
        }
      } else if (w.id === 'drone') {
        for (const drone of w.state.drones) {
          this.drawShadow(drone.x, drone.y + 14, 8);
          r.draw(this.anim(w.evolved ? 'pj_drone_evo' : 'pj_drone', this.time, 10), drone.x, drone.y + Math.sin(this.time * 5 + drone.x) * 1.5, drone.flip ? -1 : 1, 1);
        }
      } else if (w.id === 'ghosts' && w.evolved) {
        for (const ghost of w.state.ghosts) {
          r.draw(this.frame('glow_32'), ghost.x, ghost.y, 0.6, 0.6, 0, withAlpha(hexColor('#c49af0'), 0.35), 0, true);
          r.draw(this.anim('pj_ghostcat', this.time + ghost.x * 0.01, 8), ghost.x, ghost.y, ghost.flip ? -1 : 1, 1, 0, withAlpha(white, 0.85));
        }
      }
    }
  }

  drawBullets(world) {
    const r = this.r;
    for (const b of world.bullets) {
      const frame = b.animated ? this.anim(b.sprite, b.age, 10) : this.frame(b.sprite);
      if (b.sprite === 'sh_fireball' || b.sprite === 'sh_bloodorb' || b.sprite === 'sh_voidorb' || b.sprite === 'sh_eyebeam') {
        const glow = b.sprite === 'sh_voidorb' ? hexColor('#7d56cc') : b.sprite === 'sh_bloodorb' ? hexColor('#f8605f') : b.sprite === 'sh_eyebeam' ? hexColor('#ff9eb8') : hexColor('#ffbe6b');
        r.draw(this.frame('glow_16'), b.x, b.y, b.r / 4, b.r / 4, 0, withAlpha(glow, 0.6), 0, true);
      }
      const flip = b.animated && b.vx < 0 ? -1 : 1;
      r.draw(frame, b.x, b.y, b.scale * flip, b.scale, b.rotate ? b.rot : 0);
    }
  }

  drawHazards(world, under) {
    const r = this.r;
    for (const h of world.hazards) {
      if (h.warn > 0) {
        if (!under) continue;
        const progress = 1 - h.warn / Math.max(0.01, h.warnMax);
        const pulse = 0.55 + Math.sin(this.time * 18) * 0.15;
        const red = withAlpha(hexColor('#f8605f'), 0.55 * pulse + 0.2);
        if (h.kind === 'circle' || h.kind === 'blast') {
          const s = (h.r * 2) / 64;
          r.draw(this.frame('zone_64'), h.x, h.y, s, s, 0, red);
          r.draw(this.frame('circle_64'), h.x, h.y, s * progress, s * progress, 0, withAlpha(hexColor('#f8605f'), 0.35));
        } else if (h.kind === 'line') {
          const ex = h.x + Math.cos(h.angle) * h.r;
          const ey = h.y + Math.sin(h.angle) * h.r;
          r.drawStretched(this.frame('zonerect'), h.x, h.y, ex, ey, h.w, red);
          r.line(h.x, h.y, h.x + Math.cos(h.angle) * h.r * progress, h.y + Math.sin(h.angle) * h.r * progress, h.w * 0.8, withAlpha(hexColor('#f8605f'), 0.3));
        } else if (h.kind === 'cone') {
          for (let i = -4; i <= 4; i++) {
            const a = h.angle + (i / 4) * h.w;
            r.line(h.x, h.y, h.x + Math.cos(a) * h.r, h.y + Math.sin(a) * h.r, 3, withAlpha(hexColor('#f8605f'), 0.35 * pulse));
          }
        }
        continue;
      }
      if (under) continue;
      if (h.kind === 'ring') {
        const s = (h.r * 2) / 128;
        const color = hazardFx[h.fx] || white;
        r.draw(this.frame('ring_128'), h.x, h.y, s, s * 0.85, 0, withAlpha(color, Math.min(1, h.life * 3)), 0, false);
      } else if (h.kind === 'cloud') {
        const s = (h.r * 2) / 32;
        r.draw(this.frame('fx_cloud'), h.x, h.y, s, s, this.time, withAlpha(white, Math.min(0.85, h.life)));
      }
    }
  }

  drawArena(world) {
    const a = world.arena;
    if (!a) return;
    const r = this.r;
    const post = this.frame('ar_post');
    const step = 16;
    for (let x = a.x0; x <= a.x1; x += step) {
      r.draw(post, x, a.y0);
      r.draw(post, x, a.y1);
    }
    for (let y = a.y0 + step; y < a.y1; y += step) {
      r.draw(post, a.x0, y);
      r.draw(post, a.x1, y);
    }
  }

  drawNumbers() {
    const r = this.r;
    for (const n of this.numbers) {
      const alpha = Math.min(1, n.life * 4);
      let color;
      let scale = 1;
      if (n.kind === 'crit') {
        color = withAlpha(hexColor('#ffe066'), alpha);
        scale = 1.25;
      } else if (n.kind === 'heal') {
        color = withAlpha(hexColor('#7ccf5a'), alpha);
      } else if (n.kind === 'hurt') {
        color = withAlpha(hexColor('#f8605f'), alpha);
      } else if (n.kind === 'bleed') {
        color = withAlpha(hexColor('#ff9eb8'), alpha);
        scale = 0.85;
      } else {
        color = withAlpha(white, alpha * 0.9);
        scale = 0.8;
      }
      const text = n.text;
      const advance = 5 * scale;
      let x = n.x - (text.length * advance) / 2 + advance / 2;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        const name = code >= 48 && code <= 57 ? 'font_' + text[i] : code === 43 ? 'font_plus' : null;
        if (name) r.draw(this.frame(name), x, n.y, scale, scale, 0, color);
        x += advance;
      }
    }
  }

  onEvent(world, type, a, b, c, d) {
    const p = world.player;
    switch (type) {
      case 'damage': {
        const e = a;
        if (c) this.number(e.x, e.y - e.r - 4, b, 'crit');
        else if (d === 'bleed') this.number(e.x, e.y - e.r - 2, b, 'bleed');
        else this.number(e.x, e.y - e.r - 4, b, 'normal');
        if (Math.random() < 0.35) this.particles.spawn(this.frame('fx_spark'), e.x + (Math.random() - 0.5) * e.r, e.y - Math.random() * e.r, { life: 0.18, additive: true, scale: 1, scaleEnd: 0.3 });
        break;
      }
      case 'kill': {
        const e = a;
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * tau;
          this.particles.spawn(this.frame('fx_puff_0'), e.x, e.y, { frames: [this.frame('fx_puff_0'), this.frame('fx_puff_1'), this.frame('fx_puff_2'), this.frame('fx_puff_3')], fps: 10, vx: Math.cos(angle) * 30, vy: Math.sin(angle) * 30 - 10, drag: 6, life: 0.4, fade: false });
        }
        break;
      }
      case 'eliteDeath':
      case 'bossDeath': {
        const e = a;
        const big = type === 'bossDeath';
        for (let i = 0; i < (big ? 40 : 18); i++) {
          const angle = Math.random() * tau;
          const speed = 40 + Math.random() * (big ? 160 : 90);
          this.particles.spawn(this.frame('fx_star'), e.x, e.y, { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, drag: 3, life: 0.9 + Math.random() * 0.5, additive: true, spin: 6, color: fireworkColors[i % 4] });
        }
        this.ringFx(e.x, e.y, big ? 120 : 60, hexColor('#ffffff'));
        this.addShake(big ? 6 : 3);
        break;
      }
      case 'explosion': {
        const [x, y, radius, style] = [a, b, c, d];
        const color = style && style.startsWith('firework') ? fireworkColors[Number(style.slice(8)) || 0] : style === 'confetti' ? hexColor('#ffe066') : hexColor('#ffbe6b');
        this.ringFx(x, y, radius, color);
        glowBurst(this, x, y, radius, color);
        const count = style && style.startsWith('firework') ? 10 : 6;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * tau + Math.random() * 0.3;
          const speed = radius * (2 + Math.random() * 2);
          this.particles.spawn(this.frame(style === 'confetti' ? 'fx_confetti' : 'fx_spark'), x, y, { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, drag: 5, life: 0.5, additive: style !== 'confetti', color: style === 'confetti' ? fireworkColors[i % 4] : color, spin: 8 });
        }
        break;
      }
      case 'splash': {
        const [x, y, radius, evo] = [a, b, c, d];
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * tau;
          this.particles.spawn(this.frame('fx_drop'), x, y, { vx: Math.cos(angle) * radius * 2, vy: Math.sin(angle) * radius * 2, vz: 50, gravity: 200, life: 0.45, color: evo ? hexColor('#d3b0ff') : white });
        }
        break;
      }
      case 'playerHurt':
        this.number(p.x, p.y - 12, a, 'hurt');
        this.addShake(2.5);
        this.flashT = 0.25;
        break;
      case 'heal':
        this.number(p.x, p.y - 14, '+' + a, 'heal');
        for (let i = 0; i < 5; i++) this.particles.spawn(this.frame('fx_heart'), p.x + (Math.random() - 0.5) * 14, p.y - 4, { vy: -30 - Math.random() * 20, life: 0.7, scale: 1 });
        break;
      case 'levelUp':
        for (let i = 0; i < 14; i++) {
          const angle = (i / 14) * tau;
          this.particles.spawn(this.frame('fx_star'), p.x, p.y, { vx: Math.cos(angle) * 70, vy: Math.sin(angle) * 70, drag: 4, life: 0.7, additive: true, color: hexColor('#ffe066'), spin: 5 });
        }
        this.ringFx(p.x, p.y, 40, hexColor('#ffe066'));
        break;
      case 'evolve':
        this.ringFx(p.x, p.y, 90, hexColor('#c49af0'));
        this.addShake(3);
        break;
      case 'gem':
        if (Math.random() < 0.3) this.particles.spawn(this.frame('fx_spark'), p.x + (Math.random() - 0.5) * 8, p.y - 4, { vy: -20, life: 0.25, additive: true, color: gemColors[a.tier] });
        break;
      case 'bomb':
        this.ringFx(p.x, p.y, 200, hexColor('#ffcf4a'));
        this.addShake(6);
        break;
      case 'clock':
        this.ringFx(p.x, p.y, 200, hexColor('#a8dcff'));
        break;
      case 'magnet':
        this.ringFx(p.x, p.y, 150, hexColor('#f8605f'));
        break;
      case 'propBreak': {
        const e = a;
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * tau;
          this.particles.spawn(this.frame('fx_shard'), e.x, e.y, { vx: Math.cos(angle) * 50, vy: Math.sin(angle) * 50, vz: 60, gravity: 220, life: 0.6, spin: 10 });
        }
        break;
      }
      case 'hazardTrigger': {
        const h = a;
        if (h.kind === 'circle') {
          this.ringFx(h.x, h.y, h.r * 1.2, h.fx === 'icicle' ? hexColor('#a8dcff') : h.fx === 'meteor' ? hexColor('#ffbe6b') : white);
          if (h.fx === 'meteor' || h.fx === 'slam') this.addShake(2);
          for (let i = 0; i < 6; i++) {
            const angle = Math.random() * tau;
            this.particles.spawn(this.frame(h.fx === 'icicle' ? 'fx_snow' : 'fx_puff_0'), h.x, h.y, { vx: Math.cos(angle) * 60, vy: Math.sin(angle) * 60, drag: 5, life: 0.4 });
          }
        } else if (h.kind === 'line' && h.dmg > 0) {
          for (let i = 0; i < 14; i++) {
            const t = i / 14;
            this.particles.spawn(this.frame(h.fx === 'roots' ? 'fx_root' : 'fx_puff_0'), h.x + Math.cos(h.angle) * h.r * t, h.y + Math.sin(h.angle) * h.r * t, { life: 0.5, scale: 1, vz: 0, fade: true });
          }
        }
        break;
      }
      case 'bossLand':
        this.addShake(2 + b * 3);
        break;
      case 'explode':
        this.ringFx(a, b, c, hexColor('#ffbe6b'));
        this.addShake(1.5);
        break;
      case 'teleport':
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * tau;
          this.particles.spawn(this.frame('fx_bat'), a, b, { vx: Math.cos(angle) * 60, vy: Math.sin(angle) * 60, life: 0.5, drag: 2 });
        }
        break;
      case 'dashTrail':
        this.particles.spawn(this.frame('fx_puff_0'), a, b, { life: 0.4, ground: true, scale: 1, scaleEnd: 1.5, color: withAlpha(white, 0.7) });
        break;
      case 'revive':
        this.ringFx(p.x, p.y, 90, hexColor('#ffe066'));
        break;
      case 'bossStart': {
        const e = a;
        this.ringFx(e.x, e.y, 140, hexColor('#f8605f'));
        this.ringFx(e.x, e.y, 70, white);
        this.addShake(5);
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * tau;
          this.particles.spawn(this.frame('fx_puff_0'), e.x, e.y, { frames: [this.frame('fx_puff_0'), this.frame('fx_puff_1'), this.frame('fx_puff_2'), this.frame('fx_puff_3')], fps: 6, vx: Math.cos(angle) * 90, vy: Math.sin(angle) * 90, drag: 4, life: 0.7, fade: false, scale: 1.5 });
        }
        break;
      }
      case 'bossPhase':
        this.ringFx(a.x, a.y, 100, hexColor('#f8605f'));
        this.addShake(4);
        break;
      default:
        break;
    }
  }

  ringFx(x, y, radius, color) {
    const p = this.particles.spawn(this.frame('ring_128'), x, y, { life: 0.35, scale: 0.05, scaleEnd: (radius * 2) / 128, color, additive: true });
    return p;
  }
}

function glowBurst(view, x, y, radius, color) {
  view.particles.spawn(view.frame('glow_64'), x, y, { life: 0.25, scale: radius / 24, scaleEnd: radius / 40, color: withAlpha(color, 0.9), additive: true });
}
