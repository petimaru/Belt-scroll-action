# Stage 2 Background Handoff

Date: 2026-05-25

## Scope

Created and implemented all Stage2 backgrounds for the Shinkiba wrestling district progression:

1. Stage 2-1: warehouse district entrance
2. Stage 2-2: container yard
3. Stage 2-3: canal waterfront
4. Stage 2-4: road approaching the venue
5. Stage 2-5: venue front boss area

Update: Stage 2-5 was revised after the first implementation using the user's Shinkiba 1st RING reference photo. The final asset keeps the real venue's black warehouse and shutter-door feeling, but stays fictionalized with no readable real signage.

## Gameplay Contract

- Final game screen: `960x540`
- Walkable combat lane: `y=300..452`
- Backgrounds are baked raster images only.
- Gameplay logic, enemy logic, collision, and walkable lane values were not modified.

## Runtime Assets

- `assets/maps/stage-2/stage-2-1.png`
- `assets/maps/stage-2/stage-2-2.png`
- `assets/maps/stage-2/stage-2-3.png`
- `assets/maps/stage-2/stage-2-4.png`
- `assets/maps/stage-2/stage-2-5.png`

Prompt notes:

- `assets/maps/stage-2/stage-2-prompts.md`

Preview:

- `stage-2-background-preview.html`

## QA Notes

- Stage2-3 first generation was rejected because railings entered the combat lane.
- Stage2-3 was regenerated with the canal railing moved behind the lane.
- All accepted images are `960x540` PNGs.
- Stage2 is wired through `STAGE_BACKGROUND_SPRITES` and `getStageBackgroundSprite()`.
- Stage2 uses the same `stageNAreaM` lookup pattern as Stage1.

## Verification

Run on the active local server. The normal port is `4174`; this session verified with `4175` because an old `4174` process returned an empty response.

```sh
node --check main.js
git diff --check
curl -I 'http://127.0.0.1:4174/?v=97'
curl -I 'http://127.0.0.1:4174/stage-2-background-preview.html'
```

Manual browser checks:

- Open `http://127.0.0.1:4174/?v=97`
- Start Stage 2 from Stage Select
- Confirm areas 2-1 through 2-5 load the matching backgrounds
- Open `http://127.0.0.1:4174/stage-2-background-preview.html`
- Use the Lane overlay to confirm `y=300..452` remains clear
