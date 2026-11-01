// Shared short entrance. Only transform/clip updates run while it is playing.
export function createWorkshopEntrance({stage,overlay,status,skip,replay=null,
  images=[...overlay.querySelectorAll('img')],assetsReady=Promise.resolve(),
  readyText='The workshop is ready.',onFinish=()=>{},onSkip=()=>replay?.focus({preventScroll:true})}) {
const portraits=[...overlay.querySelectorAll('.portrait')];
const lines=[...overlay.querySelectorAll('.speed-lines')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const captions={enter:'The boy and owl slide into view.',hold:'They pause, facing each other.',reveal:'The workshop comes into view.',ready:'The workshop is ready.'};
let frame=null,elapsed=0,lastTime=0,playing=false,loaded=false,autoplay=true;
const length=()=>reduced.matches?1000:1900;
// Speed lines belong to the requested cartoon entrance, not the workshop itself.
for(const [panel,svg] of lines.entries()) {
  for(let n=0;n<32;n++) {
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    const x=(n*137+panel*59)%500-80,y=14+n*25;
    line.setAttribute('x1',x);line.setAttribute('x2',x+110+(n*71)%350);
    line.setAttribute('y1',y);line.setAttribute('y2',y);
    line.setAttribute('stroke-width',n%5===0?'2':'1');
    line.setAttribute('opacity',n%3===0?'.7':'.3');svg.append(line);
  }
}
function phase(value) {
  if(stage.dataset.phase===value)return;
  stage.dataset.phase=value;status.textContent=value==='ready'?readyText:captions[value];
}
function render() {
  stage.dataset.motion=reduced.matches?'reduced':'full';
  if(reduced.matches) {
    portraits.forEach(el=>el.style.transform='none');
    lines.forEach(el=>el.style.transform='none');
    // A held character picture followed by a straight cut, without spatial motion.
    phase('hold');overlay.style.clipPath='none';return;
  }
  const t=Math.min(1,elapsed/700),ease=1-Math.pow(1-t,4);
  portraits.forEach((el,i)=>el.style.transform=`translateX(${(i?1:-1)*(1-ease)*130}%)`);
  const drift=(Math.min(elapsed,700)%160)/160*70;
  lines.forEach((el,i)=>el.style.transform=`translateX(${i?drift:-drift}px)`);
  const reveal=Math.max(0,Math.min(1,(elapsed-1400)/500));
  overlay.style.clipPath=`inset(0 0 0 ${reveal*100}%)`;
  phase(elapsed<700?'enter':elapsed<1400?'hold':'reveal');
}
function cancelFrame(){if(frame!==null)cancelAnimationFrame(frame);frame=null;}
function finish() {
  playing=false;cancelFrame();overlay.hidden=true;skip.disabled=true;
  phase('ready');stage.dataset.motion=reduced.matches?'reduced':'full';onFinish();
}
function tick(time) {
  frame=null;
  if(!playing||document.hidden)return;
  elapsed+=Math.max(0,time-lastTime);lastTime=time;
  if(elapsed>=length()){finish();return;}
  render();frame=requestAnimationFrame(tick);
}
function start() {
  if(!loaded)return;
  cancelFrame();elapsed=0;playing=true;overlay.hidden=false;skip.disabled=false;
  render();lastTime=performance.now();
  if(!document.hidden)frame=requestAnimationFrame(tick);
}
if(replay)replay.addEventListener('click',start);
skip.addEventListener('click',()=>{autoplay=false;finish();onSkip();});
document.addEventListener('visibilitychange',()=>{
  cancelFrame();
  if(!document.hidden&&playing){lastTime=performance.now();frame=requestAnimationFrame(tick);}
});
window.addEventListener('pagehide',()=>{cancelFrame();});
window.addEventListener('pageshow',()=>{if(playing&&frame===null&&!document.hidden){lastTime=performance.now();frame=requestAnimationFrame(tick);}});
reduced.addEventListener('change',()=>{if(playing)start();else stage.dataset.motion=reduced.matches?'reduced':'full';});
async function prepare() {
  try {
    await Promise.all([assetsReady,...images.map(image=>image.decode())]);
    loaded=true;if(replay)replay.disabled=false;if(autoplay)start();
  } catch {
    finish();status.textContent='The entrance artwork could not load. You can still use the workshop.';
  }
}
const ready=prepare();
return {ready,start,stop(){autoplay=false;finish();},get playing(){return playing;}};
}
