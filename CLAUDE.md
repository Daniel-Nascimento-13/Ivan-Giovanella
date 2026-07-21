# CLAUDE.md — IVAN GIOVANELLA UNIMED
> Leia este arquivo inteiro antes de qualquer ação.

## STACK
Vite + JavaScript puro (ES Modules) + Tailwind CSS v4 + GSAP + ScrollTrigger + Lenis
Sem TypeScript, sem React, sem JSX.

## ESTRUTURA
src/animations/   → uma função init por seção
src/components/   → componentes com CSS próprio (menu/, sobre/...)
src/constants/    → motion.js com durações e easings
src/data/         → arrays de conteúdo como módulos JS
src/lib/          → gsap.js, smooth-scroll.js, whatsapp.js
src/styles/       → main.css com tokens e @import por componente

## REGRA DE OURO
Scroll = Lenis | Movimento = GSAP | Pinning = ScrollTrigger
Nunca misture CSS Scroll Behavior, Framer Motion, AOS, Locomotive Scroll.
Sempre sincronize ScrollTrigger.update() com Lenis.raf().
ScrollTriggers criados de forma síncrona — nunca dentro de callbacks assíncronos.
Guard prefers-reduced-motion em toda animação.
Destrua timelines e ScrollTriggers ao reinicializar seções.

## PERFORMANCE
Anime apenas: transform, opacity, clip-path.
Nunca anime: width, height, top, left.
⚠️ will-change: transform cria containing block — fixed interno pode quebrar.

## DIREÇÃO ARTÍSTICA
Duração mínima 0.8s | Recomendado: 1.0s / 1.2s
Easings: power3.out, expo.out | Loop: power1.inOut
Proibido: linear, bounce, back, elastic
Reveals: clip-path + translateY + autoAlpha — nunca só opacity.

## COMENTÁRIOS (OBRIGATÓRIO)
Todo texto em CAIXA ALTA.
Header de seção:  /* ============================================ */
Subsection:       /* -------------------------------------------- */
Nomes consistentes entre HTML, CSS e JS.

## TOKENS CSS
--color-paper, --color-ink, --color-accent, --font-display, --font-body
Definidos via @theme {} no main.css. Nunca hardcode de cor nas regras.

## ARMADILHAS
- Paths ./imagem em strings JS → usar /images/...
- lenis.stop() + overflow: hidden simultâneos → usar lockScroll()/unlockScroll()
- ScrollTrigger dentro de callback async → criar sempre no init síncrono
- align-items: center em min-height: 100vh → causa layout shift

## PROCESSO
Seções uma por vez. Ao final de cada etapa: explicar decisões, listar melhorias, aguardar aprovação.
