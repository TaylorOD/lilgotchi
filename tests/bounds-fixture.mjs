import assert from 'node:assert/strict';
globalThis.location={search:`?pet=${process.argv[2]}`};
globalThis.matchMedia=()=>({matches:false});
const {TamagotchiApp}=await import('../pets/game.js');
const {Renderer}=await import('../pets/renderer.js');
const {SP,palette}=await import('../pets/skins.js');
const {frameInfo,overlaps,placeFrame}=await import('../pets/layout.js');
const {setSimulationTime}=await import('../pets/clock.js');
setSimulationTime(1000000);
for(const [character,entry] of Object.entries(SP)) {
  if(Array.isArray(entry))continue;
  for(const pixels of Object.values(entry)) {
    const info=frameInfo(pixels);
    assert.ok(info.width<=16&&info.height<=(character==='egg'?10:process.argv[2]==='classic'?16:12),`${character}: body must fit its allocation`);
    for(const row of pixels)for(const value of row)assert.ok(value<=(palette.length?palette.length-1:1));
    const context={fillRect(){},fillStyle:''};
    const canvas={getContext:()=>context};
    Renderer.prototype.renderToCanvas.call({bg:'#fff',fg:'#000'},canvas,pixels);
    assert.equal(canvas.width,info.width*4);assert.equal(canvas.height,info.height*4);
    for(let x=-info.width;x<=32;x++)for(const y of [-info.height,0,8,16]) {
      const r=Object.assign(Object.create(Renderer.prototype),{w:32,h:16,buf:Array.from({length:16},()=>new Uint8Array(32)),strictBounds:true});
      r.clear();const position=placeFrame(pixels,x,y);r.drawSprite(pixels,position.x,position.y);
      assert.equal(r.buf.reduce((sum,row)=>sum+row.filter(Boolean).length,0),info.count);
      assert.deepEqual(r.rejectedPixels,[]);
    }
  }
  for(let frame=0;frame<90;frame++)for(const reaction of ['idle','eat','happy','sad','evolve','discipline','medicine','clean','sleep','lights-off','waste','sick','attention','combined','death']) {
    const r=Object.assign(Object.create(Renderer.prototype),{w:32,h:16,buf:Array.from({length:16},()=>new Uint8Array(32)),strictBounds:true,render(){}});
    const app=Object.assign(Object.create(TamagotchiApp.prototype),{
      renderer:r,frame,animTimer:1000000,
      state:{stage:character==='egg'?'egg':'adult',character,stageStartTime:900000,hunger:3,happiness:2,
        isDead:reaction==='death',isSleeping:['sleep','lights-off'].includes(reaction),lightOn:reaction!=='lights-off',
        poopCount:['waste','combined'].includes(reaction)?4:0,isSick:['sick','combined'].includes(reaction),isMisbehaving:['attention','combined'].includes(reaction)},
      animState:['eat','happy','sad','evolve','discipline','medicine','clean'].includes(reaction)?reaction:null,
    });
    app.render();
    assert.deepEqual(r.rejectedPixels,[],`${character} ${reaction} ${frame}`);
    for(let i=0;i<r.lastComposition.length;i++)for(let j=i+1;j<r.lastComposition.length;j++)assert.equal(overlaps(r.lastComposition[i].bounds,r.lastComposition[j].bounds),false);
    for(const item of r.lastComposition) {
      const info=frameInfo(item.pixels);
      let visible=0;
      item.pixels.forEach((row,y)=>row.forEach((value,x)=>{if(value){assert.equal(r.buf[item.y+y][item.x+x],value);visible++;}}));
      assert.equal(visible,info.count);
    }
  }
}
