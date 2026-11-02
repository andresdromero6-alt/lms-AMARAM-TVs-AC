# Inventario de cursos · AMARAM TV

Dos cursos prediseñados. Este inventario es la fuente para `js/datos.js` (modo demo) y para la carga inicial en Firestore (`scripts/cargar-cursos.md`).

---

## Curso 1 · Montaje Profesional de Smart TVs

| Campo | Valor |
|-------|-------|
| **ID** (`courseId`) | `montaje-smart-tv` |
| **Promesa** | Dominar las técnicas avanzadas de anclaje, nivelación láser y gestión de cableado estético para instalar pantallas de cualquier tamaño de forma segura, limpia y profesional en cualquier tipo de muro, garantizando la satisfacción total del cliente y abriendo su propio servicio técnico. |
| **Público** | Jóvenes, emprendedores y técnicos en formación que buscan aprender un oficio rápido, rentable y con alta demanda en el mercado residencial. |
| **Precio** | $90.000 COP |
| **Categoría** | Instalación de Electrodomésticos y Entretenimiento |
| **Nivel** | Básico / Principiante |
| **Instructor** | Andrés David Romero Fernández |
| **Duración estimada** | 8 lecciones · ~6 horas |
| **Materiales** | Lista de herramientas (PDF), plantilla de cotización (hoja de cálculo) — _[EJEMPLO: pendiente de subir a Drive]_ |

### Módulos y lecciones

**Módulo 1 · Fundamentos y Herramientas**
- 1.1 Introducción a la instalación de pantallas y normativas de seguridad.
- 1.2 Selección de herramientas clave (taladro, nivel láser, detector de vigas).

**Módulo 2 · Soportes y Mampostería**
- 2.1 Tipos de soportes (fijos, móviles, de techo y articulados).
- 2.2 Identificación de muros (concreto, ladrillo hueco, yeso/drywall) y elección correcta de chazos o anclajes.

**Módulo 3 · Ejecución y Montaje**
- 3.1 Técnicas de nivelación láser y marcado de puntos de perforación.
- 3.2 Perforación limpia, fijación de soporte y montaje asistido de la pantalla.

**Módulo 4 · Acabados Estéticos**
- 4.1 Ocultamiento profesional de cableado y canaletas estéticas.
- 4.2 Pruebas de conectividad, entrega al cliente y pautas para cobrar por el servicio.

---

## Curso 2 · Instalación de Aires Mini Split + Smart TVs (Paquete Completo)

| Campo | Valor |
|-------|-------|
| **ID** (`courseId`) | `mini-split-smart-tv` |
| **Promesa** | Convertirse en un técnico integral capaz de ejecutar desde cero instalaciones residenciales de climatización y entretenimiento, dominando el manejo de tuberías de cobre, la realización de vacío con bomba y las conexiones eléctricas seguras, obteniendo además doble certificación. |
| **Público** | Emprendedores del sector técnico, estudiantes de diseño y personas que desean montar un negocio de servicios técnicos del hogar con mayor margen de ganancia. |
| **Precio** | $150.000 COP |
| **Categoría** | Climatización y Confort Residencial |
| **Nivel** | Avanzado / Profesional |
| **Instructor** | Andrés Camilo Mercado Marín |
| **Duración estimada** | 8 lecciones · ~10 horas |
| **Materiales** | Tabla de presiones y temperaturas (PDF), lista de chequeo de vacío (PDF) — _[EJEMPLO: pendiente de subir a Drive]_ |

### Módulos y lecciones

**Módulo 1 · Introducción a la Refrigeración y Climatización**
- 1.1 Principios físicos del funcionamiento de un aire acondicionado Mini Split inverter y convencional.
- 1.2 Normas de seguridad eléctrica y manejo seguro de herramientas de refrigeración.

**Módulo 2 · Tuberías y Conexiones de Cobre**
- 2.1 Técnicas profesionales de corte, doblado y abocardado (pestaña) de tubería de cobre.
- 2.2 Aislamiento térmico y cableado de comunicación entre la unidad interior y exterior.

**Módulo 3 · Montaje y Sistema de Vacío**
- 3.1 Instalación física de la consola interior y perforación de muro con pendiente adecuada para desagüe.
- 3.2 Conexión de manómetros, proceso de vacío con bomba y prueba rigurosa de hermeticidad para detectar fugas.

**Módulo 4 · Puesta en Marcha y Curso de Smart TVs (Incluido)**
- 4.1 Liberación de gas refrigerante, medición de amperaje y comprobación de enfriamiento óptimo.
- 4.2 Módulo complementario de montaje de Smart TVs aplicado al mismo cliente residencial.

---

## Pendientes de contenido (Sprint 3)
- [ ] Grabar o enlazar un video (YouTube **no listado**) por lección → campo `videoUrl`.
- [ ] Subir materiales a Google Drive con enlace "cualquiera con el enlace puede ver" → campo `materialUrl`.
- [ ] Imagen de portada por curso en `/img/` (sin espacios ni tildes: `curso-smart-tv.jpg`, `curso-mini-split.jpg`).
