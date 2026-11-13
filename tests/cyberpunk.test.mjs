import test from 'node:test';
import assert from 'node:assert/strict';
import {cyberpunkSprites, cyberpunkNames, cyberpunkPalette} from '../pets/cyberpunk-sprites.js';
import {classicSprites} from '../pets/classic-sprites.js';
import {frameInfo} from '../pets/layout.js';

test('Cyberpunk supplies immutable complete frames with distinct silhouettes and stable anchors',()=>{
  assert.equal(Object.keys(cyberpunkSprites).length,12);
  const silhouettes=new Set();
  for(const [name,frames] of Object.entries(cyberpunkSprites)){
    assert.ok(cyberpunkNames[name]);
    const expected=name==='egg'?['idle1','idle2']:['idle1','idle2','happy','sad','eat','sleep','lookLeft','lookRight','lookUp'];
    assert.deepEqual(Object.keys(frames),expected);
    for(const pixels of Object.values(frames)){
      assert.ok(Object.isFrozen(pixels)&&pixels.every(Object.isFrozen));
      const info=frameInfo(pixels);
      assert.ok(info.width>=12 && info.width<=14);
      assert.ok(info.height<=(name==='egg'?10:15));
      assert.deepEqual(info.anchor,{x:Math.floor(info.width/2),y:info.height-1});
      for(const row of pixels)for(const value of row)assert.ok(value<cyberpunkPalette.length);
      assert.notDeepEqual(pixels,classicSprites[name].idle1);
    }
    assert.notDeepEqual(frames.idle1,frames.idle2,`${name} animates`);
    silhouettes.add(frames.idle1.map(row=>row.map(v=>v?1:0).join('')).join('/'));
    if(name!=='egg')assert.notDeepEqual(frames.sleep,frames.idle1);
  }
  assert.equal(silhouettes.size,12);
});


test('Binary Seed preserves readable 01 in both stable boot frames',()=>{
  for(const matrix of Object.values(cyberpunkSprites.egg)) {
    const glyph=(x)=>matrix.slice(3,8).map(row=>row.slice(x,x+3).map(value=>value===1?'1':'0').join(''));
    assert.deepEqual(glyph(3),['111','101','101','101','111']);
    assert.deepEqual(glyph(7),['010','110','010','010','111']);
  }
});

test('Cyberpunk expressions remain distinct without changing their canvas or feet',()=>{
  for(const [name,frames] of Object.entries(cyberpunkSprites)) {
    if(name==='egg') continue;
    assert.equal(new Set(Object.values(frames).map(frame=>JSON.stringify(frame))).size,9,name);
    for(const key of ['happy','sad','eat','sleep','lookLeft','lookRight','lookUp'])assert.deepEqual(frames[key].at(-1),frames.idle1.at(-1),name);
  }
});
