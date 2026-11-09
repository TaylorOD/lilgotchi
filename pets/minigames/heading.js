import {model,clamp} from './model.js';
export function createHeading() {
  const s={id:'heading',phase:'countdown',result:null,paused:false,elapsed:0,remaining:45000,score:0,misses:0,x:16,jump:0,ball:{x:16,y:1},phaseTime:0};
  let jumpTime=-1,velocity=0,moveTime=-100;
  const serve=()=>{s.ball={x:s.x,y:1};velocity=.006+Math.floor(s.score/3)*.001;s.phase='playing';};
  return model(s,dt=>{
    s.elapsed+=dt;s.remaining=Math.max(0,45000-s.elapsed);s.phaseTime+=dt;
    if(jumpTime>=0){jumpTime+=dt;s.jump=3*Math.sin(Math.PI*Math.min(1,jumpTime/700));if(jumpTime>=700){jumpTime=-1;s.jump=0;}}
    if(s.phase==='countdown'&&s.phaseTime>=1000)serve();
    if(s.phase==='playing'){
      const previous=s.ball.y;s.ball.y+=velocity*dt;
      velocity+=dt*.000012;
      if(s.ball.y<1){s.ball.y=1;velocity=Math.abs(velocity);}
      const head=10-s.jump;
      if(velocity>0&&jumpTime>=0&&previous<=head&&s.ball.y>=head&&Math.abs(s.ball.x-s.x)<=3){
        s.score++;s.ball.y=head;velocity=-.012-Math.floor(s.score/3)*.001;
        if(s.score>=10){s.result='win';s.phase='done';}
      }else if(s.ball.y>=14){s.misses++;s.phase='countdown';s.phaseTime=0;s.ball.y=14;}
    }
    if(!s.result&&(s.misses>=3||!s.remaining)){s.result='loss';s.phase='done';}
  },action=>{
    if(['left','right'].includes(action)&&s.elapsed-moveTime>=100){s.x=clamp(s.x+(action==='left'?-2:2),4,27);moveTime=s.elapsed;}
    if(action==='jump'&&s.phase==='playing'&&jumpTime<0)jumpTime=0;
  });
}
