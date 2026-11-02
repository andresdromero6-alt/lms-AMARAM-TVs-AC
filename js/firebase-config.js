// =====================================================================
// AMARAM TV · Configuración pública
//
// 1) Firebase: en console.firebase.google.com → tu proyecto → ⚙ Configuración
//    del proyecto → "Tus apps" → ícono </> (app web) → copia el bloque
//    firebaseConfig y reemplaza los valores de abajo.
//    Estos datos PUEDEN ser públicos: la seguridad la dan las reglas de
//    Firestore (firestore.rules) y los dominios autorizados en Authentication.
//
// 2) APPS_SCRIPT_URL: la URL que termina en /exec de la aplicación web de
//    Apps Script (ver backend/README.md). Sin ella el botón Comprar no funciona.
//
// Mientras los valores digan REEMPLAZAR_..., la plataforma corre en MODO DEMO
// con los datos de js/datos.js (sin login ni pagos).
// =====================================================================

export const firebaseConfig = {
  apiKey: "REEMPLAZAR_API_KEY",
  authDomain: "REEMPLAZAR_PROYECTO.firebaseapp.com",
  projectId: "REEMPLAZAR_PROYECTO",
  storageBucket: "REEMPLAZAR_PROYECTO.appspot.com",
  messagingSenderId: "REEMPLAZAR_SENDER_ID",
  appId: "REEMPLAZAR_APP_ID"
};

export const APPS_SCRIPT_URL = "REEMPLAZAR_URL_EXEC_DE_APPS_SCRIPT";

// Correo de contacto y WhatsApp del negocio (se muestran en el footer y en la landing)
export const NEGOCIO = {
  nombre: "AMARAM TV",
  correo: "contacto@amaramtv.co",      // [EJEMPLO] reemplazar por el correo real
  whatsapp: "573000000000",            // [EJEMPLO] número con indicativo, sin + ni espacios
  ciudad: "Colombia"
};

export const MODO_DEMO = firebaseConfig.projectId.startsWith("REEMPLAZAR");
export const PAGOS_ACTIVOS = !APPS_SCRIPT_URL.startsWith("REEMPLAZAR");
