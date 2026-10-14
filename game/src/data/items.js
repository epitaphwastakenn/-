// VARIABLES
export const weapons = {
  claw: {
    name: { pt: 'Garra Felina', en: 'Feline Claw' },
    desc: { pt: 'Arranha em arco na direção em que você anda.', en: 'Slashes an arc in the direction you move.' },
    icon: 'ic_claw',
    pair: 'whetstone',
    evolution: 'tigerFury',
    base: { dmg: 20, cd: 1.05, amount: 1, area: 1, knockback: 70 },
    levels: [{}, { amount: 1 }, { dmg: 10 }, { area: 0.3, cd: -0.15 }, { dmg: 14 }],
    unlocked: true,
  },
  yarn: {
    name: { pt: 'Novelo Saltitante', en: 'Bouncy Yarn' },
    desc: { pt: 'Novelos que quicam nas bordas da tela e nos inimigos.', en: 'Yarn balls that bounce off the screen edges and enemies.' },
    icon: 'ic_yarn',
    pair: 'swiftPaws',
    evolution: 'cosmicYarn',
    base: { dmg: 12, cd: 3, amount: 1, area: 1, speed: 160, duration: 3, knockback: 30 },
    levels: [{}, { amount: 1 }, { dmg: 6, duration: 0.5 }, { amount: 1 }, { dmg: 8, speed: 30 }],
    unlocked: true,
  },
  laser: {
    name: { pt: 'Ponteiro Laser', en: 'Laser Pointer' },
    desc: { pt: 'Feixe instantâneo que atravessa tudo em linha reta.', en: 'Instant beam that pierces everything in a line.' },
    icon: 'ic_laser',
    pair: 'magnifier',
    evolution: 'orbitalRay',
    base: { dmg: 22, cd: 1.6, amount: 1, area: 1 },
    levels: [{}, { dmg: 8 }, { amount: 1 }, { area: 0.5, cd: -0.2 }, { amount: 1, dmg: 10 }],
    unlocked: false,
  },
  fish: {
    name: { pt: 'Peixe Bumerangue', en: 'Fish Boomerang' },
    desc: { pt: 'Um peixe que vai e volta atravessando inimigos.', en: 'A fish that flies out and back, piercing enemies.' },
    icon: 'ic_fishrang',
    pair: 'sharkTooth',
    evolution: 'sharkarang',
    base: { dmg: 18, cd: 2, amount: 1, area: 1, speed: 190, knockback: 40 },
    levels: [{}, { dmg: 6 }, { amount: 1 }, { area: 0.3, speed: 20 }, { amount: 1, dmg: 8 }],
    unlocked: true,
  },
  catnip: {
    name: { pt: 'Nuvem de Catnip', en: 'Catnip Cloud' },
    desc: { pt: 'Aura que fere e desacelera inimigos por perto.', en: 'An aura that hurts and slows nearby enemies.' },
    icon: 'ic_catnip',
    pair: 'cushion',
    evolution: 'catnipStorm',
    base: { dmg: 8, tick: 0.5, area: 1, slow: 0.25 },
    levels: [{}, { area: 0.2, dmg: 2 }, { dmg: 3, slow: 0.1 }, { area: 0.2, tick: -0.05 }, { dmg: 5, area: 0.2 }],
    unlocked: true,
  },
  orbs: {
    name: { pt: 'Orbes Lunares', en: 'Moon Orbs' },
    desc: { pt: 'Orbes que giram ao seu redor.', en: 'Orbs that circle around you.' },
    icon: 'ic_orbs',
    pair: 'spellbook',
    evolution: 'eclipse',
    base: { dmg: 16, cd: 3, duration: 3, amount: 2, area: 1, speed: 3.2, knockback: 40 },
    levels: [{}, { amount: 1 }, { dmg: 6, duration: 0.5 }, { amount: 1, area: 0.15 }, { amount: 1, dmg: 6 }],
    unlocked: true,
  },
  bell: {
    name: { pt: 'Sino do Trovão', en: 'Thunder Bell' },
    desc: { pt: 'Chama raios sobre inimigos aleatórios.', en: 'Calls lightning down on random enemies.' },
    icon: 'ic_bell',
    pair: 'alarmClock',
    evolution: 'stormSymphony',
    base: { dmg: 20, cd: 2.2, amount: 2, area: 1 },
    levels: [{}, { amount: 1 }, { dmg: 10 }, { amount: 1, area: 0.25 }, { dmg: 12, cd: -0.3 }],
    unlocked: true,
  },
  milk: {
    name: { pt: 'Garrafa de Leite', en: 'Milk Bottle' },
    desc: { pt: 'Arremessa garrafas que deixam poças que ferem.', en: 'Throws bottles that leave damaging puddles.' },
    icon: 'ic_milk',
    pair: 'cookie',
    evolution: 'milkyWay',
    base: { dmg: 8, cd: 3.2, amount: 1, area: 1, duration: 2.5 },
    levels: [{}, { amount: 1 }, { dmg: 4, area: 0.2 }, { amount: 1, duration: 0.5 }, { dmg: 6, area: 0.2 }],
    unlocked: true,
  },
  cranes: {
    name: { pt: 'Grous de Papel', en: 'Paper Cranes' },
    desc: { pt: 'Dobraduras que perseguem o inimigo mais próximo.', en: 'Origami that homes in on the nearest enemy.' },
    icon: 'ic_cranes',
    pair: 'feather',
    evolution: 'thousandCranes',
    base: { dmg: 13, cd: 1.1, amount: 1, speed: 150, pierce: 1, knockback: 20 },
    levels: [{}, { amount: 1 }, { dmg: 5 }, { amount: 1, pierce: 1 }, { dmg: 6, cd: -0.15 }],
    unlocked: false,
  },
  shuriken: {
    name: { pt: 'Shuriken', en: 'Shuriken' },
    desc: { pt: 'Rajada rápida na direção em que você anda.', en: 'Rapid volley in the direction you move.' },
    icon: 'ic_shuriken',
    pair: 'whiskers',
    evolution: 'bladeStorm',
    base: { dmg: 12, cd: 0.9, amount: 1, speed: 260, pierce: 1, knockback: 15 },
    levels: [{}, { amount: 1 }, { dmg: 5, pierce: 1 }, { amount: 1, cd: -0.1 }, { dmg: 6, amount: 1 }],
    unlocked: false,
  },
  drone: {
    name: { pt: 'Drone Ratinho', en: 'Mouse Drone' },
    desc: { pt: 'Ratinhos robôs que te seguem e atiram.', en: 'Robot mice that follow you and shoot.' },
    icon: 'ic_drone',
    pair: 'cardboard',
    evolution: 'roboSquadron',
    base: { dmg: 9, interval: 0.8, amount: 1, speed: 220 },
    levels: [{}, { dmg: 4 }, { amount: 1 }, { interval: -0.15, dmg: 3 }, { amount: 1, dmg: 4 }],
    unlocked: false,
  },
  fireworks: {
    name: { pt: 'Fogos de Artifício', en: 'Fireworks' },
    desc: { pt: 'Foguetes que explodem em grupos de inimigos.', en: 'Rockets that burst on groups of enemies.' },
    icon: 'ic_fireworks',
    pair: 'luckyCoin',
    evolution: 'grandFinale',
    base: { dmg: 24, cd: 2.6, amount: 1, area: 1, speed: 150, knockback: 50 },
    levels: [{}, { amount: 1 }, { dmg: 10, area: 0.15 }, { amount: 1 }, { dmg: 12, area: 0.2 }],
    unlocked: false,
  },
  frost: {
    name: { pt: 'Sopro Gélido', en: 'Frost Breath' },
    desc: { pt: 'Cone de gelo à frente que pode congelar.', en: 'A cone of ice ahead that can freeze.' },
    icon: 'ic_frost',
    pair: 'hourglass',
    evolution: 'iceAge',
    base: { dmg: 16, cd: 1.7, area: 1, duration: 0.8, freezeChance: 0.35 },
    levels: [{}, { dmg: 5, area: 0.15 }, { freezeChance: 0.15 }, { dmg: 6, cd: -0.2 }, { area: 0.25, duration: 0.4, freezeChance: 0.15 }],
    unlocked: false,
  },
  ghosts: {
    name: { pt: 'Gatos Fantasmas', en: 'Ghost Cats' },
    desc: { pt: 'Gatinhos espectrais que investem atravessando tudo.', en: 'Spectral kittens that dash through everything.' },
    icon: 'ic_ghosts',
    pair: 'clover',
    evolution: 'nineLives',
    base: { dmg: 15, cd: 2.4, amount: 2, speed: 200, duration: 1, area: 1, knockback: 30 },
    levels: [{}, { amount: 1 }, { dmg: 6 }, { amount: 1, speed: 40 }, { dmg: 8, amount: 1 }],
    unlocked: false,
  },
};

export const evolutions = {
  tigerFury: {
    from: 'claw',
    name: { pt: 'Fúria do Tigre', en: "Tiger's Fury" },
    desc: { pt: 'Garras gigantes em X ao seu redor que causam sangramento.', en: 'Giant X-shaped claws around you that cause bleeding.' },
    icon: 'ic_tigerFury',
    stats: { dmg: 70, cd: 0.9, amount: 4, area: 1.6, knockback: 90, bleed: 0.4, critBonus: 0.15 },
  },
  cosmicYarn: {
    from: 'yarn',
    name: { pt: 'Novelo Cósmico', en: 'Cosmic Yarn' },
    desc: { pt: 'Novelos estelares gigantes que se dividem a cada acerto.', en: 'Giant starry yarn that splits on every hit.' },
    icon: 'ic_cosmicYarn',
    stats: { dmg: 40, cd: 2.6, amount: 2, area: 2, speed: 190, duration: 5, knockback: 50, splitDmg: 16 },
  },
  orbitalRay: {
    from: 'laser',
    name: { pt: 'Raio Orbital', en: 'Orbital Ray' },
    desc: { pt: 'Um laser do céu varre tudo ao seu redor.', en: 'A laser from the sky sweeps everything around you.' },
    icon: 'ic_orbitalRay',
    stats: { dmg: 46, cd: 1.3, amount: 3, area: 1.5, sweepDmg: 50, sweepCd: 3.5 },
  },
  sharkarang: {
    from: 'fish',
    name: { pt: 'Tubarãorangue', en: 'Sharkarang' },
    desc: { pt: 'Tubarões gigantes que giram em espiral e voltam.', en: 'Giant sharks that spiral out and return.' },
    icon: 'ic_sharkarang',
    stats: { dmg: 56, cd: 1.8, amount: 3, area: 1.8, speed: 220, knockback: 120 },
  },
  catnipStorm: {
    from: 'catnip',
    name: { pt: 'Tempestade de Catnip', en: 'Catnip Storm' },
    desc: { pt: 'Aura enorme que empurra, puxa XP e cura ao derrotar inimigos.', en: 'Huge aura that pushes, pulls XP and heals on kills.' },
    icon: 'ic_catnipStorm',
    stats: { dmg: 18, tick: 0.4, area: 2, slow: 0.5, knockback: 30, healEvery: 8 },
  },
  eclipse: {
    from: 'orbs',
    name: { pt: 'Eclipse', en: 'Eclipse' },
    desc: { pt: 'Dois anéis de orbes permanentes girando em sentidos opostos.', en: 'Two permanent rings of orbs spinning in opposite directions.' },
    icon: 'ic_eclipse',
    stats: { dmg: 34, amount: 6, outer: 4, area: 1.3, speed: 3.6, knockback: 60 },
  },
  stormSymphony: {
    from: 'bell',
    name: { pt: 'Sinfonia da Tempestade', en: 'Storm Symphony' },
    desc: { pt: 'Raios que saltam em cadeia entre inimigos.', en: 'Lightning that chains between enemies.' },
    icon: 'ic_stormSymphony',
    stats: { dmg: 45, cd: 1.5, amount: 5, area: 1.4, chains: 4 },
  },
  milkyWay: {
    from: 'milk',
    name: { pt: 'Via Láctea', en: 'Milky Way' },
    desc: { pt: 'Poças viram galáxias que sugam os inimigos.', en: 'Puddles become galaxies that suck enemies in.' },
    icon: 'ic_milkyWay',
    stats: { dmg: 20, cd: 2.8, amount: 3, area: 1.8, duration: 4, pull: 45 },
  },
  thousandCranes: {
    from: 'cranes',
    name: { pt: 'Mil Tsurus', en: 'Thousand Cranes' },
    desc: { pt: 'Um fluxo sem fim de grous que explodem em confete.', en: 'An endless flock of cranes that burst into confetti.' },
    icon: 'ic_thousandCranes',
    stats: { dmg: 38, cd: 0.22, amount: 1, speed: 190, pierce: 1, knockback: 30, blast: 0.6 },
  },
  bladeStorm: {
    from: 'shuriken',
    name: { pt: 'Tempestade de Lâminas', en: 'Blade Storm' },
    desc: { pt: 'Espiral de shurikens em 8 direções que ricocheteiam.', en: 'Spiral of shuriken in 8 directions that ricochet.' },
    icon: 'ic_bladeStorm',
    stats: { dmg: 24, cd: 0.45, amount: 8, speed: 280, pierce: -1, knockback: 20 },
  },
  roboSquadron: {
    from: 'drone',
    name: { pt: 'Esquadrilha Robô', en: 'Robo Squadron' },
    desc: { pt: 'Quatro drones com mísseis teleguiados explosivos.', en: 'Four drones firing explosive homing missiles.' },
    icon: 'ic_roboSquadron',
    stats: { dmg: 36, interval: 0.9, amount: 4, speed: 200, blast: 1 },
  },
  grandFinale: {
    from: 'fireworks',
    name: { pt: 'Grande Final', en: 'Grand Finale' },
    desc: { pt: 'Explosões em cascata que podem soltar moedas.', en: 'Cascading explosions that may drop coins.' },
    icon: 'ic_grandFinale',
    stats: { dmg: 50, cd: 2.2, amount: 4, area: 1.4, speed: 170, knockback: 60, cluster: 4, coinChance: 0.1 },
  },
  iceAge: {
    from: 'frost',
    name: { pt: 'Era do Gelo', en: 'Ice Age' },
    desc: { pt: 'Nova congelante periódica; inimigos congelados sofrem mais dano.', en: 'Periodic freezing nova; frozen enemies take more damage.' },
    icon: 'ic_iceAge',
    stats: { dmg: 36, cd: 1.4, area: 1.6, duration: 1.4, freezeChance: 0.7, novaCd: 4, frozenBonus: 0.5 },
  },
  nineLives: {
    from: 'ghosts',
    name: { pt: 'Nove Vidas', en: 'Nine Lives' },
    desc: { pt: 'Nove gatos fantasmas em órbita que investem sem parar.', en: 'Nine orbiting ghost cats that pounce nonstop.' },
    icon: 'ic_nineLives',
    stats: { dmg: 40, cd: 0.5, amount: 9, speed: 260, area: 1.3, knockback: 40 },
  },
};

export const passives = {
  whetstone: { name: { pt: 'Afiador', en: 'Whetstone' }, icon: 'ic_whetstone', stat: 'might', per: 0.08, unlocked: true },
  swiftPaws: { name: { pt: 'Patinhas Velozes', en: 'Swift Paws' }, icon: 'ic_swiftPaws', stat: 'moveSpeed', per: 0.08, unlocked: true },
  magnifier: { name: { pt: 'Lupa', en: 'Magnifier' }, icon: 'ic_magnifier', stat: 'area', per: 0.08, unlocked: true },
  sharkTooth: { name: { pt: 'Dente de Tubarão', en: 'Shark Tooth' }, icon: 'ic_sharkTooth', stat: 'crit', per: 0.05, unlocked: true },
  cushion: { name: { pt: 'Almofada', en: 'Cushion' }, icon: 'ic_cushion', stat: 'regen', per: 0.25, unlocked: true },
  spellbook: { name: { pt: 'Livro de Feitiços', en: 'Spellbook' }, icon: 'ic_spellbook', stat: 'growth', per: 0.08, unlocked: true },
  alarmClock: { name: { pt: 'Despertador', en: 'Alarm Clock' }, icon: 'ic_alarmClock', stat: 'cooldown', per: -0.06, unlocked: true },
  cookie: { name: { pt: 'Biscoito', en: 'Cookie' }, icon: 'ic_cookie', stat: 'maxHp', per: 0.15, unlocked: true },
  feather: { name: { pt: 'Pena', en: 'Feather' }, icon: 'ic_feather', stat: 'projSpeed', per: 0.1, unlocked: false },
  whiskers: { name: { pt: 'Bigodes', en: 'Whiskers' }, icon: 'ic_whiskers', stat: 'magnet', per: 0.25, unlocked: true },
  cardboard: { name: { pt: 'Armadura de Papelão', en: 'Cardboard Armor' }, icon: 'ic_cardboard', stat: 'armor', per: 0.06, unlocked: false },
  luckyCoin: { name: { pt: 'Moeda da Sorte', en: 'Lucky Coin' }, icon: 'ic_luckyCoin', stat: 'greed', per: 0.12, unlocked: false },
  hourglass: { name: { pt: 'Ampulheta', en: 'Hourglass' }, icon: 'ic_hourglass', stat: 'duration', per: 0.1, unlocked: false },
  clover: { name: { pt: 'Trevo', en: 'Clover' }, icon: 'ic_clover', stat: 'luck', per: 0.1, unlocked: false },
};

export const maxWeaponLevel = 5;
export const maxPassiveLevel = 5;
export const maxSlots = 6;

// FUNCTIONS
export function weaponStats(id, level) {
  const def = weapons[id];
  const stats = { ...def.base };
  for (let i = 1; i < level; i++) {
    const change = def.levels[i];
    for (const key in change) stats[key] = (stats[key] || 0) + change[key];
  }
  return stats;
}

export function evolutionFor(weaponId) {
  return weapons[weaponId].evolution;
}

export function itemName(id, lang) {
  const item = weapons[id] || evolutions[id] || passives[id];
  return item ? item.name[lang] || item.name.pt : id;
}
