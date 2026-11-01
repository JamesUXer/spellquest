// Only a fully traced attempt is assessed. Construction itself stays neutral.
export function spellOutcome(word, traced) {
  if (!traced) return 'incomplete';
  return word === 'curious' ? 'awaken' : 'revise';
}

export const AWAKENING_BEATS = Object.freeze([
  {id:'lift',duration:.7},
  {id:'question',duration:1.5},
  {id:'cat',duration:1.2},
  {id:'investigate',duration:1.8},
  {id:'return',duration:1.3}
]);

export function createAwakening() {
  let index=-1,elapsed=0,playing=false;
  return {
    get phase(){return index<0?'idle':index>=AWAKENING_BEATS.length?'complete':AWAKENING_BEATS[index].id;},
    get progress(){return index<0?0:index>=AWAKENING_BEATS.length?1:elapsed/AWAKENING_BEATS[index].duration;},
    get playing(){return playing;},
    start(){if(index!==-1)return false;index=0;elapsed=0;playing=true;return true;},
    reset(){index=-1;elapsed=0;playing=false;},
    pause(){playing=false;},
    resume(){if(index>=0&&index<AWAKENING_BEATS.length)playing=true;},
    advance(seconds){
      if(!playing||!Number.isFinite(seconds)||seconds<=0)return;
      elapsed+=seconds;
      while(index<AWAKENING_BEATS.length&&elapsed>=AWAKENING_BEATS[index].duration){
        elapsed-=AWAKENING_BEATS[index].duration;index++;
      }
      if(index>=AWAKENING_BEATS.length){elapsed=0;playing=false;}
    }
  };
}
