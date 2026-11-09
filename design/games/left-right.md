# Left and right

Todo for patch 1.0.3. Fix the existing game before the new game menu ships.

## What is wrong

The game chooses a direction, but only writes LEFT or RIGHT and shows a happy or sad sprite. The pet never visibly looks toward its answer. See `nextGameRound()` and `gameGuess()` in `pets/game.js`.

## What should happen

Show a neutral pet while waiting. After the player chooses, turn the pet toward the selected game direction. Hold that pose for roughly 700 ms, then show the happy or sad reaction for the rest of the existing 1,200 ms reveal. Keep the direction text visible throughout.

Left and right mean the viewer's left and right. The pet turns toward its answer, even when the player guesses wrong. Never reveal the answer early.

## Sprites

Add explicit `lookLeft` and `lookRight` frames for every hatched identity in all four families. Give front facing pets an obvious eye, face or body turn. Keep markings such as 404 readable. A small move across the screen or a flipped symmetrical sprite does not count.

Fit both poses in the existing 16 by 16 game canvas. Keep the whole pet visible. Review Original, Slice, Cypunk and Lilgotchi from baby through elder.

## Done when

1. Both directions are obvious without reading the result text, including on symmetrical eggs and pizza faces.
2. The shown direction always matches the result and scoring, for wins and losses.
3. Five rounds, winning odds, rewards and weight changes stay as they are.
4. Closing, restarting, switching pets or entering vacation cancels the pending reaction. Old callbacks cannot repaint a new run.
5. Reduced motion still shows the directional pose. Text reports the answer for screen readers and muted play.
6. Tests cover every directional frame, forced left and right outcomes, both result reactions and stale timers. Browser proof shows both turns at desktop and mobile sizes.

[Game plan](README.md)
