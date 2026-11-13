import test from "node:test";
import assert from "node:assert/strict";
import { drawArcade } from "../pets/arcade-renderer.js";
import { classicSprites } from '../pets/classic-sprites.js';
import { sliceSprites, slicePalette } from '../pets/slice-sprites.js';
import { cyberpunkSprites, cyberpunkPalette } from '../pets/cyberpunk-sprites.js';
import { lilgotchiSprites, lilgotchiPalette } from '../pets/lilgotchi-sprites.js';
import { headingPose, FALLING_FIELD_HEIGHT } from '../pets/arcade-geometry.js';
const families={classic:classicSprites,pizza:sliceSprites,cyberpunk:cyberpunkSprites,lilgotchi:lilgotchiSprites};
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
  drawArcade(q, state, sprite, options.palette||[], options);
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
test("every full identity stays entirely inside the field in every arena state", () => {
  let identities = 0;
  for (const pets of Object.values(families))
    for (const [id,frames] of Object.entries(pets).filter(([id,frames])=>id!=="egg"&&frames.idle1)) {
      const sprite=frames.idle1;
      identities++;
      for (const state of states)
        for (const reducedMotion of [false, true])
          for (const p of capture(state, sprite, { reducedMotion,frames }).pixels) {
            assert.ok(Number.isInteger(p.x) && Number.isInteger(p.y));
            assert.ok(
              p.x >= 0 && p.y >= 0 && p.x + p.w <= 32 && p.y + p.h <= (state.id === "sprint" ? 34 : ["get","heading"].includes(state.id) ? FALLING_FIELD_HEIGHT : 24),
              `${state.id}: ${JSON.stringify(p)}`,
            );
          }
    }
  assert.equal(identities, 44);
});
const pet = classicSprites.mametchi.idle1;
test("Flag visibly raises each requested flag independently and marks fake cues", () => {
  const view = (response) =>
    capture({ id: "flag", phase: "cue", response, cue: "left" }, pet).pixels;
  const raised = (pixels, color) =>
    pixels.some((p) => p.color === color && p.y === 10 && p.w === 3);
  assert.ok(raised(view("left"), "#365f54"));
  assert.ok(!raised(view("left"), "#934d42"));
  assert.ok(raised(view("right"), "#934d42"));
  assert.ok(!raised(view("right"), "#365f54"));
  assert.ok(raised(view("both"), "#365f54") && raised(view("both"), "#934d42"));
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
  assert.ok(fall.some((p) => p.color === "#0f380f"));
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
    p.filter((p) => p.x === 31 && p.w === 1 && p.h === 1).length,
    34,
  );
  assert.ok(p.some((p) => p.color === "#0f380f"));
});


test('Memory draws the actual current identity and authored direction frames',()=>{
 for(const [family,pets] of Object.entries(families))for(const [id,frames] of Object.entries(pets).filter(([id,f])=>id!=='egg'&&f.idle1)){
  const palette={pizza:slicePalette,cyberpunk:cyberpunkPalette,lilgotchi:lilgotchiPalette}[family]||[];
  for(const direction of ['left','right','up']){
   const frame=frames[{left:'lookLeft',right:'lookRight',up:'lookUp'}[direction]];
   const actual=capture({id:'memory',phase:'watch',cue:direction},frames.idle1,{frames,palette,foreground:'#123456'}).pixels;
   const left=Math.round((32-frame[0].length)/2),top=24-frame.length;
   for(let y=0;y<frame.length;y++)for(let x=0;x<frame[y].length;x++)if(frame[y][x])
    assert.ok(actual.some(p=>p.x===left+x&&p.y===top+y&&p.color===(palette[frame[y][x]]||'#123456')),`${family}/${id}/${direction}`);
  }
 }
});

test('Gen 1 uses the real LCD colors instead of the old yellow fallback',()=>{
 const result=capture({id:'memory'},pet,{foreground:'#234567',background:'#abcdef'}).pixels;
 assert.equal(result[0].color,'#abcdef');assert.ok(result.slice(1).every(p=>p.color==='#234567'));
});

test('upward glances preserve the lower body of every identity',()=>{
 for(const pets of Object.values(families))for(const [id,f] of Object.entries(pets).filter(([id,f])=>id!=='egg'&&f.idle1)){
  assert.notDeepEqual(f.lookUp,f.idle1,id);
  assert.equal(f.lookUp.length,f.idle1.length);
  assert.deepEqual(f.lookUp.slice(-1),f.idle1.slice(-1),id);
 }
});

test('Heading geometry uses the exact painted head pixels at both screen edges',()=>{
 for(const pets of Object.values(families))for(const f of Object.values(pets).filter(f=>f.idle1)){
  for(const center of [4,16,27])for(const jump of [0,1.4,3]){
   const pose=headingPose(f.idle1,center,jump);
   const actual=capture({id:'heading',x:center,jump,ball:{x:30,y:0}},f.idle1).pixels;
   for(const point of pose.head)assert.ok(actual.some(p=>p.x===point.x&&p.y===point.y&&p.w===1&&p.h===1));
  }
 }
});

test('Sprint presents red then yellow then green signals',()=>{
 for(const [state,color] of [[{phase:'countdown',countdown:2500},'#ef7971'],[{phase:'countdown',countdown:500},'#f5d56e'],[{phase:'race',elapsed:0},'#83da9c']]){
  const actual=capture({id:'sprint',progress:0,opponent:0,finish:30,...state},pet).pixels;
  assert.ok(actual.some(p=>p.color===color&&p.w===3&&p.h===2));
 }
});

test('Hoops includes a backboard, rim and open net around the model target',()=>{
 const actual=capture({id:'hoops',target:{min:.3,max:.7},marker:.5,ball:{x:26,y:8}},pet).pixels;
 assert.ok(actual.some(p=>p.x===30&&p.y===3&&p.h===20));
 assert.ok(actual.some(p=>p.x===27&&p.y===23&&p.w===5));
 assert.ok(actual.some(p=>p.x===24&&p.y===9&&p.w===7));
 assert.ok(actual.some(p=>p.x===26&&p.y===13&&p.w===3));
});

test('Get catches objects at the visible head of every pet', () => {
  for (const family of Object.values(families)) for (const [name, frames] of Object.entries(family)) {
    if (name === 'egg' || !frames.idle1) continue;
    const idle = frames.idle1;
    const top = FALLING_FIELD_HEIGHT - idle.length + idle.findIndex(row => row.some(Boolean));
    const {pixels} = capture({id:'get', lane:1, object:{lane:1, kind:'note', y:10}}, idle, {frames});
    const note = pixels.slice(-3);
    assert.equal(note[2].y + 1, top, name);
    assert.deepEqual(note.map(p=>[p.w,p.h]),[[1,4],[1,1],[2,2]]);
  }
});

test('Heading head collision excludes feet only columns', () => {
  const sprite = [[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1]];
  assert.deepEqual(headingPose(sprite, 16).head, [{x:15,y:36},{x:16,y:36}]);
});



test('Sprint keeps full size racers in separate lanes for every pairing', async () => {
 const {originalSprites}=await import('../pets/original-sprites.js');
 const racers=[...Object.values(families).flatMap(pets=>Object.entries(pets)),...Object.entries(originalSprites)]
  .filter(([id,frames])=>id!=='egg'&&frames.lookRight).map(([,frames])=>frames);
 for(const frames of racers)for(const rival of racers)for(const progress of [0,15,30]) {
  const palette=Array(256).fill('#player'),opponent={frames:rival,palette:Array(256).fill('#rival')};
  const {pixels}=capture({id:'sprint',phase:'race',elapsed:2000,progress,opponent:progress,finish:30},frames.idle1,{frames,palette,opponent});
  const playerPixels=pixels.filter(p=>p.color==='#player'),rivalPixels=pixels.filter(p=>p.color==='#rival');
  assert.equal(playerPixels.length,frames.lookRight.flat().filter(Boolean).length);
  assert.equal(rivalPixels.length,rival.lookRight.flat().filter(Boolean).length);
  assert.ok(Math.max(...playerPixels.map(p=>p.y))+2<Math.min(...rivalPixels.map(p=>p.y)));
  for(const p of [...playerPixels,...rivalPixels])assert.ok(p.x>=0&&p.x<31&&p.y>=0&&p.y<34);
 }
});
