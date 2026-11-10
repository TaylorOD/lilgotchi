import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { C } from '../pets/constants.js';
import { classicSprites } from '../pets/classic-sprites.js';
import { PF } from '../pets/font.js';
import { Evo } from '../pets/engine.js';
import { Renderer } from '../pets/renderer.js';
import { upstreamAt, plain } from './upstream-harness.mjs';

test('pinned reference has not changed', () => {
  const manifest = JSON.parse(readFileSync(new URL('../reference/source.json', import.meta.url)));
  const bytes = readFileSync(new URL('../reference/upstream.html', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.sha256);
});

test('constants, original sprites and font equal pinned upstream', () => {
  const upstream = upstreamAt();
  assert.deepEqual({...C,EGG_MS:upstream.C.EGG_MS}, plain(upstream.C));
  assert.equal(C.EGG_MS,90000);
  const originals=structuredClone(classicSprites);
  for(const frames of Object.values(originals)){delete frames.lookLeft;delete frames.lookRight;delete frames.lookUp;}
  assert.deepEqual(originals, plain(upstream.SP));
  assert.deepEqual(PF, plain(upstream.PF));
});

test('all care and discipline boundary combinations preserve evolution', () => {
  const upstream = upstreamAt();
  for (const character of ['tamatchi', 'kuchitamatchi']) {
    for (let careMistakes = 0; careMistakes <= 6; careMistakes++) {
      for (const discipline of [0, 24, 25, 49, 50, 74, 75, 99, 100]) {
        const state = { stage: 'teen', character, careMistakes, discipline };
        assert.deepEqual(Evo.toAdult(state), plain(upstream.Evo.toAdult(state)));
      }
    }
  }
});

test('original logical sprite buffers match at deterministic positions', () => {
  const upstream = upstreamAt();
  const makeRenderer = prototype => Object.assign(Object.create(prototype), { w: 32, h: 16, buf: Array.from({ length: 16 }, () => new Uint8Array(32)) });
  for (const [name, entry] of Object.entries(classicSprites)) {
    const frames = Array.isArray(entry) ? { shared: entry } : entry;
    for (const [frame, pixels] of Object.entries(frames)) {
      const actual = makeRenderer(Renderer.prototype);
      const expected = makeRenderer(upstream.Renderer.prototype);
      const x = Math.floor((32 - pixels[0].length) / 2);
      const y = Math.floor((16 - pixels.length) / 2);
      actual.drawSprite(pixels, x, y);
      expected.drawSprite(pixels, x, y);
      assert.deepEqual(actual.buf, expected.buf, `${name}.${frame}`);
    }
  }
});

test('reference clock and randomness are repeatable without booting UI', () => {
  const a = upstreamAt(1000, [0.1]);
  const b = upstreamAt(1000, [0.1]);
  assert.deepEqual(plain(new a.GameState()), plain(new b.GameState()));
  a.setTime(1000 + a.C.EGG_MS);
  assert.equal(a.Evo.shouldEvolve({ stage: 'egg', stageStartTime: 1000 }), true);
});

