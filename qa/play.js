import { TamagotchiApp } from '../pets/game.js';
import { games } from '../pets/arcade-catalog.js';
import { SP } from '../pets/skins.js';
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
const params=new URLSearchParams(location.search);
if(params.has('at'))window.requestAnimationFrame=()=>0;
const app=new TamagotchiApp();
Object.assign(app.state,{stage:'adult',character:params.get('identity')||'mametchi',hunger:4,happiness:4,energy:100,isSleeping:false,isSick:false,isDead:false});
app.arcade.open();
const game=params.get('game');
if(game==='guess'){
 app.closeOverlay('arcade-overlay');app.startGame();
 if(params.get('result')){app.gameWins=3;app.gameRound=5;app.finishGame();}
}else if(game){
 app.arcade.select(game);app.arcade.start();
 if(params.has('at')){
  app.arcade.model=games[game].create({random:()=>0,sprite:SP[app.state.character].idle1});
  if(game==='hoops'){app.arcade.model.input('shoot');app.arcade.model.advance(600);app.arcade.model.input('shoot');}
  app.arcade.model.advance(Number(params.get('at')));
  if(params.get('input'))app.arcade.model.input(params.get('input'));
  if(params.get('after'))app.arcade.model.advance(Number(params.get('after')));
  app.arcade.paint();
 }
 if(params.get('result')){const snap=app.arcade.model.snapshot();app.arcade.model={snapshot:()=>({...snap,result:'win',phase:'done'}),advance(){},quit(){}};app.arcade.paint();}
}
