import { gsap } from './gsap.js';
import { DURATION, STAGGER, EASE, REVEAL_FROM, REVEAL_TO } from '../constants/motion.js';

/* ============================================
   UTILITÁRIO — REVEAL PROGRESSIVO
   ============================================ */

// REVEAL REUTILIZÁVEL PARA AS SEÇÕES DA LANDING PAGE.
// SCROLL = LENIS | MOVIMENTO = GSAP | PINNING/DISPARO = SCROLLTRIGGER.
// ANIMA APENAS CLIP-PATH + TRANSFORM + OPACITY (VIA AUTOALPHA).

/* ------ CREATE REVEAL ------ */

export function createReveal(elements, options = {}) {
  /* NORMALIZA PARA ARRAY E REMOVE NULOS */
  const targets = (Array.isArray(elements) ? elements : [elements]).filter(Boolean);
  if (targets.length === 0) return null;

  /* OPÇÕES COM DEFAULTS VINDOS DE MOTION.JS — ZERO MAGIC NUMBERS */
  const {
    trigger = targets[0],
    start = 'top 80%',
    stagger = STAGGER.base,
    duration = DURATION.base,
    ease = EASE.out,
    from = REVEAL_FROM,
    to = REVEAL_TO,
    once = true,
    onComplete = null
  } = options;

  /* GUARD PREFERS-REDUCED-MOTION — APLICA ESTADO FINAL E SAI */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.set(targets, to);
    return null;
  }

  /* ESTADO INICIAL + WILL-CHANGE PARA A DURAÇÃO DO REVEAL */
  gsap.set(targets, { ...from, willChange: 'clip-path, transform, opacity' });

  /* TIMELINE COM DISPARO POR SCROLLTRIGGER */
  const timeline = gsap.timeline({
    scrollTrigger: { trigger, start, once }
  });

  timeline.to(targets, {
    ...to,
    duration,
    ease,
    stagger,
    onComplete: () => {
      /* LIBERA WILL-CHANGE AO TERMINAR — EVITA CONTAINING BLOCK RESIDUAL */
      gsap.set(targets, { willChange: 'auto' });
      if (onComplete) onComplete();
    }
  });

  /* RETORNA O SCROLLTRIGGER PARA CLEANUP EXTERNO VIA .KILL() */
  return timeline.scrollTrigger;
}

/* ------ KILL REVEAL ------ */

export function killReveal(st) {
  /* GUARD NULL-SAFE — SEGURO CHAMAR COM O RETORNO DE REVEAL SEM ANIMAÇÃO */
  st?.kill();
}
