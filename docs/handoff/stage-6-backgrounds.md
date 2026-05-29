# Stage 6 Background Handoff

Date: 2026-05-29

## Scope

Created and implemented all Stage 6 backgrounds for the Tokyo Dome final route:

1. Stage 6-1: Dome city restaurant front
2. Stage 6-2: Dome concourse gate
3. Stage 6-3: Dome concourse stairs
4. Stage 6-4: Dome city plaza
5. Stage 6-5: Final dome boss plaza

## Gameplay Contract

- Final game screen: `960x540`
- Walkable combat lane: `y=300..452`
- Backgrounds are baked raster images only.
- Gameplay logic, enemy logic, collision, stage unlock, major boss behavior, and walkable lane values were not modified.

## Runtime Assets

- `assets/maps/stage-6/stage-6-1.png`
- `assets/maps/stage-6/stage-6-2.png`
- `assets/maps/stage-6/stage-6-3.png`
- `assets/maps/stage-6/stage-6-4.png`
- `assets/maps/stage-6/stage-6-5.png`

Prompt notes:

- `assets/maps/stage-6/stage-6-prompts.md`

Preview:

- `stage-6-background-preview.html`

## QA Notes

- All accepted images are `960x540` PNGs.
- Stage 6 is wired through `STAGE_BACKGROUND_SPRITES` and `getStageBackgroundSprite()`.
- Stage 6 uses the same `stageNAreaM` lookup pattern as Stage 1 through Stage 5.
- Images were generated to match the existing night, wet pavement, saturated lighting, 32-bit arcade mood.
- Lane review confirmed stairs, entrances, and dome structures remain above the playable combat lane.
- All references were fictionalized: no readable real signage or exact logos were intentionally preserved.

## Verification

```sh
node --check main.js
git diff --check
curl -I 'http://127.0.0.1:4177/?v=102'
curl -I 'http://127.0.0.1:4177/stage-6-background-preview.html'
```

Manual browser checks:

- Open `http://127.0.0.1:4177/?v=102`
- Unlock or debug-start Stage 6
- Confirm areas 6-1 through 6-5 load the matching backgrounds
- Open `http://127.0.0.1:4177/stage-6-background-preview.html`
- Use the Lane overlay to confirm `y=300..452` remains clear
