/* ========================================
   IMPORTS
   ======================================== */

import './styles/main.css';
import { initSmoothScroll } from './lib/smooth-scroll.js';

import { initNav }    from './sections/nav.js';
import { revealNav }  from './animations/nav.js';

import { initIntro }             from './animations/intro.js';
import { initHero, prepareHero } from './animations/hero.js';

import { initSobre }       from './animations/sobre.js';
import { initMarcas }      from './animations/marcas.js';
import { initParaQuemE }   from './sections/para-quem-e.js';
import { initComoFunciona } from './sections/como-funciona.js';
import { initDepoimentos } from './sections/depoimentos.js';
import { initCta }         from './sections/cta.js';

/* ========================================
   INIT
   ======================================== */

// SOB prefers-reduced-motion O LENIS NÃO É CRIADO — A NAV TRATA null (SCROLL NATIVO).
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

if (!prefersReducedMotion) {
  lenis = initSmoothScroll();
}

document.addEventListener('DOMContentLoaded', () => {

  // SEÇÃO 0 — NAVEGAÇÃO
  initNav(lenis);

  // ESCONDE O HERO ANTES DA INTRO RODAR — EVITA FOUC.
  prepareHero();

  // CALLBACK ÚNICO DE SAÍDA DO INTRO: FIM DO VÍDEO, TIMEOUT, REDUCED-MOTION OU SESSÃO JÁ VISTA.
  // revealNav() ANTES DO initHero() — SE O HERO LANÇAR EXCEÇÃO, O MENU NÃO FICA PRESO.
  initIntro(() => {
    revealNav();
    initHero();
  });

  // SEÇÕES 2–7 — SCROLLTRIGGERS PRÓPRIOS, INDEPENDENTES DA INTRO.
  initSobre();
  initMarcas();
  initParaQuemE();
  initComoFunciona();
  initDepoimentos();
  initCta();
});