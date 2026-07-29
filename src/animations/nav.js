import { gsap } from '../lib/gsap.js';
import { EASE, NAV, PLANOS } from '../constants/motion.js';

/* ========================================
   SEÇÃO 0 — NAVEGAÇÃO — NAVBAR + OVERLAYS
   ======================================== */

// TIMELINES DO HAMBÚRGUER, ENTRADA/SAÍDA DOS OVERLAYS E STAGGER DOS ITENS.
// SCROLL = LENIS | MOVIMENTO = GSAP. AO ABRIR, lenis.stop(); AO FECHAR, lenis.start().
// O body NUNCA RECEBE overflow: hidden — QUEM TRAVA O SCROLL É O LENIS.
// TODOS OS NÚMEROS VÊM DE src/constants/motion.js (NAV).

let _controller = null;   // ABORTCONTROLLER — DERRUBA TODOS OS LISTENERS DE UMA VEZ
let _refs = null;
let _lenis = null;
let _activeId = null;     // CHAVE DO OVERLAY ABERTO (data-nav-overlay) OU null
let _overlayZ = 0;        // z-index DOS OVERLAYS — LIDO DO CSS (--nav-overlay-z) NO INIT

/* OFFSET FIXO DERIVADO DO CSS: BARRA 2px + GAP 5px */
// NÃO VAI PARA motion.js: É GEOMETRIA DE LAYOUT, NÃO TIMING.
// MEDIR EM RUNTIME (getBoundingClientRect / offsetTop) DEVOLVE ZERO NESTE CONTEXTO E
// AS DIAGONAIS DEIXAM DE CONVERGIR — O DESENHO VIRA UMA SETA (>) NO LUGAR DO ×.
// SE O gap OU A height DA BARRA MUDAREM NO CSS, ATUALIZAR ESTE VALOR JUNTO.
const BAR_SHIFT = 7;

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------ NAVBAR — REPOUSO E REVELAÇÃO APÓS O INTRO ------ */
// A BARRA NASCE OCULTA NO CSS (visibility/opacity) E O GSAP ASSUME NO initNav().
// QUEM A REVELA É O revealNav(), CHAMADO NO FIM DO INTRO — NUNCA O PRÓPRIO initNav().

function prepareNavBar(bar) {
  gsap.set(bar, { autoAlpha: 0, y: NAV.barShiftY, pointerEvents: 'none' });
}

/* REVELA A NAVBAR APÓS O FIM DO INTRO */
export function revealNav() {
  const bar = document.querySelector('.nav-bar');
  if (!bar) return;

  /* REATIVA INTERAÇÃO APÓS REVEAL DA NAVBAR */
  // NO onStart, NÃO NO onComplete: SE O TWEEN FOR INTERROMPIDO (killTweensOf, SEGUNDA
  // CHAMADA DE revealNav, ABA EM SEGUNDO PLANO) O onComplete NÃO RODA E A BARRA FICARIA
  // PERMANENTEMENTE INCLICÁVEL — EXATAMENTE A FALHA QUE ESTE BLOCO EXISTE PARA EVITAR.
  const enableInteraction = () => {
    bar.style.pointerEvents = 'auto';
  };

  /* REDUCED MOTION — APARECE SEM DESLIZE */
  if (prefersReduced()) {
    gsap.set(bar, { autoAlpha: 1, y: 0 });
    enableInteraction();
    return;
  }

  gsap.to(bar, {
    autoAlpha: 1,
    y: 0,
    duration: NAV.overlayDuration,
    ease: NAV.overlayEase,
    onStart: enableInteraction
  });
}

/* ------ HAMBURGER — 3 BARRAS ↔ × ------ */
// A BARRA DO MEIO SOME (opacity + scaleX) E AS EXTERNAS CONVERGEM AO CENTRO E CRUZAM.
// O DESLOCAMENTO É O BAR_SHIFT FIXO DECLARADO NO TOPO — VER A NOTA LÁ.

/* ANIMAÇÃO DO HAMBÚRGUER — FORMA X AO ABRIR */
function animateHamburger(bars, open) {
  const duration = prefersReduced() ? 0 : NAV.hamburgerDuration;
  const [top, middle, bottom] = bars;

  if (open) {
    /* BARRA SUPERIOR — DESCE AO CENTRO E ROTACIONA +45° */
    gsap.to(top, { y: BAR_SHIFT, rotate: 45, duration, ease: EASE.out });

    /* BARRA DO MEIO — DESAPARECE */
    gsap.to(middle, { autoAlpha: 0, scaleX: 0, duration, ease: EASE.out });

    /* BARRA INFERIOR — SOBE AO CENTRO E ROTACIONA -45° */
    gsap.to(bottom, { y: -BAR_SHIFT, rotate: -45, duration, ease: EASE.out });
    return;
  }

  /* FECHAMENTO — ESPELHO EXATO: TODAS AS BARRAS VOLTAM AO REPOUSO */
  gsap.to(top, { y: 0, rotate: 0, autoAlpha: 1, scaleX: 1, duration, ease: EASE.out });
  gsap.to(middle, { y: 0, autoAlpha: 1, scaleX: 1, duration, ease: EASE.out });
  gsap.to(bottom, { y: 0, rotate: 0, autoAlpha: 1, scaleX: 1, duration, ease: EASE.out });
}

/* ------ BOTÃO FECHAR — AS DUAS BARRAS CRUZAM EM × ------ */

function drawCloseIcon(overlay) {
  const bars = overlay.querySelectorAll('.nav-overlay__close-bar');
  if (!bars.length) return;

  const duration = prefersReduced() ? 0 : NAV.hamburgerDuration;

  gsap.fromTo(
    bars,
    { scaleX: 0, rotate: 0 },
    {
      scaleX: 1,
      rotate: (i) => (i === 0 ? 45 : -45),
      duration,
      ease: EASE.out
    }
  );
}

/* ------ STAGGER DOS ITENS — REVELAÇÃO DO CONTEÚDO DO OVERLAY ------ */
// ALVOS: FILHOS DIRETOS DE QUALQUER [data-nav-stagger] DENTRO DO OVERLAY ABERTO.

function revealItems(overlay) {
  const groups = overlay.querySelectorAll('[data-nav-stagger]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const items = Array.from(group.children);
    if (!items.length) return;

    /* REDUCED MOTION — SEM DESLOCAMENTO, SÓ OPACIDADE */
    const from = prefersReduced()
      ? { autoAlpha: 0 }
      : { autoAlpha: 0, x: NAV.itemShiftX };

    gsap.fromTo(
      items,
      from,
      {
        autoAlpha: 1,
        x: 0,
        duration: NAV.overlayDuration,
        ease: EASE.out,
        stagger: NAV.itemStagger,
        clearProps: 'transform' /* DEVOLVE O LAYOUT AO CSS APÓS A ENTRADA */
      }
    );
  });
}

/* ========================================
   SEÇÃO PLANOS — CARDS EXPANSÍVEIS
   ======================================== */

/* ------ EXPANSÃO DO CARD ------ */
// EXCEÇÃO DOCUMENTADA À REGRA DE PERFORMANCE (NUNCA ANIMAR height): UM ACORDEÃO
// PRECISA EMPURRAR O CONTEÚDO SEGUINTE, E clip-path/scale NÃO PROVOCAM REFLOW.
// A ALTURA É MEDIDA COM scrollHeight E TROCADA POR 'auto' AO FIM DA ABERTURA, PARA O
// CARD ACOMPANHAR REQUEBRAS POSTERIORES (RESIZE, FONTE CARREGANDO TARDE).

export function expandPlanBody(hidden) {
  if (!hidden) return;

  gsap.killTweensOf(hidden);

  if (prefersReduced()) {
    gsap.set(hidden, { height: 'auto' });
    return;
  }

  /* MEDE A ALTURA REAL ANTES DE ANIMAR */
  const fullH = hidden.scrollHeight;

  gsap.to(hidden, {
    height: fullH,
    duration: PLANOS.expandDuration,
    ease: EASE.out,
    /* TROCA PARA 'auto' NO FIM — O CARD PASSA A ACOMPANHAR REQUEBRAS DE LINHA */
    /* POSTERIORES (RESIZE, FONTE CARREGANDO TARDE) SEM FICAR PRESO AO PX MEDIDO. */
    onComplete: () => gsap.set(hidden, { height: 'auto' })
  });
}

export function collapsePlanBody(hidden, instant = false) {
  if (!hidden) return;

  gsap.killTweensOf(hidden);

  /* instant — ESTADO DE REPOUSO NO INIT, SEM ANIMAÇÃO DE FECHAMENTO */
  if (instant || prefersReduced()) {
    gsap.set(hidden, { height: 0 });
    return;
  }

  /* SAI DE 'auto' PARA PIXELS ANTES DE ANIMAR — GSAP NÃO INTERPOLA A PARTIR DE auto */
  gsap.set(hidden, { height: hidden.scrollHeight });

  gsap.to(hidden, {
    height: 0,
    duration: PLANOS.collapseDuration,
    ease: EASE.out
  });
}

/* ------ ABRE O OVERLAY SOLICITADO ------ */

function openOverlay(id) {
  const overlay = _refs.overlays.get(id);
  if (!overlay || _activeId === id) return;

  /* TROCA DIRETA ENTRE OVERLAYS — O NOVO DESLIZA POR CIMA DO ANTERIOR, QUE SÓ SAI DE */
  /* CENA DEPOIS DE COBERTO. ESCONDER O ANTERIOR NA HORA DEIXARIA A PÁGINA APARECER */
  /* ENQUANTO O NOVO AINDA ESTÁ FORA DA TELA (xPercent -100). */
  const previous = _activeId ? _refs.overlays.get(_activeId) : null;

  _activeId = id;
  overlay.style.zIndex = String(_overlayZ);  /* Z-INDEX FIXO — OVERLAYS ABREM UM DE CADA VEZ */

  /* LENIS PARA — O body NÃO RECEBE overflow: hidden */
  _lenis?.stop?.();

  overlay.setAttribute('aria-hidden', 'false');
  _refs.hamburger.setAttribute('aria-expanded', 'true');
  _refs.hamburger.setAttribute('aria-label', 'Fechar menu');
  _refs.hamburger.setAttribute('aria-controls', overlay.id);

  animateHamburger(_refs.bars, true);

  gsap.killTweensOf(overlay);

  /* RECOLHE O ANTERIOR SÓ QUANDO O NOVO JÁ COBRIU A TELA */
  const retirePrevious = () => {
    if (!previous) return;
    gsap.killTweensOf(previous);
    gsap.set(previous, { autoAlpha: 0, xPercent: -100 });
    previous.setAttribute('aria-hidden', 'true');
  };

  /* REDUCED MOTION — SEM translateX, APENAS OPACIDADE */
  if (prefersReduced()) {
    gsap.set(overlay, { xPercent: 0 });
    gsap.fromTo(
      overlay,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: NAV.overlayDuration, onComplete: retirePrevious }
    );
  } else {
    gsap.set(overlay, { autoAlpha: 1 });
    gsap.fromTo(
      overlay,
      { xPercent: -100 },
      {
        xPercent: 0,
        duration: NAV.overlayDuration,
        ease: NAV.overlayEase,
        onComplete: retirePrevious
      }
    );
  }

  /* O OVERLAY PODE TER FICADO ROLADO DE UMA ABERTURA ANTERIOR */
  overlay.scrollTop = 0;

  drawCloseIcon(overlay);
  revealItems(overlay);

  /* FOCO NO BOTÃO FECHAR — DIÁLOGO MODAL PRECISA RECEBER O FOCO AO ABRIR */
  overlay.querySelector('[data-nav-close]')?.focus({ preventScroll: true });
}

/* ------ FECHA O OVERLAY ATIVO ------ */

function closeOverlay() {
  if (!_activeId) return;

  const overlay = _refs.overlays.get(_activeId);
  _activeId = null;

  _refs.hamburger.setAttribute('aria-expanded', 'false');
  _refs.hamburger.setAttribute('aria-label', 'Abrir menu');
  _refs.hamburger.setAttribute('aria-controls', 'nav-overlay-menu');

  animateHamburger(_refs.bars, false);

  if (!overlay) {
    _lenis?.start?.();
    return;
  }

  const finish = () => {
    overlay.setAttribute('aria-hidden', 'true');
    /* LENIS RETOMA SÓ APÓS A SAÍDA — EVITA SCROLL POR BAIXO DO OVERLAY AINDA VISÍVEL */
    _lenis?.start?.();
  };

  gsap.killTweensOf(overlay);

  if (prefersReduced()) {
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: NAV.overlayCloseDuration,
      onComplete: finish
    });
    return;
  }

  gsap.to(overlay, {
    xPercent: -100,
    duration: NAV.overlayCloseDuration,
    ease: NAV.overlayCloseEase,
    onComplete: () => {
      gsap.set(overlay, { autoAlpha: 0 });
      finish();
    }
  });
}

/* ------ INIT — LISTENERS E ESTADO DE REPOUSO ------ */

export function initNavAnimations(elements, lenis) {
  destroyNavAnimations();

  _refs = elements;
  _lenis = lenis || null;

  const { signal } = (_controller = new AbortController());

  /* BARRA OCULTA ATÉ O FIM DO INTRO — A ENTRADA É DISPARADA POR revealNav() */
  prepareNavBar(_refs.bar);

  /* ESTADO DE REPOUSO — GSAP ASSUME visibility/opacity A PARTIR DAQUI */
  /* x: 0 É OBRIGATÓRIO E NÃO REDUNDANTE: SE SOBRAR QUALQUER TRANSFORM VINDO DO CSS, */
  /* O GSAP O TERIA LIDO COMO x EM PIXELS E SOMADO AO xPercent, PARKANDO O OVERLAY */
  /* FORA DA TELA MESMO DEPOIS DE ANIMAR xPercent → 0. */
  _refs.overlays.forEach((overlay) => {
    overlay.style.zIndex = '';
    gsap.set(overlay, { autoAlpha: 0, xPercent: -100, x: 0 });
    overlay.setAttribute('aria-hidden', 'true');
  });

  /* Z-INDEX LIDO DA VARIÁVEL CSS — IMUNE A "auto" NO MOMENTO DO INIT */
  // LIDO DO PRÓPRIO OVERLAY, NÃO DE :root: --nav-overlay-z É DECLARADA NO BLOCO
  // .nav-bar/.nav-overlay DO main.css, ENTÃO EM document.documentElement VIRIA VAZIA
  // E A LEITURA CAIRIA SEMPRE NO FALLBACK, DESLIGANDO O CSS COMO FONTE DA VERDADE.
  // CUSTOM PROPERTY NÃO DEPENDE DE LAYOUT — NUNCA DEVOLVE "auto".
  const firstOverlay = _refs.overlays.values().next().value;
  const rawZ = getComputedStyle(firstOverlay)
    .getPropertyValue('--nav-overlay-z')
    .trim();
  _overlayZ = parseInt(rawZ, 10) || 100;

  /* HAMBÚRGUER — ALTERNA ENTRE ABRIR O MENU E FECHAR O OVERLAY ATIVO */
  _refs.hamburger.addEventListener(
    'click',
    () => {
      if (_activeId) closeOverlay();
      else openOverlay('menu');
    },
    { signal }
  );

  /* [data-nav-open] — ABRE O OVERLAY NOMEADO (O MENU SAI DE CENA NA TROCA) */
  document.querySelectorAll('[data-nav-open]').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => openOverlay(btn.dataset.navOpen),
      { signal }
    );
  });

  /* [data-nav-close] — BOTÃO FECHAR DE CADA OVERLAY */
  document.querySelectorAll('[data-nav-close]').forEach((btn) => {
    btn.addEventListener('click', closeOverlay, { signal });
  });

  /* ESCAPE — FECHA O OVERLAY ATIVO */
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && _activeId) closeOverlay();
    },
    { signal }
  );
}

/* ------ CLEANUP — DERRUBA LISTENERS E TWEENS ------ */

export function destroyNavAnimations() {
  _controller?.abort();
  _controller = null;

  if (_refs) {
    _refs.overlays.forEach((overlay) => {
      gsap.killTweensOf(overlay);
      overlay.style.zIndex = ''; /* DEVOLVE O EMPILHAMENTO AO CSS */
    });
    gsap.killTweensOf(_refs.bars);
  }

  /* O LENIS NÃO PODE FICAR PARADO SE A NAV FOR DERRUBADA COM OVERLAY ABERTO */
  if (_activeId) _lenis?.start?.();

  _activeId = null;
  _refs = null;
  _lenis = null;
}

/* ------ ACESSO EXTERNO — USADO PELO FORM DA AVALIAÇÃO APÓS O SUBMIT ------ */

export function closeActiveOverlay() {
  closeOverlay();
}
