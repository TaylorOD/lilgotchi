import test from "node:test";
import assert from "node:assert/strict";
import { drawArcade } from "../pets/arcade-renderer.js";
import { arcadeSprites } from "../pets/arcade-sprites.js";
function capture(state, sprite, options = {}) {
  const pixels = [];
  const context = {
    fillStyle: "",
    fillRect(x, y, w, h) {
      pixels.push({ x, y, w, h, color: this.fillStyle });
    },
  };
  const nodes = new Map();
  const q = (key) => {
    if (!nodes.has(key))
      nodes.set(
        key,
        key === ".arcade-field"
          ? { getContext: () => context }
          : { style: {}, hidden: false },
      );
    return nodes.get(key);
  };
  drawArcade(q, state, sprite, [], options);
  return { pixels, nodes };
}
const states = [
  ...[0, 1, 2].flatMap((lane) => [
    { id: "get", lane, object: { lane, kind: "note", y: 9.9 } },
    {
      id: "get",
      lane,
      object: { lane, kind: "poop", y: 0 },
      reaction: "startled",
    },
    { id: "get", lane, reaction: "happy" },
  ]),
  ...[4, 27].flatMap((x) =>
    [0, 3].map((jump) => ({ id: "heading", x, jump, ball: { x: 29, y: 14 } })),
  ),
  ...[false, true].flatMap((boutWon) =>
    [0, 250, 400, 999, 1000, 1200].map((phaseTime) => ({
      id: "bump",
      phase: "reveal",
      phaseTime,
      boutWon,
      meter: 100,
      target: [60, 85],
    })),
  ),
  ...[null, "left", "right", "both"].flatMap((response) =>
    ["left", "right", "both", "fake"].map((cue) => ({
      id: "flag",
      phase: "cue",
      response,
      cue,
    })),
  ),
  { id: "flag", phase: "rest", response: "both", correct: true },
  { id: "flag", phase: "rest", response: "left", correct: false },
  { id: "memory", result: "win" },
  { id: "memory", result: "loss" },
  { id: "sprint", progress: 0, opponent: 30, finish: 30 },
  { id: "sprint", progress: 30, opponent: 0, finish: 30 },
  {
    id: "hoops",
    marker: 1,
    target: { min: 0.4, max: 0.6 },
    ball: { x: 29, y: 1 },
  },
];
test("every compact identity stays entirely inside the field in every arena state", () => {
  let identities = 0;
  for (const pets of Object.values(arcadeSprites))
    for (const sprite of Object.values(pets)) {
      identities++;
      for (const state of states)
        for (const reducedMotion of [false, true])
          for (const p of capture(state, sprite, { reducedMotion }).pixels) {
            assert.ok(Number.isInteger(p.x) && Number.isInteger(p.y));
            assert.ok(
              p.x >= 0 && p.y >= 0 && p.x + p.w <= 32 && p.y + p.h <= 16,
              `${state.id}: ${JSON.stringify(p)}`,
            );
          }
    }
  assert.equal(identities, 44);
});
const pet = arcadeSprites.classic.mametchi;
test("Flag visibly raises each requested flag independently and marks fake cues", () => {
  const view = (response) =>
    capture({ id: "flag", phase: "cue", response, cue: "left" }, pet).pixels;
  const raised = (pixels, color) =>
    pixels.some((p) => p.color === color && p.y === 5 && p.w === 3);
  assert.ok(raised(view("left"), "#a1f1dc"));
  assert.ok(!raised(view("left"), "#ed997d"));
  assert.ok(raised(view("right"), "#ed997d"));
  assert.ok(!raised(view("right"), "#a1f1dc"));
  assert.ok(raised(view("both"), "#a1f1dc") && raised(view("both"), "#ed997d"));
  assert.notDeepEqual(
    capture({ id: "flag", phase: "cue", cue: "fake" }, pet).pixels,
    view(null),
  );
});
test("Bump holds, knocks the loser over, then returns upright with a distinct rival", () => {
  const base = {
    id: "bump",
    phase: "reveal",
    boutWon: true,
    meter: 75,
    target: [60, 85],
  };
  const before = capture({ ...base, phaseTime: 0 }, pet).pixels,
    fall = capture({ ...base, phaseTime: 600 }, pet).pixels,
    after = capture({ ...base, phaseTime: 1100 }, pet).pixels;
  assert.notDeepEqual(fall, before);
  assert.deepEqual(after, before);
  assert.ok(fall.some((p) => p.color === "#a8c8f3"));
  assert.notDeepEqual(
    capture({ ...base, phaseTime: 600 }, pet, { reducedMotion: true }).pixels,
    fall,
  );
});
test("Sprint keeps the checkered finish visible beside both racers", () => {
  const p = capture(
    { id: "sprint", progress: 30, opponent: 30, finish: 30 },
    pet,
  ).pixels;
  assert.equal(
    p.filter((p) => p.x === 30 && p.w === 2 && p.h === 1).length,
    16,
  );
  assert.ok(p.some((p) => p.color === "#a8c8f3"));
});
