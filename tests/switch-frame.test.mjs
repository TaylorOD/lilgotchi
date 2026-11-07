import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.HTMLElement=class{};
globalThis.customElements={get:()=>true};
const {LilGotchi}=await import('../lilgotchi.js');
test('pet switching preserves frame space until the new game is ready',()=>{
  const removed=[];
  const container={style:{},classList:{remove:value=>removed.push(value)},removeAttribute:value=>removed.push(value)};
  const widget={family:'slice',shadowRoot:{querySelector:()=>container},frame:{getBoundingClientRect:()=>({height:487.2}),remove(){}},port:{close(){}},pending:new Map(),emit(){}};
  LilGotchi.prototype.detachFrame.call(widget);
  assert.equal(container.style.minHeight,'488px');assert.equal(widget.ready,false);
  widget.frame={style:{visibility:'hidden'}};
  LilGotchi.prototype.receive.call(widget,{type:'ready'},'default');
  assert.equal(widget.frame.style.visibility,'hidden');
  LilGotchi.prototype.receive.call(widget,{type:'ready'},'slice');
  assert.equal(widget.frame.style.visibility,'visible');assert.equal(container.style.minHeight,'');
  assert.deepEqual(removed,['is-loading','aria-busy']);
});
