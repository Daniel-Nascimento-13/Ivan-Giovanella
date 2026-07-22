import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { EASE, DURATION, STAGGER, REVEAL_FROM_DEEP, OVERLAP, CARDS } from '../constants/motion.js';

/* ========================================
   SEÇÃO 2 — SOBRE
   ======================================== */

let sobreTimeline = null;
let cardsCleanup = null;
const cardsTimeouts = [];

/* ------ ESTADOS DE REVEAL ------ */
/* FOTO: CLIP DA ESQUERDA + FADE — RETÂNGULO ABRE DA ESQUERDA PARA A DIREITA, SEM CORTE BRUSCO */
const PHOTO_FROM = { clipPath: 'inset(0 100% 0 0)', autoAlpha: 0 };
const PHOTO_TO   = { clipPath: 'inset(0 0% 0 0)',   autoAlpha: 1 };

/* TEXTO: translateY + autoAlpha (SEM CLIP) — REUSA O DESLOCAMENTO PROFUNDO */
const TEXT_FROM = { y: REVEAL_FROM_DEEP.y, autoAlpha: 0 };
const TEXT_TO   = { y: 0, autoAlpha: 1 };

/* ------ SELEÇÃO — ORDEM DEFINE O STAGGER: EYEBROW → NOME → PARÁGRAFO → STACK ------ */

function selectTextElements(section) {
  const eyebrow = section.querySelector('.sobre-eyebrow');
  const name    = section.querySelector('.sobre-name');
  const text    = section.querySelector('.sobre-text');
  const stack   = section.querySelector('.sobre-stack');

  return [eyebrow, name, text, stack].filter(Boolean);
}

/* ========================================
   CARDS STACK — NAVEGAÇÃO MANUAL (ARROW + DOTS, CSS TRANSITION, SEM GSAP)
   ======================================== */

/* SLOT 0 = TOPO | 1 = MEIO | 2 = TRÁS | DEMAIS = ESCONDIDO NO FUNDO */
const STACK_STATE = ['top', 'mid', 'back'];

function stateForSlot(slot) {
  return STACK_STATE[slot] || 'hidden';
}

/* APLICA O ESTADO — instant=true TROCA SEM TRANSIÇÃO (ESTADO INICIAL / RECICLAGEM) */
function setCardState(card, slot, instant) {
  card.className = 'sobre-card sobre-card--' + stateForSlot(slot) + (instant ? ' sobre-card--instant' : '');
  if (instant) {
    void card.offsetWidth; // FORÇA REFLOW — APLICA O ESTADO SEM ANIMAR
    card.classList.remove('sobre-card--instant');
  }
}

/* INICIALIZA O STACK E LIGA A NAVEGAÇÃO MANUAL */
function initCardsStack(section, prefersReducedMotion) {
  const stack = section.querySelector('.sobre-cards');
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll('.sobre-card'));
  if (!cards.length) return;

  const arrow = section.querySelector('.sobre-nav-arrow');
  const dots  = Array.from(section.querySelectorAll('.sobre-dot'));

  const n = cards.length;
  let currentTop = 0;

  /* TIMING VINDO DE motion.js → CSS TRANSITION VIA CUSTOM PROPERTY */
  stack.style.setProperty('--card-transition', `${CARDS.transitionMs}ms ${CARDS.transitionEase}`);

  /* SLOT DE CADA CARD DADO O CARD DO TOPO */
  const slotFor = (i, top) => (i - top + n) % n;

  /* ------ DOTS — REFLETE O CARD ATIVO ------ */
  const updateDots = (top) => {
    dots.forEach((dot, i) => {
      const active = i === top;
      dot.classList.toggle('sobre-dot--active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };

  /* ------ RENDER — POSICIONA TODOS OS CARDS PARA UM NOVO TOPO ------ */
  const render = (newTop, animate) => {
    const doAnimate = animate && !prefersReducedMotion;
    const prevTop = currentTop;

    cards.forEach((card, i) => {
      const slot = slotFor(i, newTop);

      if (doAnimate && i === prevTop && prevTop !== newTop) {
        /* CARD DO TOPO ATUAL SAI PARA BAIXO, DEPOIS RECICLA AO SLOT NOVO SEM ANIMAR */
        card.className = 'sobre-card sobre-card--exit';
        const t = setTimeout(() => setCardState(card, slot, true), CARDS.transitionMs);
        cardsTimeouts.push(t);
      } else {
        setCardState(card, slot, !doAnimate);
      }
    });

    currentTop = newTop;
    updateDots(newTop);
  };

  /* ------ ESTADO INICIAL — INSTANTÂNEO ------ */
  render(0, false);

  /* ------ NAVEGAÇÃO MANUAL ------ */
  const onArrow = () => render((currentTop + 1) % n, true); // PRÓXIMO — LOOP INFINITO
  arrow?.addEventListener('click', onArrow);

  const dotHandlers = dots.map((dot, i) => {
    const handler = () => { if (i !== currentTop) render(i, true); }; // VAI DIRETO AO CARD
    dot.addEventListener('click', handler);
    return handler;
  });

  /* ------ TAP / CLICK NOS CARDS — AVANÇA IGUAL À ARROW, IGNORA SCROLL ------ */
  const TAP_THRESHOLD = 10; // PX — SE O DEDO MOVER MAIS QUE ISSO É SCROLL, NÃO TAP
  const goNext = () => render((currentTop + 1) % n, true); // PRÓXIMO — LOOP INFINITO, IGUAL À ARROW
  const cardTouchHandlers = cards.map((card) => {
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e) => {
      const touch = e.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const onTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const moved = Math.hypot(touch.clientX - startX, touch.clientY - startY);
      if (moved > TAP_THRESHOLD) return; // MOVIMENTO = SCROLL — IGNORA
      e.preventDefault(); // SUPRIME O CLICK SINTÉTICO — EVITA AVANÇAR DUAS VEZES NO TOUCH
      goNext();
    };

    /* CLICK — MOUSE NO DESKTOP (NO TOUCH É SUPRIMIDO PELO preventDefault ACIMA) */
    const onClick = () => goNext();

    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('click', onClick);
    return { onTouchStart, onTouchEnd, onClick };
  });

  /* ------ CLEANUP DOS LISTENERS ------ */
  cardsCleanup = () => {
    arrow?.removeEventListener('click', onArrow);
    dots.forEach((dot, i) => dot.removeEventListener('click', dotHandlers[i]));
    cards.forEach((card, i) => {
      card.removeEventListener('touchstart', cardTouchHandlers[i].onTouchStart);
      card.removeEventListener('touchend', cardTouchHandlers[i].onTouchEnd);
      card.removeEventListener('click', cardTouchHandlers[i].onClick);
    });
  };
}

/* ========================================
   INIT — SCROLLTRIGGER CRIADO DE FORMA SÍNCRONA
   ======================================== */

export function initSobre() {
  const section = document.querySelector('#sobre');
  if (!section) return;

  const media = section.querySelector('.sobre-media');
  const textElements = selectTextElements(section);
  if (!media || !textElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  destroySobre();

  /* ------ CARDS: ESTADO INICIAL + NAVEGAÇÃO MANUAL (SÍNCRONO) ------ */
  initCardsStack(section, prefersReducedMotion);

  /* ------ GUARD REDUCED MOTION — MOSTRA TUDO SEM ANIMAR ------ */
  if (prefersReducedMotion) {
    gsap.set(media, PHOTO_TO);
    gsap.set(textElements, TEXT_TO);
    return;
  }

  /* ------ ESTADO INICIAL ESCONDIDO ------ */
  gsap.set(media, { ...PHOTO_FROM, willChange: 'clip-path, opacity' });
  gsap.set(textElements, { ...TEXT_FROM, willChange: 'transform, opacity' });

  /* ------ TIMELINE ANCORADA NA SEÇÃO ------ */
  sobreTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 60%',
      once: true
    },
    onComplete: () => {
      gsap.set(media, { willChange: 'auto' });
      gsap.set(textElements, { willChange: 'auto' });
    }
  });

  /* FOTO: REVEAL DA ESQUERDA */
  sobreTimeline.to(media, {
    ...PHOTO_TO,
    duration: DURATION.cinematic,
    ease: EASE.out
  });

  /* TEXTO + STACK: STAGGER — INICIA QUASE AO FIM DA ABERTURA DA FOTO */
  sobreTimeline.to(textElements, {
    ...TEXT_TO,
    duration: DURATION.slow,
    ease: EASE.out,
    stagger: STAGGER.base
  }, OVERLAP.tight);
}

/* ------ CLEANUP ------ */

export function destroySobre() {
  if (sobreTimeline) {
    sobreTimeline.scrollTrigger?.kill();
    sobreTimeline.kill();
    sobreTimeline = null;
  }

  /* ------ REMOVE LISTENERS DA NAVEGAÇÃO ------ */
  if (cardsCleanup) {
    cardsCleanup();
    cardsCleanup = null;
  }

  /* ------ LIMPA TIMEOUTS PENDENTES DE RECICLAGEM ------ */
  cardsTimeouts.forEach(clearTimeout);
  cardsTimeouts.length = 0;
}
