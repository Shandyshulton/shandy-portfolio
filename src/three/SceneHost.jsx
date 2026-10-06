import { Component, lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setFrame, setUi } from './store.js';
import './scene.css';

// Three.js + drei + postprocessing cukup berat → dimuat sebagai chunk terpisah,
// jadi teks hero tetap tampil duluan tanpa menunggu WebGL.
const Scene3D = lazy(() => import('./Scene3D.jsx'));

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch {
    return false;
  }
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    document.documentElement.dataset.scene = 'off';
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Hitung "stage" kontinu (0 hero → 1 skills → 2 about) dari posisi scroll. */
function computeStage() {
  const skills = document.getElementById('skills');
  const about = document.getElementById('about');
  if (!skills || !about) return 0;
  const vh = window.innerHeight;
  const y = window.scrollY;
  const a1 = Math.max(skills.getBoundingClientRect().top + y - vh * 0.2, 1);
  const a2 = Math.max(about.getBoundingClientRect().top + y - vh * 0.2, a1 + 1);
  if (y <= a1) return Math.max(0, y / a1);
  if (y <= a2) return 1 + (y - a1) / (a2 - a1);
  return 2;
}

export default function SceneHost({ theme }) {
  const { pathname } = useLocation();
  const [mode] = useState(() => {
    if (typeof window === 'undefined' || !supportsWebGL()) return 'off';
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return reduced ? 'reduced' : 'full';
  });

  useEffect(() => {
    document.documentElement.dataset.scene = mode === 'off' ? 'off' : 'on';
  }, [mode]);

  useEffect(() => {
    setUi({ theme });
  }, [theme]);

  // Rute → scene (Home vs halaman lain) + hitung ulang stage setelah render.
  useEffect(() => {
    const isHome = pathname === '/';
    setFrame({ isHome, route: pathname, stage: isHome ? computeStage() : 0 });
    if (!isHome) return undefined;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setFrame({ stage: computeStage() })));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Scroll & resize → stage (throttle via rAF)
  useEffect(() => {
    if (pathname !== '/') return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      setFrame({ stage: computeStage() });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Konten Home (CMS/i18n) bisa mengubah tinggi section setelah render.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (mode === 'off') return null;

  return (
    <div className="scene-host" aria-hidden="true" data-theme-scene={theme}>
      <SceneBoundary>
        <Suspense fallback={null}>
          <Scene3D theme={theme} reduced={mode === 'reduced'} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
