import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { TamagotchiApp } from '../pets/game.js';

test('game and host expose no removed dialogue service hooks or controls',()=>{
  assert.equal(TamagotchiApp.prototype.talk,undefined);
  assert.equal(TamagotchiApp.prototype.showDialogue,undefined);
  for(const path of ['pets/game.js','pets/boot.js','pets/game.html','pets/game.css','lilgotchi.js']) {
    const source=readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
    assert.doesNotMatch(source,/dialogue|openai|personality/i,path);
  }
  for(const path of ['pets/dialogue.js','widget/dialogue-host.js','examples/dialogue.html','server-example/route.mjs'])assert.equal(existsSync(new URL(`../${path}`,import.meta.url)),false,path);
});
