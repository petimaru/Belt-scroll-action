# Stage 5 Background Handoff

Date: 2026-05-29

## Scope

Created and implemented all Stage 5 backgrounds for the Tokyo Suidobashi / Korakuen route:

1. Stage 5-1: Suidobashi station west exit
2. Stage 5-2: Suidobashi canal bridge
3. Stage 5-3: Elevated city avenue
4. Stage 5-4: Korakuen passage entrance
5. Stage 5-5: Korakuen Hall-style boss entrance

## Gameplay Contract

- Final game screen: `960x540`
- Walkable combat lane: `y=300..452`
- Backgrounds are baked raster images only.
- Gameplay logic, enemy logic, collision, and walkable lane values were not modified.

## Runtime Assets

- `assets/maps/stage-5/stage-5-1.png`
- `assets/maps/stage-5/stage-5-2.png`
- `assets/maps/stage-5/stage-5-3.png`
- `assets/maps/stage-5/stage-5-4.png`
- `assets/maps/stage-5/stage-5-5.png`

Prompt notes:

- `assets/maps/stage-5/stage-5-prompts.md`

Preview:

- `stage-5-background-preview.html`

## QA Notes

- All accepted images are `960x540` PNGs.
- Stage 5 is wired through `STAGE_BACKGROUND_SPRITES` and `getStageBackgroundSprite()`.
- Stage 5 uses the same `stageNAreaM` lookup pattern as Stage 1 through Stage 4.
- Images were generated to match the existing night, wet pavement, saturated lighting, 32-bit arcade mood.
- Final images were shifted upward slightly after lane review so railings, entrance fronts, and venue details stay above the playable combat lane.
- All references were fictionalized: no readable real signage or exact logos were intentionally preserved.

## Verification

```sh
node --check main.js
git diff --check
curl -I 'http://127.0.0.1:4177/?v=101'
curl -I 'http://127.0.0.1:4177/stage-5-background-preview.html'
```

Manual browser checks:

- Open `http://127.0.0.1:4177/?v=101`
- Start Stage 5 from Stage Select
- Confirm areas 5-1 through 5-5 load the matching backgrounds
- Open `http://127.0.0.1:4177/stage-5-background-preview.html`
- Use the Lane overlay to confirm `y=300..452` remains clear
