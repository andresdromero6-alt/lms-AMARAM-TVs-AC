# SEO y Google Search Console

## Estado

| Elemento | Estado | Dónde |
| --- | --- | --- |
| Propiedad verificada en Search Console | Verificada el 13 de noviembre de 2026 (método: etiqueta HTML) | `index.html` → `<meta name="google-site-verification">` |
| Sitemap | Publicado y enviado | `sitemap.xml` (6 URL: inicio, catálogo, los 2 cursos, login, legales) |
| robots.txt | Publicado | Bloquea aula, admin, pago, mis cursos y perfil; apunta al sitemap |
| Indexación solicitada | Inicio y los dos cursos, desde "Inspección de URL" | Search Console |
| Datos estructurados | `EducationalOrganization` en inicio; `Course` con precio e instructor en cada curso | `index.html`, `js/curso.js` |
| Open Graph | Título, descripción, URL canónica y logo en páginas públicas | cabecera de cada HTML |

Google tarda normalmente entre unos días y dos semanas en indexar un sitio nuevo. Se comprueba buscando `site:andresdromero6-alt.github.io/lms-AMARAM-TVs-AC` o en Search Console → Páginas.

## Decisiones de SEO

- **Títulos con la búsqueda real del cliente**: "Cursos de instalación de aires Mini Split y montaje de Smart TVs | AMARAM TV" en lugar de solo la marca.
- **Páginas privadas con `noindex`** para que Google no muestre el aula ni el panel.
- **Canonical** en cada página pública, porque el sitio vive en una subcarpeta de github.io y podría indexarse con y sin `index.html`.
- **Schema.org Course** generado en `js/curso.js` con los datos reales de Firestore (nombre, descripción, precio en COP, instructor, modalidad en línea). Google renderiza JavaScript, por lo que lo lee aunque se inyecte en el cliente.

## Rutina mensual

1. Search Console → **Rendimiento**: clics, impresiones y consultas por las que aparece el sitio. Anotar las 5 consultas principales.
2. Search Console → **Páginas**: revisar que no haya errores de rastreo ni páginas "excluidas" que deberían estar indexadas.
3. Search Console → **Mejoras**: comprobar que los datos estructurados de curso no tengan errores.
4. Publicar al menos un contenido nuevo al mes que responda una búsqueda concreta (por ejemplo, una página "¿Qué chazo usar para colgar un televisor en drywall?") enlazando al curso.

## Pendientes que mejoran el posicionamiento

- [ ] Comprar un dominio propio (por ejemplo `amaramtv.com`) y configurarlo en GitHub Pages (Settings → Pages → Custom domain). Después actualizar `sitemap.xml`, los `canonical`, `robots.txt` y añadir el dominio como nueva propiedad en Search Console.
- [ ] Crear el Perfil de Empresa en Google (Google Business Profile) con nombre, WhatsApp, categoría "Centro de formación" y enlace al sitio.
- [ ] Añadir el enlace al sitio en las biografías de Instagram, Facebook y TikTok (enlaces entrantes).
