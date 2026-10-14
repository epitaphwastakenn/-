import { el, icon, animatedIcon, button, clear, coinLabel } from './dom.js';
import { t, tr, describeChange, describeStat, getLang } from '../app/i18n.js';
import { weapons as weaponDefs, evolutions, passives as passiveDefs, maxWeaponLevel, maxPassiveLevel } from '../data/items.js';
import { characters, upgrades, blueprintCosts, difficulties, blessings, achievements } from '../data/meta.js';
import { zones } from '../data/zones.js';
import { formatTime, formatNumber } from '../core/mathx.js';

// FUNCTIONS
function header(app, title, back = true) {
  const node = el('div', 'header');
  if (back) node.appendChild(button('<', 'iconBtn small', () => app.back()));
  node.appendChild(el('h2', '', title));
  const gold = el('div', 'goldPill');
  gold.appendChild(icon('ic_coin', 2));
  gold.appendChild(el('span', '', formatNumber(app.save.gold)));
  node.appendChild(gold);
  return node;
}

function stars(level, next, max) {
  const node = el('div', 'stars');
  for (let i = 1; i <= max; i++) node.appendChild(el('div', 'star' + (i <= level ? ' on' : i === next ? ' next' : '')));
  return node;
}

function itemIcon(id) {
  const def = weaponDefs[id] || passiveDefs[id] || evolutions[id];
  return def ? def.icon : 'missing';
}

export function titleScreen(app) {
  const screen = el('div', 'screen titleScreen');
  const logo = el('div', 'logo');
  logo.appendChild(el('div', 'logoText', 'Purrvivors'));
  logo.appendChild(el('div', 'logoSub', t('title.subtitle')));
  screen.appendChild(logo);
  const hero = animatedIcon('hero_bigode', 6, 5);
  hero.style.animation = 'bob 1.6s ease-in-out infinite';
  screen.appendChild(hero);
  screen.appendChild(el('div', 'tapStart', t('title.tap')));
  screen.addEventListener('click', () => app.showScreen('menu'));
  return screen;
}

export function mainMenu(app) {
  const screen = el('div', 'screen titleScreen');
  const top = el('div', 'row');
  top.style.width = '100%';
  top.style.justifyContent = 'flex-end';
  const gold = el('div', 'goldPill');
  gold.appendChild(icon('ic_coin', 2));
  gold.appendChild(el('span', '', formatNumber(app.save.gold)));
  top.appendChild(gold);
  screen.appendChild(top);
  const logo = el('div', 'logo');
  logo.style.marginTop = '2vh';
  logo.appendChild(el('div', 'logoText', 'Purrvivors'));
  const sub = el('div', 'logoSub', tr(difficulties[app.save.difficulty].name));
  logo.appendChild(sub);
  screen.appendChild(logo);
  const cat = animatedIcon(characters[app.save.character].sprite, 6, 5);
  cat.style.animation = 'bob 1.6s ease-in-out infinite';
  screen.appendChild(cat);
  const buttons = el('div', 'menuButtons');
  if (app.savedRun) {
    buttons.appendChild(button(t('menu.continue'), 'green big wide', () => app.promptContinue()));
  }
  buttons.appendChild(button(t('menu.play'), 'primary big wide', () => app.showScreen('prerun')));
  const grid = el('div', 'menuGrid');
  const upgradesBtn = button(t('menu.upgrades'), 'blue', () => app.showScreen('shop'));
  if (app.canAffordSomething()) upgradesBtn.appendChild(el('div', 'newBadge', '!'));
  grid.appendChild(upgradesBtn);
  const arsenalBtn = button(t('menu.arsenal'), 'purple', () => app.showScreen('arsenal'));
  if (app.save.blueprints.length > 0) arsenalBtn.appendChild(el('div', 'newBadge', String(app.save.blueprints.length)));
  grid.appendChild(arsenalBtn);
  grid.appendChild(button(t('menu.achievements'), '', () => app.showScreen('achievements')));
  grid.appendChild(button(t('menu.settings'), '', () => app.showScreen('settings')));
  buttons.appendChild(grid);
  buttons.appendChild(el('div', 'version', 'v' + app.version));
  screen.appendChild(buttons);
  return screen;
}

export function prerunScreen(app) {
  const screen = el('div', 'screen dim');
  screen.appendChild(header(app, t('run.chooseCat')));
  const scroll = el('div', 'scroll');
  const grid = el('div', 'catCards');
  const detail = el('div', 'panel catDetail');
  let selected = app.save.character;
  const renderDetail = () => {
    clear(detail);
    const def = characters[selected];
    const unlocked = app.save.characters.includes(selected);
    const row = el('div', 'row');
    row.appendChild(animatedIcon(def.sprite, 4, 5));
    const body = el('div', 'grow');
    body.appendChild(el('div', 'title', tr(def.name)));
    body.appendChild(el('div', 'desc', tr(def.title)));
    row.appendChild(body);
    detail.appendChild(row);
    const weapon = weaponDefs[def.weapon];
    const startRow = el('div', 'row');
    startRow.style.marginTop = '8px';
    startRow.appendChild(el('span', 'desc', t('cats.start') + ':'));
    startRow.appendChild(icon(weapon.icon, 2));
    startRow.appendChild(el('span', '', tr(weapon.name)));
    detail.appendChild(startRow);
    const bonusRow = el('div', 'row');
    bonusRow.style.marginTop = '4px';
    bonusRow.appendChild(el('span', 'desc', t('cats.bonus') + ':'));
    bonusRow.appendChild(el('span', '', Object.keys(def.bonus).map((k) => describeStat(k, def.bonus[k])).join(', ')));
    detail.appendChild(bonusRow);
    if (!unlocked) {
      const ach = achievements.find((a) => a.id === def.unlock);
      const lock = el('div', 'desc', '🔒 ' + (ach ? tr(ach.desc) : t('run.locked')));
      lock.style.marginTop = '8px';
      lock.style.color = '#ff9eb8';
      detail.appendChild(lock);
    }
    startBtn.disabled = !unlocked;
  };
  for (const id in characters) {
    const def = characters[id];
    const unlocked = app.save.characters.includes(id);
    const card = el('div', 'catCard' + (id === selected ? ' selected' : '') + (unlocked ? '' : ' locked'));
    card.appendChild(icon(def.sprite + '_0', 4));
    card.appendChild(el('div', 'catName', unlocked ? tr(def.name) : '???'));
    card.addEventListener('click', () => {
      selected = id;
      for (const node of grid.children) node.classList.remove('selected');
      card.classList.add('selected');
      if (unlocked) app.selectCharacter(id);
      app.sfx('click');
      renderDetail();
    });
    grid.appendChild(card);
  }
  scroll.appendChild(grid);
  scroll.appendChild(detail);
  const diffPanel = el('div', 'panel');
  diffPanel.appendChild(el('div', 'title', t('run.difficulty')));
  const diffRow = el('div', 'diffRow');
  const diffName = el('div', 'diffName');
  const diffInfo = el('div', 'desc');
  diffInfo.style.textAlign = 'center';
  const updateDiff = () => {
    const d = difficulties[app.save.difficulty];
    diffName.textContent = tr(d.name);
    diffInfo.textContent = app.save.difficulty === 0 ? '' : `HP ×${d.hp} · ${getLang() === 'pt' ? 'dano' : 'damage'} ×${d.dmg} · ${t('common.coins')} ×${d.gold}`;
  };
  diffRow.appendChild(button('<', 'small', () => {
    app.save.difficulty = Math.max(0, app.save.difficulty - 1);
    updateDiff();
    app.persist();
  }));
  diffRow.appendChild(diffName);
  diffRow.appendChild(button('>', 'small', () => {
    app.save.difficulty = Math.min(app.save.difficultyUnlocked, app.save.difficulty + 1);
    updateDiff();
    app.persist();
  }));
  diffPanel.appendChild(diffRow);
  diffPanel.appendChild(diffInfo);
  scroll.appendChild(diffPanel);
  updateDiff();
  screen.appendChild(scroll);
  const startBtn = button(t('run.start'), 'primary big wide', () => app.startRun(selected, app.save.difficulty));
  screen.appendChild(startBtn);
  renderDetail();
  return screen;
}

export function shopScreen(app) {
  const screen = el('div', 'screen dim');
  screen.appendChild(header(app, t('shop.title')));
  const scroll = el('div', 'scroll');
  for (const id in upgrades) {
    const def = upgrades[id];
    const level = app.save.meta[id] || 0;
    const max = def.costs.length;
    const item = el('div', 'listItem');
    const box = el('div', 'iconBox');
    box.appendChild(icon(def.icon, 2.5));
    item.appendChild(box);
    const body = el('div', 'grow');
    body.appendChild(el('div', 'title', tr(def.name)));
    body.appendChild(el('div', 'desc', describeStat(def.stat, def.per) + (max > 1 ? ' · ' + t('shop.level', { n: level, max }) : '')));
    const pips = el('div', 'pips');
    for (let i = 0; i < max; i++) pips.appendChild(el('div', 'pip' + (i < level ? ' on' : '')));
    body.appendChild(pips);
    item.appendChild(body);
    if (level >= max) {
      item.appendChild(el('div', 'tag green', t('shop.max')));
    } else {
      const cost = app.upgradeCost(id);
      const buy = button('', 'small' + (app.save.gold >= cost ? ' green' : ''), () => app.buyUpgrade(id));
      buy.appendChild(coinLabel(cost, 2));
      if (app.save.gold < cost) buy.disabled = true;
      item.appendChild(buy);
    }
    scroll.appendChild(item);
  }
  const refund = button(t('shop.refund'), 'small red', () => app.confirm(t('shop.refundConfirm'), () => app.refundAll()));
  refund.style.margin = '10px auto';
  refund.style.display = 'flex';
  scroll.appendChild(refund);
  screen.appendChild(scroll);
  return screen;
}

export function arsenalScreen(app, tab = 'weapons') {
  const screen = el('div', 'screen dim');
  screen.appendChild(header(app, t('arsenal.title')));
  const tabs = el('div', 'tabs');
  const makeTab = (id, label) => {
    const node = button(label, id === tab ? 'active' : '', () => app.showScreen('arsenal', id));
    tabs.appendChild(node);
  };
  makeTab('weapons', t('arsenal.weapons'));
  makeTab('passives', t('arsenal.passives'));
  makeTab('recipes', t('arsenal.recipes'));
  screen.appendChild(tabs);
  const scroll = el('div', 'scroll');
  const isUnlocked = (id) => {
    const def = weaponDefs[id] || passiveDefs[id];
    return def.unlocked || app.save.unlocked.includes(id);
  };
  if (tab === 'weapons' || tab === 'passives') {
    const source = tab === 'weapons' ? weaponDefs : passiveDefs;
    for (const id in source) {
      const def = source[id];
      const unlocked = isUnlocked(id);
      const found = app.save.blueprints.includes(id);
      const item = el('div', 'listItem' + (!unlocked && !found ? ' locked' : ''));
      const box = el('div', 'iconBox');
      box.appendChild(unlocked || found ? icon(def.icon, 2.5) : icon('ic_lock', 2.5));
      item.appendChild(box);
      const body = el('div', 'grow');
      body.appendChild(el('div', 'title', unlocked || found ? tr(def.name) : '???'));
      const text = tab === 'weapons' ? tr(def.desc) : describeStat(def.stat, def.per) + ' / ' + t('levelup.level', { n: 1 });
      body.appendChild(el('div', 'desc', unlocked || found ? text : t('arsenal.lockedHint')));
      item.appendChild(body);
      if (unlocked) {
        item.appendChild(el('div', 'tag green', t('arsenal.owned')));
      } else if (found) {
        const cost = blueprintCosts[id] || 200;
        const buy = button('', 'small' + (app.save.gold >= cost ? ' green' : ''), () => app.unlockBlueprint(id));
        buy.appendChild(coinLabel(cost, 2));
        if (app.save.gold < cost) buy.disabled = true;
        item.appendChild(buy);
      }
      scroll.appendChild(item);
    }
  } else {
    for (const id in weaponDefs) {
      const def = weaponDefs[id];
      const evo = evolutions[def.evolution];
      const pair = passiveDefs[def.pair];
      const known = isUnlocked(id);
      const discovered = app.save.stats.evolved[id];
      const item = el('div', 'listItem' + (known ? '' : ' locked'));
      const recipe = el('div', 'recipe');
      recipe.appendChild(known ? icon(def.icon, 2) : icon('ic_lock', 2));
      recipe.appendChild(el('span', '', '+'));
      recipe.appendChild(known ? icon(pair.icon, 2) : icon('ic_lock', 2));
      recipe.appendChild(el('span', '', '='));
      recipe.appendChild(discovered || known ? icon(evo.icon, 2.5) : icon('ic_lock', 2));
      item.appendChild(recipe);
      const body = el('div', 'grow');
      body.appendChild(el('div', 'title', known ? tr(evo.name) : '???'));
      body.appendChild(el('div', 'desc', known ? `${tr(def.name)} (${t('levelup.level', { n: maxWeaponLevel })}) + ${tr(pair.name)}` : t('arsenal.lockedHint')));
      if (known) body.appendChild(el('div', 'desc', tr(evo.desc)));
      item.appendChild(body);
      scroll.appendChild(item);
    }
  }
  screen.appendChild(scroll);
  return screen;
}

export function achievementsScreen(app) {
  const screen = el('div', 'screen dim');
  screen.appendChild(header(app, t('ach.title')));
  const scroll = el('div', 'scroll');
  const stats = app.save.stats;
  const statsPanel = el('div', 'panel');
  statsPanel.appendChild(el('div', 'title', t('stats.title')));
  const grid = el('div', 'resultStats');
  grid.style.marginTop = '8px';
  const entries = [
    [t('stats.runs'), stats.runs], [t('stats.wins'), stats.wins], [t('stats.kills'), formatNumber(stats.kills)], [t('stats.playTime'), formatTime(stats.playTime).replace(/^(\d+):/, (m, h) => h + ':')],
    [t('stats.bestTime'), formatTime(stats.bestTime)], [t('stats.bestLevel'), stats.bestLevel], [t('stats.goldEarned'), formatNumber(stats.goldEarned)], [t('stats.bossKills'), Object.values(stats.bossKills).reduce((a, b) => a + b, 0)],
  ];
  for (const [label, value] of entries) {
    const box = el('div', 'statBox');
    box.appendChild(el('div', 'statLabel', label));
    box.appendChild(el('div', 'statValue', String(value)));
    grid.appendChild(box);
  }
  statsPanel.appendChild(grid);
  scroll.appendChild(statsPanel);
  for (const ach of achievements) {
    const done = !!app.save.achievements[ach.id];
    const item = el('div', 'listItem' + (done ? ' done' : ''));
    const box = el('div', 'iconBox');
    box.appendChild(icon(done ? 'ic_trophy' : 'ic_lock', 2.5));
    item.appendChild(box);
    const body = el('div', 'grow');
    body.appendChild(el('div', 'title', tr(ach.name)));
    body.appendChild(el('div', 'desc', tr(ach.desc)));
    item.appendChild(body);
    const reward = el('div', 'tag' + (done ? ' green' : ''));
    reward.appendChild(coinLabel(ach.gold, 1.5));
    item.appendChild(reward);
    scroll.appendChild(item);
  }
  screen.appendChild(scroll);
  return screen;
}

export function settingsScreen(app) {
  const screen = el('div', 'screen dim');
  screen.appendChild(header(app, t('settings.title')));
  const scroll = el('div', 'scroll');
  const panel = el('div', 'panel');
  const s = app.save.settings;
  const slider = (label, key) => {
    const row = el('div', 'setting');
    row.appendChild(el('div', 'label', label));
    const input = el('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.value = String(Math.round(s[key] * 100));
    input.addEventListener('input', () => app.setSetting(key, Number(input.value) / 100));
    input.addEventListener('change', () => app.sfx('click'));
    row.appendChild(input);
    panel.appendChild(row);
  };
  const toggle = (label, key, values, names) => {
    const row = el('div', 'setting');
    row.appendChild(el('div', 'label', label));
    const index = Math.max(0, values.indexOf(s[key]));
    const btn = button(names[index], 'small', () => {
      const next = (values.indexOf(app.save.settings[key]) + 1) % values.length;
      app.setSetting(key, values[next]);
      app.showScreen('settings');
    });
    row.appendChild(btn);
    panel.appendChild(row);
  };
  slider(t('settings.music'), 'music');
  slider(t('settings.sfx'), 'sfx');
  toggle(t('settings.vibration'), 'vibration', [true, false], [t('settings.on'), t('settings.off')]);
  toggle(t('settings.shake'), 'shake', [true, false], [t('settings.on'), t('settings.off')]);
  toggle(t('settings.numbers'), 'numbers', [true, false], [t('settings.on'), t('settings.off')]);
  toggle(t('settings.fps'), 'fps', [60, 120], ['60', '120']);
  toggle(t('settings.language'), 'lang', ['pt', 'en'], ['Português', 'English']);
  scroll.appendChild(panel);
  const credits = el('div', 'panel');
  credits.appendChild(el('div', 'title', t('settings.credits')));
  credits.appendChild(el('div', 'credits', t('credits.text')));
  scroll.appendChild(credits);
  const reset = button(t('settings.reset'), 'small red', () => app.confirm(t('settings.resetConfirm'), () => app.resetProgress()));
  reset.style.margin = '12px auto';
  reset.style.display = 'flex';
  scroll.appendChild(reset);
  screen.appendChild(scroll);
  return screen;
}

export function resultsScreen(app, result, info) {
  const screen = el('div', 'screen dim');
  const scroll = el('div', 'scroll');
  const title = el('div', 'modalTitle', result.victory ? t('result.victory') : t('result.defeat'));
  title.style.color = result.victory ? 'var(--yellow)' : '#ff9eb8';
  scroll.appendChild(title);
  const sub = el('div', 'modalSub', result.victory ? t('result.victoryText') : t('result.defeatText'));
  sub.style.margin = '0 auto 12px';
  scroll.appendChild(sub);
  const hero = animatedIcon(characters[result.characterId].sprite, 5, result.victory ? 8 : 2);
  hero.style.margin = '0 auto 10px';
  hero.style.display = 'block';
  if (result.victory) hero.style.animation = 'bob 0.8s ease-in-out infinite';
  scroll.appendChild(hero);
  const grid = el('div', 'resultStats');
  const add = (label, value) => {
    const box = el('div', 'statBox');
    box.appendChild(el('div', 'statLabel', label));
    box.appendChild(el('div', 'statValue', String(value)));
    grid.appendChild(box);
  };
  add(t('result.time'), formatTime(result.time));
  add(t('result.zone'), (result.victory ? zones.length : result.zoneReached + 1) + '/' + zones.length);
  add(t('result.kills'), formatNumber(result.kills));
  add(t('result.level'), result.level);
  const goldBox = el('div', 'statBox');
  goldBox.style.gridColumn = '1 / 3';
  const parts = [`${result.collectedGold} ${t('result.collected')}`, `+${result.survivalGold} ${t('result.survival')}`];
  if (info.bonusGold > 0) parts.push(`+${info.bonusGold} ${t('result.bonus')}`);
  goldBox.appendChild(el('div', 'statLabel', t('result.gold') + ' (' + parts.join(', ') + ')'));
  const goldValue = el('div', 'statValue');
  goldValue.style.color = 'var(--yellow)';
  goldValue.appendChild(coinLabel(info.totalGold, 3));
  goldBox.appendChild(goldValue);
  grid.appendChild(goldBox);
  scroll.appendChild(grid);
  const damage = el('div', 'panel');
  damage.appendChild(el('div', 'title', t('result.damage')));
  const entries = Object.entries(result.weaponDamage).sort((a, b) => b[1] - a[1]);
  const top = entries.length ? entries[0][1] : 1;
  for (const [id, value] of entries) {
    const w = result.weapons.find((x) => x.id === id);
    const def = weaponDefs[id];
    if (!def) continue;
    const row = el('div', 'dmgRow');
    row.appendChild(icon(w && w.evolved ? evolutions[def.evolution].icon : def.icon, 2));
    const bar = el('div', 'dmgBar');
    const fill = el('div', 'dmgFill');
    fill.style.width = ((value / top) * 100).toFixed(1) + '%';
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(el('div', 'dmgValue', formatNumber(value)));
    damage.appendChild(row);
  }
  scroll.appendChild(damage);
  if (info.blueprints.length > 0 || info.unlocks.length > 0) {
    const panel = el('div', 'panel');
    if (info.blueprints.length > 0) {
      panel.appendChild(el('div', 'title', t('result.blueprints')));
      const row = el('div', 'row');
      row.style.flexWrap = 'wrap';
      row.style.margin = '6px 0';
      for (const id of info.blueprints) {
        const item = el('div', 'row');
        item.appendChild(icon(itemIcon(id), 2));
        item.appendChild(el('span', '', tr((weaponDefs[id] || passiveDefs[id]).name)));
        row.appendChild(item);
      }
      panel.appendChild(row);
    }
    if (info.unlocks.length > 0) {
      panel.appendChild(el('div', 'title', t('result.unlocks')));
      for (const text of info.unlocks) panel.appendChild(el('div', 'desc', '★ ' + text));
    }
    scroll.appendChild(panel);
  }
  screen.appendChild(scroll);
  const buttons = el('div', 'row');
  buttons.style.marginTop = '8px';
  const menu = button(t('result.menu'), 'grow', () => app.showScreen('menu'));
  const again = button(t('result.again'), 'primary grow', () => app.startRun(result.characterId, result.difficulty));
  buttons.appendChild(menu);
  buttons.appendChild(again);
  screen.appendChild(buttons);
  return screen;
}

function choiceCard(app, world, choice, index, onPick) {
  const card = el('div', 'card');
  card.style.animationDelay = index * 0.06 + 's';
  const iconBox = el('div', 'cardIcon');
  const body = el('div', 'cardBody');
  let name = '';
  let desc = '';
  let levelNode = null;
  if (choice.type === 'evolution') {
    const evo = evolutions[weaponDefs[choice.id].evolution];
    card.classList.add('evo');
    iconBox.appendChild(icon(evo.icon, 3));
    name = tr(evo.name);
    desc = tr(evo.desc);
    levelNode = el('div', 'tag purple', t('levelup.evolution'));
  } else if (choice.type === 'weapon') {
    const def = weaponDefs[choice.id];
    iconBox.appendChild(icon(def.icon, 3));
    name = tr(def.name);
    desc = choice.level === 1 ? tr(def.desc) : describeChange(def.levels[choice.level - 1]);
    levelNode = choice.level === 1 ? el('div', 'tag', t('levelup.new')) : stars(choice.level - 1, choice.level, maxWeaponLevel);
    if (choice.level === 1) card.classList.add('newItem');
  } else if (choice.type === 'passive') {
    const def = passiveDefs[choice.id];
    iconBox.appendChild(icon(def.icon, 3));
    name = tr(def.name);
    desc = describeStat(def.stat, def.per) + (choice.id === 'sharkTooth' ? (getLang() === 'pt' ? ', +10% dano crítico' : ', +10% crit damage') : '');
    levelNode = choice.level === 1 ? el('div', 'tag', t('levelup.new')) : stars(choice.level - 1, choice.level, maxPassiveLevel);
    if (choice.level === 1) card.classList.add('newItem');
  } else if (choice.type === 'heal') {
    iconBox.appendChild(icon('pk_fish', 3));
    name = t('levelup.heal');
    desc = t('levelup.healDesc');
  } else {
    iconBox.appendChild(icon('ic_coin', 3));
    name = t('levelup.gold');
    desc = t('levelup.goldDesc', { n: choice.amount });
  }
  const top = el('div', 'row');
  top.style.justifyContent = 'space-between';
  top.appendChild(el('div', 'cardName', name));
  if (levelNode) top.appendChild(levelNode);
  body.appendChild(top);
  body.appendChild(el('div', 'cardDesc', desc));
  if (choice.type === 'weapon') {
    const def = weaponDefs[choice.id];
    const pair = el('div', 'cardPair');
    pair.appendChild(el('span', '', t('levelup.pair') + ':'));
    pair.appendChild(icon(passiveDefs[def.pair].icon, 1.5));
    pair.appendChild(el('span', '', tr(passiveDefs[def.pair].name)));
    body.appendChild(pair);
  } else if (choice.type === 'passive') {
    const weaponId = Object.keys(weaponDefs).find((id) => weaponDefs[id].pair === choice.id);
    if (weaponId) {
      const pair = el('div', 'cardPair');
      pair.appendChild(el('span', '', t('levelup.pair') + ':'));
      pair.appendChild(icon(weaponDefs[weaponId].icon, 1.5));
      pair.appendChild(el('span', '', tr(weaponDefs[weaponId].name)));
      body.appendChild(pair);
    }
  }
  card.appendChild(iconBox);
  card.appendChild(body);
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    onPick(choice, card);
  });
  return card;
}

export function levelUpModal(app, world, choices) {
  const modal = el('div', 'modal');
  modal.appendChild(el('div', 'modalTitle', t('levelup.title')));
  const cards = el('div', 'cards');
  let banishing = false;
  const hint = el('div', 'modalSub hidden', t('levelup.banishHint'));
  choices.forEach((choice, index) => {
    cards.appendChild(choiceCard(app, world, choice, index, (picked, card) => {
      if (banishing) {
        if (picked.type === 'weapon' || picked.type === 'passive') app.banishChoice(picked);
        return;
      }
      app.pickChoice(picked);
    }));
  });
  modal.appendChild(hint);
  modal.appendChild(cards);
  const buttons = el('div', 'modalButtons');
  if (world.rerolls > 0) buttons.appendChild(button(`${t('levelup.reroll')} (${world.rerolls})`, 'small blue', () => app.rerollChoices()));
  if (world.skips > 0) buttons.appendChild(button(`${t('levelup.skip')} (${world.skips})`, 'small', () => app.skipChoice()));
  if (world.banishes > 0) {
    const banish = button(`${t('levelup.banish')} (${world.banishes})`, 'small red', () => {
      banishing = !banishing;
      banish.classList.toggle('purple', banishing);
      hint.classList.toggle('hidden', !banishing);
      for (const card of cards.children) card.classList.toggle('banishing', banishing);
    });
    buttons.appendChild(banish);
  }
  modal.appendChild(buttons);
  return modal;
}

export function chestModal(app, world, contents) {
  const modal = el('div', 'modal');
  modal.appendChild(el('div', 'modalTitle', contents.kind === 'boss' ? t('chest.boss') : t('chest.title')));
  const box = el('div', 'chestBox');
  const rays = el('div', 'rays hidden');
  const chest = icon(contents.kind === 'boss' ? 'pk_chest_boss' : 'pk_chest', 7, 'chestSprite');
  const tap = el('div', 'tapStart', t('chest.tap'));
  tap.style.marginBottom = '0';
  box.appendChild(rays);
  box.appendChild(chest);
  box.appendChild(tap);
  modal.appendChild(box);
  const items = el('div', 'chestItems');
  const collect = button(t('chest.collect'), 'primary wide hidden', () => app.collectChest(contents));
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    tap.classList.add('hidden');
    chest.classList.add('shaking');
    app.sfx('chestShake');
    setTimeout(() => {
      chest.classList.remove('shaking');
      clear(chest);
      const openIcon = icon(contents.kind === 'boss' ? 'pk_chest_boss_open' : 'pk_chest_open', 7);
      chest.replaceWith(openIcon);
      rays.classList.remove('hidden');
      box.style.minHeight = '0';
      app.sfx('chestOpen');
      contents.items.forEach((item, index) => {
        const card = choiceCard(app, world, item, index, () => {});
        card.classList.add('chestItem');
        card.style.animationDelay = 0.15 + index * 0.25 + 's';
        card.style.cursor = 'default';
        items.appendChild(card);
        setTimeout(() => app.sfx(item.type === 'evolution' ? 'evolve' : 'chestItem'), 150 + index * 250);
      });
      const coins = el('div', 'tag');
      coins.style.alignSelf = 'center';
      coins.style.fontSize = '26px';
      coins.appendChild(coinLabel('+' + contents.gold, 2));
      coins.classList.add('chestItem');
      coins.style.animationDelay = 0.15 + contents.items.length * 0.25 + 's';
      items.appendChild(coins);
      setTimeout(() => collect.classList.remove('hidden'), 200 + contents.items.length * 250);
    }, 700);
  };
  box.addEventListener('click', open);
  modal.addEventListener('click', open);
  modal.appendChild(items);
  collect.style.marginTop = '14px';
  collect.style.maxWidth = '420px';
  modal.appendChild(collect);
  return modal;
}

export function pauseModal(app, world) {
  const modal = el('div', 'modal');
  modal.appendChild(el('div', 'modalTitle', t('pause.title')));
  const panel = el('div', 'panel');
  panel.style.width = '100%';
  panel.style.maxWidth = '420px';
  panel.appendChild(el('div', 'title', t('pause.build')));
  const list = el('div', 'col');
  list.style.marginTop = '8px';
  for (const w of world.weapons) {
    const def = weaponDefs[w.id];
    const row = el('div', 'row');
    row.appendChild(icon(w.evolved ? evolutions[def.evolution].icon : def.icon, 2));
    row.appendChild(el('span', 'grow', w.evolved ? tr(evolutions[def.evolution].name) : tr(def.name)));
    row.appendChild(w.evolved ? el('span', 'tag purple', '★') : stars(w.level, 0, maxWeaponLevel));
    list.appendChild(row);
  }
  for (const p of world.passives) {
    const def = passiveDefs[p.id];
    const row = el('div', 'row');
    row.appendChild(icon(def.icon, 2));
    row.appendChild(el('span', 'grow', tr(def.name)));
    row.appendChild(stars(p.level, 0, maxPassiveLevel));
    list.appendChild(row);
  }
  panel.appendChild(list);
  modal.appendChild(panel);
  const buttons = el('div', 'col');
  buttons.style.width = '100%';
  buttons.style.maxWidth = '420px';
  buttons.style.marginTop = '12px';
  buttons.style.gap = '12px';
  buttons.appendChild(button(t('pause.resume'), 'primary wide', () => app.resumeGame()));
  buttons.appendChild(button(t('menu.settings'), 'wide', () => app.openSettingsFromPause()));
  buttons.appendChild(button(t('pause.quit'), 'red wide', () => app.confirm(t('pause.quitConfirm'), () => app.quitRun())));
  modal.appendChild(buttons);
  return modal;
}

export function campModal(app, world, options) {
  const modal = el('div', 'modal');
  modal.appendChild(el('div', 'modalTitle', t('camp.title')));
  modal.appendChild(el('div', 'modalSub', t('camp.subtitle')));
  const sub = el('div', 'title', t('camp.choose'));
  sub.style.margin = '6px 0 10px';
  modal.appendChild(sub);
  const cards = el('div', 'cards');
  options.forEach((id, index) => {
    const def = blessings[id];
    const card = el('div', 'card blessing');
    card.style.animationDelay = index * 0.07 + 's';
    const box = el('div', 'cardIcon');
    box.appendChild(icon(def.icon, 3));
    const body = el('div', 'cardBody');
    body.appendChild(el('div', 'cardName', tr(def.name)));
    body.appendChild(el('div', 'cardDesc', tr(def.desc)));
    card.appendChild(box);
    card.appendChild(body);
    card.addEventListener('click', () => app.chooseBlessing(id));
    cards.appendChild(card);
  });
  modal.appendChild(cards);
  const next = el('div', 'modalSub', t('camp.next', { zone: tr(zones[world.zoneIndex + 1].name) }));
  next.style.marginTop = '14px';
  modal.appendChild(next);
  return modal;
}

export function confirmModal(app, text, onYes, onNo) {
  const modal = el('div', 'modal');
  const box = el('div', 'panel confirmBox');
  box.appendChild(el('div', 'confirmText', text));
  const row = el('div', 'row');
  row.style.justifyContent = 'center';
  row.appendChild(button(t('common.no'), '', () => {
    app.closeModal(modal);
    if (onNo) onNo();
  }));
  row.appendChild(button(t('common.yes'), 'red', () => {
    app.closeModal(modal);
    onYes();
  }));
  box.appendChild(row);
  modal.appendChild(box);
  return modal;
}

export function continueModal(app, run) {
  const modal = el('div', 'modal');
  const box = el('div', 'panel confirmBox');
  box.appendChild(el('div', 'title', t('run.continueTitle')));
  box.appendChild(el('div', 'confirmText', t('run.continueText', { zone: run.zoneIndex + 1 })));
  const row = el('div', 'row');
  row.style.justifyContent = 'center';
  row.appendChild(button(t('run.abandon'), 'red small', () => {
    app.closeModal(modal);
    app.confirm(t('run.abandonConfirm'), () => app.abandonRun());
  }));
  row.appendChild(button(t('menu.continue'), 'green small', () => {
    app.closeModal(modal);
    app.continueRun();
  }));
  box.appendChild(row);
  modal.appendChild(box);
  return modal;
}

export { header, stars };
