// =====================================================================
// AMARAM TV · Común a todas las pantallas
// Pinta el header y el footer, escucha la sesión de Firebase y expone
// utilidades (formato de pesos, avisos, parámetros de la URL, guardas).
// Cada página lo importa: import { ... } from "./js/app.js";
// =====================================================================

import { auth, fa, MODO_DEMO, crearPerfilSiNoExiste, obtenerPerfil } from "./db.js";
import { NEGOCIO, PAGOS_ACTIVOS } from "./firebase-config.js";

export const LOGO_SVG = `<svg class="logo__marca" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="6" width="36" height="24" rx="4" fill="#2EC4B6"/><rect x="6" y="10" width="28" height="16" rx="2" fill="#0B1F3A"/><path d="M14 34h12M20 30v4" stroke="#2EC4B6" stroke-width="3" stroke-linecap="round"/><path d="M11 18c2-4 6-4 9 0s7 4 9 0" stroke="#7EE8DC" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;

// --------------------------------------------------------------------
// Utilidades
// --------------------------------------------------------------------
export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
export const parametro = (nombre) => new URLSearchParams(location.search).get(nombre);
export const formatoCOP = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(n) || 0);
export const formatoFecha = (d) => d ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(d) : "—";
export const formatoFechaHora = (d) => d ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(d) : "—";
export const escapar = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let avisoTimer;
export function aviso(texto, tipo = "") {
  let el = $("#aviso-flotante");
  if (!el) { el = document.createElement("div"); el.id = "aviso-flotante"; el.className = "aviso-flotante"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = texto;
  el.className = `aviso-flotante aviso-flotante--visible ${tipo ? "aviso-flotante--" + tipo : ""}`;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => el.classList.remove("aviso-flotante--visible"), 3800);
}

export function youtubeEmbed(url) {
  if (!url) return "";
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` : url;
}

// --------------------------------------------------------------------
// Sesión
// --------------------------------------------------------------------
let _usuario = null;      // usuario de Firebase Auth
let _perfil = null;       // documento en users
const oyentes = new Set();

export const usuarioActual = () => _usuario;
export const perfilActual = () => _perfil;
export const esAdmin = () => _perfil?.role === "admin";

/** Devuelve una promesa que se resuelve cuando Firebase ya dijo si hay sesión o no. */
export const sesionLista = new Promise((resolver) => {
  if (MODO_DEMO || !auth) { resolver(null); return; }
  fa.onAuthStateChanged(auth, async (u) => {
    _usuario = u;
    _perfil = u ? (await crearPerfilSiNoExiste(u)) : null;
    pintarSesion();
    oyentes.forEach(fn => fn(_usuario, _perfil));
    resolver(_usuario);
  });
});
export function alCambiarSesion(fn) { oyentes.add(fn); if (_usuario !== null || MODO_DEMO) fn(_usuario, _perfil); }

export async function cerrarSesion() { if (auth) await fa.signOut(auth); location.href = "index.html"; }

/** Guarda la página y redirige a login si no hay sesión. Devuelve el usuario. */
export async function requerirSesion() {
  await sesionLista;
  if (MODO_DEMO) { location.href = "login.html"; return null; }
  if (!_usuario) { location.href = `login.html?volver=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}`; return null; }
  return _usuario;
}
export async function requerirAdmin() {
  const u = await requerirSesion();
  if (!u) return null;
  if (!esAdmin()) { aviso("Solo el equipo administrador puede entrar aquí.", "error"); setTimeout(() => location.href = "index.html", 1200); return null; }
  return u;
}
export async function refrescarPerfil() { if (_usuario) _perfil = await obtenerPerfil(_usuario.uid); pintarSesion(); return _perfil; }

// --------------------------------------------------------------------
// Header y footer
// --------------------------------------------------------------------
const pagina = location.pathname.split("/").pop() || "index.html";

function pintarHeader() {
  const header = $("#header");
  if (!header) return;
  header.className = "header";
  header.innerHTML = `
    ${MODO_DEMO ? `<div class="banner-demo">Modo demo: la plataforma muestra datos de ejemplo. Configura Firebase en <code>js/firebase-config.js</code> para activar cuentas y pagos.</div>` : ""}
    <div class="contenedor header__barra">
      <a class="logo" href="index.html" aria-label="AMARAM TV, inicio">${LOGO_SVG}<span class="logo__texto">AMARAM <span>TV</span></span></a>
      <button class="boton-menu" id="boton-menu" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <nav class="nav" id="nav" aria-label="Principal">
        <a href="index.html" ${pagina === "index.html" ? 'aria-current="page"' : ""}>Inicio</a>
        <a href="cursos.html" ${pagina === "cursos.html" || pagina === "curso.html" ? 'aria-current="page"' : ""}>Cursos</a>
        <a href="index.html#contacto">Contacto</a>
        <span class="nav__sesion" id="nav-sesion"></span>
      </nav>
    </div>`;
  $("#boton-menu").addEventListener("click", () => {
    const nav = $("#nav"); const abierto = nav.classList.toggle("nav--abierta");
    $("#boton-menu").setAttribute("aria-expanded", String(abierto));
  });
  pintarSesion();
}

function pintarSesion() {
  const zona = $("#nav-sesion");
  if (!zona) return;
  if (MODO_DEMO) { zona.innerHTML = `<a class="boton boton--primario boton--sm" href="login.html">Entrar</a>`; return; }
  if (!_usuario) { zona.innerHTML = `<a class="boton boton--primario boton--sm" href="login.html">Entrar</a>`; return; }
  const nombre = escapar((_perfil?.name || _usuario.displayName || _usuario.email).split(" ")[0]);
  zona.innerHTML = `
    <a href="mis-cursos.html" ${pagina === "mis-cursos.html" || pagina === "leccion.html" ? 'aria-current="page"' : ""}>Mis cursos</a>
    ${esAdmin() ? `<a href="admin.html" ${pagina === "admin.html" ? 'aria-current="page"' : ""}>Admin</a>` : ""}
    <a href="perfil.html" class="nav__usuario" title="Mi perfil">Hola, ${nombre}</a>
    <button class="boton boton--contorno boton--sm" id="boton-salir" type="button">Salir</button>`;
  $("#boton-salir").addEventListener("click", cerrarSesion);
}

function pintarFooter() {
  const footer = $("#footer");
  if (!footer) return;
  footer.className = "footer";
  footer.innerHTML = `
    <div class="contenedor">
      <div class="footer__grid">
        <div>
          <a class="logo" href="index.html">${LOGO_SVG}<span class="logo__texto">AMARAM <span>TV</span></span></a>
          <p class="mt-3">Cursos en línea de instalación de aires acondicionados Mini Split y montaje profesional de Smart TVs. Aprende un oficio rentable, a tu ritmo y desde el celular.</p>
        </div>
        <div><h4>Cursos</h4><ul><li><a href="cursos.html">Catálogo</a></li><li><a href="curso.html?id=montaje-smart-tv">Montaje de Smart TVs</a></li><li><a href="curso.html?id=mini-split-smart-tv">Aires Mini Split + Smart TVs</a></li></ul></div>
        <div><h4>Cuenta</h4><ul><li><a href="login.html">Entrar o registrarme</a></li><li><a href="mis-cursos.html">Mis cursos</a></li><li><a href="perfil.html">Mi perfil</a></li></ul></div>
        <div><h4>Contacto</h4><ul>
          <li><a href="mailto:${NEGOCIO.correo}">${NEGOCIO.correo}</a></li>
          <li><a href="https://wa.me/${NEGOCIO.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="legales.html">Política de datos</a></li>
          <li><a href="legales.html#terminos">Términos y condiciones</a></li>
          <li><a href="legales.html#reembolso">Política de reembolso</a></li>
        </ul></div>
      </div>
      <div class="footer__pie">
        <span>© ${new Date().getFullYear()} AMARAM TV · ${NEGOCIO.ciudad}. Pagos procesados por Mercado Pago${PAGOS_ACTIVOS ? "" : " (en configuración)"}.</span>
        <span>Proyecto académico · E-Business · <a href="https://github.com/andresdromero6-alt/lms-AMARAM-TVs-AC" target="_blank" rel="noopener">Código en GitHub</a></span>
      </div>
    </div>`;
}

pintarHeader();
pintarFooter();
