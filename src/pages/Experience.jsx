import { useEffect, useMemo, useState } from 'react';
import { Laptop, Film, Languages, Users, Calendar, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms, formatPeriod, getTranslation } from '../lib/cmsApi.js';
import AiBackground from '../components/AiBackground.jsx';
import Reveal from '../components/Reveal.jsx';
import './Experience.css';

const SITE_URL = 'https://shandy-shulton-shihab.vercel.app/';
const PROFILE_IMAGE = 'https://www.shandyshultonshihab.my.id/images/PP.jpeg';

const fallbackExperiences = [
  {
    id: 1,
    roleKey: 'experience.items.ina17.role',
    company: 'PT Indonesia Satu Tujuh (INA17)',
    period: 'Feb 2026 – Present',
    location: 'Jakarta, Indonesia',
    typeKey: 'experience.types.internship',
    color: '#c8522a',
    descKey: 'experience.items.ina17.desc',
    responsibilitiesKey: 'experience.items.ina17.responsibilities',
    stack: ['Go', 'Gin', 'Laravel', 'MySQL', 'React.js', 'Git', 'REST API'],
  },
  {
    id: 2,
    roleKey: 'experience.items.dunamis.role',
    company: 'Dunamis Indonesia',
    period: '2025',
    location: 'Jakarta, Indonesia',
    typeKey: 'experience.types.internship',
    color: '#2a7cc8',
    descKey: 'experience.items.dunamis.desc',
    responsibilitiesKey: 'experience.items.dunamis.responsibilities',
    stack: ['Adobe Premiere', 'After Effects', 'Figma', 'Content Creation'],
  },
  {
    id: 3,
    roleKey: 'experience.items.lia.role',
    company: 'LB LIA Language Institute',
    period: 'Completed Feb 2024',
    location: 'Jakarta, Indonesia',
    typeKey: 'experience.types.course',
    color: '#2ac87a',
    descKey: 'experience.items.lia.desc',
    responsibilitiesKey: 'experience.items.lia.responsibilities',
    stack: ['English Communication', 'Business Writing', 'Professional Presentation'],
  },
  {
    id: 4,
    roleKey: 'experience.items.bncc.role',
    company: 'BNCC (Bina Nusantara Computer Club)',
    period: 'During University Studies',
    location: 'BINUS University',
    typeKey: 'experience.types.organization',
    color: '#8b2ac8',
    descKey: 'experience.items.bncc.desc',
    responsibilitiesKey: 'experience.items.bncc.responsibilities',
    stack: ['Laravel', 'Jira', 'Team Collaboration', 'Project Management'],
  },
];

const experienceColors = ['#c8522a', '#2a7cc8', '#2ac87a', '#8b2ac8'];

// Ikon node disesuaikan dengan bidang peran (developer / video / bahasa / organisasi).
function pickCareerIcon(exp) {
  const hay = `${(exp.stack || []).join(' ')} ${exp.type ?? ''}`.toLowerCase();
  if (/premiere|after effects|figma|video|content|media/.test(hay)) return Film;
  if (/english|communication|writing|presentation|language/.test(hay)) return Languages;
  if (/jira|collaboration|management|organization|team/.test(hay)) return Users;
  return Laptop;
}

function normalizeCmsExperience(experience, locale, index) {
  const translation = getTranslation(experience, locale);

  return {
    id: experience.id,
    role: experience.role,
    company: experience.company_name,
    period: formatPeriod(experience.start_date, experience.end_date, experience.is_current, locale),
    location: experience.location,
    type: experience.work_model,
    color: experienceColors[index % experienceColors.length],
    desc: translation.description ?? '',
    responsibilities: translation.highlights ?? [],
    stack: experience.skills ?? [],
  };
}

export default function Experience() {
  const { t, i18n } = useTranslation();
  const [cmsExperiences, setCmsExperiences] = useState([]);

  useEffect(() => {
    let active = true;

    fetchCms('/public/experiences')
      .then((payload) => {
        if (active) setCmsExperiences(Array.isArray(payload) ? payload : []);
      })
      .catch(() => {
        if (active) setCmsExperiences([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const experiences = useMemo(() => {
    if (cmsExperiences.length === 0) return fallbackExperiences;
    return cmsExperiences.map((experience, index) => normalizeCmsExperience(experience, i18n.language, index));
  }, [cmsExperiences, i18n.language]);

  return (
    <div className="page exp-page">
      <AiBackground muted />
      <Helmet>
        <title>Experience | Shandy Shulton Shihab</title>
        <meta name="description" content="Professional experience and career history of Shandy Shulton Shihab." />
        <link rel="canonical" href={`${SITE_URL}experience`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}experience`} />
        <meta property="og:title" content="Experience | Shandy Shulton Shihab" />
        <meta property="og:description" content="Professional journey and full-stack development internship achievements." />
        <meta property="og:image" content={PROFILE_IMAGE} />
        <meta name="twitter:title" content="Experience | Shandy Shulton Shihab" />
        <meta name="twitter:description" content="Professional journey and full-stack development internship achievements." />
        <meta name="twitter:image" content={PROFILE_IMAGE} />
      </Helmet>

      <Reveal as="p" className="section-label">{t('experience.sectionLabel')}</Reveal>
      <Reveal as="h1" delay={80} className="section-title">{t('experience.title')}</Reveal>

      <Reveal delay={120} className="exp-orb-timeline">
        {experiences.map((exp) => {
          const role = exp.role ?? t(exp.roleKey, { defaultValue: exp.roleKey });
          const type = exp.type ?? t(exp.typeKey, { defaultValue: exp.typeKey });
          const desc = exp.desc ?? t(exp.descKey, { defaultValue: '' });
          const responsibilities = exp.responsibilities ?? t(exp.responsibilitiesKey, { returnObjects: true, defaultValue: [] });
          const isCurrent = /present|sekarang/i.test(exp.period || '');
          const accent = isCurrent ? '#fbbf24' : '#38bdf8';
          const Icon = pickCareerIcon(exp);

          return (
            <div
              key={exp.id}
              className="exp-orb-row"
              style={{ '--exp-accent': accent }}
            >
              <span className="exp-orb-node" aria-hidden="true">
                <Icon size={22} />
              </span>

              <article className="exp-orb-card">
                <div className="exp-orb-badges">
                  <span className="exp-pill exp-pill--type mono">{type}</span>
                  <span className="exp-pill mono"><Calendar size={12} /> {exp.period}</span>
                  <span className="exp-pill mono"><MapPin size={12} /> {exp.location}</span>
                </div>

                <div className="exp-orb-title-row">
                  <h2 className="exp-orb-role">{role}</h2>
                  <span className={`exp-status mono ${isCurrent ? 'is-current' : 'is-done'}`}>
                    <span className="exp-status-dot" aria-hidden="true" />
                    {isCurrent ? 'CURRENT ROLE' : 'COMPLETED MISSION'}
                  </span>
                </div>
                <p className="exp-orb-company">{exp.company}</p>

                <p className="exp-orb-desc">{desc}</p>

                <ul className="exp-telemetry">
                  {(Array.isArray(responsibilities) ? responsibilities : []).map((r) => (
                    <li key={r}>
                      <span className="exp-telemetry-dot" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>

                <div className="exp-orb-stack">
                  {exp.stack.map((s) => (
                    <span key={s} className="exp-chip mono">{s}</span>
                  ))}
                </div>
              </article>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}
