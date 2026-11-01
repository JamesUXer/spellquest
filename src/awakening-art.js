// The transparent sheets are only requested when the child enters the workbench.
// SVG viewBoxes isolate the measured silhouettes without changing the source PNGs.
export function createAwakeningArt(stage) {
  const base=new URL('../assets/workshop/',import.meta.url);
  const sheets={cat:{file:'ink-cat-poses-v1.png',width:1672,height:941},props:{file:'awakening-props-v1.png',width:1671,height:941}};
  const sprites=[
    {parent:'#cat-sitting',sheet:'cat',crop:[225,117,473,723],box:[470,162,134,198]},
    {parent:'#cat-peering',sheet:'cat',crop:[964,335,616,507],box:[510,156,220,190]},
    {parent:'#awakening-inkpot',sheet:'props',crop:[988,590,299,300],box:[655,274,90,90]},
    {parent:'#awakened-pen',sheet:'props',crop:[473,23,86,866],box:[-10,-128,20,128]}
  ];
  let promise,ready=false,attached=false;
  function load() {
    return promise??=Promise.all(Object.values(sheets).map(async sheet=>{
      const image=new Image();image.src=new URL(sheet.file,base).href;await image.decode();
    })).then(()=>{ready=true;stage.dataset.artReady='true';return true;}).catch(()=>{stage.dataset.artReady='false';return false;});
  }
  function use() {
    if(ready&&!attached) {
      const ns='http://www.w3.org/2000/svg';
      for(const sprite of sprites) {
        const sheet=sheets[sprite.sheet],svg=document.createElementNS(ns,'svg'),image=document.createElementNS(ns,'image');
        svg.setAttribute('class','awakening-illustration');svg.setAttribute('aria-hidden','true');
        svg.setAttribute('viewBox',sprite.crop.join(' '));svg.setAttribute('preserveAspectRatio','xMidYMax meet');
        ['x','y','width','height'].forEach((name,index)=>svg.setAttribute(name,sprite.box[index]));
        image.setAttribute('href',new URL(sheet.file,base).href);image.setAttribute('width',sheet.width);image.setAttribute('height',sheet.height);
        svg.append(image);stage.querySelector(sprite.parent).append(svg);
      }
      attached=true;
    }
    stage.dataset.art=ready?'illustrated':'fallback';
    return ready;
  }
  return {load,use,get ready(){return ready;}};
}
