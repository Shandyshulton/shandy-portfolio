import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, GitFork, ArrowLeft, ArrowRight, Image as ImageIcon, ZoomIn, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchCms, getTranslation } from '../lib/cmsApi.js';
import './Projects.css';

const ACCENT_PAIRS = [
  { accent: '#2563eb', secondary: '#bfdbfe' },
  { accent: '#7c3aed', secondary: '#ddd6fe' },
  { accent: '#059669', secondary: '#a7f3d0' },
  { accent: '#d97706', secondary: '#fde68a' },
  { accent: '#9e2ac8', secondary: '#e9d5ff' },
  { accent: '#c8522a', secondary: '#fecaca' },
];

// Cadangan data offline. Teks diambil dari i18n (projects.items.*) yang sudah
// bilingual & lama ada di repo — bukan konten karangan. Stack/link cadangan
// hanya untuk menjaga UI tetap informatif saat CMS tidak terjangkau.
const FALLBACK_META = {
  imoca: {
    slug: 'imoca-company-profile',
    stack: ['Tailwind CSS', 'React.js', 'Golang', 'MySQL'],
    github: 'https://github.com/Shandyshulton/petly',
    live: null,
  },
  petly: {
    slug: 'petly-pet-care-ecommerce',
    stack: ['Tailwind CSS', 'Laravel', 'MySQL'],
    github: 'https://github.com/Shandyshulton/petly',
    live: null,
  },
  easysaving: {
    slug: 'easy-saving',
    stack: ['React.js', 'Vite', 'Tailwind CSS', 'JavaScript'],
    github: null,
    live: 'https://easysaving.asia/',
  },
  ps: {
    slug: 'playstation-rental-management-system',
    stack: ['Laravel', 'MySQL', 'Bootstrap'],
    github: 'https://github.com/Shandyshulton/Sistem-Manajemen-Rental-PS',
    live: null,
  },
};

function buildFallbackProjects(t) {
  return Object.keys(FALLBACK_META).map((key, index) => {
    const base = `projects.items.${key}`;
    const meta = FALLBACK_META[key];
    const pair = ACCENT_PAIRS[index % ACCENT_PAIRS.length];
    const title = t(`${base}.title`);
    const date = t(`${base}.date`, { defaultValue: '-' });

    return {
      id: index + 1,
      key,
      slug: meta.slug,
      category: t(`${base}.type`, { defaultValue: 'Project' }),
      title,
      shortTitle: title,
      tagline: t(`${base}.summary`, { defaultValue: '' }),
      description: t(`${base}.desc`, { defaultValue: '' }),
      role: t(`${base}.role`, { defaultValue: 'Developer' }),
      year: date,
      status: t(`${base}.status`, { defaultValue: 'Published' }),
      highlights: t(`${base}.highlights`, { returnObjects: true, defaultValue: [] }),
      stack: meta.stack,
      github: meta.github,
      live: meta.live,
      accent: pair.accent,
      secondary: pair.secondary,
      screens: [],
    };
  });
}

function statusLabel(project) {
  if (project.live_url) return 'Live';
  if (!project.status) return 'Published';
  return project.status.charAt(0).toUpperCase() + project.status.slice(1);
}

function normalizeCmsProject(project, locale, index) {
  const translation = getTranslation(project, locale);
  const pair = ACCENT_PAIRS[index % ACCENT_PAIRS.length];

  // Prioritas: gambar hero/cover dulu, lalu gallery, urut sesuai sort_order
  const images = [...(project.images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const heroImage = images.find((img) => img.image_type === 'hero') ?? images.find((img) => img.is_cover) ?? images[0];
  const ordered = [heroImage, ...images.filter((img) => img !== heroImage)].filter(Boolean);

  const screens = ordered.map((img) => ({
    src: img.image_url ?? img.src ?? '',
    thumbSrc: img.thumb_url ?? img.thumbnail_url ?? img.image_url ?? img.src ?? '',
    label: img.caption || img.alt_text || img.label || '',
  }));

  return {
    id: project.id,
    key: project.slug,
    slug: project.slug,
    category: project.category ?? 'Project',
    title: translation.title ?? project.slug,
    shortTitle: translation.title ?? project.slug,
    tagline: translation.summary ?? '',
    description: translation.description ?? '',
    role: project.client_name ?? 'Developer',
    year: project.published_at ? new Date(project.published_at).getFullYear().toString() : '-',
    status: statusLabel(project),
    highlights: translation.highlights ?? [],
    stack: project.stacks ?? [],
    github: project.repository_url,
    live: project.live_url,
    accent: pair.accent,
    secondary: pair.secondary,
    screens,
  };
}

// ─── Gambar proyek: responsif untuk ukuran berapa pun, tanpa stretch ─────────

function ProjectImage({ src, alt, className, onFail }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`projects-img-fallback ${className ?? ''}`}>
        <ImageIcon size={28} />
        <span>{alt || 'Preview'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailed(true);
        onFail?.();
      }}
    />
  );
}

// ─── Detail panel (shared by mobile + desktop) ────────────────────────────────

function DetailPanel({ t, active, activeScreen, setActiveScreen }) {
  const screen = active.screens[activeScreen];
  const screenLabel = screen?.label || 'Preview';
  const hasScreens = active.screens.length > 0;
  const total = active.screens.length;
  const touchX = useRef(null);
  const [lightbox, setLightbox] = useState(false);

  // Navigasi slider (wrap-around)
  const goSlide = (dir) => {
    if (!hasScreens) return;
    setActiveScreen((total + activeScreen + dir) % total);
  };
  const goTo = (i) => {
    if (i >= 0 && i < total) setActiveScreen(i);
  };

  // Keyboard saat lightbox terbuka: ESC tutup, panah kiri/kanan navigasi
  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setActiveScreen((total + activeScreen + 1) % total);
      if (e.key === 'ArrowLeft') setActiveScreen((total + activeScreen - 1) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, activeScreen, total, setActiveScreen]);

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) goSlide(dx < 0 ? 1 : -1); // geser kiri → next
  };

  const openLightbox = (e) => {
    // hanya buka saat mengklik slide yang aktif
    if (e.currentTarget.classList.contains('is-active')) setLightbox(true);
  };

  return (
    <div className="projects-detail">
      {/* detail header */}
      <header className="projects-detail-header">
        <div className="projects-detail-heading">
          <span className="projects-category" style={{ background: active.accent }}>{active.category}</span>
          <h2 className="projects-title">{active.title}</h2>
          <p className="projects-role">{active.role} · {active.year}</p>
        </div>
        <div className="projects-header-actions">
          {active.github && (
            <a href={active.github} target="_blank" rel="noopener noreferrer" className="btn btn-github">
              <GitFork size={13} /> GitHub
            </a>
          )}
          {active.live && (
            <a href={active.live} target="_blank" rel="noopener noreferrer" className="btn btn-live" style={{ borderColor: active.accent, color: active.accent }}>
              <ExternalLink size={12} /> {t('projects.live')}
            </a>
          )}
        </div>
      </header>

      {/* body — mengalir (scroll halaman di mobile, scroll area di desktop) */}
      <div className="projects-detail-body">
        {/* ── Image slider (coverflow 3D) ── */}
        {hasScreens ? (
          <section className="projects-slider">
            <div
              className="projects-slider-stage"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="projects-slider-track"
                style={{ transform: `translateX(calc(19% - ${activeScreen * 62}%))` }}
              >
                {active.screens.map((s, i) => {
                  const offset = i - activeScreen;
                  const isActive = i === activeScreen;
                  const label = s.label || `Shot ${i + 1}`;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`projects-slide ${isActive ? 'is-active' : ''}`}
                      style={{
                        '--slide-accent': active.accent,
                        transform: `perspective(1200px) rotateY(${offset * -55}deg) translateZ(${isActive ? 0 : -140}px) scale(${isActive ? 1 : 0.8})`,
                        opacity: Math.abs(offset) > 1 ? 0 : 1,
                        zIndex: isActive ? 3 : 2 - Math.abs(offset),
                        pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
                      }}
                      onClick={(e) => {
                        if (!isActive) {
                          goTo(i);
                        } else {
                          openLightbox(e);
                        }
                      }}
                      aria-label={isActive ? `${label} — perbesar` : label}
                    >
                      <span className="projects-slide-img">
                        <ProjectImage key={s.src} src={s.src} alt={`${active.title} - ${label}`} />
                        {isActive && (
                          <span className="projects-slide-zoom">
                            <ZoomIn size={14} />
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* panah + counter */}
            {total > 1 && (
              <div className="projects-slider-ui">
                <button type="button" className="projects-slider-arrow" onClick={() => goSlide(-1)} aria-label="Previous slide">
                  <ArrowLeft size={16} />
                </button>
                <span className="projects-slider-count">
                  {String(activeScreen + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <button type="button" className="projects-slider-arrow" onClick={() => goSlide(1)} aria-label="Next slide">
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {screenLabel && <p className="projects-slider-label">{screenLabel}</p>}

            <button type="button" className="projects-slider-hint" onClick={() => setLightbox(true)}>
              <ZoomIn size={13} />
              {t('projects.clickToZoom')}
            </button>
          </section>
        ) : (
          <section className="projects-gallery">
            <div className="projects-shot-frame">
              <div className="projects-img-fallback">
                <ImageIcon size={28} />
                <span>{t('projects.noScreens')}</span>
              </div>
            </div>
          </section>
        )}

        {/* info */}
        <section className="projects-info">
          {active.tagline && <p className="projects-tagline">“{active.tagline}”</p>}
          {active.description && <p className="projects-desc">{active.description}</p>}

          <div className="projects-info-grid">
            <div>
              <h3 className="projects-info-heading">{t('projects.features')}</h3>
              {active.highlights.length > 0 ? (
                <ul className="projects-features">
                  {active.highlights.map((h, i) => (
                    <li key={i} className="projects-feature">
                      <span className="projects-feature-mark" style={{ background: active.accent }} />
                      {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="projects-desc">{t('projects.noFeatures')}</p>
              )}
            </div>

            <div>
              <h3 className="projects-info-heading">{t('projects.techStack')}</h3>
              {active.stack.length > 0 ? (
                <div className="projects-stack">
                  {active.stack.map((tech) => (
                    <span key={tech} className="projects-stack-tag">{tech}</span>
                  ))}
                </div>
              ) : (
                <p className="projects-desc">{t('projects.noStack')}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── Lightbox: lihat screenshot ukuran penuh ── */}
      {lightbox && hasScreens && (
        <div
          className="projects-lightbox"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={screenLabel}
        >
          <button type="button" className="projects-lightbox-close" onClick={() => setLightbox(false)} aria-label="Tutup">
            <X size={22} />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                className="projects-lightbox-nav projects-lightbox-nav--prev"
                onClick={(e) => { e.stopPropagation(); goSlide(-1); }}
                aria-label="Previous image"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                type="button"
                className="projects-lightbox-nav projects-lightbox-nav--next"
                onClick={(e) => { e.stopPropagation(); goSlide(1); }}
                aria-label="Next image"
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}

          <div className="projects-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              key={screen.src}
              src={screen.src}
              alt={`${active.title} - ${screenLabel}`}
              className="projects-lightbox-img"
            />
            <div className="projects-lightbox-meta">
              <span className="projects-lightbox-label">{screenLabel}</span>
              {total > 1 && (
                <span className="projects-lightbox-count">
                  {String(activeScreen + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Projects page ───────────────────────────────────────────────────────

export default function Projects() {
  const { t, i18n } = useTranslation();
  const [cmsProjects, setCmsProjects] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeScreen, setActiveScreen] = useState(0);
  const [mobileView, setMobileView] = useState('list');

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
    // null = masih loading; [] = CMS kosong/offline → fallback i18n
    if (cmsProjects === null) return [];
    if (cmsProjects.length === 0) return buildFallbackProjects(t);
    return cmsProjects.map((project, index) => normalizeCmsProject(project, i18n.language, index));
  }, [cmsProjects, i18n.language, t]);

  const active = projects.find((p) => p.key === activeId) ?? projects[0];
  const activeIndex = Math.max(projects.findIndex((p) => p.key === activeId), 0);

  const handleSelect = (key) => {
    setActiveId(key);
    setActiveScreen(0);
    setMobileView('detail');
  };

  return (
    <div className="projects-page">
      <Helmet>
        <title>{t('projects.meta.title')}</title>
        <meta name="description" content={t('projects.meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('projects.meta.title')} />
        <meta property="og:description" content={t('projects.meta.ogDescription')} />
        <meta property="og:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
        <meta name="twitter:image" content="https://www.shandyshultonshihab.my.id/images/PP.jpeg" />
      </Helmet>

      {projects.length === 0 ? (
        <div className="projects-loading">
          <div className="projects-loading-spinner" />
          <p>{t('projects.loading')}</p>
        </div>
      ) : (
        <>
          {/* Mobile: list view (hanya saat mode list) */}
          {mobileView === 'list' && (
            <div className="projects-mobile-list">
              <div className="projects-mobile-head">
                <p className="projects-eyebrow">{t('projects.sectionLabel')}</p>
                <h1 className="projects-heading">Projects</h1>
                <p className="projects-count">{projects.length} {t('projects.selectedWorks')}</p>
              </div>
              <div className="projects-mobile-items">
                {projects.map((p, i) => (
                  <button key={p.key} type="button" className="projects-mobile-item" onClick={() => handleSelect(p.key)}>
                    <div className="projects-mobile-id" style={{ background: p.accent + '20' }}>
                      <span style={{ color: p.accent }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="projects-mobile-meta">
                      <p className="projects-mobile-title">{p.shortTitle || p.title}</p>
                      <p className="projects-mobile-sub">{p.category} · {p.year}</p>
                    </div>
                    <div className="projects-mobile-right">
                      <span className={`projects-status ${p.status === 'Live' ? 'is-live' : ''}`}>{p.status}</span>
                      <ArrowRight size={14} className="projects-mobile-arrow" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile: detail view */}
          {mobileView === 'detail' && (
            <div className="projects-mobile-detail">
              <div className="projects-mobile-backbar">
                <button type="button" className="projects-back-btn" onClick={() => setMobileView('list')}>
                  <ArrowLeft size={16} /> {t('projects.back')}
                </button>
                <span className="projects-mobile-count">{activeIndex + 1} / {projects.length}</span>
              </div>
              <DetailPanel
                key={active.key}
                t={t}
                active={active}
                activeScreen={activeScreen}
                setActiveScreen={setActiveScreen}
              />
            </div>
          )}

          {/* Desktop: split panel */}
          <div className="projects-desktop">
            <aside className="projects-sidebar">
              <div className="projects-sidebar-head">
                <p className="projects-eyebrow">{t('projects.sectionLabel')}</p>
                <h1 className="projects-heading">Projects</h1>
                <p className="projects-count">{projects.length} {t('projects.selectedWorks')}</p>
              </div>

              <div className="projects-sidebar-list">
                {projects.map((p, i) => {
                  const isActive = p.key === active.key;
                  return (
                    <button key={p.key} type="button" className={`projects-sidebar-item ${isActive ? 'is-active' : ''}`} onClick={() => handleSelect(p.key)}>
                      <span className="projects-sidebar-id">{String(i + 1).padStart(2, '0')}</span>
                      <div className="projects-sidebar-meta">
                        <p className="projects-sidebar-title">{p.shortTitle || p.title}</p>
                        <p className="projects-sidebar-cat">{p.category}</p>
                      </div>
                      <span className={`projects-status ${p.status === 'Live' ? 'is-live' : ''}`}>{p.status}</span>
                    </button>
                  );
                })}
              </div>

              <div className="projects-sidebar-foot">
                <p>{active.screens.length} {t('projects.screens').toLowerCase()} · {active.stack.length} {t('projects.technologies').toLowerCase()}</p>
              </div>
            </aside>

            <main className="projects-main">
              <DetailPanel
                key={active.key}
                t={t}
                active={active}
                activeScreen={activeScreen}
                setActiveScreen={setActiveScreen}
              />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
