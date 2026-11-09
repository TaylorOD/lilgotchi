# More games for lilgotchi

The 2.0 preview adds seven games. Nothing here is released yet. The timing and scores are our rules, not a claim of exact hardware behavior.

## First, fix the guessing game

[Left and right](left-right.md) is a separate patch. The pet needs a visible turn in both directions, including symmetrical characters. Keep the existing rules and rewards.

## The 2.0 lineup

| Game | What you do |
| --- | --- |
| [Get](get.md) | Catch notes and dodge poop |
| [Bump](bump.md) | Stop a power meter and bump an opponent |
| [Heading](heading.md) | Move under a ball and head it upward |
| [Memory](memory.md) | Repeat a growing arrow sequence |
| [Flag](flag.md) | Follow real cues and ignore fake ones |
| [Sprint](sprint.md) | Tap or hold to race |
| [Hoops](hoops.md) | Time basketball shots |

The existing guessing game stays. Each new game has its own model and tests. Review them together before approving 2.0.

This is the seven game Connection set, not every game from every Tamagotchi. The [catalog](catalog.md) keeps the wider research backlog separate.

## Keep the widget small

Play opens a game picker. Game names, instructions, score, progress, pause and exit sit outside the pixel display. Show one short instruction before Start. The display is for the pet and playfield.

Use the existing 32 by 16 display and integer pixels. Give each game up to three large touch controls below it, with matching keyboard controls. Do not put a tiny menu or text over the pet. Keep the same layout for all four families.

Use the current pet and evolution. Draw new poses when needed. A symmetrical sprite flipped horizontally is not a visible turn. Keep eyes, toppings, antennae, cracks and readable symbols recognizable. Check the largest adult and elder forms before approving the layout.

## Shared game rules

The 2.0 contract:

1. Keep the existing play restrictions for eggs, sleeping, sick, dead or vacation pets. Explain unavailable games beside their names. No new stage locks in the first batch.
2. Pause the round when the drawer closes or the page hides. On return, offer Resume or Quit. No hidden timers, free points or automatic losses. Care time follows the existing game rules.
3. End a run if the pet dies, starts vacation or changes family. Cancel old callbacks so they cannot affect the next pet.
4. A win gives one happiness heart, capped at four, once per finished run. A loss or quit gives none. No coins, betting, inventory, new evolution rules or extra weight changes in this first batch. Settle the existing energy effect once per started run, not per tap.
5. Keep an unfinished run in memory only. Reloading ends it without a reward. High scores are outside the first batch.
6. Keep sound optional. Every sound cue needs a visible cue. Reduced motion removes decoration, not essential game feedback. Pause stays available. Announce instructions, results and discrete cues without reading every animation frame.

## Still under review

The models are implemented and have deterministic tests. Compact character poses, complete game screens and browser playtesting still need review. The art sections below are acceptance requirements, not a claim that every pose is finished.

## Before shipping

Verify input, collisions, scoring, pause, exit, repeat rewards and family switching. Test every hatched sprite against screen bounds. Review the actual games in desktop and mobile browsers, including touch targets, keyboard focus and muted play. Capture screenshots in each PR. For timing games, also review a short recording.

Source for the seven Connection games: [Bandai's manual](https://tamagotchi-official.com/manual/toy/connection/connection_web_manual_IS_EN.pdf). Their controls and objectives are references. The durations and win conditions in these docs are our starting balance choices.
