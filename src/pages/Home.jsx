import { useEffect, useMemo, useState } from 'react';
import { GitFork, Mail, Globe, Download, ArrowRight, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms } from '../lib/cmsApi.js';
import { useCmsSettings } from '../lib/useCmsProfile.js';
import TiltCard from '../components/TiltCard.jsx';
import { STACK_GROUPS } from '../three/stack.js';
import { setUi, useSceneUi } from '../three/store.js';
import './Home.css';

// ── Hook: efek ketik (typewriter), hormati prefers-reduced-motion ─────────────
function useTypewriter(text, speed = 82, startDelay = 1100) {
  const [count, setCount] = useState(0);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  useEffect(() => {
    if (prefersReduced) return undefined;

    let current = 0;
    let currentPhase = 'typing';
    let timerId;

    const tick = () => {
      if (currentPhase === 'typing') {
        current += 1;
        setCount(current);

        if (current >= text.length) {
          currentPhase = 'holding';
          timerId = setTimeout(tick, 2200);
          return;
        }

        timerId = setTimeout(tick, speed);
        return;
      }

      if (currentPhase === 'holding') {
        currentPhase = 'deleting';
        timerId = setTimeout(tick, speed);
        return;
      }

      current -= 1;
      setCount(current);

      if (current <= 0) {
        currentPhase = 'typing';
        timerId = setTimeout(tick, 850);
        return;
      }

      timerId = setTimeout(tick, speed * 0.75);
    };

    timerId = setTimeout(tick, startDelay);
    return () => clearTimeout(timerId);
  }, [text, speed, startDelay, prefersReduced]);

  return { typed: prefersReduced ? text : text.slice(0, count), done: prefersReduced };
}

const SITE_URL = 'https://shandy-shulton-shihab.vercel.app/';
const SEO_TITLE = 'Shandy Shulton Shihab | Full Stack Developer Portfolio';
const SEO_DESCRIPTION = 'Portfolio Shandy Shulton Shihab, Full Stack Developer berpengalaman menggunakan React.js, Laravel, dan MySQL untuk membangun aplikasi web.';
const PROFILE_IMAGE = 'https://www.shandyshultonshihab.my.id/images/PP.jpeg';

/** Nama besar: tiap huruf naik satu per satu (satu-satunya animasi masuk di halaman). */
function SplitName({ parts }) {
  const offsets = parts.reduce((acc, part, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + [...parts[i - 1]].length);
    return acc;
  }, []);

  return parts.map((part, pi) => (
    <span className="name-line" key={`${part}-${pi}`} aria-hidden="true">
      {[...part].map((ch, ci) => (
        <span className="name-ch" style={{ '--i': offsets[pi] + ci }} key={ci}>
          {ch}
        </span>
      ))}
    </span>
  ));
}

function StackChip({ item }) {
  const active = useSceneUi((s) => s.hovered === item.id);
  return (
    <li
      className={`stack-chip ${active ? 'is-active' : ''}`}
      style={{ '--chip': item.color }}
      onPointerEnter={() => setUi({ hovered: item.id })}
      onPointerLeave={() => setUi({ hovered: null })}
    >
      <span className="stack-chip-dot" aria-hidden="true" />
      {item.label}
    </li>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const settings = useCmsSettings();
  const profile = settings.general.profile;
  const homeContent = settings.home.content;
  const [stats, setStats] = useState({ projects: '3+', certs: '3' });

  const nameParts = useMemo(() => profile.name.split(' ').filter(Boolean), [profile.name]);
  const roleText = profile.headline || t('home.role');
  const { typed: typedRole, done: roleDone } = useTypewriter(roleText);

  // Bersihkan highlight node saat meninggalkan halaman.
  useEffect(() => () => setUi({ hovered: null }), []);

  useEffect(() => {
    let active = true;
    let idleId;

    // Statistik "About" berada di bawah fold dan sudah punya nilai default,
    // jadi fetch-nya ditunda sampai browser idle agar tidak menghalangi
    // pemuatan hero (LCP).
    const loadStats = () => {
      fetchCms('/public/stats')
        .then((data) => {
          if (!active || !data) return;
          setStats({
            projects: typeof data.projects === 'number' ? `${data.projects}+` : '3+',
            certs: typeof data.certifications === 'number' ? String(data.certifications) : '3',
          });
        })
        .catch(() => { /* biarkan nilai default */ });
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(loadStats, { timeout: 4000 });
    } else {
      idleId = window.setTimeout(loadStats, 1500);
    }

    return () => {
      active = false;
      if ('cancelIdleCallback' in window && idleId) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  const groupLabels = {
    frontend: t('home.skills.frontend'),
    backend: t('home.skills.backend'),
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:image" content={PROFILE_IMAGE} />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <meta name="twitter:image" content={PROFILE_IMAGE} />
      </Helmet>

      {/* ── Hero: teks di kiri, scene 3D di kanan (canvas global di belakang) ── */}
      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="hero-greeting mono">
            <span className="greeting-caret">❯</span> {homeContent.greeting || t('home.greeting')}
          </p>

          <h1 className="hero-name" aria-label={profile.name}>
            <SplitName parts={nameParts} />
          </h1>

          <p className="hero-role mono">
            <span className="role-prompt">$</span> {typedRole}
            {!roleDone && <span className="type-caret" aria-hidden="true" />}
          </p>

          {profile.summary ? (
            <p className="hero-bio">{profile.summary}</p>
          ) : (
            <p className="hero-bio" dangerouslySetInnerHTML={{ __html: t('home.bio') }} />
          )}

          <div className="hero-actions">
            <a href="/CV_Shandy.pdf" download className="btn btn-primary">
              <Download size={16} />
              {t('home.downloadCV')}
            </a>
            <a href="/contact" className="btn btn-outline">
              {t('home.getInTouch')} <ArrowRight size={16} />
            </a>
          </div>

          <div className="hero-foot">
            <div className="hero-socials">
              <a href={profile.github} target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
                <GitFork size={19} />
              </a>
              <a href={`mailto:${profile.email}`} className="social-link" aria-label="Email">
                <Mail size={19} />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="social-link" aria-label="LinkedIn">
                <Globe size={19} />
              </a>
            </div>
            <span className="hero-status">
              <span className="status-dot" aria-hidden="true" />
              {homeContent.available_text || t('home.available')}
            </span>
          </div>
        </div>

        <a href="#skills" className="scroll-indicator" aria-label={t('home.scroll')}>
          <span className="scroll-line" aria-hidden="true" />
          <span className="mono">{t('home.scroll')}</span>
        </a>
      </section>

      {/* ── Skills: chip di kiri tersambung ke node 3D di kanan ── */}
      <section className="skills" id="skills">
        <div className="skills-panel glass">
          <h2 className="skills-title">{t('home.skills.title')}</h2>
          <p className="skills-hint">{t('home.skills.hint')}</p>

          {STACK_GROUPS.map((group) => (
            <div className="skills-group" key={group.id}>
              <h3 className="skills-group-title">{groupLabels[group.id]}</h3>
              <ul className="skills-list">
                {group.items.map((item) => (
                  <StackChip item={item} key={item.id} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="about" id="about">
        <div className="about-grid">
          <div className="about-copy">
            <h2 className="about-title">
              {(homeContent.about_title || t('home.about.title')).split('\n').map((line, index) => (
                <span key={line} className="about-title-line">
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
            </h2>
            <p className="about-p">{homeContent.about_paragraph_1 || t('home.about.p1')}</p>
            <p className="about-p">{homeContent.about_paragraph_2 || t('home.about.p2')}</p>

            <dl className="about-stats">
              {[
                { num: stats.projects, label: t('home.about.stats.projects') },
                { num: '2+', label: t('home.about.stats.years') },
                { num: '5+', label: t('home.about.stats.stacks') },
                { num: stats.certs, label: t('home.about.stats.certs') },
              ].map((stat) => (
                <div className="about-stat" key={stat.label}>
                  <dt className="about-stat-label">{stat.label}</dt>
                  <dd className="about-stat-num">{stat.num}</dd>
                </div>
              ))}
            </dl>
          </div>

          <TiltCard className="about-card" max={10}>
            <div className="about-photo glass">
              <picture>
                <source srcSet="/images/PP.webp" type="image/webp" />
                <img
                  src="/images/PP-480.jpeg"
                  alt={profile.name}
                  className="about-img"
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={640}
                />
              </picture>
              <span className="about-chip about-chip--top">
                <MapPin size={12} /> {profile.location || 'Jakarta, Indonesia'}
              </span>
              <span className="about-chip about-chip--bottom">
                <span className="status-dot" aria-hidden="true" />
                {homeContent.available_text || t('home.available')}
              </span>
            </div>
          </TiltCard>
        </div>
      </section>
    </div>
  );
}
