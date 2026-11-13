import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const {LilGotchi}=await import('../lilgotchi.js');
function setup(saved=null){
  const created=[],released=[];
  const element=()=>({style:{},classList:{add(){},remove(){}},setAttribute(){},removeAttribute(){},append(){},addEventListener(){}});
  globalThis.document={createElement(tag){created.push(tag);if(tag==='iframe')throw new Error('game mounted');return element();}};
  const nodes=new Map();
  const widget={family:'slice',isConnected:true,hasAttribute:()=>false,updateLauncher(){},status(value){this.statusText=value;},shadowRoot:{querySelector(selector){if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);}},store:{preference:()=>0,acquire:async()=>true,load:()=>saved,release:family=>released.push(family)}};
  return {widget,created,released};
}
test('opening an unstarted family releases its lease without creating a game',async()=>{
  const {widget,created,released}=setup();
  await LilGotchi.prototype.mount.call(widget);
  assert.equal(created.includes('iframe'),false);
  assert.deepEqual(released,['slice']);
  assert.equal(widget.statusText,'Not started');
});
test('only an explicit start or existing save mounts the game',async()=>{
  for(const [saved,start] of [[null,true],[{state:{},savedAt:Date.now()},false]]){
    const {widget}=setup(saved);
    await assert.rejects(LilGotchi.prototype.mount.call(widget,start),/game mounted/);
  }
});
test('Start pet passes activation through the serial queue',async()=>{
  const calls=[];
  const widget={family:'slice',serial:fn=>fn(),unload:async()=>calls.push('unload'),mount:async start=>calls.push(start),updateLauncher(){},select:{focus(){}}};
  await LilGotchi.prototype.startPet.call(widget);
  assert.deepEqual(calls,['unload',true]);
});
