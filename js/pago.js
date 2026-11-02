// =====================================================================
// AMARAM TV · Página de regreso de Mercado Pago
// Mercado Pago vuelve a pago.html?estado=exitoso|pendiente|rechazado&curso=…
// y agrega payment_id, status, external_reference, etc. Pedimos al backend
// que verifique el pago (respaldo del webhook) y mostramos el resultado.
// =====================================================================
import { $, parametro, escapar, requerirSesion } from "./app.js";
import { obtenerCurso, tieneInscripcion } from "./db.js";
import { verificarPago } from "./pagos.js";
import { PAGOS_ACTIVOS } from "./firebase-config.js";

const usuario = await requerirSesion();
if (usuario) {
  const estadoUrl = parametro("estado") || "";
  const courseId = parametro("curso") || (parametro("external_reference") || "").split("|")[1] || "";
  const paymentId = parametro("payment_id") || parametro("collection_id") || "";
  const statusMp = parametro("status") || parametro("collection_status") || "";
  const curso = courseId ? await obtenerCurso(courseId) : null;

  const pintar = (tipo, titulo, texto, acciones) => {
    $("#icono").className = `resultado__icono resultado__icono--${tipo}`;
    $("#icono").textContent = { exito: "✓", pendiente: "⏱", error: "✕" }[tipo];
    $("#titulo").textContent = titulo; $("#texto").textContent = texto; $("#acciones").innerHTML = acciones;
    const d = $("#detalle"); d.hidden = false;
    d.innerHTML = `${curso ? `<dt>Curso</dt><dd>${escapar(curso.title)}</dd>` : ""}${paymentId ? `<dt>ID del pago</dt><dd>${escapar(paymentId)}</dd>` : ""}${statusMp ? `<dt>Estado en Mercado Pago</dt><dd>${escapar(statusMp)}</dd>` : ""}<dt>Cuenta</dt><dd>${escapar(usuario.email)}</dd>`;
  };
  const irAula = `<a class="boton boton--primario boton--grande" href="leccion.html?curso=${encodeURIComponent(courseId)}">Ir al aula</a><a class="boton boton--contorno" href="mis-cursos.html">Mis cursos</a>`;
  const reintentar = `<a class="boton boton--primario" href="curso.html?id=${encodeURIComponent(courseId)}">Intentar de nuevo</a><a class="boton boton--contorno" href="index.html#contacto">Necesito ayuda</a>`;

  let estado = statusMp || { exitoso: "approved", pendiente: "pending", rechazado: "rejected" }[estadoUrl] || "";
  // 1) Verificar con el backend (procesa el pago si el webhook aún no llegó)
  if (PAGOS_ACTIVOS && (paymentId || courseId)) {
    try { const r = await verificarPago({ paymentId, uid: usuario.uid, courseId }); if (r?.resultado?.estado) estado = r.resultado.estado; }
    catch (err) { console.warn("verificarPago:", err.message); }
  }
  // 2) Confirmar la inscripción en Firestore (fuente de verdad)
  let inscrito = courseId ? await tieneInscripcion(usuario.uid, courseId) : false;
  if (!inscrito && estado === "approved" && courseId) {
    for (let i = 0; i < 4 && !inscrito; i++) { await new Promise(r => setTimeout(r, 2500)); inscrito = await tieneInscripcion(usuario.uid, courseId); }
  }

  if (inscrito) pintar("exito", "¡Pago aprobado!", "Tu curso ya está activo. Entra al aula y empieza con la primera lección.", irAula);
  else if (estado === "approved") pintar("pendiente", "Pago aprobado, activando tu curso…", "El pago fue aprobado pero la inscripción tarda unos segundos más. Recarga esta página; si en 10 minutos no aparece en Mis cursos, escríbenos con el ID del pago.", `<button class="boton boton--primario" onclick="location.reload()" type="button">Recargar</button><a class="boton boton--contorno" href="mis-cursos.html">Mis cursos</a>`);
  else if (["pending", "in_process", "authorized"].includes(estado)) pintar("pendiente", "Pago pendiente", "Mercado Pago está procesando tu pago (por ejemplo, pagos en efectivo o en revisión). Cuando se apruebe, el curso aparecerá en Mis cursos y te avisaremos por correo.", `<a class="boton boton--primario" href="mis-cursos.html">Mis cursos</a><a class="boton boton--contorno" href="cursos.html">Seguir viendo cursos</a>`);
  else if (["rejected", "cancelled"].includes(estado)) pintar("error", "Pago rechazado", "No se pudo completar el pago. Puedes intentar con otro medio de pago o escribirnos para ayudarte.", reintentar);
  else pintar("pendiente", "No encontramos información del pago", "Si acabas de pagar, revisa Mis cursos en unos minutos. Si el problema continúa, contáctanos con el ID del pago.", `<a class="boton boton--primario" href="mis-cursos.html">Mis cursos</a>${reintentar}`);
}
