// =====================================================================
// AMARAM TV · Admin: CRM (contactos, embudo por etapas, notas de seguimiento)
// =====================================================================
import { nuevoPanel, abrirFormulario, confirmar, escapar, aviso } from "./admin.js";
import { formatoFecha, formatoFechaHora, usuarioActual } from "./app.js";
import { obtenerLeads, actualizarLead, borrarLead, crearLead, obtenerInteracciones, agregarInteraccion, obtenerCursos, aFecha, MODO_DEMO } from "./db.js";

export const ETAPAS = [
  { id: "nuevo", label: "Nuevo" }, { id: "contactado", label: "Contactado" }, { id: "interesado", label: "Interesado" },
  { id: "cliente", label: "Cliente" }, { id: "perdido", label: "Perdido" }
];
const CANALES = ["whatsapp", "llamada", "correo", "presencial", "otro"];
const colorEtapa = (e) => ({ nuevo: "insignia--info", contactado: "insignia--alerta", interesado: "insignia--suave", cliente: "insignia--exito", perdido: "insignia--error" }[e] || "insignia--gris");

export async function pintar() {
  const [leads, cursos] = await Promise.all([obtenerLeads(), obtenerCursos({ soloPublicados: false })]);
  const tituloCurso = (id) => cursos.find(c => c.id === id)?.title || id || "—";
  leads.sort((a, b) => (aFecha(b.createdAt)?.getTime() || 0) - (aFecha(a.createdAt)?.getTime() || 0));
  const vista = sessionStorage.getItem("crm_vista") || "tabla";
  const f = { etapa: "", curso: "", origen: "", texto: "" };

  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>CRM · ${leads.length} contactos</h2>
      <div class="fila">
        <button class="boton ${vista === "tabla" ? "boton--secundario" : "boton--contorno"} boton--sm" data-vista="tabla" type="button">Tabla</button>
        <button class="boton ${vista === "embudo" ? "boton--secundario" : "boton--contorno"} boton--sm" data-vista="embudo" type="button">Embudo</button>
        <button class="boton boton--primario boton--sm" id="nuevo" type="button">+ Contacto</button>
      </div></div>
    ${MODO_DEMO ? `<div class="mensaje mensaje--alerta mb-5">Modo demo: los contactos se guardan solo en este navegador (localStorage).</div>` : ""}
    <div class="rejilla rejilla--4 mb-5" id="kpis"></div>
    <div class="filtros">
      <div class="campo"><label for="f-etapa">Etapa</label><select id="f-etapa"><option value="">Todas</option>${ETAPAS.map(e => `<option value="${e.id}">${e.label}</option>`).join("")}</select></div>
      <div class="campo"><label for="f-curso">Curso de interés</label><select id="f-curso"><option value="">Todos</option>${cursos.map(c => `<option value="${escapar(c.id)}">${escapar(c.title)}</option>`).join("")}</select></div>
      <div class="campo"><label for="f-origen">Origen</label><select id="f-origen"><option value="">Todos</option>${[...new Set(leads.map(l => l.source).filter(Boolean))].map(o => `<option>${escapar(o)}</option>`).join("")}</select></div>
      <div class="campo" style="flex:1"><label for="f-texto">Buscar</label><input id="f-texto" type="search" placeholder="nombre, correo, teléfono"></div>
    </div>
    <div id="contenido"></div>`;

  const filtrar = () => leads.filter(l => (!f.etapa || l.stage === f.etapa) && (!f.curso || l.courseInterest === f.curso) && (!f.origen || l.source === f.origen) && (!f.texto || [l.name, l.email, l.phone].join(" ").toLowerCase().includes(f.texto)));

  const pintarKpis = () => {
    const total = leads.length, clientes = leads.filter(l => l.stage === "cliente").length;
    const activos = leads.filter(l => !["cliente", "perdido"].includes(l.stage)).length;
    const hoy = new Date().toISOString().slice(0, 10);
    const vencidas = leads.filter(l => l.nextActionDate && l.nextActionDate <= hoy && !["cliente", "perdido"].includes(l.stage)).length;
    p.querySelector("#kpis").innerHTML = [
      ["Contactos", total], ["Clientes", clientes], ["Conversión", total ? Math.round(clientes / total * 100) + " %" : "—"], ["Acciones vencidas", vencidas]
    ].map(([k, v]) => `<div class="estadistica"><div class="estadistica__valor">${v}</div><div class="estadistica__etiqueta">${k}</div></div>`).join("");
  };

  const pintarContenido = () => {
    const lista = filtrar();
    const cont = p.querySelector("#contenido");
    if (vista === "embudo") {
      cont.innerHTML = `<div class="kanban">${ETAPAS.map(e => { const col = lista.filter(l => l.stage === e.id); return `
        <div class="kanban__columna"><div class="kanban__titulo"><span>${e.label}</span><span>${col.length}</span></div>
        ${col.map(l => `<div class="kanban__tarjeta"><strong>${escapar(l.name)}</strong><span class="texto-xs texto-tenue">${escapar(tituloCurso(l.courseInterest))}</span>
          <select data-etapa="${escapar(l.id)}" aria-label="Cambiar etapa">${ETAPAS.map(x => `<option value="${x.id}" ${x.id === l.stage ? "selected" : ""}>${x.label}</option>`).join("")}</select>
          <button class="boton boton--fantasma boton--sm mt-3" data-ver="${escapar(l.id)}" type="button" style="width:100%">Ver y anotar</button></div>`).join("")}</div>`; }).join("")}</div>`;
    } else {
      cont.innerHTML = `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Fecha</th><th>Contacto</th><th>Curso de interés</th><th>Origen</th><th>Etapa</th><th>Próxima acción</th><th></th></tr></thead>
        <tbody>${lista.map(l => `<tr><td>${formatoFecha(aFecha(l.createdAt))}</td><td><strong>${escapar(l.name)}</strong><br><span class="texto-xs">${escapar(l.email)}${l.phone ? ` · <a href="https://wa.me/${escapar(l.phone.replace(/\D/g, "").replace(/^0/, "57"))}" target="_blank" rel="noopener">${escapar(l.phone)}</a>` : ""}</span></td>
          <td class="texto-sm">${escapar(tituloCurso(l.courseInterest))}</td><td><span class="insignia insignia--gris">${escapar(l.source || "")}</span></td>
          <td><span class="insignia ${colorEtapa(l.stage)}">${escapar(l.stage)}</span></td>
          <td class="texto-sm">${l.nextAction ? `${escapar(l.nextAction)}<br><span class="texto-xs texto-tenue">${escapar(l.nextActionDate || "")}</span>` : "—"}</td>
          <td class="acciones"><button class="boton boton--fantasma boton--sm" data-ver="${escapar(l.id)}" type="button">Ver y anotar</button></td></tr>`).join("") || `<tr><td colspan="7" class="texto-suave">Ningún contacto coincide.</td></tr>`}</tbody></table></div>`;
    }
  };
  pintarKpis(); pintarContenido();

  ["etapa", "curso", "origen"].forEach(k => p.querySelector(`#f-${k}`).onchange = (e) => { f[k] = e.target.value; pintarContenido(); });
  p.querySelector("#f-texto").oninput = (e) => { f.texto = e.target.value.trim().toLowerCase(); pintarContenido(); };

  p.querySelector("#nuevo").onclick = async () => {
    const d = await abrirFormulario({ titulo: "Nuevo contacto (manual)", campos: [
      { name: "name", label: "Nombre", required: true }, { name: "email", label: "Correo", type: "email", required: true }, { name: "phone", label: "WhatsApp", type: "tel" },
      { name: "courseInterest", label: "Curso de interés", type: "select", options: [{ value: "", label: "—" }, ...cursos.map(c => ({ value: c.id, label: c.title }))] },
      { name: "notes", label: "Notas", type: "textarea", rows: 2 }, { name: "consent", label: "La persona autorizó el tratamiento de sus datos", type: "checkbox" }
    ] });
    if (!d) return;
    if (!d.consent) return aviso("Sin autorización de datos no podemos guardar el contacto (Ley 1581).", "error");
    try { await crearLead({ ...d, source: "manual" }); aviso("Contacto creado", "exito"); pintar(); } catch (e) { aviso(e.message, "error"); }
  };

  p.addEventListener("click", async (e) => {
    const v = e.target.closest("[data-vista]"); if (v) { sessionStorage.setItem("crm_vista", v.dataset.vista); return pintar(); }
    const b = e.target.closest("[data-ver]"); if (b) return verLead(leads.find(l => l.id === b.dataset.ver), cursos);
  });
  p.addEventListener("change", async (e) => {
    const s = e.target.closest("[data-etapa]"); if (!s) return;
    try { await actualizarLead(s.dataset.etapa, { stage: s.value }); const l = leads.find(x => x.id === s.dataset.etapa); l.stage = s.value; pintarKpis(); pintarContenido(); aviso("Etapa actualizada", "exito"); }
    catch (err) { aviso(err.message, "error"); }
  });
}

/** Ficha del contacto: datos, cambio de etapa, historial de interacciones y nueva nota. */
async function verLead(lead, cursos) {
  if (!lead) return;
  const interacciones = await obtenerInteracciones(lead.id);
  const d = await abrirFormulario({
    titulo: `Contacto · ${lead.name}`, textoGuardar: "Guardar",
    campos: [
      { name: "resumen", label: "Datos", type: "textarea", rows: 3, readonly: true, value: `${lead.email}${lead.phone ? " · " + lead.phone : ""}\nInterés: ${cursos.find(c => c.id === lead.courseInterest)?.title || "—"} · Origen: ${lead.source || "—"} · Consentimiento: ${lead.consent ? "sí (" + (lead.consentAt || "").slice(0, 10) + ")" : "no"}` },
      { name: "stage", label: "Etapa", type: "select", options: ETAPAS.map(e => ({ value: e.id, label: e.label })) },
      { name: "historial", label: `Historial (${interacciones.length})`, type: "textarea", rows: 4, readonly: true, value: interacciones.map(i => `${formatoFechaHora(aFecha(i.date))} · ${i.channel}: ${i.note}${i.nextAction ? ` → ${i.nextAction} (${i.nextActionDate || "sin fecha"})` : ""}`).join("\n") || "Sin interacciones aún." },
      { name: "channel", label: "Nueva interacción · canal", type: "select", options: [{ value: "", label: "— sin nueva interacción —" }, ...CANALES.map(c => ({ value: c, label: c }))] },
      { name: "note", label: "Qué se habló", type: "textarea", rows: 2 },
      { name: "nextAction", label: "Próxima acción", placeholder: "Enviar video de muestra" },
      { name: "nextActionDate", label: "Fecha de la próxima acción", type: "date" }
    ],
    valores: { stage: lead.stage, nextAction: lead.nextAction || "", nextActionDate: lead.nextActionDate || "" }
  });
  if (!d) return;
  try {
    await actualizarLead(lead.id, { stage: d.stage, nextAction: d.nextAction, nextActionDate: d.nextActionDate });
    if (d.channel && d.note) await agregarInteraccion({ leadId: lead.id, date: new Date().toISOString(), channel: d.channel, note: d.note, nextAction: d.nextAction, nextActionDate: d.nextActionDate, createdBy: usuarioActual()?.email || "" });
    aviso("Contacto actualizado", "exito"); pintar();
  } catch (e) { aviso(e.message, "error"); }
}

export { borrarLead };
