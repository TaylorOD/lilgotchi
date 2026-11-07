import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { upstreamAt, plain } from './upstream-harness.mjs';

globalThis.location={search:'?pet=classic'};
const { TamagotchiApp }=await import('../pets/game.js');
const { GameState }=await import('../pets/engine.js');
const { Renderer }=await import('../pets/renderer.js');
const { SoundManager }=await import('../pets/sound.js');
const { setSimulationTime }=await import('../pets/clock.js');
const { classicSprites }=await import('../pets/classic-sprites.js');
const { C }=await import('../pets/constants.js');
const noon=new Date(2026,0,5,12).getTime();
const elements=new Map();
const element=id=>{
  if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},querySelector(){return this;},focus(){}});
  return elements.get(id);
};
globalThis.document={getElementById:element,querySelectorAll:()=>[],activeElement:element('focus')};
globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
globalThis.matchMedia=()=>({matches:false});
afterEach(()=>{mock.restoreAll();setSimulationTime(null);elements.clear();});

function pair(overrides={},randomValues=[.5]){
  setSimulationTime(noon);
  const upstream=upstreamAt(noon,randomValues);
  const make=(prototype,state)=>{
    const app=Object.assign(Object.create(prototype),{state,ai:{on:false},sound:new Proxy({},{get:()=>()=>{}}),renderer:{renderToCanvas(){}},frame:0});
    for(const method of ['toast','updateButtons','showDeath','openOverlay','closeOverlay'])app[method]=()=>{};
    Object.assign(state,{stage:'child',character:'marutchi',hunger:3,happiness:2,weight:10},overrides);
    return app;
  };
  return {upstream,actual:make(TamagotchiApp.prototype,new GameState()),expected:make(upstream.TamagotchiApp.prototype,new upstream.GameState())};
}
function same(actual,expected){
  const state=plain(actual.state);
  // Additive wellbeing has its own migration and elapsed time tests.
  // Keep every original care field in this upstream comparison.
  for(const key of ['lastProcessed','energy','health','wellbeingUpdatedAt','careTotal','careDuration','sleepOverride','sleepOverrideUntil'])delete state[key];
  assert.deepEqual(state,plain(expected.state));
}
function both(pair,method,...args){pair.actual[method](...args);pair.expected[method](...args);same(pair.actual,pair.expected);}

test('Default stylesheet is the complete pinned original',()=>{
  const source=readFileSync(new URL('../reference/upstream.html',import.meta.url),'utf8').match(/<style>([\s\S]*?)<\/style>/)[1].trim();
  assert.equal(readFileSync(new URL('../pets/game.css',import.meta.url),'utf8').trim(),source);
});

test('care actions and refusals match original state transitions',()=>{
  mock.method(Math,'random',()=>.5);
  const p=pair();
  both(p,'doFeed','meal');both(p,'doFeed','meal');
  both(p,'doFeed','snack');both(p,'doFeed','snack');both(p,'doFeed','snack');
  for(const app of [p.actual,p.expected])Object.assign(app.state,{isSick:true,medDoses:2,poopCount:4,isMisbehaving:true});
  for(const action of ['medicine','medicine','medicine','clean','clean','discipline','discipline','light','light'])both(p,'handleAction',action);
  for(const app of [p.actual,p.expected])app.state.isSleeping=true;
  both(p,'doFeed','meal');both(p,'doFeed','snack');both(p,'handleAction','play');
});

test('snack sickness, random discipline calls and care mistakes match original',()=>{
  mock.method(Math,'random',()=>.5);
  const p=pair();
  for(let i=0;i<10;i++){
    p.actual.state.happiness=p.expected.state.happiness=0;
    both(p,'doFeed','snack');
  }
  both(p,'checkAttention');
  setSimulationTime(noon+C.CARE_WINDOW);p.upstream.setTime(noon+C.CARE_WINDOW);
  both(p,'tick');
  const q=pair({hunger:0,happiness:0});
  both(q,'checkAttention');
  setSimulationTime(noon+C.CARE_WINDOW);q.upstream.setTime(noon+C.CARE_WINDOW);
  both(q,'tick');
});

test('hatch, evolution and adult mortality match original while awake',()=>{
  mock.method(Math,'random',()=>.5);
  for(const [stage,character,delay] of [['egg','egg',C.EGG_MS],['baby','babytchi',C.BABY_MS],['child','marutchi',C.CHILD_MS],['teen','tamatchi',C.TEEN_MS]]){
    const p=pair({stage,character,stageStartTime:noon-Math.max(delay,stage==='egg'?300000:0),discipline:100});
    both(p,'tick');
  }
  for(const reason of [{careMistakes:5},{age:25}]){
    const p=pair({stage:'adult',character:'mametchi',...reason});both(p,'tick');
  }
});

test('random misbehavior and secret evolution use the original thresholds',()=>{
  mock.method(Math,'random',()=>.01);
  const p=pair({},[.01]);both(p,'maybeMisbehave');assert.equal(p.actual.state.isMisbehaving,true);
  const q=pair({stage:'adult',character:'maskutchi',discipline:100,age:10},[.01]);
  both(q,'tick');assert.equal(q.actual.state.character,'oyajitchi');
});

test('offline timer fraction preservation is an explicit upstream difference',()=>{
  const p=pair();
  setSimulationTime(noon+600000);p.upstream.setTime(noon+600000);
  p.actual.processMissedTime();p.expected.processMissedTime();
  assert.equal(p.actual.state.lastHungerDecay,noon);
  assert.equal(p.expected.state.lastHungerDecay,noon+600000);
  assert.equal(p.actual.state.hunger,p.expected.state.hunger);
});

test('all five guessing rounds preserve outcomes and weight for wins and losses',()=>{
  mock.method(Math,'random',()=>.5);
  for(const guess of [0,1]){
    const timers=[];
    mock.method(globalThis,'setTimeout',callback=>{timers.push(callback);return timers.length;});
    const p=pair();both(p,'startGame');
    for(let round=0;round<5;round++){
      both(p,'gameGuess',guess);
      timers.splice(0).forEach(callback=>callback());p.upstream.runTimers();
      same(p.actual,p.expected);
      assert.equal(p.actual.gameWins,p.expected.gameWins);
      assert.equal(p.actual.gameRound,p.expected.gameRound);
    }
    assert.equal(p.actual.gameActive,false);
  }
});

function drawing(prototype){return Object.assign(Object.create(prototype),{w:32,h:16,buf:Array.from({length:16},()=>new Uint8Array(32)),render(){}});}
test('Default compositions match source apart from the relocated clipped HUD',()=>{
  for(const character of Object.keys(classicSprites).filter(key=>!Array.isArray(classicSprites[key]))){
    for(const frame of [0,14,29,44,59,89])for(const reaction of ['idle','eat','happy','sad','evolve','discipline','medicine','clean','sleep','waste','sick','death']){
      const p=pair({character,stage:character==='egg'?'egg':'adult'});
      const make=(app,prototype)=>{
        app.renderer=drawing(prototype);app.frame=frame;
        if(app===p.expected) {
          // Only the source HUD operations move outside the LCD. All bodies,
          // effects and progress pixels remain part of the source comparison.
          app.renderer.drawHearts=()=>{};
          app.renderer.drawText=function(text,x,y){if(text!=='EGG')prototype.drawText.call(this,text,x,y);};
        }
        app.animState=['idle','sleep','waste','sick','death'].includes(reaction)?null:reaction;app.animTimer=noon;
        app.state.isSleeping=reaction==='sleep';app.state.poopCount=reaction==='waste'?4:0;app.state.isSick=reaction==='sick';app.state.isDead=reaction==='death';
        app.render();
      };
      make(p.actual,Renderer.prototype);make(p.expected,p.upstream.Renderer.prototype);
      assert.deepEqual(p.actual.renderer.buf,p.expected.renderer.buf,`${character} ${reaction} ${frame}`);
    }
  }
});

test('Default raster colors and pixel rectangles match source with both light states',()=>{
  const upstream=upstreamAt();
  for(const invert of [false,true])for(const colors of [['#c4cfa1','#0f380f'],['#f0f0f0','#111']]){
    const calls=[];
    const make=prototype=>Object.assign(drawing(prototype),{bg:colors[0],fg:colors[1],ctx:{fillStyle:'',fillRect(...args){calls.push([this.fillStyle,...args]);}},render:prototype.render});
    const actual=make(Renderer.prototype);actual.drawSprite(classicSprites.mametchi.idle1,8,2);actual.render(invert);
    const got=calls.splice(0);
    const expected=make(upstream.Renderer.prototype);expected.drawSprite(classicSprites.mametchi.idle1,8,2);expected.render(invert);
    assert.deepEqual(got,calls);
  }
});

test('all sound cues retain source frequencies, durations and volumes',()=>{
  const upstream=upstreamAt();
  for(const name of ['btnPress','attention','happy','sad','gameWin','gameLose','death','hatch','eat','clean','medicine','discipline','denied']){
    const timers=[],actual=[],expected=[];
    mock.method(globalThis,'setTimeout',callback=>{timers.push(callback);});
    const a=new SoundManager(),b=new upstream.SoundManager();
    a.beep=(...args)=>actual.push(args);b.beep=(...args)=>expected.push(args);
    a[name]();b[name]();timers.splice(0).forEach(callback=>callback());upstream.runTimers();
    assert.deepEqual(actual,plain(expected),name);
  }
});
