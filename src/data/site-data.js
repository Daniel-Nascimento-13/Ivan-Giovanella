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
  }
};

/* ------ HELPER — LINK WHATSAPP (FONTE ÚNICA) ------ */

export function getWhatsappLink(customMessage) {
  const message = encodeURIComponent(customMessage || SITE_DATA.whatsapp.defaultMessage);
  return `https://wa.me/${SITE_DATA.whatsapp.number}?text=${message}`;
}