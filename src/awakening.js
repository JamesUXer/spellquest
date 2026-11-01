import {createAwakening,spellOutcome} from './spell-outcome.js';
import {createAwakeningArt} from './awakening-art.js?v=ink-cat-1';

// The isolated construction/tracing preview deliberately keeps its neutral behaviour.
if(new URLSearchParams(location.search).get('scene')==='owl') {
  const sequence=createAwakening();
  const stage=document.querySelector('#awakening');
  const picture=document.querySelector('#awakening-picture');
  const art=createAwakeningArt(stage);
  document.addEventListener('workshop-viewchange',()=>{if(!document.querySelector('.workbench').hidden)art.load();});
  if(!document.querySelector('.workbench').hidden)art.load();
  const pen=document.querySelector('#awakened-pen');
  const question=document.querySelector('#question-drawing');
  const stroke=document.querySelector('#question-stroke');
  const dot=document.querySelector('#question-dot');
  const cat=document.querySelector('#cat-drawing');
  const sitting=document.querySelector('#cat-sitting');
  const peering=document.querySelector('#cat-peering');
  const returning=document.querySelector('#return-ink');
  const caption=document.querySelector('#awakening-caption');
  const description=document.querySelector('#awakening-description');
  const pause=document.querySelector('#pause-awakening');
  const replay=document.querySelector('#replay-awakening');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const labels={
    lift:'The pen rises from the workbench.',
    question:'A question mark appears in ink.',
    cat:'The mark becomes a small ink cat.',
    investigate:'The cat peers into the inkpot.',
    return:'The cat unravels and flows back into the pen.',
    complete:'The pen is awake.'
  };
  let frame=null,lastTime=0,awakened=false,previousPhase='idle';

  function render() {
    const phase=sequence.phase,p=sequence.progress;
    stage.dataset.phase=phase;
    stage.dataset.motion=reduced.matches?'reduced':'full';
    question.toggleAttribute('hidden',phase!=='question');
    cat.toggleAttribute('hidden',!['cat','investigate','return'].includes(phase));
    sitting.toggleAttribute('hidden',phase!=='cat');
    peering.toggleAttribute('hidden',phase==='cat');
    returning.toggleAttribute('hidden',phase!=='return');
    cat.style.opacity=phase==='return'&&!reduced.matches?String(Math.max(0,1-p*2)):phase==='return'?'0':'1';
    const length=stroke.getTotalLength();
    stroke.style.strokeDasharray=String(length);
    stroke.style.strokeDashoffset=String(length*(1-(reduced.matches?1:Math.min(1,p/.65))));
    dot.style.opacity=reduced.matches||p>=.72?'1':'0';
    const returnLength=returning.getTotalLength();
    returning.style.strokeDasharray=reduced.matches?String(returnLength):`${returnLength*.24} ${returnLength}`;
    returning.style.strokeDashoffset=reduced.matches?'0':String(-p*returnLength);
    let x=249,y=333,angle=-90;
    if(phase==='lift') {
      const amount=reduced.matches?1:p;
      x=249+(350-249)*amount;y=333+(140-333)*amount;angle=-90+70*amount;
    } else if(phase==='question') {
      const point=reduced.matches?{x:335,y:175}:p>=.72?{x:410,y:260}:stroke.getPointAtLength(length*Math.min(1,p/.65));
      x=point.x;y=point.y;angle=-20;
    } else if(phase==='cat'||phase==='investigate') {x=325;y=270;angle=-20;}
    pen.setAttribute('transform',`translate(${x} ${y}) rotate(${angle})`);
    if(previousPhase!==phase) {
      document.querySelector('.cat-tail').setAttribute('d',phase==='investigate'||phase==='return'?'M530 315 C430 335 410 290 410 225 C410 172 490 185 480 130 C470 60 350 65 350 140':'M490 327 C408 330 410 290 410 225 C410 172 490 185 480 130 C470 60 350 65 350 140');
      caption.textContent=labels[phase]??'';
      description.textContent=labels[phase]??'The sleeping pen rests beside an inkpot.';
      previousPhase=phase;
    }
    pause.hidden=phase==='complete';replay.hidden=phase!=='complete';
    document.querySelector('#receive-pen').hidden=phase!=='complete';
    pause.textContent=sequence.playing?'Pause':'Continue';
    if(phase==='complete'&&!awakened) {
      awakened=true;document.dispatchEvent(new Event('pen-awakened'));
    }
  }
  function stopFrame() {if(frame!==null)cancelAnimationFrame(frame);frame=null;}
  function tick(time) {
    sequence.advance(Math.min(.05,Math.max(0,(time-lastTime)/1000)));lastTime=time;
    render();
    frame=sequence.playing&&!stage.hidden?requestAnimationFrame(tick):null;
  }
  function play() {
    stopFrame();lastTime=performance.now();render();
    if(sequence.playing&&!stage.hidden)frame=requestAnimationFrame(tick);
  }
  function start(word) {
    stopFrame();art.load();art.use();sequence.reset();previousPhase='idle';sequence.start();
    document.querySelector('#attempted-spell').textContent=word;
    document.dispatchEvent(new Event('workshop-awakening-open'));
    document.querySelector('#awakening-title').focus({preventScroll:true});play();
  }
  function close(view) {
    sequence.pause();stopFrame();
    document.dispatchEvent(new CustomEvent('workshop-awakening-close',{detail:{view}}));
  }
  document.addEventListener('spell-tried',event=>{
    if(!stage.hidden)return;
    const traced=Number(document.querySelector('#pen').dataset.progress)===1;
    const word=document.querySelector('#spell-word').textContent;
    if(event.detail?.word!==word)return;
    const result=spellOutcome(word,traced);
    if(result==='awaken')start(word);
    else if(result==='revise') {
      document.querySelector('#spell-status').textContent='Take another look at your spelling, then try again.';
      document.querySelector('#edit-spell').focus({preventScroll:true});
    }
  });
  pause.addEventListener('click',()=>{
    if(sequence.playing){sequence.pause();stopFrame();render();}
    else{sequence.resume();play();}
  });
  replay.addEventListener('click',()=>{start(document.querySelector('#attempted-spell').textContent);pause.focus({preventScroll:true});});
  document.querySelector('#awakening-to-bench').addEventListener('click',()=>close('bench'));
  document.querySelector('#awakening-to-owl').addEventListener('click',()=>close('scene'));
  document.querySelector('#receive-pen').addEventListener('click',()=>{
    if(sequence.phase!=='complete')return;
    close('scene');
    const take=document.querySelector('#take-pen');
    if(!take.hidden)take.click();
    document.querySelector('#leave-workshop').focus({preventScroll:true});
  });
  function pauseWhenHidden(){if(sequence.playing){sequence.pause();stopFrame();render();}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseWhenHidden();});
  window.addEventListener('pagehide',pauseWhenHidden);
  reduced.addEventListener('change',()=>{if(!stage.hidden)render();});
  // No default animation loop. Frames only run while this short sequence plays.
  picture.dataset.ready='true';
}
