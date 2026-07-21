import { gsap } from '../lib/gsap.js';
import { EASE, DURATION, TIMEOUT } from '../constants/motion.js';

/* ========================================
   SEÇÃO 1 — HERO — VÍDEO ANIMADO DE ENTRADA
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
  video.muted        = true;
  video.playsInline  = true;
  video.autoplay     = false;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('webkit-playsinline', '');

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

  /* ------ FALLBACK ------ */
  const scheduleFallback = () => {
    clearTimeout(fallback);

    const knownDuration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration * 1000 + TIMEOUT.introEndedBuffer
      : TIMEOUT.introFallback;

    fallback = setTimeout(finishIntro, Math.min(knownDuration, TIMEOUT.introFallbackMax));
  };

  /* ------ PRIMING IOS: play/pause antes do play real ------ */
  const primeAndPlay = () => {
    try { video.currentTime = 0; } catch { /* IGNORADO */ }

    /* PRIMING — OBRIGATÓRIO NO IOS PARA RENDERIZAR O PRIMEIRO FRAME */
    const primePromise = video.play();

    if (primePromise !== undefined) {
      primePromise
        .then(() => {
          video.pause();
          video.currentTime = 0;

          /* PLAY REAL APÓS PRIMING */
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
      /* FALLBACK PARA BROWSERS SEM PROMISE (RARO) */
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

  /* ------ IOS: NÃO ESPERAR readyState/loadeddata ANTES DE TOCAR ------ */
  /* IOS SAFARI IGNORA preload="auto" E NÃO BUFFERIZA VÍDEO SEM UM play(). */
  /* SE ESPERARMOS loadeddata (readyState >= 2), ELE NUNCA CHEGA — DEADLOCK: */
  /* SÓ O FALLBACK DISPARA E O OVERLAY VERDE SOME SEM O VÍDEO NUNCA PINTAR. */
  /* MUTED + playsinline PERMITE play() PROGRAMÁTICO SEM GESTO; O PRÓPRIO */
  /* play() FORÇA O IOS A CARREGAR, DECODIFICAR E RENDERIZAR O PRIMEIRO FRAME. */
  video.load();
  primeAndPlay();
}