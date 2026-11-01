import {WIDTH,HEIGHT,river,bridge,lake,random} from './world.js?v=solid-trees-1';
import {drawAdventurer} from './adventurer.js';
const INK='#171717';
function line(c,points){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke()}
function ellipse(c,x,y,rx,ry,fill=true){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill)c.fill();c.stroke()}
function cloud(c,x,y,rx,ry,seed){let rand=random(seed|0),n=30+Math.floor(rand()*5),phase=rand()*6.28;const radius=a=>1+.025*Math.sin(a*3+phase)+.018*Math.cos(a*7-phase);c.beginPath();c.moveTo(x+rx*radius(0),y);for(let i=0;i<n;i++){let a=(i+.5)/n*Math.PI*2,b=(i+1)/n*Math.PI*2,r=radius(a)+.105+rand()*.025;c.quadraticCurveTo(x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r,x+Math.cos(b)*rx*radius(b),y+Math.sin(b)*ry*radius(b));}c.closePath();c.fill();c.stroke()}

function leafMark(c,x,y,s=1){c.beginPath();c.moveTo(x-8*s,y);c.bezierCurveTo(x-10*s,y+12*s,x,y+14*s,x,y+3*s);c.bezierCurveTo(x,y+17*s,x+12*s,y+14*s,x+13*s,y+2*s);c.stroke()}
export function drawTree(c,o){let {x,y,r,seed}=o;c.save();c.fillStyle='#fff';c.strokeStyle=INK;c.lineWidth=2.5;c.lineJoin='round';// the lower trunk and roots remain visible beneath the canopy
 c.beginPath();c.moveTo(x-r*.23,y-r*.5);c.bezierCurveTo(x-r*.12,y-r*.1,x-r*.17,y+8,x-r*.35,y+19);c.lineTo(x-r*.12,y+12);c.lineTo(x,y+24);c.lineTo(x+r*.12,y+11);c.lineTo(x+r*.31,y+19);c.bezierCurveTo(x+r*.14,y-4,x+r*.17,y-r*.32,x+r*.24,y-r*.55);c.closePath();c.fill();c.stroke();
 c.lineWidth=1.1;for(let i=0;i<6;i++){let xx=x+(i-2.5)*r*.055;c.beginPath();c.moveTo(xx,y+7);c.quadraticCurveTo(xx+(i%2?8:-8),y-r*.22,xx+(i%2?-4:4),y-r*.46);c.stroke()}
 c.save();c.lineWidth=2.7;cloud(c,x,y-r*1.03,r,r*.78,seed);c.lineWidth=1.5;leafMark(c,x-r*.47,y-r*.87,.65);leafMark(c,x+r*.21,y-r*.55,.7);leafMark(c,x+r*.48,y-r*1.17,.5);c.restore();grass(c,x-r*.27,y+19,.7);grass(c,x+r*.3,y+17,.8);c.restore()}
function grass(c,x,y,s=1){c.beginPath();c.moveTo(x-12*s,y);c.quadraticCurveTo(x-17*s,y-15*s,x-6*s,y-5*s);c.quadraticCurveTo(x-10*s,y-30*s,x+1*s,y-9*s);c.quadraticCurveTo(x+20*s,y-27*s,x+11*s,y);c.stroke()}
export function drawObject(c,o){let {x,y,r,seed}=o;c.save();c.strokeStyle=INK;c.fillStyle='#fff';c.lineWidth=2;c.lineCap='round';c.lineJoin='round';
 if(o.type==='tree')drawTree(c,o);
 if(o.type==='bush'){cloud(c,x,y-r*.35,r,r*.67,seed||x);c.lineWidth=1.2;leafMark(c,x-15,y-r*.2,.6);leafMark(c,x+19,y-r*.55,.5)}
 if(o.type==='grass'){c.lineWidth=1.3;grass(c,x,y,.45+(seed%4)/10)}
 if(o.type==='pebble'){c.lineWidth=1.4;c.beginPath();c.moveTo(x-6,y);c.quadraticCurveTo(x-3,y-9,x+4,y-5);c.lineTo(x+8,y);c.quadraticCurveTo(x+1,y+4,x-6,y);c.fill();c.stroke()}
 if(o.type==='flower'){c.lineWidth=1.4;line(c,[[x,y],[x+2,y-13]]);for(let i=0;i<5;i++){let a=i*2*Math.PI/5;ellipse(c,x+Math.cos(a)*5,y-16+Math.sin(a)*5,3.5,3.5)}ellipse(c,x,y-16,2,2);}
 if(o.type==='rock'){c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r*.8,y-r*.72);c.lineTo(x-r*.2,y-r*1.15);c.lineTo(x+r*.5,y-r*.94);c.lineTo(x+r,y-r*.25);c.lineTo(x+r*.8,y+r*.2);c.lineTo(x-r*.55,y+r*.2);c.closePath();c.fill();c.stroke();c.lineWidth=1;line(c,[[x-r*.2,y-r*1.15],[x-r*.02,y-r*.48],[x+r*.4,y-r*.25]]);line(c,[[x-r*.02,y-r*.48],[x-r*.5,y-r*.3]]);grass(c,x-r*.6,y+8,.65);grass(c,x+r*.72,y+8,.5)}
 if(o.type==='stump'){c.beginPath();c.moveTo(x-r,y-35);c.lineTo(x-r*.9,y+7);c.lineTo(x-r*1.2,y+19);c.lineTo(x-r*.4,y+12);c.lineTo(x,y+23);c.lineTo(x+r*.3,y+11);c.lineTo(x+r*1.15,y+16);c.lineTo(x+r*.8,y+2);c.lineTo(x+r,y-35);c.closePath();c.fill();c.stroke();ellipse(c,x,y-35,r,14);ellipse(c,x,y-35,r*.7,9,false);ellipse(c,x,y-35,r*.32,4,false);line(c,[[x-17,y-19],[x-20,y+8]]);line(c,[[x+18,y-17],[x+16,y+5]])}
 if(o.type==='hut')hut(c,x,y);
 c.restore()}
function hut(c,x,y){c.lineWidth=3; // Soft, welcoming owl-shaped woodland hut.
 c.beginPath();c.moveTo(x-102,y+30);c.quadraticCurveTo(x-114,y-62,x-70,y-125);c.lineTo(x+70,y-125);c.quadraticCurveTo(x+116,y-55,x+102,y+30);c.closePath();c.fill();c.stroke();for(let i=-2;i<=2;i++){c.lineWidth=1;line(c,[[x+i*33,y-90],[x+i*34,y+28]])}c.lineWidth=3;
 c.beginPath();c.moveTo(x-140,y-103);c.quadraticCurveTo(x-112,y-168,x-92,y-185);c.lineTo(x-65,y-170);c.quadraticCurveTo(x,y-213,x+65,y-170);c.lineTo(x+92,y-185);c.quadraticCurveTo(x+117,y-144,x+140,y-103);c.quadraticCurveTo(x+60,y-124,x,y-113);c.quadraticCurveTo(x-65,y-123,x-140,y-103);c.fill();c.stroke();c.lineWidth=1.2;for(let i=-3;i<=3;i++)line(c,[[x+i*28,y-143],[x+i*31+10,y-120]]);
 c.lineWidth=2.5;for(let side of [-1,1]){ellipse(c,x+side*44,y-70,23,23);ellipse(c,x+side*44,y-70,14,14);c.fillStyle=INK;ellipse(c,x+side*44,y-70,4,7);c.fillStyle='#fff'}line(c,[[x-8,y-69],[x,y-57],[x+8,y-69]]);
 c.beginPath();c.moveTo(x-27,y+30);c.lineTo(x-27,y-7);c.bezierCurveTo(x-27,y-42,x+27,y-42,x+27,y-7);c.lineTo(x+27,y+30);c.closePath();c.fill();c.stroke();ellipse(c,x+15,y+3,2,2);c.fillStyle='#fff';c.fillRect(x-49,y+32,98,17);c.strokeRect(x-49,y+32,98,17);grass(c,x-111,y+32);grass(c,x+119,y+30);
}
export function drawWater(c,time){c.save();c.strokeStyle=INK;c.fillStyle='#fff';c.lineWidth=2.5;
 // The river spans the entire map. Only bridge geometry overrides water collision.
 c.beginPath();for(let x=0;x<=WIDTH;x+=20){let y=river.top+Math.sin(x/64)*5;x?c.lineTo(x,y):c.moveTo(x,y)}for(let x=WIDTH;x>=0;x-=20)c.lineTo(x,river.bottom+Math.sin(x/72)*5);c.closePath();c.fill();c.stroke();
 c.lineWidth=1;for(let x=25;x<WIDTH;x+=96)for(let row=0;row<3;row++){let y=river.top+30+row*(river.bottom-river.top-60)/2,xx=x+row*31;c.beginPath();c.moveTo(xx,y);c.bezierCurveTo(xx+15,y-5,xx+32,y+5,xx+51,y);c.stroke()}
 c.lineWidth=2.5;ellipse(c,lake.x,lake.y,lake.rx,lake.ry);c.lineWidth=1.2;for(let i=0;i<37;i++){let rand=random(i+881),x=lake.x+(rand()-.5)*lake.rx*1.7,y=lake.y+(rand()-.5)*lake.ry*1.6;if(((x-lake.x)/lake.rx)**2+((y-lake.y)/lake.ry)**2<.75){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+15,y-4,x+37,y);c.stroke()}}
 // Waterfall, drawn independently of the lake collider.
 const wx=lake.x,top=river.bottom-20,bottom=lake.y-lake.ry*.30;
 for(let side of [-1,1])drawObject(c,{type:'rock',x:wx+side*85,y:top+45,r:53});
 c.fillStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(wx-55,top);c.lineTo(wx+55,top);c.lineTo(wx+65,bottom);c.quadraticCurveTo(wx,bottom+20,wx-65,bottom);c.closePath();c.fill();c.stroke();c.lineWidth=1.2;
 for(let i=0;i<7;i++){let x=wx-48+i*16;line(c,[[x,top+8],[x+Math.sin(time*.001+i)*3,bottom-15]])}
 for(let i=0;i<6;i++)ellipse(c,wx-55+i*22,bottom+4+(i%2)*6,16,6);

 c.restore()}
export function drawBridge(c){c.save();c.fillStyle='#fff';c.strokeStyle=INK;c.lineWidth=2.3;let {left:l,right:r,top:t,bottom:b}=bridge;c.fillRect(l,t,r-l,b-t);for(let y=t;y<b;y+=23){c.beginPath();c.moveTo(l,y);c.lineTo(r,y+2);c.lineTo(r,y+22);c.lineTo(l,y+23);c.closePath();c.fill();c.stroke();c.lineWidth=.7;line(c,[[l+20,y+10],[r-25,y+13]]);c.lineWidth=2.3;}for(let x of [l+5,r-5]){line(c,[[x,t-12],[x,b+4]]);line(c,[[x,t-29],[x,b-13]]);for(let y=t;y<=b;y+=77){c.fillRect(x-5,y-30,10,37);c.strokeRect(x-5,y-30,10,37)}}c.restore()}
export function drawLetter(c,l,time){c.save();c.translate(l.x,l.y);c.fillStyle='#fff';c.strokeStyle=INK;c.lineWidth=1.4;let phase=time*.002+l.x;for(let i=0;i<6;i++){let a=i*Math.PI/3+Math.sin(phase)*.05,r=35+(Math.sin(phase+i)+1)*2;line(c,[[Math.cos(a)*r,Math.sin(a)*r-20],[Math.cos(a)*(r+6),Math.sin(a)*(r+6)-20]])}c.font='bold 56px Georgia';c.textAlign='center';c.textBaseline='bottom';c.lineWidth=4;c.strokeText(l.id,2,8);c.fillText(l.id,0,5);c.lineWidth=1;c.strokeText(l.id,0,5);line(c,[[-14,10],[13,10]]);c.restore()}
export function drawPlayer(c,p,time){if(drawAdventurer(c,p))return;c.save();c.translate(p.x,p.y);c.strokeStyle=INK;c.fillStyle='#fff';c.lineWidth=2.4;c.lineJoin='round';let bob=p.moving?Math.sin(time*.015)*1.8:Math.sin(time*.002)*.5;c.translate(0,bob); // feet are the world/collision anchor
 for(let side of [-1,1]){let step=p.moving?Math.sin(time*.015)*side*3:0;c.beginPath();c.roundRect(side*7-5,-13+step,10,13,4);c.fill();c.stroke()}
 c.beginPath();c.moveTo(-11,-41);c.quadraticCurveTo(-23,-29,-22,-17);c.quadraticCurveTo(0,-6,22,-17);c.quadraticCurveTo(20,-32,11,-41);c.closePath();c.fill();c.stroke();c.lineWidth=1;for(let x=-15;x<=15;x+=6)line(c,[[x,-18],[x+2,-17]]);c.lineWidth=2.4;
 c.beginPath();c.moveTo(0,-72);c.bezierCurveTo(-8,-65,-23,-47,-21,-42);c.quadraticCurveTo(0,-22,21,-42);c.bezierCurveTo(20,-50,8,-65,0,-72);c.closePath();c.fill();c.stroke();c.lineWidth=1;line(c,[[-1,-65],[-4,-57]]);
 if(p.facing==='down'){c.beginPath();c.moveTo(-12,-45);c.quadraticCurveTo(0,-59,12,-45);c.quadraticCurveTo(0,-34,-12,-45);c.fillStyle=INK;c.fill();}else if(p.facing==='left'||p.facing==='right'){let s=p.facing==='left'?-1:1;c.fillStyle=INK;c.beginPath();c.moveTo(s*15,-48);c.quadraticCurveTo(s*5,-48,s*13,-38);c.fill();}c.restore()}
export function drawSign(c,x,y,text,direction=0){c.save();c.translate(x,y);c.strokeStyle=INK;c.fillStyle='#fff';c.lineWidth=2;c.fillRect(-4,-15,8,64);c.strokeRect(-4,-15,8,64);c.beginPath();if(direction<0){c.moveTo(60,-37);c.lineTo(-42,-37);c.lineTo(-62,-20);c.lineTo(-42,-3);c.lineTo(60,-3)}else{c.moveTo(-60,-37);c.lineTo(60,-37);c.lineTo(60,-3);c.lineTo(-60,-3)};c.closePath();c.fill();c.stroke();c.font='12px Georgia';c.textAlign='center';c.fillStyle=INK;c.fillText(text,-2,-16);c.restore()}

// Individual character art, depth-sorted with the explorer and trees.
export function drawCharacter(c,npc,time){
 c.save();c.translate(npc.x,npc.y);c.strokeStyle=INK;c.fillStyle='#fff';c.lineWidth=2.2;c.lineJoin='round';
 if(npc.species==='squirrel'){c.beginPath();c.moveTo(15,-8);c.bezierCurveTo(70,-10,52,-85,25,-67);c.bezierCurveTo(5,-52,47,-45,20,-26);c.fill();c.stroke()}
 ellipse(c,-9,-4,9,5);ellipse(c,9,-4,9,5);ellipse(c,0,-20,20,24);
 if(npc.species==='rabbit'){for(let side of [-1,1]){c.save();c.translate(side*10,-64);c.rotate(side*.15);ellipse(c,0,-9,7,23);c.lineWidth=1;line(c,[[0,-25],[0,3]]);c.restore()}}
 if(npc.species==='badger'||npc.species==='squirrel'){ellipse(c,-17,-56,8,9);ellipse(c,17,-56,8,9)}
 ellipse(c,0,-45,npc.species==='frog'?26:23,20);
 if(npc.species==='badger'){c.fillStyle=INK;for(let side of [-1,1]){c.beginPath();c.moveTo(side*8,-62);c.quadraticCurveTo(side*27,-46,side*8,-29);c.lineTo(side*2,-33);c.quadraticCurveTo(side*13,-47,side*3,-61);c.fill()}c.fillStyle='#fff'}
 if(npc.species==='frog'){ellipse(c,-15,-62,9,10);ellipse(c,15,-62,9,10)}
 c.fillStyle=INK;for(let side of [-1,1])ellipse(c,side*(npc.species==='frog'?15:9),npc.species==='frog'?-62:-47,2.3,3);
 if(npc.species!=='frog')ellipse(c,0,-39,3,2);c.fillStyle='#fff';c.beginPath();c.moveTo(-7,-34);c.quadraticCurveTo(0,-28,7,-34);c.stroke();
 if(npc.species==='squirrel'){c.fillRect(-15,-22,30,13);c.strokeRect(-15,-22,30,13);c.beginPath();c.arc(0,-22,10,Math.PI,0);c.stroke();}
 c.translate(0,Math.sin(time*.002+npc.x)*2);c.beginPath();c.roundRect(-16,-109,32,25,9);c.fill();c.stroke();line(c,[[-5,-84],[-8,-77],[3,-84]]);c.font='bold 17px Georgia';c.textAlign='center';c.fillStyle=INK;c.fillText('…',0,-93);c.restore();
}
