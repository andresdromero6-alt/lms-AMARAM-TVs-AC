# Analítica: Google Analytics 4 y Microsoft Clarity

Las dos herramientas se cargan desde `js/cookies.js` **solo cuando el visitante acepta las cookies** en el banner. Con los IDs vacíos no se carga nada, así que la plataforma funciona igual sin ellos.

## 1. Configurar Google Analytics 4

1. Entra a [analytics.google.com](https://analytics.google.com) con la cuenta de Google de AMARAM TV y crea una **cuenta** (nombre: AMARAM TV) y una **propiedad** GA4 (zona horaria Colombia, moneda COP).
2. Crea un **flujo de datos web** con la URL `https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/` y el nombre "Sitio AMARAM TV".
3. Copia el **ID de medición** (empieza por `G-`).
4. Pégalo en `js/firebase-config.js`:
   ```js
   export const ANALITICA = { ga4: "G-XXXXXXXXXX", clarity: "" };
   ```
5. Sube el cambio; en GA4 → Informes → Tiempo real deberías verte al entrar al sitio **después de aceptar las cookies**.

Recomendado en GA4 → Administrar → Configuración de datos: activar la **retención de 14 meses** y, en "Señales de Google", dejarlas desactivadas (no usamos remarketing).

## 2. Configurar Microsoft Clarity

1. Entra a [clarity.microsoft.com](https://clarity.microsoft.com) con una cuenta Microsoft (sirve el correo de Google creando cuenta Microsoft) y pulsa **Add new project**.
2. Nombre: AMARAM TV; sitio: `andresdromero6-alt.github.io`; categoría: Education.
3. En **Settings → Setup → Install tracking code manually** copia el **Project ID** (10 caracteres).
4. Pégalo en `js/firebase-config.js` en `clarity`.
5. En **Settings → Masking** deja "Strict" (enmascara todo el texto que escribe el usuario: formularios, correo) para cumplir la política de datos.

Opcional: en Clarity → Settings → Setup → **Google Analytics integration** se puede enlazar con GA4 para ver grabaciones desde los informes de Analytics.

## 3. Qué se mide

| Evento | Dónde se dispara | Para qué sirve |
| --- | --- | --- |
| `page_view` (automático) | Todas las páginas | Visitas, páginas más vistas, dispositivo y ciudad |
| `generate_lead` | Al enviar el formulario de interés (inicio o detalle de curso) | Cuántos interesados deja cada curso y desde qué página |
| `begin_checkout` | Al pulsar "Comprar el curso" | Cuántos llegan al pago; se compara con los pagos aprobados en el panel admin |

Los eventos se envían con `evento(nombre, datos)` de `js/cookies.js`. Para añadir uno nuevo basta importar `evento` y llamarlo; si el usuario no aceptó cookies, la llamada no hace nada.

## 4. Indicadores que revisa el equipo cada mes

- Visitas únicas y origen (redes, búsqueda, directo).
- Porcentaje de visitas que ven un curso → envían formulario → inician pago → pago aprobado (embudo).
- En Clarity: páginas con "rage clicks" o "dead clicks" y grabaciones del flujo de pago para detectar fricción.
- Comparar con el CRM (panel admin → Interesados) y con los pagos (panel admin → Reportes).

## 5. Privacidad

- La IP se anonimiza en GA4 (`anonymize_ip: true`).
- Clarity con enmascarado estricto: nunca se graban textos de formularios ni datos de pago (el pago ocurre en Wompi, fuera del sitio).
- Todo está descrito en `legales.html#cookies` y en la sección 1.2 de la política de datos.
- El visitante puede retirar el consentimiento desde "Preferencias" en el pie de página; al rechazar, los scripts no se cargan en las siguientes visitas (las cookies ya creadas se borran desde el navegador).
