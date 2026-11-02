# Backend · Apps Script + Wompi (Sprint 4)

Este directorio guarda una copia del código que corre en Google Apps Script. **El código vive y se ejecuta en script.google.com** (proyecto `amaram-tv-backend`); aquí se versiona para que el repositorio esté completo. Cada vez que cambies algo en el editor de Apps Script, copia el `Code.gs` actualizado aquí y haz commit.

## Qué hace
| Acción | Quién la llama | Qué pasa |
|---|---|---|
| `crearPago` | `js/pagos.js` desde el botón Comprar | Lee el precio del curso en Firestore (nunca confía en el navegador), construye el enlace de **Wompi Checkout Web** con la firma de integridad `SHA256(referencia + centavos + COP + secreto)` y lo devuelve. |
| webhook | Wompi (evento `transaction.updated`) | Verifica el checksum con el secreto de eventos, consulta la transacción en `/v1/transactions/{id}`; si está `APPROVED` crea `payments/{id}` y `enrollments/{uid}_{courseId}`, pasa el lead a `cliente` y envía correos. Idempotente. |
| `verificarPago` | `pago.html` al volver de Wompi (`?id=…`) | Respaldo del webhook: procesa la transacción que viene en la URL. |
| `nuevoLead` | formulario de interés | Correo de bienvenida al contacto y aviso al admin. |

Referencia de cada transacción: `uid|courseId|timestamp`. Wompi exige referencias únicas; el backend extrae `uid` y `courseId` de ahí.

## Paso a paso

### A. Wompi (15 min)
1. Crea la cuenta de comercio en [comercios.wompi.co](https://comercios.wompi.co) (no necesita cuenta Bancolombia para el **sandbox**; para producción sí piden documentos).
2. En el panel → **Desarrolladores** encuentras dos juegos de llaves. Para el curso usamos las de **Pruebas (sandbox)**:
   - Llave pública `pub_test_…`
   - Llave privada `prv_test_…` (no la usamos; no la pegues en ningún lado)
   - **Secreto de integridad** `test_integrity_…`
   - **Secreto de eventos** `test_events_…`
3. En la misma sección → **URL de eventos** (pruebas): pega la URL `/exec` del script (paso B.6).
4. Medios de prueba del sandbox:
   - Tarjeta **aprobada**: `4242 4242 4242 4242`, cualquier CVV y fecha futura, cualquier nombre.
   - Tarjeta **rechazada**: `4111 1111 1111 1111`.
   - Nequi aprobado: `3991111111`; Nequi rechazado: `3992222222`.
   - PSE: en sandbox cualquier banco y documento funcionan; el estado se simula.

### B. Apps Script (ya hecho por el equipo el 2 nov 2026; se repite aquí por si hay que recrearlo)
1. Con **la misma cuenta de Google que creó el proyecto de Firebase**, entra a [script.google.com](https://script.google.com) → **Nuevo proyecto** → `amaram-tv-backend`.
2. Pega `Code.gs` (reemplaza todo) y, con "Mostrar appsscript.json" activado en Configuración, pega `appsscript.json`.
3. Configuración → **Propiedades del script**:
   | Propiedad | Valor |
   |---|---|
   | `WOMPI_PUBLIC_KEY` | `pub_test_…` |
   | `WOMPI_INTEGRITY_SECRET` | `test_integrity_…` **(nunca en el código ni en GitHub)** |
   | `WOMPI_EVENTS_SECRET` | `test_events_…` **(nunca en el código ni en GitHub)** |
   | `WOMPI_ENV` | `test` (cambiar a `prod` con las llaves de producción al lanzar) |
   | `FIREBASE_PROJECT_ID` | `amaram-tv-95758` |
   | `SITE_URL` | `https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/` |
   | `ADMIN_EMAIL` | correo que recibe avisos de ventas (opcional) |
4. Ejecuta `pruebaConfiguracion` (Ejecutar ▶) y acepta los permisos. Debe listar los cursos publicados.
5. **Implementar → Nueva implementación → Aplicación web** → Ejecutar como **Yo** → Acceso **Cualquier usuario** → copia la URL `/exec`.
6. Pega la URL en `js/firebase-config.js` → `APPS_SCRIPT_URL` y en Wompi → URL de eventos.
7. Abre la URL `/exec` en el navegador: debe responder `{"ok":true,"pasarela":"Wompi","config":{…todo true}}`.

### C. Prueba de punta a punta
1. En la plataforma publicada, entra con una cuenta de estudiante y presiona **Comprar**.
2. En el checkout de Wompi paga con la tarjeta `4242 4242 4242 4242`.
3. Wompi vuelve a `pago.html?curso=…&id=…`; la página verifica la transacción y muestra **Ir al aula**.
4. Comprueba en Firestore: `payments/{id}` con `status: APPROVED`, `enrollments/{uid}_{courseId}` con `status: active`, y el lead en `cliente`.
5. Repite con `4111 1111 1111 1111` para ver la página de rechazo.

### Cada vez que cambies Code.gs
**Implementar → Administrar implementaciones → ✎ → Versión: Nueva versión → Implementar.** Si no, la URL sigue usando el código viejo.

## Errores comunes
| Síntoma | Causa | Solución |
|---|---|---|
| `Faltan WOMPI_PUBLIC_KEY o WOMPI_INTEGRITY_SECRET` | Propiedades no creadas | Configuración → Propiedades del script |
| Wompi muestra "firma inválida" en el checkout | El secreto de integridad no corresponde a la llave pública (uno es de pruebas y otro de producción) | Usa el par de llaves del mismo ambiente |
| `Firestore 403` | La cuenta del script no es dueña del proyecto Firebase o no aceptaste permisos | Misma cuenta; ejecuta `pruebaConfiguracion` y acepta |
| El pago sale aprobado pero el curso no se abre | El webhook no llegó o la implementación es vieja | Revisa **Ejecuciones** en Apps Script; `pago.html` llama a `verificarPago` como respaldo; crea nueva versión |
| `Firma inválida` en Ejecuciones | `WOMPI_EVENTS_SECRET` incorrecto | Copia de nuevo el secreto de eventos del mismo ambiente |
| Error de CORS en el navegador | Se envió con `application/json` | `js/pagos.js` ya envía `text/plain`; no lo cambies |

## Plan B si el webhook se complica
Usa **Admin → Inscripciones → Inscribir manualmente** después de ver la transacción aprobada en el panel de Wompi. Sirve para avanzar, pero la automatización completa es parte de la nota.
