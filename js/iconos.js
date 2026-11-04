// =====================================================================
// AMARAM TV · Iconografía propia (SVG de línea, 24×24, trazo 1.75)
// Uso: import { icono } from "./iconos.js";  el.innerHTML = icono("taladro", "icono icono--lg");
// Todos los iconos son originales del proyecto; heredan el color del texto (currentColor).
// =====================================================================
const RUTAS = {
  // Herramientas y oficio
  taladro: `<path d="M3 9h11a3 3 0 0 1 0 6H3z"/><path d="M14 10.5h4l3 1.5-3 1.5h-4"/><path d="M6 15v4a1 1 0 0 0 1 1h3l1-5"/><path d="M3 12h2"/>`,
  nivel: `<rect x="2" y="9" width="20" height="6" rx="1.5"/><circle cx="12" cy="12" r="1.6"/><path d="M8 9v6M16 9v6"/><path d="M12 4v3M12 17v3" stroke-dasharray="1.5 2"/>`,
  soporte: `<rect x="3" y="4" width="18" height="11" rx="1.5"/><path d="M12 15v4M8 21h8"/><path d="M6 7.5h4"/>`,
  tubo: `<path d="M3 7h8a4 4 0 0 1 4 4v6h6"/><path d="M3 11h8"/><path d="M15 17v-2"/><circle cx="19" cy="7" r="2"/>`,
  manometro: `<circle cx="12" cy="13" r="8"/><path d="M12 13l4-4"/><path d="M7 13h1M16 13h1M12 8v1"/><path d="M9 21h6"/>`,
  cable: `<path d="M4 6c6 0 6 12 12 12h4"/><path d="M4 18c6 0 6-12 12-12h4"/><circle cx="4" cy="6" r="1.5"/><circle cx="4" cy="18" r="1.5"/>`,
  cinta: `<circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="2"/><path d="M17 12h4v4h-4"/>`,
  copo: `<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2M4.2 7.5l2.7.7M4.2 7.5l.7-2.7M19.8 16.5l-2.7-.7M19.8 16.5l-.7 2.7M4.2 16.5l.7 2.7M4.2 16.5l2.7-.7M19.8 7.5l-.7-2.7M19.8 7.5l-2.7.7"/>`,
  casa: `<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>`,
  // Plataforma
  play: `<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none"/>`,
  certificado: `<circle cx="12" cy="9" r="5"/><path d="M9 13.5L8 21l4-2 4 2-1-7.5"/><path d="M10.5 9l1 1 2-2.5"/>`,
  candado: `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.2"/>`,
  rayo: `<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>`,
  movil: `<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>`,
  tarjeta: `<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19"/><path d="M6 15h4"/>`,
  usuarios: `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5a5 5 0 0 1 6 5"/>`,
  grafica: `<path d="M4 20V4"/><path d="M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/><path d="M19 8h-3M19 8v3"/>`,
  whatsapp: `<path d="M4 20l1.3-3.8A8 8 0 1 1 8.2 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/>`,
  correo: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>`,
  flecha: `<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>`,
  check: `<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
  reloj: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>`,
  libro: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/><path d="M8 7h8M8 10h6"/>`,
  escudo: `<path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>`,
  menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
  cerrar: `<path d="M6 6l12 12M18 6L6 18"/>`,
  descarga: `<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>`,
  estrella: `<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.8l-5.3 2.8 1.1-5.8-4.3-4.1 5.9-.8z"/>`,
  ubicacion: `<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>`
};

export function icono(nombre, clase = "icono") {
  const d = RUTAS[nombre] || RUTAS.rayo;
  return `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
}

/** Reemplaza <i data-icono="nombre" class="..."></i> por el SVG correspondiente. */
export function montarIconos(raiz = document) {
  raiz.querySelectorAll("[data-icono]").forEach(el => {
    const clase = el.className || "icono";
    el.outerHTML = icono(el.dataset.icono, clase);
  });
}
