/* ========================================
   IMPORTS
   ======================================== */

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
   SEÇÃO 5 — COMO FUNCIONA — STEPPER ANIMADO
   ======================================== */

let _timeline = null;
let _rouletteTimer = null;
let _rouletteResetTimer = null;

/* ------ MEDIÇÃO DOS PINS ------ */
// COORDENADAS EM PX RELATIVAS À PISTA — getBoundingClientRect JÁ CONSIDERA ROTAÇÃO.

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
// CONTROL POINTS NA VERTICAL DE CADA PIN: LINHA SAI POR BAIXO E ENTRA POR CIMA,
// FORMANDO UM S SUAVE. COMPRIMENTO ACUMULADO VIA getTotalLength().

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

  return { total, progress: lengths.map((length) => length / total) };
}

/* ------ LAYOUT — VIEWBOX + PATH + PROGRESSO ------ */
// CHAMADO NO INIT E A CADA REBUILD DE RESIZE.
// RETORNA NULL SE A SEÇÃO AINDA NÃO TEM DIMENSÃO.

export function layoutStepperLine(refs) {
  const { stepper, svg, linePath, maskPath, pins } = refs;

  const width = stepper.clientWidth;
  const height = stepper.clientHeight;
  if (!width || !height || pins.length < 2) return null;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  return buildCurve(measurePins(stepper, pins), linePath, maskPath);
}

/* ------ ESTADO ESTÁTICO — GUARD PREFERS-REDUCED-MOTION ------ */

export function applyStepperStaticState(refs) {
  const { maskPath, cards, pins } = refs;

  gsap.set(maskPath, { strokeDasharray: 'none', strokeDashoffset: 0 });
  gsap.set(cards, STEPPER_REVEAL_TO);
  gsap.set(pins, { scale: 1 });
}

/* ------ TIMELINE — LINHA CORRE + CARDS REVELAM NO PIN ------ */

export function createStepperTimeline(refs, geometry) {
  const { section, maskPath, cards, pins } = refs;

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
      onRefreshInit: () => {
        // MEDE OS PINS EM REPOUSO — ESTADO INICIAL DO REVEAL DESLOCA O RECT EM Y.
        gsap.set([...cards, ...pins], { clearProps: 'transform' });
        const next = layoutStepperLine(refs);
        if (next) Object.assign(geometry, next);
      }
    }
  });

  /* ------ LINHA ------ */
  // DESENHO VIA STROKEDASOFFSET DA MÁSCARA — MANTÉM O TRACEJADO 8/6 NA LINHA VISÍVEL.
  // EASE 'none': MAPEAMENTO 1:1 COM O SCROLL; SUAVIZAÇÃO VEM DO scrub.

  _timeline.fromTo(
    maskPath,
    { strokeDasharray: () => geometry.total, strokeDashoffset: () => geometry.total },
    { strokeDashoffset: 0, duration: STEPPER.drawUnits, ease: 'none' },
    0
  );

  /* ------ CARDS ------ */

  cards.forEach((card, index) => {
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

/* ------ ROLETA DO EYEBROW ------ */
// CLONE DA PRIMEIRA PALAVRA FECHA A LISTA — O CICLO SEMPRE DESCE E O RESET
// É INVISÍVEL PORQUE O CONTEÚDO DO CLONE É IGUAL AO DO TOPO.

export function initComoFuncionaEyebrowRoulette() {
  const rouletteEl = document.querySelector('.como-funciona-eyebrow-roulette');
  const track = document.querySelector('.como-funciona-eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(
    track.querySelectorAll('.como-funciona-eyebrow-roulette__word:not([aria-hidden="true"])')
  );
  if (words.length < 2) return;

  destroyComoFuncionaEyebrowRoulette();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  const widths = words.map(w => w.offsetWidth);
  const h = words[0].offsetHeight;

  if (track.dataset.rouletteCloned !== 'true') {
    const clone = words[0].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    track.dataset.rouletteCloned = 'true';
  }

  track.style.transition = 'none';
  track.style.transform = 'translateY(0px)';
  void track.offsetHeight;
  if (!prefersReduced) track.style.transition = '';

  rouletteEl.style.height = h + 'px';
  rouletteEl.style.width = (widths[0] + ROULETTE.widthPadPx) + 'px';

  function advance() {
    current += 1;

    const isClone = current === words.length;
    const wordIndex = isClone ? 0 : current;

    rouletteEl.setAttribute('aria-label', words[wordIndex].textContent.trim());

    if (prefersReduced) {
      track.style.transition = 'none';
      rouletteEl.style.transition = 'none';
    }

    track.style.transform = `translateY(-${current * h}px)`;
    rouletteEl.style.width = (widths[wordIndex] + ROULETTE.widthPadPx) + 'px';

    if (isClone) {
      _rouletteResetTimer = setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateY(0px)';
        void track.offsetHeight;
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

/* ------ CLEANUP ------ */

export function killStepperTimeline() {
  // kill(true) REVERTE O PIN-SPACER — SEM ISSO O ESPAÇO RESERVADO PERSISTE.
  _timeline?.scrollTrigger?.kill(true);
  _timeline?.kill();
  _timeline = null;
}