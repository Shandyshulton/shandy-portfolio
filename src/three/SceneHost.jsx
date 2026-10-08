import { Component, lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setFrame, setUi } from './store.js';
import './scene.css';

// Three.js + drei + postprocessing cukup berat → dimuat sebagai chunk terpisah,
// jadi teks hero tetap tampil duluan tanpa menunggu WebGL.
const Scene3D = lazy(() => import('./Scene3D.jsx'));

/**
 * Deteksi kemampuan WebGL + apakah GPU asli tersedia.
 * - `failIfMajorPerformanceCaveat: true` → context gagal dibuat bila browser
 *   akan memakai renderer software (lambat). Ini kunci menghindari jalur
 *   software yang memblokir main thread (kasus PageSpeed Insights/no-GPU).
 * - WEBGL_debug_renderer_info → deteksi string SwiftShader/llvmpipe/Software
 *   sebagai sabuk pengaman tambahan.
 * Mengembalikan: 'none' | 'software' | 'gpu'
 */
function detectRenderer() {
  if (typeof window === 'undefined') return 'none';
  let c;
  try {
    c = document.createElement('canvas');
  } catch {
    return 'none';
  }
  const opts = { failIfMajorPerformanceCaveat: true, powerPreference: 'high-performance' };
  const gl =
    (window.WebGL2RenderingContext && c.getContext('webgl2', opts)) ||
    c.getContext('webgl', opts) ||
    c.getContext('experimental-webgl', opts);

  if (!gl) {
    // Gagal dengan caveat aktif. Coba sekali lagi TANPA caveat hanya untuk tahu
    // apakah WebGL ada sama sekali (→ 'software') atau benar-benar tidak ada.
    const soft =
      (window.WebGL2RenderingContext && c.getContext('webgl2')) ||
      c.getContext('webgl') ||
      c.getContext('experimental-webgl');
    return soft ? 'software' : 'none';
  }

  // Context berhasil tanpa caveat → periksa nama renderer untuk memastikan.
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
    if (/swiftshader|llvmpipe|software|microsoft basic|mesa offscreen/i.test(r)) {
      return 'software';
    }
  } catch {
    /* abaikan: anggap gpu bila tidak bisa membaca */
  }
  return 'gpu';
}

function prefersStatic() {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;
  return reduced || saveData;
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // WebGL gagal saat runtime (driver/GPU bermasalah) → perlakukan seperti mode
    // 'static': poster facade tetap jadi latar, ambient CSS lama tetap tersembunyi.
    document.documentElement.dataset.scene = 'static';
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

  // Mode kualitas scene (ditentukan sekali saat mount):
  //  'static'  → TIDAK PERNAH menjalankan WebGL live (poster saja). Dipakai bila
  //              renderer software/no-GPU, prefers-reduced-motion, atau Save-Data.
  //              Ini memangkas beban main thread di PSI/perangkat tanpa GPU.
  //  'reduced' → GPU asli tapi perangkat lemah: scene hemat (render on-demand).
  //  'full'    → GPU asli, perangkat normal: scene penuh.
  const [mode] = useState(() => {
    if (typeof window === 'undefined') return 'static';
    const renderer = detectRenderer();
    if (renderer === 'none' || renderer === 'software') return 'static';
    if (prefersStatic()) return 'static';

    // GPU asli: tentukan full vs reduced (perangkat lemah).
    const mem = navigator.deviceMemory;          // undefined di Safari/iOS
    const cores = navigator.hardwareConcurrency; // umum tersedia
    const dpr = window.devicePixelRatio || 1;
    const minSide = Math.min(window.screen?.width || 9999, window.screen?.height || 9999);
    const lowMem = typeof mem === 'number' && mem > 0 && mem < 4;
    const lowCores = typeof cores === 'number' && cores > 0 && cores <= 4;
    const heavyMobile = minSide <= 420 && dpr >= 2;
    return (lowMem || lowCores || heavyMobile) ? 'reduced' : 'full';
  });

  // Facade: scene live baru diaktifkan SETELAH poster tampil + ada sinyal bahwa
  // pengguna kemungkinan akan melihat animasi (interaksi) atau idle cukup lama.
  // Di 'static' tidak pernah aktif → canvas WebGL tidak pernah dibuat.
  const [activate, setActivate] = useState(false);
  useEffect(() => {
    if (mode === 'static') return undefined;
    let idleId;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      setActivate(true);
    };
    const events = ['pointerdown', 'touchstart', 'scroll', 'keydown'];
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    // Desktop idle ~4 detik → aktifkan walau tanpa interaksi, agar scene tetap
    // muncul untuk pengunjung pasif. Mobile menunggu interaksi saja.
    const isDesktop = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    if (isDesktop) {
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(go, { timeout: 4500 });
      else idleId = window.setTimeout(go, 4000);
    }
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      if (idleId != null) {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
    };
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.scene = mode === 'static' ? 'static' : 'on';
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

  // Halaman selain Home: progres scroll (window atau container internal) → scene.
  useEffect(() => {
    if (pathname === '/') return undefined;
    setFrame({ progress: 0 });
    let raf = 0;
    let el = null;
    const read = () => {
      raf = 0;
      const t = el && el !== document ? el : document.scrollingElement;
      const max = t.scrollHeight - t.clientHeight;
      if (max <= 4) return; // scroller horizontal / tidak bisa di-scroll: abaikan
      setFrame({ progress: Math.min(1, Math.max(0, t.scrollTop / max)) });
    };
    const onScroll = (e) => {
      el = e.target;
      if (!raf) raf = requestAnimationFrame(read);
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (mode === 'off') return null;

  return (
    <div className="scene-host" aria-hidden="true" data-theme-scene={theme} data-mode={mode}>
      {/* Poster statis (facade). Selalu tampil sebagai latar; di mode 'static'
          inilah satu-satunya visual (tanpa WebGL). Fade-out saat canvas siap. */}
      <picture>
        <source srcSet="/images/hero-poster.webp" type="image/webp" />
        <img
          className="scene-poster"
          src="/images/hero-poster.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          data-theme-poster={theme}
        />
      </picture>
      <div className="scene-fallback" aria-hidden="true" />
      {mode !== 'static' && activate && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <Scene3D theme={theme} reduced={mode === 'reduced'} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
