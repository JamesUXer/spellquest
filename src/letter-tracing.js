// Simple centre-line lowercase forms, not the outline of a display font.
// The i dot is stamped when its stem is finished, avoiding a precision target.
export const TRACE_LETTERS = Object.freeze({
  i: 'M50 32 L50 78',
  o: 'M50 28 C80 28 80 78 50 78 C20 78 20 28 50 28',
  u: 'M27 28 L27 59 C27 85 70 85 70 59 L70 28 L70 78',
  s: 'M72 34 C56 18 26 26 28 43 C30 56 71 49 72 65 C74 83 41 85 26 73'
});

// Input is a movement vector, never a position target. The pen stays guided
// while the hand can make a larger, smaller or displaced version of the stroke.
function pointAt(points, distance) {
  let low = 0, high = points.length-1;
  while (low < high) {
    const middle = (low+high) >> 1;
    if (points[middle].distance < distance) low = middle+1;
    else high = middle;
  }
  return points[low];
}
function alignment(points, distance, dx, dy, travel) {
  const before = pointAt(points, Math.max(points[0].distance,distance-4));
  const after = pointAt(points, Math.min(points.at(-1).distance,distance+6));
  const tx = after.x-before.x, ty = after.y-before.y;
  const length = Math.hypot(tx,ty);
  return length ? (dx*tx+dy*ty)/(length*travel) : 0;
}
export function guidedMotion(points, current, dx, dy) {
  const travel = Math.hypot(dx,dy);
  if (!travel || !Number.isFinite(travel)) return {distance:current, backward:0};
  const endpoint = points.at(-1).distance;
  let distance = current, budget = Math.min(32,travel), initialAlignment = 0;
  while (budget > .001 && distance < endpoint) {
    // Accept the current direction or an approaching turn. A broad hand curve
    // can lead the nib without being mistaken for backwards movement.
    const agreement = Math.max(...[0,6,12].map(ahead => alignment(points,Math.min(endpoint,distance+ahead),dx,dy,travel)));
    if (distance === current) initialAlignment = agreement;
    if (agreement < .08) break;
    const step = Math.min(2,budget,endpoint-distance);
    distance += step;
    budget -= step;
  }
  if (distance > current && endpoint-distance <= 6) distance = endpoint;
  return {distance, backward:distance === current && initialAlignment < -.65 ? travel : 0};
}
