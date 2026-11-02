# Backlog del proyecto · AMARAM TV

Fuente: Backlog_Proyecto_LMS.xlsx (59 actividades). El estado vivo de cada tarea está en los Issues y el tablero de GitHub Projects; este archivo es la referencia completa. Para crear los Issues automáticamente: scripts/crear-issues.sh.


## Sprint 0 · Preparar el terreno (Corte 1)

| ID | Actividad | Módulo | Rol | Prioridad | Tamaño | Criterio de aceptación |
|---|---|---|---|---|---|---|
| S0-01 | Formar el equipo y asignar roles Scrum | Gestión ágil | Scrum Master | Obligatorio | S | Acta en /docs/equipo.md con integrantes, roles y medio de contacto. |
| S0-02 | Crear cuentas: GitHub (Student Pack), Google/Firebase, cuenta de desarrollador de la pasarela de pago y asistente de IA | Configuración | Todos | Obligatorio | S | Cada integrante confirma que entra a las cuatro herramientas. |
| S0-03 | Crear el repositorio público con README e invitar al equipo y al profesor | GitHub | Scrum Master | Obligatorio | S | Repositorio lms-nombredemarca creado; todos aparecen en Collaborators. |
| S0-04 | Crear la estructura de carpetas y los archivos base | GitHub | Frontend | Obligatorio | S | Existen /css, /js, /img, /backend, /docs y los 7 archivos HTML vacíos. |
| S0-05 | Hacer el inventario de cursos prediseñados | Contenido | Product Owner | Obligatorio | M | /docs/cursos.md con nombre, promesa, público, precio, módulos, lecciones e instructor de cada curso. |
| S0-06 | Elegir la ruta tecnológica y escribir CONTEXTO.md | Arquitectura | Datos y backend | Obligatorio | S | CONTEXTO.md con ruta, marca, estructura de carpetas y reglas para la IA. |
| S0-07 | Crear el tablero en GitHub Projects y cargar el backlog como Issues | Gestión ágil | Scrum Master | Obligatorio | M | Tablero con 5 columnas; Issues del sprint 1 creados con Milestone. |
| S0-08 | Planear el sprint 1 | Gestión ágil | Product Owner | Obligatorio | S | Cada Issue del sprint 1 tiene responsable y tamaño. |

## Sprint 1 · Diseñar y maquetar (Corte 1)

| ID | Actividad | Módulo | Rol | Prioridad | Tamaño | Criterio de aceptación |
|---|---|---|---|---|---|---|
| S1-01 | Dibujar el mapa del sitio con las 13 pantallas | Experiencia (UX) | Diseño | Obligatorio | S | Diagrama en /docs que muestra cómo se enlazan las pantallas. |
| S1-02 | Hacer los wireframes de las 5 pantallas clave | Experiencia (UX) | Diseño | Obligatorio | M | Inicio, catálogo, detalle, mis cursos y lección en Figma o foto en /docs. |
| S1-03 | Definir la guía de estilo de la marca | Marca | Diseño | Obligatorio | M | Logo, colores hex, 2 tipografías, botones y tarjetas; variables en css/estilos.css. |
| S1-04 | Construir la landing page con IA | Mercadeo | Frontend | Obligatorio | L | Header, hero, beneficios, cursos destacados, FAQ y footer; se ve bien en celular y el CTA lleva al catálogo. |
| S1-05 | Construir el catálogo de cursos con tarjetas y filtro | LMS | Frontend | Obligatorio | M | Muestra todos los cursos de js/datos.js y el filtro por categoría funciona. |
| S1-06 | Construir la página de detalle del curso | LMS | Frontend | Obligatorio | M | Cada tarjeta abre su detalle: temario, instructor, precio y botón Comprar (aún inactivo). |
| S1-07 | Diseñar el formulario "Quiero más información" | CRM | Frontend | Obligatorio | S | Valida nombre y correo e incluye la casilla de autorización de datos. |
| S1-08 | Publicar el sitio en GitHub Pages | Publicación | Datos y backend | Obligatorio | S | El enlace público abre desde un celular. |
| S1-09 | Registrar la bitácora de IA del sprint | Documentación | Todos | Obligatorio | S | Al menos 3 prompts clave con herramienta, resultado y correcciones. |
| S1-10 | Revisión y retrospectiva del sprint 1 | Gestión ágil | Scrum Master | Obligatorio | S | Demo en clase y acta de retro (mantener, mejorar, probar) en /docs. |

## Sprint 2 · Usuarios y datos (Corte 2)

| ID | Actividad | Módulo | Rol | Prioridad | Tamaño | Criterio de aceptación |
|---|---|---|---|---|---|---|
| S2-01 | Crear el proyecto en Firebase y registrar la app web | Configuración | Datos y backend | Obligatorio | S | js/firebase-config.js conectado sin errores en la consola. |
| S2-02 | Activar Authentication (correo y Google) y autorizar el dominio | Usuarios | Datos y backend | Obligatorio | S | El dominio de GitHub Pages aparece en Dominios autorizados. |
| S2-03 | Construir registro e inicio de sesión | Usuarios | Frontend | Obligatorio | M | Registrarse crea un documento en users con role student; cerrar sesión funciona. |
| S2-04 | Header que cambia según la sesión (Entrar / Mis cursos / Salir) | Usuarios | Frontend | Deseable | S | Con sesión iniciada el header muestra el nombre y el botón Salir. |
| S2-05 | Crear Firestore y publicar las reglas de seguridad iniciales | Datos | Datos y backend | Obligatorio | M | Un visitante no puede escribir en courses ni leer users de otros. |
| S2-06 | Cargar los cursos y lecciones del inventario a Firestore | LMS | Product Owner | Obligatorio | M | Al menos 2 cursos completos en courses y lessons. |
| S2-07 | Conectar catálogo y detalle a Firestore | LMS | Frontend | Obligatorio | M | Cambiar un precio en la consola se refleja en la página. |
| S2-08 | Guardar los contactos del formulario en leads | CRM | Frontend | Obligatorio | M | Cada envío crea un lead con etapa nuevo, origen, fecha y consentimiento. |
| S2-09 | Crear el rol administrador y proteger admin.html | Usuarios | Datos y backend | Obligatorio | S | Un estudiante que abre admin.html es redirigido al inicio. |
| S2-10 | Bitácora de IA, revisión y retrospectiva del sprint 2 | Gestión ágil | Todos | Obligatorio | S | Demo en vivo desde el enlace publicado y acta de retro. |

## Sprint 3 · Aula virtual (Corte 2)

| ID | Actividad | Módulo | Rol | Prioridad | Tamaño | Criterio de aceptación |
|---|---|---|---|---|---|---|
| S3-01 | Subir videos (YouTube no listado) y materiales (Drive) | Contenido | Product Owner | Obligatorio | M | Cada lección tiene su enlace de video o material guardado. |
| S3-02 | Panel admin: crear y editar cursos | LMS | Frontend | Obligatorio | L | Un curso creado desde el panel aparece en el catálogo al publicarlo. |
| S3-03 | Panel admin: crear, ordenar y editar lecciones | LMS | Frontend | Obligatorio | L | Las lecciones se muestran en el orden definido por módulo. |
| S3-04 | Construir la pantalla de lección | LMS | Frontend | Obligatorio | L | Video, texto, material descargable y botones anterior y siguiente. |
| S3-05 | Marcar lección como completada | LMS | Frontend | Obligatorio | M | Se guarda en progress y sigue marcada al volver a iniciar sesión. |
| S3-06 | Construir Mis cursos con barra de progreso | LMS | Frontend | Obligatorio | M | El porcentaje = lecciones completadas ÷ lecciones del curso. |
| S3-07 | Inscripción manual desde el panel (para pruebas) | LMS | Datos y backend | Obligatorio | S | El administrador inscribe a un usuario y este ve el curso en Mis cursos. |
| S3-08 | Reglas: solo los inscritos leen las lecciones | Seguridad | Datos y backend | Obligatorio | M | Un usuario sin inscripción que copia el enlace no ve el contenido. |
| S3-09 | Construir Mi perfil con historial de compras | Usuarios | Frontend | Deseable | S | Muestra nombre, correo y cursos comprados. |
| S3-10 | Bitácora de IA, revisión y retrospectiva del sprint 3 | Gestión ágil | Todos | Obligatorio | S | Demo en vivo y acta de retro. |

## Sprint 4 · Pagos y CRM (Corte 3)

| ID | Actividad | Módulo | Rol | Prioridad | Tamaño | Criterio de aceptación |
|---|---|---|---|---|---|---|
| S4-01 | Crear la cuenta de desarrollador en la pasarela, credenciales y usuarios de prueba | Pagos | Datos y backend | Obligatorio | S | Credenciales de prueba y usuarios vendedor y comprador creados. |
| S4-02 | Apps Script: guardar la clave secreta y crear la función crearPago | Pagos | Datos y backend | Obligatorio | M | Devuelve el enlace de pago con la referencia (usuario + curso) y las páginas de regreso; la clave está solo en Propiedades del script. |
| S4-03 | Publicar Apps Script como aplicación web y guardar el código en /backend | Pagos | Datos y backend | Obligatorio | S | URL /exec funcionando y Code.gs copiado en el repositorio. |
| S4-04 | Botón Comprar y páginas de pago exitoso, pendiente y rechazado | Pagos | Frontend | Obligatorio | M | El botón lleva a la pasarela de pago y el regreso muestra la página correcta. |
| S4-05 | Webhook: verificar el pago y crear la inscripción | Pagos | Datos y backend | Obligatorio | L | Un pago de prueba aprobado crea payments y enrollments y abre el curso sin intervención. |
| S4-06 | Pasar el contacto a etapa Cliente al confirmar el pago | CRM | Datos y backend | Obligatorio | S | El lead del comprador cambia a cliente automáticamente. |
| S4-07 | CRM: tabla de contactos con búsqueda y filtros | CRM | Frontend | Obligatorio | M | Filtra por etapa, curso de interés y origen. |
| S4-08 | CRM: embudo por etapas | CRM | Frontend | Obligatorio | M | Columnas Nuevo, Contactado, Interesado, Cliente y Perdido; se puede cambiar la etapa. |
| S4-09 | CRM: notas de seguimiento y próxima acción | CRM | Frontend | Obligatorio | M | Cada contacto guarda interacciones con canal, nota y fecha de próxima acción. |
| S4-10 | Correo automático de bienvenida a nuevos contactos | CRM | Datos y backend | Deseable | M | Apps Script envía el correo al crear un lead. |
| S4-11 | Bitácora de IA, revisión y retrospectiva del sprint 4 | Gestión ágil | Todos | Obligatorio | S | Demo de una compra de prueba en vivo y acta de retro. |

## Sprint 5 · Recursos y lanzamiento (Corte 3)

| ID | Actividad | Módulo | Rol | Prioridad | Tamaño | Criterio de aceptación |
|---|---|---|---|---|---|---|
| S5-01 | Módulo de instructores | Recursos | Frontend | Obligatorio | M | Crear, editar y asignar instructores a cursos. |
| S5-02 | Módulo de recursos y costos por curso | Recursos | Frontend | Obligatorio | M | Cada curso lista sus recursos con costo, responsable y estado. |
| S5-03 | Calendario de sesiones y horarios | Recursos | Frontend | Deseable | M | Vista por semana con instructor y curso. |
| S5-04 | Reportes: ventas, inscritos, conversión, avance y margen | Reportes | Datos y backend | Obligatorio | L | Conversión = clientes ÷ contactos; margen = ingresos − costos por curso. |
| S5-05 | Páginas legales y autorización de datos personales | Legal | Product Owner | Obligatorio | S | Política de datos (Ley 1581 de 2012), términos y reembolso enlazados en el footer. |
| S5-06 | Prueba con 5 usuarios reales | Calidad | Diseño | Obligatorio | M | Lista de hallazgos en /docs con lo que confundió a cada persona. |
| S5-07 | Corregir hallazgos y pulir el diseño responsive | Calidad | Frontend | Obligatorio | M | Los hallazgos críticos están resueltos y probados en celular. |
| S5-08 | Revisión de seguridad | Seguridad | Datos y backend | Obligatorio | S | Ninguna clave secreta en GitHub; reglas activas; admin protegido. |
| S5-09 | README final y video demo de 3 minutos | Documentación | Product Owner | Obligatorio | M | README con descripción, enlace, ruta, integrantes; video enlazado. |
| S5-10 | Demo Day y retrospectiva final | Gestión ágil | Todos | Obligatorio | S | Presentación en vivo del flujo completo y acta de cierre. |
