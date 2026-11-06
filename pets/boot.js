import { TamagotchiApp } from './game.js';
import { petType, validState, configureStorage } from './storage.js';

const params=new URLSearchParams(location.search);
const embedded=params.get('embed')==='1';
let channel=null;
let saved=null;
let saveId=0;
document.documentElement.dataset.pet=petType;
function start(initial, muted=true) {
  saved=initial;
  if(embedded) configureStorage({load:()=>saved,save:state=>{
    saved=state;
    channel.postMessage({type:'save',id:++saveId,state});
  }});
  window.app=new TamagotchiApp();
  if(!muted) window.app.handleAction('mute');
  document.getElementById('mute-btn').addEventListener('click',()=>channel?.postMessage({type:'preference',name:'muted',value:window.app.sound.muted}));
  window.app.state.save();
  if(channel) channel.postMessage({type:'ready'});
}
if(embedded) {
  const expectedOrigin=params.get('parentOrigin');
  const nonce=params.get('nonce');
  const connect=event=>{
    if(event.source!==parent || event.origin!==expectedOrigin || event.data?.type!=='lilgotchi:connect' || event.data.nonce!==nonce || !event.ports[0] || channel) return;
    window.removeEventListener('message',connect);
    channel=event.ports[0];
    channel.onmessage=event=>{
      const message=event.data;
      if(!message || typeof message.type!=='string') return;
      if(message.type==='snapshot' && Number.isSafeInteger(message.id) && window.app) {
        if(message.closing)window.app.gameActive=false;
        channel.postMessage({type:'snapshot',id:message.id,state:JSON.parse(JSON.stringify(window.app.state))});
      }
      if(message.type==='save-status') document.getElementById('save-status').textContent=String(message.text||'').slice(0,160);
    };
    const initial=event.data.state;
    start(validState(initial)?initial:null,event.data.muted!==false);
  };
  window.addEventListener('message',connect);
} else start(null);
window.addEventListener('pagehide',()=>window.app?.state.save());
window.restorePetSession=data=>{
  if(!window.app || !validState(data)) return;
  for(const key of Object.keys(window.app.state)) if(Object.hasOwn(data,key)) window.app.state[key]=data[key];
  window.app.processMissedTime(); window.app.updateButtons();
};
document.addEventListener('keydown',event=>{
  const overlay=document.querySelector('.overlay.show');
  if(event.key==='Escape') {
    event.preventDefault();
    if(overlay && overlay.id!=='death-overlay') {
      window.app.gameActive=false; window.app.closeOverlay(overlay.id);
    } else if(channel) channel.postMessage({type:'close'});
  }
  if(event.key==='Tab' && overlay) {
    const controls=[...overlay.querySelectorAll('button:not(:disabled), input')];
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
    else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
  }
});
