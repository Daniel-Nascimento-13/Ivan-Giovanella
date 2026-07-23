import { gsap } from '../lib/gsap.js';
import {
  EASE,
  DURATION,
  ROULETTE,
  STEPPER,
  STEPPER_REVEAL_FROM,
  STEPPER_REVEAL_TO
} from '../constants/motion.js';

/* ========================================
   SEÇÃO 4 — COMO FUNCIONA — STEPPER ANIMADO
   ======================================== */

// GEOMETRIA + TIMELINE DA LINHA QUE COSTURA OS 5 PASSOS.
// SCROLL = LENIS | MOVIMENTO = GSAP | PIN/SCRUB = SCROLLTRIGGER.
// TODOS OS NÚMEROS VÊM DE src/constants/motion.js — ZERO MAGIC NUMBERS AQUI.

let _timeline = null;
let _rouletteTimer = null;
let _rouletteResetTimer = null;

/* ------ MEDIÇÃO DOS PINS ------ */
// COORDENADAS EM PIXELS RELATIVAS À PISTA — NUNCA VALORES FIXOS NO PATH.
// getBoundingClientRect JÁ DEVOLVE O BOX PÓS-ROTAÇÃO DO CARD, ENTÃO O CENTRO
// DO PIN CONTINUA CORRETO MESMO COM O TILT DE 2deg.

function measurePins(stepper, pins) {
  const base = stepper.getBoundingClientRect();

  return pins.map((pin) => {
    const rect = pin.getBoundingClientRect();
    return {
      x: rect.left - base.left + rect.width / 2,
      y: rect.top - base.top + rect.height / 2
    };
  });
}

/* ------ CURVA — BEZIER CÚBICA PIN A PIN ------ */
// OS CONTROL POINTS FICAM NA VERTICAL DE CADA PIN: A LINHA SAI POR BAIXO DE UM
// E ENTRA POR CIMA DO PRÓXIMO, DESENHANDO UM S SUAVE NO CORREDOR CENTRAL.
// A MEDIÇÃO ACUMULADA USA O PRÓPRIO PATH VISÍVEL — getTotalLength() EXIGE
// UM ELEMENTO PRESENTE NO DOCUMENTO.

function buildCurve(points, linePath, maskPath) {
  const round = (value) => value.toFixed(STEPPER.coordPrecision);

  let previous = points[0];
  let d = `M ${round(previous.x)} ${round(previous.y)}`;
  const lengths = [0];

  points.slice(1).forEach((point) => {
    const pull = (point.y - previous.y) * STEPPER.curveTension;

    d += ` C ${round(previous.x)} ${round(previous.y + pull)}` +
         ` ${round(point.x)} ${round(point.y - pull)}` +
         ` ${round(point.x)} ${round(point.y)}`;

    linePath.setAttribute('d', d);
    lengths.push(linePath.getTotalLength());
    previous = point;
  });

  maskPath.setAttribute('d', d);

  const total = lengths[lengths.length - 1];
  if (!total) return null;

  /* PROGRESSO NORMALIZADO DE CADA PIN AO LONGO DA LINHA (0 → 1) */
  return { total, progress: lengths.map((length) => length / total) };
}

/* ------ LAYOUT — VIEWBOX + PATH + PROGRESSO DOS PINS ------ */
// CHAMADO NO INIT E A CADA REBUILD DE RESIZE. RETORNA NULL SE A PISTA AINDA
// NÃO TEM DIMENSÃO (SEÇÃO OCULTA, LAYOUT NÃO RESOLVIDO).

export function layoutStepperLine(refs) {
  const { stepper, svg, linePath, maskPath, pins } = refs;

  const width = stepper.clientWidth;
  const height = stepper.clientHeight;
  if (!width || !height || pins.length < 2) return null;

  /* VIEWBOX 1:1 COM O BOX DA PISTA — stroke-width EM PX SEM REESCALA */
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  return buildCurve(measurePins(stepper, pins), linePath, maskPath);
}

/* ------ ESTADO ESTÁTICO — GUARD PREFERS-REDUCED-MOTION ------ */
// LINHA INTEIRA VISÍVEL E CARDS NO ESTADO FINAL, SEM SCROLLTRIGGER E SEM PIN.

export function applyStepperStaticState(refs) {
  const { maskPath, cards, pins } = refs;

  gsap.set(maskPath, { strokeDasharray: 'none', strokeDashoffset: 0 });
  gsap.set(cards, STEPPER_REVEAL_TO);
  gsap.set(pins, { scale: 1 });
}

/* ------ TIMELINE — LINHA CORRE E OS CARDS REVELAM NO PIN ------ */

export function createStepperTimeline(refs, geometry) {
  const { section, maskPath, cards, pins } = refs;

  /* GPU — DECLARA O QUE VAI MUDAR ANTES DE ANIMAR */
  gsap.set(cards, { willChange: 'clip-path, transform, opacity' });
  gsap.set(pins, { willChange: 'transform' });

  _timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: STEPPER.start,
      end: STEPPER.end,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: STEPPER.scrub,
      invalidateOnRefresh: true,
      /* REMEDE A LINHA A CADA REFRESH — O LAYOUT MUDA COM FONTE E VIEWPORT. */
      /* SEM CRIAR SCROLLTRIGGER NOVO: SÓ RECALCULA A GEOMETRIA NO LUGAR. */
      onRefreshInit: () => {
        /* PINS PRECISAM SER MEDIDOS EM REPOUSO — O ESTADO INICIAL DO REVEAL */
        /* DESLOCA O RECT EM y E CONTAMINARIA O PATH. */
        gsap.set([...cards, ...pins], { clearProps: 'transform' });
        const next = layoutStepperLine(refs);
        if (next) Object.assign(geometry, next);
      }
    }
  });

  /* ------ LINHA — DESENHO VIA STROKEDASHOFFSET DA MÁSCARA ------ */
  // A LINHA VISÍVEL PRECISA MANTER O TRACEJADO 8/6, ENTÃO O DESENHO ACONTECE NA
  // MÁSCARA: UM TRAÇO SÓLIDO COM DASHARRAY = COMPRIMENTO TOTAL QUE ABRE DE
  // OFFSET TOTAL ATÉ 0, REVELANDO O TRACEJADO POR BAIXO.
  // EASE 'none' É INTENCIONAL: MAPEIA O DESENHO 1:1 COM O SCROLL — A SUAVIZAÇÃO
  // VEM DO scrub DO SCROLLTRIGGER, NÃO DE UMA CURVA DE EASING.
  // VALORES EM FUNÇÃO: RELIDOS A CADA REFRESH (invalidateOnRefresh) COM O
  // COMPRIMENTO NOVO DA LINHA.
  _timeline.fromTo(
    maskPath,
    { strokeDasharray: () => geometry.total, strokeDashoffset: () => geometry.total },
    { strokeDashoffset: 0, duration: STEPPER.drawUnits, ease: 'none' },
    0
  );

  /* ------ CARDS — REVEAL QUANDO A LINHA ALCANÇA O PIN ------ */
  cards.forEach((card, index) => {
    /* POSIÇÃO NA TIMELINE = PROGRESSO DO PIN × DURAÇÃO DO DESENHO */
    const at = geometry.progress[index] * STEPPER.drawUnits;

    _timeline.fromTo(
      card,
      { ...STEPPER_REVEAL_FROM },
      { ...STEPPER_REVEAL_TO, duration: DURATION.base, ease: EASE.out },
      at
    );

    _timeline.fromTo(
      pins[index],
      { scale: 0 },
      { scale: 1, duration: DURATION.fast, ease: EASE.smooth },
      at
    );
  });

  return _timeline;
}

/* ------ ROLETA DO EYEBROW — SEÇÃO 4 — COMO FUNCIONA ------ */
// MESMO MECANISMO DAS SEÇÕES 1, 2 E 3: TRACK EM COLUNA QUE DESLIZA POR TRANSITION
// CSS, COM A LARGURA DO WRAPPER ACOMPANHANDO A PALAVRA ATUAL. SEM GSAP.
//
// ÚNICA DIFERENÇA: AS OUTRAS SEÇÕES TÊM 2 PALAVRAS E USAM current = (current+1) % n,
// ENTÃO A VOLTA AO TOPO É UM PASSO SÓ E NÃO SE PERCEBE. COM 5 PALAVRAS ESSA VOLTA
// SERIA UM REBOBINAR DE 4 PASSOS, BEM VISÍVEL. POR ISSO UM CLONE DA PRIMEIRA
// PALAVRA FECHA A LISTA: O CICLO SEMPRE DESCE, E AO CHEGAR NO CLONE O TRACK VOLTA
// AO TOPO COM A TRANSIÇÃO DESLIGADA — SALTO INVISÍVEL PORQUE O CONTEÚDO É IGUAL.

export function initComoFuncionaEyebrowRoulette() {
  const rouletteEl = document.querySelector('.como-funciona-eyebrow-roulette');
  const track = document.querySelector('.como-funciona-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  /* O CLONE FICA FORA DA LISTA — UMA REINICIALIZAÇÃO NÃO PODE CONTÁ-LO COMO PALAVRA */
  const words = Array.from(
    track.querySelectorAll('.como-funciona-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  /* GUARD — REINICIALIZAÇÃO NÃO PODE ACUMULAR TIMER */
  destroyComoFuncionaEyebrowRoulette();

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

export function destroyComoFuncionaEyebrowRoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
  clearTimeout(_rouletteResetTimer);
  _rouletteResetTimer = null;
}

/* ------ CLEANUP — MATA TIMELINE, SCROLLTRIGGER E REVERTE O PIN ------ */

export function killStepperTimeline() {
  /* kill(true) REVERTE O PIN-SPACER — SEM ISSO O ESPAÇO RESERVADO PERSISTE */
  _timeline?.scrollTrigger?.kill(true);
  _timeline?.kill();
  _timeline = null;
}
