import './styles/main.css';
import { initSmoothScroll } from './lib/smooth-scroll.js';

/* ========================================
   SEÇÃO 0 — NAVEGAÇÃO — NAVBAR + OVERLAYS
   ======================================== */

import { initNav } from './sections/nav.js';
import { revealNav } from './animations/nav.js';

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

// INSTÂNCIA GUARDADA PARA A NAVEGAÇÃO: OS OVERLAYS PARAM E RETOMAM O SCROLL.
// SOB prefers-reduced-motion O LENIS NÃO É CRIADO — A NAV TRATA null (SCROLL NATIVO).
let lenis = null;

if (!prefersReducedMotion) {
  lenis = initSmoothScroll();
}

document.addEventListener('DOMContentLoaded', () => {
  // SEÇÃO 0 — NAVEGAÇÃO: NAVBAR FIXA + OVERLAYS (MENU, IVAN, PLANOS, AVALIAÇÃO)
  initNav(lenis);

  prepareHero(); // ESCONDE O HERO IMEDIATAMENTE — ANTES DA INTRO RODAR

  // O CALLBACK DO initIntro É O ÚNICO PONTO DE SAÍDA DO INTRO: VALE PARA O FIM DO
  // VÍDEO, PARA O FALLBACK DE TIMEOUT E PARA OS ATALHOS (reduced-motion, SESSÃO JÁ
  // VISTA, VÍDEO AUSENTE). REVELAR AQUI DISPENSA ACOPLAR intro.js À SEÇÃO 0.
  initIntro(() => {
    /* REVELA A NAVBAR APÓS O FIM DO INTRO */
    // ANTES DO initHero(): OCULTA, A BARRA TAMBÉM É INCLICÁVEL — SE A SEÇÃO 1 LANÇAR
    // UMA EXCEÇÃO, O MENU INTEIRO IRIA JUNTO. A NAVEGAÇÃO NÃO PODE DEPENDER DO HERO.
    revealNav();
    initHero();
  });

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