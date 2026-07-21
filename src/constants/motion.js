/* ========================================
   CONSTANTES DE MOVIMENTO — GSAP
   ======================================== */

/* ------ EASES ------ */

export const EASE = {
  out: 'power3.out',
  smooth: 'expo.out',
  loop: 'power1.inOut'
};

/* ------ DURAÇÕES ------ */

export const DURATION = {
  fast: 0.6,
  base: 0.8,
  slow: 1.0,
  cinematic: 1.2
};

/* ------ STAGGER ------ */

export const STAGGER = {
  tight: 0.1,
  base: 0.2,
  loose: 0.3
};

/* ------ TIMEOUTS (MS) ------ */

export const TIMEOUT = {
  introFallback: 6000,
  introFallbackMax: 8000,
  introEndedBuffer: 500
};

/* ------ REVEAL PADRÃO ------ */

export const REVEAL_FROM = {
  clipPath: 'inset(0 0 100% 0)',
  y: 40,
  autoAlpha: 0
};

export const REVEAL_TO = {
  clipPath: 'inset(0 0 0% 0)',
  y: 0,
  autoAlpha: 1
};