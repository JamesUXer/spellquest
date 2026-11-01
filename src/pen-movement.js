// Shared monotonic progress for pointer and keyboard input. No spelling judgement.
export function createPenMovement() {
  let progress = 0;
  return {
    get progress() { return progress; },
    get started() { return progress > 0; },
    get complete() { return progress === 1; },
    advance(next, ready) {
      if (!ready || !Number.isFinite(next) || next <= progress || progress === 1) return false;
      progress = Math.min(1, next);
      return true;
    },
    reset() { progress = 0; }
  };
}
