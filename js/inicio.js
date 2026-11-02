// =====================================================================
// AMARAM TV · Pantalla de inicio (landing)
// Pinta los cursos destacados, las preguntas frecuentes y conecta el
// formulario "Quiero más información" con el CRM.
// =====================================================================
import { $, escapar } from "./app.js";
import { obtenerCursos } from "./db.js";
import { FAQ } from "./datos.js";
import { NEGOCIO } from "./firebase-config.js";
import { tarjetaCurso, acordeonFAQ, conectarFormularioInteres } from "./componentes.js";

const contenedor = $("#cursos-destacados");
const selectCurso = $("#curso-interes");

$("#faq-lista").innerHTML = acordeonFAQ(FAQ);
$("#enlace-whatsapp").href = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent("Hola AMARAM TV, quiero información sobre los cursos.")}`;

try {
  const cursos = await obtenerCursos();
  contenedor.innerHTML = cursos.length ? cursos.map(tarjetaCurso).join("") : `<div class="vacio"><h3>Pronto publicaremos los cursos</h3><p>Déjanos tus datos abajo y te avisamos.</p></div>`;
  cursos.forEach(c => selectCurso.insertAdjacentHTML("beforeend", `<option value="${escapar(c.id)}">${escapar(c.title)}</option>`));
} catch (err) {
  console.error(err);
  contenedor.innerHTML = `<div class="mensaje mensaje--error">No pudimos cargar los cursos. Revisa la consola (F12) y la configuración de Firebase.</div>`;
}

conectarFormularioInteres($("#form-interes"), { source: "landing" });
