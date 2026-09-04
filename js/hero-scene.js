/* =================================================================
   hero-scene.js — parede de capsules em profundidade (R3F-free).
   Decorativa: o <canvas> é aria-hidden e nenhuma informação vive aqui.
   Import dinâmico a partir de main.js, atrás de try/catch e checagem
   de WebGL. setPhase(0..1) é dirigido pelo ScrollTrigger da seção 02:
   0 = superfície, ~0.4 = wireframe, ~0.75 = camadas, 1 = estrutura.
   ================================================================= */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const COLS = 8;
const ROWS = 5;
const CAP_W = 1.5;
const CAP_H = 0.7;
const GAP_X = 0.34;
const GAP_Y = 0.46;
const LAYER_NAMES = ['arte', 'titulo', 'preco', 'tags', 'avaliacao'];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

function capsuleTexture(i) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 120;
  const x = c.getContext('2d');
  const tintA = ['#1c2b38', '#20313f', '#1a2732', '#243544'][i % 4];
  const g = x.createLinearGradient(0, 0, 256, 120);
  g.addColorStop(0, tintA);
  g.addColorStop(1, '#0f1720');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 120);
  // brilho diagonal (reflexo)
  const sheen = x.createLinearGradient(0, 0, 220, 120);
  sheen.addColorStop(0, 'rgba(230,237,243,0.16)');
  sheen.addColorStop(0.4, 'rgba(230,237,243,0)');
  x.fillStyle = sheen;
  x.fillRect(0, 0, 256, 120);
  // faixa de "arte"
  x.fillStyle = 'rgba(102,192,244,0.20)';
  x.fillRect(10, 10, 236, 62);
  // barra de "título"
  x.fillStyle = 'rgba(230,237,243,0.72)';
  x.fillRect(10, 84, 150, 8);
  // "preço"
  x.fillStyle = 'rgba(102,192,244,0.9)';
  x.fillRect(196, 82, 50, 16);
  // "avaliação"
  x.fillStyle = i % 3 === 0 ? 'rgba(193,85,58,0.9)' : 'rgba(102,192,244,0.9)';
  x.fillRect(10, 100, 90, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createHeroScene(canvas, opts = {}) {
  const reduceMotion = !!opts.reduceMotion;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x0b1116, 1); // canvas opaco cobre o fallback quando ativo

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  const world = new THREE.Group();
  world.rotation.x = -0.05;
  scene.add(world);

  const planeGeo = new THREE.PlaneGeometry(CAP_W, CAP_H);
  const boxGeo = new THREE.EdgesGeometry(planeGeo);

  // grid lines internas (wireframe de estrutura)
  const gridPts = [];
  for (let gx = 1; gx < 4; gx++) {
    const px = -CAP_W / 2 + (CAP_W / 4) * gx;
    gridPts.push(px, -CAP_H / 2, 0, px, CAP_H / 2, 0);
  }
  for (let gy = 1; gy < 3; gy++) {
    const py = -CAP_H / 2 + (CAP_H / 3) * gy;
    gridPts.push(-CAP_W / 2, py, 0, CAP_W / 2, py, 0);
  }
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));

  const caps = [];
  let idx = 0;
  const spanX = COLS * CAP_W + (COLS - 1) * GAP_X;
  const spanY = ROWS * CAP_H + (ROWS - 1) * GAP_Y;

  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const g = new THREE.Group();
      const baseX = -spanX / 2 + CAP_W / 2 + col * (CAP_W + GAP_X);
      const baseY = spanY / 2 - CAP_H / 2 - r * (CAP_H + GAP_Y);
      const baseZ = (Math.sin(idx * 12.9898) * 43758.5453 % 1) * 2.2 - 1.4;
      g.position.set(baseX, baseY, baseZ);

      const faceMat = new THREE.MeshBasicMaterial({
        map: capsuleTexture(idx),
        transparent: true,
        opacity: 1,
      });
      const face = new THREE.Mesh(planeGeo, faceMat);
      g.add(face);

      const boxMat = new THREE.LineBasicMaterial({ color: 0x66c0f4, transparent: true, opacity: 0 });
      const box = new THREE.LineSegments(boxGeo, boxMat);
      g.add(box);

      const gridMat = new THREE.LineBasicMaterial({ color: 0x24333f, transparent: true, opacity: 0 });
      const grid = new THREE.LineSegments(gridGeo, gridMat);
      g.add(grid);

      // 5 planos-camada para delaminação
      const layers = LAYER_NAMES.map((_, li) => {
        const m = new THREE.Mesh(
          planeGeo,
          new THREE.MeshBasicMaterial({ color: 0x0b1116, transparent: true, opacity: 0 })
        );
        const e = new THREE.LineSegments(
          boxGeo,
          new THREE.LineBasicMaterial({ color: 0x66c0f4, transparent: true, opacity: 0 })
        );
        m.add(e);
        m.userData.edge = e;
        m.userData.li = li;
        g.add(m);
        return m;
      });

      // coluna-alvo da reorganização (5 colunas = as 5 camadas do site)
      const targetCol = idx % 5;
      const targetRow = Math.floor(idx / 5);
      g.userData = {
        baseX, baseY, baseZ,
        targetX: -3 + targetCol * 1.5,
        targetY: (Math.ceil(caps.length / 5) / 2 - targetRow) * 0.5,
        face, faceMat, box, boxMat, grid, gridMat, layers,
      };
      world.add(g);
      caps.push(g);
      idx++;
    }
  }
  // segundo passe: normaliza targetY agora que sabemos o total
  const totalRows = Math.ceil(caps.length / 5);
  caps.forEach((g, i) => {
    g.userData.targetY = (totalRows / 2 - Math.floor(i / 5)) * 0.52;
  });

  let phase = 0;
  let pointerX = 0;
  let pointerY = 0;
  let raf = 0;
  let running = false;
  let t = 0;

  function applyPhase(p) {
    const surface = 1 - smooth(0.0, 0.42, p);
    const wire = smooth(0.12, 0.4, p) * (1 - smooth(0.72, 0.95, p));
    const gridOn = smooth(0.16, 0.4, p) * (1 - smooth(0.6, 0.85, p));
    const delam = smooth(0.34, 0.74, p);
    const reorg = smooth(0.55, 1.0, p);
    const vanish = smooth(0.9, 1.0, p);

    for (let i = 0; i < caps.length; i++) {
      const g = caps[i];
      const u = g.userData;
      u.faceMat.opacity = surface * (1 - vanish);
      u.boxMat.opacity = wire * 0.9 * (1 - vanish);
      u.gridMat.opacity = gridOn * 0.8 * (1 - vanish);

      for (let li = 0; li < u.layers.length; li++) {
        const L = u.layers[li];
        const spread = delam * (li - 2);
        L.position.set(spread * 0.14, spread * 0.05, spread * 0.5);
        L.rotation.y = delam * spread * 0.05;
        L.material.opacity = delam * 0.10 * (1 - vanish);
        L.userData.edge.material.opacity = delam * 0.55 * (1 - vanish);
      }

      const rx = lerp(u.baseX, u.targetX, reorg);
      const ry = lerp(u.baseY, u.targetY, reorg);
      const rz = lerp(u.baseZ, 0, reorg);
      g.position.set(rx, ry, rz);
      g.scale.setScalar(lerp(1, 0.92, reorg));
    }
    world.rotation.z = lerp(0, -0.02, reorg);
  }

  function frame() {
    t += 0.016;
    if (!reduceMotion) {
      const idle = 1 - smooth(0.0, 0.15, phase);
      world.rotation.y = Math.sin(t * 0.15) * 0.12 * idle + phase * 0.04;
      camera.position.x += (pointerX * 0.7 - camera.position.x) * 0.045;
      camera.position.y += (pointerY * 0.4 - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!running) renderer.render(scene, camera);
  }

  function onPointer(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -((e.clientY / window.innerHeight) * 2 - 1);
    pointerX = nx;
    pointerY = ny;
  }

  const api = {
    setPhase(p) {
      phase = clamp(p);
      applyPhase(phase);
      if (!running) renderer.render(scene, camera);
    },
    start() {
      if (running || reduceMotion) {
        applyPhase(phase);
        renderer.render(scene, camera);
        return;
      }
      running = true;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resize,
    destroy() {
      api.stop();
      window.removeEventListener('pointermove', onPointer);
      renderer.dispose();
      planeGeo.dispose();
      boxGeo.dispose();
      gridGeo.dispose();
      caps.forEach((g) => {
        g.userData.faceMat.map?.dispose();
        g.userData.faceMat.dispose();
        g.userData.boxMat.dispose();
        g.userData.gridMat.dispose();
        g.userData.layers.forEach((L) => {
          L.material.dispose();
          L.userData.edge.material.dispose();
        });
      });
    },
  };

  if (!reduceMotion) window.addEventListener('pointermove', onPointer, { passive: true });
  resize();
  applyPhase(0);
  renderer.render(scene, camera);
  return api;
}
