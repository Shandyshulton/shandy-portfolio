import { GitFork, Mail, Globe, Download, ArrowRight, Code2, Palette, Database } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();

  const skills = [
    { icon: <Code2 size={18} />, label: 'Front-End', items: ['React.js', 'JavaScript', 'Tailwind CSS', 'Bootstrap'] },
    { icon: <Database size={18} />, label: 'Back-End', items: ['Laravel', 'MySQL', 'PHP', 'Golang'] },
    { icon: <Palette size={18} />, label: 'Design & Tools', items: ['Figma', 'Laragon', 'Jira', 'Git', 'Gitlab'] },
  ];

  return (
    <div className="home-page">
      <Helmet>
        <title>Shandy Shulton Shihab | Full Stack Developer Portfolio</title>
        <meta name="description" content="Computer Science undergraduate at Binus University with hands-on experience in building responsive, high-performance web applications." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shandy Shulton Shihab | Full Stack Developer" />
        <meta property="og:description" content="Computer Science student at Binus University specializing in full-stack web development." />
        <meta property="og:image" content="/images/PP.jpeg" />
      </Helmet>
      
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-greeting animate-fadeUp">
              <span className="mono greeting-tag">{t('home.greeting')}</span>
            </p>
            <h1 className="hero-name animate-fadeUp delay-1">
              Shandy<br />
              <span className="name-accent">Shulton</span><br />
              Shihab
            </h1>
            <div className="hero-role animate-fadeUp delay-2">
              <span className="role-badge">{t('home.role')}</span>
              <span className="role-divider">·</span>
            </div>
            <p
              className="hero-bio animate-fadeUp delay-3"
              dangerouslySetInnerHTML={{ __html: t('home.bio') }}
            />

            <div className="hero-actions animate-fadeUp delay-4">
              <a href="/CV_Shandy.pdf" download className="btn btn-primary">
                <Download size={16} />
                {t('home.downloadCV')}
              </a>
              <a href="/contact" className="btn btn-outline">
                {t('home.getInTouch')} <ArrowRight size={16} />
              </a>
            </div>

            <div className="hero-socials animate-fadeUp delay-5">
              <a href="https://github.com/Shandyshulton" target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
                <GitFork size={20} />
              </a>
              <a href="mailto:ssshandy60@gmail.com" className="social-link" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="https://www.linkedin.com/in/shandy-shulton-shihab-73a25922a/" target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
                <Globe size={20} />
              </a>
            </div>
          </div>

          <div className="hero-photo-wrap animate-fadeIn delay-2">
            <div className="hero-photo-frame">
              <img 
                src="/images/PP.jpeg" 
                alt="Shandy Shulton Shihab" 
                className="hero-photo" 
              />
              <div className="photo-deco deco-1"></div>
              <div className="photo-deco deco-2"></div>
            </div>
            <div className="photo-status">
              <span className="status-dot"></span>
              {t('home.available')}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="mono" style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            {t('home.scroll')}
          </span>
        </div>
      </section>

      {/* Skills */}
      <section className="skills-section">
        <p className="section-label">{t('home.skills.label')}</p>
        <h2 className="section-title">{t('home.skills.title')}</h2>
        <div className="skills-grid">
          {skills.map((s, i) => (
            <div key={s.label} className="skill-card animate-fadeUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="skill-card-header">
                <span className="skill-icon">{s.icon}</span>
                <h3 className="skill-label">{s.label}</h3>
              </div>
              <div className="skill-tags">
                {s.items.map(item => (
                  <span key={item} className="tag">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About strip */}
      <section className="about-strip">
        <div className="strip-grid">
          <div className="strip-left">
            <p className="section-label">{t('home.about.label')}</p>
            <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.6rem,4vw,2.4rem)', lineHeight: 1.2, marginBottom: 20 }}>
              {t('home.about.title').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16 }}>
              {t('home.about.p1')}
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {t('home.about.p2')}
            </p>
          </div>
          <div className="strip-stats">
            {[
              { num: '3+', label: t('home.about.stats.projects') },
              { num: '2+', label: t('home.about.stats.years') },
              { num: '5+', label: t('home.about.stats.stacks') },
              { num: '3',  label: t('home.about.stats.certs') },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
