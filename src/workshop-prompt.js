// Reuse the recorded forest word; never print the completed spelling as a cue.
export function createWorkshopPrompt() {
  const panels=[...document.querySelectorAll('[data-spell-prompt]')];
  const buttons=panels.map(panel=>panel.querySelector('button'));
  const statuses=panels.map(panel=>panel.querySelector('[role=status]'));
  const riddle='“I’m always asking questions and wanting to find out more. What am I?”';
  for(const panel of panels){panel.hidden=false;panel.querySelector('[data-riddle]').textContent=riddle;}
  let audio=null,serial=0,introduced=false;
  function status(message='',visible=false) {
    for(const el of statuses){el.textContent=message;el.classList.toggle('visually-hidden',!visible);}
  }
  function labels(playing=false) {
    for(const button of buttons){button.textContent=playing?'Stop listening':'Hear the word';button.setAttribute('aria-pressed',String(playing));}
  }
  function stop() {
    serial++;
    if(audio){audio.pause();audio.currentTime=0;audio=null;}
    labels();status();
  }
  function play() {
    stop();introduced=true;
    const current=serial;
    audio=new Audio(new URL('../assets/speech/pip-word.wav',import.meta.url).href);
    const failed=()=>{
      if(current!==serial)return;
      stop();introduced=false;
      status('Sound unavailable. Try listening again, or use the written riddle.',true);
    };
    audio.addEventListener('error',failed);
    audio.addEventListener('ended',()=>{
      if(current!==serial)return;
      audio=null;labels();status('Listen again whenever you like.');
    });
    labels(true);status('Playing the spell word.');
    audio.play().catch(failed);
  }
  for(const button of buttons)button.addEventListener('click',()=>audio?stop():play());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  return {introduce(){if(!introduced)play();},stop};
}
