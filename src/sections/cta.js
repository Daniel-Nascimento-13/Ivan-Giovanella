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
   SEÇÃO 6 — CTA FINAL — CONVERSÃO
   ======================================== */

// SELEÇÃO DO DOM, LINK DO WHATSAPP (FONTE ÚNICA), EVENTOS (MODAL, FAB, SUBMIT) E
// CLEANUP. AS ANIMAÇÕES VIVEM EM src/animations/cta.js — ESTE ARQUIVO NÃO CRIA TWEENS.

let _refs = null;
let _onOpenModal = null;
let _onCloseModal = null;
let _onSubmit = null;
let _onSocialToggle = null;

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const section = document.querySelector('#cta');
  if (!section) return null;

  const header = section.querySelector('.cta-header');
  const actions = section.querySelector('.cta-actions');
  const socialWrap = section.querySelector('.cta-social-wrap');
  const social = section.querySelector('[data-cta-social]');
  const socialToggle = section.querySelector('[data-cta-social-toggle]');
  const whatsappBtn = section.querySelector('.cta-btn--whatsapp');
  const openBtn = section.querySelector('[data-cta-open-modal]');
  const modal = section.querySelector('[data-cta-modal]');
  const modalCard = modal?.querySelector('.cta-modal__card');
  const modalOverlay = modal?.querySelector('[data-cta-modal-overlay]');
  const modalClose = modal?.querySelector('[data-cta-modal-close]');
  const form = modal?.querySelector('[data-cta-form]');

  /* GUARD — MARKUP INCOMPLETO NÃO INICIALIZA NADA */
  if (!header || !actions || !socialWrap || !modal || !form) return null;

  return {
    section, header, actions, socialWrap, social, socialToggle,
    whatsappBtn, openBtn, modal, modalCard, modalOverlay, modalClose, form
  };
}

/* ------ MENSAGEM DO WHATSAPP A PARTIR DO FORMULÁRIO ------ */

function buildModalMessage(form) {
  const data = new FormData(form);
  const nome = (data.get('nome') || '').toString().trim();
  const empresa = (data.get('empresa') || '').toString().trim();
  const pessoas = (data.get('pessoas') || '').toString().trim();
  const cidade = (data.get('cidade') || '').toString().trim();

  return `Olá Ivan! Gostaria de uma avaliação do plano. *Nome:* ${nome} | *Empresa:* ${empresa} | *Pessoas:* ${pessoas} | *Cidade:* ${cidade}`;
}

/* ------ INIT ------ */

export function initCta() {
  destroyCta();

  _refs = collectRefs();
  if (!_refs) return;

  /* LINK DO WHATSAPP — FONTE ÚNICA (NUNCA HARDCODED NO MARKUP) */
  if (_refs.whatsappBtn) _refs.whatsappBtn.href = getWhatsappLink();

  /* MODAL COMEÇA OCULTO — GSAP (autoAlpha) ASSUME O CONTROLE DA VISIBILIDADE */
  gsap.set(_refs.modal, { autoAlpha: 0 });

  /* REVEAL — SCROLLTRIGGER SÍNCRONO NO INIT (NUNCA EM CALLBACK ASSÍNCRONO) */
  revealCta(_refs);

  /* ------ MODAL — ABRIR ------ */
  _onOpenModal = () => openModal(_refs);
  _refs.openBtn?.addEventListener('click', _onOpenModal);

  /* ------ MODAL — FECHAR (× OU OVERLAY) ------ */
  _onCloseModal = () => closeModal(_refs);
  _refs.modalClose?.addEventListener('click', _onCloseModal);
  _refs.modalOverlay?.addEventListener('click', _onCloseModal);

  /* ------ MODAL — SUBMIT: MONTA A MENSAGEM E ABRE O WHATSAPP ------ */
  _onSubmit = (e) => {
    e.preventDefault();
    const message = buildModalMessage(_refs.form);
    window.open(getWhatsappLink(message), '_blank', 'noopener,noreferrer');
    closeModal(_refs);
  };
  _refs.form.addEventListener('submit', _onSubmit);

  /* ------ FAB SOCIAL — TOGGLE DE CLASSE (ANIMAÇÃO É CSS) ------ */
  _onSocialToggle = () => {
    const open = _refs.social.classList.toggle('cta-social--open');
    _refs.socialToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    _refs.socialToggle.setAttribute(
      'aria-label',
      open ? 'Ocultar redes sociais' : 'Mostrar redes sociais'
    );
  };
  _refs.socialToggle?.addEventListener('click', _onSocialToggle);

  /* ------ ROLETA DO EYEBROW ------ */
  /* ESPERA A FONTE: A ROLETA PRÉ-MEDE A LARGURA DE CADA PALAVRA E, MEDIDA COM A */
  /* FONTE DE FALLBACK, A PÍLULA NASCERIA COM O TAMANHO ERRADO. */
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (_refs) initCtaRoulette();
    });
  } else {
    initCtaRoulette();
  }
}

/* ------ CLEANUP ------ */

export function destroyCta() {
  destroyCtaRoulette();
  killCtaReveal();

  if (_refs) {
    if (_onOpenModal) _refs.openBtn?.removeEventListener('click', _onOpenModal);
    if (_onCloseModal) {
      _refs.modalClose?.removeEventListener('click', _onCloseModal);
      _refs.modalOverlay?.removeEventListener('click', _onCloseModal);
    }
    if (_onSubmit) _refs.form.removeEventListener('submit', _onSubmit);
    if (_onSocialToggle) _refs.socialToggle?.removeEventListener('click', _onSocialToggle);
    _refs = null;
  }

  _onOpenModal = null;
  _onCloseModal = null;
  _onSubmit = null;
  _onSocialToggle = null;
}
