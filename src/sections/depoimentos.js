/* ========================================
   IMPORTS
   ======================================== */

import { DEPOIMENTOS } from '../constants/motion.js';
import {
  positionCards,
  revealDepoimentos,
  initDepoimentosRoulette,
  destroyDepoimentosRoulette,
  killDepoimentosReveal
} from '../animations/depoimentos.js';

/* ========================================
   SEÇÃO 6 — DEPOIMENTOS — CARDS EMPILHADOS
   ======================================== */

// SELEÇÃO DO DOM, ESTADO DO CARD ATIVO, EVENTOS E CLEANUP.
// TWEENS VIVEM EM src/animations/depoimentos.js — ESTE ARQUIVO NÃO CRIA TWEENS.

let _refs = null;
let _active = 0;
let _onNavClick = null;
let _onCardClick = null;

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#depoimentos');
  if (!section) return null;

  const header = section.querySelector('.depoimentos-header');
  const list   = section.querySelector('.depoimentos-cards');
  const cards  = Array.from(section.querySelectorAll('.depoimento-card'));
  const nav    = section.querySelector('.depoimentos-nav');

  if (!header || !list || cards.length < 2 || !nav) return null;

  return { section, header, list, cards, nav };
}

/* ------ TROCA DE CARD ------ */

function setActive(index) {
  const total = _refs.cards.length;
  _active = ((index % total) + total) % total;
  positionCards(_refs.cards, _active);
}

/* ------ INIT ------ */

export function initDepoimentos() {
  destroyDepoimentos();

  _refs = collectRefs();
  if (!_refs) return;

  _refs.section.style.setProperty(
    '--dep-transition',
    `${DEPOIMENTOS.transitionMs}ms ${DEPOIMENTOS.transitionEase}`
  );

  _active = 0;
  positionCards(_refs.cards, _active, { instant: true });

  revealDepoimentos(_refs);

  _onNavClick = (e) => {
    const btn = e.target.closest('.depoimentos-nav-arrow');
    if (!btn) return;
    setActive(_active + (btn.dataset.dir === 'next' ? 1 : -1));
  };
  _refs.nav.addEventListener('click', _onNavClick);

  _onCardClick = (e) => {
    const card = e.target.closest('.depoimento-card');
    if (!card) return;
    const index = _refs.cards.indexOf(card);
    if (index === -1 || index === _active) return;
    setActive(index);
  };
  _refs.list.addEventListener('click', _onCardClick);

  // AGUARDA FONTES — offsetWidth SEM FONTE CARREGADA GERA PÍLULA COM TAMANHO ERRADO.
  if (document.fonts) {
    document.fonts.ready.then(() => { if (_refs) initDepoimentosRoulette(); });
  } else {
    initDepoimentosRoulette();
  }
}

/* ------ CLEANUP ------ */

export function destroyDepoimentos() {
  destroyDepoimentosRoulette();
  killDepoimentosReveal();

  if (_refs) {
    if (_onNavClick)  _refs.nav.removeEventListener('click', _onNavClick);
    if (_onCardClick) _refs.list.removeEventListener('click', _onCardClick);
    _refs = null;
  }

  _onNavClick  = null;
  _onCardClick = null;
  _active      = 0;
}