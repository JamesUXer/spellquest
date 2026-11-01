// Shared physical movement from loose blocks or occupied sockets; no tracing logic.
export function enableLetterBlockDrag({tokens,sockets,frame,tray,canMove,idFor,onDrop,onCancel=()=>{}}) {
  let drag=null,suppressed=null;
  const contains=(b,x,y)=>x>=b.left-12&&x<=b.right+12&&y>=b.top-12&&y<=b.bottom+12;
  function destination(x,y) {
    if(contains(tray.getBoundingClientRect(),x,y))return {kind:'tray'};
    if(!contains(sockets[0].parentElement.getBoundingClientRect(),x,y))return null;
    let index=0,distance=Infinity;
    sockets.forEach((socket,n)=>{const b=socket.getBoundingClientRect(),d=Math.abs(x-(b.left+b.width/2));if(d<distance){distance=d;index=n;}});
    return {kind:'socket',index};
  }
  function highlight(target) {
    frame.classList.toggle('receiving-block',target?.kind==='socket');
    [...sockets,...tokens].forEach(el=>el.classList.remove('drop-target','return-target'));
    if(target?.kind==='socket')sockets[target.index].classList.add('drop-target');
    if(target?.kind==='tray'&&drag)tokens[drag.id].classList.add('return-target');
  }
  function finish(target=null) {
    const previous=drag;if(!previous)return;
    drag=null;highlight(null);previous.ghost?.remove();
    previous.element.classList.remove('drag-source');document.body.classList.remove('dragging-letter');
    if(previous.element.hasPointerCapture(previous.pointerId))previous.element.releasePointerCapture(previous.pointerId);
    if(previous.moved) {
      suppressed={element:previous.element,time:performance.now()};
      if(target&&canMove(previous.element))onDrop(previous.id,target);else onCancel();
    }
  }
  for(const element of [...tokens,...sockets]) {
    element.addEventListener('pointerdown',event=>{
      if(event.button!==0||drag||!canMove(element))return;
      suppressed=null;
      drag={element,id:idFor(element),pointerId:event.pointerId,x:event.clientX,y:event.clientY,moved:false,ghost:null};
      element.setPointerCapture(event.pointerId);
    });
    element.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      if(event.pointerType==='mouse'&&!(event.buttons&1)){finish();return;}
      if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<8)return;
      if(!canMove(element)){finish();return;}
      event.preventDefault();
      if(!drag.moved) {
        drag.moved=true;
        const b=element.getBoundingClientRect(),ghost=document.createElement('div');
        ghost.className='letter-block-ghost';ghost.setAttribute('aria-hidden','true');ghost.innerHTML=element.innerHTML;
        Object.assign(ghost.style,{left:`${b.left}px`,top:`${b.top}px`,width:`${b.width}px`,height:`${b.height}px`});
        document.body.append(ghost);drag.ghost=ghost;
        element.classList.add('drag-source');document.body.classList.add('dragging-letter');
      }
      drag.ghost.style.transform=`translate(${event.clientX-drag.x}px,${event.clientY-drag.y}px)`;
      highlight(destination(event.clientX,event.clientY));
    });
    element.addEventListener('pointerup',event=>{if(drag?.pointerId===event.pointerId)finish(drag.moved?destination(event.clientX,event.clientY):null);});
    for(const name of ['pointercancel','lostpointercapture'])element.addEventListener(name,event=>{if(drag?.pointerId===event.pointerId)finish();});
    element.addEventListener('click',event=>{
      if(suppressed?.element===element&&event.detail!==0&&performance.now()-suppressed.time<500){event.preventDefault();event.stopImmediatePropagation();suppressed=null;}
    },true);
  }
  for(const name of ['blur','pagehide','resize'])window.addEventListener(name,()=>finish());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&drag){event.preventDefault();finish();}});
}
