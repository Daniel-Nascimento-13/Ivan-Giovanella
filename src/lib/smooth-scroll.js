/* ========================================
   SMOOTH SCROLL — LENIS + GSAP TICKER
   ======================================== */

import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';
import { LENIS_CONFIG } from '../constants/lenis.js';

let lenis = null;

/* ------ INIT — SINCRONIZA LENIS AO TICKER DO GSAP ------ */

export function initSmoothScroll() {
  if (lenis) return lenis;

  lenis = new Lenis(LENIS_CONFIG);

  // PADRÃO OFICIAL LENIS: SCROLLTRIGGER.UPDATE NO EVENTO DE SCROLL
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/* ------ SINGLETON — ACESSO PARA SCROLL-TO / DESTROY FUTUROS ------ */

export function getLenis() {
  return lenis;
}