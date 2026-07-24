import { DEPOIMENTOS } from '../constants/motion.js';
import {
  positionCards,
  revealDepoimentos,
  initDepoimentosRoulette,
  destroyDepoimentosRoulette,
  killDepoimentosReveal
} from '../animations/depoimentos.js';

/* ========================================
   SEÇÃO 5 — DEPOIMENTOS — CARDS EMPILHADOS
   ======================================== */

// SELEÇÃO DO DOM, ESTADO DO CARD ATIVO, EVENTOS (NAV + CLIQUE NO CARD) E CLEANUP.
// AS ANIMAÇÕES VIVEM EM src/animations/depoimentos.js — ESTE ARQUIVO NÃO CRIA TWEENS.

let _refs = null;
let _active = 0;
let _onNavClick = null;
let _onCardClick = null;

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#depoimentos');
  if (!section) return null;

  const header = section.querySelector('.depoimentos-header');
  const list = section.querySelector('.depoimentos-cards');
  const cards = Array.from(section.querySelectorAll('.depoimento-card'));
  const nav = section.querySelector('.depoimentos-nav');

  /* GUARD — MARKUP INCOMPLETO NÃO INICIALIZA NADA */
  if (!header || !list || cards.length < 2 || !nav) return null;

  return { section, header, list, cards, nav };
}

/* ------ TROCA DE CARD ATIVO — SEMPRE CIRCULAR ------ */

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

  /* INJETA A DURAÇÃO DA TRANSIÇÃO (FONTE: motion.js) NO CSS — ZERO NÚMERO NO CSS */
  _refs.section.style.setProperty(
    '--dep-transition',
    `${DEPOIMENTOS.transitionMs}ms ${DEPOIMENTOS.transitionEase}`
  );

  /* ESTADO INICIAL — CARD 0 NO CENTRO, SEM ANIMAÇÃO DE ENTRADA DAS POSIÇÕES */
  _active = 0;
  positionCards(_refs.cards, _active, { instant: true });

  /* REVEAL — SCROLLTRIGGER SÍNCRONO NO INIT (NUNCA EM CALLBACK ASSÍNCRONO) */
  revealDepoimentos(_refs);

  /* ------ NAVEGAÇÃO — SETAS ANTERIOR / PRÓXIMO ------ */
  _onNavClick = (e) => {
    const btn = e.target.closest('.depoimentos-nav-arrow');
    if (!btn) return;
    setActive(_active + (btn.dataset.dir === 'next' ? 1 : -1));
  };
  _refs.nav.addEventListener('click', _onNavClick);

  /* ------ CLIQUE EM CARD LATERAL — AVANÇA/RECUA PARA ELE ------ */
  _onCardClick = (e) => {
    const card = e.target.closest('.depoimento-card');
    if (!card) return;
    const index = _refs.cards.indexOf(card);
    if (index === -1 || index === _active) return;
    setActive(index);
  };
  _refs.list.addEventListener('click', _onCardClick);

  /* ------ ROLETA DO EYEBROW ------ */
  /* ESPERA A FONTE: A ROLETA PRÉ-MEDE A LARGURA DE CADA PALAVRA E, MEDIDA COM A */
  /* FONTE DE FALLBACK, A PÍLULA NASCERIA COM O TAMANHO ERRADO. SEM SCROLLTRIGGER */
  /* AQUI — SÓ TRANSITION CSS E setInterval. */
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (_refs) initDepoimentosRoulette();
    });
  } else {
    initDepoimentosRoulette();
  }
}

/* ------ CLEANUP ------ */

export function destroyDepoimentos() {
  destroyDepoimentosRoulette();
  killDepoimentosReveal();

  if (_refs) {
    if (_onNavClick) _refs.nav.removeEventListener('click', _onNavClick);
    if (_onCardClick) _refs.list.removeEventListener('click', _onCardClick);
    _refs = null;
  }

  _onNavClick = null;
  _onCardClick = null;
  _active = 0;
}
