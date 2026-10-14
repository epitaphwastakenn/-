import { Renderer } from '../render/renderer.js';
import { View } from '../view/view.js';
import { World } from '../sim/world.js';
import { Bot } from '../sim/bot.js';
import { applyChest } from '../sim/levelup.js';
import { rollBlessings, applyBlessing, campHeal } from '../sim/camp.js';
import { Input } from './input.js';
import { AudioManager } from './audio.js';
import { loadSave, writeSave, loadRun, writeRun, clearRun, resetAll, defaultSave } from './save.js';
import { setLang, detectLang, t, tr } from './i18n.js';
import { vibrate, safeInsets, exitApp } from './platform.js';
import { el, setAtlas, clear } from '../ui/dom.js';
import { Hud } from '../ui/hud.js';
import * as screens from '../ui/screens.js';
import { weapons as weaponDefs, evolutions, passives as passiveDefs } from '../data/items.js';
import { characters, upgrades, blueprintCosts, difficulties, achievements } from '../data/meta.js';
import { zones } from '../data/zones.js';

// VARIABLES
const sfxNames = [
  'click', 'back', 'buy', 'error', 'levelup', 'gem', 'coin', 'heal', 'hurt', 'death', 'pop', 'hit', 'claw', 'yarn', 'bounce', 'laser', 'orbital',
  'throw', 'splash', 'thunder', 'orbs', 'crane', 'shuriken', 'pew', 'missile', 'rocket', 'boom', 'frost', 'nova', 'ghost', 'chestPickup',
  'chestShake', 'chestOpen', 'chestItem', 'evolve', 'blueprint', 'magnet', 'bomb', 'freeze', 'warning', 'bossRoar', 'bossDie', 'bossShoot',
  'bossCast', 'bossLand', 'summon', 'teleport', 'revive', 'victory', 'defeat', 'zoneClear', 'meow', 'eliteDie', 'select',
];
const menuScreens = { title: true, menu: true, prerun: true, shop: true, arsenal: true, achievements: true, settings: true, results: true };
const weaponSfx = { claw: 0.55, yarn: 0.5, bounce: 0.25, laser: 0.45, orbital: 0.7, throw: 0.45, splash: 0.35, thunder: 0.5, orbs: 0.5, crane: 0.35, shuriken: 0.35, pew: 0.25, missile: 0.35, rocket: 0.4, boom: 0.4, frost: 0.45, nova: 0.6, ghost: 0.4 };

// FUNCTIONS
export class App {
  constructor() {
    this.version = '1.0.0';
    this.canvas = document.getElementById('game');
    this.renderer = new Renderer(this.canvas);
    this.view = new View(this.renderer);
    this.audio = new AudioManager();
    this.input = new Input(document.getElementById('touch'), document.getElementById('joyBase'), document.getElementById('joyKnob'));
    this.save = loadSave();
    this.savedRun = loadRun();
    if (!this.save.settings.lang) this.save.settings.lang = detectLang();
    setLang(this.save.settings.lang);
    this.screensRoot = document.getElementById('screens');
    this.modalsRoot = document.getElementById('modals');
    this.toastsRoot = document.getElementById('toasts');
    this.hudRoot = document.getElementById('hud');
    this.hurtOverlay = document.getElementById('hurt');
    this.lowHpOverlay = document.getElementById('lowhp');
    this.fadeOverlay = document.getElementById('fade');
    this.hud = new Hud(this.hudRoot, this);
    this.modals = [];
    this.screenName = '';
    this.mode = 'menu';
    this.world = null;
    this.bot = null;
    this.lastTime = 0;
    this.lastRender = 0;
    this.fxHook = (type, a, b, c, d) => this.onWorldFx(type, a, b, c, d);
    this.frame = this.frame.bind(this);
    this.applySettings();
  }

  async boot() {
    const fill = document.getElementById('loadingFill');
    fill.style.width = '15%';
    const meta = await (await fetch('atlas.json')).json();
    const image = new Image();
    image.src = 'atlas.png';
    await image.decode();
    this.renderer.loadAtlas(image, meta);
    setAtlas(meta);
    fill.style.width = '45%';
    try {
      await Promise.all([document.fonts.load('32px Jersey'), document.fonts.load('16px Pixelify')]);
    } catch (error) {
      console.warn('font load failed');
    }
    fill.style.width = '60%';
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.__onBack = () => this.onBack();
    window.__onAppPause = () => this.onAppPause();
    window.__onAppResume = () => this.onAppResume();
    window.__onInsets = () => this.applyInsets();
    window.__onAppFocus = () => {};
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.onAppPause();
      else this.onAppResume();
    });
    const unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    this.applyInsets();
    this.audio.init();
    const sfxLoad = this.audio.loadSfx(sfxNames);
    await Promise.race([sfxLoad, new Promise((resolve) => setTimeout(resolve, 2500))]);
    fill.style.width = '100%';
    this.startAttract();
    this.showScreen('title');
    this.audio.playMusic('menu');
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 450);
    requestAnimationFrame(this.frame);
  }

  applyInsets() {
    const insets = safeInsets();
    document.documentElement.style.setProperty('--safeTop', Math.max(0, insets.top) + 'px');
    document.documentElement.style.setProperty('--safeBottom', Math.max(0, insets.bottom) + 'px');
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    const scale = Math.max(1, Math.round(width / 220));
    this.renderer.resize(width, height, scale);
    if (this.world) {
      this.world.viewW = this.renderer.viewW;
      this.world.viewH = this.renderer.viewH;
    }
  }

  applySettings() {
    const s = this.save.settings;
    this.audio.setVolumes(s.music * 0.8, s.sfx);
    this.view.screenShake = s.shake;
    this.view.showNumbers = s.numbers;
  }

  persist() {
    writeSave(this.save);
  }

  sfx(name, options) {
    this.audio.play(name, options);
  }

  buzz(ms) {
    if (this.save.settings.vibration) vibrate(ms);
  }

  toast(text, kind = '', duration = 2200) {
    const node = el('div', 'toast ' + kind, text);
    this.toastsRoot.appendChild(node);
    while (this.toastsRoot.children.length > 4) this.toastsRoot.removeChild(this.toastsRoot.firstChild);
    setTimeout(() => node.classList.add('out'), duration);
    setTimeout(() => node.remove(), duration + 450);
  }

  makeWorld(options) {
    return new World({
      viewW: this.renderer.viewW,
      viewH: this.renderer.viewH,
      fx: this.fxHook,
      meta: this.save.meta,
      unlocked: this.unlockedItems(),
      knownBlueprints: this.save.blueprints,
      ...options,
    });
  }

  unlockedItems() {
    const list = [...this.save.unlocked];
    for (const id of this.save.characters) {
      const weapon = characters[id].weapon;
      if (!list.includes(weapon)) list.push(weapon);
    }
    return list;
  }

  startAttract() {
    const zoneIndex = Math.min(this.save.stats.bestZone || 0, zones.length - 1);
    const pick = Object.keys(characters).filter((id) => this.save.characters.includes(id));
    const characterId = pick[Math.floor(Math.random() * pick.length)];
    this.world = this.makeWorld({ characterId, godMode: true, seed: (Math.random() * 1e9) >>> 0 });
    if (zoneIndex > 0) this.world.startZone(Math.floor(Math.random() * (zoneIndex + 1)));
    this.world.heroSprite = characters[characterId].sprite;
    this.bot = new Bot(this.world, 0.9, 3);
    for (let i = 0; i < 12 + this.world.zoneIndex * 6; i++) {
      this.world.pendingLevelUps++;
      this.autoLevel();
    }
    this.world.zoneTime = 30;
    this.mode = 'attract';
    this.view.particles.clear();
    this.hudRoot.classList.add('hidden');
    this.input.enabled = false;
  }

  autoLevel() {
    const world = this.world;
    while (world.pendingLevelUps > 0) world.chooseLevelUp(this.bot.choose(world.levelUpChoices()));
    while (world.pendingChests.length > 0) applyChest(world, world.openChest(world.pendingChests.shift()));
  }

  showScreen(name, arg) {
    clear(this.screensRoot);
    this.screenName = name;
    if (!name) return;
    if (menuScreens[name] && this.mode === 'run') {
      this.mode = 'menu';
    }
    if (menuScreens[name] && this.mode !== 'attract') this.startAttract();
    if (menuScreens[name] && name !== 'results') this.audio.playMusic('menu');
    let node;
    switch (name) {
      case 'title': node = screens.titleScreen(this); break;
      case 'menu': node = screens.mainMenu(this); break;
      case 'prerun': node = screens.prerunScreen(this); break;
      case 'shop': node = screens.shopScreen(this); break;
      case 'arsenal': node = screens.arsenalScreen(this, arg); break;
      case 'achievements': node = screens.achievementsScreen(this); break;
      case 'settings': node = screens.settingsScreen(this); break;
      case 'results': node = screens.resultsScreen(this, arg.result, arg.info); break;
      default: break;
    }
    if (node) this.screensRoot.appendChild(node);
    if (name !== 'title') this.sfx('click', { volume: 0.6 });
  }

  back() {
    this.sfx('back');
    if (this.returnToPause) {
      this.returnToPause = false;
      clear(this.screensRoot);
      this.screenName = '';
      this.openPause();
      return;
    }
    this.showScreen('menu');
  }

  openModal(node) {
    this.modals.push(node);
    this.modalsRoot.appendChild(node);
    this.input.reset();
    return node;
  }

  closeModal(node) {
    const target = node || this.modals[this.modals.length - 1];
    if (!target) return;
    const index = this.modals.indexOf(target);
    if (index >= 0) this.modals.splice(index, 1);
    target.remove();
  }

  closeAllModals() {
    for (const node of this.modals) node.remove();
    this.modals.length = 0;
  }

  confirm(text, onYes) {
    this.openModal(screens.confirmModal(this, text, onYes));
  }

  promptContinue() {
    this.openModal(screens.continueModal(this, this.savedRun.checkpoint));
  }

  startRun(characterId, difficulty) {
    if (!this.save.characters.includes(characterId)) return;
    if (this.savedRun) this.abandonRun(true);
    this.closeAllModals();
    this.save.character = characterId;
    this.persist();
    this.world = this.makeWorld({ characterId, difficulty, seed: (Math.random() * 4294967296) >>> 0 });
    this.beginRunMode();
    this.sfx('meow');
  }

  continueRun() {
    const saved = this.savedRun;
    if (!saved) return;
    const checkpoint = saved.checkpoint;
    this.world = this.makeWorld({ characterId: checkpoint.characterId, difficulty: checkpoint.difficulty, resume: checkpoint, seed: (Math.random() * 4294967296) >>> 0 });
    this.beginRunMode();
  }

  beginRunMode() {
    this.mode = 'run';
    this.world.heroSprite = characters[this.world.characterId].sprite;
    this.bot = null;
    this.view.particles.clear();
    this.view.numbers.length = 0;
    clear(this.screensRoot);
    this.screenName = '';
    this.hud.build();
    this.hudRoot.classList.remove('hidden');
    this.input.enabled = true;
    this.input.reset();
    this.runStart = performance.now();
    this.onZoneStart(this.world.zoneIndex);
    if (this.save.stats.runs === 0 && this.world.zoneIndex === 0) this.showHint();
  }

  showHint() {
    const hint = el('div', 'hint');
    hint.appendChild(el('div', '', t('hint.move')));
    hint.appendChild(el('div', 'sub', t('hint.moveSub')));
    document.getElementById('app').appendChild(hint);
    const remove = () => {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 600);
    };
    setTimeout(remove, 6500);
    window.addEventListener('pointerdown', () => setTimeout(remove, 1500), { once: true });
  }

  abandonRun(silent) {
    const saved = this.savedRun;
    if (!saved) return;
    const checkpoint = saved.checkpoint;
    const diff = difficulties[checkpoint.difficulty];
    const gold = Math.round(checkpoint.gold * diff.gold);
    this.save.gold += gold;
    this.save.stats.goldEarned += gold;
    this.save.stats.runs++;
    this.savedRun = null;
    clearRun();
    this.persist();
    if (!silent) this.showScreen('menu');
  }

  onZoneStart(index) {
    const zone = zones[index];
    this.audio.playMusic(zone.music);
    if (this.mode === 'run') {
      this.toast(t('zone.label', { n: index + 1 }), 'big', 1800);
      this.toast(tr(zone.name), '', 2200);
    }
  }

  running() {
    if (!this.world) return false;
    if (this.mode === 'attract') return true;
    return this.mode === 'run' && this.modals.length === 0 && !this.world.paused && !this.transitioning;
  }

  frame(now) {
    requestAnimationFrame(this.frame);
    const cap = this.save.settings.fps >= 120 ? 0 : 1000 / 62;
    if (now - this.lastRender < cap) return;
    const elapsed = this.lastTime ? now - this.lastTime : 16;
    this.lastTime = now;
    this.lastRender = now;
    const dt = Math.min(elapsed / 1000, 0.05);
    if (this.running()) {
      const world = this.world;
      if (this.mode === 'attract') {
        this.bot.update(dt);
        if (world.zoneTime > world.zone.duration - 20 || world.result) {
          this.startAttract();
          return;
        }
      } else if (this.autoplay) {
        if (!this.autoBot || this.autoBot.world !== world) this.autoBot = new Bot(world, 0.75, 5);
        this.autoBot.update(dt);
      } else {
        const move = this.input.read();
        world.input.x = move.x;
        world.input.y = move.y;
      }
      const steps = Math.max(1, Math.ceil(dt / (1 / 60)));
      for (let i = 0; i < steps; i++) world.update(dt / steps);
      if (this.mode === 'attract') this.autoLevel();
      else this.processWorld();
    }
    this.view.update(this.running() ? dt : dt * 0.25);
    if (this.world) this.view.render(this.world);
    if (this.mode === 'run' && this.world) this.hud.update(this.world);
    if (this.view.flashT > 0) {
      this.view.flashT -= dt;
      this.hurtOverlay.style.opacity = String(Math.max(0, this.view.flashT * 3));
    }
    const low = this.mode === 'run' && this.world && this.world.player.alive && this.world.player.hp < this.world.player.maxHp * 0.25;
    if (low !== this.lowHpOn) {
      this.lowHpOn = low;
      this.lowHpOverlay.classList.toggle('on', low);
    }
  }

  processWorld() {
    const world = this.world;
    if (this.autoplay) this.autoResolve();
    for (const event of world.events.splice(0)) {
      if (event.type === 'zoneClear') this.openCamp();
      else if (event.type === 'victory' || event.type === 'gameOver') {
        this.endRun(world.result);
        return;
      }
    }
    if (this.modals.length > 0) return;
    if (world.pendingLevelUps > 0) this.openLevelUp();
    else if (world.pendingChests.length > 0) this.openChest();
  }

  autoResolve() {
    const world = this.world;
    const bot = this.autoBot || new Bot(world, 0.75, 5);
    while (world.pendingLevelUps > 0) world.chooseLevelUp(bot.choose(world.levelUpChoices()));
    while (world.pendingChests.length > 0) {
      const kind = world.pendingChests.shift();
      applyChest(world, world.openChest(kind));
      if (kind === 'boss') world.completeZone();
    }
    const clear = world.events.findIndex((e) => e.type === 'zoneClear');
    if (clear >= 0) {
      world.events.splice(clear, 1);
      campHeal(world);
      this.chooseBlessing(bot.chooseBlessing(rollBlessings(world)));
    }
  }

  debugJump(zoneIndex, levels = 0, bossNow = false) {
    const world = this.world;
    if (!world || this.mode !== 'run') return;
    for (let i = 0; i < levels; i++) {
      world.player.level++;
      world.pendingLevelUps++;
    }
    const bot = new Bot(world, 0.75, 5);
    while (world.pendingLevelUps > 0) world.chooseLevelUp(bot.choose(world.levelUpChoices()));
    if (zoneIndex !== world.zoneIndex) {
      world.startZone(zoneIndex);
      this.onZoneStart(zoneIndex);
    }
    if (bossNow) world.zoneTime = world.zone.duration - 0.5;
  }

  openLevelUp(choices) {
    const world = this.world;
    this.currentChoices = choices || world.levelUpChoices();
    this.audio.duck(0.45);
    this.openModal(screens.levelUpModal(this, world, this.currentChoices));
  }

  pickChoice(choice) {
    this.closeModal();
    this.world.chooseLevelUp(choice);
    this.sfx(choice.type === 'evolution' ? 'evolve' : 'select');
    this.audio.unduck();
    this.sfx('click');
  }

  rerollChoices() {
    const world = this.world;
    if (world.rerolls <= 0) return;
    world.rerolls--;
    this.closeModal();
    this.sfx('click');
    this.openLevelUp(world.levelUpChoices());
  }

  skipChoice() {
    const world = this.world;
    if (world.skips <= 0) return;
    world.skips--;
    world.pendingLevelUps = Math.max(0, world.pendingLevelUps - 1);
    this.closeModal();
    this.audio.unduck();
    this.sfx('back');
  }

  banishChoice(choice) {
    const world = this.world;
    if (world.banishes <= 0) return;
    world.banishes--;
    world.banished.add(choice.id);
    this.closeModal();
    this.sfx('back');
    const remaining = this.currentChoices.filter((c) => c !== choice);
    const fresh = world.levelUpChoices().filter((c) => !remaining.some((r) => r.id === c.id && r.type === c.type));
    while (remaining.length < 3 && fresh.length > 0) remaining.push(fresh.shift());
    this.openLevelUp(remaining.length > 0 ? remaining : world.levelUpChoices());
  }

  openChest() {
    const world = this.world;
    const kind = world.pendingChests.shift();
    const contents = world.openChest(kind);
    this.audio.duck(0.4);
    this.openModal(screens.chestModal(this, world, contents));
  }

  collectChest(contents) {
    const world = this.world;
    applyChest(world, contents);
    for (const item of contents.items) {
      if (item.type === 'evolution') this.toast(t('toast.evolve', { name: tr(evolutions[weaponDefs[item.id].evolution].name) }), 'big');
    }
    this.closeModal();
    this.audio.unduck();
    this.sfx('coin');
    if (contents.kind === 'boss') world.completeZone();
  }

  openCamp() {
    const world = this.world;
    campHeal(world);
    this.sfx('zoneClear');
    this.audio.duck(0.5);
    this.openModal(screens.campModal(this, world, rollBlessings(world)));
  }

  chooseBlessing(id) {
    const world = this.world;
    applyBlessing(world, id);
    this.closeModal();
    this.audio.unduck();
    this.sfx('select');
    this.fadeOverlay.classList.add('on');
    this.transitioning = true;
    setTimeout(() => {
      this.transitioning = false;
      this.fadeOverlay.classList.remove('on');
    }, 380);
    world.advanceZone();
    this.savedRun = { checkpoint: world.checkpoint(), savedAt: Date.now() };
    writeRun(this.savedRun);
    this.save.stats.bestZone = Math.max(this.save.stats.bestZone, world.zoneIndex);
    this.persist();
    this.view.particles.clear();
    this.onZoneStart(world.zoneIndex);
  }

  openPause() {
    if (this.mode !== 'run' || this.modals.length > 0) return;
    this.sfx('click');
    this.audio.duck(0.35);
    this.openModal(screens.pauseModal(this, this.world));
  }

  resumeGame() {
    this.closeModal();
    this.audio.unduck();
    this.sfx('click');
  }

  openSettingsFromPause() {
    this.closeModal();
    this.returnToPause = true;
    clear(this.screensRoot);
    this.screenName = 'settings';
    this.screensRoot.appendChild(screens.settingsScreen(this));
  }

  quitRun() {
    this.closeAllModals();
    this.audio.unduck();
    this.world.finish(false);
    this.endRun(this.world.result);
  }

  endRun(result) {
    if (!result || this.mode !== 'run') return;
    this.mode = 'menu';
    this.closeAllModals();
    this.audio.unduck();
    this.hudRoot.classList.add('hidden');
    this.input.reset();
    const save = this.save;
    const stats = save.stats;
    const diff = difficulties[result.difficulty];
    const totalGold = Math.round(result.gold * diff.gold);
    save.gold += totalGold;
    stats.runs++;
    if (result.victory) stats.wins++;
    else stats.deaths++;
    stats.kills += result.kills;
    stats.playTime += result.time;
    stats.goldEarned += totalGold;
    stats.bestTime = Math.max(stats.bestTime, result.time);
    stats.bestLevel = Math.max(stats.bestLevel, result.level);
    stats.bestZone = Math.max(stats.bestZone, result.victory ? zones.length - 1 : result.zoneReached);
    for (const id in result.stats.bossKills) stats.bossKills[id] = (stats.bossKills[id] || 0) + result.stats.bossKills[id];
    for (const id in result.stats.evolved) stats.evolved[id] = true;
    stats.fishEaten += result.stats.fishEaten;
    stats.flawlessZones += result.stats.flawlessZones;
    stats.chests += result.stats.chests;
    stats.eliteKills += result.stats.eliteKills;
    const newBlueprints = [];
    for (const id of result.blueprints) {
      if (!save.blueprints.includes(id) && !save.unlocked.includes(id)) {
        save.blueprints.push(id);
        newBlueprints.push(id);
      }
    }
    const unlocks = [];
    if (result.victory) {
      save.difficultyBeaten = Math.max(save.difficultyBeaten, result.difficulty);
      const next = Math.min(difficulties.length - 1, result.difficulty + 1);
      if (next > save.difficultyUnlocked) {
        save.difficultyUnlocked = next;
        unlocks.push(tr(difficulties[next].name));
      }
    }
    for (const ach of achievements) {
      if (save.achievements[ach.id] || !ach.check(save)) continue;
      save.achievements[ach.id] = true;
      save.gold += ach.gold;
      unlocks.push(`${tr(ach.name)} (+${ach.gold})`);
      for (const id in characters) {
        if (characters[id].unlock === ach.id && !save.characters.includes(id)) {
          save.characters.push(id);
          unlocks.push(tr(characters[id].name) + ' — ' + tr(characters[id].title));
        }
      }
    }
    this.savedRun = null;
    clearRun();
    this.persist();
    this.sfx(result.victory ? 'victory' : 'defeat');
    this.audio.stopMusic(0.3);
    setTimeout(() => {
      if (this.mode !== 'run') this.audio.playMusic('menu', 1.5);
    }, result.victory ? 4200 : 2600);
    const info = { totalGold, bonusGold: totalGold - result.gold, blueprints: newBlueprints, unlocks };
    setTimeout(() => {
      this.startAttract();
      clear(this.screensRoot);
      this.screenName = 'results';
      this.screensRoot.appendChild(screens.resultsScreen(this, result, info));
    }, result.victory ? 400 : 200);
  }

  selectCharacter(id) {
    if (!this.save.characters.includes(id)) return;
    this.save.character = id;
    this.persist();
  }

  upgradeCost(id) {
    const level = this.save.meta[id] || 0;
    return upgrades[id].costs[level];
  }

  canAffordSomething() {
    for (const id in upgrades) {
      const cost = this.upgradeCost(id);
      if (cost !== undefined && this.save.gold >= cost) return true;
    }
    for (const id of this.save.blueprints) if (this.save.gold >= (blueprintCosts[id] || 200)) return true;
    return false;
  }

  buyUpgrade(id) {
    const cost = this.upgradeCost(id);
    if (cost === undefined || this.save.gold < cost) {
      this.sfx('error');
      return;
    }
    this.save.gold -= cost;
    this.save.meta[id] = (this.save.meta[id] || 0) + 1;
    this.persist();
    this.sfx('buy');
    this.buzz(20);
    const scroll = this.screensRoot.querySelector('.scroll');
    const top = scroll ? scroll.scrollTop : 0;
    this.showScreen('shop');
    const next = this.screensRoot.querySelector('.scroll');
    if (next) next.scrollTop = top;
  }

  refundAll() {
    let total = 0;
    for (const id in this.save.meta) {
      const level = this.save.meta[id];
      for (let i = 0; i < level; i++) total += upgrades[id].costs[i];
    }
    this.save.meta = {};
    this.save.gold += total;
    this.persist();
    this.sfx('coin');
    this.showScreen('shop');
  }

  unlockBlueprint(id) {
    const cost = blueprintCosts[id] || 200;
    if (this.save.gold < cost) {
      this.sfx('error');
      return;
    }
    this.save.gold -= cost;
    this.save.blueprints = this.save.blueprints.filter((b) => b !== id);
    if (!this.save.unlocked.includes(id)) this.save.unlocked.push(id);
    this.persist();
    this.sfx('buy');
    this.buzz(25);
    const tab = weaponDefs[id] ? 'weapons' : 'passives';
    this.showScreen('arsenal', tab);
  }

  setSetting(key, value) {
    this.save.settings[key] = value;
    if (key === 'lang') setLang(value);
    this.applySettings();
    this.persist();
  }

  resetProgress() {
    resetAll();
    const lang = this.save.settings.lang;
    this.save = defaultSave();
    this.save.settings.lang = lang;
    this.savedRun = null;
    this.persist();
    this.showScreen('title');
  }

  onBack() {
    const top = this.modals[this.modals.length - 1];
    if (top) {
      if (top.querySelector('.confirmBox')) {
        this.closeModal(top);
        return true;
      }
      if (top.querySelector('.modalTitle') && top.querySelector('.modalTitle').textContent === t('pause.title')) {
        this.resumeGame();
        return true;
      }
      return true;
    }
    if (this.mode === 'run') {
      if (this.screenName === 'settings') {
        this.back();
        return true;
      }
      this.openPause();
      return true;
    }
    if (this.screenName && this.screenName !== 'menu' && this.screenName !== 'title') {
      this.back();
      return true;
    }
    if (this.screenName === 'menu') {
      this.confirm(t('menu.exitConfirm'), () => exitApp());
      return true;
    }
    return false;
  }

  onAppPause() {
    if (this.mode === 'run' && this.modals.length === 0) this.openPause();
    this.audio.suspend();
    this.persist();
  }

  onAppResume() {
    this.audio.resume();
    this.lastTime = 0;
  }

  onWorldFx(type, a, b, c, d) {
    const world = this.world;
    if (!world || (world.fx !== this.fxHook)) return;
    this.view.onEvent(world, type, a, b, c, d);
    const attract = this.mode === 'attract';
    if (attract && type !== 'zoneStart') return;
    switch (type) {
      case 'sfx':
        this.sfx(a, { volume: weaponSfx[a] || 0.4 });
        break;
      case 'damage':
        this.sfx('hit', { volume: 0.18, gap: 0.05, limit: 3 });
        break;
      case 'kill':
        this.sfx('pop', { volume: 0.22, gap: 0.04, limit: 4 });
        break;
      case 'playerHurt':
        this.sfx('hurt', { volume: 0.7, gap: 0.2 });
        this.buzz(35);
        break;
      case 'playerDeath':
        this.sfx('death');
        this.buzz(300);
        this.audio.stopMusic(1.2);
        break;
      case 'levelUp':
        this.sfx('levelup', { volume: 0.7 });
        this.buzz(15);
        break;
      case 'gem':
        this.sfx('gem', { volume: 0.25, gap: 0.03, pitch: 1 + Math.min(0.5, (world.player.xp / world.player.xpNext) * 0.5), variance: 0.02 });
        break;
      case 'coin':
        this.sfx('coin', { volume: 0.4, gap: 0.05 });
        break;
      case 'heal':
        this.sfx('heal', { volume: 0.5, gap: 0.3 });
        break;
      case 'magnet':
        this.sfx('magnet');
        break;
      case 'bomb':
        this.sfx('bomb');
        this.buzz(120);
        break;
      case 'clock':
        this.sfx('freeze');
        break;
      case 'chestPickup':
        this.sfx('chestPickup');
        this.buzz(30);
        break;
      case 'blueprint':
        this.sfx('blueprint');
        this.toast(t('toast.blueprint', { name: tr((weaponDefs[a] || passiveDefs[a]).name) }), 'warn', 2600);
        break;
      case 'eliteSpawn':
        this.sfx('warning');
        this.toast(t('toast.elite'), 'warn');
        break;
      case 'eliteDeath':
        this.sfx('eliteDie');
        this.buzz(60);
        break;
      case 'waveWarning':
        this.toast(t(a === 'ring' ? 'toast.ring' : 'toast.swarm'), 'warn', 1600);
        break;
      case 'bossStart':
        this.sfx('bossRoar');
        this.buzz(150);
        this.toast(t('toast.boss', { name: tr(a.bossDef.name) }), 'big', 2400);
        this.audio.playMusic(world.zoneIndex === zones.length - 1 ? 'final' : 'boss', 0.5);
        break;
      case 'bossPhase':
        this.sfx('bossRoar', { pitch: 1.15 });
        this.toast(t('toast.phase', { name: tr(a.bossDef.name) }), 'warn');
        break;
      case 'bossDeath':
        this.sfx('bossDie');
        this.buzz(400);
        this.toast(t('toast.bossDown', { name: tr(a.bossDef.name) }), 'big', 2600);
        this.audio.playMusic(world.zone.music, 2);
        break;
      case 'evolve':
        this.sfx('evolve');
        break;
      case 'explosion':
        this.sfx('boom', { volume: 0.3, gap: 0.06 });
        break;
      case 'explode':
        this.sfx('boom', { volume: 0.45 });
        break;
      case 'bossLand':
        this.sfx('bossLand', { volume: 0.6 });
        break;
      case 'bossRoar':
        this.sfx('bossRoar', { volume: 0.7 });
        break;
      case 'bossShoot':
        this.sfx('bossShoot', { volume: 0.5 });
        break;
      case 'bossCast':
        this.sfx('bossCast', { volume: 0.55 });
        break;
      case 'bossJump':
        this.sfx('bossCast', { volume: 0.4, pitch: 1.3 });
        break;
      case 'summon':
        this.sfx('summon', { volume: 0.5 });
        break;
      case 'teleport':
        this.sfx('teleport', { volume: 0.5 });
        break;
      case 'hazardTrigger':
        if (a.dmg > 0) this.sfx('bossLand', { volume: 0.35, gap: 0.08, pitch: 1.4 });
        break;
      case 'revive':
        this.sfx('revive');
        break;
      case 'zoneStart':
        break;
      default:
        break;
    }
  }
}
