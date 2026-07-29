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

/* ------ SEÇÃO 4 — PARA QUEM É — PERFIS DE CONTRATAÇÃO ------ */
/* REVEAL DE ENTRADA (HEADER + LISTA DE BOTÕES) + TIMING DA TROCA DE CARD. */
/* A ABERTURA/FECHAMENTO DO CARD É TRANSITION CSS — SÓ O ATRASO DA TROCA VIVE AQUI. */

export const PARA_QUEM = {
  revealStart: 'top 75%',   // DISPARO DO REVEAL NO SCROLLTRIGGER
  listStagger: 0.08,        // ATRASO ENTRE OS BOTÕES NA ENTRADA
  switchDelayMs: 250        // ESPERA O CARD FECHAR ANTES DE ABRIR COM NOVO CONTEÚDO
};

/* ------ SEÇÃO 5 — COMO FUNCIONA — STEPPER ANIMADO ------ */
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

/* ------ ROLETA DO EYEBROW — SEÇÃO 5 — COMO FUNCIONA ------ */
/* AS SEÇÕES 1, 2 E 3 TRAZEM ESSES NÚMEROS LITERAIS NO PRÓPRIO ARQUIVO. */
/* A SEÇÃO 5 SEGUE A REGRA DO PROJETO: TODA CONSTANTE VIVE AQUI. */

export const ROULETTE = {
  cycleMs: 3000,      // INTERVALO ENTRE PALAVRAS — MESMO VALOR DAS SEÇÕES ANTERIORES
  resetDelayMs: 550,  // > 0.5s DA TRANSITION CSS — O SALTO SÓ APÓS O DESLIZE TERMINAR
  widthPadPx: 4       // FOLGA À DIREITA DA PÍLULA — MESMO VALOR DAS SEÇÕES ANTERIORES
};

/* ------ SEÇÃO 6 — DEPOIMENTOS — CARDS EMPILHADOS ------ */
/* A TROCA DE CARD É TRANSIÇÃO CSS (MICRO-INTERAÇÃO), NÃO GSAP — ESTES VALORES SÃO */
/* INJETADOS NO CSS COMO CUSTOM PROPERTIES, IGUAL AO CARDS STACK DA SEÇÃO 2. */

export const DEPOIMENTOS = {
  visibleRange: 2,                                 // ATÉ ±2 CARDS VISÍVEIS AO LADO DO ATIVO
  transitionMs: 600,                               // DURAÇÃO DA TROCA DE POSIÇÃO
  transitionEase: 'cubic-bezier(0.16, 1, 0.3, 1)', // EXPO.OUT EQUIVALENTE EM CSS
  staggerMs: 100,                                  // ATRASO ENTRE CARDS NA ENTRADA
  revealStart: 'top 70%'                           // DISPARO DO REVEAL NO SCROLLTRIGGER
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

/* ------ SEÇÃO 7 — CTA FINAL — CONVERSÃO ------ */
/* REVEAL DO HEADER/BOTÕES + ABERTURA DO MODAL. A ROLETA DO EYEBROW REUSA ROULETTE. */
/* A ANIMAÇÃO DO FAB SOCIAL É TRANSITION CSS (MICRO-INTERAÇÃO) — NÃO ENTRA AQUI. */

export const CTA = {
  revealStart: 'top 75%',   // DISPARO DO REVEAL NO SCROLLTRIGGER
  modalDuration: 0.4        // ABERTURA/FECHAMENTO DO MODAL — CLIP-PATH + AUTOALPHA
};

/* ------ SEÇÃO 0 — NAVEGAÇÃO — NAVBAR + OVERLAYS ------ */
/* FONTE ÚNICA DOS NÚMEROS DA NAVEGAÇÃO — nav.js NÃO DECLARA CONSTANTES PRÓPRIAS. */
/* O DESLOCAMENTO itemShiftX VIVE AQUI PELO MESMO MOTIVO DOS DEMAIS: NENHUM MAGIC */
/* NUMBER NOS ARQUIVOS DE SEÇÃO/ANIMAÇÃO. */

export const NAV = {
  overlayDuration: 0.7,          // ENTRADA DO OVERLAY — translateX(-100%) → 0
  overlayEase: 'expo.out',
  overlayCloseDuration: 0.5,     // SAÍDA DO OVERLAY — translateX(0) → -100%
  overlayCloseEase: 'power3.out',
  itemStagger: 0.07,             // ATRASO ENTRE OS ITENS NA REVELAÇÃO
  itemShiftX: -24,               // DESLOCAMENTO HORIZONTAL INICIAL DOS ITENS (px)
  hamburgerDuration: 0.35,       // HAMBÚRGUER ↔ X
  barShiftY: -20                 // DESLOCAMENTO INICIAL DA BARRA — ENTRADA VINDA DE CIMA (px)
};

/* ------ SEÇÃO 0 — OVERLAY PLANOS — CARDS EXPANSÍVEIS ------ */
/* MORA AQUI PELA MESMA REGRA DAS DEMAIS SEÇÕES: TODA CONSTANTE DE MOVIMENTO VIVE */
/* EM motion.js, NUNCA SOLTA NO ARQUIVO DE SEÇÃO/ANIMAÇÃO. */

export const PLANOS = {
  expandDuration: 0.5,    // ABERTURA DAS COBERTURAS OCULTAS
  collapseDuration: 0.4   // FECHAMENTO — LIGEIRAMENTE MAIS RÁPIDO QUE A ABERTURA
};