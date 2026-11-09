import { arcadeSprites } from '../pets/arcade-sprites.js';
import { classicSprites } from '../pets/classic-sprites.js';
import { sliceSprites,slicePalette,sliceNames } from '../pets/slice-sprites.js';
import { cyberpunkSprites,cyberpunkPalette,cyberpunkNames } from '../pets/cyberpunk-sprites.js';
import { lilgotchiSprites,lilgotchiPalette,lilgotchiNames } from '../pets/lilgotchi-sprites.js';
const families={slice:[sliceSprites,slicePalette,sliceNames],cypunk:[cyberpunkSprites,cyberpunkPalette,cyberpunkNames],lilgotchi:[lilgotchiSprites,lilgotchiPalette,lilgotchiNames],original:[classicSprites,['','#c4da92'],{}]};
function show(){
 const family=document.querySelector('select').value;
 const [unused,palette,names]=families[family],sprites=arcadeSprites[{slice:'pizza',cypunk:'cyberpunk',original:'classic',lilgotchi:'lilgotchi'}[family]],main=document.querySelector('main');main.replaceChildren();
 for(const [id,frames] of Object.entries(sprites)){
  
  const article=document.createElement('article'),title=document.createElement('h2');title.textContent=names[id]||id;article.append(title);
  const poses=document.createElement('div');poses.className='poses';article.append(poses);
  for(const [key,label] of [['portrait','Playfield portrait']]){
   const figure=document.createElement('figure'),canvas=document.createElement('canvas'),caption=document.createElement('figcaption');canvas.width=canvas.height=16;caption.textContent=label;figure.append(canvas,caption);poses.append(figure);
   const frame=frames,ctx=canvas.getContext('2d'),x=Math.floor((16-frame[0].length)/2),y=Math.floor((16-frame.length)/2);
   frame.forEach((row,dy)=>row.forEach((color,dx)=>{if(color){ctx.fillStyle=palette[color];ctx.fillRect(x+dx,y+dy,1,1);}}));
  }
  main.append(article);
 }
}
document.querySelector('select').addEventListener('change',show);show();
