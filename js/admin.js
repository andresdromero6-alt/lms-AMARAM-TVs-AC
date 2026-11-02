// =====================================================================
// AMARAM TV · Panel de administración (armazón)
// Verifica el rol admin, maneja las pestañas y ofrece un diálogo
// genérico de formulario que usan todas las secciones.
// Cada pestaña vive en su propio archivo: admin-cursos.js, admin-crm.js,
// admin-recursos.js, admin-reportes.js.
// =====================================================================
import { $, $$, escapar, requerirAdmin, aviso } from "./app.js";

export { $, $$, escapar, aviso };
export const panel = () => $("#panel");
/** Reemplaza el nodo del panel para descartar los oyentes de la pestaña anterior. */
export function nuevoPanel() { const viejo = $("#panel"); const nuevo = viejo.cloneNode(false); viejo.replaceWith(nuevo); return nuevo; }

// --------------------------------------------------------------------
// Diálogo genérico: abrirFormulario({ titulo, campos, valores }) → datos | null
// campos: [{ name, label, type: text|number|textarea|select|checkbox|date|time|url|email, options:[{value,label}], required, ayuda, placeholder }]
// --------------------------------------------------------------------
const dialogo = $("#dialogo"), dForm = $("#dialogo-form"), dCuerpo = $("#dialogo-cuerpo");
export function abrirFormulario({ titulo, campos, valores = {}, textoGuardar = "Guardar" }) {
  return new Promise((resolver) => {
    $("#dialogo-titulo").textContent = titulo;
    $("#dialogo-guardar").textContent = textoGuardar;
    dCuerpo.innerHTML = campos.map(c => {
      const v = valores[c.name] ?? c.value ?? "";
      const req = c.required ? "required" : "";
      const id = `f-${c.name}`;
      let control;
      if (c.type === "textarea") control = `<textarea id="${id}" name="${c.name}" rows="${c.rows || 4}" ${req} ${c.readonly ? "readonly" : ""} placeholder="${escapar(c.placeholder || "")}">${escapar(v)}</textarea>`;
      else if (c.type === "select") control = `<select id="${id}" name="${c.name}" ${req}>${(c.options || []).map(o => `<option value="${escapar(o.value)}" ${String(o.value) === String(v) ? "selected" : ""}>${escapar(o.label)}</option>`).join("")}</select>`;
      else if (c.type === "checkbox") return `<div class="campo campo--casilla"><input id="${id}" name="${c.name}" type="checkbox" ${v ? "checked" : ""}><label for="${id}">${escapar(c.label)}</label></div>`;
      else control = `<input id="${id}" name="${c.name}" type="${c.type || "text"}" value="${escapar(v)}" ${req} ${c.min != null ? `min="${c.min}"` : ""} ${c.step ? `step="${c.step}"` : ""} placeholder="${escapar(c.placeholder || "")}" ${c.readonly ? "readonly" : ""}>`;
      return `<div class="campo"><label for="${id}">${escapar(c.label)}${c.required ? " *" : ""}</label>${control}${c.ayuda ? `<span class="ayuda">${c.ayuda}</span>` : ""}</div>`;
    }).join("");
    const cerrar = (res) => { dialogo.close(); dForm.onsubmit = null; resolver(res); };
    $("#dialogo-cerrar").onclick = $("#dialogo-cancelar").onclick = () => cerrar(null);
    dForm.onsubmit = (e) => {
      e.preventDefault();
      if (!dForm.reportValidity()) return;
      const datos = {};
      campos.forEach(c => {
        const el = dForm.elements[c.name];
        if (c.type === "checkbox") datos[c.name] = el.checked;
        else if (c.type === "number") datos[c.name] = el.value === "" ? null : Number(el.value);
        else datos[c.name] = el.value.trim();
      });
      cerrar(datos);
    };
    dialogo.showModal();
    dCuerpo.querySelector("input,select,textarea")?.focus();
  });
}
export const confirmar = (texto) => Promise.resolve(window.confirm(texto));

// --------------------------------------------------------------------
// Pestañas
// --------------------------------------------------------------------
const modulos = {
  reportes: () => import("./admin-reportes.js"),
  cursos: () => import("./admin-cursos.js").then(m => ({ pintar: m.pintarCursos })),
  lecciones: () => import("./admin-cursos.js").then(m => ({ pintar: m.pintarLecciones })),
  inscripciones: () => import("./admin-cursos.js").then(m => ({ pintar: m.pintarInscripciones })),
  usuarios: () => import("./admin-cursos.js").then(m => ({ pintar: m.pintarUsuarios })),
  crm: () => import("./admin-crm.js"),
  instructores: () => import("./admin-recursos.js").then(m => ({ pintar: m.pintarInstructores })),
  recursos: () => import("./admin-recursos.js").then(m => ({ pintar: m.pintarRecursos })),
  calendario: () => import("./admin-recursos.js").then(m => ({ pintar: m.pintarCalendario }))
};

export async function irA(tab) {
  $$("#pestanas [role=tab]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
  history.replaceState(null, "", `#${tab}`);
  nuevoPanel().innerHTML = `<div class="cargando">Cargando…</div>`;
  try { const m = await modulos[tab](); await m.pintar(); }
  catch (err) { console.error(err); panel().innerHTML = `<div class="mensaje mensaje--error">Error al cargar esta sección: ${escapar(err.message)}</div>`; }
}

const usuario = await requerirAdmin();
if (usuario) {
  $("#verificando").hidden = true;
  $("#admin").hidden = false;
  $("#pestanas").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) irA(b.dataset.tab); });
  const inicial = location.hash.replace("#", "");
  irA(modulos[inicial] ? inicial : "reportes");
}
