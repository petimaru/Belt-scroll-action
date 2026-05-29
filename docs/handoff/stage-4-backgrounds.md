# Stage 4 Background Handoff

Date: 2026-05-29

## Scope

Created and implemented all Stage 4 backgrounds for the Yokohama Kannai route:

1. Stage 4-1: Yokohama Kannai station front
2. Stage 4-2: Yokohama Stadium front
3. Stage 4-3: Odori Park stone plaza
4. Stage 4-4: Odori Park stone plaza second route
5. Stage 4-5: Yokohama Budokan-style boss area

## Gameplay Contract

- Final game screen: `960x540`
- Walkable combat lane: `y=300..452`
- Backgrounds are baked raster images only.
- Gameplay logic, enemy logic, collision, and walkable lane values were not modified.

## Runtime Assets

- `assets/maps/stage-4/stage-4-1.png`
- `assets/maps/stage-4/stage-4-2.png`
- `assets/maps/stage-4/stage-4-3.png`
- `assets/maps/stage-4/stage-4-4.png`
- `assets/maps/stage-4/stage-4-5.png`

Prompt notes:

- `assets/maps/stage-4/stage-4-prompts.md`

Preview:

- `stage-4-background-preview.html`

## QA Notes

- All accepted images are `960x540` PNGs.
- Stage 4 is wired through `STAGE_BACKGROUND_SPRITES` and `getStageBackgroundSprite()`.
- Stage 4 uses the same `stageNAreaM` lookup pattern as Stage 1, Stage 2, and Stage 3.
- The first generated direction was rejected because it looked too bright and inconsistent with Stage 1-3.
- Accepted images were regenerated to match the existing night, wet pavement, saturated lighting, 32-bit arcade mood.
- Final images were shifted upward slightly after lane review so buildings, planters, and venue fronts stay above the playable combat lane.
- All references were fictionalized: no readable real signage or exact logos were intentionally preserved.

## Verification

```sh
node --check main.js
git diff --check
curl -I 'http://127.0.0.1:4177/?v=100'
curl -I 'http://127.0.0.1:4177/stage-4-background-preview.html'
```

Manual browser checks:

- Open `http://127.0.0.1:4177/?v=100`
- Start Stage 4 from Stage Select
- Confirm areas 4-1 through 4-5 load the matching backgrounds
- Open `http://127.0.0.1:4177/stage-4-background-preview.html`
- Use the Lane overlay to confirm `y=300..452` remains clear
