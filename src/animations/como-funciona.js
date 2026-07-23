import { gsap } from '../lib/gsap.js';
import {
  EASE,
  DURATION,
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

/* ------ CLEANUP — MATA TIMELINE, SCROLLTRIGGER E REVERTE O PIN ------ */

export function killStepperTimeline() {
  /* kill(true) REVERTE O PIN-SPACER — SEM ISSO O ESPAÇO RESERVADO PERSISTE */
  _timeline?.scrollTrigger?.kill(true);
  _timeline?.kill();
  _timeline = null;
}
