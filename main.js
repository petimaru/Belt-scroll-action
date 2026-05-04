const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hpBar = document.getElementById("hpBar");
const hpText = document.getElementById("hpText");
const scoreText = document.getElementById("scoreText");
const message = document.getElementById("message");

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

const BIKE_ENEMY = {
  warningTime: 1.45,
  speed: 560,
  damage: 18,
  hp: 34,
  radius: 34,
  halfVisibleOffset: -38,
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
};

const state = {
  lastTime: performance.now(),
  score: 0,
  wave: 1,
  gameOverTimer: 0,
  bikeSpawnTimer: null,
  bikeSpawnsRemaining: 0,
  player: createPlayer(),
  enemies: [],
  attacks: [],
  floatingTexts: [],
};

function createPlayer() {
  return {
    x: 210,
    y: 330,
    radius: 24,
    speed: 245,
    hp: 100,
    maxHp: 100,
    facing: 1,
    invincibleTimer: 0,
    attackCooldown: 0,
    comboStep: 0,
    comboTimer: 0,
    isJumping: false,
    jumpTimer: 0,
    jumpDirection: 0,
    jumpKickUsed: false,
  };
}

function createEnemy(round = 1, index = 0) {
  const fromRight = Math.random() > 0.5;
  const dropsIn = Math.random() < 0.25;
  const laneHeight = WORLD.floorBottom - WORLD.floorTop - 110;
  const stagger = (index % 3) * 58;
  const baseY = WORLD.floorTop + 58 + ((Math.random() * laneHeight + stagger) % laneHeight);
  const entryX = fromRight ? WORLD.width - 115 - index * 34 : 115 + index * 34;
  const entryY = baseY;
  return {
    type: "slow_puncher",
    name: "ゆっくり近づく敵",
    x: dropsIn ? 260 + Math.random() * (WORLD.width - 520) : fromRight ? WORLD.width + 70 + index * 46 : -70 - index * 46,
    y: dropsIn ? WORLD.floorTop - 120 - index * 34 : baseY,
    entryX,
    entryY,
    entryMode: dropsIn ? "drop" : "side",
    entering: true,
    radius: 25,
    hp: 40 + Math.min(round * 5, 35),
    maxHp: 40 + Math.min(round * 5, 35),
    speed: 76 + Math.min(round * 3, 30),
    damage: 10,
    attackRangeX: 62,
    attackRangeY: 42,
    chaseRange: 300,
    attackCooldown: 0,
    attackWindup: 0,
    attackActive: 0,
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

function createBikeEnemy(round = 1, index = 0) {
  const fromRight = Math.random() > 0.5;
  const laneHeight = WORLD.floorBottom - WORLD.floorTop - 120;
  const y = WORLD.floorTop + 72 + Math.random() * laneHeight;
  return {
    type: "bike_rusher",
    name: "バイク敵",
    x: fromRight ? WORLD.width - BIKE_ENEMY.halfVisibleOffset : BIKE_ENEMY.halfVisibleOffset,
    y,
    radius: BIKE_ENEMY.radius,
    hp: BIKE_ENEMY.hp + Math.min(round * 3, 18),
    maxHp: BIKE_ENEMY.hp + Math.min(round * 3, 18),
    speed: BIKE_ENEMY.speed + Math.min(round * 12, 90),
    damage: BIKE_ENEMY.damage,
    facing: fromRight ? -1 : 1,
    warningTimer: BIKE_ENEMY.warningTime,
    hasDamagedThisRush: false,
    hitFlash: 0,
    hitStopTimer: 0,
    knockbackX: 0,
    knockbackY: 0,
  };
}

function resetRun(keepScore = false) {
  state.player = createPlayer();
  state.wave = 1;
  spawnWave();
  state.attacks = [];
  state.floatingTexts = [];
  state.gameOverTimer = 0;
  if (!keepScore) state.score = 0;
  showMessage("Ready?", 800);
}

function spawnWave(preserveEventEnemies = false) {
  const enemyCount = state.wave === 1 ? 2 : 2 + Math.floor(Math.random() * 2);
  const eventEnemies = preserveEventEnemies ? state.enemies.filter((enemy) => enemy.type === "bike_rusher") : [];
  const regularEnemies = Array.from({ length: enemyCount }, (_, index) => createEnemy(state.wave, index));
  state.enemies = [...eventEnemies, ...regularEnemies];
  scheduleBikeSpawnsForWave();
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

  if (player.comboTimer <= 0 && player.attackCooldown <= 0) {
    player.comboStep = 0;
  }

  if (player.hp <= 0) {
    state.gameOverTimer += dt;
    if (state.gameOverTimer > 1.15) resetRun(false);
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

function getPlayerJumpHeight(player) {
  if (!player.isJumping) return 0;
  const progress = 1 - player.jumpTimer / JUMP.duration;
  return Math.sin(progress * Math.PI) * JUMP.height;
}

function updateEnemies(dt) {
  const player = state.player;

  state.enemies.forEach((enemy) => {
    if (enemy.type === "bike_rusher") {
      updateBikeEnemy(enemy, player, dt);
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
      enemy.attackWindup = DIFFICULTY.enemyAttackWindup;
      enemy.attackActive = 0;
      enemy.attackCooldown = DIFFICULTY.enemyAttackCooldown + Math.random() * 0.45;
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
    player.invincibleTimer = 0.65;
    addFloatingText(player.x, player.y - 62, `-${enemy.damage}`, "#ff6b5a");
    if (player.hp <= 0) showMessage("Retry!", 900);
  }
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
  const toTarget = normalize(target.x - enemy.x, target.y - enemy.y);
  const entrySpeed = enemy.entryMode === "drop" ? 235 : 135;
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
  return {
    x: enemy.x + enemy.facing * 42,
    y: enemy.y - 4,
    width: 68,
    height: 52,
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
  player.invincibleTimer = 0.55;
  addFloatingText(player.x, player.y - 62, `-${enemy.damage}`, "#ff6b5a");
  if (player.hp <= 0) showMessage("Retry!", 900);
}

function updateAttacks(dt) {
  state.attacks.forEach((attack) => {
    attack.age += dt;

    state.enemies.forEach((enemy) => {
      if (attack.hasHit.has(enemy)) return;
      const hitLeft = attack.x - attack.width / 2;
      const hitRight = attack.x + attack.width / 2;
      const hitTop = attack.y - attack.height / 2;
      const hitBottom = attack.y + attack.height / 2;
      const isHit =
        enemy.x + enemy.radius > hitLeft &&
        enemy.x - enemy.radius < hitRight &&
        enemy.y + enemy.radius > hitTop &&
        enemy.y - enemy.radius < hitBottom;

      if (!isHit) return;
      attack.hasHit.add(enemy);
      enemy.hp -= attack.damage;
      const isFinisher = attack.comboStep === 3 || attack.comboStep === "K";
      enemy.hitFlash = isFinisher ? 0.28 : 0.18;
      enemy.hitStopTimer = attack.hitStop;
      enemy.attackWindup = 0;
      enemy.attackActive = 0;
      enemy.hasDamagedThisSwing = false;
      enemy.knockbackX = attack.facing * attack.knockback * 5.5;
      enemy.knockbackY = isFinisher ? -40 : 0;
      state.score += 25;
      addFloatingText(enemy.x, enemy.y - 70, `-${attack.damage}`, "#fff1be");
      if (isFinisher) {
        addFloatingText(enemy.x, enemy.y - 116, attack.comboStep === "K" ? "JUMP KICK!" : "KNOCK!", "#79d7ff");
      }
    });
  });

  state.attacks = state.attacks.filter((attack) => attack.age < attack.duration);

  const defeatedCount = state.enemies.filter((enemy) => enemy.hp <= 0).length;
  if (defeatedCount > 0) {
    state.score += defeatedCount * 250;
    state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  }

  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.type !== "bike_rusher") return true;
    const hasExitedLeft = enemy.facing < 0 && enemy.x < -130;
    const hasExitedRight = enemy.facing > 0 && enemy.x > WORLD.width + 130;
    return enemy.hp > 0 && !hasExitedLeft && !hasExitedRight;
  });

  maybeAdvanceWave();
}

function maybeAdvanceWave() {
  const regularEnemiesRemaining = state.enemies.some((enemy) => enemy.type !== "bike_rusher");
  if (regularEnemiesRemaining) return;

  state.wave += 1;
  spawnWave(true);
  showMessage(`Wave ${state.wave}`, 700);
}

function update(dt) {
  updatePlayer(dt);
  updateBikeSpawner(dt);
  updateEnemies(dt);
  updateAttacks(dt);
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
  scoreText.textContent = String(state.score);
}

function drawBackground() {
  const viewW = canvas.clientWidth;
  const viewH = canvas.clientHeight;
  const scaleX = viewW / WORLD.width;
  const scaleY = viewH / WORLD.height;

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);

  const gradient = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
  gradient.addColorStop(0, "#263024");
  gradient.addColorStop(0.52, "#4a3f26");
  gradient.addColorStop(1, "#1a211c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fillRect(0, 0, WORLD.width, WORLD.floorTop);

  ctx.fillStyle = "rgba(255, 232, 180, 0.09)";
  for (let y = WORLD.floorTop; y <= WORLD.floorBottom; y += 38) {
    ctx.fillRect(0, y, WORLD.width, 2);
  }

  ctx.strokeStyle = "rgba(255, 232, 180, 0.18)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.floorTop);
  ctx.lineTo(WORLD.width, WORLD.floorTop);
  ctx.moveTo(0, WORLD.floorBottom);
  ctx.lineTo(WORLD.width, WORLD.floorBottom);
  ctx.stroke();

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
  ctx.restore();
}

function drawEnemies(scaleX, scaleY) {
  state.enemies.forEach((enemy) => {
    if (enemy.type === "bike_rusher") {
      drawBikeEnemy(enemy, scaleX, scaleY);
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

function drawBikeEnemy(enemy, scaleX, scaleY) {
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

  drawBackground();
  drawAttacks(scaleX, scaleY);
  drawEnemies(scaleX, scaleY);
  drawPlayer(scaleX, scaleY);
  drawFloatingTexts(scaleX, scaleY);
  drawJoystick(scaleX, scaleY);
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
});

window.addEventListener("keyup", (event) => {
  input.keys.delete(event.code);
});

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  const point = screenToWorld(event);
  const isLeftHalf = point.screenX < point.screenWidth / 2;

  if (isLeftHalf && input.movePointerId === null) {
    input.movePointerId = event.pointerId;
    input.moveStart = { x: point.x, y: point.y };
    input.moveCurrent = { x: point.x, y: point.y };
    input.pointerMoveX = 0;
    input.pointerMoveY = 0;
  } else if (!isLeftHalf && input.actionPointerId === null) {
    input.actionPointerId = event.pointerId;
    input.actionStart = { x: point.x, y: point.y };
    input.actionCurrent = { x: point.x, y: point.y };
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
  if (event.pointerId === input.movePointerId) {
    input.movePointerId = null;
    input.moveStart = null;
    input.moveCurrent = null;
    input.pointerMoveX = 0;
    input.pointerMoveY = 0;
  }

  if (event.pointerId === input.actionPointerId) {
    if (!maybeTriggerJumpFromActionSwipe()) requestAttack();
    input.actionPointerId = null;
    input.actionStart = null;
    input.actionCurrent = null;
  }
});

canvas.addEventListener("pointercancel", (event) => {
  if (event.pointerId === input.movePointerId) {
    input.movePointerId = null;
    input.moveStart = null;
    input.moveCurrent = null;
    input.pointerMoveX = 0;
    input.pointerMoveY = 0;
  }

  if (event.pointerId === input.actionPointerId) {
    input.actionPointerId = null;
    input.actionStart = null;
    input.actionCurrent = null;
  }
});

function maybeTriggerJumpFromActionSwipe() {
  if (!input.actionStart || !input.actionCurrent) return false;
  const dx = input.actionCurrent.x - input.actionStart.x;
  const dy = input.actionCurrent.y - input.actionStart.y;
  const distanceMoved = Math.hypot(dx, dy);
  const angleFromStraightUp = Math.abs(Math.atan2(dx, -dy) * (180 / Math.PI));
  const isLooseUpSwipe =
    distanceMoved >= JUMP.swipeMinDistance &&
    dy <= JUMP.swipeUpThreshold &&
    angleFromStraightUp <= JUMP.swipeAngleToleranceDegrees;

  if (!isLooseUpSwipe) return false;
  requestJump(getJumpDirectionFromMovement());
  return true;
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
resetRun(false);
requestAnimationFrame(loop);
