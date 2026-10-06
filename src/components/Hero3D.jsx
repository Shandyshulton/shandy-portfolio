import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import './Hero3D.css';

// Tiga lapisan = tiga sisi kerja Full Stack: UI -> API -> Database.
const LAYERS = [
  { key: 'ui', label: 'UI', sub: 'React · Tailwind', tone: 'accent' },
  { key: 'api', label: 'API', sub: 'Laravel · Go', tone: 'mid' },
  { key: 'db', label: 'Database', sub: 'MySQL', tone: 'deep' },
];

const W = 3.4;
const D = 2.3;
const H = 0.3;
const CAM_Z = 11.5;
const FOV = 30;

// Pose scene per section: 0 = hero, 1 = skills, 2 = about.
// x/y dalam fraksi lebar/tinggi viewport 3D; op = opasitas canvas.
const POSES_WIDE = [
  { spread: 0.62, rotY: -0.62, x: 0.2, y: 0, scale: 1, op: 1, labels: 1 },
  { spread: 1.1, rotY: -0.38, x: 0.21, y: 0, scale: 0.88, op: 1, labels: 1 },
  { spread: 0.02, rotY: 0.5, x: 0, y: 0, scale: 1.3, op: 0.17, labels: 0 },
];
const POSES_TALL = [
  { spread: 0.62, rotY: -0.62, x: -0.11, y: 0.2, scale: 0.9, op: 1, labels: 1 },
  { spread: 1.0, rotY: -0.4, x: -0.06, y: 0.2, scale: 0.85, op: 0.16, labels: 0 },
  { spread: 0.02, rotY: 0.5, x: 0, y: 0, scale: 1.2, op: 0.12, labels: 0 },
];
const POSE_KEYS = ['spread', 'rotY', 'x', 'y', 'scale', 'op', 'labels'];
const smooth = (t) => t * t * (3 - 2 * t);

function poseAt(poses, p) {
  const i = Math.max(0, Math.min(poses.length - 2, Math.floor(p)));
  const f = smooth(Math.max(0, Math.min(1, p - i)));
  const out = {};
  POSE_KEYS.forEach((k) => { out[k] = poses[i][k] + (poses[i + 1][k] - poses[i][k]) * f; });
  return out;
}

// Ambil warna dari CSS variable agar otomatis ikut tema light/dark.
function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const get = (name, fb) => cs.getPropertyValue(name).trim() || fb;
  const accent = new THREE.Color(get('--accent', '#c8522a'));
  const surface = new THREE.Color(get('--surface', '#ffffff'));
  const bg2 = new THREE.Color(get('--bg-2', '#eae6de'));
  const text = new THREE.Color(get('--text', '#1a1714'));
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    accent,
    mid: dark ? surface.clone().lerp(accent, 0.12) : bg2.clone().lerp(surface, 0.65),
    deep: dark ? bg2.clone().lerp(text, 0.1) : text.clone().lerp(bg2, 0.82),
    detail: dark ? text.clone().lerp(bg2, 0.55) : surface.clone(),
    dark,
  };
}

function usePalette() {
  const [palette, setPalette] = useState(readPalette);
  useEffect(() => {
    const mo = new MutationObserver(() => setPalette(readPalette()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return palette;
}

// Detail kecil di atas tiap slab supaya terbaca sebagai UI / API / DB.
function LayerDetail({ type, color }) {
  const mat = <meshStandardMaterial color={color} roughness={0.6} metalness={0.02} />;
  if (type === 'ui') {
    return (
      <group position={[0, H / 2 + 0.02, 0]}>
        <RoundedBox args={[1.5, 0.05, 0.28]} radius={0.02} smoothness={3} position={[-0.7, 0, -0.55]}>{mat}</RoundedBox>
        <RoundedBox args={[2.6, 0.05, 0.7]} radius={0.02} smoothness={3} position={[0, 0, 0.1]}>{mat}</RoundedBox>
        <RoundedBox args={[0.9, 0.05, 0.28]} radius={0.02} smoothness={3} position={[0.9, 0, 0.7]}>{mat}</RoundedBox>
      </group>
    );
  }
  if (type === 'api') {
    return (
      <group position={[0, H / 2 + 0.02, 0]}>
        {[-0.9, 0, 0.9].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
            {mat}
          </mesh>
        ))}
        <RoundedBox args={[1.8, 0.03, 0.06]} radius={0.01} smoothness={2} position={[0, 0, 0]}>{mat}</RoundedBox>
      </group>
    );
  }
  return (
    <group position={[0, H / 2 + 0.02, 0]}>
      {[-0.6, 0, 0.6].map((z) => (
        <RoundedBox key={z} args={[2.3, 0.04, 0.3]} radius={0.015} smoothness={3} position={[0, 0, z]}>{mat}</RoundedBox>
      ))}
    </group>
  );
}

function Scene({ interactive, reduced, progressRef, activeRef, fadeRef, wrapRef, labelRefs }) {
  const group = useRef();
  const slabs = useRef([]);
  const mats = useRef([]);
  const palette = usePalette();
  const { invalidate } = useThree();
  const target = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!interactive) return undefined;
    const onMove = (e) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive]);

  // Warna emissive (efek sorot lapisan) mengikuti aksen tema.
  useEffect(() => {
    mats.current.forEach((m) => { if (m) m.emissive.copy(palette.accent); });
    invalidate();
  }, [palette, invalidate]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const k = reduced ? 1 : 1 - Math.pow(0.002, delta); // damping independen frame-rate
    const { width, height } = state.size;
    const aspect = width / height;
    const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
    const viewW = viewH * aspect;
    const fit = Math.min(1, viewW / 6.2); // layar sempit -> objek mengecil

    const pose = poseAt(aspect < 1 ? POSES_TALL : POSES_WIDE, progressRef.current);

    // Posisi & skala keseluruhan scene
    const g = group.current;
    g.position.x = THREE.MathUtils.lerp(g.position.x, pose.x * viewW, k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, pose.y * viewH, k);
    const sc = pose.scale * fit;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, sc, k));

    // Rotasi: pose dasar + parallax kursor
    const ry = pose.rotY + (interactive ? target.current.x * 0.3 + Math.sin(t * 0.25) * 0.05 : 0);
    const rx = interactive ? target.current.y * 0.07 : 0;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, ry, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, rx, k);

    // Lapisan: jarak antar slab, sorotan saat baris stack di-hover
    const active = activeRef.current;
    slabs.current.forEach((slab, i) => {
      if (!slab) return;
      const lift = active === i ? 0.16 : 0;
      const float = interactive ? Math.sin(t * 0.8 + i * 0.9) * 0.025 : 0;
      slab.position.y = THREE.MathUtils.lerp(slab.position.y, (1 - i) * pose.spread + lift + float, k);
      const m = mats.current[i];
      if (m) m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, active === i ? 0.32 : 0, k);
    });

    // Opasitas canvas (pose + fade sebelum footer)
    if (wrapRef.current) wrapRef.current.style.opacity = String(pose.op * fadeRef.current);

    // Proyeksikan sudut kanan tiap lapisan ke layar -> posisi label DOM.
    g.updateWorldMatrix(true, true);
    slabs.current.forEach((slab, i) => {
      const el = labelRefs.current[i];
      if (!slab || !el) return;
      tmp.set(W / 2 + 0.12, -0.02, D / 2 - 0.1);
      slab.localToWorld(tmp);
      tmp.project(state.camera);
      const x = (tmp.x * 0.5 + 0.5) * width;
      const y = (-tmp.y * 0.5 + 0.5) * height;
      el.style.transform = `translate(${x}px, ${y}px) translateY(-50%)`;
      el.style.opacity = String(pose.labels);
    });
  });

  const colors = { accent: palette.accent, mid: palette.mid, deep: palette.deep };

  return (
    <>
      <hemisphereLight args={[palette.dark ? '#c9b8ae' : '#fff7ef', palette.dark ? '#0e0c0b' : '#cfc6b8', palette.dark ? 0.6 : 1.05]} />
      <directionalLight position={[4, 6, 3]} intensity={palette.dark ? 1.4 : 1.7} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color={palette.accent} />

      <group ref={group} rotation={[0, -0.62, 0]}>
        {LAYERS.map((layer, i) => (
          <group key={layer.key} ref={(el) => { slabs.current[i] = el; }} position={[0, (1 - i) * 0.62, 0]}>
            <RoundedBox args={[W, H, D]} radius={0.08} smoothness={4}>
              <meshStandardMaterial
                ref={(m) => { mats.current[i] = m; }}
                color={colors[layer.tone]}
                emissive={palette.accent}
                emissiveIntensity={0}
                roughness={0.55}
                metalness={0.04}
              />
            </RoundedBox>
            <LayerDetail
              type={layer.key}
              color={layer.tone === 'accent' ? palette.detail : palette.accent}
            />
          </group>
        ))}
      </group>
    </>
  );
}

// Fallback CSS: dipakai di perangkat lemah / tanpa WebGL / hemat data.
function StaticLayers() {
  return (
    <div className="h3d-static" aria-hidden="true">
      {LAYERS.map((l) => (
        <div key={l.key} className={`h3d-static-slab h3d-static-slab--${l.tone}`}>
          <b>{l.label}</b>
          <span>{l.sub}</span>
        </div>
      ))}
    </div>
  );
}

function canRender3D() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
  } catch {
    return false;
  }
  const nav = navigator;
  if (nav.connection?.saveData) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return false;
  return true;
}

const top = (el) => el.getBoundingClientRect().top + window.scrollY;

/**
 * Scene 3D tunggal yang menempel (fixed) di belakang halaman Home dan
 * berganti pose mengikuti scroll: hero -> skills -> about.
 * Slot hero (#hero-scene-slot) hanya dipakai untuk fallback statis.
 */
export default function Hero3D({ activeRef }) {
  const wrapRef = useRef(null);
  const labelRefs = useRef([]);
  const progressRef = useRef(0);
  const fadeRef = useRef(1);
  const invalidateRef = useRef(null);
  const [enabled] = useState(canRender3D);
  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  // Hitung progres scroll (0 hero, 1 skills, 2 about) + fade sebelum footer.
  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => {
      const skills = document.getElementById('skills');
      const about = document.getElementById('about');
      if (!skills || !about) return;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const a1 = Math.max(1, top(skills) - vh * 0.4);
      const a2 = Math.max(a1 + 1, top(about) - vh * 0.4);
      progressRef.current = y <= a1 ? y / a1 : y <= a2 ? 1 + (y - a1) / (a2 - a1) : 2;
      const aboutBottom = about.getBoundingClientRect().bottom;
      fadeRef.current = Math.max(0, Math.min(1, aboutBottom / (vh * 0.6)));
      invalidateRef.current?.();
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  if (!enabled) {
    const slot = document.getElementById('hero-scene-slot');
    return slot ? createPortal(<StaticLayers />, slot) : null;
  }

  return (
    <div ref={wrapRef} className="h3d-fixed" role="img" aria-label="Ilustrasi 3D tiga lapisan: UI, API, dan Database">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 2.6, CAM_Z], fov: FOV }}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          invalidateRef.current = invalidate;
        }}
      >
        <Scene
          interactive={!reduced}
          reduced={reduced}
          progressRef={progressRef}
          activeRef={activeRef}
          fadeRef={fadeRef}
          wrapRef={wrapRef}
          labelRefs={labelRefs}
        />
      </Canvas>
      {LAYERS.map((layer, i) => (
        <div
          key={layer.key}
          ref={(el) => { labelRefs.current[i] = el; }}
          className="h3d-label"
          aria-hidden="true"
        >
          <strong>{layer.label}</strong>
          <span>{layer.sub}</span>
        </div>
      ))}
    </div>
  );
}
