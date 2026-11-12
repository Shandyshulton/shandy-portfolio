import { useEffect, useRef } from 'react';
import './SpaceShuttle.css';

// 6 pesawat, masing-masing dengan lintasan & heading berbeda (kiri/kanan/atas/bawah,
// diagonal ke segala arah). `r` = sudut hadap (deg) agar hidung searah gerak.
const SHUTTLES = [
  { x0: '-14vw', y0: '92vh', x1: '110vw', y1: '-16vh', r: '49deg', dur: '24s', delay: '0s', sc: 0.7 },
  { x0: '112vw', y0: '10vh', x1: '-16vw', y1: '64vh', r: '-113deg', dur: '28s', delay: '4s', sc: 0.55 },
  { x0: '108vw', y0: '-12vh', x1: '-12vw', y1: '105vh', r: '-134deg', dur: '30s', delay: '9s', sc: 0.62 },
  { x0: '-16vw', y0: '74vh', x1: '112vw', y1: '34vh', r: '73deg', dur: '22s', delay: '2s', sc: 0.5 },
  { x0: '-12vw', y0: '-14vh', x1: '105vw', y1: '96vh', r: '133deg', dur: '26s', delay: '13s', sc: 0.66 },
  { x0: '112vw', y0: '96vh', x1: '-14vw', y1: '-14vh', r: '-49deg', dur: '25s', delay: '7s', sc: 0.58 },
];

/**
 * Armada pesawat ulang-alik kecil yang melintas dari berbagai arah, lengkap dengan
 * api dorongan berkedip dan parallax halus mengikuti kursor. Murni dekoratif
 * (aria-hidden, pointer-events: none); semua diam saat prefers-reduced-motion.
 */
export default function SpaceShuttle() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty('--sx', `${(nx * 18).toFixed(1)}px`);
        el.style.setProperty('--sy', `${(ny * 14).toFixed(1)}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="shuttle-layer" ref={ref} aria-hidden="true">
      {SHUTTLES.map((s, i) => (
        <div
          className="shuttle"
          key={i}
          style={{
            '--x0': s.x0, '--y0': s.y0, '--x1': s.x1, '--y1': s.y1,
            '--r': s.r, '--dur': s.dur, '--delay': s.delay, '--sc': s.sc,
          }}
        >
          <svg className="shuttle-svg" viewBox="0 0 64 64" width="54" height="54" focusable="false">
            <defs>
              <linearGradient id={`shuttleFlame-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="0.5" stopColor="#a855f7" stopOpacity="0.75" />
                <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* api dorongan (di belakang pesawat) */}
            <g className="shuttle-flame">
              <path d="M32 40 C27 50 27 58 32 63 C37 58 37 50 32 40 Z" fill={`url(#shuttleFlame-${i})`} />
            </g>
            {/* sayap */}
            <path d="M24 33 L11 46 L24 44 Z" fill="#93c5fd" stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M40 33 L53 46 L40 44 Z" fill="#93c5fd" stroke="#38bdf8" strokeWidth="1.2" />
            {/* badan pesawat */}
            <path d="M32 3 C37 12 40 26 40 42 L24 42 C24 26 27 12 32 3 Z" fill="#dbeafe" stroke="#38bdf8" strokeWidth="1.5" />
            {/* jendela kokpit */}
            <circle cx="32" cy="19" r="3.4" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1" />
          </svg>
        </div>
      ))}
    </div>
  );
}
