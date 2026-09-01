import { useEffect, useMemo, useState } from 'react';
import { GitFork, Mail, Globe, Download, ArrowRight, Code2, Palette, Database } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms } from '../lib/cmsApi.js';
import { useCmsSettings } from '../lib/useCmsProfile.js';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();
  const settings = useCmsSettings();
  const profile = settings.general.profile;
  const homeContent = settings.home.content;
  const [stats, setStats] = useState({ projects: '3+', certs: '3' });

  const nameParts = useMemo(() => profile.name.split(' ').filter(Boolean), [profile.name]);

  const skills = [
    { icon: <Code2 size={18} />, label: 'Front-End', items: ['React.js', 'JavaScript', 'Tailwind CSS', 'Bootstrap'] },
    { icon: <Database size={18} />, label: 'Back-End', items: ['Laravel', 'MySQL', 'PHP', 'Golang'] },
    { icon: <Palette size={18} />, label: 'Design & Tools', items: ['Figma', 'Laragon', 'Jira', 'Git', 'Gitlab'] },
  ];

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchCms('/public/projects'),
      fetchCms('/public/certifications'),
    ]).then(([projects, certifications]) => {
      if (!active) return;

      setStats({
        projects: projects.status === 'fulfilled' && Array.isArray(projects.value) ? `${projects.value.length}+` : '3+',
        certs: certifications.status === 'fulfilled' && Array.isArray(certifications.value) ? String(certifications.value.length) : '3',
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home-page">
      <Helmet>
        <title>{profile.name} | {profile.headline} Portfolio</title>
        <meta name="description" content={profile.summary || 'Computer Science undergraduate with hands-on experience in responsive web applications.'} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${profile.name} | ${profile.headline}`} />
        <meta property="og:description" content={profile.summary || 'Computer Science student specializing in full-stack web development.'} />
        <meta property="og:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
        <meta name="twitter:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
      </Helmet>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-greeting animate-fadeUp">
              <span className="mono greeting-tag">{homeContent.greeting || t('home.greeting')}</span>
            </p>
            <h1 className="hero-name animate-fadeUp delay-1">
              {nameParts.map((part, index) => (
                <span key={`${part}-${index}`}>
                  {index === 1 ? <span className="name-accent">{part}</span> : part}
                  {index < nameParts.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <div className="hero-role animate-fadeUp delay-2">
              <span className="role-badge">{profile.headline || t('home.role')}</span>
              <span className="role-divider">/</span>
            </div>
            {profile.summary ? (
              <p className="hero-bio animate-fadeUp delay-3">{profile.summary}</p>
            ) : (
              <p
                className="hero-bio animate-fadeUp delay-3"
                dangerouslySetInnerHTML={{ __html: t('home.bio') }}
              />
            )}

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
              <a href={profile.github} target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
                <GitFork size={20} />
              </a>
              <a href={`mailto:${profile.email}`} className="social-link" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
                <Globe size={20} />
              </a>
            </div>
          </div>

          <div className="hero-photo-wrap animate-fadeIn delay-2">
            <div className="hero-photo-frame">
              <img
                src="/images/PP.jpeg"
                alt={profile.name}
                className="hero-photo"
                fetchpriority="high"
                decoding="async"
                width={1200}
                height={630}
              />
              <div className="photo-deco deco-1"></div>
              <div className="photo-deco deco-2"></div>
            </div>
            <div className="photo-status">
              <span className="status-dot"></span>
              {homeContent.available_text || t('home.available')}
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="mono" style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            {t('home.scroll')}
          </span>
        </div>
      </section>

      <section className="skills-section">
        <p className="section-label">{t('home.skills.label')}</p>
        <h2 className="section-title">{t('home.skills.title')}</h2>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div key={skill.label} className="skill-card animate-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="skill-card-header">
                <span className="skill-icon">{skill.icon}</span>
                <h3 className="skill-label">{skill.label}</h3>
              </div>
              <div className="skill-tags">
                {skill.items.map((item) => (
                  <span key={item} className="tag">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-strip">
        <div className="strip-grid">
          <div className="strip-left">
            <p className="section-label">{homeContent.about_label || t('home.about.label')}</p>
            <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.6rem,4vw,2.4rem)', lineHeight: 1.2, marginBottom: 20 }}>
              {(homeContent.about_title || t('home.about.title')).split('\n').map((line, index) => (
                <span key={line}>{line}{index === 0 && <br />}</span>
              ))}
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16 }}>
              {homeContent.about_paragraph_1 || t('home.about.p1')}
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {homeContent.about_paragraph_2 || t('home.about.p2')}
            </p>
          </div>
          <div className="strip-stats">
            {[
              { num: stats.projects, label: t('home.about.stats.projects') },
              { num: '2+', label: t('home.about.stats.years') },
              { num: '5+', label: t('home.about.stats.stacks') },
              { num: stats.certs, label: t('home.about.stats.certs') },
            ].map((stat) => (
              <div key={stat.label} className="stat-item">
                <span className="stat-num">{stat.num}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
