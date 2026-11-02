# AMARAM TV · Plataforma de cursos (LMS + CRM + recursos)

> Proyecto del semestre · E-Business · Diseño Digital
> **Enlace público:** https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/ · **Video demo (3 min):** _[pendiente]_

**AMARAM TV** vende cursos en línea sobre **instalación de aires acondicionados Mini Split** y **montaje profesional de Smart TVs**. Esta plataforma presenta y vende los cursos, cobra con Mercado Pago, abre el aula automáticamente a quien pagó, registra a cada interesado en un CRM y organiza los recursos (instructores, materiales, horarios y costos) de cada curso.

## Qué incluye
| Módulo | Pantallas | Estado |
|---|---|---|
| **Sitio público** | Inicio, catálogo con filtros, detalle del curso con temario, formulario "Quiero más información", legales | ✅ |
| **Cuentas** | Registro e inicio de sesión (correo y Google), perfil, roles estudiante/admin | ✅ |
| **Aula virtual (LMS)** | Mis cursos con progreso, lección con video (YouTube) y material (Drive), marcar completada, certificado | ✅ |
| **Pagos y paywall** | Botón Comprar → Mercado Pago Checkout Pro → webhook en Apps Script → inscripción automática | ✅ |
| **CRM** | Contactos, embudo Nuevo → Contactado → Interesado → Cliente → Perdido, notas de seguimiento, correo de bienvenida | ✅ |
| **Recursos** | Instructores, recursos y costos por curso, calendario de sesiones | ✅ |
| **Reportes** | Ventas, inscritos, conversión, avance promedio, margen por curso | ✅ |

## Ruta tecnológica (Ruta A)
- **Frontend:** HTML, CSS y JavaScript puro (módulos ES, sin frameworks ni bundler). Celular primero.
- **Login y base de datos:** Firebase Authentication + Cloud Firestore (plan Spark, $0).
- **Backend y pagos:** Google Apps Script como aplicación web + Mercado Pago (modo prueba).
- **Videos y archivos:** YouTube (no listados) y Google Drive.
- **Publicación:** GitHub Pages desde `main`.
- **Modo demo:** mientras `js/firebase-config.js` tenga los valores `REEMPLAZAR_…`, la plataforma muestra los cursos de `js/datos.js` sin login ni pagos, para que el enlace funcione desde el Sprint 1.

## Estructura
```
index.html  cursos.html  curso.html  login.html  mis-cursos.html  leccion.html  perfil.html  admin.html  pago.html  legales.html
css/estilos.css            guía de estilo: variables de marca y componentes
js/app.js                  header, footer, sesión y utilidades comunes
js/db.js                   única capa de acceso a Firestore (con respaldo en datos.js)
js/datos.js                cursos, lecciones e instructores de AMARAM TV (semilla y modo demo)
js/firebase-config.js      configuración pública de Firebase y URL de Apps Script
js/auth.js · cursos.js · curso.js · mis-cursos.js · leccion.js · perfil.js · pago.js · pagos.js · componentes.js
js/admin*.js               panel: reportes, cursos, lecciones, inscripciones, usuarios, CRM, instructores, recursos, calendario
backend/Code.gs            Apps Script: crear pago, webhook, verificación, correos (copia del código en script.google.com)
firestore.rules            reglas de seguridad (paywall, roles)
docs/                      equipo, cursos, modelo de datos, mapa del sitio, guía de estilo, bitácora de IA, actas, pruebas, seguridad, despliegue, backlog
scripts/crear-issues.sh    crea los 59 Issues del backlog con Milestones por sprint
CONTEXTO.md                memoria del proyecto para la IA y el equipo
```

## Cómo ponerlo en marcha (equipo)
1. **Publicar:** Settings → Pages → `main` / root ([docs/despliegue.md](docs/despliegue.md)).
2. **Firebase:** crear proyecto, activar Authentication y Firestore, pegar `firebaseConfig`, publicar `firestore.rules`, cargar el inventario desde Admin ([docs/firebase.md](docs/firebase.md)).
3. **Pagos:** crear el script en Apps Script, poner el Access Token de Mercado Pago en Propiedades del script, publicar como aplicación web y pegar la URL `/exec` ([backend/README.md](backend/README.md)).
4. **Contenido:** subir videos y materiales y pegar los enlaces en Admin → Lecciones.
5. **Tablero:** `bash scripts/crear-issues.sh` y crear el Board en Projects.

Para probar en el computador: `python3 -m http.server 8000` y abre `http://localhost:8000` (no uses doble clic sobre los `.html`).

## Flujo completo (lo que se evalúa)
Visita → deja sus datos (lead `nuevo`) → se registra (`users`) → compra en Mercado Pago → el webhook crea `payments` y `enrollments` y pasa el lead a `cliente` → entra al aula → completa lecciones (`progress`) → certificado. El administrador ve todo en `admin.html`.

## Equipo
| Integrante | Rol |
|---|---|
| Abraham David Martínez Calderón | Líder del proyecto (Scrum Master / Product Owner) |
| Andrés Camilo Mercado Marín | Mercadeo (Frontend / CRM) · instructor |
| Andrés Romero | Publicidad (Diseño UX / UI) · instructor |

Trabajo ágil: sprints de 1–2 semanas, Issues + GitHub Projects, ramas por tarea y Pull Requests revisados. Desarrollo con IA documentado en [docs/bitacora-ia.md](docs/bitacora-ia.md).

## Seguridad
Ninguna clave secreta está en este repositorio: el Access Token de Mercado Pago vive solo en las Propiedades del script de Apps Script. La configuración de Firebase es pública por diseño; el acceso lo controlan `firestore.rules` y los dominios autorizados. Lista de verificación en [docs/seguridad.md](docs/seguridad.md).

## Licencia
Código bajo licencia MIT. El contenido de los cursos (videos, materiales, textos) es propiedad de AMARAM TV y sus instructores.
