import { el, icon, clear, button } from './dom.js';
import { t, tr } from '../app/i18n.js';
import { formatTime, formatNumber } from '../core/mathx.js';
import { weapons as weaponDefs, evolutions, passives as passiveDefs } from '../data/items.js';
import { zones } from '../data/zones.js';

// FUNCTIONS
export class Hud {
  constructor(root, app) {
    this.root = root;
    this.app = app;
    this.build();
    this.last = {};
  }

  build() {
    const root = this.root;
    clear(root);
    const xp = el('div', 'xpBar');
    this.xpFill = el('div', 'xpFill');
    this.xpLevel = el('div', 'xpLevel');
    xp.appendChild(this.xpFill);
    xp.appendChild(this.xpLevel);
    root.appendChild(xp);

    const row = el('div', 'hudRow');
    const left = el('div', 'col');
    left.style.gap = '2px';
    this.kills = el('div', 'hudStat');
    this.kills.appendChild(icon('ic_skull', 2));
    this.killsText = el('span', '', '0');
    this.kills.appendChild(this.killsText);
    this.gold = el('div', 'hudStat');
    this.gold.appendChild(icon('ic_coin', 2));
    this.goldText = el('span', '', '0');
    this.gold.appendChild(this.goldText);
    left.appendChild(this.kills);
    left.appendChild(this.gold);

    const center = el('div', 'col');
    center.style.alignItems = 'center';
    center.style.gap = '0';
    this.timer = el('div', 'hudTimer', '00:00');
    this.zone = el('div', 'hudZone', '');
    center.appendChild(this.timer);
    center.appendChild(this.zone);

    const right = el('div', 'hudRight');
    const pause = button('II', 'pauseBtn', () => this.app.openPause());
    right.appendChild(pause);

    row.appendChild(left);
    row.appendChild(center);
    row.appendChild(right);
    root.appendChild(row);

    this.weaponSlots = el('div', 'slots');
    this.passiveSlots = el('div', 'slots');
    root.appendChild(this.weaponSlots);
    root.appendChild(this.passiveSlots);

    this.bossWrap = el('div', 'bossBar hidden');
    this.bossName = el('div', 'bossName');
    const track = el('div', 'bossTrack');
    this.bossFill = el('div', 'bossFill');
    track.appendChild(this.bossFill);
    this.bossWrap.appendChild(this.bossName);
    this.bossWrap.appendChild(track);
    root.appendChild(this.bossWrap);
    this.last = {};
  }

  refreshSlots(world) {
    const key = world.weapons.map((w) => w.id + w.level + (w.evolved ? 'e' : '')).join(',') + '|' + world.passives.map((p) => p.id + p.level).join(',');
    if (key === this.last.slots) return;
    this.last.slots = key;
    clear(this.weaponSlots);
    clear(this.passiveSlots);
    for (const w of world.weapons) {
      const slot = el('div', 'slot' + (w.evolved ? ' evolved' : ''));
      const def = weaponDefs[w.id];
      slot.appendChild(icon(w.evolved ? evolutions[def.evolution].icon : def.icon, 1.5));
      if (!w.evolved) slot.appendChild(el('div', 'slotLevel', String(w.level)));
      this.weaponSlots.appendChild(slot);
    }
    for (const p of world.passives) {
      const slot = el('div', 'slot');
      slot.appendChild(icon(passiveDefs[p.id].icon, 1.5));
      slot.appendChild(el('div', 'slotLevel', String(p.level)));
      this.passiveSlots.appendChild(slot);
    }
  }

  update(world) {
    const p = world.player;
    const ratio = Math.min(1, p.xp / p.xpNext);
    const xpKey = Math.round(ratio * 200);
    if (xpKey !== this.last.xp) {
      this.last.xp = xpKey;
      this.xpFill.style.width = (ratio * 100).toFixed(1) + '%';
    }
    if (p.level !== this.last.level) {
      this.last.level = p.level;
      this.xpLevel.textContent = t('hud.level') + ' ' + p.level;
    }
    const zone = world.zone;
    const remaining = world.phase === 'waves' ? zone.duration - world.zoneTime : 0;
    const timeText = world.phase === 'waves' ? formatTime(remaining) : world.phase === 'boss' ? t('hud.boss') + '!' : '';
    if (timeText !== this.last.time) {
      this.last.time = timeText;
      this.timer.textContent = timeText;
    }
    const zoneText = t('zone.label', { n: world.zoneIndex + 1 }) + ' · ' + tr(zone.name);
    if (zoneText !== this.last.zone) {
      this.last.zone = zoneText;
      this.zone.textContent = zoneText;
    }
    if (world.kills !== this.last.kills) {
      this.last.kills = world.kills;
      this.killsText.textContent = formatNumber(world.kills);
    }
    if (world.gold !== this.last.gold) {
      this.last.gold = world.gold;
      this.goldText.textContent = formatNumber(world.gold);
    }
    this.refreshSlots(world);
    const boss = world.boss;
    if (boss) {
      if (this.last.bossId !== boss.id) {
        this.last.bossId = boss.id;
        this.bossWrap.classList.remove('hidden');
        this.bossName.textContent = tr(boss.bossDef.name);
      }
      const hp = Math.max(0, boss.hp / boss.maxHp);
      const hpKey = Math.round(hp * 300);
      if (hpKey !== this.last.bossHp) {
        this.last.bossHp = hpKey;
        this.bossFill.style.width = (hp * 100).toFixed(1) + '%';
      }
    } else if (this.last.bossId) {
      this.last.bossId = null;
      this.bossWrap.classList.add('hidden');
    }
  }

  zoneName(index) {
    return tr(zones[index].name);
  }
}
