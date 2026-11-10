import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlag} from '../pets/minigames/flag.js';
import {createSprint} from '../pets/minigames/sprint.js';
import {createHoops} from '../pets/minigames/hoops.js';

test('Flag scores each real cue once and fake cues only when ignored', () => {
  for (const [random, action] of [[0,'left'],[0.26,'right'],[0.51,'both'],[0.99,null]]) {
    const game=createFlag({random:()=>random});game.advance(900);
    for(let i=0;i<15;i++) {
      if(action) { assert.equal(game.input(action),true); assert.equal(game.input(action),false); }
      game.advance(3300);
    }
    assert.equal(game.snapshot().score,15); assert.equal(game.snapshot().result,'win');
  }
  const fake=createFlag({random:()=>0.99});fake.advance(900);fake.input('left');fake.advance(3300);
  assert.equal(fake.snapshot().score,0);
});

test('Flag timeout cannot accept a late response and slow mode extends its window', () => {
  const game=createFlag({random:()=>0});game.advance(3300);
  assert.equal(game.input('left'),false);assert.equal(game.snapshot().correct,false);
  const slow=createFlag({random:()=>0,slow:true});slow.advance(3300);
  assert.equal(slow.input('left'),true);slow.advance(1600);assert.equal(slow.snapshot().score,1);
  game.advance(60000);assert.equal(game.snapshot().result,'loss');
});

test('Sprint ignores early input, caps tap rate and gives hold the same progress', () => {
  const tap=createSprint(), hold=createSprint({hold:true});
  assert.equal(tap.input('run'),false);tap.advance(3000);hold.advance(3000);
  hold.input('start-hold');hold.advance(1);tap.input('run');
  assert.equal(tap.input('run'),false);
  for(let i=0;i<20;i++){tap.advance(500);hold.advance(500);tap.input('run');}
  assert.equal(tap.snapshot().progress,hold.snapshot().progress);
  tap.advance(18000);assert.equal(tap.snapshot().result,'loss');
  hold.advance(18000);assert.equal(hold.snapshot().result,'win');
});

test('Sprint stopping hold does not accrue progress and ties win', () => {
  const game=createSprint({hold:true});game.advance(3000);game.advance(3500);
  game.input('start-hold');game.advance(14500);
  assert.equal(game.snapshot().result,'win');
  const stopped=createSprint({hold:true});stopped.advance(3000);stopped.input('hold');stopped.advance(1000);
  stopped.input('stop-hold');const progress=stopped.snapshot().progress;stopped.advance(1000);
  assert.equal(stopped.snapshot().progress,progress);
});

test('Hoops scores five shots once with progressively narrower targets', () => {
  const game=createHoops();let width=1;
  for(let i=0;i<5;i++) {
    const snapshot=game.snapshot();assert.ok(snapshot.target.max-snapshot.target.min<width);
    width=snapshot.target.max-snapshot.target.min;
    game.input('ready');game.advance(600);assert.equal(game.snapshot().marker,0.5);
    assert.equal(game.input('shoot'),true);assert.equal(game.input('shoot'),false);
    game.advance(900);assert.equal(game.snapshot().score,i+1);
  }
  assert.equal(game.snapshot().result,'win');game.advance(10000);assert.equal(game.snapshot().score,5);
});

test('Hoops target edges count, misses stay bounded and ready requires input', () => {
  for(const time of [384,816]) { const game=createHoops();game.input('ready');game.advance(time);game.input('shoot');assert.equal(game.snapshot().made,true); }
  const game=createHoops();game.advance(100000);assert.equal(game.snapshot().phase,'ready');
  for(let i=0;i<5;i++) {
    game.input('ready');game.input('shoot');assert.equal(game.snapshot().made,false);
    for(let t=0;t<9;t++){game.advance(100);const {x,y}=game.snapshot().ball;assert.ok(x>=0&&x<=30&&y>=0&&y<=22);}
  }
  assert.equal(game.snapshot().result,'loss');
});

for(const factory of [createFlag,createSprint,createHoops]) {
  test(`${factory.name} freezes input and time while paused and stays ended after quit`,()=>{
    const game=factory();game.pause();const before=game.snapshot();game.advance(100000);game.input('left');game.input('run');game.input('ready');assert.deepEqual(game.snapshot(),before);
    game.resume();game.quit();const ended=game.snapshot();game.advance(100000);game.input('shoot');assert.deepEqual(game.snapshot(),ended);assert.equal(ended.result,'quit');
  });
}

test('Hoops pauses its ball arc without duplicate rewards',()=>{
  const game=createHoops();game.input('ready');game.advance(600);game.input('shoot');game.advance(400);game.pause();game.advance(900);assert.equal(game.snapshot().score,0);game.resume();game.advance(500);assert.equal(game.snapshot().score,1);game.advance(900);assert.equal(game.snapshot().score,1);
});

test('Models ignore invalid elapsed time and returned snapshots cannot mutate runs',()=>{
  for(const factory of [createFlag,createSprint,createHoops]) {
    const game=factory(), before=game.snapshot();
    for(const dt of [NaN,Infinity,-1,0]) game.advance(dt);
    assert.deepEqual(game.snapshot(),before);
    const copy=game.snapshot();copy.score=999;if(copy.target&&typeof copy.target==='object')copy.target.min=-1;
    assert.deepEqual(game.snapshot(),before);
  }
});

test('Flag and Sprint produce the same outcome with small or large time steps',()=>{
  for(const factory of [()=>createFlag({random:()=>0.99}),()=>createSprint({hold:true})]) {
    const a=factory(),b=factory();
    if(a.snapshot().id==='sprint'){a.advance(3000);b.advance(3000);a.input('hold');b.input('hold');}
    a.advance(30000);for(let t=0;t<30000;t+=10)b.advance(10);
    assert.deepEqual(a.snapshot(),b.snapshot());
  }
});
