const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hpBar = document.getElementById("hpBar");
const hpText = document.getElementById("hpText");
const lifeText = document.getElementById("lifeText");
const playerAvatar = document.getElementById("playerAvatar");
const playerNameLabel = document.getElementById("playerNameLabel");
const specialButton = document.getElementById("specialButton");
const specialBar = document.getElementById("specialBar");
const specialText = document.getElementById("specialText");
const scoreText = document.getElementById("scoreText");
const message = document.getElementById("message");
const titleOverlay = document.getElementById("titleOverlay");
const difficultyButtons = [...document.querySelectorAll("[data-difficulty]")];
const characterActions = document.getElementById("characterActions");
const debugStartActions = document.getElementById("debugStartActions");
const continueOverlay = document.getElementById("continueOverlay");
const continueCount = document.getElementById("continueCount");
const continueButton = document.getElementById("continueButton");
const giveUpButton = document.getElementById("giveUpButton");

const WORLD = {
  width: 960,
  height: 540,
  floorTop: 170,
  floorBottom: 470,
};

const DIFFICULTY = {
  enemyAttackCooldown: 1.9,
  enemyAttackWindup: 0.46,
  enemyAttackActive: 0.16,
};

const DIFFICULTY_SETTINGS = {
  easy: {
    label: "Easy",
    enemyHpScale: 0.85,
    bossHpScale: 0.82,
    enemyDamageScale: 0.82,
    enemyAttackCooldownScale: 1.18,
    attackWindupScales: [1.12],
    bossFrontGuardReaction: false,
  },
  normal: {
    label: "Normal",
    enemyHpScale: 1,
    bossHpScale: 1,
    enemyDamageScale: 1,
    enemyAttackCooldownScale: 1,
    attackWindupScales: [1],
    bossFrontGuardReaction: true,
  },
  hard: {
    label: "Hard",
    enemyHpScale: 1.18,
    bossHpScale: 1.25,
    enemyDamageScale: 1.16,
    enemyAttackCooldownScale: 0.92,
    attackWindupScales: [0.62, 1.36, 0.86, 1.14],
    bossFrontGuardReaction: true,
  },
};

let currentDifficultyKey = "normal";

const INITIAL_LIVES = 3;
const MAX_LIVES = 5;
const CONTINUE_COUNTDOWN = 10;

const SPECIAL_GAUGE = {
  max: 100,
  skillCost: 10,
  skillDamage: 34,
  skillRadius: 118,
  skillCooldown: 0.36,
  skillHoldTime: 0.45,
  superDamage: 90,
};

const ENEMY_EDGE_CONTROL = {
  leftComfortX: 118,
  rightComfortX: WORLD.width - 132,
  nudgeSpeed: 72,
  rangedMoveSpeed: 96,
};

const COMBO_ATTACKS = [
  { label: "1", damage: 14, cooldown: 0.22, width: 72, height: 50, reach: 48, duration: 0.11, hitStop: 0.18, knockback: 12 },
  { label: "2", damage: 16, cooldown: 0.24, width: 78, height: 54, reach: 52, duration: 0.12, hitStop: 0.2, knockback: 18 },
  { label: "3", damage: 28, cooldown: 0.42, width: 92, height: 60, reach: 62, duration: 0.16, hitStop: 0.28, knockback: 88 },
];

const JUMP = {
  duration: 0.58,
  height: 78,
  horizontalSpeed: 260,
  swipeMinDistance: 36,
  swipeUpThreshold: -30,
  swipeAngleToleranceDegrees: 60,
  stickDirectionThreshold: 0.22,
};

const JUMP_KICK = {
  damage: 24,
  cooldown: 0.34,
  width: 96,
  height: 66,
  reach: 64,
  duration: 0.18,
  hitStop: 0.24,
  knockback: 62,
};

const PLAYER_KNIFE = {
  damage: 30,
  cooldown: 0.34,
  speed: 430,
  radius: 10,
};

const PLAYER_CHARACTERS = {
  petiman: {
    label: "PETIMAN",
    description: "balanced",
    spriteHeight: 92,
    spriteHeights: {},
    footOffsetY: 30,
    stats: {
      maxHp: 100,
      speed: 245,
    },
    sprites: {
      idle: "assets/sprites/player/petiman-idle.png",
      run1: "assets/sprites/player/petiman-run-1.png",
      run2: "assets/sprites/player/petiman-run-2.png",
      punch: "assets/sprites/player/petiman-punch.png",
      lariat: "assets/sprites/player/petiman-lariat.png",
      jumpKick: "assets/sprites/player/petiman-high-kick.png",
      damage: "assets/sprites/player/petiman-damage.png",
      ko: "assets/sprites/player/petiman-ko.png",
    },
  },
  rooeeebee: {
    label: "ROOEEBEE",
    description: "balanced",
    spriteHeight: 108,
    spriteHeights: {
      ko: 54,
    },
    footOffsetY: 28,
    stats: {
      maxHp: 100,
      speed: 245,
    },
    sprites: {
      idle: "assets/sprites/player/rooeeebee-idle.png",
      run1: "assets/sprites/player/rooeeebee-run-1.png",
      run2: "assets/sprites/player/rooeeebee-run-2.png",
      punch: "assets/sprites/player/rooeeebee-punch.png",
      lariat: "assets/sprites/player/rooeeebee-lariat.png",
      jumpKick: "assets/sprites/player/rooeeebee-high-kick.png",
      damage: "assets/sprites/player/rooeeebee-damage.png",
      ko: "assets/sprites/player/rooeeebee-ko.png",
    },
  },
};
const playerSprites = Object.fromEntries(
  Object.entries(PLAYER_CHARACTERS).map(([key, character]) => [key, loadSpriteImages(character.sprites)]),
);
let currentPlayerCharacterKey = "petiman";

const ENEMY_SPRITE_DEFS = {
  slow_puncher: {
    spriteHeight: 139,
    koSpriteHeight: 86,
    footOffsetY: 24,
    sprites: {
      idle: "assets/sprites/enemy/general/slow_puncher_idle.png",
      move: "assets/sprites/enemy/general/slow_puncher_move.png",
      attack: "assets/sprites/enemy/general/slow_puncher_attack.png",
      damage: "assets/sprites/enemy/general/slow_puncher_damage.png",
      ko: "assets/sprites/enemy/general/slow_puncher_ko.png",
    },
  },
  knife_thrower: {
    spriteHeight: 139,
    koSpriteHeight: 69,
    footOffsetY: 24,
    sprites: {
      idle: "assets/sprites/enemy/general/knife_thrower_idle.png",
      move: "assets/sprites/enemy/general/knife_thrower_move.png",
      attack: "assets/sprites/enemy/general/knife_thrower_throw.png",
      damage: "assets/sprites/enemy/general/knife_thrower_damage.png",
      ko: "assets/sprites/enemy/general/knife_thrower_ko.png",
    },
  },
  gunner: {
    spriteHeight: 139,
    koSpriteHeight: 86,
    footOffsetY: 24,
    sprites: {
      idle: "assets/sprites/enemy/general/gunner_idle.png",
      move: "assets/sprites/enemy/general/gunner_move.png",
      attack: "assets/sprites/enemy/general/gunner_shoot.png",
      damage: "assets/sprites/enemy/general/gunner_damage.png",
      ko: "assets/sprites/enemy/general/gunner_ko.png",
    },
  },
  bike_rusher: {
    spriteHeight: 118,
    koSpriteHeight: 82,
    footOffsetY: 18,
    sprites: {
      idle: "assets/sprites/enemy/general/bike_rusher_idle.png",
      move: "assets/sprites/enemy/general/bike_rusher_move.png",
      damage: "assets/sprites/enemy/general/bike_rusher_damage.png",
      ko: "assets/sprites/enemy/general/bike_rusher_ko.png",
    },
  },
  mid_boss_brawler: {
    spriteHeight: 142,
    koSpriteHeight: 88,
    footOffsetY: 34,
    sprites: {
      idle: "assets/sprites/enemy/mid_boss/mid_boss_idle.svg",
      attack: "assets/sprites/enemy/mid_boss/mid_boss_attack.svg",
      damage: "assets/sprites/enemy/mid_boss/mid_boss_damage.svg",
      ko: "assets/sprites/enemy/mid_boss/mid_boss_ko.svg",
    },
  },
  mid_boss_charge: {
    spriteHeight: 172,
    koSpriteHeight: 140,
    spriteHeights: {
      attack1: 220,
    },
    footOffsetY: 28,
    sprites: {
      idle: "assets/sprites/enemy/mid_boss/mid_boss_charge_idle.png",
      move: "assets/sprites/enemy/mid_boss/mid_boss_charge_move.png",
      attack1: "assets/sprites/enemy/mid_boss/mid_boss_charge_attack1.png",
      attack2: "assets/sprites/enemy/mid_boss/mid_boss_charge_attack2.png",
      chargeWindup: "assets/sprites/enemy/mid_boss/mid_boss_charge_charge_windup.png",
      charge: "assets/sprites/enemy/mid_boss/mid_boss_charge_charge.png",
      guard: "assets/sprites/enemy/mid_boss/mid_boss_charge_guard.png",
      damage: "assets/sprites/enemy/mid_boss/mid_boss_charge_damage.png",
      ko: "assets/sprites/enemy/mid_boss/mid_boss_charge_ko.png",
    },
  },
  mid_boss_shock: {
    spriteHeight: 172,
    koSpriteHeight: 140,
    spriteHeights: {
      windup: 188,
      shock: 190,
    },
    footOffsetY: 28,
    sprites: {
      idle: "assets/sprites/enemy/mid_boss/mid_boss_shock_idle.png",
      move: "assets/sprites/enemy/mid_boss/mid_boss_shock_move.png",
      windup: "assets/sprites/enemy/mid_boss/mid_boss_shock_windup.png",
      attack: "assets/sprites/enemy/mid_boss/mid_boss_shock_attack.png",
      shock: "assets/sprites/enemy/mid_boss/mid_boss_shock_shock.png",
      guard: "assets/sprites/enemy/mid_boss/mid_boss_shock_guard.png",
      damage: "assets/sprites/enemy/mid_boss/mid_boss_shock_damage.png",
      ko: "assets/sprites/enemy/mid_boss/mid_boss_shock_ko.png",
    },
  },
  mid_boss_jump: {
    spriteHeight: 224,
    koSpriteHeight: 182,
    spriteHeights: {
      attack: 190,
      press: 190,
    },
    footOffsetY: 64,
    sprites: {
      idle: "assets/sprites/enemy/mid_boss/mid_boss_jump_idle.png",
      move: "assets/sprites/enemy/mid_boss/mid_boss_jump_move.png",
      charge: "assets/sprites/enemy/mid_boss/mid_boss_jump_charge.png",
      attack: "assets/sprites/enemy/mid_boss/mid_boss_jump_attack.png",
      press: "assets/sprites/enemy/mid_boss/mid_boss_jump_press.png",
      guard: "assets/sprites/enemy/mid_boss/mid_boss_jump_guard.png",
      damage: "assets/sprites/enemy/mid_boss/mid_boss_jump_damage.png",
      ko: "assets/sprites/enemy/mid_boss/mid_boss_jump_ko.png",
    },
  },
  mid_boss_knife: {
    spriteHeight: 172,
    koSpriteHeight: 182,
    spriteHeights: {
      charge: 224,
      throw: 244,
      attack: 244,
      guard: 224,
      damage: 224,
    },
    footOffsetY: 28,
    sprites: {
      idle: "assets/sprites/enemy/mid_boss/mid_boss_knife_idle.png",
      move: "assets/sprites/enemy/mid_boss/mid_boss_knife_move.png",
      charge: "assets/sprites/enemy/mid_boss/mid_boss_knife_charge.png",
      throw: "assets/sprites/enemy/mid_boss/mid_boss_knife_throw.png",
      attack: "assets/sprites/enemy/mid_boss/mid_boss_knife_attack.png",
      guard: "assets/sprites/enemy/mid_boss/mid_boss_knife_guard.png",
      damage: "assets/sprites/enemy/mid_boss/mid_boss_knife_damage.png",
      ko: "assets/sprites/enemy/mid_boss/mid_boss_knife_ko.png",
    },
  },
  mid_boss_summon: {
    spriteHeight: 172,
    koSpriteHeight: 140,
    spriteHeights: {
      attack: 188,
      call: 188,
      damage: 188,
    },
    footOffsetY: 28,
    sprites: {
      idle: "assets/sprites/enemy/mid_boss/mid_boss_summon_idle.png",
      move: "assets/sprites/enemy/mid_boss/mid_boss_summon_move.png",
      attack: "assets/sprites/enemy/mid_boss/mid_boss_summon_attack.png",
      call: "assets/sprites/enemy/mid_boss/mid_boss_summon_call.png",
      guard: "assets/sprites/enemy/mid_boss/mid_boss_summon_guard.png",
      damage: "assets/sprites/enemy/mid_boss/mid_boss_summon_damage.png",
      ko: "assets/sprites/enemy/mid_boss/mid_boss_summon_ko.png",
    },
  },
  major_boss_brawler: {
    spriteHeight: 150,
    koSpriteHeight: 96,
    footOffsetY: 36,
    sprites: {
      idle: "assets/sprites/enemy/major_boss/major_boss_idle.svg",
      attack: "assets/sprites/enemy/major_boss/major_boss_attack.svg",
      damage: "assets/sprites/enemy/major_boss/major_boss_damage.svg",
      ko: "assets/sprites/enemy/major_boss/major_boss_ko.svg",
    },
  },
};
const enemySprites = Object.fromEntries(
  Object.entries(ENEMY_SPRITE_DEFS).map(([key, enemyDef]) => [key, loadSpriteImages(enemyDef.sprites)]),
);
const ENEMY_KO_DISPLAY_TIME = 0.75;
const BOSS_AURA_STYLE = "flame";
const BOSS_AURA_SETTINGS = {
  intensity: 2.4,
  width: 188,
  height: 360,
};
const MID_BOSS_CHARGE_WALK_TRANSFORM = {
  speed: 0.9,
  bob: 1,
  squash: 0.005,
  sway: 1,
  tilt: 0.25,
};
const MID_BOSS_SHOCK_WINDMILL = {
  frameMs: 60,
  spin: 5,
  slide: 7,
  squash: 0.005,
};

const BIKE_ENEMY = {
  warningTime: 1.45,
  speed: 560,
  damage: 18,
  hp: 34,
  radius: 34,
  halfVisibleOffset: -38,
};

const KNIFE_ENEMY = {
  hp: 42,
  radius: 24,
  throwCooldownMin: 1.75,
  throwCooldownMax: 2.45,
  throwWindup: 0.48,
  knifeSpeed: 310,
  knifeDamage: 12,
};

const GUNNER_ENEMY = {
  hp: 38,
  radius: 24,
  shotCooldownMin: 2.1,
  shotCooldownMax: 3.0,
  shotWindup: 0.62,
  bulletSpeed: 360,
  bulletDamage: 16,
};

const MID_BOSS_ENEMY = {
  hp: 360,
  radius: 38,
  speed: 58,
  damage: 18,
  frontGuardDamageScale: 0.35,
  backWeakDamageScale: 1.35,
  guardDuration: 0.78,
  guardCooldown: 4.2,
  guardRange: 190,
  attackRangeX: 86,
  attackRangeY: 58,
  attackCooldown: 1.75,
  attackWindup: 0.62,
  attackActive: 0.22,
  chargeRangeMin: 145,
  chargeRangeMax: 430,
  chargeWindup: 0.74,
  chargeActive: 0.44,
  chargeSpeed: 520,
  shockRadius: 132,
  shockWindup: 0.78,
  shockActive: 0.28,
  jumpRangeMin: 120,
  jumpRangeMax: 440,
  jumpWindup: 0.82,
  jumpActive: 0.9,
  jumpHeight: 132,
  jumpImpactRadius: 112,
  knifeRangeMin: 120,
  knifeRangeMax: 420,
  knifeWindup: 0.58,
  knifeActive: 0.12,
  knifeSpeed: 340,
  knifeDamage: 14,
  summonWindup: 0.86,
  summonActive: 0.16,
};

const MAJOR_BOSS_ENEMY = {
  hp: 760,
  radius: 52,
  visualScale: 1.28,
  speed: 48,
  damage: 24,
  attackRangeX: 108,
  attackRangeY: 72,
  guardCooldown: 3.5,
};

const BOSS_TYPES = new Set(["mid_boss_brawler", "major_boss_brawler"]);

const BOSS_SCHEDULE = [
  { area: 5, rank: "mid", variant: "charge", debugLabel: "中ボスA" },
  { area: 10, rank: "mid", variant: "shock", debugLabel: "中ボスB" },
  { area: 15, rank: "mid", variant: "jump", debugLabel: "中ボスC" },
  { area: 20, rank: "major", variant: "all", debugLabel: "大ボス" },
  { area: 25, rank: "mid", variant: "knife", debugLabel: "中ボスD" },
  { area: 30, rank: "mid", variant: "summon", debugLabel: "中ボスE" },
];

const ITEM_TYPES = {
  onigiri: { icon: "🍙", heal: 10, label: "+10 HP" },
  cake: { icon: "🍰", heal: 30, label: "+30 HP" },
  meat: { icon: "🍖", heal: 50, label: "+50 HP" },
  knife: { icon: "🔪", label: "KNIFE" },
  heart: { icon: "❤️", label: "LIFE +1" },
};

const AREA_THEMES = [
  {
    sky: "#263024",
    floor: "#4a3f26",
    edge: "#1a211c",
    topShade: "rgba(0, 0, 0, 0.24)",
    lane: "rgba(255, 232, 180, 0.09)",
    border: "rgba(255, 232, 180, 0.18)",
  },
  {
    sky: "#223035",
    floor: "#35482f",
    edge: "#151f25",
    topShade: "rgba(0, 0, 0, 0.28)",
    lane: "rgba(184, 229, 214, 0.1)",
    border: "rgba(184, 229, 214, 0.2)",
  },
  {
    sky: "#342a25",
    floor: "#51422a",
    edge: "#1f1715",
    topShade: "rgba(0, 0, 0, 0.3)",
    lane: "rgba(255, 205, 142, 0.11)",
    border: "rgba(255, 205, 142, 0.22)",
  },
  {
    sky: "#26243a",
    floor: "#33404f",
    edge: "#161824",
    topShade: "rgba(0, 0, 0, 0.32)",
    lane: "rgba(190, 210, 255, 0.1)",
    border: "rgba(190, 210, 255, 0.2)",
  },
];

const BREAKABLE_TYPES = {
  crate: {
    label: "木箱",
    hp: 24,
    radius: 25,
    width: 50,
    height: 44,
    drops: [
      { type: "heart", chance: 0.08 },
      { type: "knife", chance: 0.2 },
      { type: "cake", chance: 0.46 },
      { type: "onigiri", chance: 0.18 },
    ],
  },
  barrel: {
    label: "ドラム缶",
    hp: 58,
    radius: 27,
    width: 46,
    height: 62,
    drops: [
      { type: "heart", chance: 0.12 },
      { type: "knife", chance: 0.24 },
      { type: "meat", chance: 0.32 },
      { type: "cake", chance: 0.26 },
      { type: "onigiri", chance: 0.14 },
    ],
  },
};

const input = {
  keys: new Set(),
  moveX: 0,
  moveY: 0,
  pointerMoveX: 0,
  pointerMoveY: 0,
  movePointerId: null,
  moveStart: null,
  moveCurrent: null,
  actionPointerId: null,
  actionStart: null,
  actionCurrent: null,
  actionHoldTimer: 0,
  actionHoldTriggered: false,
};

const state = {
  lastTime: performance.now(),
  gameStarted: false,
  score: 0,
  area: 1,
  wave: 1,
  exitGateOpen: false,
  areaTransitionTimer: 0,
  gameOverTimer: 0,
  continueActive: false,
  continueTimer: 0,
  superFlashTimer: 0,
  screenShakeTimer: 0,
  majorBossIntroTimer: 0,
  lives: INITIAL_LIVES,
  bikeSpawnTimer: null,
  bikeSpawnsRemaining: 0,
  player: createPlayer(),
  enemies: [],
  attacks: [],
  projectiles: [],
  items: [],
  breakables: [],
  floatingTexts: [],
};

function getCurrentDifficulty() {
  return DIFFICULTY_SETTINGS[currentDifficultyKey] ?? DIFFICULTY_SETTINGS.normal;
}

function getCurrentPlayerCharacter() {
  return PLAYER_CHARACTERS[currentPlayerCharacterKey] ?? PLAYER_CHARACTERS.petiman;
}

function scaleEnemyHp(value) {
  return Math.round(value * getCurrentDifficulty().enemyHpScale);
}

function scaleBossHp(value) {
  return Math.round(value * getCurrentDifficulty().bossHpScale);
}

function scaleEnemyDamage(value) {
  return Math.max(1, Math.round(value * getCurrentDifficulty().enemyDamageScale));
}

function getEnemyAttackCooldown() {
  return DIFFICULTY.enemyAttackCooldown * getCurrentDifficulty().enemyAttackCooldownScale;
}

function getAttackWindup(baseWindup, enemy) {
  const pattern = getCurrentDifficulty().attackWindupScales;
  if (!pattern || pattern.length === 0) return baseWindup;
  if (pattern.length === 1) return baseWindup * pattern[0];

  if (!enemy.hasWindupPatternStarted) {
    enemy.windupPatternIndex = Math.floor(Math.random() * pattern.length);
    enemy.hasWindupPatternStarted = true;
  }

  const scale = pattern[enemy.windupPatternIndex % pattern.length];
  enemy.windupPatternIndex += 1;
  return baseWindup * scale;
}

function createPlayer() {
  const character = getCurrentPlayerCharacter();
  return {
    x: 210,
    y: 330,
    radius: 24,
    speed: character.stats.speed,
    hp: character.stats.maxHp,
    maxHp: character.stats.maxHp,
    facing: 1,
    invincibleTimer: 0,
    respawnInvincible: false,
    damageSpriteTimer: 0,
    attackCooldown: 0,
    comboStep: 0,
    comboTimer: 0,
    hasKnife: false,
    specialGauge: 0,
    isJumping: false,
    jumpTimer: 0,
    jumpDirection: 0,
    jumpKickUsed: false,
  };
}

function createEnemy(round = 1, index = 0) {
  if (round >= 3 && index === 2 && Math.random() < 0.68) {
    return createGunnerEnemy(round, index);
  }

  if (round >= 2 && index === 1 && Math.random() < 0.72) {
    return createKnifeEnemy(round, index);
  }

  const fromRight = true;
  const dropsIn = Math.random() < (round >= 2 ? 0.55 : 0.35);
  const laneHeight = WORLD.floorBottom - WORLD.floorTop - 110;
  const stagger = (index % 3) * 58;
  const baseY = WORLD.floorTop + 58 + ((Math.random() * laneHeight + stagger) % laneHeight);
  const dropX = 310 + Math.random() * 330;
  const entryX = dropsIn ? dropX : fromRight ? WORLD.width - 115 - index * 34 : 115 + index * 34;
  const entryY = baseY;
  const maxHp = scaleEnemyHp(40 + Math.min(round * 5, 35));
  return {
    type: "slow_puncher",
    name: "ゆっくり近づく敵",
    x: dropsIn ? dropX : fromRight ? WORLD.width + 70 + index * 46 : -70 - index * 46,
    y: dropsIn ? WORLD.floorTop - 120 - index * 34 : baseY,
    entryX,
    entryY,
    entryMode: dropsIn ? "drop" : "side",
    entering: true,
    radius: 25,
    hp: maxHp,
    maxHp,
    speed: 76 + Math.min(round * 3, 30),
    damage: scaleEnemyDamage(10),
    attackRangeX: 62,
    attackRangeY: 42,
    chaseRange: 300,
    attackCooldown: 0,
    attackWindup: 0,
    attackActive: 0,
    windupPatternIndex: 0,
    hasDamagedThisSwing: false,
    facing: fromRight ? -1 : 1,
    wanderTimer: 0,
    wanderX: fromRight ? -0.4 : 0.4,
    wanderY: Math.random() > 0.5 ? 0.35 : -0.35,
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function createGunnerEnemy(round = 1, index = 0) {
  const fromRight = true;
  const dropsIn = round >= 2 && Math.random() < 0.32;
  const laneHeight = WORLD.floorBottom - WORLD.floorTop - 120;
  const y = WORLD.floorTop + 72 + ((Math.random() * laneHeight + index * 42) % laneHeight);
  const dropX = 420 + Math.random() * 260;
  const maxHp = scaleEnemyHp(GUNNER_ENEMY.hp + Math.min(round * 4, 22));
  return {
    type: "gunner",
    name: "銃手",
    x: dropsIn ? dropX : fromRight ? WORLD.width + 64 : -64,
    y: dropsIn ? WORLD.floorTop - 110 - index * 28 : y,
    entryX: dropsIn ? dropX : fromRight ? WORLD.width - 78 : 78,
    entryY: y,
    entryMode: dropsIn ? "drop" : "side",
    entering: true,
    radius: GUNNER_ENEMY.radius,
    hp: maxHp,
    maxHp,
    speed: 78,
    damage: scaleEnemyDamage(GUNNER_ENEMY.bulletDamage),
    facing: fromRight ? -1 : 1,
    shotCooldown: 1.35 + Math.random() * 0.9,
    shotWindup: 0,
    windupPatternIndex: 0,
    hasQueuedShot: false,
    shotsFired: 0,
    shotsBeforeReposition: 1 + Math.floor(Math.random() * 2),
    repositioning: false,
    repositionTargetX: 590 + Math.random() * 150,
    repositionTargetY: clamp(y + (Math.random() - 0.5) * 80, WORLD.floorTop + 52, WORLD.floorBottom - 42),
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function createKnifeEnemy(round = 1, index = 0) {
  const fromRight = true;
  const dropsIn = round >= 2 && Math.random() < 0.36;
  const laneHeight = WORLD.floorBottom - WORLD.floorTop - 120;
  const y = WORLD.floorTop + 72 + ((Math.random() * laneHeight + index * 48) % laneHeight);
  const dropX = 390 + Math.random() * 300;
  const maxHp = scaleEnemyHp(KNIFE_ENEMY.hp + Math.min(round * 4, 24));
  return {
    type: "knife_thrower",
    name: "ナイフ投げ敵",
    x: dropsIn ? dropX : fromRight ? WORLD.width + 64 : -64,
    y: dropsIn ? WORLD.floorTop - 110 - index * 28 : y,
    entryX: dropsIn ? dropX : fromRight ? WORLD.width - 84 : 84,
    entryY: y,
    entryMode: dropsIn ? "drop" : "side",
    entering: true,
    radius: KNIFE_ENEMY.radius,
    hp: maxHp,
    maxHp,
    speed: 86,
    damage: scaleEnemyDamage(KNIFE_ENEMY.knifeDamage),
    facing: fromRight ? -1 : 1,
    throwCooldown: 1.2 + Math.random() * 0.7,
    throwWindup: 0,
    windupPatternIndex: 0,
    hasQueuedKnife: false,
    shotsFired: 0,
    shotsBeforeReposition: 1 + Math.floor(Math.random() * 2),
    repositioning: false,
    repositionTargetX: 580 + Math.random() * 160,
    repositionTargetY: clamp(y + (Math.random() - 0.5) * 80, WORLD.floorTop + 52, WORLD.floorBottom - 42),
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function createMidBossEnemy(round = 1) {
  const y = WORLD.floorTop + 182;
  const maxHp = scaleBossHp(MID_BOSS_ENEMY.hp + Math.min(round * 18, 180));
  const variant = getMidBossVariant(round);
  return {
    type: "mid_boss_brawler",
    bossRank: "mid",
    bossVariant: variant,
    name: "中ボス",
    x: WORLD.width + 92,
    y,
    entryX: 650,
    entryY: y,
    entryMode: "side",
    entering: true,
    radius: MID_BOSS_ENEMY.radius,
    hp: maxHp,
    maxHp,
    speed: MID_BOSS_ENEMY.speed + Math.min(round * 2, 24),
    damage: scaleEnemyDamage(MID_BOSS_ENEMY.damage + Math.min(Math.floor(round / 5) * 4, 12)),
    attackRangeX: MID_BOSS_ENEMY.attackRangeX,
    attackRangeY: MID_BOSS_ENEMY.attackRangeY,
    chaseRange: 430,
    attackCooldown: 1.1,
    attackWindup: 0,
    attackActive: 0,
    attackType: null,
    windupPatternIndex: 0,
    lockedFacing: null,
    attackTargetX: null,
    attackTargetY: null,
    attackStartX: null,
    attackStartY: null,
    attackLanded: false,
    visualJumpHeight: 0,
    guardTimer: 0,
    guardCooldown: 1.25,
    summonedEnemyCount: 0,
    hasActiveSummonWave: false,
    summonCooldownTimer: 0,
    hasDamagedThisSwing: false,
    facing: -1,
    wanderTimer: 0,
    wanderX: -0.35,
    wanderY: 0,
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function createMajorBossEnemy(round = 1) {
  const y = WORLD.floorTop + 178;
  const maxHp = scaleBossHp(MAJOR_BOSS_ENEMY.hp + Math.min(round * 22, 260));
  return {
    type: "major_boss_brawler",
    bossRank: "major",
    bossVariant: "all",
    name: "大ボス",
    x: WORLD.width + 126,
    y,
    entryX: 655,
    entryY: y,
    entryMode: "side",
    entering: true,
    radius: MAJOR_BOSS_ENEMY.radius,
    visualScale: MAJOR_BOSS_ENEMY.visualScale,
    hp: maxHp,
    maxHp,
    speed: MAJOR_BOSS_ENEMY.speed + Math.min(round, 18),
    damage: scaleEnemyDamage(MAJOR_BOSS_ENEMY.damage + Math.min(Math.floor(round / 10) * 4, 12)),
    attackRangeX: MAJOR_BOSS_ENEMY.attackRangeX,
    attackRangeY: MAJOR_BOSS_ENEMY.attackRangeY,
    chaseRange: 520,
    attackCooldown: 1.2,
    attackWindup: 0,
    attackActive: 0,
    attackType: null,
    windupPatternIndex: 0,
    lockedFacing: null,
    attackTargetX: null,
    attackTargetY: null,
    attackStartX: null,
    attackStartY: null,
    attackLanded: false,
    visualJumpHeight: 0,
    guardTimer: 0,
    guardCooldown: 1.0,
    hasDamagedThisSwing: false,
    facing: -1,
    wanderTimer: 0,
    wanderX: -0.35,
    wanderY: 0,
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function getMidBossVariant(round) {
  return getBossScheduleEntry(round)?.variant ?? "charge";
}

function createBikeEnemy(round = 1, index = 0) {
  const fromRight = Math.random() > 0.5;
  const laneHeight = WORLD.floorBottom - WORLD.floorTop - 120;
  const y = WORLD.floorTop + 72 + Math.random() * laneHeight;
  const maxHp = scaleEnemyHp(BIKE_ENEMY.hp + Math.min(round * 3, 18));
  return {
    type: "bike_rusher",
    name: "バイク敵",
    x: fromRight ? WORLD.width - BIKE_ENEMY.halfVisibleOffset : BIKE_ENEMY.halfVisibleOffset,
    y,
    radius: BIKE_ENEMY.radius,
    hp: maxHp,
    maxHp,
    speed: BIKE_ENEMY.speed + Math.min(round * 12, 90),
    damage: scaleEnemyDamage(BIKE_ENEMY.damage),
    facing: fromRight ? -1 : 1,
    warningTimer: BIKE_ENEMY.warningTime,
    hasDamagedThisRush: false,
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function createSummonedEnemy(type, round = 1, index = 0, fromRight = true) {
  const laneHeight = WORLD.floorBottom - WORLD.floorTop - 120;
  const y = WORLD.floorTop + 68 + ((index * 54 + Math.random() * laneHeight) % laneHeight);
  const xOffset = 74 + index * 18;
  const entryX = fromRight ? WORLD.width - 92 - index * 14 : 92 + index * 14;
  const enemy =
    type === "gunner"
      ? createGunnerEnemy(round, index)
      : type === "knife_thrower"
        ? createKnifeEnemy(round, index)
        : createSummonedPuncher(round, index);

  enemy.x = fromRight ? WORLD.width + xOffset : -xOffset;
  enemy.y = y;
  enemy.entryX = entryX;
  enemy.entryY = y;
  enemy.entryMode = "side";
  enemy.entering = true;
  enemy.facing = fromRight ? -1 : 1;
  enemy.summonedByBoss = true;
  return enemy;
}

function createSummonedPuncher(round = 1, index = 0) {
  const maxHp = scaleEnemyHp(40 + Math.min(round * 5, 35));
  return {
    type: "slow_puncher",
    name: "呼び出された敵",
    x: 0,
    y: 0,
    entryX: 0,
    entryY: 0,
    entryMode: "side",
    entering: true,
    radius: 25,
    hp: maxHp,
    maxHp,
    speed: 76 + Math.min(round * 3, 30),
    damage: scaleEnemyDamage(10),
    attackRangeX: 62,
    attackRangeY: 42,
    chaseRange: 300,
    attackCooldown: 0,
    attackWindup: 0,
    attackActive: 0,
    windupPatternIndex: 0,
    hasDamagedThisSwing: false,
    facing: 1,
    wanderTimer: 0,
    wanderX: 0.4,
    wanderY: Math.random() > 0.5 ? 0.35 : -0.35,
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function createBreakable(type, x, y) {
  const breakableDef = BREAKABLE_TYPES[type];
  return {
    type,
    label: breakableDef.label,
    x,
    y,
    radius: breakableDef.radius,
    width: breakableDef.width,
    height: breakableDef.height,
    hp: breakableDef.hp,
    maxHp: breakableDef.hp,
    hitFlash: 0,
    wobbleTimer: 0,
    active: true,
  };
}

function resetRun(keepScore = false, startArea = 1) {
  state.gameStarted = true;
  state.player = createPlayer();
  state.area = startArea;
  state.wave = startArea;
  state.exitGateOpen = false;
  state.areaTransitionTimer = 0;
  state.superFlashTimer = 0;
  state.screenShakeTimer = 0;
  state.majorBossIntroTimer = 0;
  state.continueActive = false;
  state.continueTimer = 0;
  state.attacks = [];
  state.projectiles = [];
  state.items = [];
  state.breakables = [];
  state.floatingTexts = [];
  spawnWave();
  state.gameOverTimer = 0;
  state.lives = INITIAL_LIVES;
  if (!keepScore) state.score = 0;
  updateContinueOverlay();
  updateTitleOverlay();
  showMessage(`${getCurrentDifficulty().label} Area ${startArea}`, 900);
}

function selectDifficulty(difficultyKey = currentDifficultyKey) {
  if (DIFFICULTY_SETTINGS[difficultyKey]) currentDifficultyKey = difficultyKey;
  updateTitleOverlay();
}

function selectPlayerCharacter(characterKey = currentPlayerCharacterKey) {
  if (PLAYER_CHARACTERS[characterKey]) currentPlayerCharacterKey = characterKey;
  updateTitleOverlay();
  updatePlayerIdentityHud();
}

function startGame(startArea = 1) {
  clearAllInput();
  resetRun(false, startArea);
}

function updateTitleOverlay() {
  titleOverlay.hidden = state.gameStarted;
  updatePlayerIdentityHud();
  difficultyButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.difficulty === currentDifficultyKey);
  });
  [...characterActions.querySelectorAll("[data-character]")].forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.character === currentPlayerCharacterKey);
  });
}

function updatePlayerIdentityHud() {
  const character = getCurrentPlayerCharacter();
  playerNameLabel.textContent = character.label;
  playerAvatar.replaceChildren(createCharacterFaceImage(character, `${character.label} face`));
}

function buildDebugStartButtons() {
  debugStartActions.replaceChildren();

  const startOptions = [{ area: 1, debugLabel: "通常プレイ", primary: true }, ...BOSS_SCHEDULE];
  startOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = `start-button${option.primary ? " primary" : ""}`;
    button.type = "button";
    button.textContent = option.debugLabel;
    button.addEventListener("click", () => startGame(option.area));
    debugStartActions.append(button);
  });
}

function buildCharacterButtons() {
  characterActions.replaceChildren();

  Object.entries(PLAYER_CHARACTERS).forEach(([key, character]) => {
    const button = document.createElement("button");
    button.className = "character-button";
    button.type = "button";
    button.dataset.character = key;
    button.append(createCharacterFaceImage(character, ""));

    const labelWrap = document.createElement("span");
    const name = document.createElement("span");
    name.textContent = character.label;
    const detail = document.createElement("small");
    detail.textContent = character.description;
    labelWrap.append(name, detail);
    button.append(labelWrap);
    button.addEventListener("click", () => selectPlayerCharacter(key));
    characterActions.append(button);
  });
}

function createCharacterFaceImage(character, altText) {
  const image = document.createElement("img");
  image.src = character.sprites.idle;
  image.alt = altText;
  return image;
}

function spawnWave(preserveEventEnemies = false) {
  state.exitGateOpen = false;
  const bossSchedule = getBossScheduleEntry(state.wave);
  if (bossSchedule?.rank === "major") {
    state.enemies = [createMajorBossEnemy(state.wave)];
    state.breakables = createBreakablesForWave(state.wave);
    state.bikeSpawnTimer = null;
    state.bikeSpawnsRemaining = 0;
    state.majorBossIntroTimer = 1.25;
    state.screenShakeTimer = 0.58;
    showMessage("Major Boss!", 1100);
    return;
  }

  if (bossSchedule?.rank === "mid") {
    state.enemies = [createMidBossEnemy(state.wave)];
    state.breakables = createBreakablesForWave(state.wave);
    state.bikeSpawnTimer = null;
    state.bikeSpawnsRemaining = 0;
    return;
  }

  const enemyCount = state.wave === 1 ? 2 : 2 + Math.floor(Math.random() * 2);
  const eventEnemies = preserveEventEnemies ? state.enemies.filter((enemy) => enemy.type === "bike_rusher") : [];
  const regularEnemies = Array.from({ length: enemyCount }, (_, index) => createEnemy(state.wave, index));
  state.enemies = [...eventEnemies, ...regularEnemies];
  state.breakables = createBreakablesForWave(state.wave);
  scheduleBikeSpawnsForWave();
}

function getBossScheduleEntry(round) {
  return BOSS_SCHEDULE.find((entry) => entry.area === round) ?? null;
}

function isBossEnemy(enemy) {
  return BOSS_TYPES.has(enemy.type);
}

function createBreakablesForWave(round) {
  const centerY = WORLD.floorTop + 92 + Math.random() * (WORLD.floorBottom - WORLD.floorTop - 170);
  const breakables = [
    createBreakable("crate", 410 + Math.random() * 90, centerY),
  ];

  if (round >= 2) {
    breakables.push(createBreakable("barrel", 650 + Math.random() * 95, WORLD.floorTop + 120 + Math.random() * 180));
  }

  if (round >= 3 && Math.random() < 0.55) {
    breakables.push(createBreakable("crate", 545 + Math.random() * 120, WORLD.floorTop + 90 + Math.random() * 210));
  }

  return breakables;
}

function scheduleBikeSpawnsForWave() {
  if (state.wave < 2) {
    state.bikeSpawnTimer = null;
    state.bikeSpawnsRemaining = 0;
    return;
  }

  state.bikeSpawnsRemaining = state.wave >= 3 && Math.random() < 0.45 ? 2 : 1;
  state.bikeSpawnTimer = 2 + Math.random() * 3;
}

function updateBikeSpawner(dt) {
  if (state.bikeSpawnTimer === null || state.bikeSpawnsRemaining <= 0) return;
  if (state.player.hp <= 0) return;

  state.bikeSpawnTimer -= dt;
  if (state.bikeSpawnTimer > 0) return;

  state.enemies.push(createBikeEnemy(state.wave));
  state.bikeSpawnsRemaining -= 1;
  state.bikeSpawnTimer = state.bikeSpawnsRemaining > 0 ? 4 + Math.random() * 4 : null;
}

function showMessage(text, duration = 900) {
  message.textContent = text;
  message.classList.add("is-visible");
  window.clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = window.setTimeout(() => {
    message.classList.remove("is-visible");
  }, duration);
}

function addFloatingText(x, y, text, color = "#f6f0df") {
  state.floatingTexts.push({
    x,
    y,
    text,
    color,
    age: 0,
    duration: 0.82,
    lift: 34 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 18,
  });
}

function addSpecialGauge(amount) {
  const player = state.player;
  player.specialGauge = clamp(player.specialGauge + amount, 0, SPECIAL_GAUGE.max);
}

function canUsePlayerAction() {
  return !state.continueActive && state.player.hp > 0;
}

function showPlayerDefeatMessage() {
  showMessage(state.lives <= 1 ? "Retry!" : "Down!", 800);
}

function setPlayerInvincibleAfterDamage(duration) {
  state.player.invincibleTimer = duration;
  state.player.respawnInvincible = false;
  state.player.damageSpriteTimer = Math.min(duration, 0.16);
}

function loadSpriteImages(paths) {
  return Object.fromEntries(
    Object.entries(paths).map(([key, path]) => {
      const image = new Image();
      const sprite = {
        image,
        loaded: false,
        failed: false,
      };
      image.onload = () => {
        sprite.loaded = true;
      };
      image.onerror = () => {
        sprite.failed = true;
      };
      image.src = path;
      return [key, sprite];
    }),
  );
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function screenToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * WORLD.width,
    y: ((event.clientY - rect.top) / rect.height) * WORLD.height,
    screenX: event.clientX - rect.left,
    screenWidth: rect.width,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(x, y) {
  const len = Math.hypot(x, y);
  if (len < 0.001) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}

function requestAttack() {
  const player = state.player;
  if (player.hp <= 0 || player.attackCooldown > 0) return;

  if (player.hasKnife) {
    throwPlayerKnife();
    return;
  }

  if (player.isJumping) {
    requestJumpKick();
    return;
  }

  if (player.comboTimer <= 0) {
    player.comboStep = 0;
  } else {
    player.comboStep = (player.comboStep + 1) % COMBO_ATTACKS.length;
  }

  const combo = COMBO_ATTACKS[player.comboStep];
  player.comboTimer = 0.72;
  player.attackCooldown = combo.cooldown;
  const attack = {
    x: player.x + player.facing * combo.reach,
    y: player.y,
    width: combo.width,
    height: combo.height,
    facing: player.facing,
    damage: combo.damage,
    comboStep: player.comboStep + 1,
    knockback: combo.knockback,
    hitStop: combo.hitStop,
    age: 0,
    duration: combo.duration,
    hasHit: new Set(),
  };
  state.attacks.push(attack);
}

function throwPlayerKnife() {
  const player = state.player;
  player.hasKnife = false;
  player.attackCooldown = PLAYER_KNIFE.cooldown;
  player.comboTimer = 0;
  player.comboStep = 0;

  const jumpHeight = getPlayerJumpHeight(player);
  state.projectiles.push({
    type: "player_knife",
    x: player.x + player.facing * 34,
    y: player.y - jumpHeight * 0.55 - 18,
    vx: player.facing * PLAYER_KNIFE.speed,
    vy: 0,
    radius: PLAYER_KNIFE.radius,
    damage: PLAYER_KNIFE.damage,
    age: 0,
    spin: player.facing > 0 ? 0 : Math.PI,
    active: true,
    hasHit: new Set(),
  });
  addFloatingText(player.x, player.y - jumpHeight - 70, "KNIFE!", "#79d7ff");
}

function requestSpecialSkill() {
  const player = state.player;
  if (!canUsePlayerAction() || player.attackCooldown > 0 || player.specialGauge < SPECIAL_GAUGE.skillCost) return false;

  player.specialGauge -= SPECIAL_GAUGE.skillCost;
  player.attackCooldown = SPECIAL_GAUGE.skillCooldown;
  player.comboStep = 0;
  player.comboTimer = 0;
  state.attacks.push({
    type: "special",
    x: player.x,
    y: player.y,
    radius: SPECIAL_GAUGE.skillRadius,
    damage: SPECIAL_GAUGE.skillDamage,
    knockback: 74,
    hitStop: 0.22,
    age: 0,
    duration: 0.26,
    hasHit: new Set(),
  });
  addFloatingText(player.x, player.y - 92, "SPECIAL!", "#79d7ff");
  return true;
}

function requestSuperSpecial() {
  const player = state.player;
  if (!canUsePlayerAction() || player.specialGauge < SPECIAL_GAUGE.max) return false;

  player.specialGauge = 0;
  player.attackCooldown = Math.max(player.attackCooldown, 0.55);
  state.superFlashTimer = 0.42;
  state.enemies.forEach((enemy) => {
    damageEnemy(enemy, SPECIAL_GAUGE.superDamage, {
      knockbackX: enemy.x < player.x ? -520 : 520,
      knockbackY: -90,
      hitStop: 0.36,
      flash: 0.36,
      score: 70,
    });
    addFloatingText(enemy.x, enemy.y - 92, `-${SPECIAL_GAUGE.superDamage}`, "#fff1be");
  });
  addFloatingText(player.x, player.y - 108, "SUPER!", "#ffc857");
  return true;
}

function requestJump(direction) {
  const player = state.player;
  if (player.hp <= 0 || player.isJumping) return;

  player.isJumping = true;
  player.jumpTimer = JUMP.duration;
  player.jumpDirection = direction;
  player.jumpKickUsed = false;
  player.facing = direction;
  player.comboTimer = 0;
  player.comboStep = 0;
}

function requestJumpKick() {
  const player = state.player;
  if (!player.isJumping || player.jumpKickUsed) return;

  player.jumpKickUsed = true;
  player.attackCooldown = JUMP_KICK.cooldown;
  state.attacks.push({
    x: player.x + player.facing * JUMP_KICK.reach,
    y: player.y - getPlayerJumpHeight(player) * 0.72,
    width: JUMP_KICK.width,
    height: JUMP_KICK.height,
    facing: player.facing,
    damage: JUMP_KICK.damage,
    comboStep: "K",
    knockback: JUMP_KICK.knockback,
    hitStop: JUMP_KICK.hitStop,
    age: 0,
    duration: JUMP_KICK.duration,
    hasHit: new Set(),
  });
  addFloatingText(player.x, player.y - getPlayerJumpHeight(player) - 78, "KICK", "#79d7ff");
}

function updateInputVector() {
  let x = 0;
  let y = 0;

  if (input.keys.has("ArrowLeft") || input.keys.has("KeyA")) x -= 1;
  if (input.keys.has("ArrowRight") || input.keys.has("KeyD")) x += 1;
  if (input.keys.has("ArrowUp") || input.keys.has("KeyW")) y -= 1;
  if (input.keys.has("ArrowDown") || input.keys.has("KeyS")) y += 1;

  x += input.pointerMoveX;
  y += input.pointerMoveY;

  const dir = normalize(x, y);
  input.moveX = dir.x;
  input.moveY = dir.y;
}

function updatePlayer(dt) {
  const player = state.player;
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.comboTimer = Math.max(0, player.comboTimer - dt);
  player.invincibleTimer = Math.max(0, player.invincibleTimer - dt);
  player.damageSpriteTimer = Math.max(0, player.damageSpriteTimer - dt);
  if (player.invincibleTimer <= 0) player.respawnInvincible = false;

  if (player.comboTimer <= 0 && player.attackCooldown <= 0) {
    player.comboStep = 0;
  }

  if (player.hp <= 0) {
    state.gameOverTimer += dt;
    if (state.gameOverTimer > 0.85) handlePlayerDefeat();
    return;
  }

  updateInputVector();
  if (player.isJumping) {
    player.jumpTimer = Math.max(0, player.jumpTimer - dt);
    player.x += player.jumpDirection * JUMP.horizontalSpeed * dt;
    if (player.jumpTimer <= 0) {
      player.isJumping = false;
      player.jumpDirection = 0;
      player.jumpKickUsed = false;
    }
  } else {
    player.x += input.moveX * player.speed * dt;
    player.y += input.moveY * player.speed * dt;
  }
  player.x = clamp(player.x, 45, WORLD.width - 45);
  player.y = clamp(player.y, WORLD.floorTop + 32, WORLD.floorBottom - 30);

  if (!player.isJumping && Math.abs(input.moveX) > 0.05) {
    player.facing = input.moveX > 0 ? 1 : -1;
  }
}

function handlePlayerDefeat() {
  if (state.lives <= 1) {
    startContinueCountdown();
    return;
  }

  state.lives -= 1;
  revivePlayer();
}

function revivePlayer() {
  const player = state.player;
  player.x = 92;
  player.y = clamp(player.y, WORLD.floorTop + 44, WORLD.floorBottom - 42);
  player.hp = player.maxHp;
  player.facing = 1;
  player.invincibleTimer = 3;
  player.respawnInvincible = true;
  player.damageSpriteTimer = 0;
  player.attackCooldown = 0;
  player.comboStep = 0;
  player.comboTimer = 0;
  player.hasKnife = false;
  player.isJumping = false;
  player.jumpTimer = 0;
  player.jumpDirection = 0;
  player.jumpKickUsed = false;
  state.attacks = [];
  state.projectiles = [];
  state.gameOverTimer = 0;
  showMessage(`Life ${state.lives}`, 700);
}

function startContinueCountdown() {
  state.continueActive = true;
  state.continueTimer = CONTINUE_COUNTDOWN;
  state.superFlashTimer = 0;
  state.attacks = [];
  state.projectiles = [];
  clearAllInput();
  updateContinueOverlay();
}

function updateContinue(dt) {
  if (!state.continueActive) return;

  state.continueTimer = Math.max(0, state.continueTimer - dt);
  updateContinueOverlay();
  if (state.continueTimer <= 0) giveUpContinue();
}

function acceptContinue() {
  if (!state.continueActive) return;

  state.continueActive = false;
  state.continueTimer = 0;
  state.lives = INITIAL_LIVES;
  state.wave = state.area;
  state.exitGateOpen = false;
  state.areaTransitionTimer = 0.58;
  state.superFlashTimer = 0;
  state.gameOverTimer = 0;
  state.attacks = [];
  state.projectiles = [];
  state.items = [];
  state.enemies = [];
  state.breakables = [];
  spawnWave(false);
  revivePlayer();
  updateContinueOverlay();
}

function giveUpContinue() {
  if (!state.continueActive) return;

  state.continueActive = false;
  state.continueTimer = 0;
  updateContinueOverlay();
  resetRun(false);
}

function updateContinueOverlay() {
  continueOverlay.hidden = !state.continueActive;
  if (!state.continueActive) return;

  continueCount.textContent = String(Math.ceil(state.continueTimer));
}

function updateAreaProgression() {
  const player = state.player;
  if (!state.exitGateOpen || player.hp <= 0) return;
  if (player.x < WORLD.width - 58) return;

  enterNextArea();
}

function getPlayerJumpHeight(player) {
  if (!player.isJumping) return 0;
  const progress = 1 - player.jumpTimer / JUMP.duration;
  return Math.sin(progress * Math.PI) * JUMP.height;
}

function updateEnemies(dt) {
  const player = state.player;

  state.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) {
      enemy.koTimer = Math.max(0, (enemy.koTimer ?? 0) - dt);
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      return;
    }

    if (enemy.type === "bike_rusher") {
      updateBikeEnemy(enemy, player, dt);
      return;
    }

    if (isBossEnemy(enemy)) {
      updateMidBossEnemy(enemy, player, dt);
      return;
    }

    if (enemy.type === "knife_thrower") {
      updateKnifeEnemy(enemy, player, dt);
      return;
    }

    if (enemy.type === "gunner") {
      updateGunnerEnemy(enemy, player, dt);
      return;
    }

    const wasWindingUp = enemy.attackWindup > 0;
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.attackWindup = Math.max(0, enemy.attackWindup - dt);
    enemy.attackActive = Math.max(0, enemy.attackActive - dt);
    enemy.wanderTimer = Math.max(0, enemy.wanderTimer - dt);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.hitStopTimer = Math.max(0, enemy.hitStopTimer - dt);

    if (player.hp <= 0) return;

    applyEnemyKnockback(enemy, dt);

    if (enemy.hitStopTimer > 0) {
      enemy.attackWindup = 0;
      enemy.attackActive = 0;
      enemy.hasDamagedThisSwing = false;
      return;
    }

    if (enemy.entering) {
      updateEnemyEntrance(enemy, dt);
      return;
    }

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const toPlayer = normalize(dx, dy);
    const gap = distance(player, enemy);
    const inMeleeRange = Math.abs(dx) <= enemy.attackRangeX && Math.abs(dy) <= enemy.attackRangeY;

    if (Math.abs(dx) > 4) enemy.facing = dx > 0 ? 1 : -1;

    if (enemy.attackActive > 0) {
      applyEnemyAttack(enemy, player);
      return;
    }

    if (wasWindingUp && enemy.attackWindup <= 0) {
      enemy.attackActive = DIFFICULTY.enemyAttackActive;
      return;
    }

    if (enemy.attackWindup > 0) return;

    if (inMeleeRange && enemy.attackCooldown <= 0) {
      enemy.attackWindup = getAttackWindup(DIFFICULTY.enemyAttackWindup, enemy);
      enemy.attackActive = 0;
      enemy.attackCooldown = getEnemyAttackCooldown() + Math.random() * 0.45;
      enemy.hasDamagedThisSwing = false;
      return;
    }

    if (gap < enemy.chaseRange) {
      const yPriority = Math.abs(dy) > enemy.attackRangeY * 0.75 ? 0.85 : 0.28;
      enemy.x += toPlayer.x * enemy.speed * dt;
      enemy.y += toPlayer.y * enemy.speed * yPriority * dt;
    } else {
      if (enemy.wanderTimer <= 0) {
        const wander = normalize(Math.random() * 2 - 1, Math.random() * 2 - 1);
        enemy.wanderX = wander.x;
        enemy.wanderY = wander.y;
        enemy.wanderTimer = 0.7 + Math.random() * 1.25;
      }
      enemy.x += enemy.wanderX * enemy.speed * 0.48 * dt;
      enemy.y += enemy.wanderY * enemy.speed * 0.48 * dt;
    }

    nudgeEnemyFromSideEdges(enemy, dt);
  });
}

function updateGunnerEnemy(enemy, player, dt) {
  const wasWindingUp = enemy.shotWindup > 0;
  enemy.shotCooldown = Math.max(0, enemy.shotCooldown - dt);
  enemy.shotWindup = Math.max(0, enemy.shotWindup - dt);
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
  enemy.hitStopTimer = Math.max(0, enemy.hitStopTimer - dt);

  if (player.hp <= 0) return;

  applyEnemyKnockback(enemy, dt);

  if (enemy.hitStopTimer > 0) {
    enemy.shotWindup = 0;
    enemy.hasQueuedShot = false;
    return;
  }

  if (enemy.entering) {
    updateEnemyEntrance(enemy, dt);
    return;
  }

  const dx = player.x - enemy.x;
  if (Math.abs(dx) > 4) enemy.facing = dx > 0 ? 1 : -1;

  if (updateRangedReposition(enemy, dt)) return;

  if (wasWindingUp && enemy.shotWindup <= 0 && enemy.hasQueuedShot) {
    fireEnemyBullet(enemy, player);
    enemy.hasQueuedShot = false;
    enemy.shotsFired += 1;
    maybeStartRangedReposition(enemy);
    enemy.shotCooldown = GUNNER_ENEMY.shotCooldownMin + Math.random() * (GUNNER_ENEMY.shotCooldownMax - GUNNER_ENEMY.shotCooldownMin);
    return;
  }

  if (enemy.shotWindup > 0) return;

  if (enemy.shotCooldown <= 0) {
    enemy.shotWindup = getAttackWindup(GUNNER_ENEMY.shotWindup, enemy);
    enemy.hasQueuedShot = true;
  }
}

function updateMidBossEnemy(enemy, player, dt) {
  const wasWindingUp = enemy.attackWindup > 0;
  const wasGuarding = enemy.guardTimer > 0;
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
  enemy.attackWindup = Math.max(0, enemy.attackWindup - dt);
  enemy.attackActive = Math.max(0, enemy.attackActive - dt);
  enemy.guardTimer = Math.max(0, enemy.guardTimer - dt);
  enemy.guardCooldown = Math.max(0, enemy.guardCooldown - dt);
  enemy.summonCooldownTimer = Math.max(0, (enemy.summonCooldownTimer ?? 0) - dt);
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
  enemy.hitStopTimer = Math.max(0, enemy.hitStopTimer - dt);
  updateBossSummonCooldown(enemy);

  if (player.hp <= 0) return;

  applyEnemyKnockback(enemy, dt);

  if (enemy.hitStopTimer > 0) {
    return;
  }

  if (enemy.entering) {
    updateEnemyEntrance(enemy, dt);
    return;
  }

  if (wasGuarding && enemy.guardTimer <= 0) {
    clearMidBossAttackState(enemy);
    enemy.attackCooldown = 0;
  }

  if (enemy.lockedFacing !== null && enemy.attackWindup <= 0 && enemy.attackActive <= 0 && enemy.guardTimer <= 0 && !wasWindingUp) {
    clearMidBossAttackState(enemy);
  }

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const toPlayer = normalize(dx, dy);
  const gap = distance(player, enemy);
  const inMeleeRange = Math.abs(dx) <= enemy.attackRangeX && Math.abs(dy) <= enemy.attackRangeY;
  const canCharge = canBossUseAttack(enemy, "charge");
  const canShock = canBossUseAttack(enemy, "shock");
  const canJump = canBossUseAttack(enemy, "jump");
  const canKnife = canBossUseAttack(enemy, "knife");
  const canSummon = canBossUseAttack(enemy, "summon") && canBossStartSummon(enemy);
  const inChargeRange =
    canCharge &&
    Math.abs(dx) >= MID_BOSS_ENEMY.chargeRangeMin &&
    Math.abs(dx) <= MID_BOSS_ENEMY.chargeRangeMax &&
    Math.abs(dy) <= enemy.attackRangeY * 1.15;
  const inShockRange = canShock && gap <= MID_BOSS_ENEMY.shockRadius * 0.95;
  const inJumpRange =
    canJump &&
    gap >= MID_BOSS_ENEMY.jumpRangeMin &&
    gap <= MID_BOSS_ENEMY.jumpRangeMax;
  const inKnifeRange =
    canKnife &&
    gap >= MID_BOSS_ENEMY.knifeRangeMin &&
    gap <= MID_BOSS_ENEMY.knifeRangeMax &&
    Math.abs(dy) <= enemy.attackRangeY * 1.8;

  if (enemy.lockedFacing !== null) {
    enemy.facing = enemy.lockedFacing;
  } else if (Math.abs(dx) > 4) {
    enemy.facing = dx > 0 ? 1 : -1;
  }

  if (enemy.attackActive > 0) {
    applyMidBossActiveAttack(enemy, player, dt);
    return;
  }

  if (wasWindingUp && enemy.attackWindup <= 0) {
    beginMidBossActiveAttack(enemy);
    return;
  }

  if (enemy.attackWindup > 0) {
    enemy.facing = enemy.lockedFacing ?? enemy.facing;
    return;
  }

  if (enemy.guardTimer > 0) {
    enemy.facing = enemy.lockedFacing ?? enemy.facing;
    return;
  }

  if (gap <= MID_BOSS_ENEMY.guardRange && enemy.guardCooldown <= 0 && enemy.attackCooldown <= 0) {
    startMidBossGuard(enemy);
    return;
  }

  if (enemy.attackCooldown <= 0) {
    const bossAttackType = chooseBossAttackType(enemy, { canSummon, inShockRange, inChargeRange, inJumpRange, inKnifeRange, inMeleeRange });
    if (bossAttackType) {
      startMidBossAttack(enemy, bossAttackType, player);
      return;
    }
  }

  if (inMeleeRange && enemy.attackCooldown <= 0) {
    startMidBossAttack(enemy, "smash", player);
    return;
  }

  enemy.x += toPlayer.x * enemy.speed * dt;
  enemy.y += toPlayer.y * enemy.speed * 0.42 * dt;
  nudgeEnemyFromSideEdges(enemy, dt, 0.35);
}

function canBossUseAttack(enemy, attackType) {
  if (attackType === "summon") return enemy.bossVariant === "summon";
  return enemy.bossVariant === "all" || enemy.bossVariant === attackType;
}

function chooseBossAttackType(enemy, ranges) {
  if (enemy.bossVariant !== "all") {
    if (ranges.canSummon) return "summon";
    if (ranges.inShockRange) return "shock";
    if (ranges.inChargeRange) return "charge";
    if (ranges.inJumpRange) return "jump";
    if (ranges.inKnifeRange) return "knife";
    return null;
  }

  const candidates = [];
  if (ranges.inShockRange) candidates.push("shock");
  if (ranges.inChargeRange) candidates.push("charge");
  if (ranges.inJumpRange) candidates.push("jump");
  if (ranges.inKnifeRange) candidates.push("knife");
  if (ranges.inMeleeRange) candidates.push("smash");
  if (candidates.length === 0) return null;

  const lastIndex = candidates.indexOf(enemy.lastAttackType);
  if (lastIndex < 0) return candidates[0];
  return candidates[(lastIndex + 1) % candidates.length];
}

function startMidBossGuard(enemy) {
  enemy.lockedFacing = enemy.facing;
  enemy.attackType = "guard";
  enemy.attackWindup = 0;
  enemy.attackActive = 0;
  enemy.guardTimer = MID_BOSS_ENEMY.guardDuration;
  enemy.guardCooldown = enemy.bossRank === "major" ? MAJOR_BOSS_ENEMY.guardCooldown : MID_BOSS_ENEMY.guardCooldown;
  enemy.hasDamagedThisSwing = false;
}

function startMidBossAttack(enemy, attackType, player) {
  enemy.lockedFacing = enemy.facing;
  enemy.attackType = attackType;
  enemy.lastAttackType = attackType;
  enemy.attackActive = 0;
  enemy.hasDamagedThisSwing = false;
  enemy.attackStartX = enemy.x;
  enemy.attackStartY = enemy.y;
  enemy.attackLanded = false;
  enemy.visualJumpHeight = 0;

  if (attackType === "charge") {
    enemy.attackWindup = getAttackWindup(MID_BOSS_ENEMY.chargeWindup, enemy);
    enemy.attackCooldown = MID_BOSS_ENEMY.attackCooldown + 0.55 + Math.random() * 0.55;
    return;
  }

  if (attackType === "shock") {
    enemy.attackWindup = getAttackWindup(MID_BOSS_ENEMY.shockWindup, enemy);
    enemy.attackCooldown = MID_BOSS_ENEMY.attackCooldown + 0.85 + Math.random() * 0.45;
    return;
  }

  if (attackType === "jump") {
    enemy.attackTargetX = clamp(player.x, 130, WORLD.width - 130);
    enemy.attackTargetY = clamp(player.y, WORLD.floorTop + 52, WORLD.floorBottom - 46);
    enemy.attackWindup = getAttackWindup(MID_BOSS_ENEMY.jumpWindup, enemy);
    enemy.attackCooldown = MID_BOSS_ENEMY.attackCooldown + 1.1 + Math.random() * 0.55;
    return;
  }

  if (attackType === "knife") {
    enemy.attackTargetX = player.x;
    enemy.attackTargetY = player.y - getPlayerJumpHeight(player) * 0.35;
    enemy.attackWindup = getAttackWindup(MID_BOSS_ENEMY.knifeWindup, enemy);
    enemy.attackCooldown = MID_BOSS_ENEMY.attackCooldown + 0.72 + Math.random() * 0.45;
    return;
  }

  if (attackType === "summon") {
    enemy.attackWindup = getAttackWindup(MID_BOSS_ENEMY.summonWindup, enemy);
    enemy.attackCooldown = MID_BOSS_ENEMY.attackCooldown + 1.35 + Math.random() * 0.5;
    return;
  }

  enemy.attackWindup = getAttackWindup(MID_BOSS_ENEMY.attackWindup, enemy);
  enemy.attackCooldown = MID_BOSS_ENEMY.attackCooldown + Math.random() * 0.45;
}

function beginMidBossActiveAttack(enemy) {
  if (enemy.attackType === "charge") {
    enemy.attackActive = MID_BOSS_ENEMY.chargeActive;
    return;
  }

  if (enemy.attackType === "shock") {
    enemy.attackActive = MID_BOSS_ENEMY.shockActive;
    return;
  }

  if (enemy.attackType === "jump") {
    enemy.attackActive = MID_BOSS_ENEMY.jumpActive;
    enemy.attackStartX = enemy.x;
    enemy.attackStartY = enemy.y;
    return;
  }

  if (enemy.attackType === "knife") {
    enemy.attackActive = MID_BOSS_ENEMY.knifeActive;
    return;
  }

  if (enemy.attackType === "summon") {
    enemy.attackActive = MID_BOSS_ENEMY.summonActive;
    return;
  }

  enemy.attackActive = MID_BOSS_ENEMY.attackActive;
}

function applyMidBossActiveAttack(enemy, player, dt) {
  if (enemy.attackType === "charge") {
    enemy.x += enemy.facing * MID_BOSS_ENEMY.chargeSpeed * dt;
    enemy.x = clamp(enemy.x, 58, WORLD.width - 58);
    applyEnemyAttack(enemy, player);
    return;
  }

  if (enemy.attackType === "shock") {
    applyMidBossRadialAttack(enemy, player, MID_BOSS_ENEMY.shockRadius, enemy.damage);
    return;
  }

  if (enemy.attackType === "jump") {
    updateMidBossJumpPress(enemy, player);
    return;
  }

  if (enemy.attackType === "knife") {
    throwBossKnives(enemy);
    return;
  }

  if (enemy.attackType === "summon") {
    summonBossEnemies(enemy);
    return;
  }

  applyEnemyAttack(enemy, player);
}

function throwBossKnives(enemy) {
  if (enemy.attackLanded) return;

  enemy.attackLanded = true;
  const knifeCount = enemy.bossRank === "major" ? getMajorBossKnifeCount() : 3;
  const spreadStep = knifeCount <= 3 ? 0.16 : 0.12;
  const startOffset = -((knifeCount - 1) * spreadStep) / 2;
  const targetX = enemy.attackTargetX ?? state.player.x;
  const targetY = enemy.attackTargetY ?? state.player.y;
  const baseDirection = normalize(targetX - enemy.x, targetY - enemy.y);
  const baseAngle = Math.atan2(baseDirection.y, baseDirection.x);

  for (let index = 0; index < knifeCount; index += 1) {
    const angle = baseAngle + startOffset + spreadStep * index;
    const speed = MID_BOSS_ENEMY.knifeSpeed * (currentDifficultyKey === "hard" ? 1.08 : 1);
    state.projectiles.push({
      type: "enemy_knife",
      x: enemy.x + enemy.facing * 42,
      y: enemy.y - 22,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 10,
      damage: scaleEnemyDamage(MID_BOSS_ENEMY.knifeDamage),
      age: 0,
      spin: angle,
      active: true,
    });
  }

  addFloatingText(enemy.x, enemy.y - 96, "KNIVES!", "#79d7ff");
}

function summonBossEnemies(enemy) {
  if (enemy.attackLanded) return;

  enemy.attackLanded = true;
  const summonTypes = getBossSummonTypes();
  const summonCount = getBossSummonCount();

  for (let index = 0; index < summonCount; index += 1) {
    const type = summonTypes[index % summonTypes.length];
    const fromRight = index % 2 === 0;
    state.enemies.push(createSummonedEnemy(type, state.wave, enemy.summonedEnemyCount + index, fromRight));
  }

  enemy.summonedEnemyCount += summonCount;
  enemy.hasActiveSummonWave = true;
  addFloatingText(enemy.x, enemy.y - 96, "CALL!", "#ffc857");
}

function canBossStartSummon(enemy) {
  return !enemy.hasActiveSummonWave && (enemy.summonCooldownTimer ?? 0) <= 0 && getActiveSummonedEnemyCount() === 0;
}

function updateBossSummonCooldown(enemy) {
  if (!enemy.hasActiveSummonWave) return;
  if (getActiveSummonedEnemyCount() > 0) return;

  enemy.hasActiveSummonWave = false;
  enemy.summonCooldownTimer = 10;
}

function getActiveSummonedEnemyCount() {
  return state.enemies.filter((enemy) => enemy.summonedByBoss && enemy.hp > 0).length;
}

function getBossSummonCount() {
  return currentDifficultyKey === "hard" ? 5 : 3;
}

function getBossSummonTypes() {
  if (currentDifficultyKey === "easy") return ["slow_puncher"];
  if (currentDifficultyKey === "hard") return ["knife_thrower", "gunner"];
  return ["knife_thrower"];
}

function getMajorBossKnifeCount() {
  if (currentDifficultyKey === "easy") return 3;
  if (currentDifficultyKey === "hard") return 7;
  return 5;
}

function updateMidBossJumpPress(enemy, player) {
  const progress = 1 - enemy.attackActive / MID_BOSS_ENEMY.jumpActive;
  const moveProgress = clamp(progress / 0.72, 0, 1);
  enemy.x = enemy.attackStartX + (enemy.attackTargetX - enemy.attackStartX) * moveProgress;
  enemy.y = enemy.attackStartY + (enemy.attackTargetY - enemy.attackStartY) * moveProgress;
  enemy.visualJumpHeight = Math.sin(progress * Math.PI) * MID_BOSS_ENEMY.jumpHeight;

  if (progress < 0.72 || enemy.attackLanded) return;

  enemy.attackLanded = true;
  enemy.visualJumpHeight = 0;
  applyMidBossRadialAttack(enemy, player, MID_BOSS_ENEMY.jumpImpactRadius, enemy.damage + 4);
}

function applyMidBossRadialAttack(enemy, player, radius, damage) {
  if (enemy.hasDamagedThisSwing || player.invincibleTimer > 0 || player.isJumping) return;
  if (distance(enemy, player) > radius + player.radius * 0.65) return;

  enemy.hasDamagedThisSwing = true;
  player.hp = Math.max(0, player.hp - damage);
  addSpecialGauge(10);
  setPlayerInvincibleAfterDamage(0.65);
  addFloatingText(player.x, player.y - 62, `-${damage}`, "#ff6b5a");
  if (player.hp <= 0) showPlayerDefeatMessage();
}

function clearMidBossAttackState(enemy) {
  enemy.attackType = null;
  enemy.lockedFacing = null;
  enemy.attackTargetX = null;
  enemy.attackTargetY = null;
  enemy.attackStartX = null;
  enemy.attackStartY = null;
  enemy.attackLanded = false;
  enemy.visualJumpHeight = 0;
}

function fireEnemyBullet(enemy, player) {
  const targetY = clamp(player.y - getPlayerJumpHeight(player) * 0.38, WORLD.floorTop + 24, WORLD.floorBottom - 12);
  const direction = normalize(enemy.facing, (targetY - enemy.y) / 260);
  state.projectiles.push({
    type: "enemy_bullet",
    x: enemy.x + enemy.facing * 42,
    y: enemy.y - 22,
    vx: direction.x * GUNNER_ENEMY.bulletSpeed,
    vy: direction.y * GUNNER_ENEMY.bulletSpeed,
    radius: 7,
    damage: enemy.damage,
    age: 0,
    spin: 0,
    active: true,
  });
}

function updateKnifeEnemy(enemy, player, dt) {
  const wasWindingUp = enemy.throwWindup > 0;
  enemy.throwCooldown = Math.max(0, enemy.throwCooldown - dt);
  enemy.throwWindup = Math.max(0, enemy.throwWindup - dt);
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
  enemy.hitStopTimer = Math.max(0, enemy.hitStopTimer - dt);

  if (player.hp <= 0) return;

  applyEnemyKnockback(enemy, dt);

  if (enemy.hitStopTimer > 0) {
    enemy.throwWindup = 0;
    enemy.hasQueuedKnife = false;
    return;
  }

  if (enemy.entering) {
    updateEnemyEntrance(enemy, dt);
    return;
  }

  const dx = player.x - enemy.x;
  if (Math.abs(dx) > 4) enemy.facing = dx > 0 ? 1 : -1;

  if (updateRangedReposition(enemy, dt)) return;

  if (wasWindingUp && enemy.throwWindup <= 0 && enemy.hasQueuedKnife) {
    throwEnemyKnife(enemy, player);
    enemy.hasQueuedKnife = false;
    enemy.shotsFired += 1;
    maybeStartRangedReposition(enemy);
    enemy.throwCooldown = KNIFE_ENEMY.throwCooldownMin + Math.random() * (KNIFE_ENEMY.throwCooldownMax - KNIFE_ENEMY.throwCooldownMin);
    return;
  }

  if (enemy.throwWindup > 0) return;

  if (enemy.throwCooldown <= 0) {
    enemy.throwWindup = getAttackWindup(KNIFE_ENEMY.throwWindup, enemy);
    enemy.hasQueuedKnife = true;
  }
}

function maybeStartRangedReposition(enemy) {
  if (enemy.repositioning || enemy.shotsFired < enemy.shotsBeforeReposition) return;

  enemy.repositioning = true;
}

function updateRangedReposition(enemy, dt) {
  if (!enemy.repositioning) {
    nudgeEnemyFromSideEdges(enemy, dt, 0.55);
    return false;
  }

  const target = { x: enemy.repositionTargetX, y: enemy.repositionTargetY };
  const toTarget = normalize(target.x - enemy.x, target.y - enemy.y);
  enemy.x += toTarget.x * ENEMY_EDGE_CONTROL.rangedMoveSpeed * dt;
  enemy.y += toTarget.y * ENEMY_EDGE_CONTROL.rangedMoveSpeed * 0.72 * dt;
  enemy.x = clamp(enemy.x, ENEMY_EDGE_CONTROL.leftComfortX, ENEMY_EDGE_CONTROL.rightComfortX);
  enemy.y = clamp(enemy.y, WORLD.floorTop + 32, WORLD.floorBottom - 30);

  if (Math.abs(target.x - enemy.x) < 8 && Math.abs(target.y - enemy.y) < 8) {
    enemy.x = target.x;
    enemy.y = target.y;
    enemy.repositioning = false;
  }

  return enemy.repositioning;
}

function throwEnemyKnife(enemy, player) {
  const targetY = clamp(player.y - getPlayerJumpHeight(player) * 0.45, WORLD.floorTop + 24, WORLD.floorBottom - 12);
  const direction = normalize(enemy.facing, (targetY - enemy.y) / 220);
  state.projectiles.push({
    type: "enemy_knife",
    x: enemy.x + enemy.facing * 38,
    y: enemy.y - 16,
    vx: direction.x * KNIFE_ENEMY.knifeSpeed,
    vy: direction.y * KNIFE_ENEMY.knifeSpeed,
    radius: 10,
    damage: enemy.damage,
    age: 0,
    spin: 0,
    active: true,
  });
}

function updateBikeEnemy(enemy, player, dt) {
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
  enemy.hitStopTimer = Math.max(0, enemy.hitStopTimer - dt);
  applyEnemyKnockback(enemy, dt, false);

  if (enemy.hitStopTimer > 0) return;

  if (enemy.warningTimer > 0) {
    enemy.warningTimer = Math.max(0, enemy.warningTimer - dt);
    return;
  }

  enemy.x += enemy.facing * enemy.speed * dt;
  if (!player.isJumping && !enemy.hasDamagedThisRush && circleIntersectsRect(player, getBikeHitBox(enemy))) {
    enemy.hasDamagedThisRush = true;
    player.hp = Math.max(0, player.hp - enemy.damage);
    addSpecialGauge(10);
    setPlayerInvincibleAfterDamage(0.65);
    addFloatingText(player.x, player.y - 62, `-${enemy.damage}`, "#ff6b5a");
    if (player.hp <= 0) showPlayerDefeatMessage();
  }
}

function updateProjectiles(dt) {
  const player = state.player;

  state.projectiles.forEach((projectile) => {
    projectile.age += dt;
    projectile.spin += dt * 16;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;

    if ((projectile.type === "enemy_knife" || projectile.type === "enemy_bullet") && projectile.active && !player.isJumping && player.invincibleTimer <= 0) {
      if (distance(projectile, player) <= projectile.radius + player.radius * 0.75) {
        projectile.active = false;
        player.hp = Math.max(0, player.hp - projectile.damage);
        addSpecialGauge(10);
        setPlayerInvincibleAfterDamage(0.55);
        addFloatingText(player.x, player.y - 62, `-${projectile.damage}`, "#ff6b5a");
        if (player.hp <= 0) showPlayerDefeatMessage();
      }
    }

    if (projectile.type === "player_knife" && projectile.active) {
      state.enemies.forEach((enemy) => {
        if (!projectile.active || projectile.hasHit.has(enemy)) return;
        if (distance(projectile, enemy) > projectile.radius + enemy.radius * 0.8) return;

        projectile.hasHit.add(enemy);
        projectile.active = false;
        const projectileFacing = Math.sign(projectile.vx) || state.player.facing;
        const bossDefense = damageEnemy(enemy, projectile.damage, {
          knockbackX: projectileFacing * 210,
          knockbackY: -24,
          hitStop: 0.18,
          flash: 0.22,
          score: 30,
          sourceX: enemy.x - projectileFacing * 100,
          useBossDefense: true,
        });
        addSpecialGauge(6);
        addFloatingText(enemy.x, enemy.y - 72, `-${bossDefense.damage}`, "#fff1be");
        if (bossDefense.type === "back") addFloatingText(enemy.x, enemy.y - 108, "BACK HIT!", "#ffc857");
      });
    }

    const offscreen =
      projectile.x < -80 ||
      projectile.x > WORLD.width + 80 ||
      projectile.y < WORLD.floorTop - 90 ||
      projectile.y > WORLD.floorBottom + 90;
    if (offscreen) projectile.active = false;
  });

  state.projectiles = state.projectiles.filter((projectile) => projectile.active);
}

function getDropTypeForEnemy(enemy) {
  if (enemy.type === "slow_puncher" || enemy.type === "knife_thrower" || enemy.type === "gunner") {
    return Math.random() < 0.45 ? "onigiri" : null;
  }
  return null;
}

function dropItemFromEnemy(enemy) {
  const itemType = getDropTypeForEnemy(enemy);
  if (!itemType) return;

  spawnItem(itemType, enemy.x, enemy.y + 8);
}

function getDropTypeForBreakable(breakable) {
  const breakableDef = BREAKABLE_TYPES[breakable.type];
  if (!breakableDef) return null;

  let roll = Math.random();
  for (const drop of breakableDef.drops) {
    if (roll < drop.chance) return drop.type;
    roll -= drop.chance;
  }
  return null;
}

function dropItemFromBreakable(breakable) {
  const itemType = getDropTypeForBreakable(breakable);
  if (!itemType) {
    addFloatingText(breakable.x, breakable.y - 46, "EMPTY", "#b5aa90");
    return;
  }

  spawnItem(itemType, breakable.x, breakable.y + 6);
}

function dropKnifeFromProjectile(projectile) {
  spawnItem("knife", projectile.x, projectile.y + 14);
}

function spawnItem(itemType, x, y) {
  state.items.push({
    type: itemType,
    x,
    y: clamp(y, WORLD.floorTop + 30, WORLD.floorBottom - 24),
    radius: 18,
    age: 0,
    bobSeed: Math.random() * Math.PI * 2,
    active: true,
  });
}

function updateItems(dt) {
  const player = state.player;

  state.items.forEach((item) => {
    item.age += dt;
    if (!item.active || player.hp <= 0) return;

    if (distance(item, player) > item.radius + player.radius) return;

    const itemDef = ITEM_TYPES[item.type];
    if (item.type === "knife") {
      if (player.hasKnife) return;

      item.active = false;
      player.hasKnife = true;
      addFloatingText(player.x, player.y - 78, "KNIFE GET", "#79d7ff");
      return;
    }

    if (item.type === "heart") {
      if (state.lives >= MAX_LIVES) return;

      item.active = false;
      state.lives += 1;
      addFloatingText(player.x, player.y - 78, "LIFE +1", "#ff7cab");
      return;
    }

    const beforeHp = player.hp;
    player.hp = Math.min(player.maxHp, player.hp + itemDef.heal);
    item.active = false;

    const healed = player.hp - beforeHp;
    addFloatingText(player.x, player.y - 78, healed > 0 ? `+${healed} HP` : "FULL", "#77df74");
  });

  state.items = state.items.filter((item) => item.active);
}

function updateBreakables(dt) {
  state.breakables.forEach((breakable) => {
    breakable.hitFlash = Math.max(0, breakable.hitFlash - dt);
    breakable.wobbleTimer = Math.max(0, breakable.wobbleTimer - dt);
  });
}

function nudgeEnemyFromSideEdges(enemy, dt, strength = 1) {
  if (enemy.x < ENEMY_EDGE_CONTROL.leftComfortX) {
    enemy.x += ENEMY_EDGE_CONTROL.nudgeSpeed * strength * dt;
  } else if (enemy.x > ENEMY_EDGE_CONTROL.rightComfortX) {
    enemy.x -= ENEMY_EDGE_CONTROL.nudgeSpeed * strength * dt;
  }

  enemy.x = clamp(enemy.x, 45, WORLD.width - 45);
  enemy.y = clamp(enemy.y, WORLD.floorTop + 32, WORLD.floorBottom - 30);
}

function applyEnemyKnockback(enemy, dt, clampToStage = true) {
  enemy.x += enemy.knockbackX * dt;
  enemy.y += enemy.knockbackY * dt;
  enemy.knockbackX *= Math.pow(0.001, dt);
  enemy.knockbackY *= Math.pow(0.001, dt);
  if (clampToStage) {
    enemy.x = clamp(enemy.x, 45, WORLD.width - 45);
    enemy.y = clamp(enemy.y, WORLD.floorTop + 32, WORLD.floorBottom - 30);
  } else {
    enemy.y = clamp(enemy.y, WORLD.floorTop + 32, WORLD.floorBottom - 30);
  }
}

function updateEnemyEntrance(enemy, dt) {
  const target = { x: enemy.entryX, y: enemy.entryY };
  if (enemy.entryMode === "drop") {
    enemy.x = target.x;
    enemy.y += 235 * dt;
    enemy.facing = state.player.x > enemy.x ? 1 : -1;

    if (enemy.y >= target.y) {
      enemy.y = target.y;
      enemy.entering = false;
      enemy.attackCooldown = 0.85 + Math.random() * 0.75;
    }
    return;
  }

  const toTarget = normalize(target.x - enemy.x, target.y - enemy.y);
  const entrySpeed = 135;
  enemy.x += toTarget.x * entrySpeed * dt;
  enemy.y += toTarget.y * entrySpeed * dt;
  enemy.facing = target.x - enemy.x > 0 ? 1 : -1;

  if (Math.abs(target.x - enemy.x) < 6 && Math.abs(target.y - enemy.y) < 6) {
    enemy.x = target.x;
    enemy.y = target.y;
    enemy.entering = false;
    enemy.attackCooldown = 0.85 + Math.random() * 0.75;
  }
}

function getEnemyAttackBox(enemy) {
  if (isBossEnemy(enemy)) return getBossAttackBox(enemy);

  return {
    x: enemy.x + enemy.facing * 42,
    y: enemy.y - 4,
    width: 68,
    height: 52,
  };
}

function getBossAttackBox(enemy) {
  if (enemy.attackType === "charge") {
    return {
      x: enemy.x + enemy.facing * 66,
      y: enemy.y - 4,
      width: 122,
      height: 68,
    };
  }

  return {
    x: enemy.x + enemy.facing * 60,
    y: enemy.y - 8,
    width: 108,
    height: 72,
  };
}

function getBikeHitBox(enemy) {
  return {
    x: enemy.x,
    y: enemy.y - 3,
    width: 92,
    height: 54,
  };
}

function circleIntersectsRect(circle, rect) {
  const closestX = clamp(circle.x, rect.x - rect.width / 2, rect.x + rect.width / 2);
  const closestY = clamp(circle.y, rect.y - rect.height / 2, rect.y + rect.height / 2);
  return Math.hypot(circle.x - closestX, circle.y - closestY) <= circle.radius;
}

function applyEnemyAttack(enemy, player) {
  if (enemy.hasDamagedThisSwing || player.invincibleTimer > 0) return;
  if (player.isJumping) return;
  if (!circleIntersectsRect(player, getEnemyAttackBox(enemy))) return;

  enemy.hasDamagedThisSwing = true;
  player.hp = Math.max(0, player.hp - enemy.damage);
  addSpecialGauge(10);
  setPlayerInvincibleAfterDamage(0.55);
  addFloatingText(player.x, player.y - 62, `-${enemy.damage}`, "#ff6b5a");
  if (player.hp <= 0) showPlayerDefeatMessage();
}

function damageEnemy(enemy, damage, options = {}) {
  if (enemy.hp <= 0) return { damage: 0, type: "normal" };

  const hasBossArmor = isBossEnemy(enemy) && (enemy.attackWindup > 0 || enemy.attackActive > 0 || enemy.guardTimer > 0);
  const knockbackScale = isBossEnemy(enemy) ? 0.35 : 1;
  const bossDefense = getBossDefenseResult(enemy, damage, options);
  enemy.hp -= bossDefense.damage;
  enemy.hitFlash = options.flash ?? 0.18;
  enemy.hitStopTimer = hasBossArmor ? Math.min(options.hitStop ?? 0.18, 0.05) : options.hitStop ?? 0.18;
  if (!hasBossArmor) {
    enemy.attackWindup = 0;
    enemy.attackActive = 0;
    enemy.hasDamagedThisSwing = false;
  }
  enemy.knockbackX = (options.knockbackX ?? 0) * knockbackScale;
  enemy.knockbackY = (options.knockbackY ?? 0) * knockbackScale;
  state.score += options.score ?? 25;
  maybeStartBossGuardReaction(enemy, bossDefense);
  return bossDefense;
}

function getBossDefenseResult(enemy, damage, options = {}) {
  if (!options.useBossDefense || !isBossEnemy(enemy) || typeof options.sourceX !== "number") {
    return { damage, type: "normal" };
  }

  const sideFromBoss = Math.sign(options.sourceX - enemy.x);
  if (sideFromBoss === 0) return { damage, type: "normal" };

  const isFrontHit = sideFromBoss === enemy.facing;
  if (enemy.guardTimer <= 0) {
    return { damage, type: "normal", hitFromFront: isFrontHit };
  }

  const scale = isFrontHit ? MID_BOSS_ENEMY.frontGuardDamageScale : MID_BOSS_ENEMY.backWeakDamageScale;
  return {
    damage: Math.max(1, Math.round(damage * scale)),
    type: isFrontHit ? "guard" : "back",
    hitFromFront: isFrontHit,
  };
}

function maybeStartBossGuardReaction(enemy, bossDefense) {
  if (!getCurrentDifficulty().bossFrontGuardReaction) return;
  if (!bossDefense.hitFromFront || enemy.hp <= 0) return;
  if (enemy.guardTimer > 0 || enemy.attackWindup > 0 || enemy.attackActive > 0) return;

  startMidBossGuard(enemy);
}

function updateAttacks(dt) {
  state.attacks.forEach((attack) => {
    attack.age += dt;
    const isRadialAttack = attack.type === "special";
    const hitLeft = isRadialAttack ? attack.x - attack.radius : attack.x - attack.width / 2;
    const hitRight = isRadialAttack ? attack.x + attack.radius : attack.x + attack.width / 2;
    const hitTop = isRadialAttack ? attack.y - attack.radius : attack.y - attack.height / 2;
    const hitBottom = isRadialAttack ? attack.y + attack.radius : attack.y + attack.height / 2;

    state.projectiles.forEach((projectile) => {
      if (!projectile.active || projectile.type !== "enemy_knife") return;
      const isIntercepted =
        projectile.x + projectile.radius > hitLeft &&
        projectile.x - projectile.radius < hitRight &&
        projectile.y + projectile.radius > hitTop &&
        projectile.y - projectile.radius < hitBottom;

      if (!isIntercepted) return;
      projectile.active = false;
      dropKnifeFromProjectile(projectile);
      addFloatingText(projectile.x, projectile.y - 18, "CLANG!", "#79d7ff");
    });

    if (!isRadialAttack) {
      state.breakables.forEach((breakable) => {
        if (!breakable.active || attack.hasHit.has(breakable)) return;
        const isHit =
          breakable.x + breakable.width / 2 > hitLeft &&
          breakable.x - breakable.width / 2 < hitRight &&
          breakable.y + breakable.height / 2 > hitTop &&
          breakable.y - breakable.height / 2 < hitBottom;

        if (!isHit) return;
        attack.hasHit.add(breakable);
        breakable.hp -= attack.damage;
        breakable.hitFlash = 0.16;
        breakable.wobbleTimer = 0.18;
        state.score += 10;
        addFloatingText(breakable.x, breakable.y - breakable.height / 2 - 20, `-${attack.damage}`, "#fff1be");
      });
    }

    state.enemies.forEach((enemy) => {
      if (attack.hasHit.has(enemy)) return;
      const isHit = isRadialAttack
        ? distance(enemy, attack) <= attack.radius + enemy.radius * 0.65
        : enemy.x + enemy.radius > hitLeft &&
          enemy.x - enemy.radius < hitRight &&
          enemy.y + enemy.radius > hitTop &&
          enemy.y - enemy.radius < hitBottom;

      if (!isHit) return;
      attack.hasHit.add(enemy);
      const isFinisher = attack.comboStep === 3 || attack.comboStep === "K" || attack.type === "special";
      const knockbackDirection = isRadialAttack ? Math.sign(enemy.x - attack.x) || state.player.facing : attack.facing;
      const bossDefense = damageEnemy(enemy, attack.damage, {
        knockbackX: knockbackDirection * attack.knockback * (isRadialAttack ? 4.5 : 5.5),
        knockbackY: isFinisher ? -40 : 0,
        hitStop: attack.hitStop,
        flash: isFinisher ? 0.28 : 0.18,
        score: isRadialAttack ? 35 : 25,
        sourceX: attack.x - attack.facing * Math.max(attack.reach ?? 0, 60),
        useBossDefense: !isRadialAttack,
      });
      addSpecialGauge(isRadialAttack ? 0 : isFinisher ? 7 : 4);
      addFloatingText(enemy.x, enemy.y - 70, `-${bossDefense.damage}`, "#fff1be");
      if (bossDefense.type === "back") addFloatingText(enemy.x, enemy.y - 106, "BACK HIT!", "#ffc857");
      if (isFinisher && !isRadialAttack) {
        addFloatingText(enemy.x, enemy.y - 116, attack.comboStep === "K" ? "JUMP KICK!" : "KNOCK!", "#79d7ff");
      }
    });
  });

  state.attacks = state.attacks.filter((attack) => attack.age < attack.duration);

  const newlyDefeatedEnemies = state.enemies.filter((enemy) => enemy.hp <= 0 && !enemy.defeatHandled);
  if (newlyDefeatedEnemies.length > 0) {
    state.score += newlyDefeatedEnemies.length * 250;
    newlyDefeatedEnemies.forEach((enemy) => {
      enemy.defeatHandled = true;
      enemy.koTimer = ENEMY_KO_DISPLAY_TIME;
      enemy.attackWindup = 0;
      enemy.attackActive = 0;
      enemy.shotWindup = 0;
      enemy.throwWindup = 0;
      enemy.hitFlash = 0;
      dropItemFromEnemy(enemy);
    });
  }
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0 || (enemy.koTimer ?? 0) > 0);

  const brokenBreakables = state.breakables.filter((breakable) => breakable.hp <= 0);
  if (brokenBreakables.length > 0) {
    state.score += brokenBreakables.length * 80;
    brokenBreakables.forEach((breakable) => {
      addFloatingText(breakable.x, breakable.y - breakable.height / 2 - 38, "BREAK!", "#ffc857");
      dropItemFromBreakable(breakable);
    });
    state.breakables = state.breakables.filter((breakable) => breakable.hp > 0);
  }

  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.type !== "bike_rusher") return true;
    const hasExitedLeft = enemy.facing < 0 && enemy.x < -130;
    const hasExitedRight = enemy.facing > 0 && enemy.x > WORLD.width + 130;
    return (enemy.hp > 0 || (enemy.koTimer ?? 0) > 0) && !hasExitedLeft && !hasExitedRight;
  });

  maybeAdvanceWave();
}

function maybeAdvanceWave() {
  const regularEnemiesRemaining = state.enemies.some((enemy) => enemy.type !== "bike_rusher");
  if (regularEnemiesRemaining) return;

  if (state.exitGateOpen) return;
  state.exitGateOpen = true;
  state.bikeSpawnTimer = null;
  state.bikeSpawnsRemaining = 0;
}

function enterNextArea() {
  state.area += 1;
  state.wave = state.area;
  state.areaTransitionTimer = 0.58;
  state.player.x = 92;
  state.player.y = clamp(state.player.y, WORLD.floorTop + 44, WORLD.floorBottom - 42);
  state.player.facing = 1;
  state.player.comboStep = 0;
  state.player.comboTimer = 0;
  state.player.attackCooldown = 0;
  state.attacks = [];
  state.projectiles = [];
  state.items = [];
  state.enemies = [];
  spawnWave(false);
}

function update(dt) {
  if (!state.gameStarted) {
    updateHud();
    return;
  }

  if (state.continueActive) {
    updateContinue(dt);
    updateFloatingTexts(dt);
    updateHud();
    return;
  }

  state.areaTransitionTimer = Math.max(0, state.areaTransitionTimer - dt);
  state.superFlashTimer = Math.max(0, state.superFlashTimer - dt);
  state.screenShakeTimer = Math.max(0, state.screenShakeTimer - dt);
  state.majorBossIntroTimer = Math.max(0, state.majorBossIntroTimer - dt);
  updateActionHold(dt);
  updatePlayer(dt);
  updateBikeSpawner(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateAttacks(dt);
  updateAreaProgression();
  updateBreakables(dt);
  updateItems(dt);
  updateFloatingTexts(dt);
  updateHud();
}

function updateFloatingTexts(dt) {
  state.floatingTexts.forEach((text) => {
    text.age += dt;
  });
  state.floatingTexts = state.floatingTexts.filter((text) => text.age < text.duration);
}

function updateHud() {
  const hpRatio = state.player.hp / state.player.maxHp;
  hpBar.style.width = `${hpRatio * 100}%`;
  hpBar.style.background =
    hpRatio <= 0.3
      ? "linear-gradient(90deg, var(--hp-danger), #ffb14a)"
      : "linear-gradient(90deg, var(--hp), #d7ff77)";
  hpText.textContent = `HP ${state.player.hp}/${state.player.maxHp}`;
  lifeText.textContent = `LIFE ${state.lives}`;
  const specialRatio = state.player.specialGauge / SPECIAL_GAUGE.max;
  specialBar.style.width = `${specialRatio * 100}%`;
  specialText.textContent = `${Math.floor(state.player.specialGauge)}%`;
  specialButton.classList.toggle("is-ready", state.player.specialGauge >= SPECIAL_GAUGE.max);
  scoreText.textContent = String(state.score);
}

function getAreaTheme() {
  return AREA_THEMES[(state.area - 1) % AREA_THEMES.length];
}

function drawBackground() {
  const viewW = canvas.clientWidth;
  const viewH = canvas.clientHeight;
  const scaleX = viewW / WORLD.width;
  const scaleY = viewH / WORLD.height;
  const theme = getAreaTheme();

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);

  const gradient = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
  gradient.addColorStop(0, theme.sky);
  gradient.addColorStop(0.52, theme.floor);
  gradient.addColorStop(1, theme.edge);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = theme.topShade;
  ctx.fillRect(0, 0, WORLD.width, WORLD.floorTop);

  ctx.fillStyle = theme.lane;
  for (let y = WORLD.floorTop; y <= WORLD.floorBottom; y += 38) {
    ctx.fillRect(0, y, WORLD.width, 2);
  }

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.floorTop);
  ctx.lineTo(WORLD.width, WORLD.floorTop);
  ctx.moveTo(0, WORLD.floorBottom);
  ctx.lineTo(WORLD.width, WORLD.floorBottom);
  ctx.stroke();

  ctx.restore();
}

function drawExitGate(scaleX, scaleY) {
  if (!state.exitGateOpen) return;

  const pulse = 0.58 + Math.sin(performance.now() / 130) * 0.22;
  const blink = performance.now() % 760 < 430;
  const textAlpha = blink ? 1 : 0.22;
  const gateX = WORLD.width - 42;
  const gateTop = WORLD.floorTop + 18;
  const gateHeight = WORLD.floorBottom - WORLD.floorTop - 36;

  ctx.save();
  ctx.translate(gateX * scaleX, gateTop * scaleY);
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = `rgba(121, 215, 255, ${0.16 + pulse * 0.14})`;
  ctx.fillRect(-18, 0, 36, gateHeight);

  ctx.strokeStyle = `rgba(121, 215, 255, ${0.5 + pulse * 0.38})`;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.strokeRect(-18, 0, 36, gateHeight);

  ctx.setLineDash([]);
  ctx.globalAlpha = textAlpha;
  ctx.fillStyle = "#79d7ff";
  ctx.font = "900 26px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
  ctx.strokeText("GO!", -58, gateHeight / 2 - 16);
  ctx.fillText("GO!", -58, gateHeight / 2 - 16);

  ctx.beginPath();
  ctx.moveTo(-58, gateHeight / 2 + 10);
  ctx.lineTo(-22, gateHeight / 2 + 10);
  ctx.lineTo(-35, gateHeight / 2 - 2);
  ctx.moveTo(-22, gateHeight / 2 + 10);
  ctx.lineTo(-35, gateHeight / 2 + 22);
  ctx.strokeStyle = "#79d7ff";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawAreaBadge(scaleX, scaleY) {
  ctx.save();
  ctx.translate(26 * scaleX, 24 * scaleY);
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.strokeStyle = getAreaTheme().border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(0, 0, 116, 34, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(246, 240, 223, 0.72)";
  ctx.font = "900 12px Trebuchet MS, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("AREA", 14, 15);

  ctx.fillStyle = "#ffc857";
  ctx.font = "900 20px Trebuchet MS, sans-serif";
  ctx.fillText(String(state.area), 62, 23);

  ctx.restore();
}

function drawAreaTransition(scaleX, scaleY) {
  if (state.areaTransitionTimer <= 0) return;

  const progress = 1 - state.areaTransitionTimer / 0.58;
  const fade = Math.sin(progress * Math.PI);
  const sweepX = WORLD.width * progress;

  ctx.save();
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = `rgba(0, 0, 0, ${0.18 * fade})`;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = `rgba(121, 215, 255, ${0.14 * fade})`;
  ctx.fillRect(sweepX - 180, 0, 180, WORLD.height);

  ctx.strokeStyle = `rgba(121, 215, 255, ${0.55 * fade})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(sweepX, WORLD.floorTop);
  ctx.lineTo(sweepX, WORLD.floorBottom);
  ctx.stroke();

  ctx.restore();
}

function drawSuperFlash(scaleX, scaleY) {
  if (state.superFlashTimer <= 0) return;

  const t = state.superFlashTimer / 0.42;
  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = `rgba(255, 200, 87, ${0.28 * t})`;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = `rgba(121, 215, 255, ${0.7 * t})`;
  ctx.lineWidth = 7;
  for (let x = -120; x < WORLD.width + 180; x += 155) {
    ctx.beginPath();
    ctx.moveTo(x, WORLD.floorBottom + 20);
    ctx.lineTo(x + 190, WORLD.floorTop - 40);
    ctx.stroke();
  }
  ctx.restore();
}

function getScreenShakeOffset(scaleX, scaleY) {
  if (state.screenShakeTimer <= 0) return { x: 0, y: 0 };

  const t = state.screenShakeTimer / 0.58;
  const strength = 7 * t;
  return {
    x: Math.sin(state.screenShakeTimer * 92) * strength * scaleX,
    y: Math.cos(state.screenShakeTimer * 77) * strength * 0.55 * scaleY,
  };
}

function drawMajorBossIntro(scaleX, scaleY) {
  if (state.majorBossIntroTimer <= 0) return;

  const progress = 1 - state.majorBossIntroTimer / 1.25;
  const fade = Math.sin(progress * Math.PI);
  ctx.save();
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * fade})`;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = `rgba(255, 95, 79, ${0.48 * fade})`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(180, WORLD.floorTop + 8);
  ctx.lineTo(WORLD.width - 180, WORLD.floorTop + 8);
  ctx.moveTo(180, WORLD.floorBottom - 8);
  ctx.lineTo(WORLD.width - 180, WORLD.floorBottom - 8);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 200, 87, ${0.95 * fade})`;
  ctx.font = "900 40px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MAJOR BOSS", WORLD.width / 2, 132);

  ctx.fillStyle = `rgba(246, 240, 223, ${0.78 * fade})`;
  ctx.font = "900 16px Trebuchet MS, sans-serif";
  ctx.fillText("STAY SHARP", WORLD.width / 2, 158);
  ctx.restore();
}

function drawShadow(entity, scaleX, scaleY) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(entity.x * scaleX, (entity.y + entity.radius * 0.72) * scaleY, entity.radius * 1.15 * scaleX, 9 * scaleY, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(scaleX, scaleY) {
  const player = state.player;
  const jumpHeight = getPlayerJumpHeight(player);
  drawShadow(player, scaleX, scaleY);

  if (drawPlayerSprite(player, jumpHeight, scaleX, scaleY)) return;

  drawFallbackPlayer(player, jumpHeight, scaleX, scaleY);
}

function drawPlayerSprite(player, jumpHeight, scaleX, scaleY) {
  const character = getCurrentPlayerCharacter();
  const sprites = playerSprites[currentPlayerCharacterKey] ?? playerSprites.petiman;
  const spriteKey = getPlayerSpriteKey(player);
  const sprite = sprites[spriteKey] ?? sprites.idle;
  if (!sprite?.loaded || sprite.failed) return false;

  const image = sprite.image;
  const spriteHeight = character.spriteHeights?.[spriteKey] ?? character.spriteHeight;
  const spriteWidth = spriteHeight * (image.naturalWidth / image.naturalHeight);

  ctx.save();
  ctx.translate(player.x * scaleX, (player.y - jumpHeight) * scaleY);
  ctx.scale(scaleX * player.facing, scaleY);
  ctx.globalAlpha = player.invincibleTimer > 0 ? 0.65 : 1;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, -spriteWidth / 2, -spriteHeight + character.footOffsetY, spriteWidth, spriteHeight);
  drawPlayerSpriteOverlays(player);
  ctx.restore();
  return true;
}

function getPlayerSpriteKey(player) {
  if (player.hp <= 0) return "ko";
  if (player.damageSpriteTimer > 0) return "damage";
  if (player.isJumping && player.jumpKickUsed) return "jumpKick";
  if (isPlayerComboFinisherActive()) return "lariat";
  if (isPlayerAttackActive()) return "punch";
  if (!player.isJumping && Math.hypot(input.moveX, input.moveY) > 0.08) {
    return Math.floor(performance.now() / 140) % 2 === 0 ? "run1" : "run2";
  }
  return "idle";
}

function isPlayerAttackActive() {
  return state.attacks.some((attack) => attack.comboStep && attack.comboStep !== "K" && attack.age < attack.duration);
}

function isPlayerComboFinisherActive() {
  return state.attacks.some((attack) => attack.comboStep === 3 && attack.age < attack.duration);
}

function drawPlayerSpriteOverlays(player) {
  if (player.isJumping) {
    ctx.strokeStyle = "rgba(121, 215, 255, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 4, 34, 0.2 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
  }

  if (!player.hasKnife) return;

  ctx.fillStyle = "#d8e2ea";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.58)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, -22);
  ctx.lineTo(54, -27);
  ctx.lineTo(36, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#72513d";
  ctx.fillRect(25, -22, 10, 7);
}

function drawFallbackPlayer(player, jumpHeight, scaleX, scaleY) {
  ctx.save();
  ctx.translate(player.x * scaleX, (player.y - jumpHeight) * scaleY);
  ctx.scale(scaleX * player.facing, scaleY);
  ctx.globalAlpha = player.invincibleTimer > 0 ? 0.65 : 1;

  ctx.fillStyle = "#79d7ff";
  ctx.beginPath();
  ctx.roundRect(-22, -34, 44, 58, 13);
  ctx.fill();

  ctx.fillStyle = "#f6f0df";
  ctx.beginPath();
  ctx.arc(0, -44, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#12303b";
  ctx.fillRect(6, -48, 6, 5);

  ctx.strokeStyle = player.isJumping && player.jumpKickUsed ? "#e9f9ff" : "#08222e";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (player.isJumping && player.jumpKickUsed) {
    ctx.moveTo(12, -8);
    ctx.lineTo(48, -18);
  } else {
    ctx.moveTo(18, -14);
    ctx.lineTo(34, -12);
  }
  ctx.stroke();

  if (player.isJumping) {
    ctx.strokeStyle = "rgba(121, 215, 255, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 4, 34, 0.2 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
  }

  if (player.hasKnife) {
    ctx.fillStyle = "#d8e2ea";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.58)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, -22);
    ctx.lineTo(54, -27);
    ctx.lineTo(36, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#72513d";
    ctx.fillRect(25, -22, 10, 7);
  }
  ctx.restore();
}

function drawEnemies(scaleX, scaleY) {
  state.enemies.forEach((enemy) => {
    if (enemy.type === "bike_rusher") {
      drawBikeEnemy(enemy, scaleX, scaleY);
      return;
    }

    if (isBossEnemy(enemy)) {
      drawMidBossEnemy(enemy, scaleX, scaleY);
      return;
    }

    if (drawEnemySprite(enemy, scaleX, scaleY)) {
      return;
    }

    if (enemy.type === "knife_thrower") {
      drawKnifeEnemy(enemy, scaleX, scaleY);
      return;
    }

    if (enemy.type === "gunner") {
      drawGunnerEnemy(enemy, scaleX, scaleY);
      return;
    }

    drawShadow(enemy, scaleX, scaleY);
    ctx.save();
    ctx.translate(enemy.x * scaleX, enemy.y * scaleY);
    ctx.scale(scaleX * enemy.facing, scaleY);

    ctx.fillStyle = enemy.hitFlash > 0 ? "#fff1be" : "#ff8068";
    ctx.beginPath();
    ctx.roundRect(-23, -32, 46, 56, 12);
    ctx.fill();

    ctx.fillStyle = "#3a1210";
    ctx.beginPath();
    ctx.arc(0, -42, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f6f0df";
    ctx.fillRect(4, -45, 5, 4);
    ctx.fillRect(-8, -45, 5, 4);

    if (enemy.attackWindup > 0 || enemy.attackActive > 0) {
      ctx.strokeStyle = enemy.attackActive > 0 ? "rgba(255, 238, 160, 0.95)" : "rgba(255, 255, 255, 0.46)";
      ctx.lineWidth = enemy.attackActive > 0 ? 7 : 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(18, -14);
      ctx.lineTo(43, -12);
      ctx.stroke();
    }

    if (enemy.entering && enemy.entryMode === "drop") {
      ctx.strokeStyle = "rgba(255, 232, 180, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-20, -74);
      ctx.lineTo(20, -74);
      ctx.stroke();
    }

    const hpWidth = 58;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
    ctx.fillRect(-hpWidth / 2, -72, hpWidth, 7);
    ctx.fillStyle = "#ffcf5a";
    ctx.fillRect(-hpWidth / 2, -72, hpWidth * hpRatio, 7);

    ctx.restore();

    if (enemy.attackActive > 0) {
      drawEnemyAttackBox(enemy, scaleX, scaleY);
    }
  });
}

function drawEnemySprite(enemy, scaleX, scaleY, options = {}) {
  updateEnemyVisualMovement(enemy);
  const spriteDefKey = getEnemySpriteDefKey(enemy);
  const enemyDef = ENEMY_SPRITE_DEFS[spriteDefKey];
  const sprites = enemySprites[spriteDefKey];
  if (!enemyDef || !sprites) return false;

  const drawHpBar = options.drawHpBar ?? true;
  const yOffset = options.yOffset ?? 0;
  const visualScale = options.visualScale ?? 1;
  const spriteKey = getEnemySpriteKey(enemy);
  const sprite = sprites[spriteKey] ?? sprites.idle;
  if (!sprite?.loaded || sprite.failed) return false;

  drawShadow(enemy, scaleX, scaleY);
  const image = sprite.image;
  const spriteHeight = spriteKey === "ko"
    ? enemyDef.koSpriteHeight ?? enemyDef.spriteHeight
    : enemyDef.spriteHeights?.[spriteKey] ?? enemyDef.spriteHeight;
  const source = getSpriteVisibleBounds(sprite);
  const spriteWidth = spriteHeight * (source.width / source.height);
  const walkTransform = getEnemyWalkTransform(enemy, spriteKey);
  const windmillTransform = getEnemyWindmillTransform(enemy, spriteKey);

  ctx.save();
  ctx.translate(enemy.x * scaleX, (enemy.y + yOffset) * scaleY);
  ctx.scale(scaleX * enemy.facing * visualScale, scaleY * visualScale);
  if (walkTransform) {
    ctx.translate(walkTransform.sway, walkTransform.bob);
    ctx.rotate(walkTransform.tilt);
    ctx.scale(walkTransform.scaleX, walkTransform.scaleY);
  }
  if (windmillTransform) {
    ctx.translate(windmillTransform.slide, 0);
    ctx.rotate(windmillTransform.rotate);
    ctx.scale(windmillTransform.flip * windmillTransform.scaleX, windmillTransform.scaleY);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    -spriteWidth / 2,
    -spriteHeight + enemyDef.footOffsetY,
    spriteWidth,
    spriteHeight,
  );

  if (enemy.entering && enemy.entryMode === "drop") {
    ctx.strokeStyle = "rgba(255, 232, 180, 0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, -74);
    ctx.lineTo(20, -74);
    ctx.stroke();
  }

  if (drawHpBar) {
    const hpWidth = 58;
    const hpY = 22;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
    ctx.fillRect(-hpWidth / 2, hpY, hpWidth, 7);
    ctx.fillStyle = "#ffcf5a";
    ctx.fillRect(-hpWidth / 2, hpY, hpWidth * hpRatio, 7);
  }
  ctx.restore();
  enemy.visualLastX = enemy.x;
  enemy.visualLastY = enemy.y;
  return true;
}

function updateEnemyVisualMovement(enemy) {
  if (enemy.visualLastX === undefined || enemy.visualLastY === undefined) {
    enemy.isVisuallyMoving = false;
    return;
  }
  enemy.isVisuallyMoving = Math.hypot(enemy.x - enemy.visualLastX, enemy.y - enemy.visualLastY) > 0.12;
}

function getEnemyWalkTransform(enemy, spriteKey) {
  const spriteDefKey = getEnemySpriteDefKey(enemy);
  if (spriteDefKey !== "mid_boss_charge" && spriteDefKey !== "mid_boss_shock") return null;
  if (spriteKey !== "move") return null;

  const settings = MID_BOSS_CHARGE_WALK_TRANSFORM;
  const phase = (performance.now() / 1000) * Math.PI * 2 * settings.speed;
  const stretch = 1 + Math.cos(phase * 2) * settings.squash;
  const squash = 1 - Math.cos(phase * 2) * settings.squash * 0.55;
  return {
    bob: Math.sin(phase) * settings.bob,
    sway: Math.sin(phase) * settings.sway,
    tilt: (Math.sin(phase) * settings.tilt * Math.PI) / 180,
    scaleX: squash,
    scaleY: stretch,
  };
}

function getEnemyWindmillTransform(enemy, spriteKey) {
  if (getEnemySpriteDefKey(enemy) !== "mid_boss_shock") return null;
  if (spriteKey !== "shock") return null;

  const settings = MID_BOSS_SHOCK_WINDMILL;
  const frame = Math.floor(performance.now() / settings.frameMs) % 4;
  const frames = [
    { rotate: -settings.spin, slide: -settings.slide, scaleX: 1 + settings.squash, scaleY: 1 - settings.squash * 0.55, flip: 1 },
    { rotate: 0, slide: 0, scaleX: 1, scaleY: 1 + settings.squash, flip: -1 },
    { rotate: settings.spin, slide: settings.slide, scaleX: 1 + settings.squash, scaleY: 1 - settings.squash * 0.55, flip: 1 },
    { rotate: 0, slide: 0, scaleX: 1 - settings.squash * 0.45, scaleY: 1 + settings.squash * 0.7, flip: -1 },
  ];
  const transform = frames[frame];
  return {
    ...transform,
    rotate: (transform.rotate * Math.PI) / 180,
  };
}

function getSpriteVisibleBounds(sprite) {
  if (sprite.visibleBounds) return sprite.visibleBounds;

  const image = sprite.image;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  sprite.visibleBounds =
    maxX < 0
      ? { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight }
      : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  return sprite.visibleBounds;
}

function getEnemySpriteDefKey(enemy) {
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "charge") return "mid_boss_charge";
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "shock") return "mid_boss_shock";
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "jump") return "mid_boss_jump";
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "knife") return "mid_boss_knife";
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "summon") return "mid_boss_summon";
  return enemy.type;
}

function getEnemySpriteKey(enemy) {
  if (enemy.hp <= 0) return "ko";
  if (enemy.type === "bike_rusher") return enemy.warningTimer > 0 ? "idle" : "move";
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "charge") {
    if (enemy.guardTimer > 0) return "guard";
    if (enemy.hitFlash > 0) return "damage";
    if (enemy.attackType === "charge" && enemy.attackActive > 0) return "charge";
    if (enemy.attackType === "charge" && enemy.attackWindup > 0) return "chargeWindup";
    if (enemy.attackWindup > 0) return "attack1";
    if (enemy.attackActive > 0) return "attack2";
    if (enemy.isVisuallyMoving || enemy.entering) return "move";
  }
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "shock") {
    if (enemy.guardTimer > 0) return "guard";
    if (enemy.hitFlash > 0) return "damage";
    if (enemy.attackType === "shock" && enemy.attackActive > 0) return "shock";
    if (enemy.attackWindup > 0) return "windup";
    if (enemy.attackActive > 0) return "attack";
    if (enemy.isVisuallyMoving || enemy.entering) return "move";
  }
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "jump") {
    if (enemy.guardTimer > 0) return "guard";
    if (enemy.hitFlash > 0) return "damage";
    if (enemy.attackType === "jump" && enemy.attackActive > 0) return "press";
    if (enemy.attackType === "jump" && enemy.attackWindup > 0) return "charge";
    if (enemy.attackWindup > 0) return "charge";
    if (enemy.attackActive > 0) return "attack";
    if (enemy.isVisuallyMoving || enemy.entering) return "move";
  }
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "knife") {
    if (enemy.guardTimer > 0) return "guard";
    if (enemy.hitFlash > 0) return "damage";
    if (enemy.attackType === "knife" && enemy.attackActive > 0) return "throw";
    if (enemy.attackWindup > 0) return "charge";
    if (enemy.attackActive > 0) return "attack";
    if (enemy.isVisuallyMoving || enemy.entering) return "move";
  }
  if (enemy.type === "mid_boss_brawler" && enemy.bossVariant === "summon") {
    if (enemy.guardTimer > 0) return "guard";
    if (enemy.hitFlash > 0) return "damage";
    if (enemy.attackType === "summon" && (enemy.attackWindup > 0 || enemy.attackActive > 0)) return "call";
    if (enemy.attackActive > 0) return "attack";
    if (enemy.isVisuallyMoving || enemy.entering) return "move";
  }
  if (enemy.hitFlash > 0) return "damage";
  if (enemy.attackWindup > 0 || enemy.attackActive > 0 || enemy.throwWindup > 0 || enemy.shotWindup > 0) return "attack";
  if (
    enemy.entering ||
    enemy.repositioning ||
    Math.abs(enemy.knockbackX) > 2 ||
    Math.abs(enemy.knockbackY) > 2
  ) {
    return "move";
  }
  return "idle";
}

function drawGunnerEnemy(enemy, scaleX, scaleY) {
  drawShadow(enemy, scaleX, scaleY);
  ctx.save();
  ctx.translate(enemy.x * scaleX, enemy.y * scaleY);
  ctx.scale(scaleX * enemy.facing, scaleY);

  ctx.fillStyle = enemy.hitFlash > 0 ? "#fff1be" : "#7b8ea8";
  ctx.beginPath();
  ctx.roundRect(-22, -32, 44, 56, 12);
  ctx.fill();

  ctx.fillStyle = "#151a24";
  ctx.beginPath();
  ctx.arc(0, -42, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f6f0df";
  ctx.fillRect(4, -45, 5, 4);
  ctx.fillRect(-8, -45, 5, 4);

  ctx.strokeStyle = enemy.shotWindup > 0 ? "#ffc857" : "#222831";
  ctx.lineWidth = enemy.shotWindup > 0 ? 7 : 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.lineTo(54, -20);
  ctx.stroke();

  ctx.fillStyle = "#0d1117";
  ctx.fillRect(48, -24, 18, 8);

  const hpWidth = 58;
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
  ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
  ctx.fillRect(-hpWidth / 2, -58, hpWidth, 7);
  ctx.fillStyle = "#ffcf5a";
  ctx.fillRect(-hpWidth / 2, -58, hpWidth * hpRatio, 7);

  ctx.restore();

  if (enemy.shotWindup > 0) {
    drawEnemyWindupLabel(enemy, "SHOT", "rgba(255, 200, 87, 0.9)", scaleX, scaleY);
  }
}

function drawKnifeEnemy(enemy, scaleX, scaleY) {
  drawShadow(enemy, scaleX, scaleY);
  ctx.save();
  ctx.translate(enemy.x * scaleX, enemy.y * scaleY);
  ctx.scale(scaleX * enemy.facing, scaleY);

  ctx.fillStyle = enemy.hitFlash > 0 ? "#fff1be" : "#d98a4a";
  ctx.beginPath();
  ctx.roundRect(-22, -32, 44, 56, 12);
  ctx.fill();

  ctx.fillStyle = "#23120f";
  ctx.beginPath();
  ctx.arc(0, -42, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f6f0df";
  ctx.fillRect(4, -45, 5, 4);
  ctx.fillRect(-8, -45, 5, 4);

  ctx.strokeStyle = enemy.throwWindup > 0 ? "#e9f9ff" : "#5a261c";
  ctx.lineWidth = enemy.throwWindup > 0 ? 6 : 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(16, -16);
  ctx.lineTo(42, -28);
  ctx.stroke();

  ctx.fillStyle = "#cbd6df";
  ctx.beginPath();
  ctx.moveTo(45, -31);
  ctx.lineTo(61, -26);
  ctx.lineTo(46, -21);
  ctx.closePath();
  ctx.fill();

  const hpWidth = 58;
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
  ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
  ctx.fillRect(-hpWidth / 2, -58, hpWidth, 7);
  ctx.fillStyle = "#ffcf5a";
  ctx.fillRect(-hpWidth / 2, -58, hpWidth * hpRatio, 7);

  ctx.restore();

  if (enemy.throwWindup > 0) {
    drawEnemyWindupLabel(enemy, "THROW", "rgba(121, 215, 255, 0.82)", scaleX, scaleY);
  }
}

function drawEnemyWindupLabel(enemy, label, color, scaleX, scaleY) {
  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = color;
  ctx.font = "900 16px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, enemy.x, enemy.y - 70);
  ctx.restore();
}

function drawBossHud(scaleX, scaleY) {
  const boss = state.enemies.find(isBossEnemy);
  if (!boss) return;

  const hpRatio = Math.max(0, boss.hp / boss.maxHp);
  const isMajorBoss = boss.bossRank === "major";
  const barX = isMajorBoss ? 218 : 260;
  const barY = isMajorBoss ? 30 : 34;
  const barWidth = isMajorBoss ? 524 : 440;
  const fillX = isMajorBoss ? 326 : 338;
  const fillWidth = isMajorBoss ? 382 : 336;
  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = "rgba(4, 6, 5, 0.62)";
  ctx.strokeStyle = isMajorBoss ? "rgba(255, 95, 79, 0.62)" : "rgba(255, 200, 87, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, 34, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isMajorBoss ? "rgba(255, 200, 87, 0.24)" : "rgba(255, 95, 79, 0.28)";
  ctx.fillRect(fillX, barY + 12, fillWidth, 11);
  ctx.fillStyle = isMajorBoss ? "#ffc857" : "#ff5f4f";
  ctx.fillRect(fillX, barY + 12, fillWidth * hpRatio, 11);

  ctx.fillStyle = isMajorBoss ? "#ff8068" : "#ffc857";
  ctx.font = "900 14px Trebuchet MS, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(isMajorBoss ? "BOSS" : "MID BOSS", barX + 22, barY + 23);
  ctx.restore();
}

function drawMidBossEnemy(enemy, scaleX, scaleY) {
  const visualScale = enemy.visualScale ?? 1;
  drawMidBossWarning(enemy, scaleX, scaleY);
  drawBossAura(enemy, scaleX, scaleY);
  if (drawEnemySprite(enemy, scaleX, scaleY, { drawHpBar: false, yOffset: -enemy.visualJumpHeight, visualScale })) {
    return;
  }

  drawShadow(enemy, scaleX, scaleY);
  ctx.save();
  ctx.translate(enemy.x * scaleX, (enemy.y - enemy.visualJumpHeight) * scaleY);
  ctx.scale(scaleX * enemy.facing * visualScale, scaleY * visualScale);

  ctx.fillStyle = enemy.hitFlash > 0 ? "#fff1be" : getMidBossBodyColor(enemy);
  ctx.beginPath();
  ctx.roundRect(-34, -52, 68, 82, 17);
  ctx.fill();

  if (enemy.guardTimer > 0) {
    ctx.fillStyle = "rgba(121, 215, 255, 0.24)";
    ctx.strokeStyle = "#79d7ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(18, -58, 26, 72, 12);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = "#2b1223";
  ctx.beginPath();
  ctx.arc(0, -66, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f6f0df";
  ctx.fillRect(7, -70, 6, 5);
  ctx.fillRect(-13, -70, 6, 5);

  ctx.strokeStyle = enemy.guardTimer > 0 ? "#79d7ff" : enemy.attackActive > 0 ? "#ffc857" : enemy.attackType === "charge" && enemy.attackWindup > 0 ? "#79d7ff" : "#321726";
  ctx.lineWidth = enemy.attackWindup > 0 || enemy.attackActive > 0 ? 10 : 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(enemy.guardTimer > 0 ? 18 : 26, enemy.guardTimer > 0 ? -28 : -22);
  ctx.lineTo(enemy.guardTimer > 0 ? 38 : enemy.attackType === "charge" ? 76 : 64, enemy.guardTimer > 0 ? -2 : enemy.attackType === "charge" ? -12 : -18);
  ctx.stroke();

  if (enemy.attackType === "charge" && enemy.attackActive > 0) {
    ctx.strokeStyle = "rgba(121, 215, 255, 0.58)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-40, 8);
    ctx.lineTo(-68, 14);
    ctx.moveTo(-34, -18);
    ctx.lineTo(-62, -28);
    ctx.stroke();
  }

  ctx.strokeStyle = "#321726";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-18, 26);
  ctx.lineTo(-28, 44);
  ctx.moveTo(18, 26);
  ctx.lineTo(28, 44);
  ctx.stroke();

  if (enemy.entering) {
    ctx.strokeStyle = "rgba(255, 200, 87, 0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-32, -96);
    ctx.lineTo(32, -96);
    ctx.stroke();
  }

  ctx.restore();

}

function drawBossAura(enemy, scaleX, scaleY, style = BOSS_AURA_STYLE) {
  const aura = getBossAuraState(enemy);
  if (!aura) return;

  const time = performance.now() / 1000;
  const visualScale = enemy.visualScale ?? 1;
  const baseY = enemy.y - enemy.visualJumpHeight;
  const auraHeight = BOSS_AURA_SETTINGS.height * visualScale;
  const auraWidth = BOSS_AURA_SETTINGS.width * visualScale;
  const pulse = 0.78 + Math.sin(time * 8.2) * 0.16;
  const x = enemy.x * scaleX;
  const y = baseY * scaleY;
  const width = auraWidth * scaleX;
  const height = auraHeight * scaleY;
  const color = aura.color;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  if (style === "ring") {
    drawBossRingAura(x, y, width, height, color, pulse, time);
  } else if (style === "veil") {
    drawBossVeilAura(x, y, width, height, color, pulse, time);
  } else {
    drawBossFlameAura(x, y, width, height, color, pulse, time, BOSS_AURA_SETTINGS.intensity);
  }
  ctx.restore();
}

function getBossAuraState(enemy) {
  if (enemy.guardTimer > 0) {
    return { color: { r: 121, g: 215, b: 255 } };
  }
  if (enemy.attackWindup > 0 || enemy.attackActive > 0) {
    if (enemy.attackType === "charge" || enemy.attackType === "shock") return { color: { r: 255, g: 95, b: 79 } };
    return { color: { r: 255, g: 200, b: 87 } };
  }
  return null;
}

function auraColor(color, alpha) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function drawBossFlameAura(x, y, width, height, color, pulse, time, intensity = 1) {
  const gradient = ctx.createRadialGradient(x, y - height * 0.35, width * 0.08, x, y - height * 0.36, width * 0.82);
  gradient.addColorStop(0, auraColor(color, Math.min(0.42, 0.16 * intensity) * pulse));
  gradient.addColorStop(0.5, auraColor(color, Math.min(0.28, 0.1 * intensity) * pulse));
  gradient.addColorStop(1, auraColor(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(x, y - height * 0.34, width * 0.7, height * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createLinearGradient(x, y, x, y - height);
  core.addColorStop(0, auraColor(color, Math.min(0.46, 0.24 * intensity) * pulse));
  core.addColorStop(0.26, auraColor({ r: 255, g: 255, b: 245 }, Math.min(0.42, 0.22 * intensity) * pulse));
  core.addColorStop(0.72, auraColor(color, Math.min(0.22, 0.12 * intensity) * pulse));
  core.addColorStop(1, auraColor(color, 0));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.18, y);
  ctx.bezierCurveTo(x - width * 0.34, y - height * 0.24, x - width * 0.1, y - height * 0.48, x - width * 0.04, y - height);
  ctx.bezierCurveTo(x + width * 0.1, y - height * 0.56, x + width * 0.34, y - height * 0.28, x + width * 0.18, y);
  ctx.closePath();
  ctx.fill();

  ctx.lineCap = "round";
  for (let i = 0; i < 15; i += 1) {
    const t = i / 14;
    const side = t - 0.5;
    const bend = Math.sin(time * 4.4 + i * 1.9) * width * 0.1;
    const startX = x + side * width * 0.86;
    const endX = x + side * width * (0.18 + Math.abs(side) * 0.35) + bend;
    const endY = y - height * (0.38 + 0.55 * Math.abs(Math.sin(time * 1.7 + i * 0.73)));
    const alpha = Math.min(0.38, (0.1 + 0.06 * (i % 3)) * intensity) * pulse;
    ctx.strokeStyle = auraColor(i % 4 === 0 ? { r: 255, g: 255, b: 245 } : color, alpha);
    ctx.lineWidth = (3 + (i % 4) * 1.6) * pulse;
    ctx.beginPath();
    ctx.moveTo(startX, y - 4);
    ctx.bezierCurveTo(startX + bend * 0.8, y - height * 0.25, endX - bend * 0.35, y - height * 0.58, endX, endY);
    ctx.stroke();
  }
}

function drawBossRingAura(x, y, width, height, color, pulse, time) {
  ctx.lineWidth = 4 * pulse;
  for (let i = 0; i < 4; i += 1) {
    const rise = ((time * 0.9 + i / 4) % 1);
    const ringY = y - rise * height;
    const ringW = width * (0.38 + rise * 0.38);
    ctx.strokeStyle = auraColor(color, (0.24 * (1 - rise) + 0.05) * pulse);
    ctx.beginPath();
    ctx.ellipse(x, ringY, ringW, ringW * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const glow = ctx.createLinearGradient(x, y, x, y - height);
  glow.addColorStop(0, auraColor(color, 0.18 * pulse));
  glow.addColorStop(0.7, auraColor(color, 0.08 * pulse));
  glow.addColorStop(1, auraColor(color, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(x, y - height * 0.42, width * 0.56, height * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBossVeilAura(x, y, width, height, color, pulse, time) {
  const gradient = ctx.createLinearGradient(x, y, x, y - height);
  gradient.addColorStop(0, auraColor(color, 0.2 * pulse));
  gradient.addColorStop(0.5, auraColor(color, 0.1 * pulse));
  gradient.addColorStop(1, auraColor(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.54, y);
  for (let i = 0; i <= 6; i += 1) {
    const t = i / 6;
    const wave = Math.sin(time * 5 + i * 1.3) * width * 0.08;
    ctx.lineTo(x - width * 0.42 + t * width * 0.84 + wave, y - height * (0.18 + t * 0.74));
  }
  ctx.lineTo(x + width * 0.54, y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = auraColor(color, 0.22 * pulse);
  ctx.lineWidth = 3 * pulse;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.5, y - height * 0.08);
  ctx.bezierCurveTo(x - width * 0.64, y - height * 0.5, x - width * 0.18, y - height * 0.7, x - width * 0.3, y - height);
  ctx.moveTo(x + width * 0.5, y - height * 0.08);
  ctx.bezierCurveTo(x + width * 0.64, y - height * 0.5, x + width * 0.18, y - height * 0.7, x + width * 0.3, y - height);
  ctx.stroke();
}

function getMidBossBodyColor(enemy) {
  if (enemy.bossRank === "major") return "#6f2e3f";
  if (enemy.bossVariant === "shock") return "#5f8d69";
  if (enemy.bossVariant === "jump") return "#b26052";
  if (enemy.bossVariant === "knife") return "#4f6f8d";
  if (enemy.bossVariant === "summon") return "#7a5a9e";
  return "#9a4d7a";
}

function getMidBossAttackLabel(enemy) {
  if (enemy.attackType === "charge") return "CHARGE";
  if (enemy.attackType === "shock") return "SHOCK";
  if (enemy.attackType === "jump") return "JUMP";
  if (enemy.attackType === "knife") return "KNIFE";
  if (enemy.attackType === "summon") return "CALL";
  return "SMASH";
}

function getMidBossAttackLabelColor(enemy) {
  if (enemy.attackType === "charge") return "rgba(121, 215, 255, 0.92)";
  if (enemy.attackType === "shock") return "rgba(119, 223, 116, 0.92)";
  if (enemy.attackType === "jump") return "rgba(255, 200, 87, 0.94)";
  if (enemy.attackType === "knife") return "rgba(233, 249, 255, 0.92)";
  if (enemy.attackType === "summon") return "rgba(255, 200, 87, 0.94)";
  return "rgba(255, 200, 87, 0.92)";
}

function drawMidBossWarning(enemy, scaleX, scaleY) {
  if (enemy.attackType === "shock" && (enemy.attackWindup > 0 || enemy.attackActive > 0)) {
    const alpha = enemy.attackActive > 0 ? 0.28 : 0.16;
    drawGroundWarningCircle(enemy.x, enemy.y, MID_BOSS_ENEMY.shockRadius, "rgba(119, 223, 116,", alpha, scaleX, scaleY);
  }

  if (enemy.attackType === "jump" && (enemy.attackWindup > 0 || enemy.attackActive > 0)) {
    const targetX = enemy.attackTargetX ?? enemy.x;
    const targetY = enemy.attackTargetY ?? enemy.y;
    const alpha = enemy.attackActive > 0 && enemy.attackLanded ? 0.26 : 0.2;
    drawGroundWarningCircle(targetX, targetY, MID_BOSS_ENEMY.jumpImpactRadius, "rgba(255, 200, 87,", alpha, scaleX, scaleY);
  }
}

function drawGroundWarningCircle(x, y, radius, colorPrefix, alpha, scaleX, scaleY) {
  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = `${colorPrefix} ${alpha})`;
  ctx.strokeStyle = `${colorPrefix} ${Math.min(alpha + 0.38, 0.78)})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x, y + 8, radius, radius * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawBikeEnemy(enemy, scaleX, scaleY) {
  if (drawEnemySprite(enemy, scaleX, scaleY)) {
    if (enemy.warningTimer > 0) {
      drawBikeCaution(enemy, scaleX, scaleY);
    }
    return;
  }

  drawShadow(enemy, scaleX, scaleY);
  if (enemy.warningTimer > 0) {
    drawBikeCaution(enemy, scaleX, scaleY);
  }

  ctx.save();
  ctx.translate(enemy.x * scaleX, enemy.y * scaleY);
  ctx.scale(scaleX * enemy.facing, scaleY);

  ctx.fillStyle = enemy.hitFlash > 0 ? "#fff1be" : "#ff5f4f";
  ctx.beginPath();
  ctx.roundRect(-42, -28, 84, 30, 12);
  ctx.fill();

  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.arc(-28, 8, 14, 0, Math.PI * 2);
  ctx.arc(30, 8, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffc857";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-28, -4);
  ctx.lineTo(8, -32);
  ctx.lineTo(35, -6);
  ctx.stroke();

  ctx.fillStyle = "#3a1210";
  ctx.beginPath();
  ctx.arc(4, -38, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f6f0df";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(15, -25);
  ctx.lineTo(38, -18);
  ctx.stroke();

  const hpWidth = 72;
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
  ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
  ctx.fillRect(-hpWidth / 2, -58, hpWidth, 7);
  ctx.fillStyle = "#ffcf5a";
  ctx.fillRect(-hpWidth / 2, -58, hpWidth * hpRatio, 7);

  ctx.restore();
}

function drawBikeCaution(enemy, scaleX, scaleY) {
  const elapsed = BIKE_ENEMY.warningTime - enemy.warningTimer;
  const blinkProgress = (elapsed / BIKE_ENEMY.warningTime) * 2;
  const blinkOn = blinkProgress % 1 < 0.62;
  const frontX = enemy.x + enemy.facing * 78;
  const textX = clamp(frontX, 96, WORLD.width - 96);
  const textY = enemy.y - 62;

  ctx.save();
  ctx.globalAlpha = blinkOn ? 1 : 0.18;
  ctx.translate(textX * scaleX, textY * scaleY);
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = "#ffc857";
  ctx.font = "900 22px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
  ctx.strokeText("CAUTION!", 0, 0);
  ctx.fillText("CAUTION!", 0, 0);
  ctx.strokeText("CAUTION!", 0, 24);
  ctx.fillText("CAUTION!", 0, 24);
  ctx.restore();
}

function drawProjectiles(scaleX, scaleY) {
  state.projectiles.forEach((projectile) => {
    if (projectile.type === "enemy_bullet") {
      drawEnemyBullet(projectile, scaleX, scaleY);
      return;
    }

    if (projectile.type !== "enemy_knife" && projectile.type !== "player_knife") return;

    ctx.save();
    ctx.translate(projectile.x * scaleX, projectile.y * scaleY);
    ctx.rotate(projectile.spin);
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = "#d8e2ea";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#72513d";
    ctx.fillRect(-20, -4, 12, 8);
    ctx.restore();
  });
}

function drawBreakables(scaleX, scaleY) {
  state.breakables.forEach((breakable) => {
    if (breakable.type === "barrel") {
      drawBarrel(breakable, scaleX, scaleY);
      return;
    }

    drawCrate(breakable, scaleX, scaleY);
  });
}

function drawCrate(crate, scaleX, scaleY) {
  drawShadow(crate, scaleX, scaleY);
  const wobble = crate.wobbleTimer > 0 ? Math.sin(crate.wobbleTimer * 70) * 2.5 : 0;

  ctx.save();
  ctx.translate(crate.x * scaleX, crate.y * scaleY);
  ctx.rotate((wobble * Math.PI) / 180);
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = crate.hitFlash > 0 ? "#fff1be" : "#9f6b38";
  ctx.strokeStyle = "#4c2f18";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-crate.width / 2, -crate.height / 2, crate.width, crate.height, 5);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 232, 180, 0.48)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-crate.width / 2 + 7, -crate.height / 2 + 7);
  ctx.lineTo(crate.width / 2 - 7, crate.height / 2 - 7);
  ctx.moveTo(crate.width / 2 - 7, -crate.height / 2 + 7);
  ctx.lineTo(-crate.width / 2 + 7, crate.height / 2 - 7);
  ctx.stroke();

  drawBreakableHpBar(crate);
  ctx.restore();
}

function drawBarrel(barrel, scaleX, scaleY) {
  drawShadow(barrel, scaleX, scaleY);
  const wobble = barrel.wobbleTimer > 0 ? Math.sin(barrel.wobbleTimer * 70) * 2 : 0;

  ctx.save();
  ctx.translate(barrel.x * scaleX, barrel.y * scaleY);
  ctx.rotate((wobble * Math.PI) / 180);
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = barrel.hitFlash > 0 ? "#fff1be" : "#5c8a83";
  ctx.strokeStyle = "#203f3c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-barrel.width / 2, -barrel.height / 2, barrel.width, barrel.height, 12);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(233, 249, 255, 0.5)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-barrel.width / 2 + 3, -18);
  ctx.lineTo(barrel.width / 2 - 3, -18);
  ctx.moveTo(-barrel.width / 2 + 3, 16);
  ctx.lineTo(barrel.width / 2 - 3, 16);
  ctx.stroke();

  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(-barrel.width / 2 + 8, -barrel.height / 2 + 8, 7, barrel.height - 16);

  drawBreakableHpBar(barrel);
  ctx.restore();
}

function drawBreakableHpBar(breakable) {
  const hpRatio = Math.max(0, breakable.hp / breakable.maxHp);
  const hpWidth = breakable.width + 8;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(-hpWidth / 2, -breakable.height / 2 - 13, hpWidth, 6);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(-hpWidth / 2, -breakable.height / 2 - 13, hpWidth * hpRatio, 6);
}

function drawItems(scaleX, scaleY) {
  state.items.forEach((item) => {
    const itemDef = ITEM_TYPES[item.type];
    const bob = Math.sin(item.age * 5 + item.bobSeed) * 5;

    ctx.save();
    ctx.translate(item.x * scaleX, (item.y + bob) * scaleY);
    ctx.scale(scaleX, scaleY);

    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 21, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "28px Apple Color Emoji, Segoe UI Emoji, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(itemDef.icon, 0, 0);

    ctx.restore();
  });
}

function drawEnemyBullet(projectile, scaleX, scaleY) {
  ctx.save();
  ctx.translate(projectile.x * scaleX, projectile.y * scaleY);
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = "#ffdf6b";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, projectile.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 223, 107, 0.42)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-Math.sign(projectile.vx) * 20, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.restore();
}

function drawEnemyAttackBox(enemy, scaleX, scaleY) {
  const box = getEnemyAttackBox(enemy);
  ctx.save();
  ctx.translate(box.x * scaleX, box.y * scaleY);
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = "rgba(255, 128, 104, 0.24)";
  ctx.strokeStyle = "rgba(255, 128, 104, 0.72)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-box.width / 2, -box.height / 2, box.width, box.height, 18);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawAttacks(scaleX, scaleY) {
  state.attacks.forEach((attack) => {
    const t = attack.age / attack.duration;
    if (attack.type === "special") {
      ctx.save();
      ctx.translate(attack.x * scaleX, attack.y * scaleY);
      ctx.scale(scaleX, scaleY);
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = "rgba(121, 215, 255, 0.18)";
      ctx.strokeStyle = "rgba(121, 215, 255, 0.95)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, attack.radius * (0.72 + t * 0.38), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#79d7ff";
      ctx.font = "900 18px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SPECIAL", 0, -attack.radius - 12);
      ctx.restore();
      return;
    }

    const isJumpKick = attack.comboStep === "K";
    ctx.save();
    ctx.translate(attack.x * scaleX, attack.y * scaleY);
    ctx.scale(scaleX, scaleY);
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = attack.comboStep === 3 || isJumpKick ? "rgba(121, 215, 255, 0.3)" : "rgba(255, 255, 255, 0.34)";
    ctx.strokeStyle = attack.comboStep === 3 || isJumpKick ? "rgba(121, 215, 255, 0.95)" : "rgba(255, 200, 87, 0.92)";
    ctx.lineWidth = attack.comboStep === 3 || isJumpKick ? 6 : 4;
    ctx.beginPath();
    ctx.roundRect(-attack.width / 2, -attack.height / 2, attack.width, attack.height, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = attack.comboStep === 3 || isJumpKick ? "#79d7ff" : "#ffc857";
    ctx.font = "900 18px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(attack.comboStep, 0, -attack.height / 2 - 8);
    ctx.restore();
  });
}

function drawFloatingTexts(scaleX, scaleY) {
  state.floatingTexts.forEach((text) => {
    const t = text.age / text.duration;
    const easeOut = 1 - Math.pow(1 - t, 3);
    const x = (text.x + text.drift * easeOut) * scaleX;
    const y = (text.y - text.lift * easeOut) * scaleY;

    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.font = "900 22px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillStyle = text.color;
    ctx.strokeText(text.text, 0, 0);
    ctx.fillText(text.text, 0, 0);
    ctx.restore();
  });
}

function drawJoystick(scaleX, scaleY) {
  if (!input.moveStart) return;
  const baseX = input.moveStart.x * scaleX;
  const baseY = input.moveStart.y * scaleY;
  const knobX = (input.moveStart.x + input.pointerMoveX * 46) * scaleX;
  const knobY = (input.moveStart.y + input.pointerMoveY * 46) * scaleY;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(baseX, baseY, 48 * scaleX, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(121, 215, 255, 0.48)";
  ctx.beginPath();
  ctx.arc(knobX, knobY, 18 * scaleX, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  const viewW = canvas.clientWidth;
  const viewH = canvas.clientHeight;
  const scaleX = viewW / WORLD.width;
  const scaleY = viewH / WORLD.height;
  const shake = getScreenShakeOffset(scaleX, scaleY);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(shake.x, shake.y);
  drawBackground();
  drawExitGate(scaleX, scaleY);
  drawAreaBadge(scaleX, scaleY);
  drawAttacks(scaleX, scaleY);
  drawProjectiles(scaleX, scaleY);
  drawBreakables(scaleX, scaleY);
  drawItems(scaleX, scaleY);
  drawEnemies(scaleX, scaleY);
  drawPlayer(scaleX, scaleY);
  drawBossHud(scaleX, scaleY);
  drawFloatingTexts(scaleX, scaleY);
  drawJoystick(scaleX, scaleY);
  drawAreaTransition(scaleX, scaleY);
  drawSuperFlash(scaleX, scaleY);
  drawMajorBossIntro(scaleX, scaleY);
  ctx.restore();
}

function loop(now) {
  const dt = Math.min((now - state.lastTime) / 1000, 0.033);
  state.lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resizeCanvas);

function preventBrowserZoomGestures() {
  let lastTouchEndTime = 0;

  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length > 1) event.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();
      if (now - lastTouchEndTime < 350) event.preventDefault();
      lastTouchEndTime = now;
    },
    { passive: false }
  );

  window.addEventListener(
    "gesturestart",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );
}

window.addEventListener("keydown", (event) => {
  if (!state.gameStarted) {
    if (event.code === "Digit1") {
      event.preventDefault();
      selectDifficulty("easy");
    } else if (event.code === "Digit2") {
      event.preventDefault();
      selectDifficulty("normal");
    } else if (event.code === "Digit3") {
      event.preventDefault();
      selectDifficulty("hard");
    } else if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      startGame(1);
    }
    return;
  }

  if (state.continueActive) {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      acceptContinue();
    }
    if (event.code === "Escape") {
      event.preventDefault();
      giveUpContinue();
    }
    return;
  }

  input.keys.add(event.code);
  if ((event.code === "ArrowLeft" || event.code === "KeyA") && event.shiftKey) {
    event.preventDefault();
    requestJump(-1);
    return;
  }
  if ((event.code === "ArrowRight" || event.code === "KeyD") && event.shiftKey) {
    event.preventDefault();
    requestJump(1);
    return;
  }
  if (event.code === "Space") {
    event.preventDefault();
    requestAttack();
  }
  if (event.code === "KeyQ") {
    event.preventDefault();
    requestSpecialSkill();
  }
  if (event.code === "KeyR") {
    event.preventDefault();
    requestSuperSpecial();
  }
});

window.addEventListener("keyup", (event) => {
  input.keys.delete(event.code);
});

function clearMovePointerInput() {
  input.movePointerId = null;
  input.moveStart = null;
  input.moveCurrent = null;
  input.pointerMoveX = 0;
  input.pointerMoveY = 0;
}

function clearActionPointerInput() {
  input.actionPointerId = null;
  input.actionStart = null;
  input.actionCurrent = null;
  input.actionHoldTimer = 0;
  input.actionHoldTriggered = false;
}

function clearPointerInput() {
  clearMovePointerInput();
  clearActionPointerInput();
}

function clearAllInput() {
  input.keys.clear();
  clearPointerInput();
}

function safelySetPointerCapture(pointerId) {
  try {
    canvas.setPointerCapture(pointerId);
  } catch {
    clearPointerInput();
  }
}

function safelyReleasePointerCapture(pointerId) {
  try {
    if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
  } catch {
    clearPointerInput();
  }
}

function updateActionHold(dt) {
  if (input.actionPointerId === null || !input.actionStart || input.actionHoldTriggered) return;
  if (!canUsePlayerAction()) return;

  input.actionHoldTimer += dt;
  if (input.actionHoldTimer < SPECIAL_GAUGE.skillHoldTime) return;
  input.actionHoldTriggered = true;
  requestSuperSpecial();
}

canvas.addEventListener("pointerdown", (event) => {
  if (!state.gameStarted) return;
  if (state.continueActive) return;

  safelySetPointerCapture(event.pointerId);
  const point = screenToWorld(event);
  const isLeftHalf = point.screenX < point.screenWidth / 2;

  if (isLeftHalf) {
    clearMovePointerInput();
    input.movePointerId = event.pointerId;
    input.moveStart = { x: point.x, y: point.y };
    input.moveCurrent = { x: point.x, y: point.y };
    input.pointerMoveX = 0;
    input.pointerMoveY = 0;
  } else if (!isLeftHalf && input.actionPointerId === null) {
    input.actionPointerId = event.pointerId;
    input.actionStart = { x: point.x, y: point.y };
    input.actionCurrent = { x: point.x, y: point.y };
    input.actionHoldTimer = 0;
    input.actionHoldTriggered = false;
  } else {
    requestAttack();
  }
});

canvas.addEventListener("pointermove", (event) => {
  const point = screenToWorld(event);
  if (event.pointerId === input.movePointerId && input.moveStart) {
    const dx = point.x - input.moveStart.x;
    const dy = point.y - input.moveStart.y;
    input.moveCurrent = { x: point.x, y: point.y };
    const dir = normalize(dx, dy);
    const strength = Math.min(Math.hypot(dx, dy) / 70, 1);
    input.pointerMoveX = dir.x * strength;
    input.pointerMoveY = dir.y * strength;
  }

  if (event.pointerId === input.actionPointerId && input.actionStart) {
    input.actionCurrent = { x: point.x, y: point.y };
  }
});

canvas.addEventListener("pointerup", (event) => {
  safelyReleasePointerCapture(event.pointerId);

  if (event.pointerId === input.movePointerId) {
    clearMovePointerInput();
  }

  if (event.pointerId === input.actionPointerId) {
    if (!input.actionHoldTriggered && !maybeTriggerActionSwipe()) requestAttack();
    clearActionPointerInput();
  }
});

canvas.addEventListener("pointercancel", (event) => {
  safelyReleasePointerCapture(event.pointerId);

  if (event.pointerId === input.movePointerId) {
    clearMovePointerInput();
  }

  if (event.pointerId === input.actionPointerId) {
    clearActionPointerInput();
  }
});

canvas.addEventListener("lostpointercapture", (event) => {
  if (event.pointerId === input.movePointerId) clearMovePointerInput();
  if (event.pointerId === input.actionPointerId) clearActionPointerInput();
});

window.addEventListener("pointerup", (event) => {
  if (event.pointerId === input.movePointerId) clearMovePointerInput();
  if (event.pointerId === input.actionPointerId) clearActionPointerInput();
});

window.addEventListener("pointercancel", (event) => {
  if (event.pointerId === input.movePointerId) clearMovePointerInput();
  if (event.pointerId === input.actionPointerId) clearActionPointerInput();
});

window.addEventListener("blur", clearAllInput);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearAllInput();
});

document.addEventListener(
  "touchend",
  (event) => {
    if (event.touches.length === 0) clearPointerInput();
  },
  { passive: true }
);

document.addEventListener("touchcancel", clearPointerInput, { passive: true });

continueButton.addEventListener("click", acceptContinue);
giveUpButton.addEventListener("click", giveUpContinue);
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => selectDifficulty(button.dataset.difficulty));
});

function maybeTriggerActionSwipe() {
  if (!input.actionStart || !input.actionCurrent) return false;
  const dx = input.actionCurrent.x - input.actionStart.x;
  const dy = input.actionCurrent.y - input.actionStart.y;
  const distanceMoved = Math.hypot(dx, dy);
  const angleFromStraightUp = Math.abs(Math.atan2(dx, -dy) * (180 / Math.PI));
  const angleFromStraightDown = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  const isLooseUpSwipe =
    distanceMoved >= JUMP.swipeMinDistance &&
    dy <= JUMP.swipeUpThreshold &&
    angleFromStraightUp <= JUMP.swipeAngleToleranceDegrees;
  const isLooseDownSwipe =
    distanceMoved >= JUMP.swipeMinDistance &&
    dy >= Math.abs(JUMP.swipeUpThreshold) &&
    angleFromStraightDown <= JUMP.swipeAngleToleranceDegrees;

  if (isLooseUpSwipe) {
    requestJump(getJumpDirectionFromMovement());
    return true;
  }

  if (isLooseDownSwipe) {
    return requestSpecialSkill();
  }

  return false;
}

function getJumpDirectionFromMovement() {
  if (Math.abs(input.moveX) >= JUMP.stickDirectionThreshold) {
    return input.moveX > 0 ? 1 : -1;
  }
  return state.player.facing;
}

canvas.addEventListener("contextmenu", (event) => event.preventDefault());

resizeCanvas();
preventBrowserZoomGestures();
buildDebugStartButtons();
buildCharacterButtons();
updateTitleOverlay();
updateHud();
requestAnimationFrame(loop);
