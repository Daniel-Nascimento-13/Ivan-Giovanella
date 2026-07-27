import {
  revealParaQuemE,
  killParaQuemEReveal,
  initParaQuemEAccordion,
  destroyParaQuemEAccordion
} from '../animations/para-quem-e.js';

/* ========================================
   SEÇÃO 4 — PARA QUEM É — PERFIS DE CONTRATAÇÃO
   ======================================== */

// SELEÇÃO DO DOM, MONTAGEM DAS REFS E CLEANUP.
// AS ANIMAÇÕES VIVEM EM src/animations/para-quem-e.js — ESTE ARQUIVO NÃO CRIA TWEENS.

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#para-quem-e');
  if (!section) return null;

  const header = section.querySelector('.para-quem-header');
  const btns = Array.from(section.querySelectorAll('.para-quem-btn'));
  const detail = section.querySelector('[data-detail]');
  const icon = section.querySelector('[data-detail-icon]');
  const tag = section.querySelector('[data-detail-tag]');
  const title = section.querySelector('[data-detail-title]');
  const text = section.querySelector('[data-detail-text]');

  /* GUARD — MARKUP INCOMPLETO NÃO INICIALIZA NADA */
  if (!header || btns.length === 0 || !detail || !icon || !tag || !title || !text) {
    return null;
  }

  return { section, header, btns, detail, icon, tag, title, text };
}

/* ------ INIT ------ */

export function initParaQuemE() {
  destroyParaQuemE();

  const refs = collectRefs();
  if (!refs) return;

  /* REVEAL — SCROLLTRIGGER SÍNCRONO NO INIT (NUNCA EM CALLBACK ASSÍNCRONO) */
  revealParaQuemE(refs);

  /* ACCORDION — ESTADO INICIAL FECHADO (current = -1 DENTRO DA FUNÇÃO) */
  initParaQuemEAccordion(refs);
}

/* ------ CLEANUP ------ */

export function destroyParaQuemE() {
  destroyParaQuemEAccordion();
  killParaQuemEReveal();
}
