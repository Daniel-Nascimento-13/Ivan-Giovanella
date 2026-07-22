import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { EASE, DURATION, STAGGER } from '../constants/motion.js';
import { createReveal } from '../lib/reveal.js';

/* ========================================
   SEÇÃO 3 — MARCAS — CARROSSEL DE LOGOS
   ======================================== */

/* LISTA DE LOGOS — CAMINHO RELATIVO A public/ */
const LOGOS = [
  'logo-artem', 'logo-castro', 'logo-centralsul', 'logo-diamond',
  'logo-jasper', 'logo-madre', 'logo-nutritec', 'logo-plastrela',
  'logo-reficomp', 'logo-runmore', 'logo-scala', 'logo-univates'
];

const CYCLE_MS   = 2000;   /* INTERVALO GLOBAL DE TROCA (MS) — TODAS AS COLUNAS JUNTAS */
const SHIFT_Y    = 20;     /* DESLOCAMENTO VERTICAL DA TRANSIÇÃO (PX) — ENTRA POR BAIXO, SAI POR CIMA */
const WAVE_DELAY = 0.08;   /* DELAY ESCALONADO POR COLUNA (S) — EFEITO DE ONDA */

let _interval = null;    /* ÚNICO SETINTERVAL GLOBAL — CONTROLA O CICLO INTEIRO */
let _revealST = null;

/* ------ EMBARALHA ARRAY (FISHER-YATES) ------ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------ DISTRIBUI LOGOS NAS COLUNAS ------ */
function distribute(logos, cols) {
  const shuffled = shuffle(logos);
  return Array.from({ length: cols }, (_, i) =>
    shuffled.filter((_, j) => j % cols === i)
  );
}

/* ------ CRIA ELEMENTO DE LOGO ------ */
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

/* ------ TROCA O LOGO DE UMA COLUNA — ROLETA VERTICAL ------ */
/* SAI PRIMEIRO (SOBE + FADE), DEPOIS ENTRA (DE BAIXO PARA CIMA) — SEQUENCIAL VIA TIMELINE */
/* i = ÍNDICE DA COLUNA — GERA O DELAY ESCALONADO (EFEITO DE ONDA) */
function rotateColumn(state, i) {
  state.index = (state.index + 1) % state.logos.length;

  const old  = state.current;
  const next = createLogoEl(state.logos[state.index]);
  gsap.set(next, { y: SHIFT_Y, autoAlpha: 0 });
  state.col.appendChild(next);
  state.current = next;

  /* DELAY INCREMENTAL POR COLUNA — COLUNA 0 COMEÇA PRIMEIRO, DEMAIS ATRASAM EM CASCATA */
  const waveDelay = i * WAVE_DELAY;

  const tl = gsap.timeline();

  /* SAÍDA — LOGO ATUAL SOBE E DESAPARECE */
  tl.to(old, {
    y: -SHIFT_Y,
    autoAlpha: 0,
    duration: DURATION.fast,
    ease: EASE.out,
    delay: waveDelay,
    onComplete: () => old.remove()
  });

  /* ENTRADA — PRÓXIMO LOGO SOBE ATÉ O CENTRO */
  tl.to(next, {
    y: 0,
    autoAlpha: 1,
    duration: DURATION.base,
    ease: EASE.out,
    delay: waveDelay
  });
}

/* ------ ESTADO INICIAL DE UMA COLUNA — MOSTRA O PRIMEIRO LOGO ------ */
function initColumn(col, logos) {
  col.innerHTML = '';
  const first = createLogoEl(logos[0]);
  gsap.set(first, { y: 0, autoAlpha: 1 });
  col.appendChild(first);
  return { col, logos, index: 0, current: first };
}

/* ------ INIT ------ */
export function initMarcas() {
  const section = document.querySelector('#marcas');
  if (!section) return;

  destroyMarcas();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cols = Array.from(section.querySelectorAll('.marcas-col'));
  const distributed = distribute(LOGOS, cols.length);

  /* ESTADO INICIAL — CADA COLUNA COM 1 LOGO */
  const states = cols.map((col, i) => initColumn(col, distributed[i]));

  /* ------ ROTAÇÃO GLOBAL — TODAS AS COLUNAS TROCAM JUNTAS (GUARD REDUCED MOTION) ------ */
  if (!prefersReducedMotion) {
    _interval = setInterval(() => {
      states.forEach(rotateColumn);
    }, CYCLE_MS);
  }

  /* ------ REVEAL — EYEBROW + TÍTULO (CLIP-PATH) + CARROSSEL (SÓ FADE) ------ */
  const revealEls = [
    section.querySelector('.marcas-eyebrow'),
    section.querySelector('.marcas-title'),
    section.querySelector('.marcas-carousel')
  ].filter(Boolean);

  /* TEXTO: REVEAL PADRÃO COM CLIP-PATH — SEM O CARROSSEL */
  const textEls = revealEls.filter(el => !el.classList.contains('marcas-carousel'));
  const carousel = section.querySelector('.marcas-carousel');

  _revealST = createReveal(textEls, {
    trigger: section,
    start: 'top 65%',
    stagger: STAGGER.base
  });

  /* CAROUSEL: REVELA SÓ COM FADE — SEM will-change: transform QUE QUEBRA O STACKING */
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
}
