# Current Handoff

> This file is a temporary handoff note for continuing development.
> Source of truth is the code and README. If this file conflicts with code, trust the code.
> Last updated: 2026-05-09

## New Chat Instruction

Start the next chat with:

`/Users/takedakouji/Documents/Belt scroll action/docs/handoff/current.md を読んで、続きを進めてください。まず現在のgit状態とローカルサーバー状態を確認してください。`

## Project

- Workspace: `/Users/takedakouji/Documents/Belt scroll action`
- GitHub: `https://github.com/petimaru/Belt-scroll-action.git`
- Branch: `main`
- Latest pushed gameplay commit before this handoff file: `f768947 Add boss debug starts and schedule`
- Local server command for iPhone testing: `python3 -m http.server 4174 --bind 0.0.0.0`
- Current iPhone test URL at the time of writing: `http://192.168.0.49:4174/?v=52`
- Known untracked folders:
  - `.playwright-cli/`
  - `output/`
  - These were not committed intentionally.

## Important Working Rules

- Do not use Playwright unless the user explicitly says to use Playwright.
- For iPhone testing, update the URL cache buster such as `?v=53` when `index.html`, `main.js`, or `style.css` changes.
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

### Knife Boss Technique

- Boss knife attack uses existing `enemy_knife` projectiles.
- Because it uses `enemy_knife`, the player can punch-intercept knives and convert them into knife items using existing rules.
- Mid Boss D throws 3 knives.
- Major boss throws:
  - Easy: 3 knives
  - Normal: 5 knives
  - Hard: 7 knives, slightly faster

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
  - `.difficulty-actions`
  - `.debug-start-actions`
  - `.start-button`
- `main.js`
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
  - `getMajorBossKnifeCount()`

## Verification From Last Session

- `node --check main.js` passed.
- `git diff --check` passed.
- Local server responded on `http://127.0.0.1:4174/?v=52`.
- Last pushed branch state was synchronized with `origin/main`.
- Playwright was not used in the latest work.

## Suggested Next Steps

- Use debug start buttons on iPhone to feel-test:
  - Mid Boss A
  - Mid Boss B
  - Mid Boss C
  - Mid Boss D
  - Major Boss
- Tune Mid Boss D knife spread:
  - speed
  - spread angle
  - warning length
  - number of knives if needed
- Tune Major Boss knife attack:
  - Hard 7-knife pattern may be strong but fun.
  - Confirm it is hard without feeling unfair.
- Add major boss-only presentation:
  - entry warning
  - heavier landing or screen shake
  - stronger HP bar styling
- Consider adding small enemies during boss fights later.
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
