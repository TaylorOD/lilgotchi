import { TamagotchiApp } from '../pets/game.js';
import { configureStorage, petType } from '../pets/storage.js';
import { setSimulationTime } from '../pets/clock.js';
import { time, applyFixture } from './fixtures.js';

const html=await (await fetch('../pets/game.html')).text();
document.body.innerHTML=new DOMParser().parseFromString(html,'text/html').body.innerHTML;
document.documentElement.dataset.pet=petType;
if(petType!=='classic'){
  const style=document.createElement('link'); style.rel='stylesheet';style.href='../pets/custom-themes.css';
  await new Promise(resolve=>{style.onload=resolve;style.onerror=resolve;document.head.append(style);});
}
configureStorage({load:()=>null,save:()=>{}});
setSimulationTime(time);
// A frozen QA view never advances time, writes saves or plays delayed audio.
const animate=window.requestAnimationFrame.bind(window);
window.setInterval=()=>0;window.setTimeout=()=>0;window.requestAnimationFrame=()=>0;
window.matchMedia=()=>({matches:false});
const app=new TamagotchiApp();
applyFixture(app,Object.fromEntries(new URLSearchParams(location.search)),time);
if(new URLSearchParams(location.search).get('animate')==='1') {
  const loop=()=>{app.render();animate(loop);};animate(loop);
}
document.body.dataset.qaReady='true';
