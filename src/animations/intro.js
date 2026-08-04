/* ========================================
   IMPORTS
   ======================================== */

import { gsap } from '../lib/gsap.js';
import { EASE, DURATION, TIMEOUT } from '../constants/motion.js';

/* ========================================
   SEÇÃO 0 — INTRO — VÍDEO DE ENTRADA
   ======================================== */

const INTRO_SESSION_KEY = 'unimed_intro_played';

export function initIntro(onComplete) {
  const overlay = document.querySelector('#intro-overlay');
  const video   = document.querySelector('#intro-video');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const alreadyPlayed = import.meta.env.DEV
    ? false
    : sessionStorage.getItem(INTRO_SESSION_KEY);

  if (!overlay || !video || prefersReducedMotion || alreadyPlayed) {
    overlay?.remove();
    onComplete();
    return;
  }

  /* ------ ATRIBUTOS OBRIGATÓRIOS PARA IOS ------ */
  
  video.muted       = true;
  video.playsInline = true;
  video.autoplay    = false;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('webkit-playsinline', '');

  let fallback;
  let finished = false;

  /* ------ SAÍDA ------ */

  const finishIntro = () => {
    if (finished) return;
    finished = true;

    clearTimeout(fallback);
    gsap.set(overlay, { willChange: 'clip-path, opacity' });

    gsap.to(overlay, {
      autoAlpha: 0,
      clipPath: 'inset(0 0 100% 0)',
      y: -40,
      duration: DURATION.slow,
      ease: EASE.smooth,
      onComplete: () => {
        overlay.remove();
        onComplete();
      }
    });
  };

  /* ------ FALLBACK ------ */

  const scheduleFallback = () => {
    clearTimeout(fallback);

    const knownDuration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration * 1000 + TIMEOUT.introEndedBuffer
      : TIMEOUT.introFallback;

    fallback = setTimeout(finishIntro, Math.min(knownDuration, TIMEOUT.introFallbackMax));
  };

  /* ------ PRIMING IOS ------ */
  // play/pause OBRIGATÓRIO ANTES DO PLAY REAL — IOS NÃO RENDERIZA O PRIMEIRO FRAME SEM ISSO.
  // MUTED + playsinline PERMITE play() PROGRAMÁTICO SEM GESTO DO USUÁRIO.

  const primeAndPlay = () => {
    try { video.currentTime = 0; } catch { /* IGNORADO */ }

    const primePromise = video.play();

    if (primePromise !== undefined) {
      primePromise
        .then(() => {
          video.pause();
          video.currentTime = 0;
          return video.play();
        })
        .then(() => {
          if (!import.meta.env.DEV) {
            sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
          }
          scheduleFallback();
        })
        .catch(finishIntro);
    } else {
      try { video.play(); } catch { finishIntro(); }
      scheduleFallback();
    }
  };

  video.addEventListener('ended', finishIntro, { once: true });
  video.addEventListener('loadedmetadata', scheduleFallback, { once: true });

  if (video.readyState >= 1 && Number.isFinite(video.duration)) {
    scheduleFallback();
  } else {
    fallback = setTimeout(finishIntro, TIMEOUT.introFallback);
  }

  video.load();
  primeAndPlay();
}