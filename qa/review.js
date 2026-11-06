import { identities, reactions, time, applyFixture } from './fixtures.js';
const form=document.querySelector('form');
for(const name of identities)form.elements.identity.add(new Option(name,name));
for(const name of reactions)form.elements.reaction.add(new Option(name,name));
form.elements.identity.value='mametchi';
const source=await (await fetch('../reference/upstream.html')).text();
function show(){
  const settings=Object.fromEntries(new FormData(form));
  document.getElementById('fork').src='frame.html?'+new URLSearchParams(settings);
  const freeze=`<script>const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${time}]))}static now(){return ${time}}};window.setInterval=()=>0;window.setTimeout=()=>0;window.requestAnimationFrame=()=>0;Math.random=()=>.5;<\/script>`;
  const setup=`<script>GameState.prototype.load=()=>false;GameState.prototype.save=()=>{};GameState.prototype.clearSave=()=>{};AIManager.prototype.talk=async()=>null;TamagotchiApp.prototype.applyTheme=function(){document.documentElement.classList.toggle('eink',this.eink);this.renderer.updateColors()};const app=new TamagotchiApp();app.ai.key=null;(${applyFixture.toString()})(app,${JSON.stringify(settings)},${time});document.body.dataset.qaReady='true';<\/script>`;
  document.getElementById('original').srcdoc=source.replace('<head>','<head>'+freeze).replace("document.addEventListener('DOMContentLoaded',()=>{ window.app=new TamagotchiApp(); });",'').replace('</body>',setup+'</body>');
}
form.addEventListener('submit',event=>{event.preventDefault();show();});
show();
