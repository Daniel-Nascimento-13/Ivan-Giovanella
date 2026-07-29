/* ========================================
   DADOS DO SITE — IVAN GIOVANELLA / UNIMED
   ======================================== */

export const SITE_DATA = {
  whatsapp: {
    number: '5551980402817',
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
  },

  /* ------ SEÇÃO 0 — OVERLAY PLANOS ------ */
  /* FONTE ÚNICA DOS CARDS: O MARKUP É GERADO POR initPlansSection() EM */
  /* src/sections/nav.js — NADA DISSO VIVE HARDCODED NO index.html. */
  planos: [
    {
      id: 'essencial',
      nome: 'Plano Essencial',
      tag: 'Ambulatorial',
      featured: false,
      badge: null,
      diferencial: 'Sem internações clínicas, cirúrgicas ou UTI',
      whatsappMessage: 'Olá Ivan! Tenho interesse em saber mais sobre o Plano Essencial da Unimed. Pode me ajudar?',
      coberturas: [
        'Consultas com todas as especialidades médicas',
        'Exames simples (hemograma, raio x, ecografia, eletrocardiograma, pré câncer, entre outros)',
        'Exames de alta complexidade (mamografia digital, tomografia, endoscopia, ressonância nuclear magnética, cintilografia, entre outros)'
      ],
      coberturasExtra: [
        'Consultas com psicólogo, terapeuta ocupacional, nutricionista e fonoaudiólogo',
        'Atendimentos ambulatoriais (retirada de sinal de pele, colocação de tala de gesso, implante de DIU, quimioterapia e radioterapia ambulatorial, hemodiálise ambulatorial, entre outros)',
        'Atendimento em Plantão Médico Virtual 24 horas',
        'Urgência e emergência no Pronto Atendimento ou Plantão Unimed a nível nacional — até 12h em observação',
        /* alerta: true — LIMITAÇÃO DO PLANO, NÃO COBERTURA. RENDERIZA SEM ✓ VERDE. */
        { texto: 'Sem cobertura para internações clínicas, cirúrgicas, obstétricas e UTI/CTI', alerta: true },
        'Diferenciais: Uniair · Extensão Assistencial · Seguro de Vida para titular (funcionário/sócio)'
      ]
    },
    {
      id: 'total',
      nome: 'Plano Total',
      tag: 'Completo',
      featured: true,
      badge: 'Mais escolhido',
      diferencial: 'Com internações clínicas, cirúrgicas, obstétricas e UTI/CTI',
      whatsappMessage: 'Olá Ivan! Tenho interesse em saber mais sobre o Plano Total da Unimed. Pode me ajudar?',
      coberturas: [
        'Consultas com todas as especialidades médicas',
        'Exames simples (hemograma, raio x, ecografia, eletrocardiograma, pré câncer, entre outros)',
        'Exames de alta complexidade (mamografia digital, tomografia, endoscopia, ressonância nuclear magnética, cintilografia, entre outros)'
      ],
      coberturasExtra: [
        'Consultas com nutricionista, psicólogo, terapeuta ocupacional e fonoaudiólogo',
        'Atendimentos ambulatoriais (retirada de sinal de pele, colocação de tala de gesso, implante de DIU, quimioterapia e radioterapia ambulatorial, hemodiálise ambulatorial, entre outros)',
        'Urgência e emergência no Pronto Atendimento ou Plantão Unimed a nível nacional — até 12h em observação',
        'Plantão Médico Virtual 24h para atendimentos que não são de urgência',
        'Internações clínicas, cirúrgicas e obstétricas',
        'Materiais de órtese e prótese · UTI · CTI',
        'Diferenciais: Uniair · Extensão Assistencial · Seguro de Vida para titular (funcionário/sócio)'
      ]
    }
  ]
};

/* ------ HELPER — LINK WHATSAPP (FONTE ÚNICA) ------ */

export function getWhatsappLink(customMessage) {
  const message = encodeURIComponent(customMessage || SITE_DATA.whatsapp.defaultMessage);
  return `https://wa.me/${SITE_DATA.whatsapp.number}?text=${message}`;
}