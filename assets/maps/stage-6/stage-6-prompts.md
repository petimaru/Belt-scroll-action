# Stage 6 Background Prompts

Stage theme: Tokyo Dome final route. The player moves through the dome city area toward the final boss plaza.

Fixed gameplay constraints used for every image:

- Final game frame: `960x540`
- Walkable combat lane: `y=300..452`
- Keep the full lane clear, flat, and playable
- Do not place vehicles, fences, railings, signs, vending machines, barriers, poles, doors, stairs, large props, people, characters, enemies, UI, or foreground clutter inside the lane
- Large objects must remain above the lane or at far left/right edges
- Maintain Stage1 through Stage5 pixel density, color richness, wet reflections, and gameplay readability
- 32-bit retro pixel art, beat-em-up arcade game
- No readable text, real logos, or watermarks

## Stage6-1

Dome city restaurant front: fictionalized restaurant/bar frontage near a large dome complex, striped awnings, warm windows, and a broad wet tiled plaza. The user reference was used only for facade layout.

## Stage6-2

Dome concourse gate: fictionalized curved stadium wall, entrance openings, patterned tile floor, roof shadows, and unreadable gate-style signage.

## Stage6-3

Dome concourse stairs: second concourse angle with a huge curved wall, side stairs, roof truss, and broad wet patterned plaza. Stairs stay above the playable lane.

## Stage6-4

Dome city plaza: wide plaza near a dome entertainment complex, hotel tower, distant event structures, and geometric wet tiles. This is the final approach before the boss arena.

## Stage6-5

Final boss area: fictionalized giant domed arena front, broad curved roof, massive entrance facade, distant amusement ride silhouette, and a huge open wet tiled boss plaza with a clear right-side exit path.

## Final Adjustment

Lane review confirmed the playable range `y=300..452` reads as clear wet pavement. No gameplay lane or collision values were changed.
