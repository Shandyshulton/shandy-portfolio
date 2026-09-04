import { useEffect, useState } from 'react';

function LoaderGlyph() {
  return (
    <div className="loader-ring" aria-hidden="true">
      <span className="loader-dot" />
      <span className="loader-dot" />
      <span className="loader-core" />
    </div>
  );
}

/**
 * Splash layar penuh saat aplikasi pertama dibuka (boot).
 * Menggantikan splash statis dari index.html setelah React siap.
 */
export function BootLoader() {
  const [phase, setPhase] = useState('boot');

  useEffect(() => {
    const t = setTimeout(() => setPhase('done'), 1500);
    return () => clearTimeout(t);
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`boot-loader ${phase === 'done' ? 'done' : ''}`} onAnimationEnd={() => setPhase('hidden')} role="status" aria-label="Loading">
      <LoaderGlyph />
      <div className="loader-text">
        <span>memuat portfolio</span>
        <span className="loader-caret">_</span>
      </div>
    </div>
  );
}

/**
 * Overlay loading untuk transisi antar-rute / saat halaman menyiapkan data.
 */
export function RouteLoader({ label }) {
  if (!label) return null;
  return (
    <div className="route-loader" role="status" aria-label={label}>
      <LoaderGlyph />
      <div className="loader-text">
        <span>{label}</span>
        <span className="loader-caret">_</span>
      </div>
    </div>
  );
}
