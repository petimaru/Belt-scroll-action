# Stage 2 Background Prompts

Stage theme: Shinkiba wrestling district. The player travels toward a fictionalized Shinkiba 1st RING-style venue.

Fixed gameplay constraints used for every image:

- Final game frame: `960x540`
- Walkable combat lane: `y=300..452`
- Keep the full lane clear, flat, and playable
- Do not place containers, vehicles, fences, signs, vending machines, barriers, poles, doors, stairs, large props, clutter, UI, characters, or enemies inside the lane
- Large objects must remain above the lane or at far left/right edges
- Maintain Stage1's pixel density, color richness, wet reflections, and gameplay readability
- 32-bit retro pixel art, beat-em-up arcade game
- No readable text, no logos

## Stage2-1

Warehouse district entrance: industrial warehouses, road entering the warehouse district, chain-link fences only in the background, sodium-vapor lamps, cool blue industrial shadows, wet asphalt.

## Stage2-2

Container yard: large container stacks, cranes, port structures, industrial rain, open combat area, cool blue shadows and orange lamps.

## Stage2-3

Canal waterfront: industrial canal, distant bridges and warehouses, water behind the combat lane, no railings or posts inside `y=300..452`. The first generation was rejected because the railing entered the lane; the accepted version moves the waterfront edge behind the lane.

## Stage2-4

Road approaching the venue: more urban industrial road, event-hall silhouettes in the distance, road lamps, wet asphalt, destination approaching but final venue not yet shown.

## Stage2-5

Boss area: front plaza of a compact industrial wrestling venue inspired by Shinkiba 1st RING's feeling, fictionalized with no real logos or readable text, wide open boss battle plaza, right side visually open after the boss.

Revision reference: user supplied a Shinkiba 1st RING access-guide photo on 2026-05-25. The accepted revision uses only the architectural feeling: dark corrugated warehouse frontage, triangular roof peak, large black roll-up shutters, sparse industrial lighting, and a wide asphalt plaza. It intentionally avoids copying exact logos, readable text, vehicles, cones, or foreground barriers into the combat lane.

Accepted revision prompt summary:

- Create a `960x540` final side-view beat-em-up background.
- Use the reference only as architectural inspiration: dark corrugated-metal warehouse venue front, triangular roof peak, large black roll-up shutter doors, smaller side door, sparse industrial lighting, asphalt plaza.
- Do not copy exact logos, text, signage, or readable words. Use only abstract unreadable shapes or a fictional circular emblem.
- Scene is Stage 2-5 boss area, a Shinkiba wrestling venue front at night with Tokyo bay industrial mood.
- Keep walkable combat lane `y=300..452` completely open, flat, and playable.
- Do not place containers, vehicles, fences, signs, vending machines, barriers, poles, cones, doors, stairs, large props, or obstacles inside `y=300..452`.
- Keep large objects above `y=300` or at extreme far left/right edges only.
- Warehouse building occupies the upper half; open asphalt plaza occupies the lower half.
- No UI, characters, enemies, foreground clutter, readable text, real brand names, or watermark.
