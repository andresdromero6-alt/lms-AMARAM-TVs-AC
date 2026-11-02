# Acta · Sprint 2 · Usuarios y datos

**Fecha:** 2 de noviembre de 2026 · **Asistentes:** Abraham David Martínez Calderón, Andrés Camilo Mercado Marín, Andrés Romero · **Modalidad:** sesión de trabajo con IA (Claude) y demo desde el enlace publicado.

## Revisión
| Issue | Entregable | ¿Aceptado por el PO? |
|---|---|---|
| S2-01 · Proyecto Firebase | amaram-tv-95758, firebaseConfig en el código | ☑ sí |
| S2-02 · Authentication | correo/contraseña + Google; dominio autorizado | ☑ sí |
| S2-03 · Registro/login | login.html, users con role student | ☑ sí |
| S2-04 · Header con sesión | js/app.js | ☑ sí |
| S2-05 · Reglas Firestore | firestore.rules publicadas | ☑ sí |
| S2-06 · Cursos en Firestore | inventario cargado desde Admin | ☑ sí |
| S2-07 · Catálogo desde Firestore | js/db.js | ☑ sí |
| S2-08 · Leads | formulario → leads | ☑ sí |
| S2-09 · Rol admin | requerirAdmin + reglas | ☑ sí |

**Demo mostrada:** Registro real con Google, catálogo desde Firestore y formulario que crea contactos.

Enlace: https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/

## Retrospectiva
- **Mantener:** Una sola capa de datos (js/db.js) evitó duplicar lógica.
- **Mejorar:** Los índices compuestos de Firestore se crean desde el enlace del error.
- **Probar:** Simular las reglas en la consola antes de publicar cambios.

## Actualizado
- [x] `CONTEXTO.md`
- [x] `docs/bitacora-ia.md`
- [x] Issues cerrados en GitHub
- [ ] Tablero de Projects (pendiente de crear)
