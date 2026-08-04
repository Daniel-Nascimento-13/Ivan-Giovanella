/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from './gsap.js';
import { DURATION, STAGGER, EASE, REVEAL_FROM, REVEAL_TO } from '../constants/motion.js';

/* ========================================
   LIB — REVEAL PROGRESSIVO
   ======================================== */

// CLIP-PATH + TRANSFORM + AUTOALPHA, DISPARADO POR SCROLLTRIGGER.

export function createReveal(elements, options = {}) {
  const targets = (Array.isArray(elements) ? elements : [elements]).filter(Boolean);
  if (targets.length === 0) return null;

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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.set(targets, to);
    return null;
  }

  gsap.set(targets, { ...from, willChange: 'clip-path, transform, opacity' });

  const timeline = gsap.timeline({
    scrollTrigger: { trigger, start, once }
  });

  timeline.to(targets, {
    ...to,
    duration,
    ease,
    stagger,
    onComplete: () => {
      gsap.set(targets, { willChange: 'auto' });
      if (onComplete) onComplete();
    }
  });

  return timeline.scrollTrigger;
}

export function killReveal(st) {
  st?.kill();
}