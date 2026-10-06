import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Grid,
  MeshDistortMaterial,
  PerformanceMonitor,
  RoundedBox,
  Sparkles,
} from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { STACK_FLAT } from './stack.js';
import { frame, onFrameChange, setUi, useSceneUi } from './store.js';

/* ── Palet per tema ─────────────────────────────────────────────────────── */
const PALETTE = {
  dark: {
    bg: '#070816',
    core: '#ff6a3d',
    coreEmissive: '#ff4d1a',
    coreGlow: 1.7,
    shell: '#9fb8ff',
    shellOpacity: 0.32,
    nodeBody: '#0e1230',
    nodeOpacity: 0.62,
    gridCell: '#1d2154',
    gridSection: '#a8431f',
    sparkle: '#bcd0ff',
    ambient: 0.35,
    bloom: 0.95,
  },
  light: {
    bg: '#e8ecf7',
    core: '#ff6a3d',
    coreEmissive: '#ff5a2a',
    coreGlow: 0.55,
    shell: '#3d4fd0',
    shellOpacity: 0.4,
    nodeBody: '#ffffff',
    nodeOpacity: 0.78,
    gridCell: '#b4bcdc',
    gridSection: '#e0552a',
    sparkle: '#4f5fd6',
    ambient: 1.2,
    bloom: 0,
  },
};

/* ── Layout: posisi/skala grup scene untuk tiap "stage" ─────────────────── */
// Desktop/landscape: objek di sisi kanan, teks di kiri.
const WIDE = {
  stages: [
    { p: [2.5, 0.1, 0], s: 0.9 },      // hero
    { p: [2.8, -0.1, 0.5], s: 0.98 },   // skills — mendekat
    { p: [0.4, 0.2, -8.5], s: 0.9 },    // about — mundur jadi ambient
  ],
  other: { p: [4.6, 1.6, -5], s: 0.7 },
};
// Portrait/mobile: objek di atas, teks di bawahnya.
const TALL = {
  stages: [
    { p: [0, 2.1, -1.5], s: 0.62 },
    { p: [0, 2.4, -1], s: 0.68 },
    { p: [0, 1.4, -7], s: 0.7 },
  ],
  other: { p: [0, 3.0, -6], s: 0.5 },
};

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Geometri kerangka (cage) dipakai bersama oleh semua node. */
const CAGE_GEO = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.64, 0.64, 0.64));

/* ── Inti kristal ───────────────────────────────────────────────────────── */
function Core({ palette, reduced }) {
  const shell = useRef();
  const inner = useRef();

  useFrame((_, dt) => {
    if (reduced) return;
    shell.current.rotation.y += dt * 0.12;
    shell.current.rotation.x += dt * 0.05;
    inner.current.rotation.y -= dt * 0.18;
  });

  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.05, 1]} />
        <MeshDistortMaterial
          color={palette.core}
          emissive={palette.coreEmissive}
          emissiveIntensity={palette.coreGlow}
          roughness={0.3}
          metalness={0.25}
          distort={0.26}
          speed={reduced ? 0 : 1.5}
          flatShading
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.62, 1]} />
        <meshBasicMaterial color={palette.shell} wireframe transparent opacity={palette.shellOpacity} />
      </mesh>
      <pointLight color="#ff7a45" intensity={55} distance={16} decay={2} />
    </group>
  );
}

/* ── Label node: sprite bergambar canvas (tanpa DOM, tanpa font eksternal di WebGL) ── */
const LABEL_PX = 64; // tinggi canvas label (pixel); lebar mengikuti teks
const LABEL_UNIT = 0.00046; // sizeAttenuation=false → ukuran di layar konstan // pixel → unit dunia

function drawLabel(text, color, active, theme) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = '500 28px "DM Mono", ui-monospace, monospace';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 44;
  canvas.width = w;
  canvas.height = LABEL_PX;
  ctx.font = font;

  const r = LABEL_PX / 2 - 2;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, LABEL_PX - 4, r);
  const dark = theme === 'dark';
  ctx.fillStyle = active ? color : dark ? 'rgba(10,12,32,0.78)' : 'rgba(255,255,255,0.88)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = active ? color : `${color}99`;
  ctx.stroke();

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = active ? '#0a0c20' : dark ? '#dfe6ff' : '#1c2140';
  ctx.fillText(text, w / 2, LABEL_PX / 2 + 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, w };
}

/** Dua tekstur (normal & aktif) per label; dibuat ulang saat tema/font berubah. */
function useLabelTextures(item, theme, fontsReady) {
  const textures = useMemo(() => {
    void fontsReady; // gambar ulang setelah font DM Mono siap
    return {
      normal: drawLabel(item.label, item.color, false, theme),
      active: drawLabel(item.label, item.color, true, theme),
    };
  }, [item, theme, fontsReady]);

  useEffect(
    () => () => {
      textures.normal.tex.dispose();
      textures.active.tex.dispose();
    },
    [textures],
  );
  return textures;
}

/* ── Satu node tech stack ───────────────────────────────────────────────── */
function StackNode({ item, radius, angle, palette, theme, fontsReady, reduced }) {
  const group = useRef();
  const body = useRef();
  const label = useRef();
  const active = useSceneUi((s) => s.hovered === item.id);
  const { normal, active: activeTex } = useLabelTextures(item, theme, fontsReady);
  const tex = active ? activeTex : normal;

  useFrame((_, dt) => {
    const k = reduced ? 1000 : 6;
    const target = active ? 1.4 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, target, k, dt);
    group.current.scale.setScalar(s);
    if (!reduced) {
      body.current.rotation.x += dt * 0.35;
      body.current.rotation.y += dt * 0.5;
    }
    // Label hanya tampil di Home (hero → skills), memudar saat masuk about.
    if (label.current) {
      const base = frame.isHome ? clamp01(1 - (frame.stage - 1) * 1.6) : 0;
      label.current.material.opacity = base;
      label.current.visible = base > 0.01;
    }
  });

  return (
    <group ref={group} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
      <group ref={body}>
        <RoundedBox args={[0.46, 0.46, 0.46]} radius={0.075} smoothness={3}>
          <meshStandardMaterial
            color={palette.nodeBody}
            metalness={0.85}
            roughness={0.18}
            transparent
            opacity={palette.nodeOpacity}
            envMapIntensity={1.1}
          />
        </RoundedBox>
        <mesh>
          <octahedronGeometry args={[0.14, 0]} />
          <meshBasicMaterial color={item.color} toneMapped={false} />
        </mesh>
        <lineSegments geometry={CAGE_GEO}>
          <lineBasicMaterial color={item.color} toneMapped={false} transparent opacity={active ? 1 : 0.7} />
        </lineSegments>
      </group>
      {/* Hit area sedikit lebih besar supaya mudah di-hover */}
      <mesh
        visible={false}
        onPointerOver={() => setUi({ hovered: item.id })}
        onPointerOut={() => setUi({ hovered: null })}
      >
        <sphereGeometry args={[0.5, 8, 8]} />
      </mesh>
      <sprite ref={label} position={[0, -0.56, 0]} scale={[tex.w * LABEL_UNIT, LABEL_PX * LABEL_UNIT, 1]}>
        <spriteMaterial map={tex.tex} color={theme === 'dark' ? '#c4c8d8' : '#ffffff'} transparent depthWrite={false} sizeAttenuation={false} />
      </sprite>
    </group>
  );
}

/** Satu cincin yang berputar; berisi sebagian node dari STACK_FLAT. */
function Ring({ groupIndex, radius, tilt, speed, palette, theme, fontsReady, reduced }) {
  const ref = useRef();
  const items = useMemo(() => STACK_FLAT.filter((n) => n.group === groupIndex), [groupIndex]);

  useFrame((_, dt) => {
    if (!reduced) ref.current.rotation.y += dt * speed;
  });

  return (
    <group rotation={tilt}>
      <group ref={ref} rotation={[0, groupIndex * 0.6, 0]}>
        {items.map((item) => (
          <StackNode
            key={item.id}
            item={item}
            radius={radius}
            angle={(item.index / item.count) * Math.PI * 2}
            palette={palette}
            theme={theme}
            fontsReady={fontsReady}
            reduced={reduced}
          />
        ))}
      </group>
    </group>
  );
}

/* ── Rig: memindahkan scene & kamera mengikuti scroll / rute / kursor ───── */
function Rig({ children, reduced }) {
  const root = useRef();

  useFrame((state, dt) => {
    const { camera, size } = state;
    const k = reduced ? 1000 : 2.6;
    const layout = size.width / size.height < 0.95 ? TALL : WIDE;
    let target;

    if (frame.isHome) {
      const stage = Math.min(Math.max(frame.stage, 0), 2);
      const i = Math.min(Math.floor(stage), 1);
      const f = smooth(stage - i);
      const a = layout.stages[i];
      const b = layout.stages[i + 1];
      target = {
        p: a.p.map((v, n) => v + (b.p[n] - v) * f),
        s: a.s + (b.s - a.s) * f,
      };
    } else {
      target = layout.other;
    }

    const r = root.current;
    r.position.x = THREE.MathUtils.damp(r.position.x, target.p[0], k, dt);
    r.position.y = THREE.MathUtils.damp(r.position.y, target.p[1], k, dt);
    r.position.z = THREE.MathUtils.damp(r.position.z, target.p[2], k, dt);
    const s = THREE.MathUtils.damp(r.scale.x, target.s, k, dt);
    r.scale.setScalar(s);

    // Parallax kursor
    const px = reduced ? 0 : state.pointer.x;
    const py = reduced ? 0 : state.pointer.y;
    r.rotation.y = THREE.MathUtils.damp(r.rotation.y, px * 0.3, 3, dt);
    r.rotation.x = THREE.MathUtils.damp(r.rotation.x, -py * 0.14, 3, dt);

    // Kamera: mendekat saat skills, menjauh di halaman lain
    const stage = frame.isHome ? Math.min(Math.max(frame.stage, 0), 2) : 2;
    const camZ = frame.isHome ? 10 - smooth(clamp01(stage)) * 0.7 + smooth(clamp01(stage - 1)) * 1.2 : 11;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.45, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py * 0.3, 2.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, camZ, k, dt);
    camera.lookAt(0, 0, 0);
  });

  return <group ref={root}>{children}</group>;
}

/** Mode reduced-motion memakai frameloop="demand": render ulang saat state berubah. */
function Invalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const off = onFrameChange(() => {
      invalidate();
      // beberapa frame tambahan supaya damping/layout sempat settle
      setTimeout(invalidate, 50);
    });
    return off;
  }, [invalidate]);
  return null;
}

/* ── Environment map ringan: panel cahaya → PMREM (tanpa loader HDR/gainmap dari drei) ── */
const ENV_PANELS = [
  { color: '#ff7a45', k: 2.4, pos: [-4, 2, 3], size: [6, 4] },
  { color: '#6d8bff', k: 2.0, pos: [5, -1, -3], size: [6, 5] },
  { color: '#ffffff', k: 1.4, pos: [0, 5, 0], size: [5, 5], rotX: Math.PI / 2 },
];

function StudioEnvironment() {
  const get = useThree((s) => s.get);

  useEffect(() => {
    const { gl, scene } = get();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color('#05060f');
    const disposables = [];
    ENV_PANELS.forEach(({ color, k, pos, size, rotX }) => {
      const geo = new THREE.PlaneGeometry(size[0], size[1]);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      if (rotX) mesh.rotation.x = rotX;
      else mesh.lookAt(0, 0, 0);
      envScene.add(mesh);
      disposables.push(geo, mat);
    });
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(envScene, 0.04);
    scene.environment = target.texture;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      disposables.forEach((d) => d.dispose());
    };
  }, [get]);

  return null;
}

/* ── Root scene ─────────────────────────────────────────────────────────── */
export default function Scene3D({ theme = 'dark', reduced = false }) {
  const palette = PALETTE[theme] ?? PALETTE.dark;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  // 2 = penuh, 1 = tanpa MSAA, 0 = tanpa postprocessing. Turun otomatis jika FPS jelek.
  // Bisa dipaksa lewat ?quality=0|1|2 (berguna untuk debugging di perangkat tertentu).
  const [quality, setQuality] = useState(() => {
    const forced = Number(new URLSearchParams(window.location.search).get('quality'));
    return [0, 1, 2].includes(forced) && window.location.search.includes('quality') ? forced : isMobile ? 1 : 2;
  });
  const usePost = quality >= 1 && palette.bloom > 0;

  // Gambar ulang label setelah font DM Mono selesai dimuat.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    document.fonts?.load('500 28px "DM Mono"').finally(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Canvas
      className="scene-canvas"
      frameloop={reduced ? 'demand' : 'always'}
      dpr={quality >= 2 ? [1, 1.75] : quality === 1 ? [1, 1.25] : 1}
      camera={{ position: [0, 0, 10], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: !usePost, powerPreference: 'high-performance', alpha: false }}
      eventSource={document.body}
      eventPrefix="client"
    >
      <PerformanceMonitor onDecline={() => setQuality((q) => Math.max(0, q - 1))} />
      {reduced && <Invalidator />}

      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 10, 26]} />

      <ambientLight intensity={palette.ambient} />
      <directionalLight position={[-6, 5, 4]} intensity={1.1} color="#9fb8ff" />

      <StudioEnvironment />

      <Rig reduced={reduced}>
        <Core palette={palette} reduced={reduced} />
        {/* Cincin dalam = frontend, cincin luar = backend & tools */}
        <Ring groupIndex={0} radius={2.55} tilt={[0.5, 0, 0.28]} speed={0.16} palette={palette} theme={theme} fontsReady={fontsReady} reduced={reduced} />
        <Ring groupIndex={1} radius={3.45} tilt={[-0.38, 0, -0.32]} speed={-0.11} palette={palette} theme={theme} fontsReady={fontsReady} reduced={reduced} />
      </Rig>

      <Grid
        position={[0, -3.9, 0]}
        args={[40, 40]}
        cellSize={0.7}
        cellThickness={0.6}
        cellColor={palette.gridCell}
        sectionSize={3.5}
        sectionThickness={1}
        sectionColor={palette.gridSection}
        fadeDistance={26}
        fadeStrength={1.6}
        infiniteGrid
      />

      <Sparkles
        count={isMobile ? 50 : 110}
        scale={[18, 10, 12]}
        size={2.4}
        speed={reduced ? 0 : 0.25}
        opacity={0.7}
        color={palette.sparkle}
      />

      {usePost && (
        <EffectComposer multisampling={quality >= 2 ? 4 : 0}>
          <Bloom mipmapBlur intensity={palette.bloom} luminanceThreshold={0.55} luminanceSmoothing={0.25} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
