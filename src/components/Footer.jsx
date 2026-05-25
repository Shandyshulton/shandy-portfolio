import { GitFork, Mail, Globe, Heart } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            <span style={{ color: 'var(--accent)' }}>S</span>handy<span style={{ color: 'var(--accent)' }}> SS.</span>
          </span>
          <p className="footer-tagline">Building the web, one component at a time.</p>
        </div>

        <div className="footer-links">
          <a href="https://github.com/Shandyshulton" target="_blank" rel="noreferrer" className="footer-social">
            <GitFork size={18} />
          </a>
          <a href="mailto:ssshandy60@gmail.com" className="footer-social">
            <Mail size={18} />
          </a>
          <a href="https://www.linkedin.com/in/shandy-shulton-shihab-73a25922a/" target="_blank" rel="noreferrer" className="footer-social">
            <Globe size={18} />
          </a>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} Shandy Shulton Shihab · Made with <Heart size={12} color="var(--accent)" fill="var(--accent)" style={{ display: 'inline', verticalAlign: 'middle' }} />
        </p>
      </div>
    </footer>
  );
}
