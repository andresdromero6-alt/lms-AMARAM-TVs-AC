/**
 * =====================================================================
 * AMARAM TV · Backend en Google Apps Script
 * ---------------------------------------------------------------------
 * Qué hace:
 *  1. crearPago     → crea una preferencia en Mercado Pago (Checkout Pro) y devuelve el enlace de pago.
 *  2. webhook       → recibe el aviso de Mercado Pago, CONSULTA el pago con su ID y, solo si está
 *                     aprobado, crea payments + enrollments en Firestore y pasa el lead a "cliente".
 *  3. verificarPago → la página pago.html lo llama al volver de la pasarela (respaldo del webhook).
 *  4. nuevoLead     → envía el correo de bienvenida cuando alguien llena el formulario.
 *
 * Cómo escribe en Firestore: con la API REST y el token OAuth de la cuenta dueña del proyecto
 * (ScriptApp.getOAuthToken). Por eso este script debe crearse con la MISMA cuenta de Google que
 * creó el proyecto de Firebase, y las reglas de Firestore no aplican a estas escrituras.
 *
 * Secretos: SOLO en Configuración del proyecto → Propiedades del script:
 *   MP_ACCESS_TOKEN      Access Token de PRUEBA (TEST-...) de Mercado Pago; en producción el APP_USR-...
 *   FIREBASE_PROJECT_ID  ID del proyecto de Firebase (ej. amaram-tv)
 *   SITE_URL             URL publicada, con / al final (ej. https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/)
 *   ADMIN_EMAIL          correo que recibe copia de cada venta (opcional)
 *
 * Publicar: Implementar → Nueva implementación → Aplicación web → Ejecutar como: yo → Acceso: cualquier usuario.
 * Cada vez que cambies el código: Implementar → Administrar implementaciones → editar → Versión: nueva.
 * Ver backend/README.md para el paso a paso y las pruebas.
 * =====================================================================
 */

var PROPS = PropertiesService.getScriptProperties();
var MP_API = "https://api.mercadopago.com";

// ---------------------------------------------------------------------
// Puntos de entrada
// ---------------------------------------------------------------------
function doGet(e) {
  return respuesta_({ ok: true, servicio: "AMARAM TV backend", hora: new Date().toISOString(), config: verificarConfig_() });
}

function doPost(e) {
  try {
    var params = (e && e.parameter) || {};
    var cuerpo = {};
    try { cuerpo = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}; } catch (err) { cuerpo = {}; }

    // 1) ¿Es un aviso (webhook) de Mercado Pago?  Llega como ?type=payment&data.id=123  o  ?topic=payment&id=123
    var esWebhook = params.type || params.topic || (cuerpo.action && String(cuerpo.action).indexOf("payment") === 0) || cuerpo.type === "payment";
    if (esWebhook) return manejarWebhook_(params, cuerpo);

    // 2) Acciones del frontend
    switch (cuerpo.accion) {
      case "crearPago":     return respuesta_(crearPago_(cuerpo));
      case "verificarPago": return respuesta_(verificarPago_(cuerpo));
      case "nuevoLead":     return respuesta_(nuevoLead_(cuerpo));
      default:              return respuesta_({ ok: false, error: "Acción desconocida: " + cuerpo.accion });
    }
  } catch (err) {
    registrar_("ERROR doPost", err.message, err.stack);
    return respuesta_({ ok: false, error: err.message });
  }
}

// ---------------------------------------------------------------------
// 1. Crear pago (preferencia de Checkout Pro)
// ---------------------------------------------------------------------
function crearPago_(d) {
  if (!d.courseId || !d.uid || !d.email) throw new Error("Faltan datos: courseId, uid y email son obligatorios.");
  var curso = fsGet_("courses/" + d.courseId);
  if (!curso) throw new Error("El curso no existe: " + d.courseId);
  if (curso.published === false) throw new Error("El curso no está publicado.");
  var precio = Number(curso.price);
  if (!(precio > 0)) throw new Error("El curso no tiene un precio válido.");

  // Si ya está inscrito, no cobrar dos veces
  var inscripcion = fsGet_("enrollments/" + d.uid + "_" + d.courseId);
  if (inscripcion && inscripcion.status === "active") throw new Error("Ya tienes acceso a este curso.");

  var sitio = sitio_(d.origen);
  var preferencia = {
    items: [{ id: d.courseId, title: curso.title, description: "Curso en línea · AMARAM TV", category_id: "learnings", quantity: 1, currency_id: "COP", unit_price: precio }],
    payer: { email: d.email, name: d.name || "" },
    external_reference: d.uid + "|" + d.courseId,
    metadata: { uid: d.uid, course_id: d.courseId, email: d.email },
    back_urls: {
      success: sitio + "pago.html?estado=exitoso&curso=" + encodeURIComponent(d.courseId),
      pending: sitio + "pago.html?estado=pendiente&curso=" + encodeURIComponent(d.courseId),
      failure: sitio + "pago.html?estado=rechazado&curso=" + encodeURIComponent(d.courseId)
    },
    auto_return: "approved",
    notification_url: ScriptApp.getService().getUrl() + "?source=webhook",
    statement_descriptor: "AMARAM TV",
    binary_mode: false
  };
  var r = mp_("POST", "/checkout/preferences", preferencia);
  registrar_("Preferencia creada", r.id, d.uid, d.courseId);
  return { ok: true, preferenceId: r.id, init_point: r.init_point, sandbox_init_point: r.sandbox_init_point };
}

// ---------------------------------------------------------------------
// 2. Webhook de Mercado Pago
// ---------------------------------------------------------------------
function manejarWebhook_(params, cuerpo) {
  var tipo = params.type || params.topic || cuerpo.type || "";
  var id = params["data.id"] || params.id || (cuerpo.data && cuerpo.data.id) || "";
  registrar_("Webhook recibido", tipo, id);
  if (String(tipo).indexOf("payment") !== 0 || !id) return respuesta_({ ok: true, ignorado: true });   // merchant_order u otros: ignorar
  try {
    var resultado = procesarPago_(id);
    return respuesta_({ ok: true, resultado: resultado });
  } catch (err) {
    registrar_("ERROR webhook", err.message);
    return respuesta_({ ok: false, error: err.message });
  }
}

/** Página de regreso: verifica el pago por su ID (payment_id en la URL) o busca por referencia. */
function verificarPago_(d) {
  if (d.paymentId) return { ok: true, resultado: procesarPago_(d.paymentId) };
  if (d.uid && d.courseId) {
    // Respaldo: buscar pagos aprobados por external_reference
    var busqueda = mp_("GET", "/v1/payments/search?sort=date_created&criteria=desc&external_reference=" + encodeURIComponent(d.uid + "|" + d.courseId));
    var pagos = (busqueda && busqueda.results) || [];
    for (var i = 0; i < pagos.length; i++) if (pagos[i].status === "approved") return { ok: true, resultado: procesarPago_(pagos[i].id) };
    return { ok: true, resultado: { estado: pagos.length ? pagos[0].status : "sin_pago" } };
  }
  throw new Error("Indica paymentId o uid + courseId.");
}

/**
 * Consulta el pago en Mercado Pago (NUNCA confiar solo en el aviso) y, si está aprobado,
 * crea payments/{id} y enrollments/{uid}_{courseId}. Es idempotente: si llega dos veces, no duplica.
 */
function procesarPago_(paymentId) {
  var pago = mp_("GET", "/v1/payments/" + paymentId);
  var ref = String(pago.external_reference || "").split("|");
  var uid = (pago.metadata && pago.metadata.uid) || ref[0];
  var courseId = (pago.metadata && pago.metadata.course_id) || ref[1];
  if (!uid || !courseId) throw new Error("El pago " + paymentId + " no trae referencia de usuario y curso.");
  var email = (pago.metadata && pago.metadata.email) || (pago.payer && pago.payer.email) || "";

  // Registrar el pago (cualquier estado) para el reporte
  fsSet_("payments/" + pago.id, {
    paymentId: String(pago.id), preferenceId: pago.preference_id || (pago.order && pago.order.id) || "", status: pago.status, statusDetail: pago.status_detail || "",
    amount: Number(pago.transaction_amount || 0), currency: pago.currency_id || "COP", userId: uid, courseId: courseId, email: email,
    externalReference: pago.external_reference || "", date: pago.date_approved || pago.date_created || new Date().toISOString(),
    paymentMethod: pago.payment_method_id || "", updatedAt: new Date().toISOString()
  });

  if (pago.status !== "approved") return { estado: pago.status, paymentId: pago.id };

  var idIns = uid + "_" + courseId;
  var existente = fsGet_("enrollments/" + idIns);
  if (existente && existente.status === "active" && existente.paymentId === String(pago.id)) return { estado: "approved", yaProcesado: true, paymentId: pago.id };

  fsSet_("enrollments/" + idIns, {
    userId: uid, courseId: courseId, status: "active", paymentId: String(pago.id), amount: Number(pago.transaction_amount || 0),
    source: "mercadopago", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  });
  if (email) pasarLeadACliente_(email, uid);

  var curso = fsGet_("courses/" + courseId) || { title: courseId };
  if (email) enviarCorreo_(email, "¡Tu curso está listo! · " + curso.title,
    "Hola,\n\nRecibimos tu pago (#" + pago.id + ") por " + formatoCOP_(pago.transaction_amount) + ". Ya tienes acceso a \"" + curso.title + "\".\n\n" +
    "Entra con tu cuenta y ve a Mis cursos: " + sitio_() + "mis-cursos.html\n\n¡Éxitos!\nEquipo AMARAM TV");
  var admin = PROPS.getProperty("ADMIN_EMAIL");
  if (admin) enviarCorreo_(admin, "Nueva venta · " + curso.title, "Pago #" + pago.id + " aprobado por " + formatoCOP_(pago.transaction_amount) + ".\nComprador: " + email + "\nUsuario: " + uid + "\nCurso: " + courseId);
  registrar_("Inscripción creada", idIns, pago.id);
  return { estado: "approved", paymentId: pago.id, enrollmentId: idIns };
}

/** Busca los leads con ese correo y los pasa a etapa "cliente" (y les guarda el userId). */
function pasarLeadACliente_(email, uid) {
  var leads = fsQuery_("leads", "email", "EQUAL", String(email).toLowerCase());
  for (var i = 0; i < leads.length; i++) fsSet_("leads/" + leads[i].id, { stage: "cliente", userId: uid, updatedAt: new Date().toISOString() });
  if (!leads.length) {   // no venía del formulario: crear el contacto como cliente para que el CRM esté completo
    fsSet_("leads/" + Utilities.getUuid(), { name: email.split("@")[0], email: String(email).toLowerCase(), phone: "", courseInterest: "", stage: "cliente", source: "compra", consent: true, consentAt: new Date().toISOString(), userId: uid, createdAt: new Date().toISOString() });
  }
}

// ---------------------------------------------------------------------
// 4. Correo de bienvenida a nuevos contactos
// ---------------------------------------------------------------------
function nuevoLead_(d) {
  if (!d.email) throw new Error("Falta el correo.");
  var nombre = d.name ? String(d.name).split(" ")[0] : "";
  var curso = d.courseInterest ? fsGet_("courses/" + d.courseInterest) : null;
  var texto = "Hola" + (nombre ? " " + nombre : "") + ",\n\n" +
    "Gracias por tu interés en AMARAM TV" + (curso ? " y en el curso \"" + curso.title + "\"" : "") + ". " +
    "Muy pronto un instructor te escribirá para resolver tus dudas.\n\n" +
    "Mientras tanto puedes ver el catálogo completo aquí: " + sitio_() + "cursos.html\n\n" +
    "Equipo AMARAM TV";
  enviarCorreo_(d.email, "Recibimos tus datos · AMARAM TV", texto);
  var admin = PROPS.getProperty("ADMIN_EMAIL");
  if (admin) enviarCorreo_(admin, "Nuevo contacto en el CRM: " + (d.name || d.email), "Nombre: " + d.name + "\nCorreo: " + d.email + "\nCurso de interés: " + (curso ? curso.title : "—") + "\n\nRevísalo en " + sitio_() + "admin.html#crm");
  return { ok: true };
}

// ---------------------------------------------------------------------
// Mercado Pago · cliente HTTP
// ---------------------------------------------------------------------
function mp_(metodo, ruta, cuerpo) {
  var token = PROPS.getProperty("MP_ACCESS_TOKEN");
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN en Propiedades del script.");
  var opciones = { method: metodo, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", "X-Idempotency-Key": Utilities.getUuid() }, muteHttpExceptions: true };
  if (cuerpo) opciones.payload = JSON.stringify(cuerpo);
  var resp = UrlFetchApp.fetch(MP_API + ruta, opciones);
  var codigo = resp.getResponseCode();
  var json = {};
  try { json = JSON.parse(resp.getContentText()); } catch (e) { json = { raw: resp.getContentText() }; }
  if (codigo >= 300) throw new Error("Mercado Pago " + codigo + ": " + (json.message || json.error || resp.getContentText()).slice(0, 300));
  return json;
}

// ---------------------------------------------------------------------
// Firestore · API REST (lee y escribe como dueño del proyecto)
// ---------------------------------------------------------------------
function fsUrl_(ruta) {
  var proyecto = PROPS.getProperty("FIREBASE_PROJECT_ID");
  if (!proyecto) throw new Error("Falta FIREBASE_PROJECT_ID en Propiedades del script.");
  return "https://firestore.googleapis.com/v1/projects/" + proyecto + "/databases/(default)/documents" + (ruta ? "/" + ruta : "");
}
function fsFetch_(url, metodo, cuerpo) {
  var opciones = { method: metodo || "GET", headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken(), "Content-Type": "application/json" }, muteHttpExceptions: true };
  if (cuerpo) opciones.payload = JSON.stringify(cuerpo);
  var resp = UrlFetchApp.fetch(url, opciones);
  var codigo = resp.getResponseCode();
  if (codigo === 404) return null;
  var json = JSON.parse(resp.getContentText() || "{}");
  if (codigo >= 300) throw new Error("Firestore " + codigo + ": " + ((json.error && json.error.message) || resp.getContentText()).slice(0, 300));
  return json;
}
/** Lee un documento: fsGet_("courses/montaje-smart-tv") → objeto plano o null. */
function fsGet_(ruta) {
  var doc = fsFetch_(fsUrl_(ruta));
  return doc ? deFirestore_(doc) : null;
}
/** Escribe/combina campos: fsSet_("enrollments/u_c", {status:"active"}). Hace merge (no borra otros campos). */
function fsSet_(ruta, datos) {
  var campos = aFirestore_(datos).fields;
  var mask = Object.keys(datos).map(function (k) { return "updateMask.fieldPaths=" + encodeURIComponent(k); }).join("&");
  return fsFetch_(fsUrl_(ruta) + "?" + mask, "PATCH", { fields: campos });
}
/** Consulta simple: fsQuery_("leads", "email", "EQUAL", "ana@x.co") → [{id, ...}] */
function fsQuery_(coleccion, campo, operador, valor) {
  var cuerpo = { structuredQuery: { from: [{ collectionId: coleccion }], where: { fieldFilter: { field: { fieldPath: campo }, op: operador, value: aValor_(valor) } }, limit: 50 } };
  var filas = fsFetch_(fsUrl_("") + ":runQuery", "POST", cuerpo) || [];
  return filas.filter(function (f) { return f.document; }).map(function (f) { return deFirestore_(f.document); });
}
// Conversión JS ⇄ tipos de Firestore
function aValor_(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(aValor_) } };
  if (typeof v === "object") return { mapValue: aFirestore_(v) };
  return { stringValue: String(v) };
}
function aFirestore_(obj) {
  var fields = {};
  Object.keys(obj).forEach(function (k) { if (obj[k] !== undefined) fields[k] = aValor_(obj[k]); });
  return { fields: fields };
}
function deValor_(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(deValor_);
  if ("mapValue" in v) return deFirestore_(v.mapValue);
  return null;
}
function deFirestore_(doc) {
  var obj = {};
  var fields = doc.fields || {};
  Object.keys(fields).forEach(function (k) { obj[k] = deValor_(fields[k]); });
  if (doc.name) obj.id = doc.name.split("/").pop();
  return obj;
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function sitio_(origen) {
  var s = PROPS.getProperty("SITE_URL") || origen || "";
  if (s && s.slice(-1) !== "/") s += "/";
  return s;
}
function enviarCorreo_(para, asunto, texto) {
  try { MailApp.sendEmail({ to: para, subject: asunto, body: texto, name: "AMARAM TV" }); }
  catch (e) { registrar_("ERROR correo", para, e.message); }
}
function formatoCOP_(n) { return "$" + Number(n || 0).toLocaleString("es-CO") + " COP"; }
function registrar_() { console.log(Array.prototype.slice.call(arguments).join(" · ")); }
function verificarConfig_() {
  return { MP_ACCESS_TOKEN: !!PROPS.getProperty("MP_ACCESS_TOKEN"), FIREBASE_PROJECT_ID: !!PROPS.getProperty("FIREBASE_PROJECT_ID"), SITE_URL: !!PROPS.getProperty("SITE_URL"), ADMIN_EMAIL: !!PROPS.getProperty("ADMIN_EMAIL") };
}

// ---------------------------------------------------------------------
// Pruebas manuales (ejecutar desde el editor: Ejecutar → función)
// ---------------------------------------------------------------------
function pruebaConfiguracion() {
  console.log(JSON.stringify(verificarConfig_()));
  console.log("Cursos en Firestore:", JSON.stringify(fsQuery_("courses", "published", "EQUAL", true).map(function (c) { return c.id + " $" + c.price; })));
}
function pruebaCrearPago() {
  // Cambia el uid por el de un usuario real de la colección users
  var r = crearPago_({ courseId: "montaje-smart-tv", uid: "PEGAR_UID", email: "test_user@testuser.com", name: "Prueba" });
  console.log(JSON.stringify(r));
}
