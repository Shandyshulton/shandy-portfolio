import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BootLoader, RouteLoader } from './components/Loader';
import ScrollTopButton from './components/ScrollTopButton';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Education from './pages/Education';
import Experience from './pages/Experience';
import Contact from './pages/Contact';
import './index.css';

function Layout({ theme, toggleTheme }) {
  const { pathname } = useLocation();
  const isProjects = pathname === '/projects';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/education" element={<Education />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
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
    return localStorage.getItem('theme') || 'light';
  });
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Sembunyikan splash begitu React siap & halaman pertama dirender.
    const t = window.setTimeout(() => setBooted(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <BrowserRouter>
      <RouteTransitionLoader />
      <Layout theme={theme} toggleTheme={toggleTheme} />
      <Chatbot />
      <ScrollTopButton />
      <Analytics />
      <SpeedInsights />
      {!booted && <BootLoader />}
    </BrowserRouter>
  );
}
