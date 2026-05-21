# Current Handoff

> Temporary handoff note for continuing development.
> Source of truth is the code and Git history. If this file conflicts with code, trust the code.
> Last updated: 2026-05-21

## New Chat Instruction

Copy and paste this into the next chat:

```md
/Users/takedakouji/Documents/Belt scroll action/docs/handoff/current.md を読んで、続きを進めてください。

まず現在のgit状態とローカルサーバー状態を確認してください。

前回は、Mid Boss C / jump variant のPNG差し替え、jump攻撃のpress画像固定、近距離攻撃画像の割り当て、足元影とのズレ調整、cache buster `v=83` への更新まで実装しました。

次は画像差し替えの続きを進めたいです。まず現状コードとこのhandoffを読んで、変更前に前提・変更予定ファイル・変更しない範囲・確認方法を短く説明してください。
```

## Project

- Workspace: `/Users/takedakouji/Documents/Belt scroll action`
- GitHub: `https://github.com/petimaru/Belt-scroll-action.git`
- Branch: `main`
- Latest pushed commit: `1fea991 Add mid boss shock sprites`
- Current cache buster: `v=83`
- iPhone test URL when server is running: `http://192.168.0.49:4174/?v=83`
- Local server command: `python3 -m http.server 4174 --bind 0.0.0.0`
- Current server status at handoff update: running on port 4174
- Known untracked folders:
  - `.playwright-cli/`
  - `output/`
  - `tmp/`
  - These were not committed intentionally.
- Known untracked experimental files:
  - `assets/sprites/enemy/mid_boss/mid_boss_charge_walk_1.png`
  - `assets/sprites/enemy/mid_boss/mid_boss_charge_walk_2.png`
  - `assets/sprites/enemy/mid_boss/mid_boss_charge_walk_3.png`
  - `assets/sprites/enemy/mid_boss/mid_boss_charge_walk_4.png`
  - `mid-boss-walk-compare.html`
  - `mid-boss-walk-transform-compare.html`
  - These are old walk-animation experiments and were not pushed.

## Current State

- HTML/CSS/JavaScript + Canvas belt-scroll action game.
- iPhone landscape play is important.
- Controls:
  - Left half drag: move
  - Right half tap: normal attack
  - Right half upward flick: jump
  - Right half downward flick: special attack
  - Right half long press: super special attack
  - Tap while jumping: jump kick
- Defeat required enemies to open the right-side gate.
- Move to the right edge after gate opens to enter the next Area.
- Continue screen exists with countdown.
- Jump avoids normal attacks, knives, bullets, bike rushes, and boss radial attacks.

## What Was Done Recently

- Player sprites:
  - PETIMAN and ROOEEBEE are selectable on the title screen.
  - HUD shows selected face icon and name.
  - Both characters currently share HP 100 and speed 245.
  - `PLAYER_CHARACTERS` is the entry point for future character stat differences.
  - ROOEEBEE KO image has a size override.
  - Respawn invincibility no longer forces the damage sprite for 3 seconds.
  - Normal damage briefly shows damage art, then returns to idle/move/attack art during remaining invincibility.
  - Normal combo finisher, combo step 3, uses character-specific lariat art:
    - `assets/sprites/player/petiman-lariat.png`
    - `assets/sprites/player/rooeeebee-lariat.png`
  - Combo damage, range, timing, and hit behavior were not changed.

- General enemy sprites:
  - `slow_puncher`, `knife_thrower`, `gunner`, and `bike_rusher` now have PNG sprite replacements.
  - Green-screen backgrounds were converted to transparency.
  - Image loading failure falls back to old Canvas drawing.
  - HP 0 enemies keep a short KO display timer before removal.
  - Enemy HP bars for image-based enemies are drawn near the feet, not across the body.

- Bike rusher:
  - `bike_rusher_idle.png` is used for warning state.
  - `bike_rusher_move.png` is used for rush/attack state.
  - `bike_rusher_damage.png` is used for hit flash.
  - `bike_rusher_ko.png` is used for KO.

- Boss sprites:
  - Mid boss now uses SVG image assets before falling back to the old Canvas drawing.
  - Major boss now uses SVG image assets before falling back to the old Canvas drawing.
  - Mid Boss A / charge variant now uses PNG image assets:
    - idle and move share `mid_boss_charge_idle.png` / `mid_boss_charge_move.png`
    - attack1: close-range SMASH windup
    - attack2: close-range SMASH active
    - chargeWindup: CHARGE windup
    - charge: rushing body attack
    - guard: shown during GUARD even when hit
    - damage: shown only when not guarding
    - ko: unchanged HP 0 image
  - Mid Boss B / shock variant now uses PNG image assets:
    - idle and move share `mid_boss_shock_idle.png` / `mid_boss_shock_move.png`
    - windup: attack windup pose
    - attack: close-range attack
    - shock: radial shock attack
    - guard: shown during GUARD even when hit
    - damage: shown only when not guarding
    - ko: HP 0 image
  - Mid Boss B shock range attack uses a runtime 4-frame windmill transform:
    - `frameMs: 60`
    - `spin: 5`
    - `slide: 7`
    - `squash: 0.005`
  - Mid Boss C / jump variant now uses PNG image assets:
    - idle and move share `mid_boss_jump_idle.png` / `mid_boss_jump_move.png`
    - charge: jump windup
    - attack: close-range attack active
    - press: jump attack active, including both the jump and press portions
    - guard: shown during GUARD even when hit
    - damage: shown only when not guarding
    - ko: HP 0 image
  - Boss HUD and attack/guard labels stay separate from flipped sprite drawing.
  - Collision, HP, speed, AI, attack ranges, and boss behavior were not changed.

- Boss aura:
  - Boss text labels `SMASH`, `CHARGE`, and `GUARD` are no longer drawn above the boss.
  - Boss guard damage no longer creates a floating `GUARD` text.
  - Boss aura colors:
    - SMASH / non-charge/non-shock attacks: yellow
    - CHARGE and SHOCK: red
    - GUARD: blue
  - Current in-game aura style is `Flame columns`, controlled by `BOSS_AURA_STYLE = "flame"` in `main.js`.
  - Current in-game aura settings are `intensity: 2.4`, `width: 188`, `height: 360`.
  - The in-game Flame drawing was aligned with `boss-aura-compare.html`; earlier mismatch was because the compare page and game used different drawing functions.

- Mid Boss A walk transform:
  - Uses the existing single idle/move image; no new walk art is required for the actual game runtime.
  - Applied only while the boss is visually moving and using the `move` sprite.
  - Does not apply during attack, guard, damage, or KO states.
  - Current values are in `MID_BOSS_CHARGE_WALK_TRANSFORM`:
    - `speed: 0.9`
    - `bob: 1`
    - `squash: 0.005`
    - `sway: 1`
    - `tilt: 0.25`
  - `sprite-height-compare.html` includes three visual candidates:
    - Flame columns
    - Rising rings
    - Veil waves
  - `boss-aura-compare.html` is the focused aura tuning page.
    - It uses `assets/sprites/enemy/mid_boss/mid_boss_aura_preview_idle.png`.
    - It has sliders for aura intensity, width, and height.
    - It has color buttons for yellow, red, and blue.

- Enemy size tuning:
  - `sprite-height-compare.html` exists at project root.
  - It compares PETIMAN, ROOEEBEE, enemy idle sprites, bike rusher, boss sprites, and KO sprites.
  - It has per-enemy sliders for normal and KO sizes.
  - Reusable local skill exists at `~/.codex/skills/enemy-sprite-size-tuner/SKILL.md`.

- Boss system:
  - Boss schedule is table-driven via `BOSS_SCHEDULE`.
  - Mid Boss A: charge
  - Mid Boss B: shock
  - Mid Boss C: jump
  - Major Boss: all current mid-boss techniques
  - Mid Boss D: knife
  - Mid Boss E: summon
  - Mid Boss E waits until summoned enemies are defeated, then waits 10 seconds before summoning again.

## Sprite Assets

Enemy sprite folder: `assets/sprites/enemy/general/`

Current image-backed enemies:

- `slow_puncher`
  - `slow_puncher_idle.png`
  - `slow_puncher_move.png`
  - `slow_puncher_attack.png`
  - `slow_puncher_damage.png`
  - `slow_puncher_ko.png`
- `knife_thrower`
  - `knife_thrower_idle.png`
  - `knife_thrower_move.png`
  - `knife_thrower_throw.png`
  - `knife_thrower_damage.png`
  - `knife_thrower_ko.png`
- `gunner`
  - `gunner_idle.png`
  - `gunner_move.png`
  - `gunner_shoot.png`
  - `gunner_damage.png`
  - `gunner_ko.png`
- `bike_rusher`
  - `bike_rusher_idle.png`
  - `bike_rusher_move.png`
  - `bike_rusher_damage.png`
  - `bike_rusher_ko.png`

Boss sprite folders:

- `assets/sprites/enemy/mid_boss/`
  - `mid_boss_idle.svg`
  - `mid_boss_attack.svg`
  - `mid_boss_damage.svg`
  - `mid_boss_ko.svg`
  - `mid_boss_charge_idle.png`
  - `mid_boss_charge_move.png`
  - `mid_boss_charge_attack1.png`
  - `mid_boss_charge_attack2.png`
  - `mid_boss_charge_charge_windup.png`
  - `mid_boss_charge_charge.png`
  - `mid_boss_charge_guard.png`
  - `mid_boss_charge_damage.png`
  - `mid_boss_charge_ko.png`
  - `mid_boss_shock_idle.png`
  - `mid_boss_shock_move.png`
  - `mid_boss_shock_windup.png`
  - `mid_boss_shock_attack.png`
  - `mid_boss_shock_shock.png`
  - `mid_boss_shock_guard.png`
  - `mid_boss_shock_damage.png`
  - `mid_boss_shock_ko.png`
  - `mid_boss_jump_idle.png`
  - `mid_boss_jump_move.png`
  - `mid_boss_jump_charge.png`
  - `mid_boss_jump_attack.png`
  - `mid_boss_jump_press.png`
  - `mid_boss_jump_guard.png`
  - `mid_boss_jump_damage.png`
  - `mid_boss_jump_ko.png`
- `assets/sprites/enemy/major_boss/`
  - `major_boss_idle.svg`
  - `major_boss_attack.svg`
  - `major_boss_damage.svg`
  - `major_boss_ko.svg`

Current enemy visual sizes in `ENEMY_SPRITE_DEFS`:

- `slow_puncher`: `spriteHeight: 139`, `koSpriteHeight: 86`
- `knife_thrower`: `spriteHeight: 139`, `koSpriteHeight: 69`
- `gunner`: `spriteHeight: 139`, `koSpriteHeight: 86`
- `bike_rusher`: `spriteHeight: 118`, `koSpriteHeight: 82`
- `mid_boss_brawler`: `spriteHeight: 142`, `koSpriteHeight: 88`
- `mid_boss_charge`: `spriteHeight: 172`, `koSpriteHeight: 140`
  - SMASH windup `attack1` has separate `spriteHeights.attack1: 220` because the raised-arm image looked smaller at the same base height.
- `mid_boss_shock`: `spriteHeight: 172`, `koSpriteHeight: 140`
  - `windup: 188`
  - `shock: 190`
- `mid_boss_jump`: `spriteHeight: 224`, `koSpriteHeight: 182`
  - `attack: 190`
  - `press: 190`
  - `footOffsetY: 64`
- `major_boss_brawler`: `spriteHeight: 150`, `koSpriteHeight: 96`

## Useful Code Locations

- `index.html`
  - title overlay
  - difficulty area
  - debug start buttons
  - cache-busted CSS/JS references
- `style.css`
  - title and HUD styling
  - character select buttons
  - difficulty/start buttons
- `main.js`
  - `PLAYER_CHARACTERS`
  - `ENEMY_SPRITE_DEFS`
  - `enemySprites`
  - `BOSS_SCHEDULE`
  - `DIFFICULTY_SETTINGS`
  - `loadSpriteImages()`
  - `drawPlayerSprite()`
  - `drawEnemySprite()`
  - `getEnemySpriteKey()`
  - `drawBikeEnemy()`
  - `summonBossEnemies()`
  - `canBossStartSummon()`
  - `updateBossSummonCooldown()`

## Current Git And Server Notes

- Last checked status:
  - `main...origin/main`
  - no committed-code changes after latest push
  - untracked: old walk-animation experiment files plus known `.playwright-cli/`, `output/`, `tmp/`
- Last pushed commit:
  - `1fea991 Add mid boss shock sprites`
- Server was running on port 4174 when this handoff was updated.
- Start server before iPhone testing:

```sh
python3 -m http.server 4174 --bind 0.0.0.0
```

Then open:

```text
http://192.168.0.49:4174/?v=83
```

Sprite comparison page:

```text
http://192.168.0.49:4174/sprite-height-compare.html
```

Boss aura comparison page:

```text
http://192.168.0.49:4174/boss-aura-compare.html
```

## Verification Commands

Run after code changes:

```sh
node --check main.js
git diff --check
git status --short --branch
```

If server is running:

```sh
curl -I 'http://127.0.0.1:4174/?v=83'
curl -I 'http://127.0.0.1:4174/sprite-height-compare.html'
curl -I 'http://127.0.0.1:4174/boss-aura-compare.html'
curl -I 'http://127.0.0.1:4174/assets/sprites/enemy/mid_boss/mid_boss_charge_idle.png'
curl -I 'http://127.0.0.1:4174/assets/sprites/enemy/mid_boss/mid_boss_shock_idle.png'
curl -I 'http://127.0.0.1:4174/assets/sprites/enemy/mid_boss/mid_boss_jump_idle.png'
curl -I 'http://127.0.0.1:4174/assets/sprites/enemy/mid_boss/mid_boss_idle.svg'
curl -I 'http://127.0.0.1:4174/assets/sprites/enemy/major_boss/major_boss_idle.svg'
```

## Attention Points

- Do not use Playwright unless the user explicitly says to use Playwright.
- Keep changes small and beginner-friendly.
- Do not change collision, attack ranges, enemy HP, speed, or AI when the task is only image replacement.
- When adding image-backed enemies, preserve Canvas fallback.
- For new green-background assets, convert the background to transparency before committing.
- For image size tuning, use `sprite-height-compare.html` and update `spriteHeight` / `koSpriteHeight`.
- If `index.html` references `style.css?v=N` and `main.js?v=N`, bump both numbers together after browser-facing changes.
- Do not draw text inside a flipped Canvas transform. Boss labels and warning text should stay unflipped.
- `.playwright-cli/`, `output/`, and `tmp/` are intentionally untracked unless the user asks otherwise.

## Suggested Next Steps

- Continue image replacement in this order unless the user chooses otherwise:
  1. Play-test Mid Boss C / jump image sizes, state switching, and press timing.
  2. Play-test Mid Boss B / shock image sizes, state switching, and shock windmill transform.
  3. Play-test Mid Boss A / charge with `spriteHeight: 172`, `koSpriteHeight: 140`, tuned Flame columns aura, and walk transform.
  4. Replace other mid boss variants with PNG art.
  5. Improve or replace major boss art.
  6. Background
  7. Attack/projectile effects
  8. Items/breakables
- Consider LocalStorage later for selected character and difficulty.
