# Contexto del proyecto · AMARAM TV

> Pega este archivo completo al inicio de cada conversación nueva con la IA.
> Actualízalo al final de cada sprint (sección "Ya funciona" y "Estamos trabajando en").

## Emprendimiento
- **AMARAM TV** — vende cursos en línea sobre instalación de aires acondicionados Mini Split y montaje profesional de Smart TVs, dirigidos a jóvenes, emprendedores y técnicos en formación en Colombia.

## Cursos
| ID | Curso | Precio (COP) | Nivel | Instructor |
|----|-------|--------------|-------|------------|
| `montaje-smart-tv` | Montaje Profesional de Smart TVs | $90.000 | Básico / Principiante | Andrés David Romero Fernández |
| `mini-split-smart-tv` | Instalación de Aires Mini Split + Smart TVs (Paquete Completo) | $150.000 | Avanzado / Profesional | Andrés Camilo Mercado Marín |

Detalle completo (módulos y lecciones) en `docs/cursos.md`.

## Ruta tecnológica (Ruta A)
- **Frontend:** HTML, CSS y JavaScript puro (sin frameworks, sin bundler). Módulos ES (`<script type="module">`).
- **Login:** Firebase Authentication (correo/contraseña y Google).
- **Base de datos:** Cloud Firestore (10 colecciones, ver `docs/modelo-de-datos.md`).
- **Backend y pagos:** Google Apps Script publicado como aplicación web (`/backend/Code.gs`) + **Wompi Checkout Web** (Bancolombia) en modo sandbox.
- **Videos y materiales:** YouTube (no listados) y Google Drive. Nunca Cloud Storage ni Cloud Functions (exigen plan Blaze).
- **Publicación:** GitHub Pages desde la rama `main`, carpeta `/ (root)`.

## Publicación
- Repositorio: https://github.com/andresdromero6-alt/lms-AMARAM-TVs-AC
- Enlace público: https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/

## Marca
- Colores: azul oscuro `#0B1F3A` (fondo/encabezados), blanco `#FFFFFF`, aguamarina `#2EC4B6` (acento principal), aguamarina claro `#7EE8DC`, azul medio `#15325C`.
- Tipografía: **Futura** (con respaldo `Jost` desde Google Fonts, luego `Century Gothic`, `sans-serif`).
- Tono: cercano, directo, técnico pero sin tecnicismos innecesarios. Se habla de "tú".
- Todas las variables de marca viven en `css/estilos.css` (`:root`).

## Estructura de carpetas
```
/index.html          Inicio (landing)            /js/app.js             Header, sesión, utilidades comunes
/cursos.html         Catálogo                    /js/datos.js           Cursos de ejemplo (modo demo sin Firebase)
/curso.html          Detalle del curso           /js/firebase-config.js Configuración pública de Firebase
/login.html          Registro e inicio de sesión /js/db.js              Acceso a Firestore con respaldo en datos.js
/mis-cursos.html     Panel del estudiante        /js/auth.js            Registro, login, Google, logout
/leccion.html        Aula (lección)              /js/cursos.js …        Un archivo JS por pantalla
/perfil.html         Mi perfil                   /css/estilos.css       Guía de estilo (variables, componentes)
/admin.html          Panel admin (cursos, CRM…)  /backend/Code.gs       Apps Script: pagos, webhook, correos
/pago.html           Resultado del pago          /firestore.rules       Reglas de seguridad de Firestore
/legales.html        Política de datos, T&C      /docs/                 Actas, bitácora de IA, wireframes, backlog
```

## Modo demo
Si `js/firebase-config.js` todavía tiene los valores `REEMPLAZAR_...`, la plataforma funciona en **modo demo**: el catálogo lee `js/datos.js`, el login no está disponible y el botón Comprar muestra un aviso. Así el enlace de GitHub Pages funciona desde el Sprint 1.

## Ya funciona
- Sprint 0: repositorio, estructura, inventario de cursos, modelo de datos, backlog → Issues (`scripts/crear-issues.sh`).
- Sprint 1: guía de estilo, inicio, catálogo con filtros, detalle con temario, formulario de interés, legales. Modo demo.
- Sprint 2: login/registro (correo y Google), header con sesión, `firestore.rules`, leads en Firestore.
- Sprint 3: Mis cursos con progreso, aula con video/material/completar, perfil con certificado, panel admin (cursos, lecciones, inscripciones, usuarios).
- Sprint 4: Apps Script + Wompi (preferencia, webhook, verificación), `pago.html`, CRM con tabla/embudo/notas, correos.
- Sprint 5: instructores, recursos y costos, calendario, reportes, documentación de pruebas, seguridad y despliegue.

## Pendiente del equipo (no lo puede hacer la IA)
- Configurar Firebase y pegar `firebaseConfig` (`docs/firebase.md`).
- Crear el proyecto de Apps Script, propiedades del script y pegar `APPS_SCRIPT_URL` (`backend/README.md`).
- Subir videos (YouTube no listado) y materiales (Drive) y pegar los enlaces en Admin → Lecciones.
- Activar GitHub Pages, crear el tablero de Projects y correr `scripts/crear-issues.sh`.
- Prueba con 5 usuarios reales, video demo de 3 minutos, Demo Day.

## Estamos trabajando en
- Sprint 5: lanzamiento (configuración de cuentas, contenido real y pruebas con usuarios).

## Reglas para la IA
1. Responde en español.
2. Explica cada archivo que crees o modifiques en 5 líneas.
3. No uses librerías ni frameworks sin preguntar. Firebase se carga desde el CDN oficial (`gstatic.com/firebasejs`).
4. Entrega archivos completos, no fragmentos.
5. Diseño responsive, celular primero. Usa las variables CSS de la marca.
6. Nunca pongas claves secretas en el código: el secretos de Wompi (integridad y eventos) va solo en Propiedades del script de Apps Script.
7. Nada de testimonios, cifras ni logos inventados. Los textos de ejemplo se marcan como `[EJEMPLO]`.
8. Usa IDs predecibles en Firestore: inscripción = `${uid}_${courseId}`, progreso = `${uid}_${lessonId}`.
