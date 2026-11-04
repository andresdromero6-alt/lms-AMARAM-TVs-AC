// =====================================================================
// AMARAM TV · Componentes reutilizables (HTML generado desde JS)
// =====================================================================
import { escapar, formatoCOP } from "./app.js";
import { crearLead } from "./db.js";
import { usuarioActual } from "./app.js";
import { notificarLead } from "./pagos.js";
import { icono } from "./iconos.js";

/** Tarjeta de curso para catálogo e inicio. */
export function tarjetaCurso(c) {
  const imagen = c.imageUrl ? `<img src="${escapar(c.imageUrl)}" alt="" loading="lazy">` : "";
  return `
  <article class="curso-tarjeta revelar">
    <a class="curso-tarjeta__imagen" href="curso.html?id=${encodeURIComponent(c.id)}" aria-hidden="true" tabindex="-1">${imagen}<span class="insignia">${escapar(c.level || "")}</span></a>
    <div class="curso-tarjeta__cuerpo">
      <span class="texto-xs texto-tenue">${escapar(c.category || "")}</span>
      <h3><a href="curso.html?id=${encodeURIComponent(c.id)}">${escapar(c.title)}</a></h3>
      <p class="texto-sm texto-suave mb-0">${escapar(c.promise || c.description || "")}</p>
      <div class="curso-tarjeta__meta">
        <span>${icono("reloj")} ${escapar(c.duration || `${c.lessonCount || 0} lecciones`)}</span>
        <span>${icono("usuarios")} ${escapar(c.instructorName || "")}</span>
      </div>
      <div class="curso-tarjeta__pie">
        <span class="precio">${formatoCOP(c.price)} <small>COP</small></span>
        <a class="boton boton--secundario boton--sm" href="curso.html?id=${encodeURIComponent(c.id)}">Ver curso ${icono("flecha")}</a>
      </div>
    </div>
  </article>`;
}

/** Acordeón de preguntas frecuentes. */
export function acordeonFAQ(lista) {
  return lista.map((f, i) => `<details ${i === 0 ? "open" : ""}><summary>${escapar(f.q)}</summary><div class="acordeon__cuerpo"><p class="mb-0">${escapar(f.a)}</p></div></details>`).join("");
}

/** Temario agrupado por módulo. */
export function temario(lecciones) {
  const modulos = new Map();
  lecciones.forEach(l => { if (!modulos.has(l.moduleNumber)) modulos.set(l.moduleNumber, { nombre: l.moduleName, lecciones: [] }); modulos.get(l.moduleNumber).lecciones.push(l); });
  return [...modulos.entries()].map(([n, m], i) => `
    <details ${i === 0 ? "open" : ""}>
      <summary><span>Módulo ${n} · ${escapar(m.nombre)}</span><span class="texto-xs texto-tenue">${m.lecciones.length} lecciones</span></summary>
      <div class="acordeon__cuerpo"><ol>${m.lecciones.map(l => `<li>${escapar(l.title)}${l.durationMin ? ` <span class="texto-xs texto-tenue">· ${l.durationMin} min</span>` : ""}</li>`).join("")}</ol></div>
    </details>`).join("");
}

/**
 * Conecta un formulario "Quiero más información" con el CRM (colección leads).
 * El formulario debe tener inputs name, email, phone, courseInterest, consent y un #form-mensaje.
 */
export function conectarFormularioInteres(form, { source = "landing", cursoFijo = null } = {}) {
  const mensaje = form.querySelector("#form-mensaje");
  const mostrarError = (campo, texto) => {
    const el = form.querySelector(`[data-error-para="${campo}"]`); if (el) el.textContent = texto;
    const input = form.querySelector(`#${campo}`); if (input) input.setAttribute("aria-invalid", texto ? "true" : "false");
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form).entries());
    let valido = true;
    mostrarError("nombre", ""); mostrarError("correo", ""); mostrarError("consentimiento", "");
    if (!datos.name || datos.name.trim().length < 3) { mostrarError("nombre", "Escribe tu nombre completo."); valido = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email || "")) { mostrarError("correo", "Escribe un correo válido."); valido = false; }
    if (!form.querySelector('[name="consent"]')?.checked) { mostrarError("consentimiento", "Necesitamos tu autorización para contactarte."); valido = false; }
    if (!valido) return;
    const boton = form.querySelector('button[type="submit"]'); boton.disabled = true; boton.textContent = "Enviando…";
    try {
      const courseInterest = cursoFijo || datos.courseInterest || "";
      const leadId = await crearLead({ ...datos, consent: true, source, courseInterest, userId: usuarioActual()?.uid || null });
      notificarLead({ leadId, name: datos.name, email: datos.email, courseInterest }); // correo de bienvenida (no bloquea)
      form.reset();
      mensaje.hidden = false; mensaje.className = "mensaje mensaje--exito";
      mensaje.textContent = "¡Listo! Recibimos tus datos. Un instructor te escribirá muy pronto.";
    } catch (err) {
      console.error(err);
      mensaje.hidden = false; mensaje.className = "mensaje mensaje--error";
      mensaje.textContent = "No pudimos guardar tus datos. Intenta de nuevo o escríbenos por WhatsApp.";
    } finally { boton.disabled = false; boton.textContent = "Quiero más información"; }
  });
}
