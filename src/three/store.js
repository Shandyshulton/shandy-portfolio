import { useSyncExternalStore } from 'react';

/**
 * Store kecil untuk menghubungkan DOM (React) dengan scene WebGL.
 *
 * - `frame`  : nilai yang berubah sangat sering (scroll, rute). Dibaca langsung
 *              di useFrame TANPA memicu re-render React.
 * - `ui`     : nilai yang perlu memicu re-render (node yang di-hover, tema).
 */
export const frame = {
  stage: 0,      // 0 = hero, 1 = skills, 2 = about (kontinu saat scroll)
  isHome: true,  // false di halaman selain Home
  route: '/',
};

let ui = { hovered: null, theme: 'dark' };
const listeners = new Set();
const frameListeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export function setUi(patch) {
  const next = { ...ui, ...patch };
  if (next.hovered === ui.hovered && next.theme === ui.theme) return;
  ui = next;
  emit();
  frameListeners.forEach((l) => l());
}

export function setFrame(patch) {
  Object.assign(frame, patch);
  frameListeners.forEach((l) => l());
}

/** Dipakai mode reduced-motion: render ulang hanya saat state berubah. */
export function onFrameChange(cb) {
  frameListeners.add(cb);
  return () => frameListeners.delete(cb);
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSceneUi(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(ui));
}
