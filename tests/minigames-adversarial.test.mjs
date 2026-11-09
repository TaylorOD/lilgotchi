import test from 'node:test';
import assert from 'node:assert/strict';
import {createGet} from '../pets/minigames/get.js';
import {createBump} from '../pets/minigames/bump.js';
import {createHeading} from '../pets/minigames/heading.js';
import {createMemory} from '../pets/minigames/memory.js';

test('Get waits for movement cooldown and dodging a hazard preserves lives',()=>{
 let n=0;const g=createGet({random:()=>++n%2?0:0.99});g.input('left');g.input('right');assert.equal(g.snapshot().lane,0);
 g.advance(150);g.input('right');assert.equal(g.snapshot().lane,1);g.advance(2000);assert.equal(g.snapshot().lives,3);
});

test('Bump target rejects a point immediately below its first inclusive edge',()=>{
 const g=createBump();g.advance(1970);g.input('bump');assert.equal(g.snapshot().boutWon,false);assert.equal(g.snapshot().wins,0);
});

test('Memory keeps entered answers across pause but does not expose future arrows',()=>{
 let i=0;const g=createMemory({random:()=>[0,.5,.99][i++%3]});g.advance(1600);g.input('left');assert.equal(g.snapshot().entered,1);
 g.pause();g.resume();assert.equal(g.snapshot().entered,1);assert.equal(g.snapshot().phase,'answer');assert.equal(g.snapshot().cue,null);
 g.input('up');assert.equal(g.snapshot().round,2);
});

test('Heading can win with either direction of serve drift and never double scores',()=>{
 for(const random of [()=>0,()=>.99]) {
  const g=createHeading({random});let previous=0,points=0;
  for(let t=0;t<45000&&!g.snapshot().result;t+=10){
   const s=g.snapshot();if(s.ball.x<s.x-1)g.input('left');if(s.ball.x>s.x+1)g.input('right');
   if(s.phase==='playing'&&s.ball.y>1&&s.ball.y>=previous)g.input('jump');previous=s.ball.y;g.advance(10);
   assert.ok(g.snapshot().score-points<=1);points=g.snapshot().score;
  }
  assert.equal(g.snapshot().result,'win');assert.equal(points,10);
 }
});

