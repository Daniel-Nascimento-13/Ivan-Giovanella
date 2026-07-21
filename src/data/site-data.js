/* ========================================
   DADOS DO SITE — IVAN GIOVANELLA / UNIMED
   ======================================== */

export const SITE_DATA = {
  whatsapp: {
    number: '5551991210111',
    defaultMessage: 'Olá Ivan, espero que esteja bem!\n\nGostaria de entender mais sobre os planos da Unimed e como eles podem se encaixar a mim.\n\nObrigado, fico no aguardo.'
  },

  /* ------ SEÇÃO 1 — HERO ------ */
  hero: {
  eyebrow: {
    prefix: 'Plano de saúde',
    words: ['empresarial', 'pessoal']
  },
    headline: [
      'O melhor benefício para',
      'sua empresa é cuidar de',
      'quem faz ela acontecer.'
    ],
    highlightLine: 2,
    subheadline: 'Mais saúde, mais engajamento e menos rotatividade para o seu time.',
    ctaLabel: 'Falar no WhatsApp'
  },

  /* ------ SEÇÃO 2 — SOBRE ------ */
  /* TEXTO DE REFERÊNCIA — O MARKUP ESTÁTICO VIVE NO index.html (LCP/CLS). */
  /* sobre.js APENAS SELECIONA E ANIMA — NÃO INJETA CONTEÚDO. */
  sobre: {
    eyebrow: 'Sobre o Consultor',
    name: 'Ivan Giovanella',
    text: 'Sou consultor especialista em planos de saúde da Unimed Vales do Taquari e Rio Pardo. Meu propósito é ajudar pessoas e empresas a cuidarem de quem realmente importa, oferecendo soluções que geram bem-estar, reduzem custos e trazem resultados reais.',
    attributes: [
      'Consultoria gratuita',
      'Atendimento humanizado',
      'Transparência e ética',
      'Agilidade no processo'
    ]
  }
};

/* ------ HELPER — LINK WHATSAPP (FONTE ÚNICA) ------ */

export function getWhatsappLink(customMessage) {
  const message = encodeURIComponent(customMessage || SITE_DATA.whatsapp.defaultMessage);
  return `https://wa.me/${SITE_DATA.whatsapp.number}?text=${message}`;
}