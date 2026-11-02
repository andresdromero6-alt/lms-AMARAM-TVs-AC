// =====================================================================
// AMARAM TV · Catálogo de cursos con filtro por categoría, nivel y texto
// =====================================================================
import { $, escapar } from "./app.js";
import { obtenerCursos } from "./db.js";
import { tarjetaCurso } from "./componentes.js";

const lista = $("#lista-cursos"), contador = $("#contador");
const fCategoria = $("#filtro-categoria"), fNivel = $("#filtro-nivel"), fTexto = $("#filtro-texto");
let cursos = [];

function pintar() {
  const cat = fCategoria.value, niv = fNivel.value, txt = fTexto.value.trim().toLowerCase();
  const filtrados = cursos.filter(c =>
    (!cat || c.category === cat) && (!niv || c.level === niv) &&
    (!txt || [c.title, c.promise, c.description, c.category, c.instructorName].join(" ").toLowerCase().includes(txt))
  );
  contador.textContent = `${filtrados.length} de ${cursos.length} cursos`;
  lista.innerHTML = filtrados.length ? filtrados.map(tarjetaCurso).join("") : `<div class="vacio"><h3>Ningún curso coincide</h3><p>Prueba con otro filtro o <a href="index.html#contacto">cuéntanos qué buscas</a>.</p></div>`;
}

try {
  cursos = await obtenerCursos();
  [...new Set(cursos.map(c => c.category).filter(Boolean))].forEach(v => fCategoria.insertAdjacentHTML("beforeend", `<option>${escapar(v)}</option>`));
  [...new Set(cursos.map(c => c.level).filter(Boolean))].forEach(v => fNivel.insertAdjacentHTML("beforeend", `<option>${escapar(v)}</option>`));
  pintar();
  [fCategoria, fNivel].forEach(el => el.addEventListener("change", pintar));
  fTexto.addEventListener("input", pintar);
} catch (err) {
  console.error(err);
  lista.innerHTML = `<div class="mensaje mensaje--error">No pudimos cargar los cursos. Revisa la consola (F12).</div>`;
}
