// Dialogue and narration assets are separate from NPC placement and artwork.
export const encounters={
 pip:{word:'curious',mode:'listen',text:"I'm curious about that splashing sound. I think there's a lake through those trees."},
 bramble:{word:'mysterious',mode:'spot',text:"These footprints are mysterious. They go around the bushes and back to the main path!"},
 fern:{word:'cautious',mode:'listen',text:"I'm cautious near the water. Let's stay on the path and watch the waterfall together."},
 hazel:{word:'delicious',mode:'spot',text:"My picnic smells delicious! I'm taking these warm little buns across the bridge to the owl."}
};
export function isTarget(token,word){return token.replace(/[^a-z]/gi,'').toLowerCase()===word.toLowerCase()}
export function nearestCharacter(player,characters,range=135){return characters.filter(n=>Math.hypot(n.x-player.x,n.y-player.y)<range).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0]||null}
export function createEncounters({characters,onOpen,onProgress,onClose,progress}){
 const dialog=document.querySelector('#conversation'),text=document.querySelector('#speech-text'),feedback=document.querySelector('#word-feedback'),task=document.querySelector('#word-task');
 let active=null,audio=null,request=0;
 function stop(){request++;if(audio){audio.pause();audio.currentTime=0;audio=null}}
 function highlight(){text.querySelector('[data-target]')?.classList.add('found-word')}
 function play(wordOnly=false){
  stop();if(!active)return;let id=active.id,serial=request;
  audio=new Audio(`assets/speech/${id}${wordOnly?'-word':''}.wav`);
  document.querySelector('#audio-status').textContent='Playing…';
  const failed=()=>{if(serial===request)document.querySelector('#audio-status').textContent='Sound unavailable. You can still read and explore.'};
  audio.addEventListener('error',failed);
  audio.addEventListener('ended',()=>{if(serial!==request)return;document.querySelector('#audio-status').textContent='Listen again whenever you like.';if(encounters[id].mode==='listen')highlight()});
  audio.play().catch(failed);
 }
 function choose(token,el){if(!active)return;let scene=encounters[active.id];if(progress.spotted.includes(active.id)&&!isTarget(token,scene.word))return;if(isTarget(token,scene.word)){
   highlight();text.querySelectorAll('.tried-word').forEach(el=>el.classList.remove('tried-word'));task.textContent='Listen to the word again, or keep exploring.';document.querySelector('#hint-word').hidden=true;feedback.textContent=`You found ${scene.word}! It ends in ious.`;
   if(!progress.spotted.includes(active.id))progress.spotted.push(active.id);
   document.querySelector('#hear-word').hidden=false;onProgress();play(true);
  }else{feedback.textContent='Try listening again. Look for ious at the end of a word.';el.classList.add('tried-word');}
 }
 function open(npc){
  if(dialog.open)return;active=npc;onOpen();const scene=encounters[npc.id];
  document.querySelector('#speaker-name').textContent=npc.name;
  document.querySelector('#speaker-detail').textContent=`The ${npc.species} · ${scene.mode==='spot'?'listen & look':'a forest conversation'}`;
  feedback.textContent='';document.querySelector('#audio-status').textContent='';
  task.textContent='Can you tap the word that ends in ious?';task.hidden=scene.mode!=='spot';document.querySelector('#hint-word').hidden=scene.mode!=='spot';
  const solved=progress.spotted.includes(npc.id);document.querySelector('#hear-word').hidden=scene.mode==='spot'&&!solved;
  document.querySelector('#hear-word').textContent=`Hear “${scene.word}”`;
  text.replaceChildren();for(let token of scene.text.split(/(\s+)/)){
   if(!token.trim()){text.append(document.createTextNode(token));continue}
   let el=document.createElement(scene.mode==='spot'?'button':'span');el.textContent=token;
   if(isTarget(token,scene.word))el.dataset.target='true';
   if(scene.mode==='spot'){el.type='button';el.className='word-choice';el.onclick=()=>choose(token,el)}
   text.append(el);
  }
  if(solved){highlight();task.textContent='You spotted this word. Listen again, or keep exploring.';document.querySelector('#hint-word').hidden=true;}if(!progress.met.includes(npc.id))progress.met.push(npc.id);onProgress();dialog.showModal();play();
 }
 dialog.addEventListener('close',()=>{stop();active=null;onClose()});
 document.querySelector('#leave-conversation').onclick=()=>dialog.close();
 document.querySelector('#replay-speech').onclick=()=>play();document.querySelector('#hear-word').onclick=()=>play(true);
 document.querySelector('#hint-word').onclick=()=>{if(!active)return;let el=text.querySelector('[data-target]'),word=encounters[active.id].word;el.replaceChildren(document.createTextNode(word.slice(0,-4)));let suffix=document.createElement('u');suffix.textContent=word.slice(-4);el.append(suffix);feedback.textContent='Look for this ending: ious. You can tap the word or keep exploring.'};
 return {open,get active(){return active?.id||null}};
}
