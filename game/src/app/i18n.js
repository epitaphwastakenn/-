// VARIABLES
let lang = 'pt';

const strings = {
  pt: {
    'title.tap': 'Toque para começar',
    'title.subtitle': 'Nove vidas. Uma horda.',
    'menu.play': 'Jogar',
    'menu.continue': 'Continuar corrida',
    'menu.upgrades': 'Melhorias',
    'menu.arsenal': 'Arsenal',
    'menu.cats': 'Gatos',
    'menu.achievements': 'Conquistas',
    'menu.settings': 'Ajustes',
    'menu.stats': 'Estatísticas',
    'menu.back': 'Voltar',
    'menu.exitConfirm': 'Sair do jogo?',
    'run.start': 'Começar!',
    'run.chooseCat': 'Escolha seu gato',
    'run.difficulty': 'Dificuldade',
    'run.locked': 'Bloqueado',
    'run.continueTitle': 'Corrida em andamento',
    'run.continueText': 'Você tem uma corrida salva na zona {zone}. Continuar?',
    'run.abandon': 'Abandonar',
    'run.abandonConfirm': 'Abandonar a corrida salva? As moedas dela serão recebidas.',
    'hud.level': 'Nv',
    'hud.boss': 'Chefe',
    'levelup.title': 'Subiu de nível!',
    'levelup.new': 'Novo!',
    'levelup.evolution': 'Evolução!',
    'levelup.reroll': 'Rerrolar',
    'levelup.skip': 'Pular',
    'levelup.banish': 'Banir',
    'levelup.banishHint': 'Toque numa carta para bani-la',
    'levelup.level': 'Nível {n}',
    'levelup.heal': 'Peixe Assado',
    'levelup.healDesc': 'Recupera 30% da vida.',
    'levelup.gold': 'Saco de Moedas',
    'levelup.goldDesc': '+{n} moedas.',
    'levelup.pair': 'Evolui com',
    'chest.title': 'Baú do tesouro!',
    'chest.boss': 'Baú do chefe!',
    'chest.tap': 'Toque para abrir',
    'chest.collect': 'Pegar tudo',
    'chest.coins': '+{n} moedas',
    'pause.title': 'Pausado',
    'pause.resume': 'Continuar',
    'pause.quit': 'Desistir',
    'pause.quitConfirm': 'Desistir desta corrida? Você mantém as moedas coletadas.',
    'pause.build': 'Seu equipamento',
    'camp.title': 'Zona concluída!',
    'camp.subtitle': 'Você descansa no acampamento e recupera 40% de vida.',
    'camp.choose': 'Escolha uma bênção',
    'camp.next': 'Próxima zona: {zone}',
    'result.victory': 'Vitória!',
    'result.victoryText': 'Cérbero foi derrotado e o reino está salvo!',
    'result.defeat': 'Fim da linha...',
    'result.defeatText': 'Mas um gato sempre cai de pé. Tente de novo!',
    'result.time': 'Tempo',
    'result.kills': 'Abates',
    'result.level': 'Nível',
    'result.zone': 'Zona',
    'result.gold': 'Moedas',
    'result.damage': 'Dano por arma',
    'result.blueprints': 'Plantas encontradas',
    'result.unlocks': 'Desbloqueios',
    'result.menu': 'Menu',
    'result.again': 'Jogar de novo',
    'result.bonus': 'bônus de dificuldade',
    'shop.title': 'Melhorias',
    'shop.buy': 'Comprar',
    'shop.max': 'MÁX',
    'shop.refund': 'Reembolsar tudo',
    'shop.refundConfirm': 'Reembolsar todas as melhorias? Você recebe todas as moedas de volta.',
    'shop.level': 'Nível {n}/{max}',
    'arsenal.title': 'Arsenal',
    'arsenal.weapons': 'Armas',
    'arsenal.passives': 'Passivos',
    'arsenal.recipes': 'Receitas de evolução',
    'arsenal.unlock': 'Desbloquear',
    'arsenal.locked': 'Planta não encontrada',
    'arsenal.lockedHint': 'Derrote chefes e elites para encontrar plantas.',
    'arsenal.found': 'Planta encontrada!',
    'arsenal.owned': 'Liberado',
    'cats.title': 'Gatos',
    'cats.select': 'Escolher',
    'cats.selected': 'Escolhido',
    'cats.start': 'Começa com',
    'cats.bonus': 'Bônus',
    'ach.title': 'Conquistas',
    'ach.reward': 'Recompensa: {n} moedas',
    'ach.unlocked': 'Conquista!',
    'settings.title': 'Ajustes',
    'settings.music': 'Música',
    'settings.sfx': 'Efeitos',
    'settings.vibration': 'Vibração',
    'settings.shake': 'Tremor de tela',
    'settings.numbers': 'Números de dano',
    'settings.language': 'Idioma',
    'settings.fps': 'Quadros por segundo',
    'settings.reset': 'Apagar progresso',
    'settings.resetConfirm': 'Apagar TODO o progresso? Isso não pode ser desfeito.',
    'settings.credits': 'Créditos',
    'settings.on': 'Ligado',
    'settings.off': 'Desligado',
    'stats.title': 'Estatísticas',
    'stats.runs': 'Corridas',
    'stats.wins': 'Vitórias',
    'stats.kills': 'Abates',
    'stats.playTime': 'Tempo de jogo',
    'stats.bestTime': 'Maior tempo',
    'stats.bestLevel': 'Maior nível',
    'stats.goldEarned': 'Moedas ganhas',
    'stats.bossKills': 'Chefes derrotados',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.ok': 'OK',
    'common.close': 'Fechar',
    'common.coins': 'moedas',
    'toast.blueprint': 'Planta encontrada: {name}!',
    'toast.achievement': 'Conquista: {name}!',
    'toast.boss': '{name} apareceu!',
    'toast.elite': 'Um inimigo de elite se aproxima!',
    'toast.swarm': 'Uma revoada se aproxima!',
    'toast.ring': 'Você está cercado!',
    'toast.evolve': '{name} evoluiu!',
    'toast.phase': '{name} está furioso!',
    'zone.label': 'Zona {n}',
    'hint.move': 'Arraste o dedo para andar!',
    'hint.moveSub': 'Suas armas atacam sozinhas. Pegue as gemas para subir de nível.',
    'result.collected': 'coletadas',
    'result.survival': 'sobrevivência',
    'credits.text': 'Purrvivors — feito com carinho.\n\nArte, música e efeitos sonoros gerados por código para este jogo.\n\nFontes: Jersey 10 (The Soft Type Project) e Pixelify Sans (Stefie Justprince), licença SIL Open Font License 1.1.',
  },
  en: {
    'title.tap': 'Tap to start',
    'title.subtitle': 'Nine lives. One horde.',
    'menu.play': 'Play',
    'menu.continue': 'Continue run',
    'menu.upgrades': 'Upgrades',
    'menu.arsenal': 'Arsenal',
    'menu.cats': 'Cats',
    'menu.achievements': 'Achievements',
    'menu.settings': 'Settings',
    'menu.stats': 'Statistics',
    'menu.back': 'Back',
    'menu.exitConfirm': 'Quit the game?',
    'run.start': 'Start!',
    'run.chooseCat': 'Choose your cat',
    'run.difficulty': 'Difficulty',
    'run.locked': 'Locked',
    'run.continueTitle': 'Run in progress',
    'run.continueText': 'You have a saved run at zone {zone}. Continue?',
    'run.abandon': 'Abandon',
    'run.abandonConfirm': 'Abandon the saved run? You will receive its coins.',
    'hud.level': 'Lv',
    'hud.boss': 'Boss',
    'levelup.title': 'Level up!',
    'levelup.new': 'New!',
    'levelup.evolution': 'Evolution!',
    'levelup.reroll': 'Reroll',
    'levelup.skip': 'Skip',
    'levelup.banish': 'Banish',
    'levelup.banishHint': 'Tap a card to banish it',
    'levelup.level': 'Level {n}',
    'levelup.heal': 'Grilled Fish',
    'levelup.healDesc': 'Restores 30% health.',
    'levelup.gold': 'Coin Pouch',
    'levelup.goldDesc': '+{n} coins.',
    'levelup.pair': 'Evolves with',
    'chest.title': 'Treasure chest!',
    'chest.boss': 'Boss chest!',
    'chest.tap': 'Tap to open',
    'chest.collect': 'Collect all',
    'chest.coins': '+{n} coins',
    'pause.title': 'Paused',
    'pause.resume': 'Resume',
    'pause.quit': 'Give up',
    'pause.quitConfirm': 'Give up this run? You keep the coins you collected.',
    'pause.build': 'Your gear',
    'camp.title': 'Zone cleared!',
    'camp.subtitle': 'You rest at the camp and recover 40% health.',
    'camp.choose': 'Choose a blessing',
    'camp.next': 'Next zone: {zone}',
    'result.victory': 'Victory!',
    'result.victoryText': 'Cerberus is defeated and the realm is safe!',
    'result.defeat': 'End of the line...',
    'result.defeatText': 'But a cat always lands on its feet. Try again!',
    'result.time': 'Time',
    'result.kills': 'Kills',
    'result.level': 'Level',
    'result.zone': 'Zone',
    'result.gold': 'Coins',
    'result.damage': 'Damage by weapon',
    'result.blueprints': 'Blueprints found',
    'result.unlocks': 'Unlocks',
    'result.menu': 'Menu',
    'result.again': 'Play again',
    'result.bonus': 'difficulty bonus',
    'shop.title': 'Upgrades',
    'shop.buy': 'Buy',
    'shop.max': 'MAX',
    'shop.refund': 'Refund all',
    'shop.refundConfirm': 'Refund every upgrade? You get all coins back.',
    'shop.level': 'Level {n}/{max}',
    'arsenal.title': 'Arsenal',
    'arsenal.weapons': 'Weapons',
    'arsenal.passives': 'Passives',
    'arsenal.recipes': 'Evolution recipes',
    'arsenal.unlock': 'Unlock',
    'arsenal.locked': 'Blueprint not found',
    'arsenal.lockedHint': 'Defeat bosses and elites to find blueprints.',
    'arsenal.found': 'Blueprint found!',
    'arsenal.owned': 'Unlocked',
    'cats.title': 'Cats',
    'cats.select': 'Choose',
    'cats.selected': 'Chosen',
    'cats.start': 'Starts with',
    'cats.bonus': 'Bonus',
    'ach.title': 'Achievements',
    'ach.reward': 'Reward: {n} coins',
    'ach.unlocked': 'Achievement!',
    'settings.title': 'Settings',
    'settings.music': 'Music',
    'settings.sfx': 'Sound effects',
    'settings.vibration': 'Vibration',
    'settings.shake': 'Screen shake',
    'settings.numbers': 'Damage numbers',
    'settings.language': 'Language',
    'settings.fps': 'Frames per second',
    'settings.reset': 'Erase progress',
    'settings.resetConfirm': 'Erase ALL progress? This cannot be undone.',
    'settings.credits': 'Credits',
    'settings.on': 'On',
    'settings.off': 'Off',
    'stats.title': 'Statistics',
    'stats.runs': 'Runs',
    'stats.wins': 'Wins',
    'stats.kills': 'Kills',
    'stats.playTime': 'Play time',
    'stats.bestTime': 'Longest run',
    'stats.bestLevel': 'Highest level',
    'stats.goldEarned': 'Coins earned',
    'stats.bossKills': 'Bosses defeated',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.close': 'Close',
    'common.coins': 'coins',
    'toast.blueprint': 'Blueprint found: {name}!',
    'toast.achievement': 'Achievement: {name}!',
    'toast.boss': '{name} appears!',
    'toast.elite': 'An elite enemy approaches!',
    'toast.swarm': 'A swarm is coming!',
    'toast.ring': 'You are surrounded!',
    'toast.evolve': '{name} evolved!',
    'toast.phase': '{name} is enraged!',
    'zone.label': 'Zone {n}',
    'hint.move': 'Drag your finger to move!',
    'hint.moveSub': 'Your weapons attack on their own. Grab gems to level up.',
    'result.collected': 'collected',
    'result.survival': 'survival',
    'credits.text': 'Purrvivors — made with love.\n\nArt, music and sound effects generated by code for this game.\n\nFonts: Jersey 10 (The Soft Type Project) and Pixelify Sans (Stefie Justprince), SIL Open Font License 1.1.',
  },
};

const statText = {
  pt: {
    dmg: '+{v} dano', cd: '{v}s recarga', amount: '+{v} projétil', area: '+{p}% área', speed: '+{v} velocidade', duration: '+{v}s duração',
    pierce: '+{v} perfuração', slow: '+{p}% lentidão', tick: '{v}s entre pulsos', interval: '{v}s entre tiros', freezeChance: '+{p}% congelar',
  },
  en: {
    dmg: '+{v} damage', cd: '{v}s cooldown', amount: '+{v} projectile', area: '+{p}% area', speed: '+{v} speed', duration: '+{v}s duration',
    pierce: '+{v} pierce', slow: '+{p}% slow', tick: '{v}s between pulses', interval: '{v}s between shots', freezeChance: '+{p}% freeze',
  },
};

const passiveText = {
  pt: {
    might: '+{p}% dano', moveSpeed: '+{p}% velocidade', area: '+{p}% área', crit: '+{p}% chance de crítico', regen: '+{v} vida/s',
    growth: '+{p}% XP', cooldown: '−{p}% recarga', maxHp: '+{p}% vida máxima', projSpeed: '+{p}% vel. de projétil', magnet: '+{p}% alcance de coleta',
    armor: '−{p}% dano recebido', greed: '+{p}% moedas', duration: '+{p}% duração', luck: '+{p}% sorte', amount: '+{v} projétil em todas as armas',
    revives: '+{v} vida extra por corrida', rerolls: '+{v} rerrolagem por corrida', skips: '+{v} pulo por corrida', banishes: '+{v} banimento por corrida',
  },
  en: {
    might: '+{p}% damage', moveSpeed: '+{p}% move speed', area: '+{p}% area', crit: '+{p}% crit chance', regen: '+{v} HP/s',
    growth: '+{p}% XP', cooldown: '−{p}% cooldown', maxHp: '+{p}% max health', projSpeed: '+{p}% projectile speed', magnet: '+{p}% pickup range',
    armor: '−{p}% damage taken', greed: '+{p}% coins', duration: '+{p}% duration', luck: '+{p}% luck', amount: '+{v} projectile on all weapons',
    revives: '+{v} extra life per run', rerolls: '+{v} reroll per run', skips: '+{v} skip per run', banishes: '+{v} banish per run',
  },
};

// FUNCTIONS
export function setLang(value) {
  lang = value === 'en' ? 'en' : 'pt';
  if (typeof document !== 'undefined') document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}

export function getLang() {
  return lang;
}

export function detectLang() {
  const language = (typeof navigator !== 'undefined' && navigator.language) || 'pt';
  return language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function fill(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (params[key] === undefined ? match : params[key]));
}

export function t(key, params) {
  const table = strings[lang] || strings.pt;
  const value = table[key] !== undefined ? table[key] : strings.pt[key];
  return fill(value === undefined ? key : value, params);
}

export function tr(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.pt || '';
}

function number(value) {
  const rounded = Math.round(value * 100) / 100;
  const text = String(rounded);
  return lang === 'pt' ? text.replace('.', ',') : text;
}

export function describeChange(change) {
  const table = statText[lang];
  const parts = [];
  for (const key in change) {
    const value = change[key];
    const template = table[key];
    if (!template) continue;
    parts.push(fill(template, { v: number(value), p: number(Math.round(value * 100)) }));
  }
  return parts.join(', ');
}

export function describeStat(stat, value) {
  const template = passiveText[lang][stat];
  if (!template) return stat;
  return fill(template, { v: number(Math.abs(value)), p: number(Math.round(Math.abs(value) * 100)) });
}
