// =====================================================================
// AMARAM TV · Registro e inicio de sesión (Firebase Authentication)
// Correo/contraseña y Google. Al registrarse se crea el documento en
// users con role "student" (lo hace crearPerfilSiNoExiste en db.js).
// Si viene ?volver=pagina.html, regresa allí después de entrar.
// =====================================================================
import { $, parametro, aviso, sesionLista, usuarioActual } from "./app.js";
import { auth, fa, MODO_DEMO, crearPerfilSiNoExiste, actualizarPerfil } from "./db.js";

const volver = parametro("volver") || "mis-cursos.html";
const mensaje = $("#mensaje");
const tabEntrar = $("#tab-entrar"), tabRegistro = $("#tab-registro");
const formEntrar = $("#form-entrar"), formRegistro = $("#form-registro");

function mostrar(texto, tipo = "error") { mensaje.hidden = false; mensaje.className = `mensaje mensaje--${tipo} mt-3`; mensaje.textContent = texto; }
function cambiarPestana(registro) {
  tabEntrar.setAttribute("aria-selected", String(!registro)); tabRegistro.setAttribute("aria-selected", String(registro));
  formEntrar.hidden = registro; formRegistro.hidden = !registro; mensaje.hidden = true;
  $("#titulo-acceso").textContent = registro ? "Crear cuenta" : "Entrar";
}
tabEntrar.addEventListener("click", () => cambiarPestana(false));
tabRegistro.addEventListener("click", () => cambiarPestana(true));
if (parametro("registro") === "1") cambiarPestana(true);

const ERRORES = {
  "auth/invalid-email": "El correo no es válido.",
  "auth/user-not-found": "No existe una cuenta con ese correo. ¿Quieres crearla?",
  "auth/wrong-password": "La contraseña no es correcta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Intenta entrar.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase → Authentication → Configuración → Dominios autorizados.",
  "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
  "auth/network-request-failed": "Sin conexión. Revisa tu internet."
};
const traducir = (err) => ERRORES[err.code] || `Ocurrió un error (${err.code || err.message}).`;

if (MODO_DEMO) {
  $("#mensaje-demo").hidden = false;
  [formEntrar, formRegistro].forEach(f => f.addEventListener("submit", e => { e.preventDefault(); aviso("Modo demo: configura Firebase para activar las cuentas.", "error"); }));
  $("#boton-google").addEventListener("click", () => aviso("Modo demo: configura Firebase para activar las cuentas.", "error"));
} else {
  // Si ya hay sesión, no tiene sentido quedarse aquí
  sesionLista.then(u => { if (u) location.replace(volver); });

  const entrar = async () => { await crearPerfilSiNoExiste(auth.currentUser); location.href = volver; };

  formEntrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(formEntrar));
    try { await fa.signInWithEmailAndPassword(auth, email.trim(), password); await entrar(); }
    catch (err) { mostrar(traducir(err)); }
  });

  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { name, email, password } = Object.fromEntries(new FormData(formRegistro));
    if (!$("#consent-r").checked) return mostrar("Debes aceptar los términos y la política de datos.");
    if ((name || "").trim().length < 3) return mostrar("Escribe tu nombre completo.");
    try {
      const cred = await fa.createUserWithEmailAndPassword(auth, email.trim(), password);
      await fa.updateProfile(cred.user, { displayName: name.trim() });
      await crearPerfilSiNoExiste({ ...cred.user, displayName: name.trim() });
      await actualizarPerfil(cred.user.uid, { name: name.trim() });
      location.href = volver;
    } catch (err) { mostrar(traducir(err)); }
  });

  $("#boton-google").addEventListener("click", async () => {
    try { await fa.signInWithPopup(auth, new fa.GoogleAuthProvider()); await entrar(); }
    catch (err) { mostrar(traducir(err)); }
  });

  $("#boton-recuperar").addEventListener("click", async () => {
    const email = $("#correo-e").value.trim();
    if (!email) return mostrar("Escribe tu correo arriba y vuelve a presionar «Olvidé mi contraseña».", "alerta");
    try { await fa.sendPasswordResetEmail(auth, email); mostrar("Te enviamos un correo para restablecer la contraseña.", "exito"); }
    catch (err) { mostrar(traducir(err)); }
  });
}
