import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { frameInfo, placeFrame, drawScene, overlaps } from '../pets/layout.js';
import { Renderer } from '../pets/renderer.js';
import { classicSprites } from '../pets/classic-sprites.js';
import { pixelSize } from '../pets/pixel-size.js';

const renderer=()=>Object.assign(Object.create(Renderer.prototype),{w:32,h:16,buf:Array.from({length:16},()=>new Uint8Array(32)),strictBounds:true,render(){}});
const visible=r=>r.buf.flatMap(row=>Array.from(row)).filter(Boolean).length;

test('display sizing uses whole device pixels without overflowing at zoom',()=>{
  for(const width of [160,224,246,300,352])for(const dpr of [1,1.25,1.5,2,3]) {
    const size=pixelSize(width,dpr);
    assert.ok(Number.isInteger(size.scale));assert.ok(Number.isInteger(size.width));
    assert.ok(size.cssWidth<=width);assert.equal(size.height,size.width/2);
    assert.equal(size.width/dpr,size.cssWidth);
  }
});

test('frame validation rejects malformed matrices and records opaque bounds',()=>{
  assert.throws(()=>frameInfo([[1],[1,0]]),/rectangular/);
  assert.throws(()=>frameInfo([[0]]),/no visible/);
  assert.throws(()=>frameInfo([[1.5]]),/palette/);
  assert.deepEqual(frameInfo([[0,1,0],[0,1,1]]),{width:3,height:2,left:1,right:2,top:0,bottom:1,count:3,anchor:{x:1,y:1}});
});

test('every frame remains complete across both edges and every integer travel position',()=>{
  for(const entry of Object.values(classicSprites))for(const pixels of Array.isArray(entry)?[entry]:Object.values(entry)) {
    const info=frameInfo(pixels);
    for(let x=-info.width;x<=32;x++)for(const y of [-info.height,0,8,16]) {
      const r=renderer();r.clear();
      const point=placeFrame(pixels,x,y);
      r.drawSprite(pixels,point.x,point.y);
      assert.equal(visible(r),info.count);
      assert.deepEqual(r.rejectedPixels,[]);
    }
  }
});

test('attached effects are repositioned instead of covering body pixels',()=>{
  const r=renderer();r.clear();
  const parts=drawScene(r,[
    {name:'body',pixels:classicSprites.mametchi.idle1,x:22,y:9},
    {name:'food',pixels:classicSprites.meal,x:22,y:9},
    {name:'sleep',pixels:classicSprites.zzz,x:24,y:11},
  ]);
  for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)assert.equal(overlaps(parts[i].bounds,parts[j].bounds),false);
  assert.equal(visible(r),parts.reduce((sum,item)=>sum+frameInfo(item.pixels).count,0));
  assert.throws(()=>placeFrame(Array.from({length:17},()=>Array(33).fill(1)),0,0),/does not fit/);
});

test('maximum body allocation leaves room for all care indicators together',()=>{
  const body=Array.from({length:12},()=>Array(16).fill(1));
  const items=[{name:'largest body',pixels:body,x:8,y:3}];
  for(let i=0;i<4;i++)items.push({name:`waste ${i}`,pixels:classicSprites.poop,x:27-(i%2)*5,y:11-Math.floor(i/2)*5});
  items.push({name:'sick',pixels:classicSprites.skull,x:1,y:1},{name:'attention',pixels:[[1],[1],[1],[0],[1]],x:1,y:8});
  const r=renderer();r.clear();
  drawScene(r,items);
  assert.equal(visible(r),items.reduce((count,item)=>count+frameInfo(item.pixels).count,0));
});

test('strict renderer diagnoses family, frame and rejected coordinates',()=>{
  const r=renderer();r.clear();r.drawingContext='test frame';
  assert.throws(()=>r.setPixel(32,0),/test frame/);
  assert.deepEqual(r.rejectedPixels[0],{family:'pizza',frame:'test frame',x:32,y:0,value:1});
});

test('all families render every frame and reaction without clipping or collisions',()=>{
  for(const family of ['classic','pizza','cyberpunk']) {
    const result=spawnSync(process.execPath,['tests/bounds-fixture.mjs',family],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
    assert.equal(result.status,0,`${family}: ${result.stdout}\n${result.stderr}`);
  }
});
