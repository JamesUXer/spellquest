// Token identity is its original tray position; sockets keep their own positions.
export const LETTERS = Object.freeze(['u', 's', 'i', 'o']);
export function createCircuit() {
  const slots=Array(LETTERS.length).fill(null),history=[];
  const validId=id=>Number.isInteger(id)&&id>=0&&id<LETTERS.length;
  const remember=id=>history.push({id,slots:[...slots]});
  function place(id,index) {
    if(!validId(id)||!Number.isInteger(index)||index<0||index>=slots.length)return false;
    const source=slots.indexOf(id);if(source===index)return false;
    remember(id);
    const displaced=slots[index];slots[index]=id;
    if(source!==-1)slots[source]=displaced;
    return true;
  }
  return {
    get slots(){return [...slots];},
    get selected(){return slots.filter(id=>id!==null);},
    get word(){return 'cur'+slots.map(id=>id===null?'_':LETTERS[id]).join('');},
    get complete(){return slots.every(id=>id!==null);},
    get canUndo(){return history.length>0;},
    choose(id){if(!validId(id)||slots.includes(id))return false;const index=slots.indexOf(null);return index!==-1&&place(id,index);},
    place,
    remove(id){const index=slots.indexOf(id);if(!validId(id)||index===-1)return false;remember(id);slots[index]=null;return true;},
    undo(){const previous=history.pop();if(!previous)return;slots.splice(0,slots.length,...previous.slots);return previous.id;},
    reset(){slots.fill(null);history.length=0;}
  };
}
