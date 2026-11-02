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
  apiKey: "AIzaSyAXdLMCkaWtAPLx3BTSrbqXmuHBQ0v5CzY",
  authDomain: "amaram-tv-95758.firebaseapp.com",
  projectId: "amaram-tv-95758",
  storageBucket: "amaram-tv-95758.firebasestorage.app",
  messagingSenderId: "1094175294943",
  appId: "1:1094175294943:web:2b46f95af63d66bc36706a"
};

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyqd1SGe_liB-J61ZdQJGLVgC2AWubrooDQFnkPm0dseWiGvVYWxEs55l0AxYsDx_s-/exec";

// Correo de contacto y WhatsApp del negocio (se muestran en el footer y en la landing)
export const NEGOCIO = {
  nombre: "AMARAM TV",
  correo: "andresdromero6@gmail.com",
  whatsapp: "573115537611",            // indicativo 57 + número, sin + ni espacios
  ciudad: "Colombia"
};

export const MODO_DEMO = firebaseConfig.projectId.startsWith("REEMPLAZAR");
export const PAGOS_ACTIVOS = !APPS_SCRIPT_URL.startsWith("REEMPLAZAR");
