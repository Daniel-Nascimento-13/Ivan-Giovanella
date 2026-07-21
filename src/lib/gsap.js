/* ========================================
   GSAP — INSTÂNCIA CENTRAL
   ======================================== */

// FONTE ÚNICA DE GSAP + SCROLLTRIGGER (PLUGIN REGISTRADO UMA VEZ).
// TODAS AS SEÇÕES DEVEM IMPORTAR DAQUI, NUNCA DE 'gsap' DIRETO.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };