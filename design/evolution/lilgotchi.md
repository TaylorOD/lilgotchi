# Lilgotchi egg evolution paths

These paths and sprites ship in lilgotchi 1.0.0. The preview reads the same artwork modules as the live game. Each type covers the original evolution branches while retaining its own appearance.

## Character direction

Every character stays an egg with a small face. The logo cream and gold remain the starting palette. Later eggs change shape, shell color and surface details instead of turning into birds. Duck Egg is pale green, Quail Egg is small and speckled, Goose Egg is tall and white, Jumbo Egg is broad, Golden Egg has a warm reflective shell, and Century Egg is dark teal. The elder is a cracked Goose Egg.

These are playful egg characters, not realistic food or biological diagrams. Care branches are game rules, not rankings of egg types or food quality.

| Original identity | Proposed egg | Stage | Visual cue |
| --- | --- | --- | --- |
| egg | Little Egg | Egg | Small cream shell without eyes |
| babytchi | Peep Egg | Baby | Small cream shell gains eyes |
| marutchi | Growing Egg | Child | Taller cream shell |
| tamatchi | Smooth Egg | Teen | Smooth cream shell with a highlight |
| kuchitamatchi | Speckled Egg | Teen | Tan shell with a few spots |
| mametchi | Duck Egg | Adult | Rounded pale green shell |
| ginjirotchi | Quail Egg | Adult | Smaller tan shell with brown speckles |
| maskutchi | Goose Egg | Adult | Tall white shell |
| kuchipatchi | Jumbo Egg | Adult | Broad cream shell |
| nyorotchi | Golden Egg | Adult | Gold shell with a diagonal shine |
| tarakotchi | Century Egg | Adult | Dark teal shell and light eyes |
| oyajitchi | Cracked Elder | Adult elder | White shell with a crack at the top |

## Paths

Little Egg becomes Peep Egg after 90 seconds. Peep Egg becomes Growing Egg after one hour in the baby stage. Growing Egg becomes a teen after 24 hours in the child stage. At most one care mistake selects Smooth Egg. More than one selects Speckled Egg. The teen stage lasts 24 hours before adult selection. Illness delays normal evolution until the pet is no longer sick.

Adult conditions below are checked in this order. A care mistake is the engine's missed care count at evolution, not the visible advisory care grade.

### From Smooth Egg

1. At most two care mistakes and 100% discipline gives Duck Egg.
2. At most two care mistakes and at least 75% discipline gives Quail Egg if the first rule did not match.
3. At most four care mistakes and at least 50% discipline gives Goose Egg if neither earlier rule matched.
4. At least 50% discipline gives Jumbo Egg if the earlier rules did not match.
5. At least 25% discipline gives Golden Egg if the earlier rules did not match.
6. Otherwise the pet becomes Century Egg.

### From Speckled Egg

1. At least 75% discipline gives Jumbo Egg.
2. At least 50% discipline gives Golden Egg if the first rule did not match.
3. Otherwise the pet becomes Century Egg.

### Special elder

Only Goose Egg uses the special elder path. At age 10 or older with 100% discipline, each simulation tick has a 5% chance to become Cracked Elder. It is not guaranteed at the exact birthday. The pet must still be alive. Other egg adults do not enter this route.

This exactly maps the current original Maskutchi to Oyajitchi rule. No new age, care or random thresholds are proposed.

## Sprite contract

All canvases fit inside 12 by 12 pixels. Each hatched pet has idle1, idle2, happy, sad, eat and sleep frames. The unhatched egg has two idle frames. Expressions stay inside the shell and retain each egg's defining silhouette or markings. The live renderer applies its bounds and reduced motion behavior to these frames.

Cracked Elder has a missing shard on its upper right side, with a deep jagged crack running down that side beside its face.
