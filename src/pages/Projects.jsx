import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, GitFork, Code2, Image, Layers, Calendar, UserRound, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms, getTranslation } from '../lib/cmsApi.js';
import './Projects.css';

const fallbackProjects = [
  {
    id: 1,
    key: 'imoca',
    slug: 'imoca-company-profile',
    stack: ['Tailwind CSS', 'React.js', 'Golang', 'MySQL'],
    color: '#9e2ac8',
    github: 'https://github.com/Shandyshulton/petly',
    images: [],
  },
  {
    id: 2,
    key: 'petly',
    slug: 'petly-pet-care-ecommerce',
    stack: ['Tailwind CSS', 'Laravel', 'MySQL'],
    color: '#2ac87a',
    github: 'https://github.com/Shandyshulton/petly',
    images: [],
  },
  {
    id: 3,
    key: 'easysaving',
    slug: 'easy-saving',
    stack: ['React.js', 'Vite', 'Tailwind CSS', 'JavaScript'],
    color: '#2a7cc8',
    live: 'https://easysaving.asia/',
    images: [],
  },
  {
    id: 4,
    key: 'ps',
    slug: 'playstation-rental-management-system',
    stack: ['Laravel', 'MySQL', 'Bootstrap'],
    color: '#c8522a',
    github: 'https://github.com/Shandyshulton/Sistem-Manajemen-Rental-PS',
    images: [],
  },
];

const projectColors = ['#9e2ac8', '#2ac87a', '#2a7cc8', '#c8522a', '#8b2ac8'];

function normalizeCmsProject(project, locale, index) {
  const translation = getTranslation(project, locale);
  const heroImage = project.images?.find((image) => image.image_type === 'hero') ?? project.images?.find((image) => image.is_cover);
  const galleryImages = project.images?.filter((image) => image.image_type === 'gallery') ?? [];
  const images = [heroImage, ...galleryImages].filter(Boolean);
  const descriptionParts = (translation.description ?? '').split(/\n\n+/);
  const fallback = fallbackProjects.find((fp) => fp.slug === project.slug) ?? fallbackProjects.find((fp) => fp.key === project.slug);

  return {
    id: project.id,
    key: project.slug,
    slug: project.slug,
    title: translation.title ?? project.slug,
    type: project.category ?? 'Project',
    role: project.client_name ?? 'Developer',
    date: project.published_at ? new Date(project.published_at).getFullYear().toString() : '-',
    status: project.live_url ? 'Live' : project.status,
    summary: translation.summary ?? '',
    desc: descriptionParts[0] ?? translation.description ?? '',
    highlights: translation.highlights ?? [],
    stack: project.stacks ?? [],
    color: projectColors[index % projectColors.length],
    github: project.repository_url,
    live: project.live_url,
    images: (images.length > 0 ? images : fallback?.images ?? []).map((image) => ({
      src: image.image_url ?? image.src,
      thumbSrc: image.thumb_url ?? image.thumbnail_url ?? image.image_url ?? image.src,
      label: image.caption || image.alt_text || image.label || '',
      labelKey: image.labelKey ?? '',
    })),
  };
}

function ProjectShot({ projectColor, projectTitle, shot, shotLabel, compact = false }) {
  const [failedSrc, setFailedSrc] = useState('');
  const src = compact ? (shot.thumbSrc ?? shot.src) : shot.src;
  const hasImage = Boolean(src) && failedSrc !== src;

  return (
    <div className={`project-shot ${compact ? 'project-shot--compact' : ''}`}>
      {hasImage && (
        <img
          src={src}
          alt={`${projectTitle} - ${shotLabel}`}
          width={compact ? 480 : 1600}
          height={compact ? 300 : 1000}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      )}
      {!hasImage && (
        <div className="project-shot-fallback" style={{ '--project-color': projectColor }}>
          <Image size={compact ? 18 : 34} />
          {!compact && <span>{shotLabel}</span>}
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const { t, i18n } = useTranslation();
  const [activeShots, setActiveShots] = useState({});
  const [cmsProjects, setCmsProjects] = useState([]);

  useEffect(() => {
    let active = true;

    fetchCms('/public/projects')
      .then((payload) => {
        if (active) setCmsProjects(Array.isArray(payload) ? payload : []);
      })
      .catch(() => {
        if (active) setCmsProjects([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const projects = useMemo(() => {
    if (cmsProjects.length === 0) return fallbackProjects;
    return cmsProjects.map((project, index) => normalizeCmsProject(project, i18n.language, index));
  }, [cmsProjects, i18n.language]);

  return (
    <div className="page projects-page">
      <Helmet>
        <title>{t('projects.meta.title')}</title>
        <meta name="description" content={t('projects.meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('projects.meta.title')} />
        <meta property="og:description" content={t('projects.meta.ogDescription')} />
        <meta property="og:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
        <meta name="twitter:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
      </Helmet>
      <p className="section-label">{t('projects.sectionLabel')}</p>
      <h1 className="section-title">{t('projects.title')}</h1>
      <p className="projects-intro">{t('projects.intro')}</p>

      <div className="projects-list">
        {projects.map((p, i) => {
          const baseKey = `projects.items.${p.key}`;
          const title = p.title ?? t(`${baseKey}.title`);
          const type = p.type ?? t(`${baseKey}.type`);
          const role = p.role ?? t(`${baseKey}.role`);
          const date = p.date ?? t(`${baseKey}.date`);
          const status = p.status ?? t(`${baseKey}.status`);
          const summary = p.summary ?? t(`${baseKey}.summary`);
          const desc = p.desc ?? t(`${baseKey}.desc`, { defaultValue: '' });
          const highlights = p.highlights ?? t(`${baseKey}.highlights`, { returnObjects: true, defaultValue: [] });
          const activeShot = activeShots[p.id] ?? 0;
          const selectedShot = p.images[activeShot] ?? p.images[0] ?? { src: '', label: 'Preview' };
          const resolveShotLabel = (shot, fallbackLabel) =>
            shot.label || (shot.labelKey ? t(`projects.${shot.labelKey}`, { defaultValue: fallbackLabel }) : fallbackLabel);
          const selectedShotLabel = resolveShotLabel(selectedShot, 'Preview');

          return (
            <div
              key={p.id}
              className="project-card animate-fadeUp"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="project-card-accent" style={{ background: p.color + '22', borderColor: p.color + '44' }} />

              <div className="project-layout">
                <div className="project-gallery">
                  <div className="project-browser" style={{ '--project-color': p.color }}>
                    <div className="project-browser-bar">
                      <span />
                      <span />
                      <span />
                      <p>{selectedShotLabel}</p>
                    </div>
                    <ProjectShot
                      projectColor={p.color}
                      projectTitle={title}
                      shot={selectedShot}
                      shotLabel={selectedShotLabel}
                    />
                  </div>

                  <div className="project-thumbs" aria-label={t('projects.screenshotList', { title })}>
                    {p.images.map((shot, index) => {
                      const shotLabel = resolveShotLabel(shot, `Shot ${index + 1}`);

                      return (
                        <button
                          key={shot.src || `${p.id}-${index}`}
                          type="button"
                          className={`project-thumb ${activeShot === index ? 'project-thumb--active' : ''}`}
                          onClick={() => setActiveShots(prev => ({ ...prev, [p.id]: index }))}
                          aria-label={t('projects.showShot', { label: shotLabel })}
                          style={{ '--project-color': p.color }}
                        >
                          <ProjectShot
                            projectColor={p.color}
                            projectTitle={title}
                            shot={shot}
                            shotLabel={shotLabel}
                            compact
                          />
                          <span>{shotLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="project-content">
                  <div className="project-header">
                    <div className="project-icon" style={{ background: p.color + '18', color: p.color }}>
                      <Code2 size={22} />
                    </div>
                    <div>
                      <p className="project-type">{type}</p>
                      <h2 className="project-title">{title}</h2>
                    </div>
                  </div>

                  <p className="project-summary">{summary}</p>
                  <p className="project-desc">{desc}</p>

                  <div className="project-facts">
                    <div>
                      <UserRound size={15} />
                      <span>{role}</span>
                    </div>
                    <div>
                      <Calendar size={15} />
                      <span>{date}</span>
                    </div>
                    <div>
                      <Layers size={15} />
                      <span>{status}</span>
                    </div>
                  </div>

                  <ul className="project-highlights">
                    {(Array.isArray(highlights) ? highlights : []).map(h => (
                      <li key={h}>
                        <CheckCircle2 size={15} style={{ color: p.color }} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="project-footer">
                    <div className="project-stack">
                      {p.stack.map(s => (
                        <span key={s} className="tag">{s}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noreferrer" className="project-link">
                          <GitFork size={16} /> {t('projects.github')}
                        </a>
                      )}
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noreferrer" className="project-link project-link-live">
                          <ExternalLink size={16} /> {t('projects.liveDemo')}
                        </a>
                      )}
                    </div>
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
