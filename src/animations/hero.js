import { gsap } from '../lib/gsap.js';
import { EASE, DURATION, STAGGER, REVEAL_FROM, REVEAL_TO } from '../constants/motion.js';
import { getWhatsappLink } from '../data/site-data.js';

/* ========================================
   SEÇÃO 1 — HERO — VÍDEO ANIMADO DE ENTRADA
   ======================================== */

let heroTimeline = null;
let heroElements = null;

/* ------ SELEÇÃO ------ */

function selectHeroElements(hero) {
  const eyebrow = hero.querySelector('.hero-eyebrow');
  const lines = hero.querySelectorAll('.hero-line');
  const subheadline = hero.querySelector('.hero-subheadline');
  const cta = hero.querySelector('.hero-cta');

  return [eyebrow, ...lines, subheadline, cta].filter(Boolean);
}

/* ------ PREPARAÇÃO — ESCONDE O HERO IMEDIATAMENTE, ANTES DA INTRO TERMINAR ------ */
/* EVITA FLASH DE CONTEÚDO SEM ANIMAÇÃO (FOUC) ENQUANTO O VÍDEO AINDA RODA */

export function prepareHero() {
  const hero = document.querySelector('#hero');
  if (!hero) return;

  heroElements = selectHeroElements(hero);
  if (!heroElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  gsap.set(heroElements, REVEAL_FROM);
}

/* ------ ROLETA DO EYEBROW ------ */
let _rouletteTimer = null;

function initEyebrowRoulette() {
  const track = document.querySelector('.eyebrow-roulette__track');
  const rouletteEl = document.querySelector('.eyebrow-roulette');
  if (!track || !rouletteEl) return;

  const words = track.querySelectorAll('.eyebrow-roulette__word');
  if (words.length < 2) return;

  let current = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function advance() {
    current = (current + 1) % words.length;

    // ATUALIZA ARIA-LABEL COM A PALAVRA VISÍVEL
    rouletteEl.setAttribute('aria-label', words[current].textContent);

    if (prefersReduced) {
      gsap.set(track, { y: -(current * 1.2) + 'em' });
    } else {
      gsap.to(track, {
        y: -(current * 1.2) + 'em',
        duration: DURATION.base,
        ease: EASE.smooth,
      });
    }
  }

  _rouletteTimer = setInterval(advance, 3000);
}

function destroyEyebrowRoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
}

/* ------ INIT — CHAMADO APÓS A INTRO TERMINAR ------ */

export function initHero() {
  const hero = document.querySelector('#hero');
  if (!hero) return;

  bindWhatsappCta(hero);

  if (!heroElements) {
    heroElements = selectHeroElements(hero);
  }
  if (!heroElements.length) return;

  animateHero(heroElements);
  initEyebrowRoulette();
}

/* ------ CTA WHATSAPP — FONTE ÚNICA ------ */

function bindWhatsappCta(hero) {
  const cta = hero.querySelector('.hero-cta');
  if (cta) cta.href = getWhatsappLink();
}

/* ------ ANIMAÇÃO — REVELA A PARTIR DO ESTADO JÁ ESCONDIDO ------ */

function animateHero(elements) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  destroyHero();

  if (prefersReducedMotion) {
    gsap.set(elements, { clipPath: 'inset(0 0 0% 0)', y: 0, autoAlpha: 1 });
    return;
  }

  gsap.set(elements, { willChange: 'clip-path, transform, opacity' });

  heroTimeline = gsap.timeline({
    defaults: { ease: EASE.out, duration: DURATION.slow }
  });

  heroTimeline.to(elements, {
    ...REVEAL_TO,
    stagger: STAGGER.base,
    onComplete: () => gsap.set(elements, { willChange: 'auto' })
  });
}

/* ------ CLEANUP ------ */

export function destroyHero() {
  if (heroTimeline) {
    heroTimeline.kill();
    heroTimeline = null;
  }
  destroyEyebrowRoulette();
}