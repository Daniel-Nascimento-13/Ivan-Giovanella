/* ========================================
   LIB — GSAP
   ======================================== */

// FONTE ÚNICA — TODAS AS SEÇÕES IMPORTAM DAQUI, NUNCA DE 'gsap' DIRETO.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };