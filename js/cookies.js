// =====================================================================
// AMARAM TV · Consentimiento de cookies y analítica
// - Muestra un banner la primera vez (Ley 1581 de 2012 / buenas prácticas de consentimiento).
// - Guarda la decisión en localStorage (clave amaram_cookies) durante 12 meses.
// - Solo si el usuario ACEPTA se cargan Google Analytics 4 y Microsoft Clarity.
// - Si rechaza, solo quedan las cookies estrictamente necesarias (sesión de Firebase, idioma).
// - Se puede cambiar la decisión desde el enlace "Preferencias de cookies" del footer o legales.html#cookies.
// IDs en js/firebase-config.js (ANALITICA). Con IDs vacíos no se carga nada.
// =====================================================================
import { ANALITICA } from "./firebase-config.js";

const CLAVE = "amaram_cookies";
const MESES = 12;

function leer() {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (!v || !v.fecha) return null;
    const edad = (Date.now() - new Date(v.fecha).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return edad > MESES ? null : v;
  } catch { return null; }
}
function guardar(decision) {
  try { localStorage.setItem(CLAVE, JSON.stringify({ decision, fecha: new Date().toISOString() })); } catch { /* modo privado */ }
}

let analiticaCargada = false;
function cargarAnalitica() {
  if (analiticaCargada) return;
  analiticaCargada = true;
  // Google Analytics 4
  if (ANALITICA.ga4) {
    const s = document.createElement("script");
    s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ANALITICA.ga4)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ANALITICA.ga4, { anonymize_ip: true });
  }
  // Microsoft Clarity
  if (ANALITICA.clarity) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", ANALITICA.clarity);
  }
}

/** Evento de analítica (solo si hay consentimiento). Uso: evento("compra_iniciada", { curso: id }) */
export function evento(nombre, datos = {}) {
  if (!analiticaCargada) return;
  if (window.gtag) window.gtag("event", nombre, datos);
  if (window.clarity) window.clarity("event", nombre);
}

function pintarBanner() {
  if (document.getElementById("banner-cookies")) return;
  const div = document.createElement("div");
  div.id = "banner-cookies";
  div.className = "banner-cookies";
  div.setAttribute("role", "dialog");
  div.setAttribute("aria-live", "polite");
  div.setAttribute("aria-label", "Aviso de cookies");
  div.innerHTML = `
    <div class="banner-cookies__texto">
      <strong>Usamos cookies</strong>
      <p>Las necesarias mantienen tu sesión iniciada. Si aceptas, también usamos Google Analytics y Microsoft Clarity para entender cómo se usa la plataforma y mejorarla. Más detalles en la <a href="legales.html#cookies">política de cookies</a>.</p>
    </div>
    <div class="banner-cookies__acciones">
      <button class="boton boton--contorno boton--sm" type="button" data-cookies="rechazar">Solo necesarias</button>
      <button class="boton boton--primario boton--sm" type="button" data-cookies="aceptar">Aceptar todas</button>
    </div>`;
  document.body.appendChild(div);
  requestAnimationFrame(() => div.classList.add("banner-cookies--visible"));
  div.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cookies]");
    if (!b) return;
    const decision = b.dataset.cookies;
    guardar(decision);
    if (decision === "aceptar") cargarAnalitica();
    div.classList.remove("banner-cookies--visible");
    setTimeout(() => div.remove(), 300);
  });
}

/** Abre de nuevo el banner (enlace "Preferencias de cookies"). */
export function abrirPreferencias() {
  try { localStorage.removeItem(CLAVE); } catch { /* nada */ }
  pintarBanner();
}

export function iniciarCookies() {
  const previa = leer();
  if (!previa) pintarBanner();
  else if (previa.decision === "aceptar") cargarAnalitica();
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-abrir-cookies]")) { e.preventDefault(); abrirPreferencias(); }
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciarCookies);
else iniciarCookies();
