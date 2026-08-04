/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from '../lib/gsap.js';
import { EASE, NAV, PLANOS, REVEAL_FROM, REVEAL_TO } from '../constants/motion.js';

/* ========================================
   SEÇÃO 0 — NAVEGAÇÃO — NAVBAR + OVERLAYS
   ======================================== */

let _controller = null;
let _refs = null;
let _lenis = null;
let _activeId = null;
let _overlayZ = 0;

// OFFSET FIXO: BARRA 2px + GAP 5px — ATUALIZAR SE O CSS MUDAR.
const BAR_SHIFT = 7;

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------ NAVBAR ------ */
// NASCE OCULTA — REVELADA POR revealNav() AO FIM DO INTRO.

function prepareNavBar(bar) {
  gsap.set(bar, { autoAlpha: 0, y: NAV.barShiftY, pointerEvents: 'none' });
}

export function revealNav() {
  const bar = document.querySelector('.nav-bar');
  if (!bar) return;

  // INTERAÇÃO ATIVA NO onStart — onComplete NÃO RODA SE O TWEEN FOR INTERROMPIDO.
  const enableInteraction = () => { bar.style.pointerEvents = 'auto'; };

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

/* ------ HAMBÚRGUER ------ */

function animateHamburger(bars, open) {
  const duration = prefersReduced() ? 0 : NAV.hamburgerDuration;
  const [top, middle, bottom] = bars;

  if (open) {
    gsap.to(top,    { y: BAR_SHIFT,  rotate: 45,  duration, ease: EASE.out });
    gsap.to(middle, { autoAlpha: 0,  scaleX: 0,   duration, ease: EASE.out });
    gsap.to(bottom, { y: -BAR_SHIFT, rotate: -45, duration, ease: EASE.out });
    return;
  }

  gsap.to(top,    { y: 0, rotate: 0, autoAlpha: 1, scaleX: 1, duration, ease: EASE.out });
  gsap.to(middle, { y: 0, autoAlpha: 1, scaleX: 1, duration, ease: EASE.out });
  gsap.to(bottom, { y: 0, rotate: 0, autoAlpha: 1, scaleX: 1, duration, ease: EASE.out });
}

/* ------ BOTÃO FECHAR ------ */

function drawCloseIcon(overlay) {
  const bars = overlay.querySelectorAll('.nav-overlay__close-bar');
  if (!bars.length) return;

  const duration = prefersReduced() ? 0 : NAV.hamburgerDuration;

  gsap.fromTo(
    bars,
    { scaleX: 0, rotate: 0 },
    { scaleX: 1, rotate: (i) => (i === 0 ? 45 : -45), duration, ease: EASE.out }
  );
}

/* ------ STAGGER DOS ITENS ------ */

function revealItems(overlay) {
  const groups = overlay.querySelectorAll('[data-nav-stagger]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const items = Array.from(group.children);
    if (!items.length) return;

    const from = prefersReduced()
      ? { autoAlpha: 0 }
      : { ...REVEAL_FROM, x: NAV.itemShiftX };

    gsap.fromTo(items, from, {
      ...REVEAL_TO,
      x: 0,
      duration: NAV.overlayDuration,
      ease: EASE.out,
      stagger: NAV.itemStagger,
      clearProps: 'transform,clipPath'
    });
  });
}

/* ------ REVEAL DA FOTO — OVERLAY IVAN ------ */
// CLIP-PATH + Y, MESMO PADRÃO DAS SEÇÕES DA LP.

function revealIvanPhoto(overlay) {
  const photo = overlay.querySelector('.nav-ivan__photo');
  if (!photo) return;

  if (prefersReduced()) {
    gsap.set(photo, { autoAlpha: 1 });
    return;
  }

  gsap.fromTo(photo, { ...REVEAL_FROM }, {
    ...REVEAL_TO,
    duration: NAV.overlayDuration + 0.2,
    ease: EASE.out,
    clearProps: 'transform,clipPath'
  });
}

/* ========================================
   SEÇÃO PLANOS — CARDS EXPANSÍVEIS
   ======================================== */

// EXCEÇÃO À REGRA DE NÃO ANIMAR height: ACORDEÃO PRECISA EMPURRAR O CONTEÚDO SEGUINTE.
// ALTURA MEDIDA COM scrollHeight E TROCADA POR 'auto' AO FIM — ACOMPANHA REQUEBRAS.

export function expandPlanBody(hidden) {
  if (!hidden) return;

  gsap.killTweensOf(hidden);

  if (prefersReduced()) {
    gsap.set(hidden, { height: 'auto' });
    return;
  }

  const fullH = hidden.scrollHeight;

  gsap.to(hidden, {
    height: fullH,
    duration: PLANOS.expandDuration,
    ease: EASE.out,
    onComplete: () => gsap.set(hidden, { height: 'auto' })
  });
}

export function collapsePlanBody(hidden, instant = false) {
  if (!hidden) return;

  gsap.killTweensOf(hidden);

  if (instant || prefersReduced()) {
    gsap.set(hidden, { height: 0 });
    return;
  }

  // SAI DE 'auto' PARA PX ANTES DE ANIMAR — GSAP NÃO INTERPOLA A PARTIR DE auto.
  gsap.set(hidden, { height: hidden.scrollHeight });

  gsap.to(hidden, {
    height: 0,
    duration: PLANOS.collapseDuration,
    ease: EASE.out
  });
}

/* ------ ABERTURA DO OVERLAY ------ */

function openOverlay(id) {
  const overlay = _refs.overlays.get(id);
  if (!overlay || _activeId === id) return;

  const previous = _activeId ? _refs.overlays.get(_activeId) : null;

  _activeId = id;
  overlay.style.zIndex = String(_overlayZ);

  _lenis?.stop?.();

  overlay.setAttribute('aria-hidden', 'false');
  _refs.hamburger.setAttribute('aria-expanded', 'true');
  _refs.hamburger.setAttribute('aria-label', 'Fechar menu');
  _refs.hamburger.setAttribute('aria-controls', overlay.id);

  animateHamburger(_refs.bars, true);
  gsap.killTweensOf(overlay);

  // RECOLHE O ANTERIOR SÓ QUANDO O NOVO JÁ COBRIU A TELA.
  const retirePrevious = () => {
    if (!previous) return;
    gsap.killTweensOf(previous);
    gsap.set(previous, { autoAlpha: 0, xPercent: -100 });
    previous.setAttribute('aria-hidden', 'true');
  };

  if (prefersReduced()) {
    gsap.set(overlay, { xPercent: 0 });
    gsap.fromTo(overlay,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: NAV.overlayDuration, onComplete: retirePrevious }
    );
  } else {
    gsap.set(overlay, { autoAlpha: 1 });
    gsap.fromTo(overlay,
      { xPercent: -100 },
      { xPercent: 0, duration: NAV.overlayDuration, ease: NAV.overlayEase, onComplete: retirePrevious }
    );
  }

  overlay.scrollTop = 0;
  drawCloseIcon(overlay);
  if (id === 'ivan') revealIvanPhoto(overlay);
  revealItems(overlay);
  overlay.querySelector('[data-nav-close]')?.focus({ preventScroll: true });
}

/* ------ FECHAMENTO DO OVERLAY ------ */

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

  // LENIS RETOMA APÓS A SAÍDA — EVITA SCROLL POR BAIXO DO OVERLAY AINDA VISÍVEL.
  const finish = () => {
    overlay.setAttribute('aria-hidden', 'true');
    _lenis?.start?.();
  };

  gsap.killTweensOf(overlay);

  if (prefersReduced()) {
    gsap.to(overlay, { autoAlpha: 0, duration: NAV.overlayCloseDuration, onComplete: finish });
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

/* ------ INIT ------ */

export function initNavAnimations(elements, lenis) {
  destroyNavAnimations();

  _refs = elements;
  _lenis = lenis || null;

  const { signal } = (_controller = new AbortController());

  prepareNavBar(_refs.bar);

  // x: 0 OBRIGATÓRIO — EVITA QUE TRANSFORM RESIDUAL DO CSS SOME COM xPercent.
  _refs.overlays.forEach((overlay) => {
    overlay.style.zIndex = '';
    gsap.set(overlay, { autoAlpha: 0, xPercent: -100, x: 0 });
    overlay.setAttribute('aria-hidden', 'true');
  });

  // Z-INDEX LIDO DO PRÓPRIO OVERLAY — --nav-overlay-z NÃO ESTÁ EM :root.
  const firstOverlay = _refs.overlays.values().next().value;
  const rawZ = getComputedStyle(firstOverlay).getPropertyValue('--nav-overlay-z').trim();
  _overlayZ = parseInt(rawZ, 10) || 100;

  _refs.hamburger.addEventListener(
    'click',
    () => { if (_activeId) closeOverlay(); else openOverlay('menu'); },
    { signal }
  );

  document.querySelectorAll('[data-nav-open]').forEach((btn) => {
    btn.addEventListener('click', () => openOverlay(btn.dataset.navOpen), { signal });
  });

  document.querySelectorAll('[data-nav-close]').forEach((btn) => {
    btn.addEventListener('click', closeOverlay, { signal });
  });

  document.addEventListener(
    'keydown',
    (e) => { if (e.key === 'Escape' && _activeId) closeOverlay(); },
    { signal }
  );
}

/* ------ CLEANUP ------ */

export function destroyNavAnimations() {
  _controller?.abort();
  _controller = null;

  if (_refs) {
    _refs.overlays.forEach((overlay) => {
      gsap.killTweensOf(overlay);
      overlay.style.zIndex = '';
    });
    gsap.killTweensOf(_refs.bars);
  }

  if (_activeId) _lenis?.start?.();

  _activeId = null;
  _refs = null;
  _lenis = null;
}

/* ------ ACESSO EXTERNO ------ */

export function closeActiveOverlay() {
  closeOverlay();
}