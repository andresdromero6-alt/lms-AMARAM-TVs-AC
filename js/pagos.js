// =====================================================================
// AMARAM TV · Puente con el backend (Apps Script) para pagos y correos
// El frontend NUNCA habla con Wompi directamente: le pide a Apps
// Script que cree la preferencia de pago (allí viven los secretos de Wompi).
// Se envía como text/plain para evitar el "preflight" de CORS que Apps
// Script no soporta; el script lee e.postData.contents y lo parsea.
// =====================================================================
import { APPS_SCRIPT_URL, PAGOS_ACTIVOS } from "./firebase-config.js";

async function llamarBackend(accion, datos = {}) {
  if (!PAGOS_ACTIVOS) throw new Error("El backend de pagos no está configurado (APPS_SCRIPT_URL en js/firebase-config.js).");
  const resp = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ accion, ...datos }),
    redirect: "follow"
  });
  const texto = await resp.text();
  let json;
  try { json = JSON.parse(texto); } catch { throw new Error("Respuesta inesperada del backend: " + texto.slice(0, 200)); }
  if (!json.ok) throw new Error(json.error || "Error en el backend");
  return json;
}

/** Construye el enlace de pago de Wompi y devuelve la URL de pago (init_point). */
export async function crearPago({ courseId, uid, email, name }) {
  const r = await llamarBackend("crearPago", { courseId, uid, email, name, origen: location.origin + location.pathname.replace(/[^/]*$/, "") });
  return r.init_point;
}

/** Pide al backend que verifique un pago por su ID (útil al volver de la pasarela). */
export async function verificarPago({ paymentId, uid }) {
  return llamarBackend("verificarPago", { paymentId, uid });
}

/** Avisa al backend que hay un lead nuevo para enviar el correo de bienvenida. */
export async function notificarLead({ leadId, name, email, courseInterest }) {
  try { return await llamarBackend("nuevoLead", { leadId, name, email, courseInterest }); }
  catch (e) { console.warn("No se envió el correo de bienvenida:", e.message); return null; }
}
