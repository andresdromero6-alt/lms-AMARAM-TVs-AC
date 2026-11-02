// =====================================================================
// AMARAM TV · Mis cursos: cursos inscritos con barra de progreso
// Avance = lecciones completadas ÷ lecciones del curso.
// =====================================================================
import { $, escapar, requerirSesion, perfilActual } from "./app.js";
import { obtenerInscripciones, obtenerCurso, obtenerLecciones, obtenerTodoProgresoUsuario } from "./db.js";

const usuario = await requerirSesion();
if (usuario) {
  const nombre = (perfilActual()?.name || usuario.displayName || "").split(" ")[0];
  if (nombre) $("#saludo").textContent = `Hola, ${nombre}`;
  const lista = $("#lista");
  try {
    const [inscripciones, progreso] = await Promise.all([obtenerInscripciones(usuario.uid), obtenerTodoProgresoUsuario(usuario.uid)]);
    const activas = inscripciones.filter(i => i.status === "active");
    if (!activas.length) {
      lista.innerHTML = `<div class="vacio" style="grid-column:1/-1"><h3>Aún no tienes cursos</h3><p>Explora el catálogo y empieza hoy.</p><a class="boton boton--primario" href="cursos.html">Ver cursos</a></div>`;
    } else {
      const tarjetas = await Promise.all(activas.map(async (ins) => {
        const [curso, lecciones] = await Promise.all([obtenerCurso(ins.courseId), obtenerLecciones(ins.courseId)]);
        if (!curso) return "";
        const hechas = new Set(progreso.filter(p => p.courseId === ins.courseId).map(p => p.lessonId));
        const total = lecciones.length || curso.lessonCount || 0;
        const completadas = lecciones.filter(l => hechas.has(l.id)).length;
        const pct = total ? Math.round(completadas / total * 100) : 0;
        const siguiente = lecciones.find(l => !hechas.has(l.id)) || lecciones[0];
        const enlace = siguiente ? `leccion.html?curso=${encodeURIComponent(curso.id)}&leccion=${encodeURIComponent(siguiente.id)}` : `leccion.html?curso=${encodeURIComponent(curso.id)}`;
        return `
        <article class="curso-tarjeta">
          <div class="curso-tarjeta__imagen">${curso.imageUrl ? `<img src="${escapar(curso.imageUrl)}" alt="">` : ""}${pct === 100 ? `<span class="insignia insignia--exito">✓ Completado</span>` : ""}</div>
          <div class="curso-tarjeta__cuerpo">
            <h3>${escapar(curso.title)}</h3>
            <p class="texto-sm texto-suave mb-0">${completadas} de ${total} lecciones completadas</p>
            <div class="progreso" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avance"><div class="progreso__barra" style="width:${pct}%"></div></div>
            <div class="curso-tarjeta__pie">
              <strong>${pct} %</strong>
              <a class="boton boton--primario boton--sm" href="${enlace}">${pct === 0 ? "Empezar" : pct === 100 ? "Repasar" : "Continuar"}</a>
            </div>
          </div>
        </article>`;
      }));
      lista.innerHTML = tarjetas.join("");
    }
  } catch (err) {
    console.error(err);
    lista.innerHTML = `<div class="mensaje mensaje--error">No pudimos cargar tus cursos: ${escapar(err.message)}</div>`;
  }
}
