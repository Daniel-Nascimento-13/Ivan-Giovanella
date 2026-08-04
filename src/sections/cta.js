/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from '../lib/gsap.js';
import { getWhatsappLink } from '../data/site-data.js';
import {
  revealCta,
  initCtaRoulette,
  destroyCtaRoulette,
  openModal,
  closeModal,
  killCtaReveal
} from '../animations/cta.js';

/* ========================================
   SEÇÃO 7 — CTA FINAL — CONVERSÃO
   ======================================== */

// SELEÇÃO DO DOM, EVENTOS E CLEANUP.
// TWEENS VIVEM EM src/animations/cta.js — ESTE ARQUIVO NÃO CRIA TWEENS.

let _refs = null;
let _onOpenModal = null;
let _onCloseModal = null;
let _onSubmit = null;
let _onSocialToggle = null;
let _opener = null;
let _onModalKeydown = null;

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#cta');
  if (!section) return null;

  const header       = section.querySelector('.cta-header');
  const actions      = section.querySelector('.cta-actions');
  const socialWrap   = section.querySelector('.cta-social-wrap');
  const social       = section.querySelector('[data-cta-social]');
  const socialToggle = section.querySelector('[data-cta-social-toggle]');
  const whatsappBtn  = section.querySelector('.cta-btn--whatsapp');
  const openBtn      = section.querySelector('[data-cta-open-modal]');

  // MODAL BUSCADO NO DOCUMENTO — MARKUP É FILHO DIRETO DE <body> PARA ESCAPAR
  // DO isolation: isolate DE #cta (VER NOTA NO index.html).
  const modal        = document.querySelector('[data-cta-modal]');
  const modalCard    = modal?.querySelector('.cta-modal__card');
  const modalOverlay = modal?.querySelector('[data-cta-modal-overlay]');
  const modalClose   = modal?.querySelector('[data-cta-modal-close]');
  const form         = modal?.querySelector('[data-cta-form]');

  if (!header || !actions || !socialWrap || !modal || !form) return null;

  return {
    section, header, actions, socialWrap, social, socialToggle,
    whatsappBtn, openBtn, modal, modalCard, modalOverlay, modalClose, form
  };
}

/* ------ MENSAGEM DO WHATSAPP ------ */

function buildModalMessage(form) {
  const data    = new FormData(form);
  const nome    = (data.get('nome')    || '').toString().trim();
  const empresa = (data.get('empresa') || '').toString().trim();
  const cnpj    = (data.get('cnpj')    || '').toString().trim();
  const pessoas = (data.get('pessoas') || '').toString().trim();
  const cidade  = (data.get('cidade')  || '').toString().trim();

  const planoSelect = form.querySelector('[name="plano"]');
  const plano = (planoSelect?.selectedOptions[0]?.textContent || '').trim();

  return (
    `Olá Ivan! \n\n` +
    `Me chamo *${nome}* gostaria de uma avaliação completa para avaliar o que se enquadra melhor a minha necessidade.\n\n` +
    `Empresa: ${empresa}\n` +
    (cnpj ? `CNPJ: ${cnpj}\n` : '') +
    `Plano: ${plano}\n` +
    `Pessoas: ${pessoas}\n` +
    `Cidade: ${cidade}\n\n` +
    `Fico no aguardo, obrigado!`
  );
}

/* ------ FOCO DO MODAL ------ */

function _onTrapReady(modal) {
  _onModalKeydown = (e) => _handleModalKey(e, modal);
  document.addEventListener('keydown', _onModalKeydown);
}

function _onFocusFirst(modal) {
  const focusable = getFocusable(modal);
  focusable[0]?.focus({ preventScroll: true });
}

function _onRestoreFocus() {
  document.removeEventListener('keydown', _onModalKeydown);
  _onModalKeydown = null;
  _opener?.focus({ preventScroll: true });
  _opener = null;
}

function _handleModalKey(e, modal) {
  if (e.key === 'Escape') {
    closeModal(_refs, _onRestoreFocus);
    return;
  }
  if (e.key === 'Tab') {
    const focusable = getFocusable(modal);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
}

function getFocusable(container) {
  return [...container.querySelectorAll(
    'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.disabled && !el.closest('[aria-hidden="true"]'));
}

/* ------ INIT ------ */

export function initCta() {
  destroyCta();

  _refs = collectRefs();
  if (!_refs) return;

  if (_refs.whatsappBtn) _refs.whatsappBtn.href = getWhatsappLink();

  gsap.set(_refs.modal, { autoAlpha: 0 });

  revealCta(_refs);

  _onOpenModal = () => {
    _opener = document.activeElement;
    openModal(_refs, _onTrapReady, _onFocusFirst);
  };
  _refs.openBtn?.addEventListener('click', _onOpenModal);

  _onCloseModal = () => closeModal(_refs, _onRestoreFocus);
  _refs.modalClose?.addEventListener('click', _onCloseModal);
  _refs.modalOverlay?.addEventListener('click', _onCloseModal);

  _onSubmit = (e) => {
    e.preventDefault();
    const message = buildModalMessage(_refs.form);
    window.open(getWhatsappLink(message), '_blank', 'noopener,noreferrer');
    closeModal(_refs, _onRestoreFocus);
  };
  _refs.form.addEventListener('submit', _onSubmit);

  _onSocialToggle = () => {
    const open = _refs.social.classList.toggle('cta-social--open');
    _refs.socialToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    _refs.socialToggle.setAttribute(
      'aria-label',
      open ? 'Ocultar redes sociais' : 'Mostrar redes sociais'
    );
  };
  _refs.socialToggle?.addEventListener('click', _onSocialToggle);

  // AGUARDA FONTES — offsetWidth SEM FONTE CARREGADA GERA PÍLULA COM TAMANHO ERRADO.
  if (document.fonts) {
    document.fonts.ready.then(() => { if (_refs) initCtaRoulette(); });
  } else {
    initCtaRoulette();
  }
}

/* ------ CLEANUP ------ */

export function destroyCta() {
  destroyCtaRoulette();
  killCtaReveal();

  if (_onModalKeydown) {
    document.removeEventListener('keydown', _onModalKeydown);
    _onModalKeydown = null;
  }
  _opener = null;

  if (_refs) {
    if (_onOpenModal)    _refs.openBtn?.removeEventListener('click', _onOpenModal);
    if (_onCloseModal) {
      _refs.modalClose?.removeEventListener('click', _onCloseModal);
      _refs.modalOverlay?.removeEventListener('click', _onCloseModal);
    }
    if (_onSubmit)       _refs.form.removeEventListener('submit', _onSubmit);
    if (_onSocialToggle) _refs.socialToggle?.removeEventListener('click', _onSocialToggle);
    _refs = null;
  }

  _onOpenModal    = null;
  _onCloseModal   = null;
  _onSubmit       = null;
  _onSocialToggle = null;
}