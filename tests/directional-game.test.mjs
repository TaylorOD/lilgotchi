import test,{mock,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import { TamagotchiApp } from '../pets/game.js';
import { GameState } from '../pets/engine.js';
import { SP } from '../pets/skins.js';
import { classicSprites } from '../pets/classic-sprites.js';
import { sliceSprites } from '../pets/slice-sprites.js';
import { cyberpunkSprites } from '../pets/cyberpunk-sprites.js';
import { lilgotchiSprites } from '../pets/lilgotchi-sprites.js';

afterEach(()=>mock.restoreAll());
function game(){
 const nodes=new Map(),drawn=[],timers=[];
 globalThis.document={getElementById:id=>{
  if(!nodes.has(id))nodes.set(id,{textContent:'',focus(){},classList:{add(){},remove(){},contains:()=>false}});
  return nodes.get(id);
 }};
 globalThis.localStorage={getItem:()=>null,setItem(){}};
 mock.method(globalThis,'setTimeout',(fn,delay)=>{timers.push({fn,delay});return timers.length;});
 mock.method(globalThis,'clearTimeout',()=>{});
 const app=Object.assign(Object.create(TamagotchiApp.prototype),{
  state:Object.assign(new GameState(),{stage:'adult',character:'mametchi',happiness:0}),
  renderer:{renderToCanvas:(_,frame)=>drawn.push(frame)},sound:new Proxy({},{get:()=>()=>{}}),
  openOverlay(){},updateButtons(){},
 });
 app.startGame();return {app,nodes,drawn,timers};
}
test('every hatched identity has distinct directional poses that fit the game canvas',()=>{
 for(const [family,sprites] of Object.entries({original:classicSprites,slice:sliceSprites,cypunk:cyberpunkSprites,lilgotchi:lilgotchiSprites})){
  for(const [id,frames] of Object.entries(sprites)){
   if(id==='egg'||!frames.idle1)continue;
   assert.notDeepEqual(frames.lookLeft,frames.lookRight,`${family} ${id}`);
   for(const pose of ['lookLeft','lookRight']){
    const frame=frames[pose];assert.ok(frame&&frame.length<=16&&frame.every(row=>row.length<=16));
    assert.notDeepEqual(frame,frames.idle1,`${family} ${id} ${pose}`);
    assert.notDeepEqual(frame,frames.idle1.map(row=>[...row].reverse()),'not a flipped neutral pose');
   }
  }
 }
});
test('answer pose lasts 700ms before reaction and the next round still starts at 1200ms',()=>{
 for(const answer of [0,1])for(const guess of [0,1]){
  const {app,drawn,timers,nodes}=game();app.gameDir=answer;
  assert.equal(drawn.at(-1),SP.mametchi.idle1);
  app.gameGuess(guess);
  assert.equal(drawn.at(-1),SP.mametchi[answer?'lookRight':'lookLeft']);
  assert.match(nodes.get('game-result').textContent,new RegExp(answer?'RIGHT':'LEFT'));
  assert.equal(app.gameWins,Number(answer===guess));
  assert.deepEqual(timers.map(t=>t.delay),[700,1200]);
  app.gameGuess(guess);assert.equal(timers.length,2);
  timers[0].fn();assert.equal(drawn.at(-1),SP.mametchi[answer===guess?'happy':'sad']);
  timers[1].fn();assert.equal(app.gamePhase,'waiting');assert.equal(drawn.at(-1),SP.mametchi.idle1);
 }
});
test('close, restart, death, vacation and frame cancellation invalidate pending poses and rounds',()=>{
 for(const stop of ['close','restart','death','vacation','cancel']){
  const {app,drawn,timers}=game();app.gameGuess(app.gameDir);const stale=[...timers];
  if(stop==='close')app.closeOverlay('game-overlay');
  if(stop==='restart')app.startGame();
  if(stop==='death')app.state.isDead=true;
  if(stop==='vacation')app.state.vacationAt=Date.now();
  if(stop==='cancel')app.cancelGame();
  const count=drawn.length,round=app.gameRound,happy=app.state.happiness;
  stale.forEach(timer=>timer.fn());
  assert.equal(drawn.length,count,stop);assert.equal(app.gameRound,round,stop);assert.equal(app.state.happiness,happy,stop);
 }
});
test('a finished guessing game keeps replay and back available without duplicate rewards',()=>{
 const {app,timers,nodes}=game();app.gameRound=5;app.gameWins=3;app.finishGame();
 assert.equal(timers.length,0);assert.equal(nodes.get('guess-actions').hidden,true);
 assert.equal(nodes.get('guess-replay').hidden,false);const happiness=app.state.happiness;
 app.finishGame();assert.equal(app.state.happiness,happiness);
 app.startGame();assert.equal(app.gameActive,true);assert.equal(app.gameRound,0);
 assert.equal(nodes.get('guess-actions').hidden,false);assert.equal(nodes.get('guess-replay').hidden,true);
});
