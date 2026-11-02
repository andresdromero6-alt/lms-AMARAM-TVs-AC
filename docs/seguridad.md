# Revisión de seguridad (S5-08) · lista de verificación

Hacerla antes del Demo Day y repetirla si cambia el backend o las reglas.

## Claves y secretos
- [ ] `WOMPI_INTEGRITY_SECRET` y `WOMPI_EVENTS_SECRET` existen **solo** en Propiedades del script de Apps Script. Búsqueda en el repositorio: `git grep -n "integrity_\|events_\|prv_"` no devuelve nada.
- [ ] `js/firebase-config.js` contiene solo la configuración pública de Firebase (apiKey, projectId…). Es normal que sea pública.
- [ ] `.gitignore` excluye `*.env`, `backend/.clasp.json`, `backend/secretos*.json`.
- [ ] Ningún archivo de la carpeta `docs/` incluye contraseñas de cuentas de prueba.

## Firestore
- [ ] Las reglas publicadas son exactamente `firestore.rules` (compara en la consola).
- [ ] Simulador de reglas (Firestore → Reglas → Simulador):
  - sin sesión, `get /courses/montaje-smart-tv` → permitido (publicado)
  - sin sesión, `create /courses/x` → denegado
  - sin sesión, `get /lessons/montaje-smart-tv_m1-l1` → denegado
  - estudiante sin inscripción, `get /lessons/...` → denegado
  - estudiante inscrito, `get /lessons/...` → permitido
  - estudiante, `update /users/{su uid}` con `role: admin` → denegado
  - estudiante, `create /enrollments/...` → denegado
- [ ] Un estudiante que abre `admin.html` es redirigido al inicio (comprobado en el navegador).
- [ ] Un usuario sin inscripción que pega el enlace de `leccion.html?curso=…` ve "Este contenido es para estudiantes inscritos".

## Authentication
- [ ] Solo los dominios necesarios en Dominios autorizados (`localhost`, `*.firebaseapp.com`, `andresdromero6-alt.github.io`).
- [ ] Contraseña mínima de 6 caracteres (Firebase) y recuperación por correo funcionando.

## Apps Script
- [ ] La aplicación web se ejecuta "como yo" y el acceso es "cualquier usuario" (necesario para el webhook); el script **no acepta** acciones distintas a `crearPago`, `verificarPago` y `nuevoLead`.
- [ ] `crearPago` toma el precio desde Firestore, nunca del cuerpo de la petición.
- [ ] El webhook consulta la transacción en `/v1/transactions/{id}` y verifica el checksum del evento antes de inscribir; no confía en el aviso.
- [ ] Las inscripciones usan ID `uid_courseId` (idempotencia).

## Frontend
- [ ] Todo texto que viene de la base de datos pasa por `escapar()` antes de insertarse en HTML (evita XSS).
- [ ] Los formularios piden consentimiento explícito (Ley 1581) y lo guardan con fecha.
- [ ] `admin.html` y `pago.html` tienen `<meta name="robots" content="noindex">`.

## Resultado de la revisión · 2 de noviembre de 2026
Revisó: equipo + Claude (verificación estática del repositorio y pruebas en el sitio publicado).

| Punto | Resultado |
|---|---|
| Secretos en el repositorio | ✅ `git grep` no encuentra `integrity_`, `events_` ni `prv_`; `.gitignore` excluye archivos de secretos. Los secretos de Wompi viven solo en Propiedades del script. |
| Reglas de Firestore publicadas | ✅ Publicadas el 2 nov; copia idéntica en `firestore.rules`. |
| Paywall | ✅ Sin inscripción, `leccion.html` muestra el muro de pago; tras la compra de prueba el aula abrió. |
| Rol | ✅ Un estudiante no puede cambiar su `role` (regla `update` en users); el rol admin se asignó desde la consola. |
| Dominios autorizados | ✅ `localhost`, `*.firebaseapp.com`, `*.web.app`, `andresdromero6-alt.github.io`. |
| Apps Script | ✅ Solo acepta `crearPago`, `verificarPago`, `nuevoLead` y eventos de Wompi; precio leído de Firestore; webhook verifica checksum y consulta la transacción; inscripción idempotente `uid_courseId`. |
| XSS | ✅ Todo texto de la base de datos pasa por `escapar()` antes de insertarse. |
| Consentimiento | ✅ Formularios con casilla Ley 1581 y fecha (`consentAt`). |
| `noindex` | ✅ en `admin.html` y `pago.html`. |

Pendiente: repetir el simulador de reglas en la consola (lectura de `lessons` sin inscripción → denegado) con un segundo usuario estudiante, y rotar las llaves de Wompi al pasar a producción.
