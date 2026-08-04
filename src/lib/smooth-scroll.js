/* ========================================
   LIB — SMOOTH SCROLL
   ======================================== */

// LENIS SINCRONIZADO AO TICKER DO GSAP — FONTE ÚNICA DE SCROLL.

import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';
import { LENIS_CONFIG } from '../constants/lenis.js';

let lenis = null;

export function initSmoothScroll() {
  if (lenis) return lenis;

  lenis = new Lenis(LENIS_CONFIG);

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}