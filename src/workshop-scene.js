import {drawWorkshopScene,loadWorkshopSceneArt} from './workshop-scene-art.js?v=journey-art-1';
import {createWorkshopEntrance} from './workshop-entrance-motion.js?v=journey-art-1';
import {workshopLetters} from './workshop-entry.js';
import {createPenReceipt} from './pen-receipt.js';
import {createWorkshopPrompt} from './workshop-prompt.js?v=riddle-1';

const params=new URLSearchParams(location.search);
const scene=document.querySelector('#owl-scene');
const bench=document.querySelector('.workbench');
const back=document.querySelector('#back-to-owl');
const approach=document.querySelector('#approach-workbench');
const canvas=document.querySelector('#workshop-scene');
const awakening=document.querySelector('#awakening');
const revisit=document.querySelector('#revisit-workbench');
const skipEntrance=document.querySelector('#skip-workshop-entrance');
const enabled=params.get('scene')==='owl';
if(enabled) {
  const prompt=createWorkshopPrompt();
  document.addEventListener('workshop-viewchange',()=>{if(bench.hidden)prompt.stop();});
  const workshopSceneArtReady=loadWorkshopSceneArt();
  const letters=workshopLetters(params,{getItem:key=>localStorage.getItem(key)});
  const isForest=params.get('source')==='forest';
  // A fresh development preview leaves both saved journeys and the normal preview alone.
  const fresh=params.get('preview')==='fresh'&&!isForest,temporary=new Map();
  const receiptStorage=fresh
    ? {getItem:key=>temporary.get(key)??null,setItem:(key,value)=>temporary.set(key,value)}
    : {getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
  const receipt=createPenReceipt(receiptStorage,{preview:!isForest});
  const take=document.querySelector('#take-pen');
  const leave=document.querySelector('#leave-workshop');
  const saveStatus=document.querySelector('#receipt-status');
  document.querySelector('#scene-letters').textContent=isForest
    ? letters.length===4?'Your four letters are ready. Choose the pen to begin.':`You have ${letters.length} of 4 letters. Return to the forest to find the rest.`
    :'Your four letters are ready. Choose the pen to begin.';
  approach.disabled=letters.length!==4;
  let visited=false,awake=receipt.received,entrance=null;
  function showScene() {
    bench.hidden=true;scene.hidden=false;awakening.hidden=true;back.hidden=true;
    document.querySelector('#scene-spell-prompt').hidden=awake;
    take.hidden=!awake||receipt.received;
    leave.hidden=!receipt.received;
    approach.hidden=awake;revisit.hidden=!awake;revisit.disabled=approach.disabled;
    if(receipt.received) {
      document.querySelector('#scene-line').textContent='The pen is yours. Take it with you into the forest.';
      document.querySelector('#scene-letters').textContent='Your first spell is complete.';
      revisit.textContent='Revisit the workbench';
    } else if(awake) {
      document.querySelector('#scene-line').textContent='The pen is awake. The owl holds it out to you.';
    } else if(letters.length!==4) {
      document.querySelector('#scene-line').textContent='There are still letters to find in the forest.';
    } else if(visited) {
      document.querySelector('#scene-line').textContent='The workbench is ready when you are. Choose the pen to return.';
      approach.setAttribute('aria-label','Choose the pen to return to your spell');
    }
    document.dispatchEvent(new Event('workshop-viewchange'));
    draw();
    document.querySelector('#scene-title').focus({preventScroll:true});
  }
  function showBench() {
    if(approach.disabled)return;
    entrance?.stop();
    visited=true;scene.hidden=true;awakening.hidden=true;bench.hidden=false;back.hidden=false;
    document.dispatchEvent(new Event('workshop-viewchange'));
    document.querySelector('#workshop-title').focus({preventScroll:true});
    if(!awake)prompt.introduce();
  }
  function draw() {
    if(scene.hidden)return;
    const ratio=Math.min(devicePixelRatio||1,2),bounds=canvas.getBoundingClientRect();
    canvas.width=Math.round(bounds.width*ratio);canvas.height=Math.round(bounds.height*ratio);
    canvas.dataset.art=drawWorkshopScene(canvas.getContext('2d'),canvas.width,canvas.height,{awake,received:receipt.received});
    canvas.setAttribute('aria-label',receipt.received?'The explorer holds the awakened pen, facing the owl across the workbench.':awake?'The owl holds the awakened pen out towards the explorer.':'The explorer faces the owl across the workbench. The sleeping pen rests beside an inkpot.');
  }
  document.addEventListener('workshop-awakening-open',()=>{
    bench.hidden=true;scene.hidden=true;awakening.hidden=false;back.hidden=true;
    document.dispatchEvent(new Event('workshop-viewchange'));
  });
  document.addEventListener('workshop-awakening-close',event=>event.detail.view==='scene'?showScene():showBench());
  document.addEventListener('pen-awakened',()=>{awake=true;if(!scene.hidden)showScene();});
  take.addEventListener('click',()=>{
    const result=receipt.receive(awake);
    if(!result.changed)return;
    saveStatus.textContent=result.saved?(isForest?'Your pen is saved on this browser.':'Preview complete. Your forest journey is unchanged.'):'You have the pen for this visit. This browser could not save it; leaving or reloading will lose this progress.';
    document.dispatchEvent(new Event('pen-received'));
    showScene();leave.focus({preventScroll:true});
  });
  approach.addEventListener('click',showBench);
  revisit.addEventListener('click',showBench);
  back.addEventListener('click',showScene);
  window.addEventListener('resize',draw);
  showScene();
  workshopSceneArtReady.then(draw);
  // A single arrival entrance per visit. Returning from the bench never replays it.
  // Children who already received the pen go directly to the saved held pose.
  if(!receipt.received) {
    document.querySelector('#workshop-cut-in').append(document.querySelector('#workshop-entrance-art').content.cloneNode(true));
    entrance=createWorkshopEntrance({stage:document.querySelector('#scene-picture'),
      overlay:document.querySelector('#workshop-cut-in'),
      status:document.querySelector('#workshop-entrance-status'),skip:skipEntrance,
      assetsReady:workshopSceneArtReady,
      readyText:letters.length===4?'Choose the pen to begin.':'Return to the forest to find the remaining letters.',
      onFinish:()=>{skipEntrance.hidden=true;},
      onSkip:()=>{(approach.disabled?document.querySelector('#scene-title'):approach).focus({preventScroll:true});}
    });
    skipEntrance.hidden=false;
  }
}
