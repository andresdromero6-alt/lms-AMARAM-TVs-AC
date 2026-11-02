// =====================================================================
// AMARAM TV · Mi perfil: datos, historial de compras y certificados
// =====================================================================
import { $, escapar, aviso, formatoCOP, formatoFecha, requerirSesion, perfilActual, refrescarPerfil } from "./app.js";
import { actualizarPerfil, obtenerPagos, obtenerInscripciones, obtenerCurso, obtenerLecciones, obtenerTodoProgresoUsuario, aFecha } from "./db.js";

const usuario = await requerirSesion();
if (usuario) {
  const perfil = perfilActual() || {};
  const nombre = perfil.name || usuario.displayName || "";
  $("#nombre-vista").textContent = nombre || "Mi perfil";
  $("#correo-vista").textContent = usuario.email;
  $("#rol-vista").textContent = perfil.role === "admin" ? "Administrador" : "Estudiante";
  $("#avatar").innerHTML = perfil.photoUrl || usuario.photoURL ? `<img src="${escapar(perfil.photoUrl || usuario.photoURL)}" alt="">` : escapar((nombre || usuario.email)[0].toUpperCase());
  $("#nombre").value = nombre; $("#telefono").value = perfil.phone || "";

  $("#form-perfil").addEventListener("submit", async (e) => {
    e.preventDefault();
    try { await actualizarPerfil(usuario.uid, { name: $("#nombre").value.trim(), phone: $("#telefono").value.trim() }); await refrescarPerfil(); $("#nombre-vista").textContent = $("#nombre").value.trim(); aviso("Perfil actualizado", "exito"); }
    catch (err) { aviso("No se pudo guardar: " + err.message, "error"); }
  });

  // Compras: combina pagos (Mercado Pago) e inscripciones manuales
  try {
    const [pagos, inscripciones, progreso] = await Promise.all([obtenerPagos(usuario.uid), obtenerInscripciones(usuario.uid), obtenerTodoProgresoUsuario(usuario.uid)]);
    const cursosCache = {};
    const curso = async (id) => cursosCache[id] ??= await obtenerCurso(id);
    const filas = [];
    for (const p of pagos) filas.push({ fecha: aFecha(p.date || p.createdAt), titulo: (await curso(p.courseId))?.title || p.courseId, valor: p.amount, estado: p.status });
    for (const i of inscripciones) if (!pagos.some(p => p.courseId === i.courseId)) filas.push({ fecha: aFecha(i.createdAt), titulo: (await curso(i.courseId))?.title || i.courseId, valor: i.amount || 0, estado: i.source === "manual" ? "inscripción manual" : i.status });
    filas.sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0));
    const etiqueta = (s) => ({ approved: "insignia--exito", active: "insignia--exito", pending: "insignia--alerta", in_process: "insignia--alerta", rejected: "insignia--error", cancelled: "insignia--error" }[s] || "insignia--gris");
    $("#compras").innerHTML = filas.length ? filas.map(f => `<tr><td>${formatoFecha(f.fecha)}</td><td>${escapar(f.titulo)}</td><td class="num">${formatoCOP(f.valor)}</td><td><span class="insignia ${etiqueta(f.estado)}">${escapar(f.estado)}</span></td></tr>`).join("") : `<tr><td colspan="4" class="texto-suave">Todavía no tienes compras. <a href="cursos.html">Ver cursos</a></td></tr>`;

    // Certificados
    const certs = [];
    for (const i of inscripciones.filter(x => x.status === "active")) {
      const c = await curso(i.courseId); if (!c) continue;
      const lecciones = await obtenerLecciones(c.id);
      const hechas = progreso.filter(p => p.courseId === c.id).length;
      if (lecciones.length && hechas >= lecciones.length) certs.push(c);
    }
    $("#certificados").innerHTML = certs.length
      ? certs.map(c => `<div class="fila fila--entre mb-3"><strong>${escapar(c.title)}</strong><button class="boton boton--secundario boton--sm" type="button" data-cert="${escapar(c.id)}" data-titulo="${escapar(c.title)}">Ver certificado</button></div>`).join("")
      : `<p class="texto-sm texto-tenue mb-0">Aún no has completado ningún curso.</p>`;
    $("#certificados").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cert]"); if (!b) return;
      const v = window.open("", "_blank");
      v.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Certificado · AMARAM TV</title><style>body{font-family:Futura,Jost,"Century Gothic",sans-serif;background:#0B1F3A;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.c{border:6px double #2EC4B6;padding:60px 48px;max-width:720px;text-align:center}.c h1{color:#2EC4B6;letter-spacing:.2em;font-size:1rem;text-transform:uppercase}.c h2{font-size:2.4rem;margin:.5rem 0}.c p{color:#cfe3ff}.c .f{margin-top:40px;font-size:.85rem;color:#7EE8DC}@media print{body{background:#fff;color:#0B1F3A}.c p{color:#333}}</style></head><body><div class="c"><h1>AMARAM TV certifica que</h1><h2>${escapar(nombre || usuario.email)}</h2><p>completó satisfactoriamente el curso</p><h2 style="font-size:1.6rem">${escapar(b.dataset.titulo)}</h2><p>${formatoFecha(new Date())}</p><p class="f">Verificación: ${escapar(usuario.uid.slice(0, 8))}-${escapar(b.dataset.cert)}</p><button onclick="print()" style="margin-top:24px;padding:10px 20px;border-radius:999px;border:0;background:#2EC4B6;font-weight:700;cursor:pointer">Imprimir o guardar PDF</button></div></body></html>`);
      v.document.close();
    });
  } catch (err) { console.error(err); $("#compras").innerHTML = `<tr><td colspan="4" class="mensaje mensaje--error">${escapar(err.message)}</td></tr>`; }
}
