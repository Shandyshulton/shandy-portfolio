import { useSyncExternalStore } from 'react';

/**
 * Store kecil untuk highlight chip skill di Home (hover/focus/tap).
 * (Dulu jembatan DOM↔WebGL; scene 3D sudah dilepas, jadi kini hanya state hover.)
 */
let ui = { hovered: null };
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export function setUi(patch) {
  const next = { ...ui, ...patch };
  if (next.hovered === ui.hovered) return;
  ui = next;
  emit();
}

export const getUi = () => ui;

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStackUi(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(ui));
}
