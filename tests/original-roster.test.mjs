import test from 'node:test';
import assert from 'node:assert/strict';
import { originalSprites } from '../pets/original-sprites.js';
import { p1Stages,p2Stages,evolveP2,elderFor } from '../pets/original-roster.js';
import { GameState,Evo } from '../pets/engine.js';
import { getCharacter } from '../pets/catalog.js';
import { SaveStore,parseImport,validEnvelope } from '../widget/save-store.js';
import { frameInfo } from '../pets/layout.js';

test('all 26 original identities have complete immutable source poses',()=>{
  const ids=[...new Set([...Object.values(p1Stages).flat(),...Object.values(p2Stages).flat()])].filter(id=>id!=='egg');
  assert.equal(ids.length,26);
  assert.deepEqual(Object.keys(originalSprites).sort(),ids.sort());
  for(const id of ids)for(const pose of ['idle1','idle2','happy','sad','eat','sleep','lookLeft','lookRight','lookUp']){
    const frame=originalSprites[id][pose],info=frameInfo(frame);
    assert.ok(info.width<=16&&info.height<=16,`${id}.${pose}`);
    assert.ok(Object.isFrozen(frame)&&frame.every(Object.isFrozen));
    assert.ok(frame.flat().every(pixel=>pixel===0||pixel===1));
  }
});

test('P2 hatches and grows through its own identities and every adult is reachable',()=>{
  const state=new GameState(getCharacter('original2'));
  for(const id of ['shirobabytchi','tonmarutchi','tongaritchi']){
    Object.assign(state,Evo.evolve(state));assert.equal(state.character,id);
  }
  const adults=new Set();
  for(const character of p2Stages.teen)for(const careMistakes of [0,2,3,5])for(const discipline of [0,25,50,75,100])for(const value of [0,.999]){
    adults.add(evolveP2({stage:'teen',character,careMistakes,discipline},()=>value).character);
  }
  for(const value of [0,.34,.999])adults.add(elderFor({character:'zuccitchi',age:10,discipline:100},()=>value));
  assert.deepEqual([...adults].sort(),[...p2Stages.adult].sort());
  assert.equal(elderFor({character:'zuccitchi',age:9,discipline:100}),null);
  assert.equal(elderFor({character:'zuccitchi',age:10,discipline:75}),null);
  assert.equal(elderFor({character:'mimitchi',age:10,discipline:100}),null);
});

test('P1 regional elders do not change custom family elders',()=>{
  for(const family of ['default','slice','cyberpunk','lilgotchi']){
    const state=new GameState(getCharacter(family));
    Object.assign(state,{stage:'adult',character:'maskutchi',age:10,discipline:100});
    assert.equal(elderFor(state,()=>0),family==='default'?'bill':'oyajitchi');
    assert.equal(elderFor(state,()=>.999),'oyajitchi');
  }
});

test('P1 and P2 saves stay separate through every stage, import and reload',async()=>{
  const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const store=new SaveStore('original-test',{storage,locks:null});
  try{
    for(const family of ['default','original2']){
      assert.ok(await store.acquire(family));store.load(family);
      for(const [stage,ids] of Object.entries(family==='default'?p1Stages:p2Stages))for(const character of ids){
        const state=new GameState(getCharacter(family));
        Object.assign(state,{stage,character,prevTeen:stage==='adult'?(family==='default'?'tamatchi':'tongaritchi'):null});
        store.save(family,state);
        const imported=parseImport(store.raw(family));
        assert.equal(imported.state.character,character);
        assert.equal(imported.family,family);
        const loaded=store.load(family).state;
        assert.equal(loaded.character,character);
        if(character!=='egg'){
          assert.equal(validEnvelope({...imported,family:family==='default'?'original2':'default'}),false);
          assert.equal(validEnvelope({...imported,family:family==='default'?'original2':'default',state:{...state,isDead:true,stage:'dead'}}),false);
        }
      }
    }
    assert.equal(store.load('default').state.character,'bill');
    assert.equal(store.load('original2').state.character,'zatchi');
    assert.equal(store.migrateLegacy('original2'),false);
  }finally{store.dispose();}
});
