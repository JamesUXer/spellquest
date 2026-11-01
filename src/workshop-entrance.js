import {createWorkshopEntrance} from './workshop-entrance-motion.js?v=journey-art-1';
// Isolated motion study. No forest saves or workshop input state are read or changed.
const stage=document.querySelector('#entrance');
createWorkshopEntrance({stage,overlay:document.querySelector('#cut-in'),
  status:document.querySelector('#entrance-status'),skip:document.querySelector('#skip'),
  replay:document.querySelector('#replay'),images:[...stage.querySelectorAll('img')],
  readyText:'The workshop is ready. Replay the entrance or open the working workshop.'});
