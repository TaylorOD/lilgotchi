import test from "node:test";
import assert from "node:assert/strict";
import { createGet } from "../pets/minigames/get.js";
import { createBump } from "../pets/minigames/bump.js";
import { createHeading } from "../pets/minigames/heading.js";
import { createMemory } from "../pets/minigames/memory.js";
for (const create of [createGet, createBump, createHeading, createMemory]) {
  test(`${create.name} freezes and quits without later changes`, () => {
    const g = create({ random: () => 0 });
    g.advance(350);
    g.pause();
    const paused = g.snapshot();
    g.advance(5000);
    g.input("left");
    assert.deepEqual(g.snapshot(), paused);
    g.resume();
    g.quit();
    const done = g.snapshot();
    g.advance(5000);
    g.input("right");
    assert.deepEqual(g.snapshot(), done);
  });
  test(`${create.name} elapsed time independent of frame partition`, () => {
    const a = create({ random: () => 0 }),
      b = create({ random: () => 0 });
    a.advance(2390);
    for (let i = 0; i < 239; i++) b.advance(10);
    assert.deepEqual(a.snapshot(), b.snapshot());
  });
}
test("Get catches once, moves within lanes and wins on notes", () => {
  const g = createGet({ random: () => 0 });
  g.input("left");
  g.input("left");
  assert.equal(g.snapshot().lane, 0);
  g.advance(30000);
  assert.equal(g.snapshot().result, "win");
  assert.ok(g.snapshot().score >= 12);
});
test("Get hazards exhaust exactly three lives", () => {
  let n = 0;
  const g = createGet({ random: () => (++n % 2 ? 0 : 0.99) });
  g.input("left");
  g.advance(10000);
  assert.equal(g.snapshot().lives, 0);
  assert.equal(g.snapshot().result, "loss");
});
test("Get missed notes lose at timeout", () => {
  const g = createGet({ random: () => 0 });
  g.advance(30000);
  assert.equal(g.snapshot().score, 0);
  assert.equal(g.snapshot().result, "loss");
});
test("Bump early and repeated presses cannot win extra bouts", () => {
  const g = createBump();
  g.input("bump");
  assert.equal(g.snapshot().wins, 0);
  for (let i = 0; i < 3; i++) {
    g.advance(1500);
    g.advance(560);
    g.input("bump");
    g.input("bump");
    g.advance(1200);
  }
  assert.equal(g.snapshot().wins, 3);
  assert.equal(g.snapshot().result, "win");
});
test("Bump includes exact target edge and expires untouched bouts", () => {
  const g = createBump();
  g.advance(1980);
  g.input("bump");
  assert.equal(g.snapshot().wins, 1);
  const h = createBump();
  h.advance(30000);
  assert.equal(h.snapshot().result, "loss");
});
test("Memory ignores playback guesses and handles repeated arrows through fifth round", () => {
  const g = createMemory({ random: () => 0 });
  g.input("right");
  for (let length = 2; length <= 6; length++) {
    g.advance(length * 800 + (length > 2 ? 450 : 0));
    assert.equal(g.snapshot().phase, "answer");
    for (let n = 0; n < length; n++) g.input("left");
  }
  assert.equal(g.snapshot().result, "win");
});
test("Memory resume restarts cues and response has no timeout", () => {
  const g = createMemory({ random: () => 0 });
  g.advance(700);
  assert.equal(g.snapshot().cue, null);
  g.pause();
  g.resume();
  assert.equal(g.snapshot().cue, "left");
  g.advance(1600);
  g.advance(100000);
  assert.equal(g.snapshot().phase, "answer");
  g.input("right");
  assert.equal(g.snapshot().result, "loss");
});
test("Heading misses, boundaries and jump repeat lock", () => {
  const g = createHeading();
  for (let i = 0; i < 20; i++) {
    g.input("left");
    g.advance(100);
  }
  assert.equal(g.snapshot().x, 6);
  g.input("jump");
  g.advance(100);
  const jump = g.snapshot().jump;
  g.input("jump");
  assert.equal(g.snapshot().jump, jump);
  g.advance(45000);
  assert.equal(g.snapshot().result, "loss");
});
test("Heading drifting serves stay reachable and ten distinct headers win", () => {
  const g = createHeading({ random: () => 0 });
  let previous = 0,
    points = 0;
  for (let t = 0; t < 45000 && !g.snapshot().result; t += 10) {
    const s = g.snapshot();
    assert.ok(s.ball.x >= 1 && s.ball.x <= 29);
    assert.ok(s.ball.y >= 1 && s.ball.y <= 22);
    if (s.ball.x < s.x - 1) g.input("left");
    if (s.ball.x > s.x + 1) g.input("right");
    if (s.phase === "playing" && s.ball.y > 1 && s.ball.y >= previous)
      g.input("jump");
    previous = s.ball.y;
    g.advance(10);
    assert.ok(g.snapshot().score - points <= 1);
    points = g.snapshot().score;
  }
  assert.equal(g.snapshot().result, "win");
  assert.equal(points, 10);
});
