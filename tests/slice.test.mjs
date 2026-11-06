import test from 'node:test';
import assert from 'node:assert/strict';
import {sliceSprites, sliceNames, slicePalette} from '../pets/slice-sprites.js';
import {classicSprites} from '../pets/classic-sprites.js';
import {frameInfo} from '../pets/layout.js';

test('Slice supplies immutable complete frames with distinct silhouettes and stable anchors',()=>{
  assert.equal(Object.keys(sliceSprites).length,12);
  const silhouettes=new Set();
  for(const [name,frames] of Object.entries(sliceSprites)){
    assert.ok(sliceNames[name]);
    const expected=name==='egg'?['idle1','idle2']:['idle1','idle2','happy','sad','eat','sleep'];
    assert.deepEqual(Object.keys(frames),expected);
    for(const pixels of Object.values(frames)){
      assert.ok(Object.isFrozen(pixels)&&pixels.every(Object.isFrozen));
      const info=frameInfo(pixels);
      assert.equal(info.width,12);
      assert.equal(info.height,name==='egg'?10:12);
      assert.deepEqual(info.anchor,{x:6,y:info.height-1});
      for(const row of pixels)for(const value of row)assert.ok(value<slicePalette.length);
      assert.notDeepEqual(pixels,classicSprites[name].idle1);
    }
    assert.notDeepEqual(frames.idle1,frames.idle2,`${name} animates`);
    silhouettes.add(frames.idle1.map(row=>row.map(v=>v?1:0).join('')).join('/'));
    if(name!=='egg')assert.notDeepEqual(frames.sleep,frames.idle1);
  }
  assert.equal(silhouettes.size,12);
});
