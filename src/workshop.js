import {createCircuit, LETTERS} from './spell-circuit.js?v=rearrange-1';
import {enableLetterBlockDrag} from './letter-block-drag.js?v=rearrange-1';
import {workshopLetters} from './workshop-entry.js';
const available = new Set(workshopLetters(new URLSearchParams(location.search), {getItem:key => localStorage.getItem(key)}));
import {createPenMovement} from './pen-movement.js';
import {createTraceGesture} from './trace-gesture.js';
import {TRACE_LETTERS, guidedMotion} from './letter-tracing.js';

const circuit = createCircuit();
const movement = createPenMovement();
const gesture = createTraceGesture();
let stoppedIndex = null, pickedBlock=null, tracingMode=false;
const tokens = [...document.querySelectorAll('[data-letter]')];
const sockets = [...document.querySelectorAll('#sockets li')];
const word = document.querySelector('#spell-word');
const status = document.querySelector('#spell-status');
const instruction = document.querySelector('#instruction');
const penHelp = document.querySelector('#pen-help');
const undo = document.querySelector('#undo');
const reset = document.querySelector('#start-again');
const pen = document.querySelector('#pen');
const track = document.querySelector('#pen-track');
const surface = document.querySelector('#spell-circuit');
const direction = document.querySelector('#trace-direction');
let directionTimer = null;
let strokes = [], totalLength = 0, geometryKey = '';
const svgNS = 'http://www.w3.org/2000/svg';
const edit = document.querySelector('#edit-spell');
const replay = document.querySelector('#replay-movement');
let drag = null, keyFrame = null, lastKeyTime = 0;
const passed = new Set();

function render(message = '', placed = -1) {
  const selected = circuit.slots;
  surface.dataset.editing=String(!movement.started&&!tracingMode);
  word.textContent = circuit.word;
  word.setAttribute('aria-label', 'Current spelling: ' + [...circuit.word].map(letter => letter === '_' ? 'blank' : letter).join(', '));
  tokens.forEach((token, id) => {
    const used = selected.includes(id);
    token.classList.toggle('tray-empty',used||!available.has(LETTERS[id]));
    token.setAttribute('aria-disabled',String(movement.started||!available.has(LETTERS[id])||(pickedBlock!==null?id!==pickedBlock:used)));
    token.setAttribute('aria-label',pickedBlock===id?`Return ${LETTERS[id]} to the tray`: !available.has(LETTERS[id]) ? `${LETTERS[id]}, not collected yet` : used ? `${LETTERS[id]}, in socket ${selected.indexOf(id) + 1}` : `Choose ${LETTERS[id]}`);
    const letter=LETTERS[id];
    token.innerHTML=used||!available.has(letter)?'':`<span class="visually-hidden">${letter}</span><svg class="block-face" viewBox="15 5 70 95" aria-hidden="true"><path d="${TRACE_LETTERS[letter]}"/>${letter==='i'?'<circle cx="50" cy="18" r="3"/>':''}</svg>`;
  });
  sockets.forEach((socket, index) => {
    const letter = LETTERS[selected[index]];
    socket.firstElementChild.textContent = letter ?? '';
    if (socket.dataset.traceLetter !== (letter ?? '')) {
      socket.querySelector('svg')?.remove();
      socket.dataset.traceLetter = letter ?? '';
      if (letter) {
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '15 5 70 95');
        svg.setAttribute('aria-hidden', 'true');
        svg.classList.add('trace-letter');
        svg.innerHTML = `<path class="trace-guide" d="${TRACE_LETTERS[letter]}"/><path class="trace-ink" d="${TRACE_LETTERS[letter]}"/>${letter === 'i' ? '<circle class="trace-dot" cx="50" cy="18" r="3"/>' : ''}<circle class="trace-start" r="3"/>`;
        const start = svg.querySelector('path').getPointAtLength(0);
        svg.querySelector('.trace-start').setAttribute('cx', start.x);
        svg.querySelector('.trace-start').setAttribute('cy', start.y);
        socket.append(svg);
      }
    }
    const editable=!movement.started&&!tracingMode;
    socket.setAttribute('role',editable?'button':'listitem');
    socket.tabIndex=editable&&(letter||pickedBlock!==null)?0:-1;
    socket.setAttribute('aria-label',`Socket ${index+1}: ${letter??'empty'}${editable&&letter?'. Select to move this block.':''}`);
    socket.classList.toggle('picked-block',pickedBlock!==null&&selected[index]===pickedBlock);
    socket.classList.toggle('occupied', !!letter);
    socket.classList.toggle('placed', index === placed);
  });
  undo.setAttribute('aria-disabled', String(!circuit.canUndo || movement.started));
  reset.setAttribute('aria-disabled', String(!circuit.canUndo || movement.started));
  pen.setAttribute('aria-disabled', String(!circuit.complete || movement.complete));
  edit.hidden = !movement.started&&!tracingMode;
  replay.hidden = !movement.complete;
  instruction.textContent=movement.complete?'Trace again, or edit your spell.':circuit.complete?(tracingMode||movement.started?'Trace your chosen letters with the pen.':'Your spell is built. Pick up the pen to trace the letters.'):'Move your letters into the frame to finish the spell.';
  penHelp.hidden=!circuit.complete;
  document.querySelector('#block-help').hidden=tracingMode||movement.started;
  const feedback = movement.complete ? 'You tried your spell.' : gesture.phase === 'waiting-release' ? 'Letter traced. Release to move to the next letter.' : circuit.complete ? 'Trace the letters with the pen.' : message;
  status.classList.toggle('visually-hidden',feedback==='Trace the letters with the pen.');
  if (status.textContent !== feedback) status.textContent = feedback;
  if (geometryKey !== circuit.word) buildGeometry();
  drawTrace();
}

// Cache small, evenly spaced centre-line samples in circuit coordinates.
function buildGeometry() {
  geometryKey = circuit.word;
  totalLength = 0;
  const origin = track.getBoundingClientRect();
  strokes = sockets.flatMap((socket, index) => {
    const path = socket.querySelector('.trace-guide');
    if (!path) return [];
    const matrix = path.getScreenCTM(), length = path.getTotalLength();
    const points = [];
    const count = Math.ceil(length * 2);
    for (let n = 0; n <= count; n++) {
      const point = path.getPointAtLength(length * n / count).matrixTransform(matrix);
      const local = {x:point.x - origin.x, y:point.y - origin.y};
      if (n) totalLength += Math.hypot(local.x - points[n-1].x, local.y - points[n-1].y);
      points.push({...local, distance:totalLength});
    }
    return [{index, points, start:points[0].distance, end:totalLength, length, ink:socket.querySelector('.trace-ink')}];
  });
}
function activeStroke() {
  const distance = movement.progress * totalLength;
  return strokes.find(stroke => distance < stroke.end - .001) ?? strokes.at(-1);
}
function tracePoint() {
  const stroke = stoppedIndex === null ? activeStroke() : strokes[stoppedIndex];
  if (!stroke) return {x:(document.querySelector('.fixed-prefix')?.offsetWidth??0)+12,y:track.clientHeight/2};
  const distance = movement.progress * totalLength;
  return stroke.points.reduce((best, point) => Math.abs(point.distance-distance) < Math.abs(best.distance-distance) ? point : best);
}
function drawTrace() {
  const distance = movement.progress * totalLength;
  const active = stoppedIndex === null ? activeStroke() : strokes[stoppedIndex];
  pen.dataset.phase = gesture.phase;
  pen.classList.toggle('stroke-end', gesture.phase === 'waiting-release' || movement.complete);
  sockets.forEach(socket => socket.classList.remove('active'));
  for (const stroke of strokes) {
    const amount = distance >= stroke.end - .001 ? 1 : Math.max(0, (distance-stroke.start)/(stroke.end-stroke.start));
    stroke.ink.style.strokeDasharray = String(stroke.length);
    stroke.ink.style.strokeDashoffset = String(stroke.length * (1-amount));
    sockets[stroke.index].classList.toggle('active', circuit.complete && (tracingMode||movement.started) && !movement.complete && stroke === active);
    if (amount >= 1 && !passed.has(stroke.index)) {
      passed.add(stroke.index);
      sockets[stroke.index].classList.add('passed', 'responding');
    }
  }
  direction.toggleAttribute('hidden', !circuit.complete || (!tracingMode&&!movement.started) || movement.complete || gesture.phase === 'waiting-release');
  if (!direction.hasAttribute('hidden') && active) {
    const next = active.points.find(point => point.distance >= distance+18) ?? active.points.at(-1);
    const after = active.points.find(point => point.distance >= next.distance+5) ?? active.points.at(-1);
    const before = active.points.find(point => point.distance >= Math.max(active.start,next.distance-5)) ?? next;
    direction.style.left = `${next.x}px`;
    direction.style.top = `${next.y}px`;
    direction.style.transform = `translate(-50%,-50%) rotate(${Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI}deg)`;
  }
  const point = !tracingMode&&!movement.started ? {x:surface.clientWidth*.5,y:-12} : tracePoint();
  pen.style.left = `${point.x}px`;
  pen.style.top = `${point.y}px`;
  pen.dataset.progress = String(movement.progress);
  const label = movement.complete ? 'Sleeping pen, tracing complete' : gesture.phase === 'waiting-release' ? 'Sleeping pen, letter traced. Release to move to the next letter.' : active && circuit.complete ? `Sleeping pen, trace ${LETTERS[circuit.slots[active.index]]}, letter ${active.index+1} of 4` : 'Sleeping pen, choose four letters first';
  if (pen.getAttribute('aria-label') !== label) pen.setAttribute('aria-label', label);
}
function clearDirectionFeedback() {
  if (directionTimer !== null) clearTimeout(directionTimer);
  directionTimer = null;
  pen.classList.remove('opposed');
}
function showDirectionFeedback() {
  if (directionTimer !== null) return;
  pen.classList.add('opposed');
  status.classList.remove('visually-hidden');
  status.textContent = 'Go the other way. Follow the arrow.';
  directionTimer = setTimeout(() => {
    clearDirectionFeedback();
    render();
  }, 1000);
}
function advance(next) {
  if (gesture.phase !== 'tracing') return;
  const stroke = activeStroke();
  const wasStarted = movement.started;
  if (!movement.advance(Math.min(next, stroke.end / totalLength), circuit.complete)) return;
  const reachedEnd = movement.progress * totalLength >= stroke.end - .001;
  if (reachedEnd) {
    gesture.finishLetter(movement.complete);
    if (!movement.complete) stoppedIndex = stroke.index;
    stopKey();
    clearDirectionFeedback();
  }
  if (directionTimer !== null) { clearDirectionFeedback(); render(); }
  drawTrace();
  if (!wasStarted || reachedEnd) render();
  if (movement.complete) {
    stopInput();
    track.dispatchEvent(new CustomEvent('spell-tried', {bubbles:true, detail:{word:circuit.word}}));
  }
}

function stopKey() {
  if (keyFrame !== null) cancelAnimationFrame(keyFrame);
  keyFrame = null;
}
function stopPointer() {
  const previous = drag;
  drag = null;
  pen.classList.remove('dragging');
  if (previous && surface.hasPointerCapture(previous.id)) surface.releasePointerCapture(previous.id);
  if (previous) releaseGesture();
}
function releaseGesture() {
  if (gesture.release()) {
    stoppedIndex = null;
    render();
  } else drawTrace();
}
function stopInput() { stopKey(); stopPointer(); releaseGesture(); }
function clearMovement() {
  tracingMode=false;pickedBlock=null;
  stopInput();
  clearDirectionFeedback();
  gesture.reset();
  stoppedIndex = null;
  movement.reset();
  passed.clear();
  pen.dataset.progress = '0';
  pen.setAttribute('aria-label', 'Sleeping pen, at the start of the circuit');
  sockets.forEach(socket => socket.classList.remove('passed', 'responding'));
  drawTrace();
}

// Edits always start a fresh movement attempt. Used/locked actions do nothing.
function chooseLetter(id) {
  if (movement.started || !available.has(LETTERS[id]) || !circuit.choose(id)) return;
  clearMovement();
  render(`${LETTERS[id]} placed.`, circuit.slots.indexOf(id));
}
function moveBlock(id,target) {
  if(movement.started||tracingMode||!available.has(LETTERS[id]))return;
  const changed=target.kind==='tray'?circuit.remove(id):circuit.place(id,target.index);
  if(!changed){pickedBlock=null;render();return;}
  clearMovement();render(target.kind==='tray'?`${LETTERS[id]} returned to the tray.`:`${LETTERS[id]} moved.`,target.index??-1);
}
tokens.forEach((token,id)=>token.addEventListener('click',()=>{
  if(pickedBlock!==null){if(id===pickedBlock)moveBlock(id,{kind:'tray'});return;}
  chooseLetter(id);
}));
sockets.forEach((socket,index)=>{
  function select(){
    if(movement.started||tracingMode)return;
    if(pickedBlock!==null){moveBlock(pickedBlock,{kind:'socket',index});return;}
    const id=circuit.slots[index];if(id===null)return;
    pickedBlock=id;render();status.classList.remove('visually-hidden');status.textContent=`${LETTERS[id]} selected. Choose a space, or its tray outline to return it.`;
  }
  socket.addEventListener('click',select);
  socket.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&pickedBlock!==null){pickedBlock=null;render();}});
const idFor=element=>tokens.includes(element)?tokens.indexOf(element):circuit.slots[sockets.indexOf(element)];
enableLetterBlockDrag({tokens,sockets,frame:surface,tray:document.querySelector('.letter-tray'),idFor,
  canMove:element=>!movement.started&&!tracingMode&&idFor(element)!==null&&available.has(LETTERS[idFor(element)])&&(tokens.includes(element)?!circuit.slots.includes(idFor(element)):true),
  onDrop:moveBlock,
  onCancel:()=>{pickedBlock=null;render();status.classList.remove('visually-hidden');status.textContent='Move cancelled. The block is back where it was.';}
});
undo.addEventListener('click', () => {
  if (movement.started) return;
  const id = circuit.undo();
  if (id !== undefined) {
    clearMovement();
    render('Last move undone.');
  }
});
reset.addEventListener('click', () => {
  if (movement.started || !circuit.canUndo) return;
  clearMovement();
  circuit.reset();
  render('Letters returned.');
});
edit.addEventListener('click', () => {
  clearMovement();
  render();
  undo.focus();
});
replay.addEventListener('click', () => {
  clearMovement();
  render();
  pen.focus();
});
sockets.forEach(socket => socket.addEventListener('animationend', event => {
  if (event.animationName === 'socket-response') socket.classList.remove('responding');
}));

surface.addEventListener('pointerdown', event => {
  if (event.button !== 0 || drag || !circuit.complete || movement.complete) return;
  const target = event.target.closest('#pen, #sockets li.active');
  if(!target)return;
  if(target===pen&&!tracingMode){tracingMode=true;pickedBlock=null;render();}
  if (!gesture.begin()) return;
  event.preventDefault();
  stopKey();
  pen.focus({preventScroll:true});
  // Anchor relative movement at each grab, so resuming never jumps.
  drag = {id:event.pointerId, x:event.clientX, y:event.clientY, backward:0};
  surface.setPointerCapture(event.pointerId);
  pen.classList.add('dragging');
  drawTrace();
});
surface.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  if (event.pointerType === 'mouse' && !(event.buttons & 1)) { stopPointer(); return; }
  if (gesture.phase !== 'tracing') return;
  const dx = event.clientX-drag.x, dy = event.clientY-drag.y;
  drag.x = event.clientX; drag.y = event.clientY;
  const stroke = activeStroke();
  const motion = guidedMotion(stroke.points, movement.progress * totalLength, dx, dy);
  drag.backward = motion.backward ? drag.backward + motion.backward : 0;
  if (drag.backward >= 7) showDirectionFeedback();
  advance(motion.distance / totalLength);
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) surface.addEventListener(type, event => {
  if (drag?.id === event.pointerId) stopPointer();
});
function keyStep(time) {
  const dt = Math.min((time - lastKeyTime) / 1000, .05);
  lastKeyTime = time;
  advance(movement.progress + dt * .28);
  if (keyFrame !== null) keyFrame = requestAnimationFrame(keyStep);
}
pen.addEventListener('keydown', event => {
  if (event.key !== 'ArrowRight' || !circuit.complete || movement.complete) return;
  event.preventDefault();
  if(!tracingMode){tracingMode=true;pickedBlock=null;render();}
  if (keyFrame !== null || drag || event.repeat || !gesture.begin()) return;
  drawTrace();
  lastKeyTime = performance.now();
  keyFrame = requestAnimationFrame(keyStep);
});
pen.addEventListener('keyup', event => {
  if (event.key !== 'ArrowRight') return;
  if (circuit.complete) event.preventDefault();
  stopKey();
  releaseGesture();
});
pen.addEventListener('blur', stopInput);
window.addEventListener('blur', stopInput);
window.addEventListener('pagehide', stopInput);
window.addEventListener('resize', () => { stopInput(); buildGeometry(); drawTrace(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopInput(); });
render();

document.addEventListener('workshop-viewchange', () => {
  stopInput();
  if (!document.querySelector('.workbench').hidden) { buildGeometry(); drawTrace(); }
});
