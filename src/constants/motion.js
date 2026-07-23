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

/* ------ OVERLAP — POSIÇÃO RELATIVA ENTRE TWEENS NA TIMELINE ------ */

export const OVERLAP = {
  tight: '-=0.3',
  base: '-=0.6'
};

/* ------ CARDS STACK (SEÇÃO 2 — SOBRE) — CSS TRANSITION, NÃO GSAP ------ */
/* NAVEGAÇÃO MANUAL (ARROW + DOTS) — SEM ROTAÇÃO AUTOMÁTICA */

export const CARDS = {
  transitionMs: 800,                               // DURAÇÃO DA TROCA (MS)
  transitionEase: 'cubic-bezier(0.16, 1, 0.3, 1)'  // EXPO.OUT EQUIVALENTE EM CSS
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

/* ------ REVEAL PROFUNDO — MAIOR DESLOCAMENTO VERTICAL (FEEL CINEMATOGRÁFICO) ------ */

export const REVEAL_FROM_DEEP = {
  ...REVEAL_FROM,
  y: 64
};

/* ------ SEÇÃO 4 — COMO FUNCIONA — STEPPER ANIMADO ------ */
/* FONTE ÚNICA DOS NÚMEROS DA SEÇÃO — como-funciona.js NÃO DECLARA CONSTANTES PRÓPRIAS */

export const STEPPER = {
  start: 'top top',        // PIN COMEÇA QUANDO A SEÇÃO ENCOSTA NO TOPO
  end: '+=180%',           // DISTÂNCIA DE SCROLL COM A SEÇÃO PINADA (1.8x A VIEWPORT)
  scrub: 1,                // SUAVIZAÇÃO DO SCRUB — A LINHA SEGUE O SCROLL COM 1s DE INÉRCIA
  drawUnits: 5,            // DURAÇÃO DO DESENHO DA LINHA NA TIMELINE (UNIDADES INTERNAS)
  curveTension: 0.5,       // FORÇA DOS CONTROL POINTS — 0.5 = TANGENTE VERTICAL SUAVE
  coordPrecision: 2,       // CASAS DECIMAIS DAS COORDENADAS DO PATH
  resizeDebounceMs: 200,   // DEBOUNCE DO REBUILD DE GEOMETRIA
  resizeThresholdPx: 120   // IGNORA VARIAÇÃO DE ALTURA DA BARRA DE ENDEREÇO NO MOBILE
};

/* REVEAL DO CARD — O CLIP ABRE 16px ACIMA DA BORDA PARA NÃO CORTAR O PIN */
/* (O PIN ESTOURA O TOPO DO CARD EM ~11px: METADE DO DIÂMETRO + O ANEL DE GLOW) */

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