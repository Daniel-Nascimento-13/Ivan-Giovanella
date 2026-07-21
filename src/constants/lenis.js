/* ========================================
   CONSTANTES — LENIS (SCROLL SUAVE)
   ======================================== */

export const LENIS_CONFIG = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
};