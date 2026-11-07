import test from 'node:test';
import assert from 'node:assert/strict';
import { periodAt, careAction, careHint, motionOffset } from '../pets/presentation.js';
import { TamagotchiApp } from '../pets/game.js';
import { Renderer } from '../pets/renderer.js';
import { SP } from '../pets/skins.js';
import { setSimulationTime } from '../pets/clock.js';
import { overlaps } from '../pets/layout.js';
import { overlayControls } from '../pets/focus.js';

test('overlay focus skips hidden rows, disabled toggles and closed disclosures',()=>{
  const make=extra=>({disabled:false,getClientRects:()=>[{}],closest:()=>null,...extra});
  const hiddenTheme=make({closest:selector=>selector==='[hidden], [inert]'?{}:null});
  const unavailableDialogue=make({disabled:true});
  const scanlines=make({id:'scanlines'}),close=make({id:'close'});
  const concealed=make({getClientRects:()=>[]});
  const closed=make({closest:selector=>selector==='details:not([open])'?{}:null,tagName:'BUTTON'});
  const overlay={querySelectorAll:()=>[hiddenTheme,unavailableDialogue,scanlines,concealed,closed,close]};
  assert.deepEqual(overlayControls(overlay),[scanlines,close]);
});

test('local scenery boundaries and contextual care remain predictable',()=>{
  for(const [hour,expected] of [[0,'night'],[5,'night'],[6,'morning'],[10,'morning'],[11,'afternoon'],[15,'afternoon'],[16,'evening'],[18,'evening'],[19,'night']])assert.equal(periodAt(new Date(2026,0,1,hour)),expected);
  assert.equal(careAction({poopCount:2,isSleeping:true}),'clean');
  assert.equal(careAction({poopCount:0,isSleeping:true}),'wake');
  assert.equal(careAction({poopCount:0,isSleeping:false}),'sleep');
  assert.match(careHint({isSick:true,health:100}),/medicine/);
  assert.match(careHint({stage:'egg'}),/90 seconds/);
});

test('motion keeps complete bodies separate from simultaneous care indicators',()=>{
  globalThis.matchMedia=()=>({matches:false});
  for(const [character,frames] of Object.entries(SP)){
    if(Array.isArray(frames)||character==='egg')continue;
    for(let elapsed=0;elapsed<10000;elapsed+=137){
      setSimulationTime(1000000+elapsed);
      const renderer=Object.assign(Object.create(Renderer.prototype),{w:32,h:16,buf:Array.from({length:16},()=>new Uint8Array(32)),strictBounds:true,render(){}});
      const app=Object.assign(Object.create(TamagotchiApp.prototype),{renderer,presentationEnabled:true,frame:elapsed,animState:null,state:{character,stage:'adult',poopCount:4,isSick:true,isMisbehaving:true}});
      app.render();
      assert.deepEqual(renderer.rejectedPixels,[]);
      for(let i=0;i<renderer.lastComposition.length;i++)for(let j=i+1;j<renderer.lastComposition.length;j++)assert.equal(overlaps(renderer.lastComposition[i].bounds,renderer.lastComposition[j].bounds),false);
      assert.ok(Number.isInteger(motionOffset(elapsed).x));
      app.eink=true;assert.deepEqual(app.petMotion(),{x:0,y:0});
    }
  }
  setSimulationTime(null);
});
