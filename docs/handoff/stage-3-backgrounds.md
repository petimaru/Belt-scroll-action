# Stage 3 Background Handoff

Date: 2026-05-25

## Scope

Created and implemented all Stage3 backgrounds for the Ryogoku wrestling district progression:

1. Stage 3-1: Sumida River promenade
2. Stage 3-2: Ryogoku station front
3. Stage 3-3: Edo-style shopping street
4. Stage 3-4: Kokugikan approach street
5. Stage 3-5: Ryogoku Kokugikan front boss area

## Gameplay Contract

- Final game screen: `960x540`
- Walkable combat lane: `y=300..452`
- Backgrounds are baked raster images only.
- Gameplay logic, enemy logic, collision, and walkable lane values were not modified.

## Runtime Assets

- `assets/maps/stage-3/stage-3-1.png`
- `assets/maps/stage-3/stage-3-2.png`
- `assets/maps/stage-3/stage-3-3.png`
- `assets/maps/stage-3/stage-3-4.png`
- `assets/maps/stage-3/stage-3-5.png`

Prompt notes:

- `assets/maps/stage-3/stage-3-prompts.md`

Preview:

- `stage-3-background-preview.html`

## QA Notes

- All accepted images are `960x540` PNGs.
- Stage3 is wired through `STAGE_BACKGROUND_SPRITES` and `getStageBackgroundSprite()`.
- Stage3 uses the same `stageNAreaM` lookup pattern as Stage1 and Stage2.
- Stage3-4 was regenerated after rejecting a railing-heavy direction, because railings could conflict with the walkable lane.
- Stage3-2, Stage3-3, and Stage3-5 were shifted upward by about 10% after user review so background buildings stay clearer of the walkable lane.
- Display order was changed after user review: `3-4`, `3-1`, `3-3`, `3-2`, `3-5`.
- All references were fictionalized: no readable real signage or exact logos were intentionally preserved.

## Verification

Run on the active local server. In this session, ports `4174` and `4175` returned an empty response, so verification used a fresh server on `4176`.

```sh
node --check main.js
git diff --check
curl -I 'http://127.0.0.1:4176/?v=99'
curl -I 'http://127.0.0.1:4176/stage-3-background-preview.html'
```

Manual browser checks:

- Open `http://127.0.0.1:4176/?v=99`
- Start Stage 3 from Stage Select
- Confirm areas 3-1 through 3-5 load the matching backgrounds
- Open `http://127.0.0.1:4176/stage-3-background-preview.html`
- Use the Lane overlay to confirm `y=300..452` remains clear
