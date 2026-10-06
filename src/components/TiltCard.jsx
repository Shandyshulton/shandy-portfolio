import { useRef } from 'react';
import './TiltCard.css';

/**
 * Kartu yang miring mengikuti kursor (perspektif CSS 3D).
 * Tidak memakai state React: nilai ditulis langsung ke CSS variable,
 * jadi tidak ada re-render saat kursor bergerak.
 * Nonaktif otomatis untuk layar sentuh & prefers-reduced-motion.
 */
export default function TiltCard({ children, className = '', max = 9, ...rest }) {
  const ref = useRef(null);

  const canTilt = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e) => {
    if (!canTilt()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(px - 0.5) * 2 * max}deg`);
    el.style.setProperty('--rx', `${-(py - 0.5) * 2 * max}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
    el.dataset.active = 'true';
  };

  const onLeave = () => {
    const el = ref.current;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
    el.dataset.active = 'false';
  };

  return (
    <div className={`tilt ${className}`} ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      <div className="tilt-inner">{children}</div>
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}
