// =====================================================================
// AMARAM TV · Admin: gestión de recursos
// Instructores, recursos y costos de producción por curso, y calendario
// de sesiones (recursos de tipo "horario").
// =====================================================================
import { nuevoPanel, abrirFormulario, confirmar, escapar, aviso } from "./admin.js";
import { formatoCOP, slug } from "./app.js";
import { obtenerInstructores, guardarInstructor, borrarInstructor, obtenerRecursos, guardarRecurso, borrarRecurso, obtenerCursos, guardarCurso } from "./db.js";

const TIPOS = ["video", "material", "licencia", "equipo", "horario", "otro"];
const ESTADOS = ["pendiente", "en-proceso", "listo"];

// --------------------------------------------------------------------
// INSTRUCTORES
// --------------------------------------------------------------------
export async function pintarInstructores() {
  const [instructores, cursos] = await Promise.all([obtenerInstructores(), obtenerCursos({ soloPublicados: false })]);
  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>Instructores (${instructores.length})</h2><button class="boton boton--primario boton--sm" id="nuevo" type="button">+ Instructor</button></div>
    <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Nombre</th><th>Especialidad</th><th>Correo</th><th class="num">Tarifa/hora</th><th>Cursos asignados</th><th>Activo</th><th></th></tr></thead>
    <tbody>${instructores.map(i => `<tr><td><strong>${escapar(i.name)}</strong></td><td class="texto-sm">${escapar(i.specialty || "")}</td><td class="texto-sm">${escapar(i.email || "")}</td><td class="num">${formatoCOP(i.hourlyRate)}</td>
      <td class="texto-sm">${cursos.filter(c => c.instructorId === i.id).map(c => escapar(c.title)).join("<br>") || "—"}</td>
      <td><span class="insignia ${i.active !== false ? "insignia--exito" : "insignia--gris"}">${i.active !== false ? "sí" : "no"}</span></td>
      <td class="acciones"><button class="boton boton--fantasma boton--sm" data-asignar="${escapar(i.id)}" type="button">Asignar curso</button><button class="boton boton--fantasma boton--sm" data-editar="${escapar(i.id)}" type="button">Editar</button><button class="boton boton--fantasma boton--sm" data-borrar="${escapar(i.id)}" type="button" style="color:var(--error)">Borrar</button></td></tr>`).join("") || `<tr><td colspan="7" class="texto-suave">Sin instructores.</td></tr>`}</tbody></table></div>`;

  const campos = [
    { name: "name", label: "Nombre", required: true }, { name: "email", label: "Correo", type: "email" }, { name: "specialty", label: "Especialidad" },
    { name: "bio", label: "Biografía corta (se muestra en el curso)", type: "textarea", rows: 3 }, { name: "hourlyRate", label: "Tarifa por hora (COP)", type: "number", min: 0, step: 1000 },
    { name: "photoUrl", label: "Foto (URL)", type: "url" }, { name: "active", label: "Activo", type: "checkbox" }
  ];
  p.querySelector("#nuevo").onclick = async () => {
    const d = await abrirFormulario({ titulo: "Nuevo instructor", campos, valores: { active: true } }); if (!d) return;
    try { await guardarInstructor(slug(d.name), d); aviso("Instructor creado", "exito"); pintarInstructores(); } catch (e) { aviso(e.message, "error"); }
  };
  p.addEventListener("click", async (e) => {
    const ed = e.target.closest("[data-editar]"), bo = e.target.closest("[data-borrar]"), as = e.target.closest("[data-asignar]");
    try {
      if (ed) { const i = instructores.find(x => x.id === ed.dataset.editar); const d = await abrirFormulario({ titulo: "Editar instructor", campos, valores: i }); if (d) { await guardarInstructor(i.id, d); for (const c of cursos.filter(c => c.instructorId === i.id)) await guardarCurso(c.id, { instructorName: d.name }); aviso("Guardado", "exito"); pintarInstructores(); } }
      if (bo) { const i = instructores.find(x => x.id === bo.dataset.borrar); if (await confirmar(`¿Borrar a ${i.name}?`)) { await borrarInstructor(i.id); pintarInstructores(); } }
      if (as) { const i = instructores.find(x => x.id === as.dataset.asignar); const d = await abrirFormulario({ titulo: `Asignar curso a ${i.name}`, textoGuardar: "Asignar", campos: [{ name: "courseId", label: "Curso", type: "select", required: true, options: cursos.map(c => ({ value: c.id, label: c.title })) }] }); if (d) { await guardarCurso(d.courseId, { instructorId: i.id, instructorName: i.name }); aviso("Curso asignado", "exito"); pintarInstructores(); } }
    } catch (err) { aviso(err.message, "error"); }
  });
}

// --------------------------------------------------------------------
// RECURSOS Y COSTOS POR CURSO
// --------------------------------------------------------------------
export async function pintarRecursos() {
  const [recursos, cursos, instructores] = await Promise.all([obtenerRecursos(), obtenerCursos({ soloPublicados: false }), obtenerInstructores()]);
  const filtro = sessionStorage.getItem("admin_curso_recursos") || "";
  const lista = recursos.filter(r => r.type !== "horario" && (!filtro || r.courseId === filtro));
  const tituloC = (id) => cursos.find(c => c.id === id)?.title || id || "General";
  const total = lista.reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const porCurso = cursos.map(c => ({ c, costo: recursos.filter(r => r.courseId === c.id && r.type !== "horario").reduce((s, r) => s + (Number(r.cost) || 0), 0) }));

  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>Recursos y costos</h2><button class="boton boton--primario boton--sm" id="nuevo" type="button">+ Recurso</button></div>
    <div class="rejilla rejilla--3 mb-5">${porCurso.map(p => `<div class="estadistica"><div class="estadistica__valor" style="font-size:var(--tam-lg)">${formatoCOP(p.costo)}</div><div class="estadistica__etiqueta">Costo de producción · ${escapar(p.c.title)}</div></div>`).join("")}</div>
    <div class="filtros"><div class="campo"><label for="f-curso">Curso</label><select id="f-curso"><option value="">Todos</option>${cursos.map(c => `<option value="${escapar(c.id)}" ${c.id === filtro ? "selected" : ""}>${escapar(c.title)}</option>`).join("")}</select></div></div>
    <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Curso</th><th>Tipo</th><th>Recurso</th><th>Responsable</th><th class="num">Costo</th><th>Estado</th><th></th></tr></thead>
    <tbody>${lista.map(r => `<tr><td class="texto-sm">${escapar(tituloC(r.courseId))}</td><td><span class="insignia insignia--gris">${escapar(r.type)}</span></td><td><strong>${escapar(r.name)}</strong>${r.link ? ` <a href="${escapar(r.link)}" target="_blank" rel="noopener">↗</a>` : ""}</td><td class="texto-sm">${escapar(r.responsible || "")}</td><td class="num">${formatoCOP(r.cost)}</td>
      <td><span class="insignia ${r.status === "listo" ? "insignia--exito" : r.status === "en-proceso" ? "insignia--alerta" : "insignia--gris"}">${escapar(r.status || "pendiente")}</span></td>
      <td class="acciones"><button class="boton boton--fantasma boton--sm" data-editar="${escapar(r.id)}" type="button">Editar</button><button class="boton boton--fantasma boton--sm" data-borrar="${escapar(r.id)}" type="button" style="color:var(--error)">Borrar</button></td></tr>`).join("") || `<tr><td colspan="7" class="texto-suave">Sin recursos. Registra videos, materiales, licencias y equipos con su costo para calcular el margen por curso.</td></tr>`}</tbody>
    <tfoot><tr><th colspan="4">Total</th><th class="num">${formatoCOP(total)}</th><th colspan="2"></th></tr></tfoot></table></div>`;

  const campos = [
    { name: "courseId", label: "Curso", type: "select", required: true, options: cursos.map(c => ({ value: c.id, label: c.title })) },
    { name: "type", label: "Tipo", type: "select", options: TIPOS.filter(t => t !== "horario").map(t => ({ value: t, label: t })) },
    { name: "name", label: "Nombre del recurso", required: true, placeholder: "Grabación módulo 1, licencia de edición, cámara…" },
    { name: "cost", label: "Costo (COP)", type: "number", min: 0, step: 1000, required: true },
    { name: "responsible", label: "Responsable", type: "select", options: [{ value: "", label: "—" }, ...instructores.map(i => ({ value: i.name, label: i.name })), { value: "Equipo", label: "Equipo" }] },
    { name: "link", label: "Enlace (Drive, factura…)", type: "url" },
    { name: "status", label: "Estado", type: "select", options: ESTADOS.map(s => ({ value: s, label: s })) }
  ];
  p.querySelector("#f-curso").onchange = (e) => { sessionStorage.setItem("admin_curso_recursos", e.target.value); pintarRecursos(); };
  p.querySelector("#nuevo").onclick = async () => {
    const d = await abrirFormulario({ titulo: "Nuevo recurso", campos, valores: { courseId: filtro, status: "pendiente" } }); if (!d) return;
    try { await guardarRecurso(null, d); aviso("Recurso creado", "exito"); pintarRecursos(); } catch (e) { aviso(e.message, "error"); }
  };
  p.addEventListener("click", async (e) => {
    const ed = e.target.closest("[data-editar]"), bo = e.target.closest("[data-borrar]");
    try {
      if (ed) { const r = lista.find(x => x.id === ed.dataset.editar); const d = await abrirFormulario({ titulo: "Editar recurso", campos, valores: r }); if (d) { await guardarRecurso(r.id, d); aviso("Guardado", "exito"); pintarRecursos(); } }
      if (bo) { const r = lista.find(x => x.id === bo.dataset.borrar); if (await confirmar(`¿Borrar "${r.name}"?`)) { await borrarRecurso(r.id); pintarRecursos(); } }
    } catch (err) { aviso(err.message, "error"); }
  });
}

// --------------------------------------------------------------------
// CALENDARIO DE SESIONES (recursos tipo "horario")
// --------------------------------------------------------------------
export async function pintarCalendario() {
  const [recursos, cursos, instructores] = await Promise.all([obtenerRecursos(), obtenerCursos({ soloPublicados: false }), obtenerInstructores()]);
  const sesiones = recursos.filter(r => r.type === "horario" && r.date);
  const base = sessionStorage.getItem("admin_semana") ? new Date(sessionStorage.getItem("admin_semana")) : new Date();
  const lunes = new Date(base); lunes.setDate(base.getDate() - ((base.getDay() + 6) % 7)); lunes.setHours(0, 0, 0, 0);
  const dias = [...Array(7)].map((_, i) => { const d = new Date(lunes); d.setDate(lunes.getDate() + i); return d; });
  const iso = (d) => d.toISOString().slice(0, 10);
  const nombreDia = new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short" });

  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>Calendario de sesiones</h2>
      <div class="fila"><button class="boton boton--contorno boton--sm" id="semana-ant" type="button">← Semana</button><strong>${nombreDia.format(dias[0])} – ${nombreDia.format(dias[6])}</strong><button class="boton boton--contorno boton--sm" id="semana-sig" type="button">Semana →</button><button class="boton boton--primario boton--sm" id="nueva" type="button">+ Sesión</button></div></div>
    <p class="texto-sm texto-suave">Grabaciones, clases en vivo, asesorías o visitas técnicas. Cada sesión se guarda como recurso de tipo <code>horario</code> con su instructor y curso.</p>
    <div class="calendario">${dias.map(d => { const del = sesiones.filter(s => s.date === iso(d)).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")); return `
      <div class="calendario__dia"><strong>${nombreDia.format(d)}</strong>${del.map(s => `<div class="calendario__sesion" data-editar="${escapar(s.id)}" role="button" tabindex="0"><strong>${escapar(s.startTime || "")}${s.endTime ? "–" + escapar(s.endTime) : ""}</strong> ${escapar(s.name)}<br><span class="texto-tenue">${escapar(instructores.find(i => i.id === s.instructorId)?.name || "")} · ${escapar(cursos.find(c => c.id === s.courseId)?.title || "")}</span></div>`).join("")}</div>`; }).join("")}</div>`;

  const campos = [
    { name: "name", label: "Sesión", required: true, placeholder: "Grabación módulo 2 · Clase en vivo · Asesoría" },
    { name: "courseId", label: "Curso", type: "select", options: [{ value: "", label: "—" }, ...cursos.map(c => ({ value: c.id, label: c.title }))] },
    { name: "instructorId", label: "Instructor", type: "select", options: [{ value: "", label: "—" }, ...instructores.map(i => ({ value: i.id, label: i.name }))] },
    { name: "date", label: "Fecha", type: "date", required: true }, { name: "startTime", label: "Hora inicio", type: "time", required: true }, { name: "endTime", label: "Hora fin", type: "time" },
    { name: "cost", label: "Costo (COP, p. ej. horas del instructor)", type: "number", min: 0, step: 1000 }, { name: "link", label: "Enlace (Meet, lugar…)" },
    { name: "status", label: "Estado", type: "select", options: ESTADOS.map(s => ({ value: s, label: s })) }
  ];
  const mover = (n) => { const d = new Date(lunes); d.setDate(lunes.getDate() + n); sessionStorage.setItem("admin_semana", d.toISOString()); pintarCalendario(); };
  p.querySelector("#semana-ant").onclick = () => mover(-7);
  p.querySelector("#semana-sig").onclick = () => mover(7);
  p.querySelector("#nueva").onclick = async () => {
    const d = await abrirFormulario({ titulo: "Nueva sesión", campos, valores: { date: iso(dias[0]), status: "pendiente" } }); if (!d) return;
    try { await guardarRecurso(null, { ...d, type: "horario", responsible: instructores.find(i => i.id === d.instructorId)?.name || "" }); aviso("Sesión creada", "exito"); pintarCalendario(); } catch (e) { aviso(e.message, "error"); }
  };
  p.addEventListener("click", async (e) => {
    const el = e.target.closest("[data-editar]"); if (!el) return;
    const s = sesiones.find(x => x.id === el.dataset.editar);
    const d = await abrirFormulario({ titulo: "Editar sesión", campos, valores: s, textoGuardar: "Guardar" }); if (!d) return;
    try { await guardarRecurso(s.id, { ...d, type: "horario", responsible: instructores.find(i => i.id === d.instructorId)?.name || "" }); pintarCalendario(); } catch (err) { aviso(err.message, "error"); }
  });
}
