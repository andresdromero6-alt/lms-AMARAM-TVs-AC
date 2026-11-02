// =====================================================================
// AMARAM TV · Capa de datos
// Un solo lugar habla con Firestore. Si Firebase no está configurado
// (MODO_DEMO), lee los datos de ejemplo de js/datos.js y guarda los
// contactos del formulario en localStorage para poder probar la landing.
// Todas las pantallas importan funciones de aquí; ninguna usa Firestore directo.
// =====================================================================

import { firebaseConfig, MODO_DEMO } from "./firebase-config.js";
import { CURSOS, LECCIONES, INSTRUCTORES } from "./datos.js";

let app = null, auth = null, db = null, fs = null, fa = null;

if (!MODO_DEMO) {
  const [appMod, authMod, fsMod] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js")
  ]);
  app = appMod.initializeApp(firebaseConfig);
  fa = authMod;
  fs = fsMod;
  auth = authMod.getAuth(app);
  db = fsMod.getFirestore(app);
}

export { auth, db, fa, fs, MODO_DEMO };

const demoError = () => { const e = new Error("Esta acción no está disponible en modo demo. Configura Firebase en js/firebase-config.js."); e.codigo = "demo"; return e; };
const ahora = () => (fs ? fs.serverTimestamp() : new Date().toISOString());
const docData = (snap) => ({ id: snap.id, ...snap.data() });

// --------------------------------------------------------------------
// Genéricos
// --------------------------------------------------------------------
async function listar(nombre, { filtros = [], orden = null, limite = 0 } = {}) {
  const partes = [fs.collection(db, nombre)];
  filtros.forEach(([campo, op, valor]) => partes.push(fs.where(campo, op, valor)));
  if (orden) partes.push(fs.orderBy(...[].concat(orden)));
  if (limite) partes.push(fs.limit(limite));
  const snap = await fs.getDocs(fs.query(...partes));
  return snap.docs.map(docData);
}
async function leer(nombre, id) {
  const snap = await fs.getDoc(fs.doc(db, nombre, id));
  return snap.exists() ? docData(snap) : null;
}
export async function guardarDoc(nombre, id, datos, { merge = true } = {}) {
  if (MODO_DEMO) throw demoError();
  const limpio = { ...datos, updatedAt: ahora() };
  delete limpio.id;
  if (id) { await fs.setDoc(fs.doc(db, nombre, id), limpio, { merge }); return id; }
  const ref = await fs.addDoc(fs.collection(db, nombre), { ...limpio, createdAt: ahora() });
  return ref.id;
}
export async function borrarDoc(nombre, id) {
  if (MODO_DEMO) throw demoError();
  await fs.deleteDoc(fs.doc(db, nombre, id));
}

// --------------------------------------------------------------------
// Cursos y lecciones
// --------------------------------------------------------------------
export async function obtenerCursos({ soloPublicados = true } = {}) {
  if (MODO_DEMO) return CURSOS.filter(c => !soloPublicados || c.published).sort((a, b) => (a.order || 0) - (b.order || 0));
  const filtros = soloPublicados ? [["published", "==", true]] : [];
  const cursos = await listar("courses", { filtros });
  return cursos.sort((a, b) => (a.order || 0) - (b.order || 0));
}
export async function obtenerCurso(id) {
  if (MODO_DEMO) return CURSOS.find(c => c.id === id) || null;
  return leer("courses", id);
}
export async function obtenerLecciones(courseId) {
  if (MODO_DEMO) return LECCIONES.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  const lecciones = await listar("lessons", { filtros: [["courseId", "==", courseId]] });
  return lecciones.sort((a, b) => a.order - b.order);
}
export async function obtenerLeccion(id) {
  if (MODO_DEMO) return LECCIONES.find(l => l.id === id) || null;
  return leer("lessons", id);
}
export async function obtenerTodasLecciones() {
  if (MODO_DEMO) return [...LECCIONES];
  return listar("lessons");
}
export const guardarCurso = (id, datos) => guardarDoc("courses", id, datos);

/** Temario público del curso (títulos, módulos y duración). Se guarda en el documento del curso
 *  para que visitantes y estudiantes no inscritos puedan verlo sin leer la colección lessons (protegida). */
export async function obtenerTemario(curso) {
  if (Array.isArray(curso?.syllabus) && curso.syllabus.length) return [...curso.syllabus].sort((a, b) => a.order - b.order);
  try { return (await obtenerLecciones(curso.id)).map(resumenLeccion); } catch { return []; }
}
const resumenLeccion = (l) => ({ id: l.id, moduleNumber: l.moduleNumber, moduleName: l.moduleName, order: l.order, title: l.title, durationMin: l.durationMin || null });
/** Recalcula lessonCount y syllabus del curso a partir de sus lecciones (solo admin). */
export async function sincronizarTemario(courseId) {
  const lecciones = await obtenerLecciones(courseId);
  await guardarCurso(courseId, { lessonCount: lecciones.length, syllabus: lecciones.map(resumenLeccion) });
  return lecciones.length;
}
export const borrarCurso = (id) => borrarDoc("courses", id);
export const guardarLeccion = (id, datos) => guardarDoc("lessons", id, datos);
export const borrarLeccion = (id) => borrarDoc("lessons", id);

// --------------------------------------------------------------------
// Usuarios
// --------------------------------------------------------------------
export async function obtenerPerfil(uid) {
  if (MODO_DEMO) return null;
  return leer("users", uid);
}
export async function crearPerfilSiNoExiste(usuario) {
  if (MODO_DEMO) return null;
  const ref = fs.doc(db, "users", usuario.uid);
  const snap = await fs.getDoc(ref);
  if (snap.exists()) return docData(snap);
  const datos = {
    name: usuario.displayName || usuario.email.split("@")[0],
    email: usuario.email,
    photoUrl: usuario.photoURL || "",
    role: "student",
    createdAt: ahora()
  };
  await fs.setDoc(ref, datos);
  return { id: usuario.uid, ...datos };
}
export async function obtenerUsuarios() {
  if (MODO_DEMO) return [];
  return listar("users");
}
export const actualizarPerfil = (uid, datos) => guardarDoc("users", uid, datos);
export const cambiarRol = (uid, role) => guardarDoc("users", uid, { role });

// --------------------------------------------------------------------
// Inscripciones, progreso y pagos
// --------------------------------------------------------------------
export const idInscripcion = (uid, courseId) => `${uid}_${courseId}`;
export const idProgreso = (uid, lessonId) => `${uid}_${lessonId}`;

export async function obtenerInscripciones(uid) {
  if (MODO_DEMO) return [];
  return listar("enrollments", { filtros: [["userId", "==", uid]] });
}
export async function tieneInscripcion(uid, courseId) {
  if (MODO_DEMO) return false;
  try {
    const ins = await leer("enrollments", idInscripcion(uid, courseId));
    return !!ins && ins.status === "active";
  } catch (err) { console.warn("tieneInscripcion:", err.message); return false; }
}
export async function inscribirManual(uid, courseId, { amount = 0, source = "manual" } = {}) {
  return guardarDoc("enrollments", idInscripcion(uid, courseId), {
    userId: uid, courseId, status: "active", amount, source, paymentId: null, createdAt: ahora()
  });
}
export const cancelarInscripcion = (uid, courseId) => guardarDoc("enrollments", idInscripcion(uid, courseId), { status: "cancelled" });
export async function obtenerTodasInscripciones() {
  if (MODO_DEMO) return [];
  return listar("enrollments");
}

export async function obtenerProgreso(uid, courseId) {
  if (MODO_DEMO) return [];
  return listar("progress", { filtros: [["userId", "==", uid], ["courseId", "==", courseId]] });
}
export async function obtenerTodoProgresoUsuario(uid) {
  if (MODO_DEMO) return [];
  return listar("progress", { filtros: [["userId", "==", uid]] });
}
export async function obtenerTodoProgreso() {
  if (MODO_DEMO) return [];
  return listar("progress");
}
export function marcarCompletada(uid, courseId, lessonId) {
  return guardarDoc("progress", idProgreso(uid, lessonId), { userId: uid, courseId, lessonId, completedAt: ahora() });
}
export function desmarcarCompletada(uid, lessonId) {
  return borrarDoc("progress", idProgreso(uid, lessonId));
}

export async function obtenerPagos(uid) {
  if (MODO_DEMO) return [];
  return listar("payments", { filtros: [["userId", "==", uid]] });
}
export async function obtenerTodosPagos() {
  if (MODO_DEMO) return [];
  return listar("payments");
}

// --------------------------------------------------------------------
// CRM: leads e interacciones
// --------------------------------------------------------------------
const CLAVE_DEMO_LEADS = "amaram_demo_leads";
export async function crearLead(datos) {
  const lead = {
    name: datos.name.trim(),
    email: datos.email.trim().toLowerCase(),
    phone: (datos.phone || "").trim(),
    courseInterest: datos.courseInterest || "",
    stage: "nuevo",
    source: datos.source || "landing",
    consent: !!datos.consent,
    consentAt: new Date().toISOString(),
    userId: datos.userId || null,
    notes: datos.notes || "",
    createdAt: ahora()
  };
  if (MODO_DEMO) {
    const lista = JSON.parse(localStorage.getItem(CLAVE_DEMO_LEADS) || "[]");
    lista.push({ id: `demo-${Date.now()}`, ...lead });
    localStorage.setItem(CLAVE_DEMO_LEADS, JSON.stringify(lista));
    return lista[lista.length - 1].id;
  }
  const ref = await fs.addDoc(fs.collection(db, "leads"), lead);
  return ref.id;
}
export async function obtenerLeads() {
  if (MODO_DEMO) return JSON.parse(localStorage.getItem(CLAVE_DEMO_LEADS) || "[]");
  return listar("leads");
}
export const actualizarLead = (id, datos) => guardarDoc("leads", id, datos);
export const borrarLead = (id) => borrarDoc("leads", id);
export async function obtenerInteracciones(leadId) {
  if (MODO_DEMO) return [];
  const lista = await listar("interactions", { filtros: [["leadId", "==", leadId]] });
  return lista.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}
export const agregarInteraccion = (datos) => guardarDoc("interactions", null, datos);

// --------------------------------------------------------------------
// Recursos: instructores, recursos/costos, horarios
// --------------------------------------------------------------------
export async function obtenerInstructores() {
  if (MODO_DEMO) return [...INSTRUCTORES];
  return listar("instructors");
}
export const guardarInstructor = (id, datos) => guardarDoc("instructors", id, datos);
export const borrarInstructor = (id) => borrarDoc("instructors", id);
export async function obtenerRecursos(courseId = null) {
  if (MODO_DEMO) return [];
  return listar("resources", { filtros: courseId ? [["courseId", "==", courseId]] : [] });
}
export const guardarRecurso = (id, datos) => guardarDoc("resources", id, datos);
export const borrarRecurso = (id) => borrarDoc("resources", id);

// --------------------------------------------------------------------
// Utilidades de fecha para timestamps de Firestore o ISO
// --------------------------------------------------------------------
export function aFecha(valor) {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor.toDate();
  if (valor.seconds) return new Date(valor.seconds * 1000);
  const d = new Date(valor);
  return isNaN(d) ? null : d;
}
