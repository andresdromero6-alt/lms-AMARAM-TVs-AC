# Bitácora de IA · AMARAM TV

Registro de cómo se usó la inteligencia artificial en cada sprint: qué se pidió, con qué herramienta, qué resultó y qué hubo que corregir. Es evidencia para la rúbrica "Desarrollo con IA" (15 %). **Cada integrante agrega sus propias entradas** con el formato de abajo.

Formato de cada entrada:
```
### [Sprint] · [fecha] · [integrante] · [herramienta]
**Pedí:** (resumen del prompt; pega el prompt completo si es clave)
**Resultado:** qué entregó la IA
**Corregí / aprendí:** qué falló, qué tuve que cambiar, qué entendí
```

---

## Sprint 0 · Preparar el terreno

### Sprint 0 · 2026-11-02 · Equipo · Claude (chat con acceso al repositorio)
**Pedí:** "Hay que desarrollar todo en un GitHub repository", adjuntando la guía paso a paso, la presentación del proyecto y el backlog en Excel. Luego respondí sus preguntas: alcance completo, ruta A (Firestore + Apps Script), pasarela Mercado Pago, y pegué la marca (AMARAM TV, azul oscuro/blanco/aguamarina, Futura), los dos cursos con módulos y lecciones, y los integrantes.
**Resultado:** la IA leyó los tres documentos, propuso la estructura del repositorio según la guía (`/css /js /img /backend /docs`), escribió `CONTEXTO.md`, el acta del equipo, el inventario de cursos, el modelo de datos de 10 colecciones y exportó el backlog a CSV/Markdown con un script (`scripts/crear-issues.sh`) que crea los 59 Issues con Milestones.
**Corregí / aprendí:** la IA no puede crear el repositorio en nuestra cuenta: lo creamos nosotros en GitHub y lo conectamos. Antes de construir preguntó cuatro cosas (alcance, ruta, pasarela, datos reales) en lugar de inventar; eso evitó rehacer trabajo.

## Sprint 1 · Diseñar y maquetar

### Sprint 1 · 2026-11-02 · Equipo · Claude
**Pedí:** guía de estilo con los colores de la marca y las pantallas inicio, catálogo y detalle, celular primero, sin frameworks, con formulario "Quiero más información" que valide nombre, correo y casilla de autorización de datos.
**Resultado:** `css/estilos.css` con variables en `:root`, `index.html`, `cursos.html`, `curso.html`, `legales.html`, `js/datos.js` con los 2 cursos y 16 lecciones, y un **modo demo** que hace que GitHub Pages funcione antes de configurar Firebase.
**Corregí / aprendí:** Futura no es una fuente web gratuita; la IA puso `Jost` de Google Fonts como respaldo con la misma forma geométrica. Pedimos que ningún testimonio ni cifra fuera inventado: las secciones de "Quiénes somos" usan solo nombres reales del equipo y la FAQ describe nuestra política real.

## Sprint 2 · Usuarios y datos

### Sprint 2 · 2026-11-02 · Equipo · Claude
**Pedí:** registro e inicio de sesión con correo y Google, documento en `users` con `role: student`, header que cambie con la sesión, reglas de Firestore según el modelo de datos.
**Resultado:** `login.html` + `js/auth.js` con mensajes de error traducidos, `js/db.js` como única capa de acceso a Firestore (con respaldo en datos de ejemplo), `firestore.rules` con paywall en `lessons` y bloqueo para que un estudiante no se cambie el rol, y `docs/firebase.md` con el paso a paso.
**Corregí / aprendí:** las claves de `firebaseConfig` pueden ser públicas; la seguridad está en las reglas y los dominios autorizados. El SDK se carga desde `gstatic.com` sin bundler usando `import()` dentro de un módulo ES.

## Sprint 3 · Aula virtual

### Sprint 3 · 2026-11-02 · Equipo · Claude
**Pedí:** Mis cursos con barra de progreso (= completadas ÷ total), pantalla de lección con video de YouTube no listado, material de Drive, anterior/siguiente y "Marcar como completada" que persista; panel admin para cursos, lecciones e inscripción manual.
**Resultado:** `mis-cursos.html`, `leccion.html`, `perfil.html` (con certificado imprimible al 100 %) y `admin.html` con pestañas cargadas bajo demanda. Incluye el botón "Cargar inventario de ejemplo" que siembra Firestore desde `js/datos.js`.
**Corregí / aprendí:** la primera versión del panel acumulaba oyentes de clic al cambiar de pestaña (los botones ejecutaban dos veces). La IA lo corrigió reemplazando el nodo del panel (`nuevoPanel()`) en cada render. Probamos todas las pantallas con un navegador automatizado y datos simulados antes del commit.

## Sprint 4 · Pagos y CRM

### Sprint 4 · 2026-11-02 · Equipo · Claude
**Pedí:** Apps Script que cree la preferencia de Mercado Pago leyendo el precio desde Firestore (no desde el navegador), webhook que consulte el pago por ID y solo si está aprobado cree `payments` y `enrollments` por la API REST de Firestore, cambie el lead a `cliente` y envíe correos; CRM con tabla, embudo y notas.
**Resultado:** `backend/Code.gs` + `appsscript.json` + `README.md` con cuentas de prueba, propiedades del script y tarjetas de prueba; `pago.html` que verifica el pago al volver (respaldo del webhook); `js/admin-crm.js`.
**Corregí / aprendí:** Apps Script no responde al "preflight" de CORS, así que el frontend envía `text/plain` con JSON dentro. El Access Token **solo** va en Propiedades del script; el `.gitignore` bloquea archivos de secretos. La inscripción usa ID predecible `uid_courseId` para que un aviso repetido no cree dos inscripciones.

## Sprint 5 · Recursos y lanzamiento

### Sprint 5 · 2026-11-02 · Equipo · Claude
**Pedí:** módulos de instructores, recursos y costos por curso, calendario semanal, reportes (ventas, inscritos, conversión, avance, margen), legales con Ley 1581, documentación final.
**Resultado:** `js/admin-recursos.js`, `js/admin-reportes.js`, `legales.html`, esta bitácora, `docs/pruebas-usuarios.md`, `docs/seguridad.md`, `docs/despliegue.md` y el README final.
**Corregí / aprendí:** _(completar por el equipo tras la prueba con 5 usuarios reales y el Demo Day)_.

---

## Entradas del equipo
_(cada integrante agrega aquí sus prompts clave: al menos 3 por sprint)_
