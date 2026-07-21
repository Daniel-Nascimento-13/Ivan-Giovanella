import { gsap } from '../lib/gsap.js';
import { EASE, DURATION, TIMEOUT } from '../constants/motion.js';

/* ========================================
   SEÇÃO 1 — HERO — VÍDEO ANIMADO DE ENTRADA
   ======================================== */

const INTRO_SESSION_KEY = 'unimed_intro_played';

export function initIntro(onComplete) {
  const overlay = document.querySelector('#intro-overlay');
  const video = document.querySelector('#intro-video');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const alreadyPlayed = import.meta.env.DEV
    ? false
    : sessionStorage.getItem(INTRO_SESSION_KEY);

  if (!overlay || !video || prefersReducedMotion || alreadyPlayed) {
    overlay?.remove();
    onComplete();
    return;
  }

  video.muted = true;
  video.playsInline = true;

  let fallback;
  let finished = false;

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

  /* ------ FALLBACK — RECALCULADO ASSIM QUE A DURAÇÃO REAL É CONHECIDA ------ */
  /* NUNCA CORTA O VÍDEO ANTES DO 'ended' — SÓ AGE SE ALGO REALMENTE TRAVAR */

  const scheduleFallback = () => {
    clearTimeout(fallback);

    const knownDuration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration * 1000 + TIMEOUT.introEndedBuffer
      : TIMEOUT.introFallback;

    fallback = setTimeout(finishIntro, Math.min(knownDuration, TIMEOUT.introFallbackMax));
  };

  const primeAndPlay = () => {
    // GARANTE INÍCIO DO PRIMEIRO FRAME — SEM PAUSE/RESTART (EVITA FLASH E PROMISE ÓRFÃ)
    try { video.currentTime = 0; } catch { /* METADATA AINDA NÃO DISPONÍVEL */ }

    video.play()
      .then(() => {
        if (!import.meta.env.DEV) {
          sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
        }
        scheduleFallback();
      })
      .catch(finishIntro);
  };

  video.addEventListener('ended', finishIntro, { once: true });
  video.addEventListener('loadedmetadata', scheduleFallback, { once: true });

  // FALLBACK INICIAL — CASO METADATA JÁ TENHA CARREGADO ANTES DO LISTENER
  if (video.readyState >= 1 && Number.isFinite(video.duration)) {
    scheduleFallback();
  } else {
    fallback = setTimeout(finishIntro, TIMEOUT.introFallback);
  }

  if (video.readyState >= 2) {
    primeAndPlay();
  } else {
    video.addEventListener('canplaythrough', primeAndPlay, { once: true });
  }
}