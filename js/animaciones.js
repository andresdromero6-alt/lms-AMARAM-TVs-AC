// =====================================================================
// AMARAM TV · Movimiento (solo presentación, no toca la lógica de negocio)
// - Revelado al hacer scroll para .revelar (una sola vez por elemento)
// - Sombra del header al desplazarse
// - Barras de progreso que crecen al entrar en pantalla
// Respeta prefers-reduced-motion. Se importa desde app.js.
// =====================================================================
import { montarIconos } from "./iconos.js";

const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let observador = null;
function obtenerObservador() {
  if (observador || !("IntersectionObserver" in window)) return observador;
  observador = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      observador.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  return observador;
}

/** Registra los elementos .revelar (y .pasos-linea) de una raíz. Se puede llamar varias veces. */
export function revelar(raiz = document) {
  const objetivos = raiz.querySelectorAll(".revelar:not(.visible), .pasos-linea:not(.visible)");
  if (reducido || !obtenerObservador()) { objetivos.forEach(el => el.classList.add("visible")); return; }
  objetivos.forEach(el => obtenerObservador().observe(el));
}

/** Monta iconos y revela el contenido insertado dinámicamente dentro de una raíz. */
export function animarContenido(raiz = document) {
  montarIconos(raiz);
  revelar(raiz);
}

function headerFlotante() {
  const header = document.getElementById("header");
  if (!header) return;
  const actualizar = () => header.classList.toggle("header--flotante", window.scrollY > 8);
  actualizar();
  window.addEventListener("scroll", actualizar, { passive: true });
}

// Las barras de progreso ya animan con transition de width; aquí solo garantizamos
// que el ancho inicial sea 0 cuando se pintan antes de ser visibles.
function barrasProgreso() {
  if (reducido || !("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      const barra = e.target;
      const destino = barra.dataset.ancho || barra.style.width;
      if (destino) { barra.style.width = "0"; requestAnimationFrame(() => requestAnimationFrame(() => { barra.style.width = destino; })); }
      obs.unobserve(barra);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll(".progreso__barra").forEach(b => obs.observe(b));
}

// Observa el DOM para montar iconos y revelar bloques añadidos por JS (catálogo, tablas, etc.)
function observarDOM() {
  if (!("MutationObserver" in window)) return;
  let pendiente = false;
  const mo = new MutationObserver(() => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; animarContenido(document); });
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

export function iniciarAnimaciones() {
  montarIconos(document);
  revelar(document);
  headerFlotante();
  barrasProgreso();
  observarDOM();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciarAnimaciones);
else iniciarAnimaciones();
