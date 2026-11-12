import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Award, Calendar, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms, formatPeriod, getTranslation } from '../lib/cmsApi.js';
import AiBackground from '../components/AiBackground.jsx';
import Reveal from '../components/Reveal.jsx';
import './Education.css';

const SITE_URL = 'https://shandy-shulton-shihab.vercel.app/';
const PROFILE_IMAGE = 'https://www.shandyshultonshihab.my.id/images/PP.jpeg';

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
    color: '#38bdf8', // cyan — sertifikat teknis/umum
  },
  {
    titleKey: 'education.certs.lia.title',
    issuer: 'LB LIA Language Institute',
    date: 'February 2024',
    color: '#eab308', // golden — sertifikat bahasa
  },
  {
    titleKey: 'education.certs.ai.title',
    issuer: 'Dicoding Indonesia',
    date: 'December 2025',
    color: '#a855f7', // purple — sertifikasi khusus
  },
];

// Palet aksen sci-fi: cyan (umum/teknis), golden (bahasa), purple (khusus), emerald (verified).
const certificationColors = ['#38bdf8', '#eab308', '#a855f7', '#10b981'];

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

// ── Certificate Command Deck — kartu holografik + hologram viewer modal ──────

function certTitle(cert, t) {
  return cert.title ?? t(cert.titleKey, { defaultValue: cert.titleKey });
}

function CertCard({ cert, t, index, onOpen }) {
  const title = certTitle(cert, t);
  const hasImage = Boolean(cert.badgeUrl);
  // Rotasi kecil bergantian → terasa seperti kartu yang digantung di tali.
  const rot = index % 2 === 0 ? -1.8 : 1.5;

  return (
    <button
      type="button"
      className="cert-hang"
      style={{ '--cert-accent': cert.color, '--rot': `${rot}deg`, '--i': index }}
      onClick={onOpen}
      aria-label={title}
    >
      <span className="cert-peg" aria-hidden="true" />
      <span className="cert-card">
        <span className="cert-crest" aria-hidden="true">
          <Award size={26} />
        </span>

        <span className="cert-tag mono">{cert.issuer}</span>
        <span className="cert-title">{title}</span>
        <span className="cert-date mono"><Calendar size={12} /> {cert.date}</span>

        {/* Preview: gambar badge, atau layar holografik bila belum diunggah */}
        <span className="cert-preview">
          {hasImage ? (
            <img src={cert.badgeUrl} alt={title} loading="lazy" decoding="async" />
          ) : (
            <span className="cert-holo">
              <Award size={44} />
              <span className="cert-holo-grid" />
            </span>
          )}
        </span>

        <span className="cert-open mono">
          <ExternalLink size={13} /> VIEW CREDENTIAL
        </span>
      </span>
    </button>
  );
}

function CertViewer({ cert, t, onClose }) {
  const title = certTitle(cert, t);

  return (
    <div
      className="cert-modal"
      style={{ '--cert-accent': cert.color }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="cert-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cert-modal-close" onClick={onClose} aria-label={t('chat.close')}>
          <X size={18} />
        </button>

        <span className="cert-modal-crest"><Award size={28} /></span>
        <p className="cert-modal-issuer mono">ISSUED BY {cert.issuer}</p>
        <h3 className="cert-modal-title">{title}</h3>
        {cert.description && <p className="cert-modal-desc">{cert.description}</p>}

        <dl className="cert-modal-meta">
          <div>
            <dt className="mono">ISSUED</dt>
            <dd>{cert.date}</dd>
          </div>
          {cert.credentialId && (
            <div>
              <dt className="mono">CREDENTIAL ID</dt>
              <dd className="mono">{cert.credentialId}</dd>
            </div>
          )}
        </dl>

        <div className="cert-modal-media">
          {cert.badgeUrl ? (
            <img src={cert.badgeUrl} alt={title} />
          ) : (
            <div className="cert-holo">
              <Award size={64} />
              <span className="cert-holo-grid" />
            </div>
          )}
        </div>

        <div className="cert-modal-actions">
          {cert.credentialUrl && (
            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-btn cert-btn--verify">
              <ExternalLink size={13} /> {t('education.verifyCert')}
            </a>
          )}
          {cert.badgeUrl && (
            <a href={cert.badgeUrl} target="_blank" rel="noopener noreferrer" className="cert-btn">
              VIEW HIGH-RES CERTIFICATE
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CertDeck({ items, t }) {
  const [openIndex, setOpenIndex] = useState(null);
  const trackRef = useRef(null);
  const active = openIndex === null ? null : items[openIndex];

  // Modal: ESC tutup + kunci scroll latar
  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpenIndex(null); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  // Geser tali jemuran (scroll halus).
  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(260, el.clientWidth * 0.6), behavior: 'smooth' });
  };

  return (
    <>
      <div className="clothesline">
        <span className="clothesline-rope" aria-hidden="true" />

        <div className="clothesline-track" ref={trackRef}>
          {items.map((c, i) => (
            <CertCard
              key={c.id ?? c.titleKey ?? i}
              cert={c}
              t={t}
              index={i}
              onOpen={() => setOpenIndex(i)}
            />
          ))}
        </div>

        {items.length > 1 && (
          <div className="clothesline-nav">
            <button type="button" className="cert-nav-btn" onClick={() => nudge(-1)} aria-label={t('education.prevCert')}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="cert-nav-btn" onClick={() => nudge(1)} aria-label={t('education.nextCert')}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Portal ke <body> → modal selalu center di viewport, tidak terpengaruh
          transform/animasi ancestor (section punya scroll-timeline transform). */}
      {active && createPortal(
        <CertViewer cert={active} t={t} onClose={() => setOpenIndex(null)} />,
        document.body,
      )}
    </>
  );
}

export default function Education() {
  const { t, i18n } = useTranslation();
  const [cmsEducation, setCmsEducation] = useState([]);
  const [cmsCertifications, setCmsCertifications] = useState([]);

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
        <link rel="canonical" href={`${SITE_URL}education`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}education`} />
        <meta property="og:title" content="Education | Shandy Shulton Shihab" />
        <meta property="og:description" content="Academic background and certifications profile." />
        <meta property="og:image" content={PROFILE_IMAGE} />
        <meta name="twitter:title" content="Education | Shandy Shulton Shihab" />
        <meta name="twitter:description" content="Academic background and certifications profile." />
        <meta name="twitter:image" content={PROFILE_IMAGE} />
      </Helmet>
      <Reveal as="p" className="section-label">{t('education.sectionLabel')}</Reveal>
      <Reveal as="h1" delay={80} className="section-title">{t('education.title')}</Reveal>

      <Reveal delay={120} className="orb-timeline">
        {education.map((e, i) => {
          const desc = e.desc ?? t(e.descKey, { defaultValue: '' });
          const highlights = e.highlights ?? t(e.highlightsKey, { returnObjects: true, defaultValue: [] });
          // Hierarki visual: universitas (aktif) = cyan, jenjang sebelumnya = purple.
          const accent = i === 0 ? '#38bdf8' : '#a855f7';
          return (
            <div
              key={e.id ?? e.degree}
              className="orb-row"
              style={{ '--orb-accent': accent }}
            >
              <span className="orb-node" aria-hidden="true">
                <GraduationCap size={22} />
              </span>

              <article className="orb-card">
                <header className="orb-card-head">
                  <span className="orb-type mono">{e.type}</span>
                  <span className="orb-date mono"><Calendar size={13} /> {e.period}</span>
                </header>
                <h2 className="orb-degree">{e.degree}</h2>
                <p className="orb-institution">{e.institution}</p>
                <p className="orb-desc">{desc}</p>
                <ul className="orb-highlights">
                  {(Array.isArray(highlights) ? highlights : []).map((h) => (
                    <li key={h} className="orb-chip">
                      <span className="orb-chip-dot" aria-hidden="true" /> {h}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          );
        })}
      </Reveal>

      {/* Certifications — Space Hologram Badge Grid */}
      <Reveal className="cert-section" delay={100} style={{ marginTop: 56 }}>
        <p className="section-label" style={{ marginTop: 0 }}>{t('education.certLabel')}</p>

        <div className="cert-head">
          <h2 className="cert-title-lg">{t('education.certTitle')}</h2>
          <span className="cert-verified mono">
            <span className="cert-verified-dot" /> VERIFIED CREDENTIALS · {String(certifications.length).padStart(2, '0')}
          </span>
        </div>

        <p className="cert-deck-tag mono">SPACE ACADEMY · CERTIFICATION LOG</p>

        <CertDeck items={certifications} t={t} />
      </Reveal>
    </div>
  );
}
