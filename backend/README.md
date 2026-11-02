# Backend · Apps Script + Mercado Pago (Sprint 4)

Este directorio guarda una copia del código que corre en Google Apps Script. **El código vive y se ejecuta en script.google.com**; aquí se versiona para que el repositorio esté completo. Cada vez que cambies algo en el editor de Apps Script, copia el `Code.gs` actualizado aquí y haz commit.

## Qué hace
| Acción | Quién la llama | Qué pasa |
|---|---|---|
| `crearPago` | `js/pagos.js` desde el botón Comprar | Lee el precio del curso en Firestore (nunca confía en el navegador), crea la preferencia en Mercado Pago y devuelve el `init_point`. |
| webhook | Mercado Pago (`?type=payment&data.id=…`) | Consulta el pago por su ID; si está `approved` crea `payments/{id}` y `enrollments/{uid}_{courseId}`, pasa el lead a `cliente` y envía correos. Idempotente. |
| `verificarPago` | `pago.html` al volver de la pasarela | Respaldo del webhook: procesa el `payment_id` que viene en la URL. |
| `nuevoLead` | formulario de interés | Correo de bienvenida al contacto y aviso al admin. |

## Paso a paso (30–45 min)

### A. Mercado Pago
1. Crea tu cuenta en [mercadopago.com.co](https://www.mercadopago.com.co) y entra a [Tus integraciones](https://www.mercadopago.com.co/developers/panel/app) → **Crear aplicación** → nombre `AMARAM TV` → producto **Pagos en línea → Checkout Pro**.
2. En la aplicación → **Cuentas de prueba** → crea dos: una **Vendedor** (país Colombia) y una **Comprador** (con saldo, p. ej. 500.000). Anota usuario y contraseña de cada una.
3. Abre una ventana de incógnito, entra a Mercado Pago con la cuenta **Vendedor**, ve a Tus integraciones → crea otra aplicación `AMARAM TV test` → **Credenciales de producción** de esa cuenta de prueba → copia el **Access Token** (`APP_USR-…` de la cuenta vendedor de prueba). Ese es el token que usarás en pruebas.
   > Alternativa simple: usar las **Credenciales de prueba** (`TEST-…`) de tu cuenta real. Funcionan para crear preferencias, pero el flujo completo con cuentas de prueba es más fiel.
4. [Tarjetas de prueba](https://www.mercadopago.com.co/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards): Mastercard `5254 1336 7440 3564`, Visa `4013 5406 8274 6260`, CVV `123`, vencimiento `11/30`. Nombre del titular define el resultado: `APRO` = aprobado, `OTHE` = rechazado, `CONT` = pendiente. Documento: cualquier número.

### B. Apps Script
1. Con **la misma cuenta de Google que creó el proyecto de Firebase**, entra a [script.google.com](https://script.google.com) → **Nuevo proyecto** → nómbralo `amaram-tv-backend`.
2. Pega el contenido de `Code.gs` en el editor (reemplaza todo).
3. ⚙ **Configuración del proyecto** → marca **Mostrar el archivo de manifiesto "appsscript.json"** → vuelve al editor y reemplaza su contenido con `backend/appsscript.json`.
4. En la misma Configuración → **Propiedades del script** → agrega:
   | Propiedad | Valor |
   |---|---|
   | `MP_ACCESS_TOKEN` | Access Token (paso A.3). **Nunca** lo pongas en el código ni en GitHub. |
   | `FIREBASE_PROJECT_ID` | el `projectId` de `js/firebase-config.js` |
   | `SITE_URL` | `https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/` |
   | `ADMIN_EMAIL` | correo del equipo que recibe avisos de ventas (opcional) |
5. Ejecuta una vez `pruebaConfiguracion` desde el editor (Ejecutar ▶) y **acepta los permisos** (acceso a Firestore, internet y correo). Debe listar los cursos publicados.
6. **Implementar → Nueva implementación → ⚙ Aplicación web** → Ejecutar como: **Yo** → Quién tiene acceso: **Cualquier usuario** → Implementar. Copia la URL que termina en `/exec`.
7. Pega esa URL en `js/firebase-config.js` → `APPS_SCRIPT_URL`. Commit: `Conecta el botón Comprar con Apps Script`.
8. Abre la URL `/exec` en el navegador: debe responder `{"ok":true,"servicio":"AMARAM TV backend", "config": {...todo true}}`.

### C. Webhook
1. En Mercado Pago → tu aplicación → **Webhooks** → modo **Pruebas** → URL: la misma `/exec` → eventos: **Pagos** → Guardar.
   (El script también envía `notification_url` en cada preferencia, así que aunque este paso falle el aviso llega.)
2. Mercado Pago muestra un botón **Simular** → úsalo para probar que el script responde 200.

### D. Prueba de punta a punta
1. En la plataforma publicada, entra con una cuenta de estudiante y presiona **Comprar** en un curso.
2. En el Checkout, inicia sesión con la cuenta **Comprador** de prueba (o paga como invitado con tarjeta de prueba, titular `APRO`).
3. Al aprobarse, vuelves a `pago.html?estado=exitoso…`; la página verifica el pago y muestra **Ir al aula**.
4. Comprueba en Firestore: `payments/{id}` con `status: approved`, `enrollments/{uid}_{courseId}` con `status: active`, y el lead en `cliente`.
5. Repite con titular `OTHE` (rechazado) y `CONT` (pendiente) para ver las otras páginas.

### Cada vez que cambies Code.gs
**Implementar → Administrar implementaciones → ✎ → Versión: Nueva versión → Implementar.** Si no, la URL sigue usando el código viejo.

## Errores comunes
| Síntoma | Causa | Solución |
|---|---|---|
| `Falta MP_ACCESS_TOKEN` | Propiedad no creada | Configuración → Propiedades del script |
| `Firestore 403` | La cuenta del script no es dueña/editora del proyecto Firebase, o no aceptaste permisos | Usa la misma cuenta; ejecuta `pruebaConfiguracion` y acepta |
| `Mercado Pago 401` | Token inválido o de otra cuenta | Copia de nuevo el Access Token |
| El pago sale aprobado pero el curso no se abre | El webhook no llegó o la implementación es vieja | Revisa **Ejecuciones** en Apps Script; `pago.html` llama a `verificarPago` como respaldo; crea nueva versión |
| Error de CORS en el navegador | Se envió con `application/json` | `js/pagos.js` ya envía `text/plain`; no lo cambies |
| `auto_return invalid` | `back_urls.success` no es https | Usa la URL de GitHub Pages, no `localhost` |

## Plan B si el webhook se complica
Usa **Admin → Inscripciones → Inscribir manualmente** después de ver el pago aprobado en el panel de Mercado Pago. Sirve para avanzar, pero la automatización completa es parte de la nota.
