import { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, Award, Calendar, ChevronLeft, ChevronRight, X, ExternalLink, Play, Pause } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms, formatPeriod, getTranslation } from '../lib/cmsApi.js';
import AiBackground from '../components/AiBackground.jsx';
import Reveal from '../components/Reveal.jsx';
import './Education.css';

const fallbackEducation = [
  {
    degree: 'Computer Science — Database Technology',
    institution: 'Bina Nusantara University (BINUS)',
    period: 'Aug 2023 – Aug 2027 (Expected)',
    type: 'University',
    descKey: 'education.items.binus.desc',
    highlightsKey: 'education.items.binus.highlights',
  },
  {
    degree: 'Software Engineering',
    institution: 'SMK Telkom Jakarta',
    period: 'Jul 2020 – Jun 2023',
    type: 'Vocational High School',
    descKey: 'education.items.smk.desc',
    highlightsKey: 'education.items.smk.highlights',
  },
];

const fallbackCertifications = [
  {
    titleKey: 'education.certs.bnsp.title',
    issuer: 'Telkom DigiUp',
    date: 'December 2022',
    color: '#c8522a',
  },
  {
    titleKey: 'education.certs.lia.title',
    issuer: 'LB LIA Language Institute',
    date: 'February 2024',
    color: '#2a7cc8',
  },
  {
    titleKey: 'education.certs.ai.title',
    issuer: 'Dicoding Indonesia',
    date: 'December 2025',
    color: '#8b2ac8',
  },
];

const certificationColors = ['#c8522a', '#2a7cc8', '#8b2ac8', '#2ac87a'];

function normalizeCmsEducation(education, locale) {
  const translation = getTranslation(education, locale);

  return {
    id: education.id,
    degree: education.degree,
    institution: education.institution_name,
    period: formatPeriod(education.start_date, education.end_date, false, locale),
    type: education.field_of_study ?? 'Education',
    desc: translation.description ?? '',
    highlights: translation.highlights ?? [],
  };
}

function normalizeCmsCertification(certification, locale, index) {
  const translation = getTranslation(certification, locale);
  return {
    id: certification.id,
    title: certification.name,
    issuer: certification.issuer,
    date: formatPeriod(certification.issued_at, null, false, locale),
    color: certificationColors[index % certificationColors.length],
    badgeUrl: certification.badge_url ?? '',
    credentialUrl: certification.credential_url ?? '',
    credentialId: certification.credential_id ?? '',
    description: translation.description ?? '',
  };
}

// ── Coverflow slider sertifikat (nuansa terminal/developer) ───────────────────
// Slide aktif besar di tengah, tetangga mengecil/miring ke belakang.
// Autoplay jalan sampai user berinteraksi (hover/geser/klik).

function CertSlider({ items, t, prefersReduced }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [playing, setPlaying] = useState(!prefersReduced);
  const timerRef = useRef(null);
  const touchX = useRef(null);
  const total = items.length;

  const goTo = (i) => setIndex(((i % total) + total) % total);
  const next = () => { setPlaying(false); goTo(index + 1); };
  const prev = () => { setPlaying(false); goTo(index - 1); };

  // Autoplay — jeda permanen saat user berinteraksi; hormati reduced-motion.
  useEffect(() => {
    if (!playing || lightbox || total <= 1) return undefined;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % total);
    }, 4200);
    return () => clearTimeout(timerRef.current);
  }, [playing, lightbox, index, total]);

  // Keyboard: panah kiri/kanan saat slider terlihat.
  useEffect(() => {
    const onKey = (e) => {
      if (lightbox && e.key === 'Escape') { setLightbox(false); return; }
      if (lightbox) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, lightbox, total]);

  const active = items[index];
  const title = active?.title ?? active?.titleKey;

  return (
    <div className="cert-slider">
      {/* Bar terminal */}
      <div className="cert-slider-term">
        <span className="term-dot term-dot--r" />
        <span className="term-dot term-dot--y" />
        <span className="term-dot term-dot--g" />
        <span className="term-title">certs --show {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
        <button
          type="button"
          className="term-play"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? t('education.pauseSlider') : t('education.playSlider')}
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>

      {/* Stage coverflow — semua slide berpusat; offset diatur CSS via --i */}
      <div
        className="cert-stage"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) { setPlaying(false); goTo(index + (dx < 0 ? 1 : -1)); }
        }}
      >
        {items.map((c, i) => {
          const offset = i - index;
          const isActive = i === index;
          const cTitle = c.title ?? t(c.titleKey, { defaultValue: c.titleKey });
          const hasImage = Boolean(c.badgeUrl);
          return (
            <button
              key={c.id ?? c.titleKey ?? i}
              type="button"
              className={`cert-slide ${isActive ? 'is-active' : ''}`}
              style={{
                '--cert-accent': c.color,
                transform: `translateY(-50%) translateX(${offset * 210}px) translateZ(${offset * -150}px) rotateY(${offset * -26}deg) scale(${isActive ? 1 : 0.82})`,
                opacity: isActive ? 1 : 0.55,
                zIndex: isActive ? 5 : 5 - Math.min(Math.abs(offset), 3),
                pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
              }}
              data-offset={offset}
              onClick={() => { setPlaying(false); if (isActive) setLightbox(true); else goTo(i); }}
              aria-label={`${cTitle} — ${isActive ? t('education.openCert') : t('education.goToCert')}`}
            >
              <span className="cert-slide-media">
                {hasImage ? (
                  <img
                    src={c.badgeUrl}
                    alt={cTitle}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span className="cert-slide-fallback" style={{ background: c.color + '18', color: c.color }}>
                    <Award size={30} />
                  </span>
                )}
              </span>
              <span className="cert-slide-cap">
                <span className="cert-slide-title">{cTitle}</span>
                <span className="cert-slide-issuer">{c.issuer}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Nav */}
      {total > 1 && (
        <div className="cert-slider-ui">
          <button type="button" className="cert-nav" onClick={prev} aria-label={t('education.prevCert')}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="cert-nav" onClick={next} aria-label={t('education.nextCert')}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Keterangan slide aktif di bawah */}
      <p className="cert-hint mono">
        <span className="cert-hint-caret">❯</span> {t('education.sliderHint')}
      </p>

      {/* Lightbox detail */}
      {lightbox && active && (
        <div className="cert-lightbox" onClick={() => setLightbox(false)} role="dialog" aria-modal="true">
          <div className="cert-lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cert-lightbox-close" onClick={() => setLightbox(false)} aria-label={t('chat.close')}>
              <X size={20} />
            </button>
            <div className="cert-lightbox-media">
              {active.badgeUrl ? (
                <img src={active.badgeUrl} alt={title} />
              ) : (
                <div className="cert-lightbox-fallback" style={{ background: active.color + '18', color: active.color }}>
                  <Award size={64} />
                </div>
              )}
            </div>
            <div className="cert-lightbox-body">
              <span className="cert-lightbox-issuer mono">{active.issuer}</span>
              <h3 className="cert-lightbox-title">{title}</h3>
              {active.description && <p className="cert-lightbox-desc">{active.description}</p>}
              <div className="cert-lightbox-meta">
                <span className="cert-date mono"><Calendar size={12} /> {active.date}</span>
                {active.credentialUrl && (
                  <a href={active.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-verify">
                    <ExternalLink size={12} /> {t('education.verifyCert')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Education() {
  const { t, i18n } = useTranslation();
  const [cmsEducation, setCmsEducation] = useState([]);
  const [cmsCertifications, setCmsCertifications] = useState([]);
  const [prefersReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,
  );

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchCms('/public/educations'),
      fetchCms('/public/certifications'),
    ]).then(([educations, certifications]) => {
      if (!active) return;

      setCmsEducation(educations.status === 'fulfilled' && Array.isArray(educations.value) ? educations.value : []);
      setCmsCertifications(certifications.status === 'fulfilled' && Array.isArray(certifications.value) ? certifications.value : []);
    });

    return () => {
      active = false;
    };
  }, []);

  const education = useMemo(() => {
    if (cmsEducation.length === 0) return fallbackEducation;
    return cmsEducation.map((item) => normalizeCmsEducation(item, i18n.language));
  }, [cmsEducation, i18n.language]);

  const certifications = useMemo(() => {
    if (cmsCertifications.length === 0) return fallbackCertifications;
    return cmsCertifications.map((item, index) => normalizeCmsCertification(item, i18n.language, index));
  }, [cmsCertifications, i18n.language]);

  return (
    <div className="page edu-page">
      <AiBackground muted />
      <Helmet>
        <title>Education | Shandy Shulton Shihab</title>
        <meta name="description" content="Academic profile of Shandy Shulton Shihab." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Education | Shandy Shulton Shihab" />
        <meta property="og:description" content="Academic background and certifications profile." />
        <meta property="og:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
        <meta name="twitter:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
      </Helmet>
      <Reveal as="p" className="section-label">{t('education.sectionLabel')}</Reveal>
      <Reveal as="h1" delay={80} className="section-title">{t('education.title')}</Reveal>

      <div className="edu-list">
        {education.map((e, i) => {
          const desc = e.desc ?? t(e.descKey, { defaultValue: '' });
          const highlights = e.highlights ?? t(e.highlightsKey, { returnObjects: true, defaultValue: [] });
          return (
            <Reveal key={e.id ?? e.degree} delay={i * 90} className="edu-card">
              <div className="edu-timeline">
                <div className="edu-icon-wrap">
                  <GraduationCap size={22} />
                </div>
                <div className="edu-line" />
              </div>
              <div className="edu-content">
                <span className="edu-type-badge">{e.type}</span>
                <h2 className="edu-degree">{e.degree}</h2>
                <p className="edu-institution">{e.institution}</p>
                <div className="edu-period">
                  <Calendar size={13} />
                  {e.period}
                </div>
                <p className="edu-desc">{desc}</p>
                <ul className="edu-highlights">
                  {(Array.isArray(highlights) ? highlights : []).map(h => (
                    <li key={h}><span className="hl-dot" /> {h}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Certifications */}
      <Reveal className="cert-section" delay={100}>
        <p className="section-label" style={{ marginTop: 0 }}>{t('education.certLabel')}</p>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.8rem', marginBottom: 32 }}>{t('education.certTitle')}</h2>
        <CertSlider items={certifications} t={t} prefersReduced={prefersReduced} />
      </Reveal>
    </div>
  );
}
