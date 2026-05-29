# Current Handoff

> Temporary handoff note for continuing development.
> Source of truth is the code and Git history. If this file conflicts with code, trust the code.
> Last updated: 2026-05-29

## New Chat Instruction

Copy and paste this into the next chat:

```md
/Users/takedakouji/Documents/Belt scroll action/docs/handoff/current.md を読んで、続きを進めてください。

まず現在のgit状態とローカルサーバー状態を確認してください。

前回は、Stage 5-1〜5-5 の東京・水道橋/後楽園ルート背景を作成し、本編へ差し替えました。cache buster は `v=101` です。まだコミット/プッシュ前なら、作業対象ファイルだけを確認してから stage してください。

次は Stage 5 のMac/iPhone確認、または Stage 6 背景差し替えを進めたいです。まず現状コードとこのhandoffを読んで、変更前に前提・変更予定ファイル・変更しない範囲・確認方法を短く説明してください。
```

## Project

- Workspace: `/Users/takedakouji/Documents/Belt scroll action`
- GitHub: `https://github.com/petimaru/Belt-scroll-action.git`
- Branch: `main`
- Latest pushed commit: `c73e7ed Add stage four backgrounds`
- Current cache buster: `v=101`
- iPhone test URL when server is running on the current working port: `http://192.168.0.49:4177/?v=101`
- Local server command for the current working port: `python3 -m http.server 4177 --bind 0.0.0.0`
- Current server status at handoff update: port 4177 is running and returns `200 OK`; ports 4174 and 4176 had Python listeners but returned an empty response, so prefer 4177.
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
- 5 Areas are grouped as 1 Stage.
- Title flow is character selection / difficulty selection, then Stage Select.
- Stage 1〜5 are selectable from the start:
  - Stage 1: Areas 1〜5, Mid Boss A
  - Stage 2: Areas 6〜10, Mid Boss B
  - Stage 3: Areas 11〜15, Mid Boss C
  - Stage 4: Areas 16〜20, Mid Boss D
  - Stage 5: Areas 21〜25, Mid Boss E
- Stage 6 is locked until Stage 1〜5 are cleared:
  - Stage 6: Areas 26〜30, Major Boss
- Defeating the Major Boss completes the game.
- All stages share the same gameplay walkable lane:
  - `WALKABLE_LANE.top: 300`
  - `WALKABLE_LANE.bottom: 452`
  - Player, enemies, boss targets, items, breakables, and ranged repositioning clamp to this lane.
  - The lane is intentionally lower/narrower than the full drawn floor, so characters stay grounded on the foreground pavement and do not appear to float in the distant alley.
- Stage 1 background images are wired into `main.js`:
  - Area 1: `assets/maps/stage-1-walkable/stage-1-1.png`
  - Area 2: `assets/maps/stage-1-walkable/stage-1-2.png`
  - Area 3: `assets/maps/stage-1-walkable/stage-1-3.png`
  - Area 4: `assets/maps/stage-1-walkable/stage-1-4.png`
  - Area 5 boss area: `assets/maps/stage-1-walkable/stage-1-5.png`
  - 1-1, 1-4, and 1-5 were shifted upward by about 10% after editing so the top of the walkable lane does not visually collide with buildings/crowds.
- Stage 2 background images are wired into `main.js`:
  - Area 1: `assets/maps/stage-2/stage-2-1.png`
  - Area 2: `assets/maps/stage-2/stage-2-2.png`
  - Area 3: `assets/maps/stage-2/stage-2-3.png`
  - Area 4: `assets/maps/stage-2/stage-2-4.png`
  - Area 5 boss area: `assets/maps/stage-2/stage-2-5.png` (revised to match the user's Shinkiba 1st RING reference photo: dark warehouse frontage, large shutter doors, open plaza)
  - Theme: Shinkiba wrestling district, progressing from warehouses to venue front.
  - QA report: `docs/handoff/stage-2-backgrounds.md`
  - Preview page: `stage-2-background-preview.html`
- Stage 3 background images are wired into `main.js`:
  - Area 1: `assets/maps/stage-3/stage-3-4.png`
  - Area 2: `assets/maps/stage-3/stage-3-1.png`
  - Area 3: `assets/maps/stage-3/stage-3-3.png`
  - Area 4: `assets/maps/stage-3/stage-3-2.png`
  - Area 5 boss area: `assets/maps/stage-3/stage-3-5.png`
  - Theme: Ryogoku wrestling district, progressing from station/front route to Kokugikan front.
  - QA report: `docs/handoff/stage-3-backgrounds.md`
  - Preview page: `stage-3-background-preview.html`
  - 3-2, 3-3, and 3-5 were shifted upward by about 10% after user review so buildings do not visually enter the walkable lane.
  - Display order was changed after user review: `3-4`, `3-1`, `3-3`, `3-2`, `3-5`.
- Stage 4 background images are wired into `main.js`:
  - Area 1: `assets/maps/stage-4/stage-4-1.png`
  - Area 2: `assets/maps/stage-4/stage-4-2.png`
  - Area 3: `assets/maps/stage-4/stage-4-3.png`
  - Area 4: `assets/maps/stage-4/stage-4-4.png`
  - Area 5 boss area: `assets/maps/stage-4/stage-4-5.png`
  - Theme: Yokohama Kannai route, progressing from Kannai station to a Yokohama Budokan-style boss venue.
  - QA report: `docs/handoff/stage-4-backgrounds.md`
  - Preview page: `stage-4-background-preview.html`
  - The first generated direction was rejected because it was too bright and inconsistent with Stage 1〜3. Accepted images use night, wet pavement, saturated lighting, and 32-bit arcade mood.
- Stage 5 background images are wired into `main.js`:
  - Area 1: `assets/maps/stage-5/stage-5-1.png`
  - Area 2: `assets/maps/stage-5/stage-5-2.png`
  - Area 3: `assets/maps/stage-5/stage-5-3.png`
  - Area 4: `assets/maps/stage-5/stage-5-4.png`
  - Area 5 boss area: `assets/maps/stage-5/stage-5-5.png`
  - Theme: Tokyo Suidobashi / Korakuen route, progressing from station west exit to a Korakuen Hall-style boss entrance.
  - QA report: `docs/handoff/stage-5-backgrounds.md`
  - Preview page: `stage-5-background-preview.html`
  - Accepted images use night, wet pavement, saturated lighting, and 32-bit arcade mood to match Stage 1〜4.
  - Stage 6 still uses the old Canvas gradient backgrounds.
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
  - Mid Boss D / knife variant now uses PNG image assets:
    - idle and move share `mid_boss_knife_idle.png` / `mid_boss_knife_move.png`
    - charge: knife throw / close-range attack windup
    - throw: knife throw active
    - attack: close-range attack active
    - guard: shown during GUARD even when hit
    - damage: shown only when not guarding
    - ko: HP 0 image
  - Mid Boss E / summon variant now uses PNG image assets:
    - idle and move share `mid_boss_summon_idle.png` / `mid_boss_summon_move.png`
    - attack: close-range attack active
    - call: summon windup and summon active
    - guard: shown during GUARD even when hit
    - damage: shown only when not guarding
    - ko: HP 0 image
    - no Charge sprite is used for this boss
    - close-range attack image is shown only during active damage timing, not during windup
  - Major Boss now uses PNG image assets:
    - idle and move share `major_boss_idle.png` / `major_boss_move.png`
    - charge: CHARGE windup
    - chargeAttack: CHARGE rushing active
    - attack: close-range attack active
    - shock: SHOCK windup and active
    - jumpPress: jump attack active
    - knifeThrow: knife throw active
    - summon: summon windup and active
    - guard: shown during GUARD even when hit
    - damage: shown only when not guarding
    - ko: HP 0 image
  - Major Boss can now use summon in addition to the current mid-boss techniques.
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
  - Major Boss comparison now includes idle, charge windup, charge attack, normal attack, shock, jump press, knife throw, summon, guard, damage, and KO sprites.
  - It has per-enemy sliders for normal and KO sizes.
  - Reusable local skill exists at `~/.codex/skills/enemy-sprite-size-tuner/SKILL.md`.

- Boss system:
  - Stage definitions live in `STAGE_DEFS`.
  - Boss schedule is generated from `STAGE_DEFS` into `BOSS_SCHEDULE`.
  - Mid Boss A: charge
  - Mid Boss B: shock
  - Mid Boss C: jump
  - Mid Boss D: knife
  - Mid Boss E: summon
  - Major Boss: all current mid-boss techniques, including summon
  - Mid Boss E waits until summoned enemies are defeated, then waits 10 seconds before summoning again.

- Stage backgrounds:
  - `STAGE_BACKGROUND_SPRITES` loads Stage 1-1〜1-5, Stage 2-1〜2-5, and Stage 3-1〜3-5 background images.
  - `getStageBackgroundSprite()` selects the stage background by stage/local area number when an image exists.
  - `drawStageBackgroundImage()` draws the image with cover-crop and pixelated smoothing.
  - If image loading fails, `drawBackground()` falls back to the old gradient background.
  - `stage-1-1-bg-preview.html` remains a comparison page and is not used by the runtime.
  - Background generation rule: every future stage background prompt must be framed for the shared 960x540 gameplay walkable lane `y=300〜452`.
  - Future backgrounds should keep the lower foreground pavement between `y=300〜452` clear and visually grounded, with distant alley/floor detail above that range treated as background depth, not a playable lane.
  - Do not place blocking foreground props, doors, crates, vehicles, readable text, UI, actors, or enemies in the walkable lane unless they will be separate runtime objects.
  - The right-side exit area must align visually with this lane, and boss-area backgrounds should still leave a believable rightward route after the boss is defeated.
  - `drawExitGate()` now uses the shared 32-bit-style `GO→` sprite for all stages instead of the old light-blue ground marker.
  - Runtime asset: `assets/ui/exit-go/sheet-transparent.png`
  - Preview page: `go-arrow-preview.html`

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
  - `mid_boss_knife_idle.png`
  - `mid_boss_knife_move.png`
  - `mid_boss_knife_charge.png`
  - `mid_boss_knife_throw.png`
  - `mid_boss_knife_attack.png`
  - `mid_boss_knife_guard.png`
  - `mid_boss_knife_damage.png`
  - `mid_boss_knife_ko.png`
  - `mid_boss_summon_idle.png`
  - `mid_boss_summon_move.png`
  - `mid_boss_summon_attack.png`
  - `mid_boss_summon_call.png`
  - `mid_boss_summon_guard.png`
  - `mid_boss_summon_damage.png`
  - `mid_boss_summon_ko.png`
- `assets/sprites/enemy/major_boss/`
  - `major_boss_idle.png`
  - `major_boss_move.png`
  - `major_boss_charge.png`
  - `major_boss_charge_attack.png`
  - `major_boss_attack.png`
  - `major_boss_shock.png`
  - `major_boss_jump_press.png`
  - `major_boss_knife_throw.png`
  - `major_boss_summon.png`
  - `major_boss_guard.png`
  - `major_boss_damage.png`
  - `major_boss_ko.png`

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
- `mid_boss_knife`: `spriteHeight: 172`, `koSpriteHeight: 182`
  - `charge: 224`
  - `throw: 244`
  - `attack: 244`
  - `guard: 224`
  - `damage: 224`
- `mid_boss_summon`: `spriteHeight: 172`, `koSpriteHeight: 140`
  - `attack: 188`
  - `call: 188`
  - `damage: 188`
- `major_boss_brawler`: `spriteHeight: 170`, `koSpriteHeight: 140`
  - `charge: 190`
  - `chargeAttack: 205`
  - `attack: 190`
  - `shock: 205`
  - `jumpPress: 205`
  - `knifeThrow: 190`
  - `summon: 205`
  - `guard: 190`
  - `damage: 190`

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
  - stage select buttons
- `main.js`
  - `PLAYER_CHARACTERS`
  - `ENEMY_SPRITE_DEFS`
  - `enemySprites`
  - `STAGE_DEFS`
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
  - Stage 5 background files are currently part of the active working-tree change unless already committed
  - untracked: known experimental/background raw files plus known `.playwright-cli/`, `output/`, `tmp/`
- Last pushed commit:
  - `c73e7ed Add stage four backgrounds`
- Server was running on port 4177 when this handoff was updated.
- Ports 4174 and 4176 had Python listeners but returned an empty response, so use 4177 first.
- Start server before iPhone testing:

```sh
python3 -m http.server 4177 --bind 0.0.0.0
```

Then open:

```text
http://192.168.0.49:4177/?v=101
```

If port 4177 is busy or returns an empty response, use another free port, for example:

```sh
python3 -m http.server 4178 --bind 0.0.0.0
```

Then open:

```text
http://192.168.0.49:4178/?v=101
```

Sprite comparison page:

```text
http://192.168.0.49:4177/sprite-height-compare.html
```

Boss aura comparison page:

```text
http://192.168.0.49:4177/boss-aura-compare.html
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
curl -I 'http://127.0.0.1:4177/?v=101'
curl -I 'http://127.0.0.1:4177/stage-5-background-preview.html'
curl -I 'http://127.0.0.1:4177/assets/maps/stage-5/stage-5-1.png'
curl -I 'http://127.0.0.1:4177/assets/maps/stage-5/stage-5-5.png'
curl -I 'http://127.0.0.1:4177/sprite-height-compare.html'
curl -I 'http://127.0.0.1:4177/boss-aura-compare.html'
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

- Continue in this order unless the user chooses otherwise:
  1. Play-test Stage Select on Mac and iPhone.
  2. Confirm the shared walkable lane feels good on iPhone and Mac.
  3. Confirm the new 32-bit-style `GO→` exit display feels good on iPhone and Mac.
  4. Confirm Stage 1, Stage 2, Stage 3, Stage 4, and Stage 5 backgrounds on Mac and iPhone.
  5. Confirm Stage 1〜5 clear flow and Stage 6 unlock.
  6. Confirm Major Boss defeat shows game clear.
  7. Background image replacement for Stage 6 using the shared walkable-lane rule.
  8. Attack/projectile effects.
  9. Items/breakables.
- Consider LocalStorage later for selected character and difficulty.
