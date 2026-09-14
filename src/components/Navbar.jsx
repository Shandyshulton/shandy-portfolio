import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const FlagID = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="20" height="14" style={{borderRadius:2,display:'block'}}>
    <rect width="900" height="300" fill="#CE1126"/>
    <rect y="300" width="900" height="300" fill="#FFFFFF"/>
  </svg>
);

const FlagUS = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="20" height="14" style={{borderRadius:2,display:'block'}}>
    <rect width="900" height="600" fill="#B22234"/>
    <rect y="46" width="900" height="46" fill="#fff"/>
    <rect y="138" width="900" height="46" fill="#fff"/>
    <rect y="230" width="900" height="46" fill="#fff"/>
    <rect y="322" width="900" height="46" fill="#fff"/>
    <rect y="415" width="900" height="46" fill="#fff"/>
    <rect y="507" width="900" height="46" fill="#fff"/>
    <rect width="360" height="323" fill="#3C3B6E"/>
  </svg>
);

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const currentLang = i18n.language?.startsWith('id') ? 'id' : 'en';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/education', label: t('nav.education') },
    { to: '/experience', label: t('nav.experience') },
    { to: '/contact', label: t('nav.contact') },
  ];

  // ── Sliding pill indicator ──
  const itemRefs = useRef([]);
  const listRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });
  const [hovered, setHovered] = useState(null);

  const activeIndex = links.findIndex(l =>
    l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to)
  );

  // Item yang dituju pill: hover jika ada, kalau tidak item aktif.
  const target = hovered ?? (activeIndex >= 0 ? activeIndex : null);

  // Ukur posisi item target dan perbarui pill. Dipanggil dari event
  // (hover/leave) dan dari observer — bukan langsung di body effect.
  const measurePill = (index) => {
    if (index === null || index === undefined) {
      setPill(p => ({ ...p, opacity: 0 }));
      return;
    }
    const el = itemRefs.current[index];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
  };

  // Subscribe ke perubahan ukuran container; observer callback bersifat
  // asynchronous sehingga aman (tidak memicu cascading render sinkron).
  useEffect(() => {
    const node = listRef.current;
    if (!node) return undefined;
    const ro = new ResizeObserver(() => measurePill(target));
    ro.observe(node);
    // Ukur sekali saat subscribe (via microtask agar keluar dari body effect).
    queueMicrotask(() => measurePill(target));
    return () => ro.disconnect();
  }, [target, location.pathname, i18n.language]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="logo-accent">S</span>handy 
          <span className="logo-dot"> SS.</span>
        </NavLink>

        <div
          className={`navbar-links ${menuOpen ? 'open' : ''}`}
          ref={listRef}
          onMouseLeave={() => setHovered(null)}
        >
          <span
            className="nav-pill"
            aria-hidden="true"
            style={{ left: pill.left, width: pill.width, opacity: pill.opacity }}
          />
          {links.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              ref={el => { itemRefs.current[i] = el; }}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={() => setHovered(i)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Language Toggle */}
          <button
            className="lang-btn"
            onClick={() => i18n.changeLanguage(currentLang === 'en' ? 'id' : 'en')}
            aria-label="Toggle language"
            title={currentLang === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
          >
            {currentLang === 'en' ? <FlagID /> : <FlagUS />}
            <span className="lang-code">{currentLang === 'en' ? 'ID' : 'EN'}</span>
          </button>

          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="menu-btn" onClick={() => setMenuOpen(p => !p)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
