import test from 'node:test';
import assert from 'node:assert/strict';
import {createHeading, touchesHead} from '../pets/minigames/heading.js';
import {headingPose} from '../pets/arcade-geometry.js';
import {createFlag} from '../pets/minigames/flag.js';
import {createMemory} from '../pets/minigames/memory.js';
import {createHoops} from '../pets/minigames/hoops.js';
import {classicSprites} from '../pets/classic-sprites.js';
import {sliceSprites} from '../pets/slice-sprites.js';
import {cyberpunkSprites} from '../pets/cyberpunk-sprites.js';
import {lilgotchiSprites} from '../pets/lilgotchi-sprites.js';

test('Heading catches a descending ball when the rising head crosses it',()=>{
  assert.equal(touchesHead({x:10,y:8},{x:10,y:8.2},[{x:10,y:11}],[{x:10,y:10}]),true);
  assert.equal(touchesHead({x:10,y:8},{x:10,y:8.2},[{x:13,y:11}],[{x:13,y:10}]),false);
  assert.equal(touchesHead({x:10,y:12},{x:10,y:12.2},[{x:10,y:11}],[{x:10,y:10}]),false);
});

test('Heading collision matches occupied full sprite columns across every family',()=>{
  for(const sprites of [classicSprites,sliceSprites,cyberpunkSprites,lilgotchiSprites]) {
    for(const [id,frames] of Object.entries(sprites)) {
      const sprite=frames.idle1;
      if(!sprite) continue;
      const pose=headingPose(sprite,16,0), raised=headingPose(sprite,16,1);
      for(let i=0;i<pose.head.length;i++) {
        const p=pose.head[i];
        assert.equal(touchesHead({x:p.x,y:p.y-2.5},{x:p.x,y:p.y-2.4},pose.head,raised.head),true,id);
      }
      const game=createHeading({sprite,random:()=>0});
      for(let t=0;t<1000;t+=100){game.input('left');game.advance(100);}
      assert.equal(headingPose(sprite,game.snapshot().x).left,0,id);
    }
  }
});

test('Flag has a preparation beat and holds each cue long enough to answer',()=>{
  const game=createFlag({random:()=>0});
  assert.equal(game.snapshot().phase,'prepare');
  assert.equal(game.input('right'),false);
  game.advance(899);assert.equal(game.snapshot().phase,'prepare');
  game.advance(1);assert.equal(game.snapshot().phase,'cue');
  game.advance(2399);assert.equal(game.input('left'),true);
  game.advance(1);assert.equal(game.snapshot().correct,true);
  assert.equal(game.input('right'),false);
  game.advance(899);assert.equal(game.snapshot().phase,'rest');
  game.advance(1);assert.equal(game.snapshot().round,2);
});

test('Memory exposes the entered direction without leaking the next sequence',()=>{
  const game=createMemory({random:()=>0});game.advance(1600);
  game.input('left');assert.equal(game.snapshot().lastInput,'left');
  game.advance(440);assert.equal(game.snapshot().lastInput,'left');
  game.pause();const paused=game.snapshot();game.advance(5000);assert.deepEqual(game.snapshot(),paused);
  game.resume();game.advance(10);assert.equal(game.snapshot().lastInput,null);
  game.input('left');assert.equal(game.snapshot().phase,'between');
  assert.equal(game.snapshot().cue,null);assert.equal(game.snapshot().lastInput,'left');
  game.advance(440);assert.equal(game.snapshot().phase,'between');
  game.advance(10);assert.equal(game.snapshot().phase,'watch');assert.equal(game.snapshot().cue,'left');
  game.advance(2400);game.input('right');assert.equal(game.snapshot().result,'loss');
  assert.equal(game.snapshot().lastInput,'right');
});

test('Hoops made shot crosses the rim downward and falls through the net',()=>{
  const game=createHoops();game.input('ready');game.advance(600);game.input('shoot');
  game.advance(600);const before=game.snapshot();
  game.advance(48);const rim=game.snapshot();
  assert.ok(before.ball.y<rim.ball.y);
  assert.equal(rim.ball.x+1,rim.hoop.centerX);
  assert.equal(rim.ball.y+1,rim.hoop.rimY);
  game.advance(100);const net=game.snapshot();
  assert.equal(net.ball.x,rim.ball.x);assert.ok(net.ball.y>rim.ball.y);
  game.advance(152);assert.equal(game.snapshot().score,1);
});

test('Hoops mistimed shots miss on the matching side of the basket',()=>{
  for(const [time,side] of [[0,'short'],[1200,'long']]) {
    const game=createHoops();game.input('ready');game.advance(time);game.input('shoot');game.advance(648);
    const s=game.snapshot();assert.equal(s.made,false);
    if(side==='short')assert.ok(s.ball.x+2<s.hoop.left);
    else assert.ok(s.ball.x+2>s.hoop.right);
    game.advance(252);assert.equal(game.snapshot().score,0);
  }
});


test('Heading is playable with every complete current pet sprite',()=>{
  for(const sprites of [classicSprites,sliceSprites,cyberpunkSprites,lilgotchiSprites]) {
    for(const [id,frames] of Object.entries(sprites)) {
      if(id==='egg'||!frames.idle1)continue;
      const game=createHeading({sprite:frames.idle1,random:()=>0});
      let previous=0;
      for(let t=0;t<45000&&!game.snapshot().result;t+=10) {
        const s=game.snapshot();
        if(s.ball.x<s.x-1)game.input('left');
        if(s.ball.x>s.x+1)game.input('right');
        if(s.phase==='playing'&&s.ball.y>1&&s.ball.y>=previous)game.input('jump');
        previous=s.ball.y;game.advance(10);
      }
      assert.equal(game.snapshot().result,'win',id);
    }
  }
});
