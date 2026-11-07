import test from 'node:test';
import assert from 'node:assert/strict';
import { launcherArt, savedCare } from '../widget/launcher.js';
import { installSnippet } from '../widget/install-snippet.js';

test('launcher follows saved evolution while keeping the selected family palette',()=>{
  assert.notEqual(launcherArt('slice',{character:'egg'}),launcherArt('slice',{character:'mametchi'}));
  assert.notEqual(launcherArt('slice',{character:'mametchi'}),launcherArt('cyberpunk',{character:'mametchi'}));
  assert.notEqual(launcherArt('default',{character:'tarakotchi'}),launcherArt('default',{character:'egg'}));
  assert.equal(savedCare({stage:'egg',hunger:0}), '');
  assert.equal(savedCare({stage:'baby',isSick:true,hunger:0,poopCount:1}), 'Needs medicine, cleaning, food');
  assert.equal(savedCare({isDead:true}), 'Your pet passed away');
  assert.equal(savedCare({vacationAt:123,hunger:0,isSick:true}), '');
});
test('install snippets constrain selected character and reject empty or injected configuration',()=>{
  const snippet=installSnippet({characters:'default,cyberpunk',character:'slice',placement:'top-left',appearance:'light'});
  assert.match(snippet,/character="default"/);assert.match(snippet,/placement="top-left"/);assert.match(snippet,/appearance="light"/);
  for(const placement of ['bottom-left','bottom-right','top-left','top-right']){
    assert.ok(installSnippet({placement}).includes(`data-placement="${placement}"`));
  }
  assert.throws(()=>installSnippet({placement:'inline'}));
  assert.throws(()=>installSnippet({characters:''}));
  assert.throws(()=>installSnippet({characters:'slice" onclick="bad'}));
  assert.throws(()=>installSnippet({placement:'elsewhere'}));
});

globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const { LilGotchi }=await import('../lilgotchi.js');
const { SaveStore }=await import('../widget/save-store.js');
test('scanline preference persists per host instance and rejects stale or invalid frame changes',()=>{
  const values=new Map();const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const store=new SaveStore('scanline-test',{storage,locks:null});
  const widget={family:'slice',store};
  LilGotchi.prototype.receive.call(widget,{type:'preference',name:'scanlines',value:true},'slice');
  assert.equal(new SaveStore('scanline-test',{storage,locks:null}).preference('scanlines'),'true');
  assert.equal(new SaveStore('another-instance',{storage,locks:null}).preference('scanlines'),null);
  LilGotchi.prototype.receive.call(widget,{type:'preference',name:'scanlines',value:false},'default');
  LilGotchi.prototype.receive.call(widget,{type:'preference',name:'scanlines',value:'false'},'slice');
  assert.equal(store.preference('scanlines'),'true');
  LilGotchi.prototype.receive.call(widget,{type:'preference',name:'scanlines',value:false},'slice');
  assert.equal(store.preference('scanlines'),'false');
});
