// A stroke ending never arms the next one. Only release returns it to ready.
export function createTraceGesture() {
  let phase = 'ready';
  return {
    get phase() { return phase; },
    begin() {
      if (phase !== 'ready') return false;
      phase = 'tracing';
      return true;
    },
    finishLetter(final = false) {
      if (phase !== 'tracing') return false;
      phase = final ? 'complete' : 'waiting-release';
      return true;
    },
    release() {
      const lifted = phase === 'waiting-release';
      if (phase !== 'complete') phase = 'ready';
      return lifted;
    },
    reset() { phase = 'ready'; }
  };
}
