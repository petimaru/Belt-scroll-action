# Stage 1 Walkable Background Edit Prompts

All five prompts used the existing Stage 1 image as the visible edit target.
Common constraints:

- Final game frame: `960x540`
- Walkable lane: `y=300..452`
- Redraw the lane as clear, flat wet pavement
- Keep `y=300` as the visual start of the foreground floor
- Remove people, poles, bollards, barriers, signs, crates, cars, steps, and other blocking objects from the lane
- Move crowds and dense scenery behind the lane or to the sides
- Replace real/readable signage with fictional pseudo-signage
- Preserve the rainy neon 32-bit pixel-art beat-em-up mood

## Stage 1-1

Preserve the rainy neon Kabukicho entrance mood, red arch silhouette, night lighting, and 32-bit retro pixel-art detail. Remove the yellow/black barricade tape and redraw `y=300..452` as clear wet pavement.

## Stage 1-2

Preserve the lively neon shopping-street mood and deep city perspective. Remove the row of bollards and any small posts or props from `y=300..452`; keep storefronts and street depth above the lane.

## Stage 1-3

Preserve the dense neon storefront street mood. Remove or push upward any curb, posts, doorway thresholds, stairs, signs, planters, shop items, or other blocking objects from `y=300..452`.

## Stage 1-4

Preserve the restaurant district atmosphere, warm lanterns, rainy reflections, and side alley depth. Remove standing signs, lamppost bases, curb clutter, storefront items, trash, menu boards, plants, people, and blocking objects from `y=300..452`.

## Stage 1-5

Preserve the dramatic cinema plaza boss-arena mood. Move the crowd and bystanders behind `y=300`, keep them as background audience only, and redraw `y=300..452` as an empty combat floor with a visually open right side.
