import test from 'node:test';
import assert from 'node:assert/strict';
import { SoundManager } from '../pets/sound.js';
import { TamagotchiApp } from '../pets/game.js';

test('sound unlock retries a suspended context without creating another one',()=>{
  let resumed=0,created=0;
  globalThis.window={AudioContext:class{constructor(){created++;this.state='suspended';}resume(){resumed++;this.state='running';return Promise.resolve();}}};
  const sound=new SoundManager();sound.init();sound.init();
  assert.equal(created,1);assert.equal(resumed,1);
  sound.ctx.state='suspended';sound.init();assert.equal(resumed,2);
});

test('an open stats panel refreshes from the same needs as the main display',()=>{
  const nodes={ 'pet-status':{},'pet-needs':{},lcd:{setAttribute(){}},'stats-overlay':{classList:{contains:name=>name==='show'}},'stats-content':{},'mute-btn':{classList:{toggle(){}}} };
  globalThis.document={getElementById:id=>nodes[id],querySelectorAll:()=>[]};
  const app=Object.create(TamagotchiApp.prototype);
  app.state={stage:'child',character:'marutchi',age:1,weight:10,hunger:3,happiness:2,discipline:25};
  app.updateButtons();
  assert.match(nodes['stats-content'].innerHTML,/3\/4/);
  app.state.hunger=1;app.updateButtons();
  assert.match(nodes['pet-needs'].textContent,/Food .*1\/4/);
  assert.match(nodes['stats-content'].innerHTML,/Food<\/span><span class="hearts">.*1\/4/);
});
