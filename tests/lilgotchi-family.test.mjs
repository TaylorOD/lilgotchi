import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lilgotchiSprites, lilgotchiPalette, lilgotchiNames } from '../pets/lilgotchi-sprites.js';
import { getCharacter, frameCharacter } from '../pets/catalog.js';
import { GameState, Evo } from '../pets/engine.js';
import { frameInfo } from '../pets/layout.js';
import { petLabel } from '../widget/pet-label.js';
import { PetHistory } from '../widget/pet-history.js';

test('Lilgotchi grows from a small plain egg into the logo egg and cracked elder',()=>{
  const choice=getCharacter('lilgotchi');
  assert.equal(frameCharacter(new URLSearchParams('pet=lilgotchi')),choice);
  const state=new GameState(choice);
  assert.equal(state.character,'egg');
  assert.equal(Evo.evolve(state).character,'babytchi');
  for(const [identity,frames] of Object.entries(lilgotchiSprites)) {
    assert.ok(lilgotchiNames[identity]);
    assert.deepEqual(Object.keys(frames),identity==='egg'?['idle1','idle2']:['idle1','idle2','happy','sad','eat','sleep','lookLeft','lookRight']);
    for(const frame of Object.values(frames)) {
      const info=frameInfo(frame);
      assert.ok(info.width<=12 && info.height<=12);
      for(const row of frame)for(const color of row)assert.ok(color>=0 && color<lilgotchiPalette.length);
    }
  }
  assert.equal(lilgotchiSprites.egg.idle1.flat().includes(3),false);
  assert.ok(lilgotchiSprites.babytchi.idle1.flat().includes(3));
  const heights=['egg','babytchi','marutchi','tamatchi','mametchi'].map(id=>{
    const info=frameInfo(lilgotchiSprites[id].idle1);return info.bottom-info.top+1;
  });
  assert.deepEqual(heights,[5,7,9,10,11]);
  assert.equal(lilgotchiSprites.oyajitchi.idle1[1][5],3);
  assert.equal(lilgotchiSprites.oyajitchi.idle1[2][6],3);
  assert.equal(lilgotchiSprites.oyajitchi.idle1[3][5],3);
  assert.equal(lilgotchiSprites.mametchi.idle1[1][5],2);
  for(const frame of Object.values(lilgotchiSprites.oyajitchi)){assert.equal(frame[3][7],0);assert.equal(frame[8][8],3);assert.equal(frame[10][8],3);}
});

test('Lilgotchi labels and memorials use its own name',()=>{
  assert.equal(petLabel('lilgotchi',null),'Little Egg · Egg');
  assert.equal(petLabel('lilgotchi',{character:'babytchi',stage:'baby'}),'Peep Egg · Baby');
  const entry={family:'lilgotchi',character:'oyajitchi',age:12,bornAt:1,recordedAt:2};
  assert.equal(new PetHistory({}).describe(entry),'Lilgotchi · Cracked Elder · 12 days old');
});

test('Lilgotchi keeps all frames and care effects in the display',()=>{
  const result=spawnSync(process.execPath,['tests/bounds-fixture.mjs','lilgotchi'],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
  assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);
});
