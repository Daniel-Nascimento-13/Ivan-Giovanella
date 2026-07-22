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
let _ctaTimer = null;

function initEyebrowRoulette() {
  const rouletteEl = document.querySelector('.eyebrow-roulette');
  const track = document.querySelector('.eyebrow-roulette__track');
  if (!rouletteEl || !track) return;

  const words = Array.from(track.querySelectorAll('.eyebrow-roulette__word'));
  if (words.length < 2) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  /* PRÉ-MEDE TODAS AS LARGURAS E ALTURA ANTES DE QUALQUER ANIMAÇÃO */
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

  /* ENVOLVE CADA LETRA EM UM SPAN */
  originalText.split('').forEach(c => {
    const span = document.createElement('span');
    span.style.cssText = 'display:inline-block; line-height:1.2;';
    span.textContent = c === ' ' ? '\u00A0' : c;
    cta.appendChild(span);
  });

  function animate() {
    const spans = cta.querySelectorAll('span');

    /* SAÍDA — LETRAS SOBEM COM BLUR */
    spans.forEach((s, i) => {
      s.style.animation = 'none';
      void s.offsetWidth;
      s.style.animationDelay = (i * 0.03) + 's';
      s.style.animation = 'ctaCharOut 0.4s ease forwards ' + (i * 0.03) + 's';
    });

    /* ENTRADA — LETRAS SOBEM POR BAIXO */
    setTimeout(() => {
      spans.forEach((s, i) => {
        s.style.animation = 'none';
        void s.offsetWidth;
        s.style.animation = 'ctaCharIn 0.5s ease backwards ' + (i * 0.03) + 's';
      });
    }, 500);

    /* LIMPA ANIMAÇÕES */
    setTimeout(() => {
      spans.forEach(s => { s.style.animation = ''; s.style.animationDelay = ''; });
    }, 1100);
  }

  setTimeout(animate, 2000);
  _ctaTimer = setInterval(animate, 5000);
}

function destroyCtaAnimation() {
  clearInterval(_ctaTimer);
  _ctaTimer = null;
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
    onComplete: () => {
      gsap.set(elements, { willChange: 'auto' });
      initEyebrowRoulette();
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