// World units are independent of screen pixels. North is decreasing y.
export const WIDTH=2624, HEIGHT=3362;
export const SPAWN={x:1205,y:3059};
export const PLAYER_RADIUS=13;
const PLAYER_HEIGHT=82; // Match the illustrated explorer; keep its hood outside solid tree shapes.
export const river={top:845,bottom:1000};
export const bridge={left:1197,right:1345,top:795,bottom:1050};
export const lake={x:508,y:1177,rx:279,ry:201};
export const zones=[
 {id:1,name:'A path into the woods',caption:'THE JOURNEY BEGINS',x:1205,y:2903},
 {id:2,name:'The first clearing',caption:'ROOM TO WANDER',x:1189,y:2353},
 {id:3,name:'The branching woods',caption:'CHOOSE YOUR OWN WAY',x:1148,y:1681},
 {id:4,name:'The winding thicket',caption:'A PATH LESS TRAVELLED',x:1943,y:2017},
 {id:5,name:'The falling water',caption:'BESIDE THE LAKE',x:771,y:1255},
 {id:6,name:'The wooden bridge',caption:'ACROSS THE RIVER',x:1271,y:1025},
 {id:7,name:'The owl’s clearing',caption:'A QUIET PLACE',x:1271,y:476}
];
// Route capsules place clearings and scenery. They do not restrict open-ground movement.
export const paths=[
 {points:[[1205,3157],[1205,2845],[1140,2616],[1189,2353]],r:127},
 {points:[[1189,2353],[1091,2034],[1148,1681]],r:168},
 {points:[[1361,2353],[1697,2337],[1968,2165],[2042,1952],[1878,1697],[1673,1460],[1271,1132]],r:127},
 {points:[[1148,1681],[1419,1607],[1673,1460]],r:148},
 {points:[[1148,1681],[910,1566],[722,1402],[875,1245],[935,1091],[1271,1082]],r:148},
 {points:[[1148,1681],[1238,1402],[1271,1132],[1271,1025],[1271,787],[1328,648],[1271,435]],r:148}
];
export const clearings=[{x:1189,y:2353,rx:344,ry:295},{x:1148,y:1681,rx:279,ry:246},{x:1271,y:467,rx:348,ry:287}];
export const letters=[{id:'I',x:959,y:2386},{id:'O',x:2091,y:1993},{id:'U',x:730,y:1361},{id:'S',x:1238,y:636}];
export const obstacles=[{type:'tree',x:992,y:1396,r:80,seed:41},{type:'tree',x:1620,y:1240,r:85,seed:73},{type:'rock',x:1410,y:2230,r:48},{type:'stump',x:1017,y:2189,r:35},{type:'rock',x:1080,y:1470,r:48},{type:'bush',x:1545,y:1670,r:40},{type:'rock',x:1812,y:2380,r:42},{type:'rock',x:1020,y:1238,r:40},{type:'hut',x:1271,y:328,r:110}];
export const destination={x:1271,y:455};
export const signs=[{x:1357,y:2747,text:'FOREST ↑'},{x:1033,y:1800,text:'LAKE ↖',direction:-1},{x:1414,y:1140,text:'BRIDGE ↑'}];
export const characters=[
 {id:'pip',name:'Pip',species:'rabbit',x:1304,y:2468,r:22},
 {id:'bramble',name:'Bramble',species:'badger',x:1900,y:2010,r:24},
 {id:'fern',name:'Fern',species:'frog',x:900,y:1395,r:22},
 {id:'hazel',name:'Hazel',species:'squirrel',x:1386,y:1099,r:22}
];
export function segmentDistance(x,y,a,b){let dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}
export function ground(x,y,margin=0){return clearings.some(c=>((x-c.x)/(c.rx-margin))**2+((y-c.y)/(c.ry-margin))**2<=1)||paths.some(p=>p.points.slice(1).some((b,i)=>segmentDistance(x,y,p.points[i],b)<=p.r-margin))}
export function inWater(x,y,r=0){return (y+r>river.top&&y-r<river.bottom&&!(x-r>=bridge.left&&x+r<=bridge.right))||((x-lake.x)/(lake.rx+r))**2+((y-lake.y)/(lake.ry+r))**2<1}
// Ordinary props use ground footprints. Trees also block their opaque crown and trunk.
export function footprint(o){
 const shapes={tree:[.32,.20,8],bush:[.94,.44,-3],rock:[.94,.34,-3],stump:[1,.5,4],hut:[1,.48,12]};
 const [sx,sy,offset]=shapes[o.type]||[1,1,0];
 return {x:o.x,y:o.y+offset,rx:o.r*sx,ry:o.r*sy};
}
export function collisionShapes(o){
 const root=footprint(o);
 return o.type==='tree'?[root,
  {x:o.x,y:o.y-o.r*.22,rx:o.r*.22,ry:o.r*.36},
  {x:o.x,y:o.y-o.r*1.03,rx:o.r*1.06,ry:o.r*.83}]:[root];
}
export function blocks(o,x,y,r=PLAYER_RADIUS){
 const top=o.type==='tree'?y-Math.max(0,PLAYER_HEIGHT-r):y;
 return collisionShapes(o).some(f=>{
  const nearestY=Math.max(top,Math.min(y,f.y));
  return ((x-f.x)/(f.rx+r))**2+((nearestY-f.y)/(f.ry+r))**2<1;
 });
}
export function canWalk(x,y,r=PLAYER_RADIUS){
 if(!(x>=r&&x<=WIDTH-r&&y>=r&&y<=HEIGHT-r)||inWater(x,y,r))return false;
 // Query nearby visible blockers, allowing for the explorer’s full body height.
 for(let cy=Math.floor((y-PLAYER_HEIGHT-r)/COLLISION_CELL);cy<=Math.floor((y+r)/COLLISION_CELL);cy++)
  for(let cx=Math.floor((x-r)/COLLISION_CELL);cx<=Math.floor((x+r)/COLLISION_CELL);cx++)
   if(collisionCells.get(`${cx},${cy}`)?.some(o=>blocks(o,x,y,r)))return false;
 return true;
}
export function findWalkableNear(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>WIDTH||y<0||y>HEIGHT||inWater(x,y))return null;
 if(canWalk(x,y))return {x,y};
 // A save from the former pass-through trees may now be inside an opaque tree.
 if(![...obstacles,...scenery].some(o=>o.type==='tree'&&blocks(o,x,y)))return null;
 const bank=y<river.top?-1:y>river.bottom?1:0;
 for(let distance=8;distance<=384;distance+=8){
  const samples=Math.max(24,Math.ceil(Math.PI*2*distance/8));
  for(let i=0;i<samples;i++){
   const angle=i/samples*Math.PI*2,px=x+Math.cos(angle)*distance,py=y+Math.sin(angle)*distance;
   if((py<river.top?-1:py>river.bottom?1:0)===bank&&canWalk(px,py))return {x:px,y:py};
  }
 }
 return null;
}
export function move(player,dx,dy){ // Substeps prevent tunnelling at low frame rates.
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/6));
 for(let i=0;i<steps;i++){if(canWalk(player.x+dx/steps,player.y))player.x+=dx/steps;if(canWalk(player.x,player.y+dy/steps))player.y+=dy/steps;}return player;
}
export function zoneAt(x,y){return zones.reduce((a,b)=>Math.hypot(x-a.x,y-a.y)<Math.hypot(x-b.x,y-b.y)?a:b)}
export function collectAt(player,collected){let added=[];for(const l of letters)if(!collected.includes(l.id)&&Math.hypot(player.x-l.x,player.y-l.y)<45){collected.push(l.id);added.push(l.id)}return added}
export function random(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
// The same deterministic scenery supplies drawing and ground-level collision.
export function makeScenery(){let rng=random(188),items=[];for(let y=160;y<HEIGHT+180;y+=132)for(let x=100;x<WIDTH+100;x+=137){let px=x+(rng()-.5)*88,py=y+(rng()-.5)*75,r=85+rng()*45;if(!ground(px,py,-r-32)&&!inWater(px,py,r+10))items.push({type:rng()<.18?'bush':'tree',x:px,y:py,r,seed:rng()*10000});}for(let x=40;x<WIDTH;x+=78)for(let y of [river.top-27,river.bottom+55])if(!ground(x,y,-60)&&!inWater(x,y,0))items.push({type:'bush',x,y,r:46,seed:x+y});for(let i=0;i<620;i++){let x=rng()*WIDTH,y=rng()*HEIGHT;if(ground(x,y,30)&&!inWater(x,y,30)&&!(x>bridge.left-30&&x<bridge.right+30&&y>bridge.top-30&&y<bridge.bottom+30)&&!obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+35))items.push({type:['grass','flower','pebble'][Math.floor(rng()*3)],x,y,r:10,seed:rng()*10000});}return items}


export const scenery=makeScenery();
const COLLISION_CELL=160,collisionCells=new Map();
for(const object of [...obstacles,...characters,...scenery.filter(o=>o.type==='tree'||o.type==='bush')]){
 const shapes=collisionShapes(object);
 const left=Math.min(...shapes.map(f=>f.x-f.rx)),right=Math.max(...shapes.map(f=>f.x+f.rx));
 const top=Math.min(...shapes.map(f=>f.y-f.ry)),bottom=Math.max(...shapes.map(f=>f.y+f.ry));
 for(let cy=Math.floor(top/COLLISION_CELL);cy<=Math.floor(bottom/COLLISION_CELL);cy++)
  for(let cx=Math.floor(left/COLLISION_CELL);cx<=Math.floor(right/COLLISION_CELL);cx++){
   const key=`${cx},${cy}`;
   if(!collisionCells.has(key))collisionCells.set(key,[]);
   collisionCells.get(key).push(object);
  }
}
