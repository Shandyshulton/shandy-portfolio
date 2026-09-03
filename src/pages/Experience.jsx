import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms, formatPeriod, getTranslation } from '../lib/cmsApi.js';
import AiBackground from '../components/AiBackground.jsx';
import Reveal from '../components/Reveal.jsx';
import './Experience.css';

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
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Experience | Shandy Shulton Shihab" />
        <meta property="og:description" content="Professional journey and full-stack development internship achievements." />
        <meta property="og:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
        <meta name="twitter:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
      </Helmet>

      <Reveal as="p" className="section-label">{t('experience.sectionLabel')}</Reveal>
      <Reveal as="h1" delay={80} className="section-title">{t('experience.title')}</Reveal>

      <div className="exp-timeline">
        {experiences.map((exp, i) => {
          const role = exp.role ?? t(exp.roleKey, { defaultValue: exp.roleKey });
          const type = exp.type ?? t(exp.typeKey, { defaultValue: exp.typeKey });
          const desc = exp.desc ?? t(exp.descKey, { defaultValue: '' });
          const responsibilities = exp.responsibilities ?? t(exp.responsibilitiesKey, { returnObjects: true, defaultValue: [] });

          return (
            <Reveal key={exp.id} delay={i * 90} className="exp-item">
              <div className="exp-marker">
                <div className="exp-dot" style={{ borderColor: exp.color, background: exp.color + '20' }}>
                  <Briefcase size={16} style={{ color: exp.color }} />
                </div>
                {i < experiences.length - 1 && <div className="exp-connector" />}
              </div>

              <div className="exp-card">
                <div className="exp-card-top" style={{ borderLeftColor: exp.color }}>
                  <div className="exp-header">
                    <div>
                      <span className="exp-type-badge" style={{ background: exp.color + '18', color: exp.color, borderColor: exp.color + '44' }}>
                        {type}
                      </span>
                      <h2 className="exp-role">{role}</h2>
                      <p className="exp-company">{exp.company}</p>
                    </div>
                    <div className="exp-meta">
                      <span className="exp-meta-item">
                        <Calendar size={13} /> {exp.period}
                      </span>
                      <span className="exp-meta-item">
                        <MapPin size={13} /> {exp.location}
                      </span>
                    </div>
                  </div>

                  <p className="exp-desc">{desc}</p>

                  <ul className="exp-responsibilities">
                    {(Array.isArray(responsibilities) ? responsibilities : []).map(r => (
                      <li key={r}>
                        <span className="resp-arrow" style={{ color: exp.color }}>→</span>
                        {r}
                      </li>
                    ))}
                  </ul>

                  <div className="exp-stack">
                    {exp.stack.map(s => (
                      <span key={s} className="tag">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
