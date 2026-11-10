import { TamagotchiApp } from '../pets/game.js';
import { configureStorage,petType } from '../pets/storage.js';
const html=await(await fetch('../pets/game.html')).text();
document.body.innerHTML=new DOMParser().parseFromString(html,'text/html').body.innerHTML;
document.documentElement.dataset.pet=petType;
if(petType!=='classic'){
 const style=document.createElement('link');style.rel='stylesheet';style.href='../pets/custom-themes.css';
 await new Promise(resolve=>{style.onload=resolve;document.head.append(style);});
}
configureStorage({load:()=>null,save:()=>{}});
window.setInterval=()=>0;
const app=new TamagotchiApp(),params=new URLSearchParams(location.search);
Object.assign(app.state,{stage:'adult',character:params.get('identity')||'mametchi',hunger:4,happiness:4,energy:100,isSleeping:false,isSick:false,isDead:false});
app.arcade.open();
const game=params.get('game');
if(game==='guess'){
 app.closeOverlay('arcade-overlay');app.startGame();
 if(params.get('result')){app.gameWins=3;app.gameRound=5;app.finishGame();}
}else if(game){
 app.arcade.select(game);app.arcade.start();
 if(params.get('result')){const snap=app.arcade.model.snapshot();app.arcade.model={snapshot:()=>({...snap,result:'win',phase:'done'}),advance(){},quit(){}};app.arcade.paint();}
}
