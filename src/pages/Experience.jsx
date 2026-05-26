import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Experience.css';

const experiences = [
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

export default function Experience() {
  const { t } = useTranslation();

  return (
    <div className="page exp-page">
      <Helmet>
        <title>Experience | Shandy Shulton Shihab</title>
        <meta name="description" content="Professional experience and career history of Shandy Shulton Shihab." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Experience | Shandy Shulton Shihab" />
        <meta property="og:description" content="Professional journey and full-stack development internship achievements." />
        <meta property="og:image" content="/images/PP.jpeg" />
      </Helmet>

      <p className="section-label">{t('experience.sectionLabel')}</p>
      <h1 className="section-title">{t('experience.title')}</h1>

      <div className="exp-timeline">
        {experiences.map((exp, i) => {
          const role = t(exp.roleKey, { defaultValue: exp.roleKey });
          const type = t(exp.typeKey, { defaultValue: exp.typeKey });
          const desc = t(exp.descKey, { defaultValue: '' });
          const responsibilities = t(exp.responsibilitiesKey, { returnObjects: true, defaultValue: [] });

          return (
            <div
              key={exp.id}
              className="exp-item animate-fadeUp"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
