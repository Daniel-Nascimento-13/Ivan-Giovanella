/* ========================================
   IMPORTS
   ======================================== */

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

/* ------ PREPARAÇÃO ------ */
// ESCONDE O HERO ANTES DA INTRO TERMINAR — EVITA FOUC.

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
let _ctaTimer = null;
let _ctaTimeouts = [];

function initEyebrowRoulette() {
  const rouletteEl = document.querySelector('.eyebrow-roulette');
  const track = document.querySelector('.eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(track.querySelectorAll('.eyebrow-roulette__word'));
  if (words.length < 2) return;

  // GUARD — EVITA DOIS setInterval VIVOS SE A CHAMADA FOR ASSÍNCRONA.
  destroyEyebrowRoulette();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  const widths = words.map(w => w.offsetWidth);
  const h = words[0].offsetHeight;

  rouletteEl.style.height = h + 'px';
  rouletteEl.style.width = (widths[0] + 4) + 'px';

  function advance() {
    current = (current + 1) % words.length;
    rouletteEl.setAttribute('aria-label', words[current].textContent.trim());

    if (prefersReduced) {
      track.style.transition = 'none';
      rouletteEl.style.transition = 'none';
    }

    track.style.transform = `translateY(-${current * h}px)`;
    rouletteEl.style.width = (widths[current] + 4) + 'px';
  }

  _rouletteTimer = setInterval(advance, 3000);
}

function destroyEyebrowRoulette() {
  clearInterval(_rouletteTimer);
  _rouletteTimer = null;
}

/* ------ ANIMAÇÃO DE LETRAS DO CTA ------ */

function initCtaAnimation() {
  const cta = document.querySelector('.hero-cta-label');
  if (!cta) return;

  const originalText = cta.textContent.trim();
  cta.innerHTML = '';

  originalText.split('').forEach(c => {
    const span = document.createElement('span');
    span.style.cssText = 'display:inline-block; line-height:1.2;';
    span.textContent = c === ' ' ? '\u00A0' : c;
    cta.appendChild(span);
  });

  function animate() {
    const spans = cta.querySelectorAll('span');

    spans.forEach((s, i) => {
      s.style.animation = 'none';
      void s.offsetWidth;
      s.style.animationDelay = (i * 0.03) + 's';
      s.style.animation = 'ctaCharOut 0.4s ease forwards ' + (i * 0.03) + 's';
    });

    const tIn = setTimeout(() => {
      _ctaTimeouts = _ctaTimeouts.filter(h => h !== tIn);
      spans.forEach((s, i) => {
        s.style.animation = 'none';
        void s.offsetWidth;
        s.style.animation = 'ctaCharIn 0.5s ease backwards ' + (i * 0.03) + 's';
      });
    }, 500);
    _ctaTimeouts.push(tIn);

    const tClean = setTimeout(() => {
      _ctaTimeouts = _ctaTimeouts.filter(h => h !== tClean);
      spans.forEach(s => { s.style.animation = ''; s.style.animationDelay = ''; });
    }, 1100);
    _ctaTimeouts.push(tClean);
  }

  const tInit = setTimeout(() => {
    _ctaTimeouts = _ctaTimeouts.filter(h => h !== tInit);
    animate();
  }, 2000);
  _ctaTimeouts.push(tInit);
  _ctaTimer = setInterval(animate, 5000);
}

function destroyCtaAnimation() {
  // CANCELA TIMEOUTS PENDENTES — EVITA ESCRITA EM SPANS APÓS DESTROY.
  _ctaTimeouts.forEach(clearTimeout);
  _ctaTimeouts = [];
  clearInterval(_ctaTimer);
  _ctaTimer = null;
}

/* ------ INIT ------ */

export function initHero() {
  const hero = document.querySelector('#hero');
  if (!hero) return;

  bindWhatsappCta(hero);

  if (!heroElements) {
    heroElements = selectHeroElements(hero);
  }
  if (!heroElements.length) return;

  animateHero(heroElements);
}

/* ------ CTA WHATSAPP ------ */

function bindWhatsappCta(hero) {
  const cta = hero.querySelector('.hero-cta');
  if (cta) cta.href = getWhatsappLink();
}

/* ------ ANIMAÇÃO ------ */

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
    onComplete: () => {
      gsap.set(elements, { willChange: 'auto' });

      // AGUARDA FONTES — offsetWidth SEM FONTE CARREGADA GERA PÍLULA COM TAMANHO ERRADO.
      if (document.fonts) {
        document.fonts.ready.then(() => initEyebrowRoulette());
      } else {
        initEyebrowRoulette();
      }

      initCtaAnimation();
    }
  });
}

/* ------ CLEANUP ------ */

export function destroyHero() {
  if (heroTimeline) {
    heroTimeline.kill();
    heroTimeline = null;
  }
  destroyEyebrowRoulette();
  destroyCtaAnimation();
}