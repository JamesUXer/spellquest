import {drawPlayer} from './art.js';

// Temporary held-pose composition. Coordinates are independent of viewport size.
export function drawWorkshopSceneFallback(ctx, width, height, {awake=false,received=false}={}) {
  ctx.save();ctx.clearRect(0,0,width,height);ctx.scale(width/1200,height/650);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,1200,650);
  ctx.strokeStyle='#222';ctx.fillStyle='#fff';ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.lineCap='round';
  const line=points=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  const ellipse=(x,y,rx,ry)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();};
  // A quiet interior frame. The tabletop and pen remain the central shared focus.
  line([[65,600],[1140,600]]);line([[100,580],[100,65],[1120,65],[1120,580]]);
  ctx.strokeRect(145,100,165,175);line([[227,100],[227,275]]);line([[145,190],[310,190]]);
  line([[156,259],[202,198],[251,246],[298,171]]);
  line([[460,125],[760,125]]);
  for(let n=0;n<7;n++){ctx.strokeRect(475+n*30,75+(n%3)*6,23,50-(n%3)*6);line([[480+n*30,87],[491+n*30,87]]);}
  // Reuse the forest explorer in a stationary profile, looking towards the owl.
  ctx.save();ctx.translate(315,600);ctx.scale(3.7,3.7);
  drawPlayer(ctx,{x:0,y:0,facing:'right',moving:false,walkTime:0},0);ctx.restore();
  // Replaceable owl pose, facing the explorer. No per-frame blinking or bobbing.
  ctx.beginPath();ctx.moveTo(920,155);ctx.bezierCurveTo(1048,146,1083,268,1064,480);ctx.quadraticCurveTo(1065,571,1012,580);ctx.quadraticCurveTo(910,592,884,526);ctx.quadraticCurveTo(861,333,871,243);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(866,261);ctx.quadraticCurveTo(815,166,877,117);ctx.quadraticCurveTo(953,81,998,158);ctx.quadraticCurveTo(1025,224,966,259);ctx.quadraticCurveTo(911,281,866,261);ctx.fill();ctx.stroke();
  ellipse(892,183,36,49);ellipse(881,179,11,18);ctx.fillStyle='#222';ellipse(879,180,4,9);ctx.fillStyle='#fff';
  ctx.beginPath();ctx.moveTo(861,200);ctx.lineTo(828,218);ctx.lineTo(865,231);ctx.closePath();ctx.fill();ctx.stroke();
  line([[855,144],[871,132],[902,137]]);line([[924,126],[945,119],[971,135]]);
  ctx.beginPath();ctx.moveTo(1012,284);ctx.bezierCurveTo(1093,350,1082,509,1014,541);ctx.bezierCurveTo(977,482,980,363,1012,284);ctx.fill();ctx.stroke();
  for(let row=0;row<5;row++)for(let col=0;col<3;col++){
    const x=901+col*30,y=302+row*38;
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+12,y+23,x+24,y);ctx.stroke();
  }
  line([[951,579],[951,599],[920,599],[940,591]]);line([[1000,578],[1000,599],[1032,599],[1013,591]]);
  // Workbench foreground and a visibly sleeping, horizontal pen.
  ctx.fillRect(490,400,440,200);ctx.strokeRect(490,400,440,200);
  line([[490,430],[930,430]]);line([[514,430],[514,600]]);line([[903,430],[903,600]]);
  ctx.beginPath();ctx.moveTo(482,400);ctx.lineTo(523,378);ctx.lineTo(959,378);ctx.lineTo(930,400);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeRect(562,338,36,39);ellipse(580,338,18,6);
  ctx.save();
  // A cut between held poses: sleeping on the desk, offered by the owl, carried.
  if(received){ctx.translate(377,423);ctx.rotate(-Math.PI/3);ctx.translate(-640,-367);}
  else if(awake){
    line([[895,303],[802,330],[748,329]]);
    ctx.translate(670,320);ctx.rotate(-.12);ctx.translate(-640,-367);
  }
  ctx.beginPath();ctx.moveTo(640,360);ctx.lineTo(748,360);ctx.lineTo(772,367);ctx.lineTo(748,374);ctx.lineTo(640,374);ctx.closePath();ctx.fill();ctx.stroke();
  line([[650,360],[650,374]]);line([[751,361],[751,373]]);line([[749,367],[772,367]]);
  ctx.restore();
  if(received){ellipse(390,405,10,7);line([[365,426],[390,405]]);}
  // A small, still breathing mark is held as ink rather than animated.
  ctx.font='italic 18px Georgia';ctx.fillStyle='#222';if(!awake)ctx.fillText('z',695,338);
  ctx.restore();
}
