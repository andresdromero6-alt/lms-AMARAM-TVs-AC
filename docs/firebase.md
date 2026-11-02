# Configurar Firebase (Sprint 2) · paso a paso

Tiempo estimado: 30 minutos. Lo hace el rol **Datos y backend** con la cuenta de Google del equipo.

## 1. Crear el proyecto y registrar la app web
1. Entra a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar proyecto** → nombre `amaram-tv` → puedes desactivar Google Analytics → **Crear**.
2. En la pantalla principal del proyecto, haz clic en el ícono **`</>`** (app web) → apodo `AMARAM TV web` → **no** marques Firebase Hosting → **Registrar app**.
3. Copia el bloque `firebaseConfig` y pégalo en `js/firebase-config.js` reemplazando los valores `REEMPLAZAR_...`.
   Estos datos pueden ser públicos; la seguridad la dan las reglas (paso 3) y los dominios autorizados (paso 2).
4. Haz commit: `Conecta la app con Firebase`.

## 2. Activar Authentication
1. Menú **Compilación → Authentication → Comenzar**.
2. Pestaña **Método de acceso** → habilita **Correo electrónico/contraseña** y **Google** (en Google pon el correo de soporte del equipo).
3. Pestaña **Configuración → Dominios autorizados → Agregar dominio**: `andresdromero6-alt.github.io`. (`localhost` ya viene incluido.)

## 3. Crear Firestore y publicar las reglas
1. Menú **Compilación → Firestore Database → Crear base de datos** → ubicación `southamerica-east1` o `us-central1` → **modo producción** → Crear.
2. Pestaña **Reglas** → borra todo, pega el contenido de [`firestore.rules`](../firestore.rules) → **Publicar**.
3. Pestaña **Índices**: Firestore pedirá índices compuestos la primera vez que el panel consulte `progress` por `userId` + `courseId`. Cuando veas el error `The query requires an index` en la consola del navegador, haz clic en el enlace que trae el error y crea el índice (tarda 1–2 min).

## 4. Cargar los cursos del inventario
Opción fácil (recomendada):
1. Regístrate en la plataforma publicada con el correo del equipo.
2. En Firestore → colección `users` → tu documento → cambia `role` de `student` a `admin`.
3. Recarga la plataforma: aparece **Admin** en el menú. Entra a **Admin → Cursos → "Cargar inventario de ejemplo"**. Eso crea en Firestore los 2 cursos, las 16 lecciones y los 2 instructores definidos en `js/datos.js`.
4. Luego edita cada lección en el panel para pegar su `videoUrl` (YouTube no listado) y `materialUrl` (Drive).

Opción manual: crear los documentos a mano en la consola siguiendo `docs/modelo-de-datos.md`.

## 5. Probar ("listo cuando")
- [ ] Una persona nueva se registra desde el enlace publicado y aparece en `users` con `role: student`.
- [ ] El catálogo muestra los cursos desde Firestore: cambiar un precio en la consola se refleja en la página.
- [ ] El formulario "Quiero más información" crea un documento en `leads` con `stage: nuevo`.
- [ ] Un estudiante que abre `admin.html` es redirigido al inicio.
- [ ] Un visitante sin sesión no puede escribir en `courses` (prueba en la pestaña Reglas → "Simulador de reglas").

## Errores comunes
| Error en la consola | Solución |
|---|---|
| `auth/unauthorized-domain` | Agrega el dominio de GitHub Pages en Authentication → Configuración → Dominios autorizados. |
| `Missing or insufficient permissions` | Las reglas bloquean la operación. Verifica que publicaste `firestore.rules` y que tu usuario tiene `role: admin` si es una acción de administrador. |
| `The query requires an index` | Haz clic en el enlace del error para crear el índice. |
| `auth/configuration-not-found` | No activaste el método de acceso en Authentication. |
