import { useEffect, useRef, useState } from 'react';

// Hook: deteksi elemen masuk viewport (untuk scroll-reveal).
function useInView() {
  const ref = useRef(null);
  const supportsIo = typeof IntersectionObserver !== 'undefined';
  const [inView, setInView] = useState(!supportsIo);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return [ref, inView];
}

// Wrapper reveal: elemen muncul halus saat di-scroll ke arahnya.
// Styling ada di index.css (class .rv / .rv-in) — dipakai lintas halaman.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`rv ${inView ? 'rv-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
