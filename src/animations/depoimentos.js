/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from '../lib/gsap.js';
import {
  EASE,
  DURATION,
  STAGGER,
  DEPOIMENTOS,
  ROULETTE
} from '../constants/motion.js';
import { createReveal } from '../lib/reveal.js';

/* ========================================
   SEÇÃO 6 — DEPOIMENTOS — CARDS EMPILHADOS
   ======================================== */

let _revealST = null;
let _rouletteTimer = null;
let _rouletteResetTimer = null;

/* ------ DISTÂNCIA CIRCULAR ------ */
// CAMINHO MAIS CURTO ENTRE ATIVO E CARD i — FAZ A PILHA EMBRULHAR.

function circularDelta(i, active, total) {
  let d = i - active;
  const half = total / 2;
  if (d > half) d -= total;
  if (d < -half) d += total;
  return d;
}

/* ------ POSICIONAMENTO DOS CARDS ------ */
// ATRIBUI CLASSE DE BANDA E SINAL DE DIREÇÃO (--dep-dir).
// O MOVIMENTO É TRANSIÇÃO CSS — GSAP NÃO TOCA transform AQUI.

export function positionCards(cards, activeIndex, { instant = false } = {}) {
  const total = cards.length;
  const list = cards[0]?.parentElement;

  if (instant && list) {
    list.classList.add('depoimentos-cards--init');
  }

  cards.forEach((card, i) => {
    const d = circularDelta(i, activeIndex, total);
    const abs = Math.abs(d);
    const dir = d === 0 ? 0 : (d > 0 ? 1 : -1);

    card.style.setProperty('--dep-dir', String(dir));
    card.classList.remove(
      'depoimento-card--active',
      'depoimento-card--side-1',
      'depoimento-card--side-2',
      'depoimento-card--hidden'
    );

    if (abs === 0) {
      card.classList.add('depoimento-card--active');
    } else if (abs <= DEPOIMENTOS.visibleRange) {
      card.classList.add(`depoimento-card--side-${abs}`);
    } else {
      card.classList.add('depoimento-card--hidden');
    }

    card.setAttribute('aria-hidden', abs === 0 ? 'false' : 'true');
  });

  if (instant && list) {
    void list.offsetHeight;
    list.classList.remove('depoimentos-cards--init');
  }
}

/* ------ REVEAL ------ */
// HEADER: CLIP-PATH + TRANSLATEY + AUTOALPHA.
// CARDS: MULTIPLICA --dep-reveal 0→1 — NÃO TOCA transform NEM A OPACITY DE BANDA.

export function revealDepoimentos(refs) {
  const { section, header, cards } = refs;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const headerEls = Array.from(header.children);
  _revealST = createReveal(headerEls, {
    trigger: section,
    start: DEPOIMENTOS.revealStart,
    stagger: STAGGER.base
  });

  if (prefersReduced) return;

  gsap.set(cards, { '--dep-reveal': 0 });
  gsap.to(cards, {
    '--dep-reveal': 1,
    duration: DURATION.base,
    ease: EASE.out,
    stagger: DEPOIMENTOS.staggerMs / 1000,
    scrollTrigger: {
      trigger: section,
      start: DEPOIMENTOS.revealStart,
      once: true
    }
  });
}

/* ------ ROLETA DO EYEBROW ------ */
// CLONE DA PRIMEIRA PALAVRA FECHA A LISTA — RESET INVISÍVEL PORQUE O CONTEÚDO É IGUAL.

export function initDepoimentosRoulette() {
  const rouletteEl = document.querySelector('.depoimentos-eyebrow-roulette');
  const track = document.querySelector('.depoimentos-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(
    track.querySelectorAll('.depoimentos-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  destroyDepoimentosRoulette();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  const widths = words.map(w => w.offsetWidth);
  const h = words[0].offsetHeight;

  if (track.dataset.rouletteCloned !== 'true') {
    const clone = words[0].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    track.dataset.rouletteCloned = 'true';
  }

  track.style.transition = 'none';
  track.style.transform = 'translateY(0px)';
  void track.offsetHeight;
  if (!prefersReduced) track.style.transition = '';

  rouletteEl.style.height = h + 'px';
  rouletteEl.style.width = (widths[0] + ROULETTE.widthPadPx) + 'px';

  function advance() {
    current += 1;

    const isClone = current === words.length;
    const wordIndex = isClone ? 0 : current;

    rouletteEl.setAttribute('aria-label', words[wordIndex].textContent.trim());

    if (prefersReduced) {
      track.style.transition = 'none';
      rouletteEl.style.transition = 'none';
    }

    track.style.transform = `translateY(-${current * h}px)`;
    rouletteEl.style.width = (widths[wordIndex] + ROULETTE.widthPadPx) + 'px';

    if (isClone) {
      _rouletteResetTimer = setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateY(0px)';
        void track.offsetHeight;
        if (!prefersReduced) track.style.transition = '';
        current = 0;
      }, ROULETTE.resetDelayMs);
    }
  }

  _rouletteTimer = setInterval(advance, ROULETTE.cycleMs);
}

export function destroyDepoimentosRoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
  clearTimeout(_rouletteResetTimer);
  _rouletteResetTimer = null;
}

/* ------ CLEANUP ------ */

export function killDepoimentosReveal() {
  _revealST?.kill();
  _revealST = null;
}