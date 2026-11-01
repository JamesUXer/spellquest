import {drawWorkshopSceneFallback} from './workshop-scene-fallback.js';

const sources={sleeping:'../docs/concepts/owl-workshop-style-v1.png',offered:'../assets/workshop/pen-offered-v1.png',received:'../assets/workshop/pen-received-v1.png'};
const images={};
let ready,settled=false;
export function loadWorkshopSceneArt(){return ready??=Promise.all(Object.entries(sources).map(async([state,path])=>{
  const image=new Image();image.src=new URL(path,import.meta.url).href;
  try{await image.decode();images[state]=image;}catch{/* Keep the functional vector fallback. */}
})).then(()=>{settled=true;});}

// Held images repaint only on view/state changes and resize. Crop the baked caption
// strip from the concept image; all instructions and controls remain accessible HTML.
export function drawWorkshopScene(ctx,width,height,{awake=false,received=false}={}) {
  const state=received?'received':awake?'offered':'sleeping',image=images[state];
  if(!image&&!settled){ctx.clearRect(0,0,width,height);ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);return 'loading';}
  if(!image){drawWorkshopSceneFallback(ctx,width,height,{awake,received});return 'fallback';}
  ctx.clearRect(0,0,width,height);
  ctx.drawImage(image,0,0,image.naturalWidth,Math.min(image.naturalHeight,image.naturalWidth*850/1672),0,0,width,height);
  return state;
}
