import test from 'node:test';
import assert from 'node:assert/strict';
import {createGet} from '../pets/minigames/get.js';
import {createBump} from '../pets/minigames/bump.js';
import {createHeading} from '../pets/minigames/heading.js';
import {createMemory} from '../pets/minigames/memory.js';
import {createFlag} from '../pets/minigames/flag.js';
import {createSprint} from '../pets/minigames/sprint.js';
import {createHoops} from '../pets/minigames/hoops.js';

function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const factories={get:createGet,bump:createBump,heading:createHeading,memory:createMemory,flag:createFlag,sprint:createSprint,hoops:createHoops};
// These agents see snapshots delayed by the chosen reaction interval. They do not
// inspect hidden RNG or physics state. This is a balance probe, not human testing.
function play(id,seed,{delay=200,hold=false,slow=false,jitter=false}={}){
 const game=factories[id]({random:seeded(seed),hold,slow}),motor=seeded(seed+10000);
 let history=[],previous=null,nextInput=0,seenCue=-1,sequence=[],nextTap=3000+delay;
 for(let t=0;t<=120000;t+=20){
  const live=game.snapshot();if(live.result)return {...live,time:t};
  history.push({time:t,state:live});
  while(history.length>1&&history[1].time<=t-delay)history.shift();
  const s=history[0].state;
  if(t>=delay&&t>=nextInput){
   if(id==='get'&&s.object){
    const lane=s.object.kind==='note'?s.object.lane:s.lane===s.object.lane?(s.lane===0?1:s.lane-1):s.lane;
    if(lane!==s.lane){game.input(lane<s.lane?'left':'right');nextInput=t+160;}
   }
   if(id==='heading'&&s.phase==='playing'){
    if(s.ball.x<s.x-1)game.input('left');if(s.ball.x>s.x+1)game.input('right');
    if(previous&&s.ball.y>1&&s.ball.y>=previous.ball.y)game.input('jump');nextInput=t+100;
   }
   if(id==='bump'&&s.phase==='meter'&&s.meter>=s.target[0]&&s.meter<=s.target[1]){game.input('bump');nextInput=t+100;}
   if(id==='flag'&&s.phase==='cue'&&s.response===null&&s.cue!=='fake'){game.input(s.cue);nextInput=t+100;}
   if(id==='memory'){
    if(s.phase==='watch'&&s.cueIndex!==seenCue){if(s.cueIndex===0)sequence=[];sequence[s.cueIndex]=s.cue;seenCue=s.cueIndex;}
    if(s.phase==='answer'&&sequence[s.entered]){game.input(sequence[s.entered]);nextInput=t+Math.max(250,delay+20);}
   }
   if(id==='hoops'){
    if(s.phase==='ready'){game.input('ready');nextInput=t+delay+40;}
    else if(s.phase==='aim'&&s.marker>=s.target.min&&s.marker<=s.target.max){game.input('shoot');nextInput=t+delay+40;}
   }
   if(id==='sprint'&&s.phase==='race'&&t>=nextTap){
    game.input(hold?'start-hold':'run');nextTap=hold?Infinity:t+(jitter?450+Math.floor(motor()*101):560);
   }
  }
  previous=s;game.advance(20);
 }
 return {...game.snapshot(),time:120000};
}

const sample=100;
for(const delay of [100,200,300]){
 test(`seeded game balance with ${delay}ms delayed observations`,t=>{
  const report={};
  for(const id of Object.keys(factories)){
   const runs=Array.from({length:sample},(_,i)=>play(id,i+1,{delay}));
   assert.ok(runs.every(r=>r.result==='win'||r.result==='loss'),`${id} must finish`);
   report[id]={wins:runs.filter(r=>r.result==='win').length,total:sample,meanSeconds:Math.round(runs.reduce((a,r)=>a+r.time,0)/sample/100)/10};
  }
  t.diagnostic(JSON.stringify(report));
 });
}
test('Sprint cadence probe compares regular, jittered and steady input',t=>{
 const report={};
 for(const profile of [{name:'regular560ms'},{name:'jitter450to550ms',jitter:true},{name:'steady',hold:true}]){
  const runs=Array.from({length:sample},(_,i)=>play('sprint',i+1,{delay:200,...profile}));
  report[profile.name]={wins:runs.filter(r=>r.result==='win').length,total:sample};
 }
 assert.equal(report.jitter450to550ms.wins,sample);assert.equal(report.steady.wins,sample);assert.equal(report.regular560ms.wins,sample);
 t.diagnostic(JSON.stringify(report));
});

for(const delay of [100,200,300]) {
 test(`slower Bump and Heading balance with ${delay}ms reactions`,t=>{
  const report={};
  for(const id of ['bump','heading']) {
   const runs=Array.from({length:sample},(_,i)=>play(id,i+1,{delay,slow:true}));
   assert.ok(runs.every(r=>r.result==='win'||r.result==='loss'));
   report[id]={wins:runs.filter(r=>r.result==='win').length,total:sample};
  }
  if(delay<=200)assert.equal(report.bump.wins,sample);
  t.diagnostic(JSON.stringify(report));
 });
}

test('Sprint buffers one early tap without exceeding steady running speed',()=>{
 const taps=createSprint(),steady=createSprint({hold:true});taps.advance(3000);steady.advance(3000);steady.input('start-hold');
 for(let t=0;t<18000&&!steady.snapshot().result;t+=20){
  for(let n=0;n<10;n++)taps.input('run');
  taps.advance(20);steady.advance(20);
  assert.ok(taps.snapshot().progress<=steady.snapshot().progress);
 }
 assert.equal(taps.snapshot().result,'win');assert.equal(steady.snapshot().result,'win');
 const single=createSprint();single.advance(3000);single.input('run');single.advance(450);single.input('run');
 single.pause();single.advance(500);assert.equal(single.snapshot().progress,1);single.resume();single.advance(50);assert.equal(single.snapshot().progress,2);
 single.advance(5000);assert.equal(single.snapshot().progress,2);
});

test('slower modes preserve target rules while allowing more reaction time',()=>{
 const normal=createBump(),slow=createBump({slow:true});normal.advance(1500);slow.advance(1500);normal.advance(480);slow.advance(960);
 assert.equal(normal.snapshot().meter,slow.snapshot().meter);assert.deepEqual(normal.snapshot().target,slow.snapshot().target);
 const a=createHeading({random:()=>0}),b=createHeading({random:()=>0,slow:true});
 assert.equal(a.snapshot().remaining,45000);assert.equal(b.snapshot().remaining,75000);
 a.advance(1200);b.advance(2000);
 assert.equal(a.snapshot().phase,b.snapshot().phase);assert.ok(Math.abs(a.snapshot().ball.y-b.snapshot().ball.y)<0.15);
});

test('a buffered Sprint tap can tie the opponent at the finish',()=>{
 const game=createSprint();game.advance(3000);game.advance(3500);game.input('run');
 for(let i=1;i<29;i++){game.advance(500);game.input('run');}
 assert.equal(game.snapshot().progress,29);game.advance(450);game.input('run');game.advance(50);
 assert.equal(game.snapshot().result,'win');assert.equal(game.snapshot().elapsed,18000);
});
