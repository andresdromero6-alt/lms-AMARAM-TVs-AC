/**
 * =====================================================================
 * AMARAM TV · Backend en Google Apps Script
 * ---------------------------------------------------------------------
 * Qué hace:
 *  1. crearPago     → construye el enlace de Wompi Checkout Web con la firma de integridad y lo devuelve.
 *  2. webhook       → recibe el evento transaction.updated de Wompi, verifica el checksum, CONSULTA la
 *                     transacción por su ID y, solo si está APPROVED, crea payments + enrollments en
 *                     Firestore y pasa el lead a "cliente".
 *  3. verificarPago → la página pago.html lo llama al volver de Wompi (?id=…) como respaldo del webhook.
 *  4. nuevoLead     → envía el correo de bienvenida cuando alguien llena el formulario.
 *
 * Cómo escribe en Firestore: con la API REST y el token OAuth de la cuenta dueña del proyecto
 * (ScriptApp.getOAuthToken). Por eso este script debe crearse con la MISMA cuenta de Google que
 * creó el proyecto de Firebase, y las reglas de Firestore no aplican a estas escrituras.
 *
 * Secretos: SOLO en Configuración del proyecto → Propiedades del script:
 *   WOMPI_PUBLIC_KEY        llave pública (pub_test_… en pruebas, pub_prod_… en producción)
 *   WOMPI_INTEGRITY_SECRET  secreto de integridad (test_integrity_… / prod_integrity_…)
 *   WOMPI_EVENTS_SECRET     secreto de eventos para verificar el webhook (test_events_… / prod_events_…)
 *   WOMPI_ENV               "test" (sandbox) o "prod"
 *   FIREBASE_PROJECT_ID     ID del proyecto de Firebase (ej. amaram-tv-95758)
 *   SITE_URL                URL publicada, con / al final
 *   ADMIN_EMAIL             correo que recibe copia de cada venta (opcional)
 *
 * Publicar: Implementar → Nueva implementación → Aplicación web → Ejecutar como: yo → Acceso: cualquier usuario.
 * Cada vez que cambies el código: Implementar → Administrar implementaciones → editar → Versión: nueva.
 * Ver backend/README.md para el paso a paso y las pruebas.
 * =====================================================================
 */

var PROPS = PropertiesService.getScriptProperties();

// ---------------------------------------------------------------------
// Puntos de entrada
// ---------------------------------------------------------------------
function doGet(e) {
  return respuesta_({ ok: true, servicio: "AMARAM TV backend", pasarela: "Wompi", hora: new Date().toISOString(), config: verificarConfig_() });
}

function doPost(e) {
  try {
    var params = (e && e.parameter) || {};
    var cuerpo = {};
    try { cuerpo = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}; } catch (err) { cuerpo = {}; }

    // 1) ¿Es un evento (webhook) de Wompi?  Llega como JSON { event: "transaction.updated", data: { transaction: {...} }, signature: {...}, timestamp }
    if (cuerpo.event && cuerpo.data && cuerpo.data.transaction) return manejarWebhook_(cuerpo);

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
// 1. Crear pago (enlace de Wompi Checkout Web con firma de integridad)
// ---------------------------------------------------------------------
function crearPago_(d) {
  if (!d.courseId || !d.uid || !d.email) throw new Error("Faltan datos: courseId, uid y email son obligatorios.");
  var curso = fsGet_("courses/" + d.courseId);
  if (!curso) throw new Error("El curso no existe: " + d.courseId);
  if (curso.published === false) throw new Error("El curso no está publicado.");
  var precio = Math.round(Number(curso.price));
  if (!(precio > 0)) throw new Error("El curso no tiene un precio válido.");

  // Si ya está inscrito, no cobrar dos veces
  var inscripcion = fsGet_("enrollments/" + d.uid + "_" + d.courseId);
  if (inscripcion && inscripcion.status === "active") throw new Error("Ya tienes acceso a este curso.");

  var publicKey = PROPS.getProperty("WOMPI_PUBLIC_KEY");
  var integridad = PROPS.getProperty("WOMPI_INTEGRITY_SECRET");
  if (!publicKey || !integridad) throw new Error("Faltan WOMPI_PUBLIC_KEY o WOMPI_INTEGRITY_SECRET en Propiedades del script.");

  // Referencia única y legible: uid|curso|marca de tiempo (Wompi exige referencia única por transacción)
  var referencia = d.uid + "|" + d.courseId + "|" + Date.now();
  var centavos = String(precio * 100);
  var moneda = "COP";
  var firma = sha256_(referencia + centavos + moneda + integridad);
  var redirect = sitio_(d.origen) + "pago.html?curso=" + encodeURIComponent(d.courseId);

  var url = "https://checkout.wompi.co/p/?public-key=" + encodeURIComponent(publicKey) +
    "&currency=" + moneda +
    "&amount-in-cents=" + centavos +
    "&reference=" + encodeURIComponent(referencia) +
    "&signature:integrity=" + firma +
    "&redirect-url=" + encodeURIComponent(redirect) +
    "&customer-data:email=" + encodeURIComponent(d.email) +
    (d.name ? "&customer-data:full-name=" + encodeURIComponent(d.name) : "");

  // Guardamos la intención de pago para poder verificarla por referencia aunque el webhook no llegue
  fsSet_("payments/ref_" + firma.slice(0, 20), { reference: referencia, userId: d.uid, courseId: d.courseId, email: d.email, amount: precio, status: "CREATED", date: new Date().toISOString(), paymentId: "", updatedAt: new Date().toISOString() });
  registrar_("Enlace de pago creado", referencia, d.uid, d.courseId);
  return { ok: true, reference: referencia, init_point: url };
}

// ---------------------------------------------------------------------
// 2. Webhook de Wompi (evento transaction.updated)
// ---------------------------------------------------------------------
function manejarWebhook_(cuerpo) {
  var tx = cuerpo.data.transaction;
  registrar_("Webhook recibido", cuerpo.event, tx.id, tx.status);
  if (cuerpo.event !== "transaction.updated") return respuesta_({ ok: true, ignorado: true });

  // Verificar el checksum: SHA256(valores de signature.properties en orden + timestamp + secreto de eventos)
  var secreto = PROPS.getProperty("WOMPI_EVENTS_SECRET");
  if (secreto && cuerpo.signature && cuerpo.signature.checksum) {
    var cadena = (cuerpo.signature.properties || []).map(function (p) { return String(leerRuta_(cuerpo.data, p)); }).join("") + String(cuerpo.timestamp) + secreto;
    var esperado = sha256_(cadena).toUpperCase();
    if (esperado !== String(cuerpo.signature.checksum).toUpperCase()) {
      registrar_("Webhook con firma inválida", tx.id);
      return respuesta_({ ok: false, error: "Firma inválida" });
    }
  }
  try {
    var resultado = procesarPago_(tx.id);
    return respuesta_({ ok: true, resultado: resultado });
  } catch (err) {
    registrar_("ERROR webhook", err.message);
    return respuesta_({ ok: false, error: err.message });
  }
}
function leerRuta_(obj, ruta) { return String(ruta).split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }

/** Página de regreso: Wompi vuelve con ?id=<transacción>. Verifica por ID o busca la última referencia del usuario. */
function verificarPago_(d) {
  if (d.paymentId) return { ok: true, resultado: procesarPago_(d.paymentId) };
  if (d.uid && d.courseId) {
    var pagos = fsQuery_("payments", "userId", "EQUAL", d.uid).filter(function (p) { return p.courseId === d.courseId; });
    var aprobado = pagos.filter(function (p) { return p.status === "APPROVED"; })[0];
    if (aprobado && aprobado.paymentId) return { ok: true, resultado: procesarPago_(aprobado.paymentId) };
    return { ok: true, resultado: { estado: pagos.length ? pagos[pagos.length - 1].status : "sin_pago" } };
  }
  throw new Error("Indica paymentId o uid + courseId.");
}

/**
 * Consulta la transacción en Wompi (NUNCA confiar solo en el evento) y, si está APPROVED,
 * crea payments/{id} y enrollments/{uid}_{courseId}. Es idempotente: si llega dos veces, no duplica.
 */
function procesarPago_(transactionId) {
  var r = wompi_("GET", "/transactions/" + encodeURIComponent(transactionId));
  var tx = r.data || r;
  var ref = String(tx.reference || "").split("|");
  var uid = ref[0], courseId = ref[1];
  if (!uid || !courseId) throw new Error("La transacción " + transactionId + " no trae referencia de usuario y curso.");
  var email = tx.customer_email || (tx.customer_data && tx.customer_data.email) || "";
  var monto = Math.round(Number(tx.amount_in_cents || 0) / 100);

  // Registrar la transacción (cualquier estado) para el reporte. Estados: APPROVED, DECLINED, PENDING, VOIDED, ERROR
  fsSet_("payments/" + tx.id, {
    paymentId: String(tx.id), reference: tx.reference || "", status: tx.status, statusMessage: tx.status_message || "",
    amount: monto, currency: tx.currency || "COP", userId: uid, courseId: courseId, email: email,
    paymentMethod: (tx.payment_method_type || "") , date: tx.finalized_at || tx.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (tx.status !== "APPROVED") return { estado: tx.status, paymentId: tx.id };

  var idIns = uid + "_" + courseId;
  var existente = fsGet_("enrollments/" + idIns);
  if (existente && existente.status === "active" && existente.paymentId === String(tx.id)) return { estado: "APPROVED", yaProcesado: true, paymentId: tx.id };

  fsSet_("enrollments/" + idIns, {
    userId: uid, courseId: courseId, status: "active", paymentId: String(tx.id), amount: monto,
    source: "wompi", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  });
  if (email) pasarLeadACliente_(email, uid);

  var curso = fsGet_("courses/" + courseId) || { title: courseId };
  if (email) enviarCorreo_(email, "¡Tu curso está listo! · " + curso.title,
    "Hola,\n\nRecibimos tu pago (" + tx.id + ") por " + formatoCOP_(monto) + ". Ya tienes acceso a \"" + curso.title + "\".\n\n" +
    "Entra con tu cuenta y ve a Mis cursos: " + sitio_() + "mis-cursos.html\n\n¡Éxitos!\nEquipo AMARAM TV");
  var admin = PROPS.getProperty("ADMIN_EMAIL");
  if (admin) enviarCorreo_(admin, "Nueva venta · " + curso.title, "Transacción " + tx.id + " aprobada por " + formatoCOP_(monto) + ".\nComprador: " + email + "\nUsuario: " + uid + "\nCurso: " + courseId);
  registrar_("Inscripción creada", idIns, tx.id);
  return { estado: "APPROVED", paymentId: tx.id, enrollmentId: idIns };
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
// Wompi · cliente HTTP y firma
// ---------------------------------------------------------------------
function wompiApi_() { return (PROPS.getProperty("WOMPI_ENV") || "test") === "prod" ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1"; }
function wompi_(metodo, ruta, cuerpo) {
  var opciones = { method: metodo, headers: { "Content-Type": "application/json", Authorization: "Bearer " + (PROPS.getProperty("WOMPI_PUBLIC_KEY") || "") }, muteHttpExceptions: true };
  if (cuerpo) opciones.payload = JSON.stringify(cuerpo);
  var resp = UrlFetchApp.fetch(wompiApi_() + ruta, opciones);
  var codigo = resp.getResponseCode();
  var json = {};
  try { json = JSON.parse(resp.getContentText()); } catch (e) { json = { raw: resp.getContentText() }; }
  if (codigo >= 300) throw new Error("Wompi " + codigo + ": " + ((json.error && (json.error.reason || json.error.type)) || resp.getContentText()).slice(0, 300));
  return json;
}
function sha256_(texto) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join("");
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
  return { WOMPI_PUBLIC_KEY: !!PROPS.getProperty("WOMPI_PUBLIC_KEY"), WOMPI_INTEGRITY_SECRET: !!PROPS.getProperty("WOMPI_INTEGRITY_SECRET"), WOMPI_EVENTS_SECRET: !!PROPS.getProperty("WOMPI_EVENTS_SECRET"), WOMPI_ENV: PROPS.getProperty("WOMPI_ENV") || "test", FIREBASE_PROJECT_ID: !!PROPS.getProperty("FIREBASE_PROJECT_ID"), SITE_URL: !!PROPS.getProperty("SITE_URL"), ADMIN_EMAIL: !!PROPS.getProperty("ADMIN_EMAIL") };
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
  var r = crearPago_({ courseId: "montaje-smart-tv", uid: "PEGAR_UID", email: "prueba@amaramtv.co", name: "Prueba" });
  console.log(JSON.stringify(r));
}
