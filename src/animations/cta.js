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

/* ========================================
   SEÇÃO 6 — CTA FINAL — CONVERSÃO
   ======================================== */

// REVEAL DO HEADER/BOTÕES, ROLETA DO EYEBROW E ABERTURA/FECHAMENTO DO MODAL.
// SCROLL = LENIS | MOVIMENTO = GSAP | DISPARO = SCROLLTRIGGER.
// O FAB SOCIAL É TRANSIÇÃO CSS (MICRO-INTERAÇÃO) — SÓ O TOGGLE DE CLASSE VIVE NO JS.
// TODOS OS NÚMEROS VÊM DE src/constants/motion.js.

let _revealST = null;
let _rouletteTimer = null;
let _rouletteResetTimer = null;

/* ------ REVEAL — HEADER, BOTÕES E FAB EM STAGGER (CLIP + TRANSLATEY + AUTOALPHA) ------ */
// A ORDEM DO ARRAY DEFINE O ESCALONAMENTO: BOTÕES E FAB REVELAM APÓS O HEADER.

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

/* ------ ROLETA DO EYEBROW — SEÇÃO 6 — CTA FINAL ------ */
// MESMO MECANISMO DAS SEÇÕES ANTERIORES: TRACK EM COLUNA QUE DESLIZA POR TRANSITION
// CSS, COM A LARGURA DO WRAPPER SEGUINDO A PALAVRA ATUAL. UM CLONE DA PRIMEIRA
// PALAVRA FECHA A LISTA E O TRACK VOLTA AO TOPO COM A TRANSIÇÃO DESLIGADA — SALTO
// INVISÍVEL. PRÉ-MEDE AS LARGURAS APÓS document.fonts.ready.

export function initCtaRoulette() {
  const rouletteEl = document.querySelector('.cta-eyebrow-roulette');
  const track = document.querySelector('.cta-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  /* O CLONE FICA FORA DA CONTAGEM — REINICIALIZAÇÃO NÃO PODE TRATÁ-LO COMO PALAVRA */
  const words = Array.from(
    track.querySelectorAll('.cta-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  destroyCtaRoulette();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  /* PRÉ-MEDE TODAS AS LARGURAS E ALTURA ANTES DE QUALQUER ANIMAÇÃO */
  const widths = words.map(w => w.offsetWidth);
  const h = words[0].offsetHeight;

  /* CLONE DA PRIMEIRA PALAVRA NO FIM — DESTINO DO ÚLTIMO PASSO DO CICLO */
  if (track.dataset.rouletteCloned !== 'true') {
    const clone = words[0].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    track.dataset.rouletteCloned = 'true';
  }

  /* VOLTA AO TOPO SEM TRANSIÇÃO — ESTADO LIMPO EM CASO DE REINICIALIZAÇÃO */
  track.style.transition = 'none';
  track.style.transform = 'translateY(0px)';
  void track.offsetHeight;
  if (!prefersReduced) track.style.transition = '';

  rouletteEl.style.height = h + 'px';
  rouletteEl.style.width = (widths[0] + ROULETTE.widthPadPx) + 'px';

  function advance() {
    current += 1;

    /* NO CLONE O CONTEÚDO É O DA PALAVRA 0 — LARGURA E LABEL SEGUEM A ORIGINAL */
    const isClone = current === words.length;
    const wordIndex = isClone ? 0 : current;

    rouletteEl.setAttribute('aria-label', words[wordIndex].textContent.trim());

    if (prefersReduced) {
      track.style.transition = 'none';
      rouletteEl.style.transition = 'none';
    }

    track.style.transform = `translateY(-${current * h}px)`;
    rouletteEl.style.width = (widths[wordIndex] + ROULETTE.widthPadPx) + 'px';

    /* RESET SILENCIOSO — DEPOIS QUE O DESLIZE ATÉ O CLONE TERMINA */
    if (isClone) {
      _rouletteResetTimer = setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateY(0px)';
        void track.offsetHeight; /* FORÇA REFLOW ANTES DE RELIGAR A TRANSIÇÃO */
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

/* ------ MODAL — ABERTURA / FECHAMENTO (CLIP-PATH + AUTOALPHA) ------ */
// O CARD MANTÉM O translate(-50%,-50%) DO CSS — GSAP SÓ ANIMA CLIP-PATH E AUTOALPHA.

export function openModal(refs) {
  const { modal, modalCard } = refs;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  modal.setAttribute('aria-hidden', 'false');

  if (prefersReduced) {
    gsap.set(modal, { autoAlpha: 1 });
    gsap.set(modalCard, { clipPath: REVEAL_TO.clipPath });
    return;
  }

  gsap.set(modalCard, { clipPath: REVEAL_FROM.clipPath });
  gsap.to(modal, { autoAlpha: 1, duration: CTA.modalDuration, ease: EASE.out });
  gsap.to(modalCard, { clipPath: REVEAL_TO.clipPath, duration: CTA.modalDuration, ease: EASE.out });
}

export function closeModal(refs) {
  const { modal } = refs;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = () => modal.setAttribute('aria-hidden', 'true');

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

/* ------ CLEANUP — MATA O REVEAL E SEU SCROLLTRIGGER ------ */

export function killCtaReveal() {
  _revealST?.kill();
  _revealST = null;
}
