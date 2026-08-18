import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Award, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms, formatPeriod, getTranslation } from '../lib/cmsApi.js';
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
  return {
    id: certification.id,
    title: certification.name,
    issuer: certification.issuer,
    date: formatPeriod(certification.issued_at, null, false, locale),
    color: certificationColors[index % certificationColors.length],
  };
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
      <Helmet>
        <title>Education | Shandy Shulton Shihab</title>
        <meta name="description" content="Academic profile of Shandy Shulton Shihab." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Education | Shandy Shulton Shihab" />
        <meta property="og:description" content="Academic background and certifications profile." />
        <meta property="og:image" content="/images/PP.jpeg" />
      </Helmet>
      <p className="section-label">{t('education.sectionLabel')}</p>
      <h1 className="section-title">{t('education.title')}</h1>

      <div className="edu-list">
        {education.map((e, i) => {
          const desc = e.desc ?? t(e.descKey, { defaultValue: '' });
          const highlights = e.highlights ?? t(e.highlightsKey, { returnObjects: true, defaultValue: [] });
          return (
            <div key={e.id ?? e.degree} className="edu-card animate-fadeUp" style={{ animationDelay: `${i * 0.15}s` }}>
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
            </div>
          );
        })}
      </div>

      {/* Certifications */}
      <div className="cert-section animate-fadeUp delay-3">
        <p className="section-label" style={{ marginTop: 0 }}>{t('education.certLabel')}</p>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.8rem', marginBottom: 32 }}>{t('education.certTitle')}</h2>
        <div className="cert-grid">
          {certifications.map((c) => (
            <div key={c.id ?? c.titleKey} className="cert-card">
              <div className="cert-icon" style={{ background: c.color + '18', color: c.color }}>
                <Award size={20} />
              </div>
              <h3 className="cert-title">{c.title ?? t(c.titleKey, { defaultValue: c.titleKey })}</h3>
              <p className="cert-issuer">{c.issuer}</p>
              <span className="cert-date mono">{c.date}</span>
              <div className="cert-bar" style={{ background: c.color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
