// =====================================================================
// AMARAM TV · Aula: pantalla de lección
// Verifica la inscripción (paywall), lista las lecciones por módulo,
// muestra el video (YouTube no listado), el texto y el material, y guarda
// el progreso en la colección progress con ID uid_lessonId.
// =====================================================================
import { $, parametro, escapar, aviso, requerirSesion, esAdmin, youtubeEmbed } from "./app.js";
import { obtenerCurso, obtenerLecciones, obtenerProgreso, tieneInscripcion, marcarCompletada, desmarcarCompletada } from "./db.js";

const usuario = await requerirSesion();
if (usuario) {
  const courseId = parametro("curso");
  const curso = courseId ? await obtenerCurso(courseId) : null;
  if (!curso) {
    $("#titulo-curso").textContent = "Curso no encontrado";
  } else {
    document.title = `${curso.title} · Aula AMARAM TV`;
    $("#miga-curso").textContent = curso.title;
    $("#titulo-curso").textContent = curso.title;

    const acceso = esAdmin() || await tieneInscripcion(usuario.uid, curso.id);
    if (!acceso) {
      $("#sin-acceso").hidden = false;
      $("#enlace-comprar").href = `curso.html?id=${encodeURIComponent(curso.id)}`;
    } else {
      const [lecciones, progreso] = await Promise.all([obtenerLecciones(curso.id), obtenerProgreso(usuario.uid, curso.id)]);
      const hechas = new Set(progreso.map(p => p.lessonId));
      const actualId = parametro("leccion") || lecciones.find(l => !hechas.has(l.id))?.id || lecciones[0]?.id;
      const idx = lecciones.findIndex(l => l.id === actualId);
      const leccion = lecciones[idx];

      const pintarAvance = () => {
        const total = lecciones.length, n = lecciones.filter(l => hechas.has(l.id)).length;
        const pct = total ? Math.round(n / total * 100) : 0;
        $("#barra").style.width = pct + "%";
        $("#resumen-avance").textContent = `${n} de ${total} lecciones · ${pct} %`;
        $("#felicitacion").hidden = pct !== 100;
      };
      const pintarLista = () => {
        let html = "", mod = null;
        lecciones.forEach(l => {
          if (l.moduleNumber !== mod) { mod = l.moduleNumber; html += `<div class="aula__modulo">Módulo ${mod} · ${escapar(l.moduleName)}</div>`; }
          html += `<a class="aula__leccion" href="leccion.html?curso=${encodeURIComponent(curso.id)}&leccion=${encodeURIComponent(l.id)}" ${l.id === actualId ? 'aria-current="page"' : ""}><span class="marca ${hechas.has(l.id) ? "marca--hecha" : ""}">${hechas.has(l.id) ? "✓" : ""}</span><span>${escapar(l.title)}</span></a>`;
        });
        $("#lista-lecciones").innerHTML = html || `<p class="texto-sm texto-suave" style="padding:1rem">Este curso aún no tiene lecciones.</p>`;
      };

      $("#aula").hidden = false;
      pintarLista(); pintarAvance();

      if (leccion) {
        $("#modulo").textContent = `Módulo ${leccion.moduleNumber} · ${leccion.moduleName}`;
        $("#titulo-leccion").textContent = leccion.title;
        const url = leccion.videoUrl || "";
        const esArchivo = /\.(mp4|webm|m4v)(\?|$)/i.test(url);
        const embed = esArchivo ? "" : youtubeEmbed(url);
        $("#video").innerHTML = esArchivo
          ? `<video controls playsinline preload="metadata" style="width:100%;height:100%;background:#000" title="${escapar(leccion.title)}"><source src="${escapar(url)}" type="video/${url.toLowerCase().includes(".webm") ? "webm" : "mp4"}">Tu navegador no reproduce este video.</video>`
          : embed
          ? `<iframe src="${escapar(embed)}" title="${escapar(leccion.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
          : `<div class="video__vacio"><div><strong>Video en preparación</strong><br><span class="texto-sm">El instructor aún no publica el video de esta lección.</span></div></div>`;
        $("#contenido").innerHTML = (leccion.content || "").split(/\n{2,}/).map(p => `<p>${escapar(p).replace(/\n/g, "<br>")}</p>`).join("") || "<p>Sin notas para esta lección.</p>";
        if (leccion.materialUrl) { $("#zona-material").hidden = false; $("#enlace-material").href = leccion.materialUrl; $("#enlace-material").textContent = `⬇ ${leccion.materialName || "Descargar material"}`; }

        const ant = lecciones[idx - 1], sig = lecciones[idx + 1];
        const enlace = (l) => `leccion.html?curso=${encodeURIComponent(curso.id)}&leccion=${encodeURIComponent(l.id)}`;
        if (ant) $("#anterior").href = enlace(ant); else { $("#anterior").setAttribute("aria-disabled", "true"); $("#anterior").removeAttribute("href"); }
        if (sig) $("#siguiente").href = enlace(sig); else { $("#siguiente").textContent = "Volver a Mis cursos"; $("#siguiente").href = "mis-cursos.html"; }

        const boton = $("#boton-completar");
        const pintarBoton = () => { const ok = hechas.has(leccion.id); boton.textContent = ok ? "✓ Completada (deshacer)" : "Marcar como completada"; boton.className = ok ? "boton boton--contorno" : "boton boton--primario"; };
        pintarBoton();
        boton.addEventListener("click", async () => {
          boton.disabled = true;
          try {
            if (hechas.has(leccion.id)) { await desmarcarCompletada(usuario.uid, leccion.id); hechas.delete(leccion.id); }
            else { await marcarCompletada(usuario.uid, curso.id, leccion.id); hechas.add(leccion.id); aviso("¡Lección completada!", "exito"); }
            pintarBoton(); pintarLista(); pintarAvance();
          } catch (err) { console.error(err); aviso("No se pudo guardar el avance: " + err.message, "error"); }
          finally { boton.disabled = false; }
        });
      }
    }
  }
}
