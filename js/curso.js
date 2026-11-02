// =====================================================================
// AMARAM TV · Detalle del curso
// Muestra la información del curso y su temario; el botón Comprar decide
// qué hacer según la sesión: pedir login, abrir el aula si ya está inscrito
// o crear el pago en Mercado Pago a través de Apps Script.
// =====================================================================
import { $, parametro, escapar, formatoCOP, aviso, sesionLista, usuarioActual, perfilActual } from "./app.js";
import { MODO_DEMO, obtenerCurso, obtenerLecciones, obtenerInstructores, tieneInscripcion } from "./db.js";
import { PAGOS_ACTIVOS } from "./firebase-config.js";
import { temario, conectarFormularioInteres } from "./componentes.js";
import { crearPago } from "./pagos.js";

const id = parametro("id");
const curso = id ? await obtenerCurso(id) : null;

if (!curso || (curso.published === false && perfilActual()?.role !== "admin")) {
  $("#titulo").textContent = "Curso no disponible";
  $("#no-encontrado").hidden = false;
} else {
  document.title = `${curso.title} · AMARAM TV`;
  $("#miga-curso").textContent = curso.title;
  $("#categoria").textContent = curso.category || "";
  $("#titulo").textContent = curso.title;
  $("#promesa").textContent = curso.promise || "";
  $("#portada").innerHTML = curso.imageUrl ? `<img src="${escapar(curso.imageUrl)}" alt="Portada del curso ${escapar(curso.title)}">` : "";
  $("#descripcion").textContent = curso.description || "";
  $("#publico").textContent = curso.audience || "";
  $("#requisitos").innerHTML = (curso.requirements || []).map(r => `<li>${escapar(r)}</li>`).join("") || "<li>Ninguno: empezamos desde cero.</li>";
  $("#nivel").textContent = curso.level || "";
  $("#precio").innerHTML = `${formatoCOP(curso.price)} <small>COP</small>`;
  $("#dato-duracion").textContent = curso.duration || "";
  $("#dato-lecciones").textContent = `${curso.lessonCount || "—"} lecciones en video`;
  $("#detalle").hidden = false;

  // Temario e instructor en paralelo
  const [lecciones, instructores] = await Promise.all([obtenerLecciones(curso.id), obtenerInstructores()]);
  $("#temario").innerHTML = lecciones.length ? temario(lecciones) : `<div class="acordeon__cuerpo" style="padding:1rem">Temario en preparación.</div>`;
  if (!curso.lessonCount && lecciones.length) $("#dato-lecciones").textContent = `${lecciones.length} lecciones en video`;
  const ins = instructores.find(i => i.id === curso.instructorId);
  $("#instructor").innerHTML = ins
    ? `<h3 class="mb-0">${escapar(ins.name)}</h3><p class="texto-sm texto-suave">${escapar(ins.specialty || "")}</p><p class="mb-0">${escapar(ins.bio || "")}</p>`
    : `<h3 class="mb-0">${escapar(curso.instructorName || "Instructor AMARAM TV")}</h3>`;

  // Botón comprar
  const zona = $("#zona-compra"), boton = $("#boton-comprar"), nota = $("#nota-pago");
  await sesionLista;
  const usuario = usuarioActual();

  if (MODO_DEMO) {
    boton.addEventListener("click", () => aviso("Modo demo: los pagos se activan cuando el equipo configura Firebase y Apps Script.", "error"));
  } else if (usuario && await tieneInscripcion(usuario.uid, curso.id)) {
    zona.innerHTML = `<a class="boton boton--primario boton--bloque boton--grande" href="leccion.html?curso=${encodeURIComponent(curso.id)}">Ir al aula</a>`;
    nota.textContent = "Ya tienes acceso a este curso. ¡Sigue avanzando!";
  } else if (!usuario) {
    boton.textContent = "Entrar para comprar";
    boton.addEventListener("click", () => location.href = `login.html?volver=${encodeURIComponent(`curso.html?id=${curso.id}`)}`);
  } else if (!PAGOS_ACTIVOS) {
    boton.addEventListener("click", () => aviso("Los pagos aún no están configurados. Escríbenos por WhatsApp para inscribirte.", "error"));
  } else {
    boton.addEventListener("click", async () => {
      boton.disabled = true; boton.textContent = "Creando tu pago…";
      try {
        const url = await crearPago({ courseId: curso.id, uid: usuario.uid, email: usuario.email, name: perfilActual()?.name || usuario.displayName || "" });
        location.href = url;
      } catch (err) {
        console.error(err);
        aviso("No pudimos iniciar el pago: " + err.message, "error");
        boton.disabled = false; boton.textContent = "Comprar el curso";
      }
    });
  }

  conectarFormularioInteres($("#form-interes"), { source: "detalle", cursoFijo: curso.id });
}
