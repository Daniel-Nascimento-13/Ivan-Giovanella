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

/* ========================================
   SEÇÃO 4 — PARA QUEM É — PERFIS DE CONTRATAÇÃO
   ======================================== */

import { initParaQuemE } from './sections/para-quem-e.js';

/* ========================================
   SEÇÃO 5 — COMO FUNCIONA
   ======================================== */

import { initComoFunciona } from './sections/como-funciona.js';

/* ========================================
   SEÇÃO 6 — DEPOIMENTOS
   ======================================== */

import { initDepoimentos } from './sections/depoimentos.js';

/* ========================================
   SEÇÃO 7 — CTA FINAL
   ======================================== */

import { initCta } from './sections/cta.js';

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

  // SEÇÃO 4 — PARA QUEM É: ACCORDION DE PERFIS DE CONTRATAÇÃO
  initParaQuemE();

  // SEÇÃO 5 — COMO FUNCIONA: STEPPER COM LINHA DESENHADA NO SCROLL
  initComoFunciona();

  // SEÇÃO 6 — DEPOIMENTOS: CARDS EMPILHADOS COM NAVEGAÇÃO
  initDepoimentos();

  // SEÇÃO 7 — CTA FINAL: MODAL DE AVALIAÇÃO + FAB SOCIAL + FOOTER
  initCta();
});