/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from '../lib/gsap.js';
import { EASE, DURATION, STAGGER, REVEAL_FROM_DEEP, OVERLAP, CARDS } from '../constants/motion.js';

/* ========================================
   SEÇÃO 2 — SOBRE
   ======================================== */

let sobreTimeline = null;
let cardsCleanup = null;
let cardsTimeouts = [];
let _sobreRouletteTimer = null;

/* ------ ESTADOS DE REVEAL ------ */
// FOTO: CLIP DA ESQUERDA — RETÂNGULO ABRE DA ESQUERDA PARA A DIREITA.
// TEXTO: translateY + autoAlpha SEM CLIP.

const PHOTO_FROM = { clipPath: 'inset(0 100% 0 0)', autoAlpha: 0 };
const PHOTO_TO   = { clipPath: 'inset(0 0% 0 0)',   autoAlpha: 1 };
const TEXT_FROM  = { y: REVEAL_FROM_DEEP.y, autoAlpha: 0 };
const TEXT_TO    = { y: 0, autoAlpha: 1 };

/* ------ SELEÇÃO ------ */
// ORDEM DEFINE O STAGGER: EYEBROW → NOME → PARÁGRAFOS → STACK.

function selectTextElements(section) {
  const eyebrow = section.querySelector('.sobre-eyebrow');
  const name    = section.querySelector('.sobre-name');
  const texts   = Array.from(section.querySelectorAll('.sobre-text'));
  const stack   = section.querySelector('.sobre-stack');

  return [eyebrow, name, ...texts, stack].filter(Boolean);
}

/* ========================================
   CARDS STACK
   ======================================== */

// SLOT 0 = TOPO | 1 = MEIO | 2 = TRÁS | DEMAIS = OCULTO.
const STACK_STATE = ['top', 'mid', 'back'];

function stateForSlot(slot) {
  return STACK_STATE[slot] || 'hidden';
}

// instant=true TROCA SEM TRANSIÇÃO (ESTADO INICIAL / RECICLAGEM).
function setCardState(card, slot, instant) {
  card.className = 'sobre-card sobre-card--' + stateForSlot(slot) + (instant ? ' sobre-card--instant' : '');
  if (instant) {
    void card.offsetWidth;
    card.classList.remove('sobre-card--instant');
  }
}

function initCardsStack(section, prefersReducedMotion) {
  const stack = section.querySelector('.sobre-cards');
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll('.sobre-card'));
  if (!cards.length) return;

  const arrow = section.querySelector('.sobre-nav-arrow');
  const dots  = Array.from(section.querySelectorAll('.sobre-dot'));

  const n = cards.length;
  let currentTop = 0;

  stack.style.setProperty('--card-transition', `${CARDS.transitionMs}ms ${CARDS.transitionEase}`);

  const slotFor = (i, top) => (i - top + n) % n;

  /* ------ DOTS ------ */

  const updateDots = (top) => {
    dots.forEach((dot, i) => {
      const active = i === top;
      dot.classList.toggle('sobre-dot--active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };

  /* ------ RENDER ------ */

  const render = (newTop, animate) => {
    const doAnimate = animate && !prefersReducedMotion;
    const prevTop = currentTop;

    cards.forEach((card, i) => {
      const slot = slotFor(i, newTop);

      if (doAnimate && i === prevTop && prevTop !== newTop) {
        card.className = 'sobre-card sobre-card--exit';
        const t = setTimeout(() => {
          cardsTimeouts = cardsTimeouts.filter(h => h !== t);
          setCardState(card, slot, true);
        }, CARDS.transitionMs);
        cardsTimeouts.push(t);
      } else {
        setCardState(card, slot, !doAnimate);
      }
    });

    currentTop = newTop;
    updateDots(newTop);
  };

  render(0, false);

  /* ------ NAVEGAÇÃO MANUAL ------ */

  const onArrow = () => render((currentTop + 1) % n, true);
  arrow?.addEventListener('click', onArrow);

  const dotHandlers = dots.map((dot, i) => {
    const handler = () => { if (i !== currentTop) render(i, true); };
    dot.addEventListener('click', handler);
    return handler;
  });

  /* ------ TAP / CLICK NOS CARDS ------ */
  // THRESHOLD 10px — MOVIMENTO MAIOR É SCROLL, NÃO TAP.

  const TAP_THRESHOLD = 10;
  const goNext = () => render((currentTop + 1) % n, true);

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
      if (moved > TAP_THRESHOLD) return;
      e.preventDefault(); // SUPRIME CLICK SINTÉTICO — EVITA AVANÇAR DUAS VEZES NO TOUCH
      goNext();
    };

    const onClick = () => goNext();

    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('click', onClick);
    return { onTouchStart, onTouchEnd, onClick };
  });

  /* ------ CLEANUP ------ */

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

/* ------ ROLETA DO EYEBROW ------ */
// AGUARDA FONTES — offsetWidth SEM FONTE CARREGADA GERA PÍLULA COM TAMANHO ERRADO.

function initSobreEyebrowRoulette(section) {
  const rouletteEl = section.querySelector('.sobre-eyebrow-roulette');
  const track = section.querySelector('.sobre-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(track.querySelectorAll('.sobre-eyebrow-roulette__word'));
  if (words.length < 2) return;

  clearInterval(_sobreRouletteTimer);
  _sobreRouletteTimer = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  const widths = words.map(w => w.offsetWidth);
  const h = words[0].offsetHeight;

  rouletteEl.style.height = h + 'px';
  rouletteEl.style.width = (widths[0] + 4) + 'px';

  function advance() {
    current = (current + 1) % words.length;
    rouletteEl.setAttribute('aria-label', words[current].textContent.trim());

    if (prefersReduced) {
      track.style.transition = 'none';
      rouletteEl.style.transition = 'none';
    }

    track.style.transform = `translateY(-${current * h}px)`;
    rouletteEl.style.width = (widths[current] + 4) + 'px';
  }

  _sobreRouletteTimer = setInterval(advance, 3000);
}

/* ========================================
   INIT
   ======================================== */

export function initSobre() {
  const section = document.querySelector('#sobre');
  if (!section) return;

  const media = section.querySelector('.sobre-media');
  const textElements = selectTextElements(section);
  if (!media || !textElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  destroySobre();

  initCardsStack(section, prefersReducedMotion);

  if (document.fonts) {
    document.fonts.ready.then(() => initSobreEyebrowRoulette(section));
  } else {
    initSobreEyebrowRoulette(section);
  }

  if (prefersReducedMotion) {
    gsap.set(media, PHOTO_TO);
    gsap.set(textElements, TEXT_TO);
    return;
  }

  gsap.set(media, { ...PHOTO_FROM, willChange: 'clip-path, opacity' });
  gsap.set(textElements, { ...TEXT_FROM, willChange: 'transform, opacity' });

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

  sobreTimeline.to(media, {
    ...PHOTO_TO,
    duration: DURATION.cinematic,
    ease: EASE.out
  });

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

  if (cardsCleanup) {
    cardsCleanup();
    cardsCleanup = null;
  }

  cardsTimeouts.forEach(clearTimeout);
  cardsTimeouts.length = 0;

  clearInterval(_sobreRouletteTimer);
  _sobreRouletteTimer = null;
}