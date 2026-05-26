import { GraduationCap, Award, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Education.css';

const education = [
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

const certifications = [
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

export default function Education() {
  const { t } = useTranslation();

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
          const desc = t(e.descKey, { defaultValue: '' });
          const highlights = t(e.highlightsKey, { returnObjects: true, defaultValue: [] });
          return (
            <div key={e.degree} className="edu-card animate-fadeUp" style={{ animationDelay: `${i * 0.15}s` }}>
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
            <div key={c.titleKey} className="cert-card">
              <div className="cert-icon" style={{ background: c.color + '18', color: c.color }}>
                <Award size={20} />
              </div>
              <h3 className="cert-title">{t(c.titleKey, { defaultValue: c.titleKey })}</h3>
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
