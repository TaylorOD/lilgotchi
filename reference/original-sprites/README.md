# Original P1 and P2 artwork

Source: [Tamagotchi Original P1 / P2 on The Spriters Resource](https://www.spriters-resource.com/lcd_handhelds/tamagotchioriginalp1p2/).

Sheets by DemiumAjare, retrieved November 12, 2026. The complete sheets retain the contributor credits. Tamagotchi characters and artwork belong to their respective owners, including Bandai. These third party assets are not covered by this project's MIT software license. This project is not affiliated with Bandai.

`frames.json` records the source rectangles and pose assignments. Each frame keeps its source pixels. White is transparent and black uses the game's foreground color. No resampling is used. The egg and shared care icons remain from the existing game.

The source sheets do not label individual poses. Pose assignments were selected by visual inspection. Some poses share a frame where the sheet has no distinct expression. Directional games use the source's side facing poses. Growth rules are adapted for lilgotchi and are not a hardware emulation.

Run `python scripts/import-original-sprites.py` from the repository root to rebuild `pets/original-sprites.js`. This optional authoring step requires Pillow. The shipped game has no added dependencies.

The collection contains 26 character sheets plus the general, simplified and miscellaneous sheets. Only the character frames are used by the game. Individual source links and checksums are recorded in `sources.json`.
