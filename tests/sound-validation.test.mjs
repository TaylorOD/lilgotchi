import test,{mock,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {SoundManager} from '../pets/sound.js';
afterEach(()=>mock.restoreAll());
function audio(){
 const oscillators=[],gains=[],timers=[];
 const sound=new SoundManager();
 const ctx={currentTime:7,destination:{},state:'running',createOscillator(){const node={frequency:{},connect(target){this.target=target;},start(){this.started=true;},stop(time){this.stopTime=time;}};oscillators.push(node);return node;},createGain(){const node={gain:{},connect(target){this.target=target;}};gains.push(node);return node;}};
 sound.ctx=ctx;
 mock.method(globalThis,'setTimeout',(callback,delay)=>{timers.push({callback,delay});return timers.length;});
 const flush=()=>{for(const timer of timers.splice(0).sort((a,b)=>a.delay-b.delay)){ctx.currentTime=7+timer.delay/1000;timer.callback();}};
 return {sound,ctx,oscillators,gains,timers,flush};
}
test('beep connects a square oscillator through gain and schedules its stop in seconds',()=>{
 const {sound,ctx,oscillators,gains}=audio();sound.muted=false;sound.beep(660,100,.08);
 assert.equal(oscillators.length,1);const tone=oscillators[0];
 assert.equal(tone.type,'square');assert.equal(tone.frequency.value,660);assert.equal(tone.started,true);assert.equal(tone.stopTime,7.1);
 assert.equal(tone.target,gains[0]);assert.equal(gains[0].gain.value,.08);assert.equal(gains[0].target,ctx.destination);
});
test('every optional sound stays silent while muted or the drawer is suspended',()=>{
 for(const suspended of [false,true]){
  const {sound,oscillators,flush}=audio();sound.muted=!suspended;sound.suspended=suspended;
  for(const name of ['btnPress','attention','happy','sad','gameWin','gameLose','death','hatch','eat','clean','medicine','discipline','denied'])sound[name]();
  flush();assert.equal(oscillators.length,0);assert.equal(sound.muted,!suspended);
 }
});
test('muting or suspending between notes suppresses pending sound callbacks',()=>{
 for(const stop of ['muted','suspended']){
  const {sound,oscillators,flush}=audio();sound.muted=false;sound.happy();assert.equal(oscillators.length,1);
  sound[stop]=true;flush();assert.equal(oscillators.length,1);
 }
});
test('all sound sequences have the expected note order, durations and bounded gain',()=>{
 const expected={btnPress:[[800,50]],attention:[[1000,100],[1200,100]],happy:[[600,80],[900,120]],sad:[[300,200]],gameWin:[[600,100],[800,100],[1000,100]],gameLose:[[400,100],[200,200]],death:[[200,500]],hatch:[[500,80],[600,80],[700,80],[800,80]],eat:[[500,60],[600,60]],clean:[[700,50],[900,50],[1100,50]],medicine:[[400,80],[600,80],[800,80]],discipline:[[200,100],[400,100]],denied:[[200,150]]};
 for(const [name,notes] of Object.entries(expected)){
  const {sound,oscillators,gains,flush,ctx}=audio();sound.muted=false;
  const starts=[];const create=ctx.createOscillator;ctx.createOscillator=()=>{starts.push(ctx.currentTime);return create();};
  sound[name]();flush();assert.deepEqual(oscillators.map(tone=>tone.frequency.value),notes.map(note=>note[0]),name);
  oscillators.forEach((tone,i)=>assert.ok(Math.abs((tone.stopTime-starts[i])*1000-notes[i][1])<.0001,name));
  assert.ok(gains.every(node=>node.gain.value>0&&node.gain.value<=.15));
 }
});
test('audio initialization supports prefixed contexts and catches unavailable hardware',async()=>{
 let created=0,resumed=0;
 globalThis.window={webkitAudioContext:class{constructor(){created++;this.state='suspended';}resume(){resumed++;return Promise.reject(new Error('blocked'));}}};
 const sound=new SoundManager();assert.doesNotThrow(()=>sound.init());await Promise.resolve();sound.init();await Promise.resolve();
 assert.equal(created,1);assert.equal(resumed,2);
 globalThis.window={AudioContext:class{constructor(){throw new Error('unavailable');}}};
 const missing=new SoundManager();assert.doesNotThrow(()=>missing.init());missing.muted=false;assert.doesNotThrow(()=>missing.beep(660,100));
});
test('unsupported or failed audio never stops a game action',()=>{
 const {sound}=audio();sound.muted=false;sound.ctx.createOscillator=()=>{throw new Error('disconnected');};
 assert.doesNotThrow(()=>sound.beep(660,100));
});
