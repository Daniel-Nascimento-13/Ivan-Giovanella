/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from '../lib/gsap.js';
import { EASE, DURATION, STAGGER } from '../constants/motion.js';
import { createReveal } from '../lib/reveal.js';

/* ========================================
   SEÇÃO 3 — MARCAS
   ======================================== */

const LOGOS = [
  'logo-artem', 'logo-castro', 'logo-centralsul', 'logo-diamond',
  'logo-jasper', 'logo-madre', 'logo-nutritec', 'logo-plastrela',
  'logo-reficomp', 'logo-runmore', 'logo-scala', 'logo-univates'
];

const CYCLE_MS   = 2000;  // INTERVALO GLOBAL DE TROCA (MS)
const SHIFT_Y    = 20;    // DESLOCAMENTO VERTICAL DA TRANSIÇÃO (PX)
const WAVE_DELAY = 0.08;  // DELAY ESCALONADO POR COLUNA (S)

let _interval = null;
let _revealST = null;
let _marcasRouletteTimer = null;

/* ------ UTILITÁRIOS ------ */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distribute(logos, cols) {
  const shuffled = shuffle(logos);
  return Array.from({ length: cols }, (_, i) =>
    shuffled.filter((_, j) => j % cols === i)
  );
}

function createLogoEl(name) {
  const wrap = document.createElement('div');
  wrap.className = 'marcas-logo';
  const img = document.createElement('img');
  img.src = `/images/marcas/${name}.webp`;
  img.alt = name.replace('logo-', '');
  img.loading = 'lazy';
  wrap.appendChild(img);
  return wrap;
}

/* ------ ROTAÇÃO DE COLUNA ------ */
// SAI PRIMEIRO (SOBE + FADE), DEPOIS ENTRA (DE BAIXO). DELAY ESCALONADO = EFEITO DE ONDA.

function rotateColumn(state, i) {
  state.index = (state.index + 1) % state.logos.length;

  const old  = state.current;
  const next = createLogoEl(state.logos[state.index]);
  gsap.set(next, { y: SHIFT_Y, autoAlpha: 0 });
  state.col.appendChild(next);
  state.current = next;

  const waveDelay = i * WAVE_DELAY;
  const tl = gsap.timeline();

  tl.to(old, {
    y: -SHIFT_Y,
    autoAlpha: 0,
    duration: DURATION.fast,
    ease: EASE.out,
    delay: waveDelay,
    onComplete: () => old.remove()
  });

  tl.to(next, {
    y: 0,
    autoAlpha: 1,
    duration: DURATION.base,
    ease: EASE.out,
    delay: waveDelay
  });
}

function initColumn(col, logos) {
  col.innerHTML = '';
  const first = createLogoEl(logos[0]);
  gsap.set(first, { y: 0, autoAlpha: 1 });
  col.appendChild(first);
  return { col, logos, index: 0, current: first };
}

/* ------ ROLETA DO EYEBROW ------ */
// AGUARDA FONTES — offsetWidth SEM FONTE CARREGADA GERA PÍLULA COM TAMANHO ERRADO.

function initMarcasEyebrowRoulette(section) {
  const rouletteEl = section.querySelector('.marcas-eyebrow-roulette');
  const track = section.querySelector('.marcas-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(track.querySelectorAll('.marcas-eyebrow-roulette__word'));
  if (words.length < 2) return;

  clearInterval(_marcasRouletteTimer);
  _marcasRouletteTimer = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  const widths = words.map(w => w.offsetWidth);
  const h = words[0].offsetHeight;

  rouletteEl.style.height = h + 'px';
  rouletteEl.style.width = (widths[0] + 4) + 'px';

  function advance() {
    current = (current + 1) % words.length;
    rouletteEl.setAttribute('aria-label', words[current].textContent.trim());

    if (prefersReduced) {
      track.style.transition = 'none';
      rouletteEl.style.transition = 'none';
    }

    track.style.transform = `translateY(-${current * h}px)`;
    rouletteEl.style.width = (widths[current] + 4) + 'px';
  }

  _marcasRouletteTimer = setInterval(advance, 3000);
}

/* ------ INIT ------ */

export function initMarcas() {
  const section = document.querySelector('#marcas');
  if (!section) return;

  destroyMarcas();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cols = Array.from(section.querySelectorAll('.marcas-col'));
  const distributed = distribute(LOGOS, cols.length);
  const states = cols.map((col, i) => initColumn(col, distributed[i]));

  if (!prefersReducedMotion) {
    _interval = setInterval(() => {
      states.forEach(rotateColumn);
    }, CYCLE_MS);
  }

  const textEls = [
    section.querySelector('.marcas-eyebrow'),
    section.querySelector('.marcas-title')
  ].filter(Boolean);

  const carousel = section.querySelector('.marcas-carousel');

  if (document.fonts) {
    document.fonts.ready.then(() => initMarcasEyebrowRoulette(section));
  } else {
    initMarcasEyebrowRoulette(section);
  }

  _revealST = createReveal(textEls, {
    trigger: section,
    start: 'top 65%',
    stagger: STAGGER.base
  });

  // CARROSSEL: SÓ FADE — will-change: transform QUEBRARIA O STACKING CONTEXT.
  if (!prefersReducedMotion && carousel) {
    gsap.set(carousel, { autoAlpha: 0 });
    gsap.to(carousel, {
      autoAlpha: 1,
      duration: DURATION.slow,
      ease: EASE.out,
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        once: true
      }
    });
  }
}

/* ------ CLEANUP ------ */

export function destroyMarcas() {
  clearInterval(_interval);
  _interval = null;
  _revealST?.kill();
  _revealST = null;
  clearInterval(_marcasRouletteTimer);
  _marcasRouletteTimer = null;
}