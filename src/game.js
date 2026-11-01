import * as W from './world.js?v=solid-trees-1';
import {createPenReceipt} from './pen-receipt.js';
import {atWorkshopDoor} from './workshop-entry.js';
import {sprite as playerSprite} from './adventurer.js';
import {drawObject,drawWater,drawBridge,drawPlayer,drawLetter,drawSign,drawCharacter} from './art.js?v=solid-trees-1';
import {createEncounters,nearestCharacter} from './encounters.js';

const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),KEY='spellquest.forest.v2';
const player={...W.SPAWN,facing:'up',moving:false,walkTime:0},camera={...W.SPAWN},collected=[];
const progress={met:[],spotted:[]};
let arrived=false,storageAvailable=true;
const receiptStorage={getItem:key=>localStorage.getItem(key),removeItem:key=>localStorage.removeItem(key)};
let penReceipt=createPenReceipt(receiptStorage);
try {
 const current=localStorage.getItem(KEY),s=JSON.parse(current||localStorage.getItem('spellquest.forest.v1'));
 if(s){
  if(Array.isArray(s.collected))collected.push(...[...new Set(s.collected)].filter(x=>W.letters.some(l=>l.id===x)));
  const x=current?s.x:Math.round(s.x*.82),y=current?s.y:Math.round(s.y*.82);
  const position=W.findWalkableNear(x,y);
  if(position){player.x=position.x;player.y=position.y}
  arrived=!!s.arrived;
  for(let type of ['met','spotted'])if(Array.isArray(s[type]))progress[type]=[...new Set(s[type])].filter(id=>W.characters.some(c=>c.id===id));
 }
}catch{storageAvailable=false}
Object.assign(camera,{x:player.x,y:player.y});
let width=innerWidth,height=innerHeight,scale=1,keys=new Set(),last=0,saveElapsed=0,toastUntil=0,currentZone=0;
const scenery=W.scenery,decor=scenery.filter(o=>['grass','flower','pebble'].includes(o.type)),solids=scenery.filter(o=>!decor.includes(o));
const talkButton=document.querySelector('#interact');
const modalOpen=()=>!!document.querySelector('dialog[open]');
function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;scale=Math.max(.62,Math.min(.88,width/1350));ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();
function save(){try{localStorage.setItem(KEY,JSON.stringify({x:player.x,y:player.y,collected,arrived,...progress}))}catch{storageAvailable=false}}
const conversations=createEncounters({characters:W.characters,progress,onOpen:()=>{keys.clear();player.moving=false;talkButton.hidden=true},onProgress:save,onClose:()=>{keys.clear();canvas.focus()}});
function updatePouch(){document.querySelector('#pen-owned').hidden=!penReceipt.received;document.querySelector('.pouch-label').hidden=penReceipt.received;document.querySelector('#letters').hidden=penReceipt.received;document.querySelector('#count').hidden=penReceipt.received;document.querySelector('#letters').replaceChildren(...['O','S','I','U'].map(letter=>{let el=document.createElement('span');el.className=collected.includes(letter)?'':'empty';el.textContent=collected.includes(letter)?letter:'·';return el}));document.querySelector('#count').textContent=`${collected.length} / 4`}
function toast(text){let el=document.querySelector('#toast');el.textContent=text;el.classList.add('visible');toastUntil=performance.now()+4200}
function zone(){let z=W.zoneAt(player.x,player.y);if(z.id!==currentZone){currentZone=z.id;document.querySelector('#chapter').textContent=`0${z.id} · ${z.caption}`;document.querySelector('#place').textContent=z.name}}
function talk(){if(modalOpen())return;if(atWorkshopDoor(player,W.destination)){keys.clear();save();location.assign('workshop.html?scene=owl&source=forest');return}const npc=nearestCharacter(player,W.characters);if(npc)conversations.open(npc)}
talkButton.onclick=talk;
const movementKeys=['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'];
addEventListener('keydown',e=>{
 if(e.target instanceof HTMLButtonElement)return;
 const key=e.key.toLowerCase();
 if((key==='e'||key===' ')&&!modalOpen()){e.preventDefault();if(!e.repeat)talk();return}
 if(movementKeys.includes(key)&&!modalOpen()){e.preventDefault();keys.add(key)}
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keys.clear();save()});document.addEventListener('visibilitychange',()=>{keys.clear();save()});
for(let button of document.querySelectorAll('[data-dir]')){
 const key='arrow'+button.dataset.dir;
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(modalOpen())return;button.setPointerCapture(e.pointerId);keys.add(key)});
 for(let event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>keys.delete(key));
}
canvas.addEventListener('click',e=>{canvas.focus();if(modalOpen())return;const bounds=canvas.getBoundingClientRect(),x=(e.clientX-bounds.left-width/2)/scale+camera.x,y=(e.clientY-bounds.top-height/2)/scale+camera.y;if(atWorkshopDoor(player,W.destination)&&Math.abs(x-W.destination.x)<120&&Math.abs(y-(W.destination.y-90))<150){talk();return}const npc=nearestCharacter(player,W.characters);if(npc&&Math.hypot(x-npc.x,y-(npc.y-40))<85)conversations.open(npc)});
document.querySelector('#restart').onclick=()=>{keys.clear();if(!penReceipt.clear())storageAvailable=false;Object.assign(player,W.SPAWN,{facing:'up',moving:false,walkTime:0});Object.assign(camera,W.SPAWN);collected.length=0;progress.met.length=0;progress.spotted.length=0;arrived=false;save();updatePouch();canvas.focus();toast('A fresh adventure. Who will you meet?')};
document.querySelector('#help').onclick=()=>{keys.clear();document.querySelector('#instructions').showModal()};
document.querySelector('#close-help').onclick=()=>{document.querySelector('#instructions').close();canvas.focus()};
function update(dt,time){
 let dx=Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a')),dy=Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'));
 if(dy)dx=0;if(modalOpen()){dx=0;dy=0;keys.clear()}
 player.moving=!!(dx||dy);if(player.moving){player.facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';const before={x:player.x,y:player.y};W.move(player,dx*205*dt,dy*205*dt);player.moving=Math.hypot(player.x-before.x,player.y-before.y)>.001;if(player.moving)player.walkTime+=dt}
 for(let id of W.collectAt(player,collected)){updatePouch();save();toast(`You found ${id}. ${collected.length} of 4 letters tucked away.`)}
 if(!arrived&&Math.hypot(player.x-W.destination.x,player.y-W.destination.y)<105){arrived=true;save();toast(collected.length===4?'All four letters, and the owl’s hut. You made it!':'You found the owl’s hut. There are still letters in the forest.')}
 document.querySelector('#guidance').textContent=penReceipt.received?'You carry the awakened pen. Your first spell is complete.':arrived?(collected.length===4?'You have all four letters. Enter the owl’s workshop.':'The owl’s hut is here. Wander back for the remaining letters.'):'Arrow keys / WASD · Meet the forest folk and find the owl’s hut.';
 const npc=nearestCharacter(player,W.characters);talkButton.hidden=(!npc&&!atWorkshopDoor(player,W.destination))||modalOpen();if(atWorkshopDoor(player,W.destination))talkButton.textContent='Enter the owl’s workshop · E / Space';else if(npc)talkButton.textContent=`Talk to ${npc.name} · E / Space`;
 const smoothing=1-Math.exp(-5*dt);camera.x+=(player.x-camera.x)*smoothing;camera.y+=(player.y-95-camera.y)*smoothing;let hw=width/scale/2,hh=height/scale/2;camera.x=Math.max(hw,Math.min(W.WIDTH-hw,camera.x));camera.y=Math.max(hh,Math.min(W.HEIGHT-hh,camera.y));
 zone();saveElapsed+=dt;if(saveElapsed>1){saveElapsed=0;save()}if(time>toastUntil)document.querySelector('#toast').classList.remove('visible');
}
function render(time){
 ctx.save();ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.translate(width/2,height/2);ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);
 const visible=o=>Math.abs(o.x-camera.x)<width/scale/2+250&&Math.abs(o.y-camera.y)<height/scale/2+280;
 drawWater(ctx,time);drawBridge(ctx);for(let o of decor)if(visible(o))drawObject(ctx,o);
 for(let s of W.signs)drawSign(ctx,s.x,s.y,s.text,s.direction);
 // Footprints give Bramble's conversation a visible subject.
 ctx.save();ctx.fillStyle='#171717';const b=W.characters.find(n=>n.id==='bramble');for(let i=0;i<7;i++){const x=b.x-60+Math.sin(i*.5)*25,y=b.y+35+i*18;ctx.beginPath();ctx.ellipse(x+(i%2)*12,y,3,5,-.3,0,Math.PI*2);ctx.fill()}ctx.restore();
 const entities=[...solids,...W.obstacles,...W.characters.map(n=>({...n,type:'character'})),...W.letters.filter(l=>!collected.includes(l.id)).map(l=>({...l,type:'letter'})),{...player,type:'player',r:20}];
 entities.sort((a,b)=>a.y-b.y);for(let o of entities)if(visible(o)){if(o.type==='player')drawPlayer(ctx,player,time);else if(o.type==='character')drawCharacter(ctx,o,time);else if(o.type==='letter')drawLetter(ctx,o,time);else drawObject(ctx,o)}ctx.restore();
}
function frame(time){let dt=Math.min((time-last)/1000,.05);last=time;update(dt,time);render(time);requestAnimationFrame(frame)}
function refreshPen(){penReceipt=createPenReceipt(receiptStorage);updatePouch();}
addEventListener('storage',refreshPen);
addEventListener('pageshow',refreshPen);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshPen();});
updatePouch();zone();requestAnimationFrame(frame);
window.spellquest={get state(){return {player:{...player},camera:{...camera},collected:[...collected],met:[...progress.met],spotted:[...progress.spotted],conversation:conversations.active,penReceived:penReceipt.received,arrived,zone:currentZone,storageAvailable,spriteReady:playerSprite.ready,spriteFailed:playerSprite.failed}},input:keys};
