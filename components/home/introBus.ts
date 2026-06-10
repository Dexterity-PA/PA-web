// One-shot signal from the curtain to the typing intro: fired the instant the
// curtain begins parting, so the headline starts typing as the hero is revealed.
// Race-free — a subscriber that arrives after the signal fires runs immediately.
let revealed = false;
const waiters = new Set<() => void>();

export function signalReveal() {
  if (revealed) return;
  revealed = true;
  waiters.forEach((fn) => fn());
  waiters.clear();
}

export function onReveal(cb: () => void): () => void {
  if (revealed) {
    cb();
    return () => {};
  }
  waiters.add(cb);
  return () => waiters.delete(cb);
}
