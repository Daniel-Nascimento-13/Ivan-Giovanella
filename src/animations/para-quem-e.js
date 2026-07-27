import { STAGGER, PARA_QUEM } from '../constants/motion.js';
import { createReveal, killReveal } from '../lib/reveal.js';

/* ========================================
   SEÇÃO 4 — PARA QUEM É — PERFIS DE CONTRATAÇÃO
   ======================================== */

// REVEAL DE ENTRADA (GSAP + SCROLLTRIGGER) + LÓGICA DO ACCORDION (TRANSITION CSS).
// SCROLL = LENIS | MOVIMENTO/REVEAL = GSAP | ABERTURA DO CARD = TRANSITION CSS.
// O ESTADO ATIVO/INATIVO DOS BOTÕES É APLICADO INLINE VIA JS — GARANTE O TOGGLE
// INDEPENDENTE DE CLASSES. TODOS OS NÚMEROS VÊM DE src/constants/motion.js.

let _revealHeaderST = null;
let _revealListST = null;

let _btns = null;
let _onClick = null;
let _switchTimer = null;

/* ------ REVEAL — HEADER (CLIP) + LISTA DE BOTÕES (STAGGER 0.08) ------ */

export function revealParaQuemE(refs) {
  const { section, header, btns } = refs;

  /* HEADER — REVEAL PADRÃO: CLIP-PATH + TRANSLATEY + AUTOALPHA */
  const headerEls = Array.from(header.children);
  _revealHeaderST = createReveal(headerEls, {
    trigger: section,
    start: PARA_QUEM.revealStart,
    stagger: STAGGER.base
  });

  /* LISTA — MESMO REVEAL, STAGGER MAIS CURTO ENTRE OS BOTÕES */
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

/* ------ ACCORDION — ESTADO ATIVO/INATIVO + TROCA DE CARD ------ */
// current = -1 → NENHUM PERFIL ABERTO. AO CLICAR:
//   MESMO PERFIL ATIVO → DESATIVA O BOTÃO E FECHA O CARD.
//   PERFIL DIFERENTE   → DESATIVA TODOS, ATIVA O CLICADO E ANIMA A TROCA DO CARD
//                        (SE JÁ HAVIA UM ABERTO: FADE OUT → 250ms → CONTEÚDO → FADE IN).

/* APLICA O ESTADO ATIVO/INATIVO DE UM BOTÃO — INLINE, SOBRESCREVENDO O CSS BASE */
function setButtonActive(btn, active) {
  const icon = btn.querySelector('.para-quem-btn__toggle-icon');
  if (active) {
    btn.style.backgroundColor = 'var(--color-orange)';
    btn.style.borderColor = 'var(--color-orange)';
    btn.style.color = 'var(--color-ink)';
    btn.setAttribute('aria-expanded', 'true');
    /* ÍCONE "+" ROTACIONA 45deg → VIRA "×", COR var(--color-ink) */
    if (icon) {
      icon.style.transform = 'rotate(45deg)';
      icon.style.color = 'var(--color-ink)';
    }
  } else {
    /* LIMPA O INLINE → VOLTA AO ESTADO INATIVO DO CSS */
    btn.style.backgroundColor = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    btn.setAttribute('aria-expanded', 'false');
    if (icon) {
      icon.style.transform = '';
      icon.style.color = '';
    }
  }
}

export function initParaQuemEAccordion(refs) {
  const { btns, detail, icon, tag, title, text } = refs;
  _btns = btns;

  let current = -1;

  /* PREENCHE O CARD COM O CONTEÚDO DO BOTÃO (DATA-* + ÍCONE-FONTE CLONADO) */
  function fillContent(btn) {
    tag.textContent = btn.dataset.tag || '';
    title.textContent = btn.dataset.title || '';
    text.textContent = btn.dataset.text || '';
    const source = btn.querySelector('.para-quem-btn__source-icon');
    icon.innerHTML = source ? source.innerHTML : '';
  }

  function openDetail(btn) {
    fillContent(btn);
    detail.classList.add('is-open');
  }

  function closeDetail() {
    detail.classList.remove('is-open');
  }

  _onClick = (e) => {
    const btn = e.target.closest('.para-quem-btn');
    if (!btn || !_btns.includes(btn)) return;

    const index = Number(btn.dataset.index);
    clearTimeout(_switchTimer);

    /* JÁ ATIVO → DESATIVA E FECHA */
    if (index === current) {
      setButtonActive(btn, false);
      closeDetail();
      current = -1;
      return;
    }

    /* DIFERENTE → DESATIVA TODOS, ATIVA O CLICADO */
    _btns.forEach((b) => setButtonActive(b, false));
    setButtonActive(btn, true);

    const wasOpen = current !== -1;
    current = index;

    if (wasOpen) {
      /* CARD ABERTO: FECHA, ESPERA E REABRE COM O NOVO CONTEÚDO */
      closeDetail();
      _switchTimer = setTimeout(() => openDetail(btn), PARA_QUEM.switchDelayMs);
    } else {
      openDetail(btn);
    }
  };

  /* DELEGAÇÃO NO CONTÊINER DA LISTA — UM ÚNICO LISTENER */
  _btns[0].parentElement.addEventListener('click', _onClick);
}

export function destroyParaQuemEAccordion() {
  clearTimeout(_switchTimer);
  _switchTimer = null;

  if (_btns && _btns.length && _onClick) {
    _btns[0].parentElement.removeEventListener('click', _onClick);
  }
  _btns = null;
  _onClick = null;
}
