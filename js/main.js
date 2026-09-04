/* =================================================================
   main.js — orquestração e progressive enhancement.
   Regra: HTML + CSS entregam 100% do conteúdo. Cada camada de
   enhancement roda atrás de try/catch e nunca esconde conteúdo se
   falhar. Movimento respeita prefers-reduced-motion.
   ================================================================= */

const root = document.documentElement;
root.classList.add('js');

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsIO = 'IntersectionObserver' in window;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* -----------------------------------------------------------------
   00 — PRELOADER  (puro, sem dependências)
   ----------------------------------------------------------------- */
(function preloader() {
  const el = $('#preloader');
  if (!el) return;
  const fill = $('.preloader__fill', el);
  const pct = $('.preloader__pct', el);
  const rate = $('.preloader__rate', el);
  const start = performance.now();
  const MAX = REDUCE ? 350 : 1700;
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    if (pct) pct.textContent = '100%';
    if (fill) fill.style.transform = 'scaleX(1)';
    el.classList.add('is-done');
    root.classList.add('is-loaded');
    document.body.dispatchEvent(new CustomEvent('preloader:done'));
    setTimeout(() => el.remove(), 700);
  }

  function tick(now) {
    const t = Math.min(1, (now - start) / MAX);
    const eased = 1 - Math.pow(1 - t, 2);
    if (fill) fill.style.transform = `scaleX(${eased})`;
    if (pct) pct.textContent = Math.round(eased * 100) + '%';
    if (rate) {
      const mbs = (2.4 + Math.sin(now / 90) * 1.6 + Math.random() * 0.5).toFixed(2);
      rate.textContent = mbs.replace('.', ',') + ' MB/s';
    }
    if (t < 1 && !done) requestAnimationFrame(tick);
    else finish();
  }
  requestAnimationFrame(tick);
  window.addEventListener('load', () => setTimeout(finish, 120));
  setTimeout(finish, 2000); // teto absoluto
})();

/* -----------------------------------------------------------------
   HEADER — estado "scrolled"
   ----------------------------------------------------------------- */
(function header() {
  const h = $('.site-header');
  if (!h) return;
  const onScroll = () => h.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* -----------------------------------------------------------------
   GRID TOGGLE — "mostrar grade"
   ----------------------------------------------------------------- */
(function gridToggle() {
  const btn = $('[data-grid-toggle]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const on = root.getAttribute('data-grid') === 'on';
    root.setAttribute('data-grid', on ? 'off' : 'on');
    btn.setAttribute('aria-pressed', String(!on));
  });
})();

/* -----------------------------------------------------------------
   NAV PROGRESS — índice da seção atual
   ----------------------------------------------------------------- */
(function navProgress() {
  const out = $('[data-nav-index]');
  const sections = $$('#conteudo > section');
  if (!out || !sections.length || !supportsIO) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = sections.indexOf(e.target) + 1;
      out.textContent = String(i).padStart(2, '0');
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach((s) => io.observe(s));
})();

/* -----------------------------------------------------------------
   REVELAÇÕES — section-head / hero / flows  (via .anim-ready)
   ----------------------------------------------------------------- */
(function reveals() {
  const heads = $$('.section-head');
  const hero = $('.hero');
  const flows = $$('.flow');

  if (!supportsIO) {
    heads.forEach((h) => h.classList.add('is-in'));
    hero && hero.classList.add('is-in');
    flows.forEach((f) => f.classList.add('is-in'));
    return;
  }

  heads.forEach((h) => h.classList.add('reveal-head'));
  flows.forEach((f) =>
    $$('.flow__nodes li', f).forEach((li, n) => li.style.setProperty('--n', n))
  );

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
  );
  heads.forEach((h) => io.observe(h));
  flows.forEach((f) => io.observe(f));

  // o hero revela junto com o fim do preloader (handoff único), não antes
  const revealHero = () => hero && hero.classList.add('is-in');
  document.body.addEventListener('preloader:done', revealHero, { once: true });
  setTimeout(revealHero, 2600);

  // failsafe: se algo travar, revela tudo em 4s
  setTimeout(() => {
    heads.forEach((h) => h.classList.add('is-in'));
    hero && hero.classList.add('is-in');
    flows.forEach((f) => f.classList.add('is-in'));
  }, 4000);

  root.classList.add('anim-ready');
})();

/* -----------------------------------------------------------------
   CONTADORES numéricos  (entram no viewport)
   ----------------------------------------------------------------- */
(function counters() {
  const nums = $$('[data-count-to]');
  if (!nums.length) return;

  const fmt = (v, plain) =>
    plain ? String(v) : v.toLocaleString('pt-BR');

  const run = (el) => {
    const to = parseInt(el.dataset.countTo, 10);
    const plain = el.hasAttribute('data-count-plain');
    const suffix = el.dataset.countSuffix || '';
    if (REDUCE) { el.textContent = fmt(to, plain) + suffix; return; }
    const dur = 1100;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * eased), plain) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!supportsIO) { nums.forEach(run); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach((n) => io.observe(n));
})();

/* -----------------------------------------------------------------
   Regiões roláveis (tabelas largas) — acesso por teclado (WCAG 2.1.1)
   ----------------------------------------------------------------- */
(function scrollableRegions() {
  const mark = () => {
    $$('.datatable__scroll').forEach((el) => {
      const scrolls = el.scrollWidth > el.clientWidth + 1;
      if (scrolls) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'region');
        if (!el.hasAttribute('aria-label')) {
          const cap =
            el.closest('figure')?.querySelector('figcaption')?.textContent ||
            el.closest('.card')?.querySelector('h3')?.textContent ||
            'Tabela';
          el.setAttribute('aria-label', cap.trim() + ' — role na horizontal');
        }
      } else {
        el.removeAttribute('tabindex');
      }
    });
  };
  mark();
  window.addEventListener('resize', mark, { passive: true });
  window.addEventListener('load', mark);
})();

/* -----------------------------------------------------------------
   03 — TRIÂNGULO do marketplace
   ----------------------------------------------------------------- */
(function triangle() {
  const wrap = $('[data-triangle]');
  if (!wrap) return;
  const nodes = $$('.triangle__node', wrap);
  const bodies = $$('[data-side-body]', wrap);

  const show = (side) => {
    wrap.classList.remove('is-jogador', 'is-dev', 'is-valve');
    nodes.forEach((n) => n.classList.toggle('is-active', n.dataset.side === side));
    bodies.forEach((b) => {
      b.hidden = b.dataset.sideBody !== side;
    });
    if (side && side !== 'default') wrap.classList.add('is-' + side);
  };
  const reset = () => show('default');

  nodes.forEach((n) => {
    n.addEventListener('mouseenter', () => show(n.dataset.side));
    n.addEventListener('focus', () => show(n.dataset.side));
    n.addEventListener('mouseleave', reset);
    n.addEventListener('blur', reset);
    n.addEventListener('click', () => show(n.dataset.side)); // toque
  });
  reset();
})();

/* -----------------------------------------------------------------
   06 — HOTSPOTS + simulações de visão
   ----------------------------------------------------------------- */
(function hotspots() {
  const wrap = $('[data-hotspots]');
  if (!wrap) return;
  const spots = $$('.hotspot', wrap);
  const bodies = $$('[data-hotspot-body]', wrap);
  const target = $('[data-vision-target]', wrap);
  const hint = $('[data-vision-hint]', wrap);
  const visionBtns = $$('[data-vision]', wrap);

  const openSpot = (key) => {
    spots.forEach((s) => s.setAttribute('aria-expanded', String(s.dataset.hotspot === key)));
    bodies.forEach((b) => { b.hidden = b.dataset.hotspotBody !== key; });
  };
  spots.forEach((s) => {
    s.addEventListener('click', () => {
      const open = s.getAttribute('aria-expanded') === 'true';
      if (open) { openSpot('default'); }
      else openSpot(s.dataset.hotspot);
    });
  });
  openSpot('default');

  const HINTS = {
    none: 'visão típica',
    grayscale: 'sem cor — o que ainda dá para distinguir?',
    deuteranopia: 'deuteranopia simulada — verdes e vermelhos colapsam',
  };
  visionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.vision;
      const active = btn.getAttribute('aria-pressed') === 'true';
      visionBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      target && target.classList.remove('vision-grayscale', 'vision-deuteranopia');
      if (!active) {
        btn.setAttribute('aria-pressed', 'true');
        target && target.classList.add('vision-' + mode);
        if (hint) hint.textContent = HINTS[mode];
      } else if (hint) {
        hint.textContent = HINTS.none;
      }
    });
  });
})();

/* -----------------------------------------------------------------
   07 — LOOP de engajamento + medidores
   ----------------------------------------------------------------- */
(function engagementLoop() {
  const wrap = $('[data-loop]');
  if (!wrap) return;
  const slider = $('#loop-weight', wrap);
  const valOut = $('[data-loop-value]', wrap);
  const mVal = $('[data-meter="valor"]', wrap);
  const mCusto = $('[data-meter="custo"]', wrap);
  const fVal = $('[data-meter-fill="valor"]', wrap);
  const fCusto = $('[data-meter-fill="custo"]', wrap);

  const update = () => {
    const w = Number(slider.value);
    const valor = Math.round(70 - w * 0.14);      // valor estrutural cai pouco
    const custo = Math.round(18 + w * 0.72);      // lock-in sobe muito
    if (valOut) valOut.textContent = w;
    if (mVal) mVal.textContent = valor;
    if (mCusto) mCusto.textContent = custo;
    if (fVal) fVal.style.width = valor + '%';
    if (fCusto) fCusto.style.width = custo + '%';
  };
  slider && slider.addEventListener('input', update);
  update();

  // cursor girando + passo ativo (desligado em reduced-motion)
  const steps = $$('[data-loop-step]', wrap);
  const cursor = $('[data-loop-cursor]', wrap);
  if (REDUCE || !steps.length) { steps[0] && steps[0].classList.add('is-active'); return; }
  const cx = 160, cy = 160, r = 120;
  let i = 0;
  const advance = () => {
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    const ang = (-90 + (i / steps.length) * 360) * (Math.PI / 180);
    if (cursor) {
      cursor.setAttribute('cx', (cx + Math.cos(ang) * r).toFixed(1));
      cursor.setAttribute('cy', (cy + Math.sin(ang) * r).toFixed(1));
    }
    i = (i + 1) % steps.length;
  };
  advance();
  setInterval(advance, 1500);
})();

/* -----------------------------------------------------------------
   08 — SLIDERS antes/depois
   ----------------------------------------------------------------- */
(function beforeAfter() {
  $$('[data-ba]').forEach((wrap) => {
    const ba = $('.ba', wrap);
    const range = $('.ba__range', wrap);
    if (!ba || !range) return;
    const apply = () => ba.style.setProperty('--split', range.value + '%');
    range.addEventListener('input', apply);
    apply();
  });
})();

/* -----------------------------------------------------------------
   09 — CARROSSEL  (embla dinâmico; fallback = scroll-snap nativo)
   ----------------------------------------------------------------- */
async function initCarousel() {
  const wrap = $('[data-carousel]');
  if (!wrap) return;
  const viewport = $('[data-carousel-viewport]', wrap);
  const track = $('[data-carousel-track]', wrap);
  const prev = $('[data-carousel-prev]', wrap);
  const next = $('[data-carousel-next]', wrap);
  const dotsBox = $('[data-carousel-dots]', wrap);
  const slides = $$('.card', track);

  const buildDots = (count, goTo, getIndex) => {
    dotsBox.innerHTML = '';
    const dots = slides.slice(0, count).map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel__dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Card ${i + 1} de ${count}`);
      b.addEventListener('click', () => goTo(i));
      dotsBox.appendChild(b);
      return b;
    });
    const sync = () => {
      const idx = getIndex();
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', String(i === idx));
      });
    };
    sync();
    return sync;
  };

  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/embla-carousel@8.3.0/+esm');
    const EmblaCarousel = mod.default;
    const embla = EmblaCarousel(viewport, {
      align: 'start',
      loop: false,
      dragFree: false,
      skipSnaps: false,
      containScroll: 'trimSnaps',
    });
    wrap.classList.add('is-embla');

    const sync = buildDots(embla.scrollSnapList().length, (i) => embla.scrollTo(i), () => embla.selectedScrollSnap());
    const updateBtns = () => {
      prev.disabled = !embla.canScrollPrev();
      next.disabled = !embla.canScrollNext();
    };
    embla.on('select', () => { sync(); updateBtns(); });
    embla.on('reInit', () => { sync(); updateBtns(); });
    prev.addEventListener('click', () => embla.scrollPrev());
    next.addEventListener('click', () => embla.scrollNext());
    updateBtns();

    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { embla.scrollPrev(); }
      else if (e.key === 'ArrowRight') { embla.scrollNext(); }
    });
  } catch (err) {
    // fallback nativo — scroll-snap por CSS já ativo
    const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : 480);
    const idxNow = () => Math.round(viewport.scrollLeft / step());
    const sync = buildDots(slides.length, (i) => {
      viewport.scrollTo({ left: i * step(), behavior: REDUCE ? 'auto' : 'smooth' });
    }, idxNow);
    prev.addEventListener('click', () =>
      viewport.scrollBy({ left: -step(), behavior: REDUCE ? 'auto' : 'smooth' }));
    next.addEventListener('click', () =>
      viewport.scrollBy({ left: step(), behavior: REDUCE ? 'auto' : 'smooth' }));
    viewport.addEventListener('scroll', () => {
      sync();
      prev.disabled = viewport.scrollLeft < 8;
      next.disabled = viewport.scrollLeft > viewport.scrollWidth - viewport.clientWidth - 8;
    }, { passive: true });
  }
}

/* -----------------------------------------------------------------
   SMOOTH SCROLL (Lenis) — desligado em reduced-motion
   ----------------------------------------------------------------- */
let lenis = null;
async function initSmoothScroll() {
  if (REDUCE) return null;
  try {
    const { default: Lenis } = await import('https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.mjs');
    lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    root.classList.add('lenis');
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return lenis;
  } catch (err) {
    return null;
  }
}

/* -----------------------------------------------------------------
   ÂNCORAS internas
   ----------------------------------------------------------------- */
(function anchors() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -60 });
      else target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();

/* -----------------------------------------------------------------
   02 — DESMONTAGEM pinada + cena 3D (GSAP ScrollTrigger)
   ----------------------------------------------------------------- */
let heroScene = null;

async function initHero3D() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  // mobile: sem WebGL (o briefing pede cena estática / menos geometria).
  // O fallback CSS (.stage__fallback) cobre o hero.
  if (window.innerWidth <= 768) { canvas.dataset.webgl = 'off'; return; }

  // checagem de WebGL num canvas descartável (não queima o contexto do <canvas> real)
  let ok = false;
  try {
    const probe = document.createElement('canvas');
    ok = !!(probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl'));
  } catch (e) { ok = false; }
  if (!ok) { canvas.dataset.webgl = 'off'; return; }

  try {
    const { createHeroScene } = await import('./hero-scene.js');
    heroScene = createHeroScene(canvas, { reduceMotion: REDUCE });
    canvas.dataset.webgl = 'on';
    // has-3d só no modo com movimento: em reduced-motion o diagrama
    // estático ilustra melhor a ideia superfície -> esqueleto
    if (!REDUCE) {
      root.classList.add('has-3d');
      heroScene.start();
    }
    window.addEventListener('resize', () => heroScene && heroScene.resize(), { passive: true });
  } catch (err) {
    canvas.dataset.webgl = 'off';
    heroScene = null;
  }
}

/* ciclo de vida da .stage — independente de GSAP, vale para todos os modos */
function initStageLifecycle() {
  const stage = $('.stage');
  const anchor = $('#contexto');
  if (!stage || !anchor || !supportsIO) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const hide = e.isIntersecting || e.boundingClientRect.top < 0;
      stage.classList.toggle('is-hidden', hide);
      if (!heroScene || REDUCE) return;
      if (hide) heroScene.stop();
      else heroScene.start();
    });
  }, { rootMargin: '0px 0px -30% 0px' });
  io.observe(anchor);
}

async function initScrollScenes() {
  const pin = $('.disassembly__pin');
  const section = $('#desmontagem');
  const steps = $$('[data-disassembly-steps] .dstep');
  const panels = $$('[data-disassembly-diagram] .dpanel');

  const setDisassembly = (p) => {
    if (heroScene) heroScene.setPhase(p);
    const active = Math.min(steps.length - 1, Math.floor(p * steps.length + 0.001));
    steps.forEach((s, i) => s.setAttribute('aria-current', String(i === active)));
    const pa = Math.min(panels.length - 1, Math.floor(p * panels.length + 0.001));
    panels.forEach((el, i) => el.classList.toggle('is-active', i === pa));
  };

  if (REDUCE) { setDisassembly(0); return; }

  try {
    const [{ default: gsap }, { default: ScrollTrigger }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm'),
      import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm'),
    ]);
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    if (pin && section && window.innerWidth > 768) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=280%',
        pin: pin,
        scrub: 0.6,
        onUpdate: (self) => setDisassembly(self.progress),
      });
    } else {
      setDisassembly(1);
    }

    ScrollTrigger.refresh();
  } catch (err) {
    // sem GSAP: a seção vira scroll normal (sticky via CSS) e a cena
    // fica no estado inicial. Garante altura para o sticky viajar (só desktop).
    if (section && window.innerWidth > 768) section.style.minHeight = '210vh';
    setDisassembly(window.innerWidth > 768 ? 0 : 1);
  }
}

/* -----------------------------------------------------------------
   BOOT
   ----------------------------------------------------------------- */
(async function boot() {
  try { initCarousel(); } catch (e) {}
  try { initStageLifecycle(); } catch (e) {}
  await initSmoothScroll();
  await initHero3D();
  await initScrollScenes();
})();
