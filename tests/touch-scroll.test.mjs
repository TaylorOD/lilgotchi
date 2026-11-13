import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source=readFileSync(new URL('../pets/boot.js',import.meta.url),'utf8');
function gesture() {
  const handlers={},deltas=[];
  runInNewContext(source.slice(source.indexOf('// Frames cannot naturally')),{
    document:{addEventListener:(name,handler)=>{handlers[name]=handler;}},
    channel:{postMessage:message=>deltas.push(message.delta)},innerHeight:740,
  });
  const touch=(name,screenY,clientY)=>handlers[name]({touches:[{screenY,clientY}],preventDefault(){}});
  return {handlers,deltas,touch};
}

test('moving the iframe does not feed back into a swipe',()=>{
  const {touch,deltas}=gesture();
  touch('touchstart',500,300);
  touch('touchmove',480,280);
  touch('touchmove',460,280);
  touch('touchmove',440,280);
  touch('touchmove',440,300);
  assert.deepEqual(deltas,[20,20,20,0]);
});

test('reverse swipes keep their direction as the frame moves',()=>{
  const {touch,deltas}=gesture();
  touch('touchstart',400,200);
  touch('touchmove',420,220);
  touch('touchmove',440,220);
  assert.deepEqual(deltas,[-20,-20]);
});

for(const end of ['touchend','touchcancel'])test(`${end} clears the previous gesture`,()=>{
  const {handlers,touch,deltas}=gesture();
  touch('touchstart',500,300);
  handlers[end]();
  touch('touchmove',480,280);
  assert.deepEqual(deltas,[]);
});
