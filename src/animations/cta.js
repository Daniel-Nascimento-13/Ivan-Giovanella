/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from '../lib/gsap.js';
import {
  EASE,
  STAGGER,
  CTA,
  ROULETTE,
  REVEAL_FROM,
  REVEAL_TO
} from '../constants/motion.js';
import { createReveal } from '../lib/reveal.js';
import { getLenis } from '../lib/smooth-scroll.js';

/* ========================================
   SEÇÃO 7 — CTA FINAL — CONVERSÃO
   ======================================== */

let _revealST = null;
let _rouletteTimer = null;
let _rouletteResetTimer = null;

/* ------ REVEAL ------ */

export function revealCta(refs) {
  const { section, header, actions, socialWrap } = refs;

  const headerEls = Array.from(header.children);
  const targets = [...headerEls, actions, socialWrap];

  _revealST = createReveal(targets, {
    trigger: section,
    start: CTA.revealStart,
    stagger: STAGGER.tight
  });
}

/* ------ ROLETA DO EYEBROW ------ */
// CLONE DA PRIMEIRA PALAVRA FECHA A LISTA — RESET INVISÍVEL PORQUE O CONTEÚDO É IGUAL.

export function initCtaRoulette() {
  const rouletteEl = document.querySelector('.cta-eyebrow-roulette');
  const track = document.querySelector('.cta-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(
    track.querySelectorAll('.cta-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  destroyCtaRoulette();

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

export function destroyCtaRoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
  clearTimeout(_rouletteResetTimer);
  _rouletteResetTimer = null;
}

/* ------ MODAL — ABERTURA / FECHAMENTO ------ */
// GSAP ANIMA APENAS CLIP-PATH E AUTOALPHA — O translate(-50%,-50%) DO CSS É PRESERVADO.

export function openModal(refs, onTrapReady, onReady) {
  const { modal, modalCard } = refs;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // LENIS PARA — getLenis() PODE SER null SOB prefers-reduced-motion.
  getLenis()?.stop?.();

  modal.setAttribute('aria-hidden', 'false');

  onTrapReady?.(modal);

  if (prefersReduced) {
    gsap.set(modal, { autoAlpha: 1 });
    gsap.set(modalCard, { clipPath: REVEAL_TO.clipPath });
    onReady?.(modal);
    return;
  }

  gsap.set(modalCard, { clipPath: REVEAL_FROM.clipPath });
  gsap.to(modal, { autoAlpha: 1, duration: CTA.modalDuration, ease: EASE.out });
  gsap.to(modalCard, {
    clipPath: REVEAL_TO.clipPath,
    duration: CTA.modalDuration,
    ease: EASE.out,
    onComplete: () => onReady?.(modal)
  });
}

export function closeModal(refs, onDone) {
  const { modal } = refs;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // LENIS RETOMA APÓS A SAÍDA — EVITA SCROLL POR BAIXO DO MODAL AINDA VISÍVEL.
  const finish = () => {
    modal.setAttribute('aria-hidden', 'true');
    getLenis()?.start?.();
    onDone?.();
  };

  if (prefersReduced) {
    gsap.set(modal, { autoAlpha: 0 });
    finish();
    return;
  }

  gsap.to(modal, {
    autoAlpha: 0,
    duration: CTA.modalDuration,
    ease: EASE.out,
    onComplete: finish
  });
}

/* ------ CLEANUP ------ */

export function killCtaReveal() {
  _revealST?.kill();
  _revealST = null;
}