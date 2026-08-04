/* ========================================
   IMPORTS
   ======================================== */

import {
  revealParaQuemE,
  killParaQuemEReveal,
  initParaQuemEAccordion,
  destroyParaQuemEAccordion,
  initParaQuemERoulette,
  destroyParaQuemERoulette
} from '../animations/para-quem-e.js';

/* ========================================
   SEÇÃO 4 — PARA QUEM É — PERFIS DE CONTRATAÇÃO
   ======================================== */

// SELEÇÃO DO DOM, MONTAGEM DAS REFS E CLEANUP.
// TWEENS VIVEM EM src/animations/para-quem-e.js — ESTE ARQUIVO NÃO CRIA TWEENS.

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#para-quem-e');
  if (!section) return null;

  const header = section.querySelector('.para-quem-header');
  const btns   = Array.from(section.querySelectorAll('.para-quem-btn'));
  const detail = section.querySelector('[data-detail]');
  const icon   = section.querySelector('[data-detail-icon]');
  const tag    = section.querySelector('[data-detail-tag]');
  const title  = section.querySelector('[data-detail-title]');
  const text   = section.querySelector('[data-detail-text]');

  if (!header || btns.length === 0 || !detail || !icon || !tag || !title || !text) return null;

  return { section, header, btns, detail, icon, tag, title, text };
}

/* ------ INIT ------ */

export function initParaQuemE() {
  destroyParaQuemE();

  const refs = collectRefs();
  if (!refs) return;

  revealParaQuemE(refs);
  initParaQuemEAccordion(refs);

  // AGUARDA FONTES — offsetWidth SEM FONTE CARREGADA GERA PÍLULA COM TAMANHO ERRADO.
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (document.querySelector('#para-quem-e')) initParaQuemERoulette();
    });
  } else {
    initParaQuemERoulette();
  }
}

/* ------ CLEANUP ------ */

export function destroyParaQuemE() {
  destroyParaQuemERoulette();
  destroyParaQuemEAccordion();
  killParaQuemEReveal();
}