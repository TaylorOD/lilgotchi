import test from 'node:test';
import assert from 'node:assert/strict';
import { growthEvent, GrowthCelebration } from '../pets/celebrations.js';
import { motionOffset, careHint, tiltFrame } from '../pets/presentation.js';
import { classicSprites } from '../pets/classic-sprites.js';
import { sliceSprites } from '../pets/slice-sprites.js';
import { cyberpunkSprites } from '../pets/cyberpunk-sprites.js';
import { frameInfo, drawScene, overlaps } from '../pets/layout.js';
import { Renderer } from '../pets/renderer.js';

const baby={stage:'baby',character:'babytchi',bornAt:100,stageStartTime:200};
function fixture() {
  const make=()=>({classList:{add(){}},setAttribute(){},addEventListener(type,fn){this[type]=fn;}});
  return {hidden:true,ownerDocument:{createElement:make},classList:{add(){}},replaceChildren(...nodes){this.children=nodes;}};
}

test('growth detects hatch and secret forms without inventing events on reopen',()=>{
  assert.equal(growthEvent(null,baby),null);
  assert.equal(growthEvent(baby,{...baby}),null);
  assert.equal(growthEvent(baby,{...baby,isDead:true}),null);
  assert.equal(growthEvent({stage:'egg',character:'egg'},baby).hatched,true);
  assert.equal(growthEvent({stage:'adult',character:'maskutchi'},{...baby,stage:'adult',character:'oyajitchi'}).hatched,false);
});

test('growth cards remain until dismissed and never interpret names as markup',()=>{
  const element=fixture(),card=new GrowthCelebration(element,{nameFor:()=>'<b>Pet</b>'});
  const event=card.observe({stage:'egg',character:'egg'},baby);
  assert.equal(element.hidden,false);
  assert.match(element.children[0].textContent,/<b>Pet<\/b>/);
  assert.equal(element.children[0].innerHTML,undefined);
  assert.equal(element.children[1].textContent,'Got it');
  const children=element.children;
  card.show(event);assert.equal(element.children,children);
  element.children[1].click();assert.equal(element.hidden,true);
  card.show(event);assert.equal(element.hidden,true);
  card.observe(baby,{...baby,character:'marutchi',stage:'child',stageStartTime:400});
  assert.equal(element.hidden,false);
  card.clear();assert.equal(element.hidden,true);assert.deepEqual(element.children,[]);
});

test('landing settles once and all movement remains bounded whole pixels',()=>{
  assert.deepEqual(motionOffset(0,'land'),{x:0,y:-2});
  for(const time of [650,1000,10000])assert.deepEqual(motionOffset(time,'land'),{x:0,y:0});
  for(const kind of ['idle','eat','happy','play','evolve','sleep','land'])for(let time=0;time<10000;time+=73){
    const offset=motionOffset(time,kind);
    assert.ok(Number.isInteger(offset.x)&&Number.isInteger(offset.y));
    assert.ok(Math.abs(offset.x)<=1&&offset.y>=-2&&offset.y<=0);
    for(const options of [{reducedMotion:true},{eink:true},{paused:true}])assert.deepEqual(motionOffset(time,kind,options),{x:0,y:0});
  }
  assert.match(careHint({vacationAt:10}),/Vacation paused/);
});

test('pixel tilt preserves every source color and lands within safe composition bounds',()=>{
  for(const sprites of [classicSprites,sliceSprites,cyberpunkSprites])for(const [name,entry] of Object.entries(sprites)){
    if(Array.isArray(entry)||name==='egg')continue;
    for(const pixels of [entry.idle1,entry.idle2])for(const time of [0,1000,3000,7000,10000]){
      const tilted=tiltFrame(pixels,time),info=frameInfo(tilted);
      assert.ok(info.width<=16);
      assert.equal(info.height,pixels.length);
      assert.deepEqual(tilted.flat().filter(Boolean).sort(),pixels.flat().filter(Boolean).sort());
      for(const kind of ['idle','land']){
        const offset=motionOffset(time%651,kind);
        const renderer=Object.assign(Object.create(Renderer.prototype),{w:32,h:16,buf:Array.from({length:16},()=>new Uint8Array(32)),strictBounds:true});
        renderer.clear();
        const parts=drawScene(renderer,[{name,pixels:tilted,x:8+offset.x,y:3+offset.y},{name:'waste',pixels:classicSprites.poop,x:27,y:11},{name:'sick',pixels:classicSprites.skull,x:1,y:1}]);
        assert.deepEqual(renderer.rejectedPixels,[]);
        for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)assert.equal(overlaps(parts[i].bounds,parts[j].bounds),false);
      }
    }
  }
});
