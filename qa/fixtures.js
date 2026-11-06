export const time = new Date(2026, 0, 5, 12).getTime();
export const identities = ['egg','babytchi','marutchi','tamatchi','kuchitamatchi','mametchi','ginjirotchi','maskutchi','kuchipatchi','nyorotchi','tarakotchi','oyajitchi'];
export const reactions = ['idle','happy','sad','eat','evolve','discipline','medicine','clean','sleep','lights-off','sick','attention','waste','death','stats','settings','game','win','loss'];

// Shared by both QA frames. Production builds do not include this module.
export function applyFixture(app, settings, fixedTime) {
  const identity=settings.identity||'mametchi';
  const stage=identity==='egg'?'egg':identity==='babytchi'?'baby':identity==='marutchi'?'child':['tamatchi','kuchitamatchi'].includes(identity)?'teen':'adult';
  app.state.reset();
  Object.assign(app.state,{stage,character:identity,age:stage==='adult'?4:0,weight:25,hunger:3,happiness:2,discipline:75,stageStartTime:fixedTime-60000});
  app.eink=settings.theme==='eink'; app.applyTheme();
  document.getElementById('eink-toggle')?.classList.toggle('on',app.eink);
  app.sound.muted=true;
  app.animState=null;
  app.frame=Number(settings.frame||0)-1;
  document.querySelectorAll('.overlay').forEach(node=>node.classList.remove('show'));
  const reaction=settings.reaction||'idle';
  if(['happy','sad','eat','evolve','discipline','medicine','clean'].includes(reaction)) {app.animState=reaction;app.animTimer=fixedTime;}
  if(reaction==='sleep'||reaction==='lights-off'){app.state.isSleeping=true;app.state.lightOn=reaction!=='lights-off';}
  if(reaction==='sick'){app.state.isSick=true;app.state.medDoses=2;}
  if(reaction==='attention')app.state.isMisbehaving=true;
  if(reaction==='waste')app.state.poopCount=4;
  if(reaction==='death'){app.state.isDead=true;app.state.stage='dead';}
  app.updateButtons(); app.render();
  if(reaction==='stats')app.showStats();
  if(reaction==='settings')app.openOverlay('settings-overlay');
  if(reaction==='death')app.showDeath();
  if(['game','win','loss'].includes(reaction)){
    app.startGame();
    if(reaction!=='game'){app.gameWins=reaction==='win'?4:1;app.finishGame();}
  }
}
