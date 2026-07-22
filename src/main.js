import './styles/main.css';
import { initSmoothScroll } from './lib/smooth-scroll.js';

/* ========================================
   SEÇÃO 1 — HERO — VÍDEO ANIMADO DE ENTRADA
   ======================================== */

import { initIntro } from './animations/intro.js';
import { initHero, prepareHero } from './animations/hero.js';

/* ========================================
   SEÇÃO 2 — SOBRE
   ======================================== */

import { initSobre } from './animations/sobre.js';

/* ========================================
   SEÇÃO 3 — MARCAS
   ======================================== */

import { initMarcas } from './animations/marcas.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  initSmoothScroll();
}

document.addEventListener('DOMContentLoaded', () => {
  prepareHero(); // ESCONDE O HERO IMEDIATAMENTE — ANTES DA INTRO RODAR
  initIntro(() => initHero());

  // SEÇÃO 2 — SOBRE: SCROLLTRIGGER PRÓPRIO, INDEPENDENTE DA INTRO
  initSobre();

  // SEÇÃO 3 — MARCAS: CARROSSEL DE LOGOS + REVEAL
  initMarcas();
});