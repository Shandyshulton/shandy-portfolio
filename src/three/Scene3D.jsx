import { useEffect, useRef } from 'react';
import {
  AdditiveBlending, AmbientLight, BoxGeometry, BufferGeometry, CanvasTexture, Color, DirectionalLight,
  DoubleSide, EdgesGeometry, Float32BufferAttribute, Fog, GridHelper, Group, IcosahedronGeometry,
  InstancedMesh, LineBasicMaterial, LineSegments, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, OctahedronGeometry, PerspectiveCamera, PlaneGeometry, PMREMGenerator, PointLight, Points,
  PointsMaterial, Raycaster, Scene, SphereGeometry, SRGBColorSpace, Sprite, SpriteMaterial, Vector2,
  WebGLRenderer,
} from 'three';
import { STACK_FLAT } from './stack.js';
import { frame, getUi, onFrameChange, setUi } from './store.js';

const PALETTE = {
  dark: { bg: '#070816', core: '#ff6a3d', glow: 1.6, shell: '#9fb8ff', shellO: 0.32, node: '#0e1230', nodeO: 0.7, cell: '#1d2154', section: '#a8431f', spark: '#bcd0ff', amb: 0.35, glowO: 0.55 },
  light: { bg: '#e8ecf7', core: '#ff6a3d', glow: 0.5, shell: '#3d4fd0', shellO: 0.4, node: '#ffffff', nodeO: 0.8, cell: '#b4bcdc', section: '#e0552a', spark: '#4f5fd6', amb: 1.2, glowO: 0.18 },
};
// Posisi/skala scene per stage: [hero, skills, about]
const WIDE = { st: [{ p: [2.5, 0.1, 0], s: 0.9 }, { p: [2.4, -0.1, 0], s: 0.88 }, { p: [0.4, 0.2, -8.5], s: 0.9 }], other: { p: [4.6, 1.6, -5], s: 0.7 } };
const TALL = { st: [{ p: [0, 2.1, -1.5], s: 0.62 }, { p: [0, 2.4, -1], s: 0.68 }, { p: [0, 1.4, -7], s: 0.7 }], other: { p: [0, 3, -6], s: 0.5 } };
// Halaman lain: tiap rute punya jalur kamera/objek dari awal (a) ke akhir (b) halaman.
const ROUTE_POSE = {
  '/projects':   { a: { p: [4.8, 1.4, -5], s: 0.7 },   b: { p: [-4.6, 0.6, -6.5], s: 0.85 } },
  '/education':  { a: { p: [-4.6, 1.5, -5], s: 0.7 },  b: { p: [4.6, 0.4, -6], s: 0.85 } },
  '/experience': { a: { p: [4.8, 1.6, -6], s: 0.7 },   b: { p: [4.4, -1.2, -3.5], s: 0.95 } },
  '/contact':    { a: { p: [4.6, 1.6, -5.5], s: 0.7 }, b: { p: [0.2, 0.9, -2.2], s: 0.8 } },
};
const smooth = (t) => t * t * (3 - 2 * t);
const c01 = (v) => Math.min(1, Math.max(0, v));
const D = MathUtils.damp;

function drawLabel(text, color, active, dark) {
  const cv = document.createElement('canvas');
  const x = cv.getContext('2d');
  const font = '500 28px "DM Mono", ui-monospace, monospace';
  x.font = font;
  const w = Math.ceil(x.measureText(text).width) + 44;
  cv.width = w; cv.height = 64; x.font = font;
  x.beginPath(); x.roundRect(2, 2, w - 4, 60, 30);
  x.fillStyle = active ? color : dark ? 'rgba(10,12,32,0.78)' : 'rgba(255,255,255,0.88)'; x.fill();
  x.lineWidth = 2; x.strokeStyle = active ? color : `${color}99`; x.stroke();
  x.textBaseline = 'middle'; x.textAlign = 'center';
  x.fillStyle = active ? '#0a0c20' : dark ? '#dfe6ff' : '#1c2140';
  x.fillText(text, w / 2, 33);
  const tex = new CanvasTexture(cv); tex.colorSpace = SRGBColorSpace;
  return { tex, w };
}

function glowTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const x = cv.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new CanvasTexture(cv);
}

function build(canvas, theme0, reduced) {
  const isMobile = window.innerWidth < 768;
  let dprMax = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75);
  const renderer = new WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dprMax);
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0, 10);
  const fog = new Fog('#070816', 10, 26);
  scene.fog = fog;

  // Lampu + environment (panel cahaya → PMREM) untuk pantulan logam node
  const amb = new AmbientLight('#ffffff', 0.35);
  const dir = new DirectionalLight('#9fb8ff', 1.1); dir.position.set(-6, 5, 4);
  scene.add(amb, dir);
  const envScene = new Scene(); envScene.background = new Color('#05060f');
  [['#ff7a45', 2.4, [-4, 2, 3], [6, 4]], ['#6d8bff', 2, [5, -1, -3], [6, 5]], ['#ffffff', 1.4, [0, 5, 0], [5, 5], 1]].forEach(([c, k, p, s, rx]) => {
    const m = new Mesh(new PlaneGeometry(...s), new MeshBasicMaterial({ color: new Color(c).multiplyScalar(k), side: DoubleSide }));
    m.position.set(...p); if (rx) m.rotation.x = Math.PI / 2; else m.lookAt(0, 0, 0); envScene.add(m);
  });
  const pmrem = new PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;

  // Rig = grup utama yang bergerak mengikuti scroll
  const rig = new Group(); scene.add(rig);
  const coreG = new Group(); rig.add(coreG);
  const coreMat = new MeshStandardMaterial({ roughness: 0.3, metalness: 0.25, flatShading: true, toneMapped: false });
  const core = new Mesh(new IcosahedronGeometry(1.05, 1), coreMat);
  const shellMat = new MeshBasicMaterial({ wireframe: true, transparent: true });
  const shell = new Mesh(new IcosahedronGeometry(1.62, 1), shellMat);
  const gtex = glowTexture();
  const glowMat = new SpriteMaterial({ map: gtex, color: '#ff6a3d', transparent: true, depthWrite: false, blending: AdditiveBlending });
  const glow = new Sprite(glowMat); glow.scale.setScalar(6.5);
  const pl = new PointLight('#ff7a45', 55, 16, 2);
  coreG.add(core, shell, glow, pl);

  // Node tech stack: 2 cincin
  const cage = new EdgesGeometry(new BoxGeometry(0.64, 0.64, 0.64));
  const boxGeo = new BoxGeometry(0.46, 0.46, 0.46), gemGeo = new OctahedronGeometry(0.14, 0), hitGeo = new SphereGeometry(0.5, 8, 8);
  const rings = [[2.55, [0.5, 0, 0.28], 0.16], [3.45, [-0.38, 0, -0.32], -0.11]].map(([radius, tilt, speed], gi) => {
    const tg = new Group(); tg.rotation.set(...tilt);
    const spin = new Group(); spin.rotation.y = gi * 0.6; tg.add(spin); rig.add(tg);
    return { radius, speed, spin, tg };
  });
  const bodyMat = new MeshStandardMaterial({ metalness: 0.85, roughness: 0.18, transparent: true });
  const labelMats = [];
  const nodes = STACK_FLAT.map((it) => {
    const ring = rings[it.group], a = (it.index / it.count) * Math.PI * 2;
    const g = new Group(); g.position.set(Math.cos(a) * ring.radius, 0, Math.sin(a) * ring.radius);
    const body = new Group(); body.add(new Mesh(boxGeo, bodyMat), new Mesh(gemGeo, new MeshBasicMaterial({ color: it.color, toneMapped: false })));
    const lineMat = new LineBasicMaterial({ color: it.color, toneMapped: false, transparent: true, opacity: 0.7 });
    body.add(new LineSegments(cage, lineMat));
    const hit = new Mesh(hitGeo, new MeshBasicMaterial({ visible: false })); hit.userData.id = it.id;
    const sp = new Sprite(new SpriteMaterial({ transparent: true, depthWrite: false, sizeAttenuation: false })); sp.position.set(0, -0.56, 0);
    // Halo: cahaya berwarna di belakang node yang aktif (terlihat jelas di layar kecil)
    const halo = new Sprite(new SpriteMaterial({ map: gtex, color: it.color, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }));
    halo.scale.setScalar(1.9); halo.visible = false;
    g.add(halo, body, hit, sp); ring.spin.add(g); labelMats.push(sp.material);
    return { it, g, body, hit, sp, lineMat, halo, tex: null };
  });
  const setLabels = (dark) => {
    nodes.forEach((n) => {
      n.tex?.n.tex.dispose(); n.tex?.a.tex.dispose();
      n.tex = { n: drawLabel(n.it.label, n.it.color, false, dark), a: drawLabel(n.it.label, n.it.color, true, dark) };
      n.sp.material.color.set(dark ? '#c4c8d8' : '#ffffff');
      n.lastActive = null;
    });
  };

  // Shard melayang: ruang "terowongan" yang dilewati kamera saat scroll
  const shardCount = isMobile ? 40 : 80;
  const shards = new InstancedMesh(new OctahedronGeometry(0.16, 0), new MeshBasicMaterial({ color: '#ff6a3d', transparent: true, opacity: 0.4, toneMapped: false }), shardCount);
  const o = new Object3D();
  for (let i = 0; i < shardCount; i++) {
    const r = 5.5 + Math.random() * 9, a = Math.random() * 6.283;
    o.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.6, -Math.random() * 32 - 2);
    o.rotation.set(Math.random() * 3, Math.random() * 3, 0); o.scale.setScalar(0.3 + Math.random() * 0.8); o.updateMatrix();
    shards.setMatrixAt(i, o.matrix);
  }
  scene.add(shards);

  const grid = new GridHelper(60, 86, '#a8431f', '#1d2154'); grid.position.y = -3.9; scene.add(grid);
  const sp = new Float32Array((isMobile ? 50 : 110) * 3).map((_, i) => (i % 3 === 0 ? 18 : i % 3 === 1 ? 10 : 12) * (Math.random() - 0.5));
  const sGeo = new BufferGeometry(); sGeo.setAttribute('position', new Float32BufferAttribute(sp, 3));
  const sparks = new Points(sGeo, new PointsMaterial({ size: 0.05, transparent: true, opacity: 0.7 })); scene.add(sparks);

  const applyTheme = (theme) => {
    const P = PALETTE[theme] ?? PALETTE.dark, dark = theme !== 'light';
    scene.background = new Color(P.bg); fog.color.set(P.bg); amb.intensity = P.amb;
    coreMat.color.set(P.core); coreMat.emissive.set(P.core); coreMat.emissiveIntensity = P.glow;
    shellMat.color.set(P.shell); shellMat.opacity = P.shellO;
    glowMat.opacity = P.glowO; bodyMat.color.set(P.node); bodyMat.opacity = P.nodeO;
    grid.material.transparent = true; grid.material.opacity = dark ? 0.9 : 0.3;
    sparks.material.color.set(P.spark); shards.material.color.set(dark ? '#ff6a3d' : '#3d4fd0');
    setLabels(dark);
  };
  applyTheme(theme0);
  document.fonts?.load('500 28px "DM Mono"').then(() => applyTheme(getUi().theme));

  // Input
  let dirty = 8;
  const ptr = new Vector2(), ray = new Raycaster();
  const touchOnly = window.matchMedia?.('(hover: none)').matches;
  const onMove = (e) => { ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); dirty = 8; };
  // Layar sentuh: tap pada node 3D = pilih node (tanpa hover)
  const onDown = (e) => {
    onMove(e);
    if (e.pointerType === 'mouse' || !frame.isHome || frame.stage > 1.3) return;
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(nodes.map((n) => n.hit), false)[0];
    if (hit) { setUi({ hovered: hit.object.userData.id }); window.dispatchEvent(new CustomEvent('stack-pick')); }
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  const resize = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = 8;
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  let prog = 0, raf = 0, last = performance.now(), slow = 0, cur = frame.stage, prevHover = null;
  const offFrame = onFrameChange(() => { dirty = 30; });

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (reduced && dirty <= 0) return;
    dirty -= 1;

    // Auto-turunkan resolusi jika FPS buruk
    if (!reduced) { slow = dt > 0.034 ? slow + 1 : Math.max(0, slow - 1); if (slow > 45 && dprMax > 1) { dprMax = 1; renderer.setPixelRatio(1); slow = 0; } }

    const k = reduced ? 1000 : 2.6, ui = getUi();
    const L = innerWidth / innerHeight < 0.95 ? TALL : WIDE;
    const target = frame.isHome ? c01(frame.stage / 2) * 2 : 2;
    const prev = cur; cur = D(cur, target, k, dt);
    const vel = Math.min(Math.abs(cur - prev) / Math.max(dt, 0.001), 3); // kecepatan scroll → efek dinamis

    prog = D(prog, frame.isHome ? 0 : frame.progress, reduced ? 1000 : 3, dt);
    const pf = smooth(prog);
    let tp, ts;
    if (frame.isHome) {
      const i = Math.min(Math.floor(cur), 1), f = smooth(cur - i), a = L.st[i], b = L.st[i + 1];
      tp = a.p.map((v, n) => v + (b.p[n] - v) * f); ts = a.s + (b.s - a.s) * f;
    } else if (L === TALL) {
      tp = [0, L.other.p[1] - pf * 0.9, L.other.p[2] - pf * 2]; ts = L.other.s;
    } else {
      const r = ROUTE_POSE[frame.route] ?? { a: L.other, b: L.other };
      tp = r.a.p.map((v, n) => v + (r.b.p[n] - v) * pf); ts = r.a.s + (r.b.s - r.a.s) * pf;
    }
    rig.position.set(D(rig.position.x, tp[0], k, dt), D(rig.position.y, tp[1], k, dt), D(rig.position.z, tp[2], k, dt));
    rig.scale.setScalar(D(rig.scale.x, ts, k, dt));
    const px = reduced ? 0 : ptr.x, py = reduced ? 0 : ptr.y;
    rig.rotation.y = D(rig.rotation.y, px * 0.3 + cur * 0.55 + prog * 2.2, 3, dt);   // scroll memutar scene
    rig.rotation.x = D(rig.rotation.x, -py * 0.14 + Math.sin(prog * 3.14) * 0.35, 3, dt);

    const camZ = frame.isHome ? 10 - smooth(c01(cur)) * 0.7 + smooth(c01(cur - 1)) * 1.2 : 11 - pf * 1.5;
    camera.position.set(D(camera.position.x, px * 0.45, 2.5, dt), D(camera.position.y, py * 0.3, 2.5, dt), D(camera.position.z, camZ, k, dt));
    camera.lookAt(0, 0, 0);

    // Efek scroll: cincin melebar, shard "terbang" mendekat, core berdenyut
    const spread = 1 + smooth(c01(cur - 1)) * 0.45 - pf * 0.2;
    rings.forEach((r, i) => {
      if (!reduced) r.spin.rotation.y += dt * (r.speed + Math.sign(r.speed) * vel * 0.5);
      r.tg.scale.setScalar(D(r.tg.scale.x, spread, 3, dt));
      r.tg.rotation.z += (reduced ? 0 : dt * 0.02 * (i ? -1 : 1));
    });
    shards.position.z = cur * 7 + prog * 14; shards.rotation.z = cur * 0.4 + prog * 1.4 + (reduced ? 0 : now * 0.00003);
    shards.material.opacity = 0.4 * (frame.isHome ? 1 : 0.35);
    if (!reduced) { core.rotation.y -= dt * 0.18; core.rotation.x += dt * 0.07 + vel * dt * 0.4; shell.rotation.y += dt * 0.12; shell.rotation.x += dt * 0.05; sparks.rotation.y += dt * 0.01; }
    const pulse = 1 + (reduced ? 0 : Math.sin(now * 0.002) * 0.035) + vel * 0.03;
    core.scale.setScalar(pulse); glow.scale.setScalar(6.5 * pulse);

    // Hover node (raycast ringan, hanya saat label terlihat)
    const labelBase = frame.isHome ? c01(1 - (cur - 1) * 1.6) : 0;
    if (!reduced || dirty > 0) {
      let hov = null;
      if (labelBase > 0.3 && !reduced && !touchOnly) {
        ray.setFromCamera(ptr, camera);
        const hit = ray.intersectObjects(nodes.map((n) => n.hit), false)[0];
        if (hit) hov = hit.object.userData.id;
      }
      if (!touchOnly && hov !== prevHover) { prevHover = hov; if (ui.hovered !== hov) setUi({ hovered: hov }); }
    }
    nodes.forEach((n) => {
      const act = ui.hovered === n.it.id;
      n.g.scale.setScalar(D(n.g.scale.x, act ? 1.55 : 1, reduced ? 1000 : 6, dt));
      if (!reduced) { n.body.rotation.x += dt * 0.35; n.body.rotation.y += dt * 0.5; }
      n.lineMat.opacity = act ? 1 : 0.7;
      const ho = D(n.halo.material.opacity, act ? 0.9 : 0, reduced ? 1000 : 8, dt);
      n.halo.material.opacity = ho; n.halo.visible = ho > 0.01;
      if (n.lastActive !== act) { n.lastActive = act; const t = act ? n.tex.a : n.tex.n; n.sp.material.map = t.tex; n.sp.material.needsUpdate = true; n.sp.scale.set(t.w * 0.00046, 64 * 0.00046, 1); }
      n.sp.material.opacity = labelBase; n.sp.visible = labelBase > 0.01;
    });
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return {
    applyTheme,
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); offFrame(); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerdown', onDown);
      scene.traverse((m) => { m.geometry?.dispose?.(); [m.material].flat().forEach((x) => { x?.map?.dispose?.(); x?.dispose?.(); }); });
      envRT.dispose(); pmrem.dispose(); renderer.dispose();
    },
  };
}

export default function Scene3D({ theme = 'dark', reduced = false }) {
  const ref = useRef(null);
  const api = useRef(null);
  useEffect(() => {
    api.current = build(ref.current, theme, reduced);
    return () => api.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  useEffect(() => { api.current?.applyTheme(theme); }, [theme]);
  return <canvas ref={ref} className="scene-canvas" />;
}
