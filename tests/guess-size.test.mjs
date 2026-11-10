import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../pets/renderer.js';
import {classicSprites} from '../pets/classic-sprites.js';
import {sliceSprites} from '../pets/slice-sprites.js';
import {cyberpunkSprites} from '../pets/cyberpunk-sprites.js';
import {lilgotchiSprites} from '../pets/lilgotchi-sprites.js';
const renderer=Object.assign(Object.create(Renderer.prototype),{bg:'#000',fg:'#fff'});
function canvas(){const calls=[];return {calls,getContext:()=>({fillRect:(...args)=>calls.push(args)})};}
test('full guessing poses render at double scale without cropping any family or stage',()=>{
 for(const sprites of [classicSprites,sliceSprites,cyberpunkSprites,lilgotchiSprites])for(const [identity,frames] of Object.entries(sprites)){
  if(identity==='egg'||!frames.idle1)continue;
  for(const name of ['idle1','lookLeft','lookRight','happy','sad']){
   const frame=frames[name],output=canvas();renderer.renderToCanvas(output,frame,8);
   assert.equal(output.width,frame[0].length*8);assert.equal(output.height,frame.length*8);
   assert.ok(output.width<=128&&output.height<=128);
   const pixels=output.calls.slice(1);assert.equal(pixels.length,frame.flat().filter(Boolean).length);
   for(const [x,y,w,h] of pixels){assert.equal(w,8);assert.equal(h,8);assert.ok(x>=0&&y>=0&&x+w<=output.width&&y+h<=output.height);}
  }
 }
});
test('other canvas previews retain their original default scale',()=>{
 const output=canvas();renderer.renderToCanvas(output,sliceSprites.mametchi.idle1);
 assert.equal(output.width,48);assert.equal(output.height,48);
 for(const scale of [0,-1,1.5,NaN])assert.throws(()=>renderer.renderToCanvas(output,sliceSprites.mametchi.idle1,scale),RangeError);
});


test('guessing field centers every full pet with visible space on each side',()=>{
 for(const sprites of [classicSprites,sliceSprites,cyberpunkSprites,lilgotchiSprites])for(const frames of Object.values(sprites)){
  if(!frames.lookLeft)continue;
  for(const name of ['idle1','lookLeft','lookRight']){
   const output=canvas(),frame=frames[name];renderer.renderToCanvas(output,frame,8,{field:true});
   assert.equal(output.width,256);assert.equal(output.height,192);
   assert.equal(output.calls.length-1,frame.flat().filter(Boolean).length);
   for(const [x,y,w,h] of output.calls.slice(1)){assert.ok(x>=0&&y>=0&&x+w<=256&&y+h<=192);}
  }
 }
});
