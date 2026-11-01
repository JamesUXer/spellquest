// Separate from the forest save so an older forest tab cannot overwrite ownership.
export const PEN_RECEIPT_KEY='spellquest.pen-receipt.v1';
export const PREVIEW_RECEIPT_KEY='spellquest.pen-receipt.preview.v1';
export function createPenReceipt(storage,{preview=false}={}) {
  const key=preview?PREVIEW_RECEIPT_KEY:PEN_RECEIPT_KEY;
  let received=false;
  try {received=JSON.parse(storage.getItem(key))?.received===true;}catch{}
  return {
    get received(){return received;},
    receive(awake) {
      if(!awake||received)return {changed:false,saved:received};
      received=true;
      try {storage.setItem(key,JSON.stringify({received:true}));return {changed:true,saved:true};}
      catch {return {changed:true,saved:false};}
    },
    clear() {
      received=false;
      try {storage.removeItem(key);return true;}catch{return false;}
    }
  };
}
