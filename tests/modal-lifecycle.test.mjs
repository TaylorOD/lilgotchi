import test,{afterEach,mock} from 'node:test';
import assert from 'node:assert/strict';
import { TamagotchiApp } from '../pets/game.js';
import { GameState } from '../pets/engine.js';
import { Renderer } from '../pets/renderer.js';
import { C } from '../pets/constants.js';
import { setSimulationTime } from '../pets/clock.js';

function setup(){
  const nodes=new Map();
  const node=id=>{
    if(!nodes.has(id)){
      const classes=new Set();
      const element={id,style:{},textContent:'',classList:{add:key=>classes.add(key),remove:key=>classes.delete(key),contains:key=>classes.has(key),toggle(){}},focus(){document.activeElement=this;},getClientRects:()=>[{}],closest:()=>null,querySelectorAll:()=>[node(`${id}-button`)]};
      nodes.set(id,element);
    }
    return nodes.get(id);
  };
  globalThis.document={getElementById:node,querySelectorAll:()=>[...nodes.values()].filter(el=>el.id.endsWith('-overlay')&&el.classList.contains('show')),activeElement:node('settings-button')};
  globalThis.matchMedia=()=>({matches:false});
  globalThis.localStorage={getItem:()=>null,setItem(){}};
  const app=Object.assign(Object.create(TamagotchiApp.prototype),{state:new GameState(),renderer:{renderToCanvas(){}},sound:new Proxy({},{get:()=>()=>{}}),updateButtons(){},toast(){}});
  return {app,node};
}
afterEach(()=>{mock.restoreAll();setSimulationTime(null);});

test('closing inactive overlays keeps Settings isolated and preserves focus',()=>{
  const {app,node}=setup();
  app.openOverlay('settings-overlay');
  const focused=document.activeElement;
  app.closeOverlay('game-overlay');app.closeOverlay('feed-overlay');
  assert.equal(node('device').inert,true);
  assert.equal(document.activeElement,focused);
  app.closeOverlay('settings-overlay');
  assert.equal(node('device').inert,false);
  assert.equal(document.activeElement,node('settings-button'));
});

test('death invalidates a pending winning round and replaces its overlay',()=>{
  setSimulationTime(new Date(2026,0,5,12).getTime());
  const {app,node}=setup(),callbacks=[];
  mock.method(globalThis,'setTimeout',fn=>{callbacks.push(fn);return callbacks.length;});
  let saves=0;
  Object.assign(app.state,{stage:'adult',character:'mametchi',age:C.MAX_AGE,hunger:3,happiness:1,save(){saves++;}});
  app.startGame();app.gameRound=4;app.gameWins=3;app.gameGuess(app.gameDir);
  const pendingId=app.gameId;
  app.tick();
  assert.equal(app.state.isDead,true);assert.ok(saves>0);
  assert.equal(app.gameActive,false);assert.ok(app.gameId>pendingId);
  assert.equal(node('game-overlay').classList.contains('show'),false);
  assert.equal(node('death-overlay').classList.contains('show'),true);
  const happiness=app.state.happiness;
  callbacks.forEach(fn=>fn());
  app.finishGame();app.gameGuess(0);
  assert.equal(app.state.happiness,happiness);
  assert.equal(node('device').inert,true);
  assert.equal(document.activeElement,node('death-overlay-button'));
});

test('static presentation retains essential sickness and attention indicators at every phase',()=>{
  const {app}=setup();
  Object.assign(app.state,{stage:'adult',character:'mametchi',isSick:true,isMisbehaving:true,poopCount:4});
  for(const mode of ['reduced','eink','paused'])for(let frame=0;frame<90;frame++){
    globalThis.matchMedia=()=>({matches:mode==='reduced'});
    app.eink=mode==='eink';app.state.vacationAt=mode==='paused'?100:0;
    app.frame=frame;app.animState=null;
    app.renderer=Object.assign(Object.create(Renderer.prototype),{w:32,h:16,buf:Array.from({length:16},()=>new Uint8Array(32)),strictBounds:true,render(){}});
    app.render();
    assert.equal(app.frame,frame);
    const names=app.renderer.lastComposition.map(part=>part.name);
    assert.ok(names.includes('sickness'));assert.ok(names.includes('attention'));
    assert.deepEqual(app.renderer.rejectedPixels,[]);
  }
});
