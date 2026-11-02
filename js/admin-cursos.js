// =====================================================================
// AMARAM TV · Admin: cursos, lecciones, inscripciones y usuarios
// =====================================================================
import { nuevoPanel, abrirFormulario, confirmar, escapar, aviso, irA } from "./admin.js";
import { formatoCOP, formatoFecha, slug } from "./app.js";
import {
  obtenerCursos, guardarCurso, borrarCurso, obtenerTodasLecciones, obtenerLecciones, guardarLeccion, borrarLeccion,
  obtenerInstructores, guardarInstructor, obtenerUsuarios, obtenerTodasInscripciones, inscribirManual, cancelarInscripcion,
  cambiarRol, aFecha, MODO_DEMO
} from "./db.js";
import { CURSOS, LECCIONES, INSTRUCTORES } from "./datos.js";

const NIVELES = ["Básico / Principiante", "Intermedio", "Avanzado / Profesional"];

// --------------------------------------------------------------------
// CURSOS
// --------------------------------------------------------------------
export async function pintarCursos() {
  const [cursos, instructores] = await Promise.all([obtenerCursos({ soloPublicados: false }), obtenerInstructores()]);
  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>Cursos (${cursos.length})</h2>
      <div class="fila"><button class="boton boton--contorno boton--sm" id="cargar-ejemplo" type="button">Cargar inventario de ejemplo</button><button class="boton boton--primario boton--sm" id="nuevo" type="button">+ Nuevo curso</button></div></div>
    ${MODO_DEMO ? `<div class="mensaje mensaje--alerta mb-5">Modo demo: los cambios no se guardan. Configura Firebase para administrar cursos reales.</div>` : ""}
    <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Orden</th><th>Curso</th><th>Categoría / nivel</th><th>Instructor</th><th class="num">Precio</th><th>Lecciones</th><th>Estado</th><th></th></tr></thead>
    <tbody>${cursos.map(c => `<tr>
      <td>${c.order ?? ""}</td>
      <td><strong>${escapar(c.title)}</strong><br><span class="texto-xs texto-tenue">${escapar(c.id)}</span></td>
      <td class="texto-sm">${escapar(c.category || "")}<br><span class="texto-xs texto-tenue">${escapar(c.level || "")}</span></td>
      <td class="texto-sm">${escapar(c.instructorName || "")}</td>
      <td class="num">${formatoCOP(c.price)}</td>
      <td>${c.lessonCount ?? "—"}</td>
      <td><span class="insignia ${c.published ? "insignia--exito" : "insignia--gris"}">${c.published ? "Publicado" : "Oculto"}</span></td>
      <td class="acciones">
        <button class="boton boton--fantasma boton--sm" data-accion="publicar" data-id="${escapar(c.id)}" type="button">${c.published ? "Ocultar" : "Publicar"}</button>
        <button class="boton boton--fantasma boton--sm" data-accion="editar" data-id="${escapar(c.id)}" type="button">Editar</button>
        <button class="boton boton--fantasma boton--sm" data-accion="borrar" data-id="${escapar(c.id)}" type="button" style="color:var(--error)">Borrar</button>
      </td></tr>`).join("") || `<tr><td colspan="8" class="texto-suave">No hay cursos. Crea uno o carga el inventario de ejemplo.</td></tr>`}</tbody></table></div>`;

  const campos = (valores = {}) => [
    { name: "title", label: "Título", required: true },
    { name: "id", label: "ID (slug)", ayuda: "Sin espacios ni tildes. Se usa en la URL: curso.html?id=…", required: true, readonly: !!valores.id, placeholder: "montaje-smart-tv" },
    { name: "promise", label: "Promesa (una frase)", type: "textarea", rows: 2, required: true },
    { name: "description", label: "Descripción", type: "textarea", rows: 4 },
    { name: "audience", label: "Público", type: "textarea", rows: 2 },
    { name: "category", label: "Categoría", required: true },
    { name: "level", label: "Nivel", type: "select", options: NIVELES.map(n => ({ value: n, label: n })) },
    { name: "price", label: "Precio (COP)", type: "number", min: 0, step: 1000, required: true },
    { name: "instructorId", label: "Instructor", type: "select", options: [{ value: "", label: "— Sin asignar —" }, ...instructores.map(i => ({ value: i.id, label: i.name }))] },
    { name: "duration", label: "Duración (texto)", placeholder: "8 lecciones · ~6 horas" },
    { name: "imageUrl", label: "Imagen de portada (ruta o URL)", placeholder: "img/curso-smart-tv.svg" },
    { name: "requirementsTexto", label: "Requisitos (uno por línea)", type: "textarea", rows: 3 },
    { name: "order", label: "Orden en el catálogo", type: "number", min: 1 },
    { name: "published", label: "Publicado (visible en el catálogo)", type: "checkbox" }
  ];
  const guardar = async (datos, existente) => {
    const id = existente?.id || slug(datos.id || datos.title);
    const ins = instructores.find(i => i.id === datos.instructorId);
    const lecciones = await obtenerLecciones(id).catch(() => []);
    const doc = { ...datos, id, slug: id, instructorName: ins?.name || "", requirements: datos.requirementsTexto.split("\n").map(s => s.trim()).filter(Boolean), lessonCount: lecciones.length || existente?.lessonCount || 0 };
    delete doc.requirementsTexto;
    await guardarCurso(id, doc);
  };

  p.querySelector("#nuevo").onclick = async () => {
    const datos = await abrirFormulario({ titulo: "Nuevo curso", campos: campos(), valores: { published: false, order: cursos.length + 1 } });
    if (!datos) return;
    try { await guardar(datos); aviso("Curso creado", "exito"); pintarCursos(); } catch (e) { aviso(e.message, "error"); }
  };
  p.querySelector("#cargar-ejemplo").onclick = async () => {
    if (!await confirmar("Esto crea o actualiza los 2 cursos, 16 lecciones y 2 instructores de js/datos.js en Firestore. ¿Continuar?")) return;
    try {
      for (const i of INSTRUCTORES) await guardarInstructor(i.id, i);
      for (const c of CURSOS) await guardarCurso(c.id, c);
      for (const l of LECCIONES) await guardarLeccion(l.id, l);
      aviso("Inventario cargado en Firestore", "exito"); pintarCursos();
    } catch (e) { aviso(e.message, "error"); }
  };
  p.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-accion]"); if (!b) return;
    const c = cursos.find(x => x.id === b.dataset.id);
    try {
      if (b.dataset.accion === "publicar") { await guardarCurso(c.id, { published: !c.published }); aviso(c.published ? "Curso oculto" : "Curso publicado", "exito"); pintarCursos(); }
      if (b.dataset.accion === "editar") {
        const datos = await abrirFormulario({ titulo: "Editar curso", campos: campos(c), valores: { ...c, requirementsTexto: (c.requirements || []).join("\n") } });
        if (datos) { await guardar(datos, c); aviso("Curso guardado", "exito"); pintarCursos(); }
      }
      if (b.dataset.accion === "borrar" && await confirmar(`¿Borrar "${c.title}"? Las lecciones e inscripciones no se borran automáticamente.`)) { await borrarCurso(c.id); aviso("Curso borrado"); pintarCursos(); }
    } catch (err) { aviso(err.message, "error"); }
  });
}

// --------------------------------------------------------------------
// LECCIONES
// --------------------------------------------------------------------
export async function pintarLecciones() {
  const [cursos, todas] = await Promise.all([obtenerCursos({ soloPublicados: false }), obtenerTodasLecciones()]);
  const filtro = sessionStorage.getItem("admin_curso_lecciones") || cursos[0]?.id || "";
  const lecciones = todas.filter(l => l.courseId === filtro).sort((a, b) => a.order - b.order);
  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>Lecciones</h2><button class="boton boton--primario boton--sm" id="nueva" type="button">+ Nueva lección</button></div>
    <div class="filtros"><div class="campo"><label for="f-curso">Curso</label><select id="f-curso">${cursos.map(c => `<option value="${escapar(c.id)}" ${c.id === filtro ? "selected" : ""}>${escapar(c.title)}</option>`).join("")}</select></div></div>
    <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Orden</th><th>Módulo</th><th>Lección</th><th>Video</th><th>Material</th><th>Min</th><th></th></tr></thead>
    <tbody>${lecciones.map(l => `<tr>
      <td>${l.order}</td><td class="texto-sm">${l.moduleNumber} · ${escapar(l.moduleName)}</td><td><strong>${escapar(l.title)}</strong><br><span class="texto-xs texto-tenue">${escapar(l.id)}</span></td>
      <td>${l.videoUrl ? `<a href="${escapar(l.videoUrl)}" target="_blank" rel="noopener">▶ ver</a>` : `<span class="insignia insignia--alerta">falta</span>`}</td>
      <td>${l.materialUrl ? `<a href="${escapar(l.materialUrl)}" target="_blank" rel="noopener">⬇ ${escapar(l.materialName || "material")}</a>` : "—"}</td>
      <td>${l.durationMin || ""}</td>
      <td class="acciones"><button class="boton boton--fantasma boton--sm" data-accion="editar" data-id="${escapar(l.id)}" type="button">Editar</button><button class="boton boton--fantasma boton--sm" data-accion="borrar" data-id="${escapar(l.id)}" type="button" style="color:var(--error)">Borrar</button></td></tr>`).join("") || `<tr><td colspan="7" class="texto-suave">Este curso no tiene lecciones.</td></tr>`}</tbody></table></div>`;

  p.querySelector("#f-curso").onchange = (e) => { sessionStorage.setItem("admin_curso_lecciones", e.target.value); pintarLecciones(); };
  const campos = [
    { name: "moduleNumber", label: "Número de módulo", type: "number", min: 1, required: true },
    { name: "moduleName", label: "Nombre del módulo", required: true },
    { name: "order", label: "Orden (ej. 11, 12, 21…)", type: "number", min: 1, required: true, ayuda: "Convención: módulo × 10 + lección." },
    { name: "title", label: "Título de la lección", required: true },
    { name: "videoUrl", label: "URL del video (YouTube no listado)", type: "url", placeholder: "https://youtu.be/…" },
    { name: "content", label: "Texto / notas de la lección", type: "textarea", rows: 5 },
    { name: "materialUrl", label: "URL del material (Google Drive)", type: "url" },
    { name: "materialName", label: "Nombre del material", placeholder: "Lista de herramientas (PDF)" },
    { name: "durationMin", label: "Duración (min)", type: "number", min: 1 }
  ];
  const actualizarConteo = async () => { const n = (await obtenerLecciones(filtro)).length; await guardarCurso(filtro, { lessonCount: n }); };
  p.querySelector("#nueva").onclick = async () => {
    const ultimo = lecciones[lecciones.length - 1];
    const datos = await abrirFormulario({ titulo: "Nueva lección", campos, valores: { moduleNumber: ultimo?.moduleNumber || 1, moduleName: ultimo?.moduleName || "", order: (ultimo?.order || 10) + 1 } });
    if (!datos) return;
    try { const id = `${filtro}_m${datos.moduleNumber}-l${datos.order % 10 || datos.order}`; await guardarLeccion(id, { ...datos, courseId: filtro }); await actualizarConteo(); aviso("Lección creada", "exito"); pintarLecciones(); } catch (e) { aviso(e.message, "error"); }
  };
  p.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-accion]"); if (!b) return;
    const l = lecciones.find(x => x.id === b.dataset.id);
    try {
      if (b.dataset.accion === "editar") { const d = await abrirFormulario({ titulo: "Editar lección", campos, valores: l }); if (d) { await guardarLeccion(l.id, d); aviso("Lección guardada", "exito"); pintarLecciones(); } }
      if (b.dataset.accion === "borrar" && await confirmar(`¿Borrar "${l.title}"?`)) { await borrarLeccion(l.id); await actualizarConteo(); pintarLecciones(); }
    } catch (err) { aviso(err.message, "error"); }
  });
}

// --------------------------------------------------------------------
// INSCRIPCIONES (manuales para pruebas + vista de las automáticas)
// --------------------------------------------------------------------
export async function pintarInscripciones() {
  const [cursos, usuarios, inscripciones] = await Promise.all([obtenerCursos({ soloPublicados: false }), obtenerUsuarios(), obtenerTodasInscripciones()]);
  const nombreU = (uid) => { const u = usuarios.find(x => x.id === uid); return u ? `${u.name} <span class="texto-xs texto-tenue">${escapar(u.email)}</span>` : uid; };
  const tituloC = (id) => cursos.find(c => c.id === id)?.title || id;
  inscripciones.sort((a, b) => (aFecha(b.createdAt)?.getTime() || 0) - (aFecha(a.createdAt)?.getTime() || 0));
  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>Inscripciones (${inscripciones.length})</h2><button class="boton boton--primario boton--sm" id="nueva" type="button">+ Inscribir manualmente</button></div>
    <p class="texto-sm texto-suave">Las inscripciones por Wompi las crea el backend automáticamente. La inscripción manual sirve para pruebas, becas o pagos por fuera de la plataforma.</p>
    <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Fecha</th><th>Estudiante</th><th>Curso</th><th>Origen</th><th class="num">Valor</th><th>Estado</th><th></th></tr></thead>
    <tbody>${inscripciones.map(i => `<tr><td>${formatoFecha(aFecha(i.createdAt))}</td><td>${nombreU(i.userId)}</td><td>${escapar(tituloC(i.courseId))}</td><td><span class="insignia ${i.source === "wompi" ? "insignia--info" : "insignia--gris"}">${escapar(i.source || "manual")}</span></td><td class="num">${formatoCOP(i.amount)}</td><td><span class="insignia ${i.status === "active" ? "insignia--exito" : "insignia--error"}">${escapar(i.status)}</span></td>
      <td class="acciones">${i.status === "active" ? `<button class="boton boton--fantasma boton--sm" data-cancelar="${escapar(i.id)}" type="button" style="color:var(--error)">Cancelar</button>` : `<button class="boton boton--fantasma boton--sm" data-reactivar="${escapar(i.id)}" type="button">Reactivar</button>`}</td></tr>`).join("") || `<tr><td colspan="7" class="texto-suave">Sin inscripciones todavía.</td></tr>`}</tbody></table></div>`;

  p.querySelector("#nueva").onclick = async () => {
    const datos = await abrirFormulario({ titulo: "Inscribir manualmente", textoGuardar: "Inscribir", campos: [
      { name: "userId", label: "Estudiante", type: "select", required: true, options: usuarios.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })) },
      { name: "courseId", label: "Curso", type: "select", required: true, options: cursos.map(c => ({ value: c.id, label: c.title })) },
      { name: "amount", label: "Valor pagado (COP, 0 si es beca o prueba)", type: "number", min: 0, value: 0 }
    ] });
    if (!datos) return;
    try { await inscribirManual(datos.userId, datos.courseId, { amount: datos.amount || 0 }); aviso("Estudiante inscrito", "exito"); pintarInscripciones(); } catch (e) { aviso(e.message, "error"); }
  };
  p.addEventListener("click", async (e) => {
    const c = e.target.closest("[data-cancelar]"), r = e.target.closest("[data-reactivar]");
    try {
      if (c) { const i = inscripciones.find(x => x.id === c.dataset.cancelar); if (await confirmar("¿Cancelar esta inscripción? El estudiante perderá el acceso.")) { await cancelarInscripcion(i.userId, i.courseId); pintarInscripciones(); } }
      if (r) { const i = inscripciones.find(x => x.id === r.dataset.reactivar); await inscribirManual(i.userId, i.courseId, { amount: i.amount || 0, source: i.source || "manual" }); pintarInscripciones(); }
    } catch (err) { aviso(err.message, "error"); }
  });
}

// --------------------------------------------------------------------
// USUARIOS (roles)
// --------------------------------------------------------------------
export async function pintarUsuarios() {
  const usuarios = await obtenerUsuarios();
  usuarios.sort((a, b) => (aFecha(b.createdAt)?.getTime() || 0) - (aFecha(a.createdAt)?.getTime() || 0));
  const p = nuevoPanel();
  p.innerHTML = `
    <div class="admin-cabecera"><h2>Usuarios (${usuarios.length})</h2></div>
    <p class="texto-sm texto-suave">Solo un administrador puede cambiar roles. El primer administrador se asigna desde la consola de Firebase (ver docs/firebase.md).</p>
    <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Registro</th><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr></thead>
    <tbody>${usuarios.map(u => `<tr><td>${formatoFecha(aFecha(u.createdAt))}</td><td>${escapar(u.name)}</td><td>${escapar(u.email)}</td><td><span class="insignia ${u.role === "admin" ? "insignia--oscura" : "insignia--suave"}">${escapar(u.role)}</span></td>
      <td class="acciones"><button class="boton boton--fantasma boton--sm" data-rol="${escapar(u.id)}" data-nuevo="${u.role === "admin" ? "student" : "admin"}" type="button">${u.role === "admin" ? "Quitar admin" : "Hacer admin"}</button></td></tr>`).join("") || `<tr><td colspan="5" class="texto-suave">Sin usuarios.</td></tr>`}</tbody></table></div>`;
  p.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-rol]"); if (!b) return;
    if (!await confirmar(`¿Cambiar el rol a "${b.dataset.nuevo}"?`)) return;
    try { await cambiarRol(b.dataset.rol, b.dataset.nuevo); aviso("Rol actualizado", "exito"); pintarUsuarios(); } catch (err) { aviso(err.message, "error"); }
  });
}
