export const FOREST_SAVE_KEY = 'spellquest.forest.v2';
export const TRAY_LETTERS = Object.freeze(['u','s','i','o']);

export function workshopLetters(params, storage) {
  if (params.get('source') !== 'forest') return [...TRAY_LETTERS];
  try {
    const saved = JSON.parse(storage.getItem(FOREST_SAVE_KEY));
    const found = Array.isArray(saved?.collected) ? saved.collected : [];
    return TRAY_LETTERS.filter(letter => found.includes(letter.toUpperCase()));
  } catch { return []; }
}

export function atWorkshopDoor(player, destination) {
  return Math.hypot(player.x-destination.x,player.y-destination.y) < 115;
}
