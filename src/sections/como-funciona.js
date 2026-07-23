import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { STEPPER } from '../constants/motion.js';
import {
  layoutStepperLine,
  createStepperTimeline,
  applyStepperStaticState,
  killStepperTimeline
} from '../animations/como-funciona.js';

/* ========================================
   SEÇÃO 4 — COMO FUNCIONA — STEPPER ANIMADO
   ======================================== */

// INICIALIZAÇÃO DA SEÇÃO: SELEÇÃO DO DOM, GUARD DE REDUCED MOTION, REBUILD DE
// GEOMETRIA NO RESIZE E CLEANUP. AS ANIMAÇÕES VIVEM EM
// src/animations/como-funciona.js — ESTE ARQUIVO NÃO CRIA TWEENS.

let _refs = null;
let _resizeTimer = null;
let _viewport = { width: 0, height: 0 };

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#como-funciona');
  if (!section) return null;

  const stepper = section.querySelector('.como-funciona-stepper');
  const svg = section.querySelector('.como-funciona-line');
  const linePath = section.querySelector('.como-funciona-line__path');
  const maskPath = section.querySelector('.como-funciona-line__mask');
  const cards = Array.from(section.querySelectorAll('.como-funciona-card'));
  const pins = cards.map((card) => card.querySelector('.como-funciona-card__pin'));

  /* GUARD — MARKUP INCOMPLETO NÃO INICIALIZA NADA */
  if (!stepper || !svg || !linePath || !maskPath) return null;
  if (cards.length < 2 || pins.some((pin) => !pin)) return null;

  return { section, stepper, svg, linePath, maskPath, cards, pins };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------ BUILD — GEOMETRIA + TIMELINE (SÍNCRONO, NUNCA EM CALLBACK ASSÍNCRONO) ------ */

function build() {
  if (!_refs) return;

  killStepperTimeline();

  /* ZERA O ESTADO DA TIMELINE ANTERIOR — OS PINS PRECISAM SER MEDIDOS EM REPOUSO, */
  /* SEM O translateY NEM O scale DO REVEAL INTERFERINDO NO RECT. */
  gsap.set([..._refs.cards, ..._refs.pins], { clearProps: 'all' });

  const geometry = layoutStepperLine(_refs);
  if (!geometry) return;

  /* GUARD PREFERS-REDUCED-MOTION — ESTADO FINAL, SEM PIN E SEM SCRUB */
  if (prefersReducedMotion()) {
    applyStepperStaticState(_refs);
    return;
  }

  createStepperTimeline(_refs, geometry);
}

/* ------ REBUILD NO RESIZE — A GEOMETRIA DA LINHA DEPENDE DO LAYOUT ------ */

function onResize() {
  clearTimeout(_resizeTimer);

  _resizeTimer = setTimeout(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    /* IGNORA O SHOW/HIDE DA BARRA DE ENDEREÇO NO MOBILE — SÓ A LARGURA OU UMA */
    /* VARIAÇÃO GRANDE DE ALTURA MUDAM DE FATO A CASCATA. */
    const sameWidth = width === _viewport.width;
    const minorHeightShift = Math.abs(height - _viewport.height) < STEPPER.resizeThresholdPx;
    if (sameWidth && minorHeightShift) return;

    _viewport = { width, height };
    build();
    ScrollTrigger.refresh();
  }, STEPPER.resizeDebounceMs);
}

/* ------ INIT ------ */

export function initComoFunciona() {
  destroyComoFunciona();

  _refs = collectRefs();
  if (!_refs) return;

  _viewport = { width: window.innerWidth, height: window.innerHeight };
  build();

  window.addEventListener('resize', onResize);

  /* O TÍTULO DEFINE A ALTURA DA PISTA — A TROCA DE FONTE REPOSICIONA OS PINS. */
  /* APENAS REFRESH: A GEOMETRIA SE REFAZ NO onRefreshInit DO PRÓPRIO TRIGGER, */
  /* SEM CRIAR SCROLLTRIGGER DENTRO DE CALLBACK ASSÍNCRONO. */
  document.fonts?.ready.then(() => {
    if (_refs) ScrollTrigger.refresh();
  });
}

/* ------ CLEANUP ------ */

export function destroyComoFunciona() {
  clearTimeout(_resizeTimer);
  _resizeTimer = null;

  window.removeEventListener('resize', onResize);

  killStepperTimeline();

  if (_refs) {
    gsap.set([..._refs.cards, ..._refs.pins], { clearProps: 'all' });
    _refs = null;
  }
}
