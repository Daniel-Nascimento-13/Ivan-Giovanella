import './styles/main.css';
import { initSmoothScroll } from './lib/smooth-scroll.js';

/* ========================================
   SEÇÃO 1 — HERO — VÍDEO ANIMADO DE ENTRADA
   ======================================== */

import { initIntro } from './animations/intro.js';
import { initHero, prepareHero } from './animations/hero.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  initSmoothScroll();
}

document.addEventListener('DOMContentLoaded', () => {
  prepareHero(); // ESCONDE O HERO IMEDIATAMENTE — ANTES DA INTRO RODAR
  initIntro(() => initHero());
});