import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="logo-accent">S</span>handy 
          <span className="logo-dot"> SS.</span>
        </NavLink>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
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
