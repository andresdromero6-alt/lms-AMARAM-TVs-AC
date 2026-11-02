# Acta · Sprint 4 · Pagos y CRM

**Fecha:** 2 de noviembre de 2026 · **Asistentes:** Abraham David Martínez Calderón, Andrés Camilo Mercado Marín, Andrés Romero · **Modalidad:** sesión de trabajo con IA (Claude) y demo desde el enlace publicado.

## Revisión
| Issue | Entregable | ¿Aceptado por el PO? |
|---|---|---|
| S4-01 · Cuenta Wompi | sandbox activado, llaves de prueba | ☑ sí |
| S4-02/03 · Apps Script | amaram-tv-backend v2 como app web | ☑ sí |
| S4-04 · Comprar y páginas de pago | pago.html | ☑ sí |
| S4-05 · Webhook | compra 4242 aprobada → enrollment automático | ☑ sí |
| S4-06 · Lead a cliente | pasarLeadACliente_ | ☑ sí |
| S4-07/08/09 · CRM | tabla, embudo, notas | ☑ sí |
| S4-10 · Correo bienvenida | nuevoLead_ | ☑ sí |

**Demo mostrada:** Compra de prueba en vivo: Wompi aprueba, el webhook inscribe, el aula se abre y el contacto pasa a Cliente.

Enlace: https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/

## Retrospectiva
- **Mantener:** Se cambió la pasarela de Mercado Pago a Wompi por decisión del equipo; el código quedó desacoplado y el cambio tomó una sesión.
- **Mejorar:** Los secretos nunca pasaron por el chat ni por GitHub: los pegó el equipo en Propiedades del script.
- **Probar:** Al lanzar: llaves de producción y WOMPI_ENV=prod; repetir la compra con dinero real pequeño y reembolsar.

## Actualizado
- [x] `CONTEXTO.md`
- [x] `docs/bitacora-ia.md`
- [x] Issues cerrados en GitHub
- [ ] Tablero de Projects (pendiente de crear)
