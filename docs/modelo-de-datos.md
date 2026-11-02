# Modelo de datos · Firestore

Diez colecciones. Cada colección es una "pestaña", cada documento una "fila" y cada campo una "columna". Los IDs son **predecibles** para evitar duplicados (por ejemplo, la inscripción de un usuario a un curso siempre se llama `${uid}_${courseId}`).

| Colección | ID del documento | Campos | Módulo | Quién escribe |
|-----------|------------------|--------|--------|---------------|
| `users` | `uid` de Firebase Auth | `name`, `email`, `role` (`student` \| `admin`), `photoUrl`, `createdAt` | Usuarios | La propia persona al registrarse (el rol solo lo cambia un admin o la consola) |
| `courses` | slug (`montaje-smart-tv`) | `title`, `slug`, `promise`, `description`, `audience`, `category`, `level`, `price` (COP, número), `imageUrl`, `instructorId`, `instructorName`, `duration`, `lessonCount`, `syllabus` (lista pública de {moduleNumber, moduleName, order, title, durationMin}; se recalcula al guardar lecciones), `published` (bool), `order`, `createdAt`, `updatedAt` | LMS | Administrador |
| `lessons` | `${courseId}_m1-l1` | `courseId`, `moduleNumber`, `moduleName`, `order`, `title`, `videoUrl`, `content` (texto/markdown simple), `materialUrl`, `materialName`, `durationMin` | LMS | Administrador |
| `enrollments` | `${uid}_${courseId}` | `userId`, `courseId`, `status` (`active` \| `cancelled`), `paymentId`, `amount`, `source` (`wompi` \| `manual`), `createdAt` | LMS + Pagos | **Solo el backend** (Apps Script) o un admin (inscripción manual) |
| `progress` | `${uid}_${lessonId}` | `userId`, `courseId`, `lessonId`, `completedAt` | LMS | El estudiante (solo si está inscrito) |
| `payments` | `id` de la transacción de Wompi | `paymentId`, `preferenceId`, `status` (APPROVED, PENDING, DECLINED, VOIDED, ERROR), `statusMessage`, `reference`, `amount`, `currency`, `userId`, `courseId`, `email`, `externalReference`, `date`, `raw` (resumen) | Pagos | **Solo el backend** |
| `leads` | auto | `name`, `email`, `phone`, `courseInterest`, `stage` (`nuevo` → `contactado` → `interesado` → `cliente` → `perdido`), `source` (`landing` \| `detalle` \| `manual`), `consent` (bool), `consentAt`, `userId`, `notes`, `createdAt`, `updatedAt` | CRM | Formulario público (crear) y administrador (editar) |
| `interactions` | auto | `leadId`, `date`, `channel` (`whatsapp` \| `llamada` \| `correo` \| `presencial`), `note`, `nextAction`, `nextActionDate`, `createdBy` | CRM | Administrador |
| `instructors` | slug (`andres-romero`) | `name`, `email`, `specialty`, `bio`, `hourlyRate` (COP), `photoUrl`, `active` | Recursos | Administrador |
| `resources` | auto | `courseId`, `type` (`video` \| `material` \| `licencia` \| `horario` \| `equipo` \| `otro`), `name`, `cost` (COP), `responsible`, `link`, `status` (`pendiente` \| `en-proceso` \| `listo`), `date`, `startTime`, `endTime`, `instructorId` (los 4 últimos solo para `horario`) | Recursos | Administrador |

## Cómo se conectan los datos (caso Ana)
1. Ana llena el formulario → documento en `leads` con `stage: "nuevo"`.
2. Ana se registra → documento en `users`; su lead guarda su `userId` (lo enlaza Apps Script o el admin por correo).
3. Ana paga el curso → el **webhook** (evento) de Wompi llega a Apps Script, que consulta el pago, y si está `APPROVED` crea `payments/{paymentId}` y `enrollments/{uid}_{courseId}`, y cambia el lead a `stage: "cliente"`.
4. Ana termina una lección → documento en `progress`. Avance = lecciones completadas ÷ `lessonCount` del curso.
5. El curso tiene `instructorId` y varios `resources` con `cost` → el reporte calcula margen = ventas del curso − costos del curso.

## Qué puede leer y escribir cada rol (resumen de `firestore.rules`)
| Colección | Visitante | Estudiante | Admin | Backend (Apps Script, cuenta dueña) |
|-----------|-----------|------------|-------|-------------------------------------|
| `courses` publicados | leer | leer | todo | leer |
| `courses` no publicados | — | — | todo | leer |
| `lessons` | — | leer **solo si tiene inscripción activa** en el curso | todo | leer |
| `users` | — | leer/escribir el propio (sin cambiar `role`) | leer todos, cambiar `role` | — |
| `enrollments` | — | leer las propias | todo | crear |
| `progress` | — | crear/leer las propias si está inscrito | leer | — |
| `payments` | — | leer los propios | leer | crear |
| `leads` | crear | crear | todo | actualizar |
| `interactions` | — | — | todo | — |
| `instructors`, `resources` | leer instructores activos | leer instructores | todo | — |

Apps Script escribe en Firestore con la **API REST** usando el token OAuth de la cuenta de Google dueña del proyecto (`ScriptApp.getOAuthToken()`), lo que **salta las reglas de seguridad**. Por eso solo el backend puede crear inscripciones y pagos.
