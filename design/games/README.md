# More games for lilgotchi

Todo only. Nothing here is implemented or released. Timing, scoring and controls below are proposed lilgotchi rules, not claims about the original hardware.

## Patch first: 1.0.3

[Make the pet look left and right](left-right.md) in the existing guessing game. Ship this on its own before adding games. Keep the current rules and rewards.

## Next minor: 1.1.0

| Game | Plan |
| --- | --- |
| [Get](get.md) | Catch notes and dodge poop |
| [Bump](bump.md) | Stop a power meter and bump an opponent |
| [Heading](heading.md) | Move under a ball and head it upward |
| [Memory](memory.md) | Repeat a growing arrow sequence |

These four are the requested first batch. Each gets its own implementation branch and PR when work starts.

## Other Connection games

The 2024 Connection manual lists seven solo games. The other three have draft designs too. Decide whether they join 1.1.0 or a later minor before implementation.

| Game | Plan |
| --- | --- |
| [Flag](flag.md) | Follow real flag cues and ignore fake ones |
| [Sprint](sprint.md) | Race to the finish |
| [Hoops](hoops.md) | Time basketball shots |

The longer goal is to cover the wider Tamagotchi game catalog. That is not the same as these seven. See [the research list](catalog.md) before calling any release complete.

## Keep the widget small

Play opens a game picker. Game names, instructions, score, progress, pause and exit sit outside the pixel display. Show one short instruction before Start. The display is for the pet and playfield.

Use the existing 32 by 16 display and integer pixels. Give each game up to three large touch controls below it, with matching keyboard controls. Do not put a tiny menu or text over the pet. Keep the same layout for all four families.

Use the current pet and evolution. Draw new poses when needed. A symmetrical sprite flipped horizontally is not a visible turn. Keep eyes, toppings, antennae, cracks and readable symbols recognizable. Check the largest adult and elder forms before approving the layout.

## Shared game rules

Proposed for the minor release:

1. Keep the existing play restrictions for eggs, sleeping, sick, dead or vacation pets. Explain unavailable games beside their names. No new stage locks in the first batch.
2. Pause the round when the drawer closes or the page hides. On return, offer Resume or Quit. No hidden timers, free points or automatic losses. Care time follows the existing game rules.
3. End a run if the pet dies, starts vacation or changes family. Cancel old callbacks so they cannot affect the next pet.
4. A win gives one happiness heart, capped at four, once per finished run. A loss or quit gives none. No coins, betting, inventory, new evolution rules or extra weight changes in this first batch. Settle the existing energy effect once per started run, not per tap.
5. Keep an unfinished run in memory only. Reloading ends it without a reward. High scores are outside the first batch.
6. Keep sound optional. Every sound cue needs a visible cue. Reduced motion removes decoration, not essential game feedback. Pause stays available. Announce instructions, results and discrete cues without reading every animation frame.

## Before shipping

Verify input, collisions, scoring, pause, exit, repeat rewards and family switching. Test every hatched sprite against screen bounds. Review the actual games in desktop and mobile browsers, including touch targets, keyboard focus and muted play. Capture screenshots in each PR. For timing games, also review a short recording.

Source for the seven Connection games: [Bandai's manual](https://tamagotchi-official.com/manual/toy/connection/connection_web_manual_IS_EN.pdf). Their controls and objectives are references. The durations and win conditions in these docs are our starting balance choices.
