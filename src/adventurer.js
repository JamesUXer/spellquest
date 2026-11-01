import {frames} from './adventurer-frames.js';
export const SPRITE_HEIGHT=82;
export const WALK_CYCLE=.56;
export const sprite={ready:false,failed:false};
const image=typeof Image==='undefined'?null:new Image();
if(image){image.onload=()=>{sprite.ready=true};image.onerror=()=>{sprite.failed=true};image.src=new URL('../assets/player/hooded-adventurer-atlas.png',import.meta.url).href}
const rows={down:0,up:1,left:2,right:3};
// Reuse the reference's actual boots. The coat, hands and asymmetric satchel stay intact.
export const boots=[
 [[110,273,42,36],[162,272,43,37]],
 [[111,558,43,42],[165,558,45,42]],
 [[113,854,45,31],[166,853,42,32]],
 [[109,1144,45,35],[162,1144,54,35]]
];
export function playerFrame(player){const row=rows[player.facing]??1;return {row,column:0,rect:frames[row][0]}}
export function walkPose(player){
 const side=player.facing==='left'||player.facing==='right';
 const direction=player.facing==='left'?-1:1;
 const phase=(player.walkTime||0)/WALK_CYCLE*Math.PI*2+Math.PI/2;
 const legs=[0,1].map(index=>{
  const angle=phase+index*Math.PI,swing=Math.max(0,Math.cos(angle));
  const stride=Math.sin(angle),lift=swing*4.5;
  return {index,hipX:side?(index?3:-3):(index?7:-7),
   x:side?stride*10*direction:(index?7:-7),
   y:(side?(index?0:-1):stride*(player.facing==='up'?-3.5:3.5))-lift,
   lift,rotation:side?swing*Math.sin(angle)*.16*direction:0};
 });
 return {legs,bob:-Math.abs(Math.cos(phase))*.7};
}
export function drawLeg(ctx,leg,boot,atlas){
 const hip=leg.hipX,knee=hip+(leg.x-hip)*.5,ankle=leg.y-7;
 ctx.fillStyle=leg.index?'#4a4a4a':'#3e3e3e';ctx.strokeStyle='#171717';ctx.lineWidth=.9;ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(hip-3.5,-23);ctx.quadraticCurveTo(knee-4,-13-leg.lift*.3,leg.x-3,ankle);
 ctx.lineTo(leg.x+3,ankle);ctx.quadraticCurveTo(knee+4,-13-leg.lift*.3,hip+3.5,-23);ctx.closePath();ctx.fill();ctx.stroke();
 const [sx,sy,sw,sh]=boot,h=11,w=sw/sh*h;
 ctx.save();ctx.translate(leg.x,leg.y);ctx.rotate(leg.rotation);ctx.drawImage(atlas,sx,sy,sw,sh,-w/2,-h,w,h);ctx.restore();
}
export function drawAdventurer(ctx,player){
 if(!sprite.ready)return false;
 const {row,rect}=playerFrame(player),[sx,sy,sw,sh]=rect,height=SPRITE_HEIGHT,width=sw/sh*height;
 ctx.save();ctx.translate(player.x,player.y);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.filter='grayscale(1)';
 if(!player.moving){ctx.drawImage(image,sx,sy,sw,sh,-width/2,-height,width,height);ctx.restore();return true}
 const pose=walkPose(player),side=row>1;
 // Opposite legs swing independently. The planted boot remains level while the other lifts.
 const order=side?pose.legs:[...pose.legs].sort((a,b)=>a.y-b.y);
 for(const leg of order)drawLeg(ctx,leg,boots[row][leg.index],image);
 // Clip away the old static legs; preserve the hood, face, cape, hands and satchel.
 const upper=.8;
 ctx.drawImage(image,sx,sy,sw,sh*upper,-width/2,-height+pose.bob,width,height*upper);
 ctx.restore();return true;
}
