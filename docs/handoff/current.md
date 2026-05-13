# Current Handoff

> This file is a temporary handoff note for continuing development.
> Source of truth is the code and README. If this file conflicts with code, trust the code.
> Last updated: 2026-05-09

## New Chat Instruction

Copy and paste this into the next chat:

```md
/Users/takedakouji/Documents/Belt scroll action/docs/handoff/current.md を読んで、続きを進めてください。

まず現在のgit状態とローカルサーバー状態を確認してください。

前回は、タイトル画面で PETIMAN / ROOEEBEE を選べるようにし、HUDの顔アイコンと名前表示、ROOEEBEEのKO画像サイズ調整まで実装して、GitHubへpush済みです。

次は、画像差し替えの続きとして「通常敵・ボス・背景・攻撃エフェクトのどこから進めるか」を一緒に決めたいです。まず現状コードとこのhandoffを読んで、変更前に前提・変更予定ファイル・変更しない範囲を短く説明してください。
```

## Project

- Workspace: `/Users/takedakouji/Documents/Belt scroll action`
- GitHub: `https://github.com/petimaru/Belt-scroll-action.git`
- Branch: `main`
- Latest pushed commit: `67a12d3 Add player character selection`
- Local server command for iPhone testing: `python3 -m http.server 4174 --bind 0.0.0.0`
- Current iPhone test URL at the time of writing: `http://192.168.0.49:4174/?v=67`
- Known untracked folders:
  - `.playwright-cli/`
  - `output/`
  - `tmp/`
  - These were not committed intentionally.

## Important Working Rules

- Do not use Playwright unless the user explicitly says to use Playwright.
- For iPhone testing, update the URL cache buster such as `?v=67` when `index.html`, `main.js`, or `style.css` changes.
- If `index.html` references `style.css?v=N` and `main.js?v=N`, bump both numbers together after browser-facing changes.
- Do not draw text inside a Canvas transform that flips enemies with `ctx.scale(enemy.facing, 1)`.
- Boss labels such as `CHARGE`, `SHOCK`, `JUMP`, `KNIFE`, `SMASH`, and `GUARD` should stay unflipped.
- Keep changes small and beginner-friendly.
- If writing new handoff notes, keep them in `docs/handoff/current.md` and clearly mark them as temporary notes, not the source of truth.

## Current Game Overview

- HTML/CSS/JavaScript + Canvas belt-scroll action game.
- iPhone landscape play is important.
- Left half drag: move.
- Right half tap: normal attack.
- Right half upward flick: jump.
- Right half downward flick: special attack.
- Right half long press: super special attack.
- Tap while jumping: jump kick.
- Defeat all required enemies to open the right-side gate.
- Move to the right edge after gate opens to enter the next Area.
- Continue screen exists with countdown.
- Jump avoids normal attacks, knives, bullets, bike rushes, and boss radial attacks.

## Recent Implemented Features

### Title And Difficulty

- Added title screen: `STREET BREAKER`.
- Difficulty buttons:
  - Easy
  - Normal
  - Hard
- Title screen now has development debug start buttons:
  - Normal play
  - Mid Boss A
  - Mid Boss B
  - Mid Boss C
  - Mid Boss D
  - Major Boss
- Difficulty buttons select difficulty only.
- Start buttons choose the starting Area.
- Keyboard on title:
  - `1`: Easy
  - `2`: Normal
  - `3`: Hard
  - `Enter` or `Space`: normal play start.

### Difficulty

- `DIFFICULTY_SETTINGS` in `main.js` controls difficulty.
- Hard currently keeps HP and damage bonuses:
  - enemy HP scale: `1.18`
  - boss HP scale: `1.25`
  - enemy damage scale: `1.16`
- Hard also mixes attack windup timing:
  - short
  - long
  - slightly short
  - slightly long
- The windup timing mix applies to:
  - normal punch enemies
  - gunners
  - knife throwers
  - mid bosses
  - major boss

### Bosses

- Boss types are registered in `BOSS_TYPES`.
- Mid boss type: `mid_boss_brawler`.
- Major boss type: `major_boss_brawler`.
- Major boss is larger and uses a dedicated `BOSS` HP bar.
- Major boss now has a short entry presentation:
  - `Major Boss!` message
  - light screen shake
  - `MAJOR BOSS` warning overlay
- Major boss uses all current mid boss techniques.
- Bosses can guard.
- Bosses react to front hits:
  - If hit from the front while not attacking or winding up, they quickly enter `GUARD`.
  - This makes front pressure less free.
- Boss front guard does not draw flipped text.

### Mid Boss Variants

- Mid Boss A:
  - `variant: "charge"`
  - uses `CHARGE`.
- Mid Boss B:
  - `variant: "shock"`
  - uses `SHOCK`.
- Mid Boss C:
  - `variant: "jump"`
  - uses `JUMP`.
- Mid Boss D:
  - `variant: "knife"`
  - uses `KNIFE`.
  - throws fan-shaped knives.
- Mid Boss E:
  - `variant: "summon"`
  - uses `CALL`.
  - summons regular enemies from the left and right.
  - Easy: keeps up to 3 summoned melee enemies.
  - Normal: keeps up to 3 summoned knife enemies.
  - Hard: keeps up to 5 summoned knife/gunner enemies.
  - The boss does not summon again while summoned enemies are alive.
  - After all summoned enemies are defeated, the boss waits 10 seconds before it can summon again.

### Knife Boss Technique

- Boss knife attack uses existing `enemy_knife` projectiles.
- Because it uses `enemy_knife`, the player can punch-intercept knives and convert them into knife items using existing rules.
- Mid Boss D throws 3 knives.
- Major boss throws:
  - Easy: 3 knives
  - Normal: 5 knives
  - Hard: 7 knives, slightly faster

### Player Character Selection

- Title screen now lets the player choose:
  - `PETIMAN`
  - `ROOEEBEE`
- Player drawing uses the selected character's PNG sprites before falling back to the old Canvas shape.
- Copied player sprites live in `assets/sprites/player/`.
- Both characters currently share the same stats:
  - HP: 100
  - speed: 245
- Future character performance differences should start from `PLAYER_CHARACTERS`.
- Character-specific sprite size overrides can use `spriteHeights`; ROOEEBEE's KO sprite is currently half-size.
- HUD now shows the selected character's face icon and name.
- Collision, attack range, movement speed, and controls are unchanged for now.
- Respawn invincibility still lasts 3 seconds, but no longer forces the damage sprite.
- Normal damage invincibility keeps its duration, but the damage sprite is only shown briefly.

### Enemy Sprite Replacement

- Enemy sprite folder is `assets/sprites/enemy/`.
- Current general enemy sprite replacements:
  - `assets/sprites/enemy/general/slow_puncher_idle.png`
  - `assets/sprites/enemy/general/slow_puncher_move.png`
  - `assets/sprites/enemy/general/slow_puncher_attack.png`
  - `assets/sprites/enemy/general/slow_puncher_damage.png`
  - `assets/sprites/enemy/general/slow_puncher_ko.png`
  - `assets/sprites/enemy/general/knife_thrower_idle.png`
  - `assets/sprites/enemy/general/knife_thrower_move.png`
  - `assets/sprites/enemy/general/knife_thrower_throw.png`
  - `assets/sprites/enemy/general/knife_thrower_damage.png`
  - `assets/sprites/enemy/general/knife_thrower_ko.png`
  - `assets/sprites/enemy/general/gunner_idle.png`
  - `assets/sprites/enemy/general/gunner_move.png`
  - `assets/sprites/enemy/general/gunner_shoot.png`
  - `assets/sprites/enemy/general/gunner_damage.png`
  - `assets/sprites/enemy/general/gunner_ko.png`
- Green `#11ef1a` style backgrounds were converted to transparency.
- General enemies fall back to the old Canvas shapes if image loading fails.
- `sprite-height-compare.html` compares PETIMAN, ROOEEBEE, and current enemy idle/KO sizes with normal enemy and KO enemy sliders.
- Enemy definitions in `ENEMY_SPRITE_DEFS` have separate `spriteHeight` and `koSpriteHeight` values.
- `sprite-height-compare.html` now has per-enemy sliders for each normal sprite and each KO sprite.
- A reusable Codex skill exists at `~/.codex/skills/enemy-sprite-size-tuner/SKILL.md` for future sprite size tuning.
- Current general enemy visual sizes:
  - `slow_puncher`: `spriteHeight: 139`, `koSpriteHeight: 86`
  - `knife_thrower`: `spriteHeight: 139`, `koSpriteHeight: 69`
  - `gunner`: `spriteHeight: 139`, `koSpriteHeight: 86`
- Image-based general enemy HP bars are drawn near the feet so larger sprites do not cover the bar.

## Boss Schedule

Boss appearance and debug start buttons are generated from one table in `main.js`.

Edit only `BOSS_SCHEDULE` when changing boss Areas or labels:

```js
const BOSS_SCHEDULE = [
  { area: 5, rank: "mid", variant: "charge", debugLabel: "中ボスA" },
  { area: 10, rank: "mid", variant: "shock", debugLabel: "中ボスB" },
  { area: 15, rank: "mid", variant: "jump", debugLabel: "中ボスC" },
  { area: 20, rank: "major", variant: "all", debugLabel: "大ボス" },
  { area: 25, rank: "mid", variant: "knife", debugLabel: "中ボスD" },
  { area: 30, rank: "mid", variant: "summon", debugLabel: "中ボスE" },
];
```

This table controls both:

- Actual boss spawning in `spawnWave()`.
- Title-screen debug start buttons in `buildDebugStartButtons()`.

## Useful Code Locations

- `index.html`
  - title overlay
  - difficulty area
  - debug start button container
  - cache-busted CSS/JS references
- `style.css`
  - `.title-overlay`
  - `.character-actions`
  - `.character-button`
  - `.difficulty-actions`
  - `.debug-start-actions`
  - `.start-button`
- `main.js`
  - `PLAYER_CHARACTERS`
  - `currentPlayerCharacterKey`
  - `ENEMY_SPRITE_DEFS`
  - `enemySprites`
  - `DIFFICULTY_SETTINGS`
  - `MID_BOSS_ENEMY`
  - `MAJOR_BOSS_ENEMY`
  - `BOSS_SCHEDULE`
  - `buildDebugStartButtons()`
  - `spawnWave()`
  - `createMidBossEnemy()`
  - `createMajorBossEnemy()`
  - `chooseBossAttackType()`
  - `startMidBossAttack()`
  - `throwBossKnives()`
  - `summonBossEnemies()`
  - `canBossStartSummon()`
  - `updateBossSummonCooldown()`
  - `getBossSummonCount()`
  - `getBossSummonTypes()`
  - `getMajorBossKnifeCount()`
  - `buildCharacterButtons()`
  - `selectPlayerCharacter()`
  - `updatePlayerIdentityHud()`
  - `loadSpriteImages()`
  - `drawPlayerSprite()`
  - `drawFallbackPlayer()`
  - `drawEnemySprite()`
  - `getEnemySpriteKey()`
  - `majorBossIntroTimer`
  - `screenShakeTimer`

## Verification From This Session

- Current pushed state:
  - branch: `main...origin/main`
  - latest pushed commit: `67a12d3 Add player character selection`
  - remaining untracked folders only: `.playwright-cli/`, `output/`
- Added major boss-only entry presentation.
- Added Mid Boss E summon behavior.
- Tuned Mid Boss E so summon waves must be defeated before a 10-second resummon cooldown starts.
- Added first-stage player sprite replacement using copied `petiman` PNGs.
- Respawn invincibility now keeps normal idle/move/attack sprites instead of showing `petiman-damage.png` for 3 seconds.
- HP 0 now uses `petiman-ko.png` until the revive/continue flow starts.
- Normal damage now shows `petiman-damage.png` briefly, then returns to idle/move/attack sprites during the remaining invincibility.
- Added title-screen player character selection for `PETIMAN` and `ROOEEBEE`.
- HUD now shows the selected character's face icon and name.
- Added `PLAYER_CHARACTERS` as the future entry point for character stat differences.
- Added a ROOEEBEE-only KO sprite height override so the KO graphic draws at about half size.
- Added first enemy sprite replacement for `slow_puncher`.
- Converted `slow_puncher`, `knife_thrower`, and `gunner` enemy sprites from green background to transparent PNGs.
- Added enemy sprite replacement for `knife_thrower` and `gunner`.
- HP 0 enemies now keep a short KO display timer so the KO sprite is visible before removal.
- Added `sprite-height-compare.html` for visual size tuning.
- Added separate `koSpriteHeight` support for enemy KO images.
- Applied tuned enemy sizes from comparison page: normal `139px`, KO `86px`, knife thrower KO `69px`.
- Moved image-based general enemy HP bars from chest height to foot height.
- Bumped browser cache references in `index.html` from `v=66` to `v=67`.
- Last verification before push:
  - `node --check main.js` passed.
  - `git diff --check` passed.
  - Local server responded on `http://127.0.0.1:4174/?v=62`.

## Verification From Last Session

- `node --check main.js` passed.
- `git diff --check` passed.
- Local server responded on `http://127.0.0.1:4174/?v=52`.
- Last pushed branch state was synchronized with `origin/main`.
- Playwright was not used in the latest work.

## Suggested Next Steps

- Decide the next image replacement target:
  - normal enemies
  - mid bosses / major boss
  - background
  - attack and projectile effects
- If continuing character work:
  - consider character-specific stats in `PLAYER_CHARACTERS`
  - consider LocalStorage later for selected character and difficulty
- If testing first:
  - iPhone feel-test PETIMAN / ROOEEBEE selection and ROOEEBEE KO size
  - use debug start buttons to check boss fights with both characters
- Consider LocalStorage later for difficulty or progress.

## Before Continuing

Run:

```sh
git status --short --branch
```

Then, if iPhone testing is needed, ensure the server is running:

```sh
python3 -m http.server 4174 --bind 0.0.0.0
```

If browser-facing files changed, bump cache busters in `index.html` and open:

```text
http://192.168.0.49:4174/?v=<new-number>
```
