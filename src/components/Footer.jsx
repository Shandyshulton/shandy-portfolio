import { GitFork, Mail, Globe, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCmsProfile } from '../lib/useCmsProfile.js';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const profile = useCmsProfile();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            <span style={{ color: 'var(--accent)' }}>S</span>handy<span style={{ color: 'var(--accent)' }}> SS.</span>
          </span>
          <p className="footer-tagline">{t('footer.tagline')}</p>
        </div>

        <div className="footer-links">
          <a href={profile.github} target="_blank" rel="noreferrer" className="footer-social" aria-label="GitHub">
            <GitFork size={18} />
          </a>
          <a href={`mailto:${profile.email}`} className="footer-social" aria-label="Email">
            <Mail size={18} />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="footer-social" aria-label="LinkedIn">
            <Globe size={18} />
          </a>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} {profile.name} · Made with <Heart size={12} color="var(--accent)" fill="var(--accent)" style={{ display: 'inline', verticalAlign: 'middle' }} />
        </p>
      </div>
    </footer>
  );
}
