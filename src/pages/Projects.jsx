import { ExternalLink, GitFork, Code2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Projects.css';

const projects = [
  {
    id: 1,
    title: 'IMOCA Company Profile Website',
    role: 'Full Stack Developer',
    date: 'May 2026',
    stack: ['Tailwind CSS', 'React.js', 'Golang', 'MySQL'],
    descKey: 'projects.items.imoca.desc',
    highlightsKey: 'projects.items.imoca.highlights',
    color: '#9e2ac8',
    github: 'https://github.com/Shandyshulton/petly',
  },
  {
    id: 2,
    title: 'Petly – Pet Care E-Commerce',
    role: 'Front-End Developer',
    date: 'December 2025',
    stack: ['Tailwind CSS', 'Laravel', 'MySQL'],
    descKey: 'projects.items.petly.desc',
    highlightsKey: 'projects.items.petly.highlights',
    color: '#2ac87a',
    github: 'https://github.com/Shandyshulton/petly',
  },
  {
    id: 3,
    title: 'Personal Portfolio Website',
    role: 'Front-End Developer',
    date: 'October 2025',
    stack: ['React.js', 'Vite', 'Tailwind CSS'],
    descKey: 'projects.items.portfolio.desc',
    highlightsKey: 'projects.items.portfolio.highlights',
    color: '#2a7cc8',
    github: 'https://github.com/Shandyshulton',
    live: 'https://shandy-shulton-shihab.vercel.app/',
  },
  {
    id: 4,
    title: 'PlayStation Rental Management System',
    role: 'Full Stack Developer',
    date: 'June 2025',
    stack: ['Laravel', 'MySQL', 'Bootstrap'],
    descKey: 'projects.items.ps.desc',
    highlightsKey: 'projects.items.ps.highlights',
    color: '#c8522a',
    github: 'https://github.com/Shandyshulton/Sistem-Manajemen-Rental-PS',
  },
];

export default function Projects() {
  const { t } = useTranslation();

  return (
    <div className="page projects-page">
      <Helmet>
        <title>Projects | Shandy Shulton Shihab</title>
        <meta name="description" content="Explore full-stack web applications developed by Shandy Shulton Shihab." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Projects | Shandy Shulton Shihab" />
        <meta property="og:description" content="Showcase of professional full-stack web and database development projects." />
        <meta property="og:image" content="/images/PP.jpeg" />
      </Helmet>
      <p className="section-label">{t('projects.sectionLabel')}</p>
      <h1 className="section-title">{t('projects.title')}</h1>

      <div className="projects-list">
        {projects.map((p, i) => {
          const desc = t(p.descKey, { defaultValue: '' });
          const highlights = t(p.highlightsKey, { returnObjects: true, defaultValue: [] });

          return (
            <div
              key={p.id}
              className="project-card animate-fadeUp"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="project-card-accent" style={{ background: p.color + '22', borderColor: p.color + '44' }} />

              <div className="project-header">
                <div className="project-icon" style={{ background: p.color + '18', color: p.color }}>
                  <Code2 size={22} />
                </div>
                <div>
                  <h2 className="project-title">{p.title}</h2>
                  <div className="project-meta">
                    <span className="project-role">{p.role}</span>
                    <span className="project-date mono">{p.date}</span>
                  </div>
                </div>
              </div>

              <p className="project-desc">{desc || p.description}</p>

              <ul className="project-highlights">
                {(Array.isArray(highlights) && highlights.length > 0 ? highlights : p.highlights || []).map(h => (
                  <li key={h}><span className="highlight-dot" style={{ background: p.color }} />  {h}</li>
                ))}
              </ul>

              <div className="project-footer">
                <div className="project-stack">
                  {p.stack.map(s => (
                    <span key={s} className="tag">{s}</span>
                  ))}
                </div>
                <div className="project-links">
                  <a href={p.github} target="_blank" rel="noreferrer" className="project-link">
                    <GitFork size={16} /> {t('projects.github')}
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="project-link project-link-live">
                      <ExternalLink size={16} /> {t('projects.liveDemo')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
