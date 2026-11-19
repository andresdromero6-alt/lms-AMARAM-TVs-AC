# Marco legal de la plataforma

Todo el texto legal público vive en `legales.html`, enlazado desde el pie de página, el formulario de interés (casilla de autorización) y el banner de cookies.

| Documento | Sección | Base normativa | Dónde se aplica en el sitio |
| --- | --- | --- | --- |
| Política de tratamiento de datos personales | `legales.html#datos` | Ley 1581 de 2012, Decreto 1377 de 2013 (Colombia) | Casilla obligatoria de autorización en el formulario de interés (campo `consent` del lead; las reglas de Firestore rechazan leads sin consentimiento); registro de cuenta; aviso de cookies |
| Términos y condiciones de uso | `legales.html#terminos` | Código de Comercio, Ley 1480 de 2011 (Estatuto del Consumidor) | Aceptados al crear la cuenta y al comprar; enlazados en el pie y en la página de pago |
| Política de reembolso | `legales.html#reembolso` | Ley 1480 de 2011, art. 47 (retracto) adaptado a contenido digital | 5 días desde la compra si no se ha completado más del 20 % del curso; se gestiona por correo |
| Política de cookies | `legales.html#cookies` | Ley 1581 de 2012 y buenas prácticas de consentimiento (modelo RGPD) | Banner de consentimiento (`js/cookies.js`), enlace "Preferencias" en el pie |

## Cookies: cómo funciona el consentimiento

1. En la primera visita aparece el banner con dos opciones: **Solo necesarias** y **Aceptar todas**.
2. La decisión se guarda en `localStorage` (`amaram_cookies`) durante 12 meses.
3. Google Analytics 4 y Microsoft Clarity se cargan únicamente tras "Aceptar todas"; con "Solo necesarias" no se carga ningún script de terceros.
4. El usuario puede volver a decidir desde **Preferencias de cookies** en el pie de página o desde `legales.html#cookies`.
5. Las cookies necesarias (sesión de Firebase, la propia preferencia y las de Wompi en su página) no requieren consentimiento porque sin ellas el servicio no funciona.

## Datos personales: inventario

| Dato | Dónde se guarda | Finalidad | Quién accede |
| --- | --- | --- | --- |
| Nombre, correo, WhatsApp, curso de interés | Firestore `leads` | Contactar al interesado (CRM) | Administradores |
| Nombre, correo, foto de Google | Firebase Auth + Firestore `users` | Cuenta del estudiante | El propio usuario y administradores |
| Pagos (id y estado de Wompi) | Firestore `payments`, `enrollments` | Activar el curso, reportes | Administradores; el usuario ve su inscripción |
| Avance de lecciones | Firestore `progress` | Barra de progreso y certificado | El propio usuario y administradores |
| Navegación (anónima, con consentimiento) | Google Analytics, Microsoft Clarity | Mejorar la plataforma | Administradores |

Derechos del titular (conocer, actualizar, rectificar, suprimir, revocar): solicitud al correo andresdromero6@gmail.com; respuesta en máximo 15 días hábiles, según la política publicada.

## Pendiente antes del lanzamiento comercial

- [ ] Revisar el texto legal con un abogado o con el área jurídica de la universidad.
- [ ] Registrar la base de datos en el RNBD de la SIC si el negocio supera los umbrales de activos exigidos (hoy no aplica para una microempresa).
- [ ] Incluir la razón social y el NIT en el responsable del tratamiento cuando se formalice la empresa.
