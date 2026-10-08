import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BootLoader, RouteLoader } from './components/Loader';
import ScrollTopButton from './components/ScrollTopButton';
import ParallaxBackdrop from './components/ParallaxBackdrop';
import Home from './pages/Home';
import './index.css';

// Telemetri Vercel (Analytics + Speed Insights) tidak kritis untuk first paint.
// Di-lazy-load & dimuat bersama scene (setelah idle) agar tidak menambah JS di
// jalur awal / chunk index.
const Analytics = lazy(() => import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights })));

// Scene 3D (Three.js, ~555 KB) bukan konten kritis dan tidak boleh menghalangi
// first paint hero. SceneHost di-lazy-load DAN mount-nya ditunda sampai setelah
// paint pertama (requestIdleCallback / fallback setTimeout), sehingga chunk
// three-vendor baru diunduh & dieksekusi di luar jalur kritis LCP/TBT.
const SceneHost = lazy(() => import('./three/SceneHost'));

// Route-based code splitting: halaman selain Home dimuat saat dinavigasi,
// sehingga bundle awal (Home) lebih kecil dan mengurangi JS tak terpakai.
const Projects = lazy(() => import('./pages/Projects'));
const Education = lazy(() => import('./pages/Education'));
const Experience = lazy(() => import('./pages/Experience'));
const Contact = lazy(() => import('./pages/Contact'));

// Chatbot memuat react-markdown + remark-gfm (berat) dan bukan konten kritis,
// jadi di-defer agar tidak membebani bundle awal.
const Chatbot = lazy(() => import('./components/Chatbot'));

function Layout({ theme, toggleTheme }) {
  const { pathname } = useLocation();
  const isProjects = pathname === '/projects';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<RouteLoader label="memuat halaman" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/education" element={<Education />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </main>
      {!isProjects && <Footer />}
    </div>
  );
}

/** Progress bar + overlay saat pindah halaman */
function RouteTransitionLoader() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (navigationType === 'POP') {
      // Back/forward: langsung, tanpa loader (biasanya dari cache bfcache).
      return undefined;
    }

    const showAt = window.setTimeout(() => {
      setPending(true);
    }, 180);

    const hideAt = window.setTimeout(() => {
      setPending(false);
    }, 900);

    return () => {
      window.clearTimeout(showAt);
      window.clearTimeout(hideAt);
    };
  }, [location.pathname, navigationType]);

  if (!pending) return null;

  return <RouteLoader label="menyiapkan halaman" />;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    // Desain 3D baru dark-first; pilihan tema pengunjung tetap dihormati.
    return localStorage.getItem('theme') || 'dark';
  });
  const [booted, setBooted] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Sembunyikan splash begitu React siap & halaman pertama dirender.
    const t = window.setTimeout(() => setBooted(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  // Mulai memuat scene 3D (chunk three-vendor ~555 KB) hanya SETELAH paint
  // pertama: tunggu browser idle agar hero/teks tampil lebih dulu. Fallback
  // setTimeout untuk browser tanpa requestIdleCallback (Safari lama).
  useEffect(() => {
    let idleId;
    const start = () => setSceneReady(true);
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(start, 400);
    }
    return () => {
      if ('cancelIdleCallback' in window && idleId) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  // Tunda pemuatan Chatbot (chunk react-markdown ~160 KiB) sampai browser
  // idle atau ada interaksi pertama, agar keluar dari jalur kritis LCP.
  useEffect(() => {
    let idleId;
    const trigger = () => setChatReady(true);

    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, trigger, { once: true, passive: true }));

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(trigger, { timeout: 3000 });
    } else {
      idleId = window.setTimeout(trigger, 2000);
    }

    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
      if ('cancelIdleCallback' in window && idleId) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <BrowserRouter>
      {sceneReady && (
        <Suspense fallback={null}>
          <SceneHost theme={theme} />
        </Suspense>
      )}
      <ParallaxBackdrop />
      <RouteTransitionLoader />
      <Layout theme={theme} toggleTheme={toggleTheme} />
      {chatReady && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
      <ScrollTopButton />
      {sceneReady && (
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      )}
      {!booted && <BootLoader />}
    </BrowserRouter>
  );
}
