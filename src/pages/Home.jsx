import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GitFork, Mail, Globe, Download, ArrowRight,
  Code2, Palette, Database, Braces, Server, Zap,
  PenTool, Cloud, Boxes, Layers, Terminal,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms } from '../lib/cmsApi.js';
import { useCmsSettings } from '../lib/useCmsProfile.js';
import './Home.css';

// ── Hook: deteksi elemen masuk viewport (untuk scroll-reveal) ────────────────
function useInView() {
  const ref = useRef(null);
  // Kalau IntersectionObserver tidak didukung (browser lama), langsung anggap
  // terlihat — tidak ada animasi reveal.
  const supportsIo = typeof IntersectionObserver !== 'undefined';
  const [inView, setInView] = useState(!supportsIo);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return [ref, inView];
}

// Wrapper reveal: elemen muncul halus saat di-scroll ke arahnya.
function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`rv ${inView ? 'rv-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

// ── Hook: efek ketik (typewriter), hormati prefers-reduced-motion ─────────────
function useTypewriter(text, speed = 46, startDelay = 500) {
  const [count, setCount] = useState(0);
  const done = count >= text.length;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setCount(text.length);
      return undefined;
    }
    setCount(0);
    let i = 0;
    let timer;
    const start = setTimeout(function tick() {
      i += 1;
      setCount(i);
      if (i < text.length) timer = setTimeout(tick, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay]);

  return { typed: text.slice(0, count), done };
}

// Fragmen kode semu yang melayang di background hero.
const FLOAT_TOKENS = [
  { text: '</>', left: '4%', top: '22%', dur: 18, delay: -2, size: 17 },
  { text: 'const', left: '88%', top: '30%', dur: 22, delay: -8, size: 14 },
  { text: '=>', left: '12%', top: '62%', dur: 20, delay: -12, size: 20 },
  { text: '{ }', left: '92%', top: '70%', dur: 16, delay: -4, size: 15 },
  { text: 'fn()', left: '72%', top: '14%', dur: 24, delay: -14, size: 14 },
  { text: 'await', left: '6%', top: '40%', dur: 26, delay: -18, size: 13 },
  { text: '<div/>', left: '82%', top: '52%', dur: 19, delay: -6, size: 14 },
  { text: 'import', left: '26%', top: '84%', dur: 21, delay: -10, size: 13 },
  { text: 'dev:', left: '58%', top: '88%', dur: 17, delay: -1, size: 15 },
  { text: '0xFF', left: '46%', top: '10%', dur: 23, delay: -16, size: 13 },
];

export default function Home() {
  const { t } = useTranslation();
  const settings = useCmsSettings();
  const profile = settings.general.profile;
  const homeContent = settings.home.content;
  const [stats, setStats] = useState({ projects: '3+', certs: '3' });

  const nameParts = useMemo(() => profile.name.split(' ').filter(Boolean), [profile.name]);
  const roleText = profile.headline || t('home.role');
  const { typed: typedRole, done: roleDone } = useTypewriter(roleText);

  // Baris marquee tech stack (kiri & kanan saling berlawanan arah).
  const stackRows = [
    {
      dir: 'left',
      items: [
        { label: 'React.js', icon: <Boxes size={15} /> },
        { label: 'JavaScript', icon: <Braces size={15} /> },
        { label: 'Tailwind CSS', icon: <Palette size={15} /> },
        { label: 'Bootstrap', icon: <Layers size={15} /> },
        { label: 'Vite', icon: <Zap size={15} /> },
        { label: 'HTML & CSS', icon: <Code2 size={15} /> },
      ],
    },
    {
      dir: 'right',
      items: [
        { label: 'Laravel', icon: <Server size={15} /> },
        { label: 'Golang', icon: <Code2 size={15} /> },
        { label: 'MySQL', icon: <Database size={15} /> },
        { label: 'PHP', icon: <Braces size={15} /> },
        { label: 'REST API', icon: <Cloud size={15} /> },
        { label: 'Figma', icon: <PenTool size={15} /> },
      ],
    },
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
        {/* Background "AI": grid + orb glow + token kode melayang */}
        <div className="ai-bg" aria-hidden="true">
          <div className="ai-grid" />
          <div className="ai-orb ai-orb--1" />
          <div className="ai-orb ai-orb--2" />
          <div className="ai-orb ai-orb--3" />
          {FLOAT_TOKENS.map((tk, i) => (
            <span
              key={`${tk.text}-${i}`}
              className="ai-float"
              style={{
                left: tk.left,
                top: tk.top,
                fontSize: tk.size,
                animationDuration: `${tk.dur}s`,
                animationDelay: `${tk.delay}s`,
              }}
            >
              {tk.text}
            </span>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-greeting animate-fadeUp">
              <span className="mono greeting-tag">
                <span className="greeting-caret">❯</span> {homeContent.greeting || t('home.greeting')}
              </span>
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
              <span className="role-badge">
                <span className="role-prompt">$</span>
                {typedRole}
                {!roleDone && <span className="type-caret" />}
              </span>
              <span className="role-divider">/</span>
              <span className="role-tag mono">AI-ready</span>
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

            {/* Terminal mini ala IDE */}
            <div className="dev-card" aria-hidden="true">
              <div className="dev-card-head">
                <span className="dev-dot dev-dot--r" />
                <span className="dev-dot dev-dot--y" />
                <span className="dev-dot dev-dot--g" />
                <span className="dev-card-title">
                  <Terminal size={11} /> shandy.config.js
                </span>
              </div>
              <div className="dev-card-body">
                <div className="dev-line" style={{ animationDelay: '0.35s' }}>
                  <span className="tk-k">const</span> <span className="tk-v">profile</span> <span className="tk-p">=</span> <span className="tk-p">{'{'}</span>
                </div>
                <div className="dev-line dev-indent" style={{ animationDelay: '0.55s' }}>
                  role<span className="tk-p">:</span> <span className="tk-s">'{roleText}'</span><span className="tk-p">,</span>
                </div>
                <div className="dev-line dev-indent" style={{ animationDelay: '0.75s' }}>
                  stack<span className="tk-p">:</span> <span className="tk-s">'React · Laravel · Go'</span><span className="tk-p">,</span>
                </div>
                <div className="dev-line dev-indent" style={{ animationDelay: '0.95s' }}>
                  location<span className="tk-p">:</span> <span className="tk-s">'{profile.location || 'Jakarta'}'</span><span className="tk-p">,</span>
                </div>
                <div className="dev-line dev-indent" style={{ animationDelay: '1.15s' }}>
                  hiring<span className="tk-p">:</span> <span className="tk-b">true</span>
                </div>
                <div className="dev-line" style={{ animationDelay: '1.3s' }}>
                  <span className="tk-p">{'};'}</span>
                </div>
                <div className="dev-line dev-caretline" style={{ animationDelay: '1.5s' }}>
                  <span className="tk-caret">▍</span>
                </div>
              </div>
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
        <Reveal as="p" className="section-label">{t('home.skills.label')}</Reveal>
        <Reveal as="h2" className="section-title">{t('home.skills.title')}</Reveal>

        <div className="stack-marquee">
          {stackRows.map((row, ri) => (
            <Reveal key={row.dir} delay={ri * 120}>
              <div className={`stack-row stack-row--${row.dir}`}>
                <div className="stack-track">
                  {[0, 1].map((dup) => (
                    <div className="stack-track-group" key={dup}>
                      {row.items.map((item) => (
                        <span key={`${dup}-${item.label}`} className="stack-pill">
                          {item.icon}
                          {item.label}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-strip">
        <div className="strip-grid">
          <div className="strip-left">
            <Reveal as="p" className="section-label">{homeContent.about_label || t('home.about.label')}</Reveal>
            <Reveal as="h2" delay={80} className="strip-title">
              {(homeContent.about_title || t('home.about.title')).split('\n').map((line, index) => (
                <span key={line}>{line}{index === 0 && <br />}</span>
              ))}
            </Reveal>
            <Reveal as="p" delay={150} className="strip-p">
              {homeContent.about_paragraph_1 || t('home.about.p1')}
            </Reveal>
            <Reveal as="p" delay={220} className="strip-p">
              {homeContent.about_paragraph_2 || t('home.about.p2')}
            </Reveal>
          </div>
          <div className="strip-stats">
            {[
              { num: stats.projects, label: t('home.about.stats.projects') },
              { num: '2+', label: t('home.about.stats.years') },
              { num: '5+', label: t('home.about.stats.stacks') },
              { num: stats.certs, label: t('home.about.stats.certs') },
            ].map((stat, si) => (
              <Reveal key={stat.label} delay={si * 90} className="stat-item">
                <span className="stat-num">{stat.num}</span>
                <span className="stat-label">{stat.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
