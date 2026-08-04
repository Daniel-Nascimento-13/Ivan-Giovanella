/* ========================================
   IMPORTS
   ======================================== */

import { getWhatsappLink, SITE_DATA } from '../lib/whatsapp.js';
import {
  initNavAnimations,
  destroyNavAnimations,
  closeActiveOverlay,
  expandPlanBody,
  collapsePlanBody
} from '../animations/nav.js';

/* ========================================
   SEÇÃO 0 — NAVEGAÇÃO — NAVBAR + OVERLAYS
   ======================================== */

// SELEÇÃO DO DOM, LINK DO WHATSAPP E FORM DA AVALIAÇÃO.
// TWEENS VIVEM EM src/animations/nav.js — ESTE ARQUIVO NÃO CRIA TWEENS.

let _refs = null;
let _controller = null;

/* ------ SELEÇÃO DO DOM ------ */

function collectRefs() {
  const bar = document.querySelector('.nav-bar');
  if (!bar) return null;

  const hamburger = bar.querySelector('[data-nav-hamburger]');
  const bars      = Array.from(bar.querySelectorAll('.nav-hamburger__bar'));

  if (!hamburger || bars.length !== 3) return null;

  // MAPA CHAVE → ELEMENTO: CHAVE = data-nav-overlay, BATE COM data-nav-open DOS BOTÕES.
  const overlays = new Map();
  document.querySelectorAll('[data-nav-overlay]').forEach((el) => {
    overlays.set(el.dataset.navOverlay, el);
  });

  if (!overlays.has('menu')) return null;

  const whatsappLinks = Array.from(document.querySelectorAll('[data-nav-whatsapp]'));
  const form          = document.querySelector('[data-nav-form]');

  return { bar, hamburger, bars, overlays, whatsappLinks, form };
}

/* ------ MENSAGEM DO WHATSAPP ------ */

function buildFormMessage(form) {
  const data    = new FormData(form);
  const nome    = (data.get('nome')    || '').toString().trim();
  const empresa = (data.get('empresa') || '').toString().trim();
  const cnpj    = (data.get('cnpj')    || '').toString().trim();
  const cidade  = (data.get('cidade')  || '').toString().trim();

  const colaboradoresSelect = form.querySelector('[name="colaboradores"]');
  const colaboradores = (colaboradoresSelect?.selectedOptions[0]?.textContent || '').trim();

  const planoSelect = form.querySelector('[name="plano"]');
  const plano = (planoSelect?.selectedOptions[0]?.textContent || '').trim();

  return (
    `Olá Ivan! \n\n` +
    `Me chamo *${nome}* e gostaria de uma avaliação completa para avaliar o que se enquadra melhor à minha necessidade.\n\n` +
    `Empresa: ${empresa}\n` +
    (cnpj ? `CNPJ: ${cnpj}\n` : '') +
    `Colaboradores: ${colaboradores}\n` +
    `Plano: ${plano}\n` +
    `Cidade: ${cidade}\n\n` +
    `Fico no aguardo, obrigado!`
  );
}

/* ========================================
   SEÇÃO PLANOS — CARDS EXPANSÍVEIS
   ======================================== */

// MARKUP GERADO A PARTIR DE SITE_DATA.planos.
// TWEENS VIVEM EM src/animations/nav.js — AQUI SÓ DOM E ESTADO.

const PLAN_LABELS = {
  more: 'Ver tudo',
  less: 'Ver menos'
};

const PLAN_WHATSAPP_ICON = `
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.23-8.23 2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
  </svg>
`;

/* ------ MARKUP DOS ITENS ------ */
// STRING = COBERTURA NORMAL | OBJETO { texto, alerta } = LIMITAÇÃO DO PLANO.

function buildPlanItems(coberturas) {
  return coberturas
    .map((item) => {
      const isAlerta = typeof item === 'object' && item !== null && item.alerta;
      const texto    = typeof item === 'string' ? item : item.texto;
      const cls      = isAlerta ? ' class="nav-plan__item--alerta"' : '';
      return `<li${cls}>${texto}</li>`;
    })
    .join('');
}

function buildPlanCard(plan) {
  const featured = plan.featured ? ' nav-plan--featured' : '';
  const badge    = plan.badge
    ? `<span class="nav-plan__badge">${plan.badge}</span>`
    : '';

  return `
    <div class="nav-plan${featured}" data-plan="${plan.id}">
      <div class="nav-plan__header">
        ${badge}
        <span class="nav-plan__tag">${plan.tag}</span>
        <h3 class="nav-plan__name">${plan.nome}</h3>
        <p class="nav-plan__diferencial">${plan.diferencial}</p>
      </div>

      <div class="nav-plan__body">
        <ul class="nav-plan__list">${buildPlanItems(plan.coberturas)}</ul>

        <div class="nav-plan__hidden" data-plan-hidden>
          <ul class="nav-plan__list nav-plan__list--extra">${buildPlanItems(plan.coberturasExtra)}</ul>
        </div>

        <button type="button" class="nav-plan__toggle" data-plan-toggle aria-expanded="false">${PLAN_LABELS.more}</button>

        <a class="nav-plan__cta" data-plan-whatsapp
           href="${getWhatsappLink(plan.whatsappMessage)}"
           target="_blank" rel="noopener noreferrer">${PLAN_WHATSAPP_ICON}Quero saber mais</a>
      </div>
    </div>
  `;
}

/* ------ ESTADO DO CARD ------ */

function expandPlan(card) {
  const toggle = card.querySelector('[data-plan-toggle]');
  card.classList.add('nav-plan--open');
  toggle.textContent = PLAN_LABELS.less;
  toggle.setAttribute('aria-expanded', 'true');
  expandPlanBody(card.querySelector('[data-plan-hidden]'));
}

function collapsePlan(card, instant = false) {
  const toggle = card.querySelector('[data-plan-toggle]');
  card.classList.remove('nav-plan--open');
  toggle.textContent = PLAN_LABELS.more;
  toggle.setAttribute('aria-expanded', 'false');
  collapsePlanBody(card.querySelector('[data-plan-hidden]'), instant);
}

/* ------ INIT DOS CARDS DE PLANOS ------ */

function initPlansSection(signal) {
  const root = document.querySelector('[data-nav-plans]');
  if (!root) return;

  const planos = SITE_DATA.planos;
  if (!Array.isArray(planos) || !planos.length) return;

  root.innerHTML = planos.map(buildPlanCard).join('');

  const cards = Array.from(root.querySelectorAll('.nav-plan'));

  cards.forEach((card) => collapsePlan(card, true));

  cards.forEach((card) => {
    card.addEventListener(
      'click',
      (e) => {
        if (e.target.closest('[data-plan-whatsapp]')) return;

        const isOpen = card.classList.contains('nav-plan--open');

        // APENAS UM CARD EXPANDIDO POR VEZ.
        cards.forEach((other) => { if (other !== card) collapsePlan(other); });

        if (isOpen) collapsePlan(card);
        else expandPlan(card);
      },
      { signal }
    );
  });
}

/* ------ INIT ------ */

export function initNav(lenis) {
  destroyNav();

  _refs = collectRefs();
  if (!_refs) return;

  const { signal } = (_controller = new AbortController());

  _refs.whatsappLinks.forEach((link) => { link.href = getWhatsappLink(); });

  initNavAnimations(_refs, lenis);

  initPlansSection(signal);

  if (_refs.form) {
    _refs.form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        const message = buildFormMessage(_refs.form);
        window.open(getWhatsappLink(message), '_blank', 'noopener,noreferrer');
        closeActiveOverlay();
      },
      { signal }
    );
  }
}

/* ------ CLEANUP ------ */

export function destroyNav() {
  destroyNavAnimations();
  _controller?.abort();
  _controller = null;
  _refs = null;
}