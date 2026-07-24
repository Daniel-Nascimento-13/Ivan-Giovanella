import { gsap } from '../lib/gsap.js';
import {
  EASE,
  DURATION,
  STAGGER,
  DEPOIMENTOS,
  ROULETTE
} from '../constants/motion.js';
import { createReveal } from '../lib/reveal.js';

/* ========================================
   SEÇÃO 5 — DEPOIMENTOS — CARDS EMPILHADOS
   ======================================== */

// POSICIONAMENTO DA PILHA, REVEAL DE ENTRADA E ROLETA DO EYEBROW.
// SCROLL = LENIS | MOVIMENTO = GSAP | DISPARO = SCROLLTRIGGER.
// A TROCA DE CARD É TRANSIÇÃO CSS (MICRO-INTERAÇÃO) — GSAP SÓ FAZ O REVEAL.
// TODOS OS NÚMEROS VÊM DE src/constants/motion.js.

let _revealST = null;
let _rouletteTimer = null;
let _rouletteResetTimer = null;

/* ------ DISTÂNCIA CIRCULAR ENTRE DOIS ÍNDICES ------ */
// COM 10 CARDS EM CICLO, O CAMINHO MAIS CURTO ENTRE ATIVO E CARD i FICA EM -5..5.
// É ISSO QUE FAZ A PILHA EMBRULHAR: O CARD 10 É VIZINHO DO CARD 1.

function circularDelta(i, active, total) {
  let d = i - active;
  const half = total / 2;
  if (d > half) d -= total;
  if (d < -half) d += total;
  return d;
}

/* ------ POSICIONA OS CARDS EM TORNO DO ATIVO ------ */
// PURO DOM: ATRIBUI A CLASSE DE BANDA (ATIVO / ±1 / ±2 / OCULTO) E O SINAL DA
// DIREÇÃO (--dep-dir). O MOVIMENTO EM SI É A TRANSIÇÃO CSS DO .depoimento-card.

export function positionCards(cards, activeIndex, { instant = false } = {}) {
  const total = cards.length;
  const list = cards[0]?.parentElement;

  /* PRIMEIRA APLICAÇÃO SEM ANIMAÇÃO — EVITA O FAN-OUT A PARTIR DO CENTRO NO LOAD */
  if (instant && list) {
    list.classList.add('depoimentos-cards--init');
  }

  cards.forEach((card, i) => {
    const d = circularDelta(i, activeIndex, total);
    const abs = Math.abs(d);
    const dir = d === 0 ? 0 : (d > 0 ? 1 : -1);

    card.style.setProperty('--dep-dir', String(dir));
    card.classList.remove(
      'depoimento-card--active',
      'depoimento-card--side-1',
      'depoimento-card--side-2',
      'depoimento-card--hidden'
    );

    if (abs === 0) {
      card.classList.add('depoimento-card--active');
    } else if (abs <= DEPOIMENTOS.visibleRange) {
      card.classList.add(`depoimento-card--side-${abs}`);
    } else {
      card.classList.add('depoimento-card--hidden');
    }

    /* ACESSIBILIDADE — SÓ O CARD ATIVO É EXPOSTO À LEITURA SEQUENCIAL */
    card.setAttribute('aria-hidden', abs === 0 ? 'false' : 'true');
  });

  /* RELIGA A TRANSIÇÃO APÓS UM REFLOW — AS TROCAS SEGUINTES ANIMAM */
  if (instant && list) {
    void list.offsetHeight;
    list.classList.remove('depoimentos-cards--init');
  }
}

/* ------ REVEAL — HEADER (CLIP) + CARDS (STAGGER SEM MEXER NO TRANSFORM) ------ */

export function revealDepoimentos(refs) {
  const { section, header, cards } = refs;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* HEADER — REVEAL PADRÃO COM CLIP-PATH + TRANSLATEY + AUTOALPHA */
  const headerEls = Array.from(header.children);
  _revealST = createReveal(headerEls, {
    trigger: section,
    start: DEPOIMENTOS.revealStart,
    stagger: STAGGER.base
  });

  /* GUARD — SEM ANIMAÇÃO: CARDS JÁ VISÍVEIS (--dep-reveal PADRÃO = 1) */
  if (prefersReduced) return;

  /* CARDS — MULTIPLICADOR --dep-reveal DE 0→1 COM STAGGER. */
  /* OPACITY-ONLY VIA CUSTOM PROPERTY: NÃO TOCA transform (POSIÇÃO DA PILHA) NEM */
  /* SOBRESCREVE A OPACITY DE BANDA — OS DOIS SE MULTIPLICAM NO CSS. */
  gsap.set(cards, { '--dep-reveal': 0 });
  gsap.to(cards, {
    '--dep-reveal': 1,
    duration: DURATION.base,
    ease: EASE.out,
    stagger: DEPOIMENTOS.staggerMs / 1000,
    scrollTrigger: {
      trigger: section,
      start: DEPOIMENTOS.revealStart,
      once: true
    }
  });
}

/* ------ ROLETA DO EYEBROW — SEÇÃO 5 — DEPOIMENTOS ------ */
// MESMO MECANISMO DA SEÇÃO 4: TRACK EM COLUNA QUE DESLIZA POR TRANSITION CSS, COM
// A LARGURA DO WRAPPER SEGUINDO A PALAVRA ATUAL. UM CLONE DA PRIMEIRA PALAVRA FECHA
// A LISTA E O TRACK VOLTA AO TOPO COM A TRANSIÇÃO DESLIGADA — SALTO INVISÍVEL.

export function initDepoimentosRoulette() {
  const rouletteEl = document.querySelector('.depoimentos-eyebrow-roulette');
  const track = document.querySelector('.depoimentos-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  /* O CLONE FICA FORA DA CONTAGEM — REINICIALIZAÇÃO NÃO PODE TRATÁ-LO COMO PALAVRA */
  const words = Array.from(
    track.querySelectorAll('.depoimentos-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  destroyDepoimentosRoulette();

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

export function destroyDepoimentosRoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
  clearTimeout(_rouletteResetTimer);
  _rouletteResetTimer = null;
}

/* ------ CLEANUP — MATA O REVEAL E SEU SCROLLTRIGGER ------ */

export function killDepoimentosReveal() {
  _revealST?.kill();
  _revealST = null;
}
