/* ========================================
   IMPORTS
   ======================================== */

import { STAGGER, PARA_QUEM, ROULETTE } from '../constants/motion.js';
import { createReveal, killReveal } from '../lib/reveal.js';

/* ========================================
   SEÇÃO 4 — PARA QUEM É — PERFIS DE CONTRATAÇÃO
   ======================================== */

let _revealHeaderST = null;
let _revealListST = null;

let _btns = null;
let _container = null;
let _onClick = null;

let _rouletteTimer = null;
let _rouletteResetTimer = null;

/* ------ REVEAL ------ */

export function revealParaQuemE(refs) {
  const { section, header, btns } = refs;

  const headerEls = Array.from(header.children);
  _revealHeaderST = createReveal(headerEls, {
    trigger: section,
    start: PARA_QUEM.revealStart,
    stagger: STAGGER.base
  });

  _revealListST = createReveal(btns, {
    trigger: section,
    start: PARA_QUEM.revealStart,
    stagger: PARA_QUEM.listStagger
  });
}

export function killParaQuemEReveal() {
  killReveal(_revealHeaderST);
  killReveal(_revealListST);
  _revealHeaderST = null;
  _revealListST = null;
}

/* ------ ACCORDION ------ */
// ESTADO ATIVO APLICADO INLINE — SOBRESCREVE O CSS BASE SEM DEPENDER DE CLASSES.
// TRANSITION CSS CONTROLA A ABERTURA DO CARD (max-height + opacity).

function setButtonActive(btn, active) {
  const icon = btn.querySelector('.para-quem-btn__toggle-icon');

  if (active) {
    btn.style.backgroundColor = 'var(--color-orange)';
    btn.style.borderColor = 'var(--color-orange)';
    btn.style.color = 'var(--color-ink)';
    btn.setAttribute('aria-expanded', 'true');
    if (icon) { icon.style.transform = 'rotate(45deg)'; icon.style.color = 'var(--color-ink)'; }
  } else {
    btn.style.backgroundColor = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    btn.setAttribute('aria-expanded', 'false');
    if (icon) { icon.style.transform = ''; icon.style.color = ''; }
  }
}

function detailOf(btn) {
  return btn.parentElement.querySelector('.para-quem-detail');
}

function closeItem(btn) {
  setButtonActive(btn, false);
  detailOf(btn)?.classList.remove('open');
}

function openItem(btn) {
  setButtonActive(btn, true);
  detailOf(btn)?.classList.add('open');
}

export function initParaQuemEAccordion(refs) {
  const { btns } = refs;
  _btns = btns;
  _container = btns[0].closest('.para-quem-accordion');
  if (!_container) return;

  let current = -1;

  _onClick = (e) => {
    const btn = e.target.closest('.para-quem-btn');
    if (!btn || !_btns.includes(btn)) return;

    const index = Number(btn.dataset.index);

    if (index === current) {
      closeItem(btn);
      current = -1;
      return;
    }

    _btns.forEach(closeItem);
    openItem(btn);
    current = index;
  };

  _container.addEventListener('click', _onClick);
}

export function destroyParaQuemEAccordion() {
  if (_container && _onClick) {
    _container.removeEventListener('click', _onClick);
  }
  _btns = null;
  _container = null;
  _onClick = null;
}

/* ------ ROLETA DO EYEBROW ------ */
// CLONE DA PRIMEIRA PALAVRA FECHA A LISTA — RESET INVISÍVEL PORQUE O CONTEÚDO É IGUAL.

export function initParaQuemERoulette() {
  const rouletteEl = document.querySelector('.pq-eyebrow-roulette');
  const track = document.querySelector('.pq-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(
    track.querySelectorAll('.pq-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  destroyParaQuemERoulette();

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

export function destroyParaQuemERoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
  clearTimeout(_rouletteResetTimer);
  _rouletteResetTimer = null;
}