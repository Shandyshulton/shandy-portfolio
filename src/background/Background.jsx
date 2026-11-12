import { useEffect, useRef } from 'react';
import './background.css';

// PRNG deterministik (mulberry32) → tata letak bintang stabil tiap muat.
function mulberry32(a) {
  return () => {
    a |= 0; a = a + 0x6d2b79f5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Latar antariksa ringan: nebula (CSS) + bintang & konstelasi (Canvas 2D, bukan WebGL).
 * Hemat: DPR dibatasi, FPS dibatasi, loop dijeda saat tab tersembunyi / canvas di
 * luar viewport, dan dibekukan (satu frame) bila pengguna memilih reduced-motion.
 */
export default function Background({ theme = 'dark' }) {
  const ref = useRef(null);
  const themeRef = useRef(theme);
  const drawRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const minMs = 1000 / (isMobile ? 24 : 40);
    const rnd = mulberry32(0x9e3779b9);

    let w = 0, h = 0, raf = 0, last = 0, running = false;
    let stars = [], nodes = [], links = [], meteors = [];
    let prevT = 0, nextMeteor = 1200;
    let visible = !document.hidden, onScreen = true;
    const ptr = { x: 0, y: 0 };

    const build = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(40, Math.min(isMobile ? 90 : 170, Math.round((w * h) / 11000)));
      stars = Array.from({ length: count }, () => ({
        x: rnd() * w, y: rnd() * h, r: 0.4 + rnd() * 1.2,
        d: 0.15 + rnd() * 0.85, b: Math.floor(rnd() * 3),
        c: rnd() > 0.3 ? 0 : 1, // 0 = putih, 1 = cyan neon
      }));
      // Konstelasi: gugusan bintang (kanan-atas) + garis ke 2 tetangga terdekat.
      nodes = Array.from({ length: 9 }, () => ({
        x: w * (0.42 + rnd() * 0.5), y: h * (0.12 + rnd() * 0.55),
        r: 1 + rnd() * 1.2, tw: rnd() * 6.283, s: 0.5 + rnd() * 1.4,
      }));
      links = [];
      nodes.forEach((a, i) => {
        nodes.map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
          .filter((o) => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 2)
          .forEach(({ j }) => {
            const key = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (!links.some((l) => l.key === key)) links.push({ key, a: i, b: j });
          });
      });
    };

    // Shooting star / meteor: muncul berkala di kanan-atas, jatuh diagonal ke kiri-bawah.
    const spawnMeteor = () => {
      const speed = 620 + rnd() * 520;
      const ang = 0.42 + rnd() * 0.28; // sudut dari horizontal (rad)
      const life = 1.3 + rnd() * 0.7;
      meteors.push({
        x: w * (0.45 + rnd() * 0.6), y: -40,
        vx: -Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
        len: 90 + rnd() * 130, life, t0: life,
      });
    };

    const draw = (t) => {
      const light = themeRef.current === 'light';
      const COLS = light ? ['84,98,128', '2,132,199'] : ['255,255,255', '56,189,248'];
      const lineRgb = light ? '2,132,199' : '56,189,248';
      const dts = Math.min((t - prevT) / 1000, 0.05); prevT = t;
      const sy = window.scrollY || 0;
      const px = ptr.x * 14, py = ptr.y * 10;
      ctx.clearRect(0, 0, w, h);
      // Bintang dikelompokkan (2 warna × 3 kecerahan) → hanya 6 path/fill per frame.
      const buckets = [[], [], [], [], [], []];
      for (const s of stars) {
        let y = (s.y - sy * s.d * 0.06 + py * s.d) % h; if (y < 0) y += h;
        let x = (s.x + px * s.d) % w; if (x < 0) x += w;
        buckets[s.c * 3 + s.b].push(x, y, s.r);
      }
      const base = [0.26, 0.5, 0.85];
      for (let k = 0; k < 6; k++) {
        const arr = buckets[k];
        if (!arr.length) continue;
        const ci = k < 3 ? 0 : 1, bi = k % 3;
        const tw = 0.85 + 0.15 * Math.sin(t * 0.0008 + bi * 2 + ci);
        ctx.fillStyle = `rgba(${COLS[ci]},${(base[bi] * tw).toFixed(3)})`;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 3) {
          ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1]);
          ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, 6.2832);
        }
        ctx.fill();
      }
      // Konstelasi: garis + bintang berkedip.
      const ox = ptr.x * 22, oy = ptr.y * 16 - sy * 0.02;
      ctx.strokeStyle = `rgba(${lineRgb},0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const l of links) {
        const A = nodes[l.a], B = nodes[l.b];
        ctx.moveTo(A.x + ox, A.y + oy); ctx.lineTo(B.x + ox, B.y + oy);
      }
      ctx.stroke();
      for (const n of nodes) {
        const a = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.0012 * n.s + n.tw));
        ctx.fillStyle = `rgba(${COLS[0]},${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(n.x + ox, n.y + oy, n.r, 0, 6.2832); ctx.fill();
      }
      // Meteor: spawn berkala + gerak + gambar ekor bergradien.
      if (t > nextMeteor) { spawnMeteor(); nextMeteor = t + 3500 + rnd() * 6000; }
      ctx.lineCap = 'round';
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx * dts; m.y += m.vy * dts; m.life -= dts;
        if (m.life <= 0 || m.x < -180 || m.y > h + 180) { meteors.splice(i, 1); continue; }
        const sp = Math.hypot(m.vx, m.vy) || 1;
        const tx = m.x - (m.vx / sp) * m.len, ty = m.y - (m.vy / sp) * m.len;
        const a = Math.min(1, m.life / m.t0);
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, `rgba(226,244,255,${(0.9 * a).toFixed(3)})`);
        g.addColorStop(0.4, `rgba(56,189,248,${(0.5 * a).toFixed(3)})`);
        g.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${(0.95 * a).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.6, 0, 6.2832); ctx.fill();
      }
    };
    drawRef.current = draw;

    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (t - last < minMs) return;
      last = t;
      draw(t);
    };
    const ensureRunning = () => {
      if (reduced || running || !visible || !onScreen) return;
      running = true; last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      if (!running) return;
      running = false; cancelAnimationFrame(raf); raf = 0;
    };

    const onVis = () => { visible = !document.hidden; visible && onScreen ? ensureRunning() : stopLoop(); };
    const onMove = (e) => { ptr.x = (e.clientX / window.innerWidth) * 2 - 1; ptr.y = (e.clientY / window.innerHeight) * 2 - 1; };
    const onResize = () => { build(); if (!running) draw(performance.now()); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen && visible ? ensureRunning() : stopLoop(); }, { threshold: 0 });
    io.observe(canvas);

    build();
    document.documentElement.dataset.scene = reduced ? 'static' : 'on';
    if (reduced) draw(performance.now());
    else ensureRunning();

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    themeRef.current = theme;
    drawRef.current?.(performance.now());
  }, [theme]);

  return (
    <>
      <div className="bg-nebula" aria-hidden="true" />
      <canvas ref={ref} className="bg-canvas" aria-hidden="true" />
    </>
  );
}
