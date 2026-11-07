import test from 'node:test';
import assert from 'node:assert/strict';
import { Evo } from '../pets/engine.js';
import { sliceSprites, sliceNames } from '../pets/slice-sprites.js';
import { cyberpunkSprites, cyberpunkNames } from '../pets/cyberpunk-sprites.js';
import { lilgotchiNames } from '../pets/lilgotchi-sprites.js';

test('custom elder appearances share the cracked egg care path',()=>{
  const adult=Evo.toAdult({character:'tamatchi',careMistakes:3,discipline:50});
  assert.equal(adult.character,'maskutchi');
  for(const names of [sliceNames,cyberpunkNames,lilgotchiNames]){
    assert.ok(names[adult.character]);assert.ok(names.oyajitchi);
    assert.equal(Evo.checkOyajitchi({...adult,age:9,discipline:100}),false);
    assert.equal(Evo.checkOyajitchi({...adult,age:10,discipline:99}),false);
    assert.equal(Evo.checkOyajitchi({...adult,age:10,discipline:100}),true);
  }
  assert.equal(Evo.checkOyajitchi({character:'mametchi',age:10,discipline:100}),false);
  assert.equal(sliceNames.oyajitchi,'Spoiled Slice');
  assert.equal(cyberpunkNames.oyajitchi,'Glitch Elder');
});

test('elder variants retain their mold and glitch detail in every expression',()=>{
  for(const frame of Object.values(sliceSprites.oyajitchi)){
    assert.ok(frame.flat().includes(6));assert.ok(frame.flat().includes(7));
  }
  for(const frame of Object.values(cyberpunkSprites.oyajitchi)){
    assert.ok(frame.flat().includes(4));assert.equal(frame[0][8],4);
  }
  assert.notDeepEqual(sliceSprites.oyajitchi.idle1,sliceSprites.oyajitchi.idle2);
  assert.notDeepEqual(cyberpunkSprites.oyajitchi.idle1,cyberpunkSprites.oyajitchi.idle2);
});
