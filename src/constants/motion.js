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

/* ------ OVERLAP ------ */

export const OVERLAP = {
  tight: '-=0.3',
  base: '-=0.6'
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

export const REVEAL_FROM_DEEP = {
  ...REVEAL_FROM,
  y: 64
};

/* ------ TIMEOUTS (MS) ------ */

export const TIMEOUT = {
  introFallback: 6000,
  introFallbackMax: 8000,
  introEndedBuffer: 500
};

/* ------ ROLETA DO EYEBROW ------ */

export const ROULETTE = {
  cycleMs: 3000,
  resetDelayMs: 550,  // > 0.5s DA TRANSITION CSS — SALTO SÓ APÓS O DESLIZE TERMINAR
  widthPadPx: 4
};

/* ------ SEÇÃO 0 — NAVEGAÇÃO ------ */

export const NAV = {
  overlayDuration: 0.7,
  overlayEase: 'expo.out',
  overlayCloseDuration: 0.5,
  overlayCloseEase: 'power3.out',
  itemStagger: 0.07,
  itemShiftX: -24,               // DESLOCAMENTO HORIZONTAL INICIAL DOS ITENS (px)
  hamburgerDuration: 0.35,
  barShiftY: -20                 // ENTRADA DA BARRA VINDA DE CIMA (px)
};

/* ------ SEÇÃO 0 — OVERLAY PLANOS ------ */

export const PLANOS = {
  expandDuration: 0.5,
  collapseDuration: 0.4
};

/* ------ SEÇÃO 2 — SOBRE — CARDS STACK ------ */
// CSS TRANSITION, NÃO GSAP.

export const CARDS = {
  transitionMs: 800,
  transitionEase: 'cubic-bezier(0.16, 1, 0.3, 1)'
};

/* ------ SEÇÃO 4 — PARA QUEM É ------ */

export const PARA_QUEM = {
  revealStart: 'top 75%',
  listStagger: 0.08,
  switchDelayMs: 250
};

/* ------ SEÇÃO 5 — COMO FUNCIONA — STEPPER ------ */

export const STEPPER = {
  start: 'top top',
  end: '+=180%',
  scrub: 1,
  drawUnits: 5,
  curveTension: 0.5,
  coordPrecision: 2,
  resizeDebounceMs: 200,
  resizeThresholdPx: 120   // IGNORA VARIAÇÃO DE ALTURA DA BARRA DE ENDEREÇO NO MOBILE
};

// CLIP ABRE 16px ACIMA DA BORDA — EVITA CORTAR O PIN (DIÂMETRO + ANEL DE GLOW).

export const STEPPER_REVEAL_FROM = {
  clipPath: 'inset(0px 0px 100% 0px)',
  y: REVEAL_FROM.y,
  autoAlpha: 0
};

export const STEPPER_REVEAL_TO = {
  clipPath: 'inset(-16px 0px 0% 0px)',
  y: 0,
  autoAlpha: 1
};

/* ------ SEÇÃO 6 — DEPOIMENTOS ------ */
// CSS TRANSITION PARA TROCA DE CARD — VALORES INJETADOS COMO CUSTOM PROPERTIES.

export const DEPOIMENTOS = {
  visibleRange: 2,
  transitionMs: 600,
  transitionEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
  staggerMs: 100,
  revealStart: 'top 70%'
};

/* ------ SEÇÃO 7 — CTA ------ */

export const CTA = {
  revealStart: 'top 75%',
  modalDuration: 0.4
};