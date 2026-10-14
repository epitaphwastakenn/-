// VARIABLES
export const enemies = {
  slime: { sprite: 'en_slime', hp: 8, speed: 26, dmg: 4, radius: 5, xp: 1, behavior: 'hop' },
  mouse: { sprite: 'en_mouse', hp: 6, speed: 38, dmg: 3, radius: 5, xp: 1, behavior: 'chase' },
  bee: { sprite: 'en_bee', hp: 5, speed: 44, dmg: 3, radius: 4, xp: 1, behavior: 'flutter', flying: true },
  mushroom: { sprite: 'en_mushroom', hp: 22, speed: 20, dmg: 5, radius: 6, xp: 2, behavior: 'chase' },
  snail: { sprite: 'en_snail', hp: 48, speed: 12, dmg: 6, radius: 7, xp: 4, behavior: 'chase', mass: 3 },

  bat: { sprite: 'en_bat', hp: 9, speed: 50, dmg: 5, radius: 5, xp: 1, behavior: 'flutter', flying: true },
  wolf: { sprite: 'en_wolf', hp: 20, speed: 32, dmg: 7, radius: 6, xp: 2, behavior: 'dash', dashSpeed: 135 },
  toadstool: { sprite: 'en_toadstool', hp: 26, speed: 22, dmg: 7, radius: 6, xp: 2, behavior: 'chase', deathCloud: true },
  stump: { sprite: 'en_stump', hp: 50, speed: 14, dmg: 10, radius: 7, xp: 4, behavior: 'chase', mass: 3 },
  spider: { sprite: 'en_spider', hp: 14, speed: 36, dmg: 6, radius: 5, xp: 2, behavior: 'ranged', shot: 'web', range: 90, fireRate: 2.6 },

  snowslime: { sprite: 'en_snowslime', hp: 18, speed: 28, dmg: 8, radius: 6, xp: 2, behavior: 'hop' },
  penguin: { sprite: 'en_penguin', hp: 22, speed: 28, dmg: 9, radius: 6, xp: 2, behavior: 'dash', dashSpeed: 170 },
  snowman: { sprite: 'en_snowman', hp: 30, speed: 18, dmg: 8, radius: 6, xp: 3, behavior: 'ranged', shot: 'snowball', range: 100, fireRate: 2.4 },
  icebat: { sprite: 'en_icebat', hp: 14, speed: 54, dmg: 7, radius: 5, xp: 1, behavior: 'flutter', flying: true },
  yeticub: { sprite: 'en_yeticub', hp: 80, speed: 18, dmg: 12, radius: 8, xp: 5, behavior: 'chase', mass: 3 },

  skeleton: { sprite: 'en_skeleton', hp: 24, speed: 26, dmg: 9, radius: 6, xp: 2, behavior: 'chase' },
  ghost: { sprite: 'en_ghost', hp: 20, speed: 32, dmg: 9, radius: 6, xp: 2, behavior: 'phase', flying: true },
  zombie: { sprite: 'en_zombie', hp: 64, speed: 15, dmg: 12, radius: 7, xp: 4, behavior: 'chase', mass: 3 },
  pumpkin: { sprite: 'en_pumpkin', hp: 28, speed: 30, dmg: 14, radius: 6, xp: 3, behavior: 'explode' },
  archer: { sprite: 'en_archer', hp: 22, speed: 24, dmg: 7, radius: 6, xp: 3, behavior: 'ranged', shot: 'arrow', range: 120, fireRate: 2.2 },

  imp: { sprite: 'en_imp', hp: 30, speed: 32, dmg: 9, radius: 6, xp: 3, behavior: 'ranged', shot: 'fireball', range: 110, fireRate: 2.2, flying: true },
  magmaslime: { sprite: 'en_magmaslime', hp: 34, speed: 28, dmg: 11, radius: 6, xp: 3, behavior: 'hop', splitInto: 'ember', splitCount: 2 },
  ember: { sprite: 'en_ember', hp: 10, speed: 44, dmg: 7, radius: 4, xp: 1, behavior: 'chase' },
  knight: { sprite: 'en_knight', hp: 90, speed: 18, dmg: 12, radius: 7, xp: 6, behavior: 'chase', mass: 4, armor: 0.3 },
  salamander: { sprite: 'en_salamander', hp: 40, speed: 30, dmg: 12, radius: 6, xp: 3, behavior: 'dash', dashSpeed: 180 },
  eye: { sprite: 'en_eye', hp: 36, speed: 24, dmg: 8, radius: 6, xp: 3, behavior: 'ranged', shot: 'eyebeam', range: 130, fireRate: 3.4, flying: true },

  prop: { sprite: 'prop_pot', hp: 1, speed: 0, dmg: 0, radius: 6, xp: 0, behavior: 'prop' },
};

export const elites = {
  slimeKing: { base: 'slime', sprite: 'el_slimeking', hp: 380, speed: 22, dmg: 12, radius: 12, xp: 30, behavior: 'hop', splitInto: 'slime', splitCount: 8, scale: 1, tint: null },
  alphaWolf: { base: 'wolf', sprite: 'el_alphawolf', hp: 900, speed: 34, dmg: 14, radius: 11, xp: 60, behavior: 'dash', dashSpeed: 175, summon: 'wolf', summonCount: 3, scale: 1 },
  emperorPenguin: { base: 'penguin', sprite: 'el_emperor', hp: 2000, speed: 30, dmg: 20, radius: 12, xp: 100, behavior: 'dash', dashSpeed: 210, summon: 'penguin', summonCount: 5, scale: 1 },
  cursedPumpkin: { base: 'pumpkin', sprite: 'el_cursedpumpkin', hp: 3800, speed: 26, dmg: 24, radius: 12, xp: 160, behavior: 'chase', summon: 'pumpkin', summonCount: 6, scale: 1 },
  magmaGolem: { base: 'knight', sprite: 'el_magmagolem', hp: 7000, speed: 18, dmg: 30, radius: 14, xp: 240, behavior: 'chase', slam: true, splitInto: 'ember', splitCount: 10, scale: 1, mass: 8 },
};

export const enemyShots = {
  web: { sprite: 'sh_web', speed: 70, radius: 4, slow: 0.4, life: 3 },
  snowball: { sprite: 'sh_snowball', speed: 80, radius: 4, life: 3 },
  arrow: { sprite: 'sh_arrow', speed: 120, radius: 3, life: 3, rotate: true },
  fireball: { sprite: 'sh_fireball', speed: 85, radius: 4, life: 3 },
  eyebeam: { sprite: 'sh_eyebeam', speed: 140, radius: 3, life: 2.5, rotate: true },
  slimeball: { sprite: 'sh_slimeball', speed: 80, radius: 5, life: 3 },
  acorn: { sprite: 'sh_acorn', speed: 90, radius: 4, life: 3.5 },
  icespike: { sprite: 'sh_icespike', speed: 120, radius: 4, life: 3, rotate: true },
  bigsnowball: { sprite: 'sh_bigsnowball', speed: 70, radius: 10, life: 5 },
  bloodorb: { sprite: 'sh_bloodorb', speed: 75, radius: 4, life: 5 },
  batshot: { sprite: 'en_bat', speed: 110, radius: 5, life: 4, animated: true },
  firebreath: { sprite: 'sh_fireball', speed: 120, radius: 5, life: 2 },
  voidorb: { sprite: 'sh_voidorb', speed: 60, radius: 6, life: 6 },
  frostshard: { sprite: 'sh_icespike', speed: 130, radius: 4, life: 3, rotate: true },
  meteor: { sprite: 'sh_fireball', speed: 0, radius: 6, life: 1 },
};
