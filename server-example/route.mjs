import {validContext,validReply} from '../pets/dialogue.js';
// Framework neutral route core. Nothing starts listening and no provider is bundled.
// authorize must verify a server session. Never accept an identity from the body.
export function createDialogueRoute({authorize,provider,maxCalls=100,maxCostMicros=1000000,reserveCostMicros=10000,now=Date.now}){
 if(!Number.isSafeInteger(reserveCostMicros)||reserveCostMicros<1)throw Error('Set a worst case request cost');
 let calls=0,reserved=0;const clients=new Map();
 return async function dialogue(request){
  const user=await authorize(request);if(!user)return {status:401};
  if(request.method!=='POST')return {status:405};
  // The HTTP layer must reject bodies over 2048 bytes before parsing.
  if(!validContext(request.body))return {status:400};
  const time=now(),last=clients.get(user);
  if(last!==undefined && time-last<10000)return {status:429};
  if(calls>=maxCalls || reserved+reserveCostMicros>maxCostMicros)return {status:429};
  clients.set(user,time);calls++;reserved+=reserveCostMicros;
  // Reservations are deliberately not refunded on failure or timeout.
  const controller=new AbortController();let timer;
  try{
   const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Timeout'));},7000);});
   const text=await Promise.race([provider(Object.freeze({...request.body}),{signal:controller.signal,maxOutputTokens:60}),timeout]);
   return validReply(text)?{status:200,body:{text}}:{status:502};
  }catch{return {status:502};}finally{clearTimeout(timer);}
 };
}
