import { STAGGER, PARA_QUEM, ROULETTE } from '../constants/motion.js';
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
let _container = null;
let _onClick = null;

let _rouletteTimer = null;
let _rouletteResetTimer = null;

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

/* ------ ACCORDION — CADA ITEM ABRE SEU PRÓPRIO CARD ABAIXO DO BOTÃO ------ */
// current = -1 → NENHUM PERFIL ABERTO. AO CLICAR:
//   MESMO PERFIL ATIVO → DESATIVA O BOTÃO E FECHA O SEU CARD.
//   PERFIL DIFERENTE   → FECHA TODOS OS CARDS, ATIVA O CLICADO E ABRE O CARD DELE
//                        (max-height/opacity POR TRANSITION CSS — VER .para-quem-detail).

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

/* O CARD DE UM BOTÃO É O .para-quem-detail IRMÃO DENTRO DO MESMO .para-quem-item */
function detailOf(btn) {
  return btn.parentElement.querySelector('.para-quem-detail');
}

function closeItem(btn) {
  setButtonActive(btn, false);
  const detail = detailOf(btn);
  if (detail) detail.classList.remove('open');
}

function openItem(btn) {
  setButtonActive(btn, true);
  const detail = detailOf(btn);
  if (detail) detail.classList.add('open');
}

export function initParaQuemEAccordion(refs) {
  const { btns } = refs;
  _btns = btns;
  /* CONTÊINER COMUM A TODOS OS ITENS — ALVO DA DELEGAÇÃO DE CLIQUE */
  _container = btns[0].closest('.para-quem-accordion');
  if (!_container) return;

  let current = -1;

  _onClick = (e) => {
    const btn = e.target.closest('.para-quem-btn');
    if (!btn || !_btns.includes(btn)) return;

    const index = Number(btn.dataset.index);

    /* JÁ ATIVO → DESATIVA E FECHA O SEU CARD */
    if (index === current) {
      closeItem(btn);
      current = -1;
      return;
    }

    /* DIFERENTE → FECHA TODOS, ABRE O CLICADO LOGO ABAIXO DO BOTÃO */
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

/* ------ ROLETA DO EYEBROW — SEÇÃO 4 — PARA QUEM É ------ */
// MESMO MECANISMO DAS DEMAIS SEÇÕES: TRACK EM COLUNA QUE DESLIZA POR TRANSITION CSS,
// COM A LARGURA DO WRAPPER SEGUINDO A PALAVRA ATUAL. UM CLONE DA PRIMEIRA PALAVRA
// FECHA A LISTA E O TRACK VOLTA AO TOPO COM A TRANSIÇÃO DESLIGADA — SALTO INVISÍVEL.

export function initParaQuemERoulette() {
  const rouletteEl = document.querySelector('.pq-eyebrow-roulette');
  const track = document.querySelector('.pq-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  /* O CLONE FICA FORA DA CONTAGEM — REINICIALIZAÇÃO NÃO PODE TRATÁ-LO COMO PALAVRA */
  const words = Array.from(
    track.querySelectorAll('.pq-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  destroyParaQuemERoulette();

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

export function destroyParaQuemERoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
  clearTimeout(_rouletteResetTimer);
  _rouletteResetTimer = null;
}
