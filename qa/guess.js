import { TamagotchiApp } from '../pets/game.js';
import { configureStorage,petType } from '../pets/storage.js';
import { setSimulationTime } from '../pets/clock.js';
const html=await(await fetch('../pets/game.html')).text();
document.body.innerHTML=new DOMParser().parseFromString(html,'text/html').body.innerHTML;
document.documentElement.dataset.pet=petType;
if(petType!=='classic'){
 const style=document.createElement('link');style.rel='stylesheet';style.href='../pets/custom-themes.css';
 await new Promise(resolve=>{style.onload=resolve;document.head.append(style);});
}
configureStorage({load:()=>null,save:()=>{}});setSimulationTime(new Date(2026,10,9,12).getTime());
window.setInterval=()=>0;window.requestAnimationFrame=()=>0;
const app=new TamagotchiApp();Object.assign(app.state,{stage:'adult',character:'mametchi',isSleeping:false});
app.startGame();
// A repeatable answer lets reviewers check both correct and incorrect guesses.
const params=new URLSearchParams(location.search);app.gameDir=params.get('direction')==='right'?1:0;
if(params.get('hold')==='1'){
 window.setTimeout=()=>0;app.gameGuess(app.gameDir);
}
