import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BootLoader, RouteLoader } from './components/Loader';
import ScrollTopButton from './components/ScrollTopButton';
import SceneHost from './three/SceneHost';
import ParallaxBackdrop from './components/ParallaxBackdrop';
import Home from './pages/Home';
import './index.css';

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Sembunyikan splash begitu React siap & halaman pertama dirender.
    const t = window.setTimeout(() => setBooted(true), 120);
    return () => window.clearTimeout(t);
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
      <SceneHost theme={theme} />
      <ParallaxBackdrop />
      <RouteTransitionLoader />
      <Layout theme={theme} toggleTheme={toggleTheme} />
      {chatReady && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
      <ScrollTopButton />
      <Analytics />
      <SpeedInsights />
      {!booted && <BootLoader />}
    </BrowserRouter>
  );
}
