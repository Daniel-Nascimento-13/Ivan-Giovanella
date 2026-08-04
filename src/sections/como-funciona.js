/* ========================================
   IMPORTS
   ======================================== */

import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { STEPPER } from '../constants/motion.js';
import {
  layoutStepperLine,
  createStepperTimeline,
  applyStepperStaticState,
  killStepperTimeline,
  initComoFuncionaEyebrowRoulette,
  destroyComoFuncionaEyebrowRoulette
} from '../animations/como-funciona.js';

/* ========================================
   SEÇÃO 5 — COMO FUNCIONA — STEPPER ANIMADO
   ======================================== */

// SELEÇÃO DO DOM, GUARD DE REDUCED MOTION, REBUILD DE GEOMETRIA NO RESIZE E CLEANUP.
// TWEENS VIVEM EM src/animations/como-funciona.js — ESTE ARQUIVO NÃO CRIA TWEENS.

let _refs = null;
let _resizeTimer = null;
let _viewport = { width: 0, height: 0 };

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#como-funciona');
  if (!section) return null;

  const stepper  = section.querySelector('.como-funciona-stepper');
  const svg      = section.querySelector('.como-funciona-line');
  const linePath = section.querySelector('.como-funciona-line__path');
  const maskPath = section.querySelector('.como-funciona-line__mask');
  const cards    = Array.from(section.querySelectorAll('.como-funciona-card'));
  const pins     = cards.map((card) => card.querySelector('.como-funciona-card__pin'));

  if (!stepper || !svg || !linePath || !maskPath) return null;
  if (cards.length < 2 || pins.some((pin) => !pin)) return null;

  return { section, stepper, svg, linePath, maskPath, cards, pins };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------ BUILD ------ */
// GEOMETRIA + TIMELINE — SEMPRE SÍNCRONO, NUNCA DENTRO DE CALLBACK ASSÍNCRONO.

function build() {
  if (!_refs) return;

  killStepperTimeline();

  // PINS PRECISAM SER MEDIDOS EM REPOUSO — LIMPA TRANSFORMS ANTES DE MEDIR.
  gsap.set([..._refs.cards, ..._refs.pins], { clearProps: 'all' });

  const geometry = layoutStepperLine(_refs);
  if (!geometry) return;

  if (prefersReducedMotion()) {
    applyStepperStaticState(_refs);
    return;
  }

  createStepperTimeline(_refs, geometry);
}

/* ------ RESIZE ------ */
// IGNORA VARIAÇÕES MENORES DE ALTURA (BARRA DE ENDEREÇO NO MOBILE).

function onResize() {
  clearTimeout(_resizeTimer);

  _resizeTimer = setTimeout(() => {
    const width  = window.innerWidth;
    const height = window.innerHeight;

    const sameWidth       = width === _viewport.width;
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

  // AGUARDA FONTES — TÍTULO DEFINE A ALTURA DA PISTA; ROLETA PRÉ-MEDE offsetWidth.
  // GEOMETRIA SE REFAZ NO onRefreshInit DO PRÓPRIO TRIGGER, SEM NOVO SCROLLTRIGGER.
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (!_refs) return;
      ScrollTrigger.refresh();
      initComoFuncionaEyebrowRoulette();
    });
  } else {
    initComoFuncionaEyebrowRoulette();
  }
}

/* ------ CLEANUP ------ */

export function destroyComoFunciona() {
  clearTimeout(_resizeTimer);
  _resizeTimer = null;

  window.removeEventListener('resize', onResize);

  destroyComoFuncionaEyebrowRoulette();
  killStepperTimeline();

  if (_refs) {
    gsap.set([..._refs.cards, ..._refs.pins], { clearProps: 'all' });
    _refs = null;
  }
}