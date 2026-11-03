// =====================================================================
// AMARAM TV · Datos de ejemplo (modo demo)
// Fuente: docs/cursos.md. Se usan cuando Firebase aún no está configurado
// (Sprint 1) y como semilla para cargar Firestore (ver scripts/cargar-cursos.md).
// Videos: se asignan por módulo (ver VIDEO). Los materiales [EJEMPLO] siguen pendientes.
// =====================================================================

export const INSTRUCTORES = [
  {
    id: "andres-romero",
    name: "Andrés David Romero Fernández",
    email: "andresromerof9@gmail.com",
    specialty: "Montaje de Smart TVs y acabados estéticos",
    bio: "Técnico instalador con experiencia en servicio residencial. Dirige el curso de Montaje Profesional de Smart TVs.",
    hourlyRate: 45000,
    photoUrl: "",
    active: true
  },
  {
    id: "andres-mercado",
    name: "Andrés Camilo Mercado Marín",
    email: "andrescamilomercadomarin@gmail.com",
    specialty: "Climatización residencial (Mini Split) y Smart TVs",
    bio: "Técnico en refrigeración y climatización. Dirige el paquete completo de Aires Mini Split + Smart TVs.",
    hourlyRate: 60000,
    photoUrl: "",
    active: true
  }
];

export const CURSOS = [
  {
    id: "montaje-smart-tv",
    slug: "montaje-smart-tv",
    title: "Montaje Profesional de Smart TVs",
    promise: "Domina las técnicas de anclaje, nivelación láser y gestión de cableado estético para instalar pantallas de cualquier tamaño, de forma segura y profesional, en cualquier tipo de muro.",
    description: "Aprende a instalar pantallas de cualquier tamaño de forma segura, limpia y profesional en concreto, ladrillo hueco o drywall, garantizando la satisfacción total del cliente y abriendo tu propio servicio técnico. Al terminar sabrás elegir el soporte y el anclaje correcto, nivelar con láser, perforar sin dañar el muro, ocultar el cableado y cobrar por tu servicio.",
    audience: "Jóvenes, emprendedores y técnicos en formación que buscan aprender un oficio rápido, rentable y con alta demanda en el mercado residencial.",
    category: "Instalación de Electrodomésticos y Entretenimiento",
    level: "Básico / Principiante",
    price: 90000,
    imageUrl: "img/curso-smart-tv.svg",
    instructorId: "andres-romero",
    instructorName: "Andrés David Romero Fernández",
    duration: "8 lecciones · ~6 horas",
    lessonCount: 8,
    requirements: ["No necesitas experiencia previa.", "Taladro percutor, nivel (ideal láser) y detector de vigas para practicar.", "Celular o computador con internet para ver las lecciones."],
    published: true,
    order: 1
  },
  {
    id: "mini-split-smart-tv",
    slug: "mini-split-smart-tv",
    title: "Instalación de Aires Mini Split + Smart TVs (Paquete Completo)",
    promise: "Conviértete en un técnico integral: instala desde cero sistemas de climatización y entretenimiento residencial con doble certificación.",
    description: "Ejecuta desde cero instalaciones residenciales de climatización y entretenimiento. Domina el manejo de tuberías de cobre, la realización de vacío con bomba y las conexiones eléctricas seguras. Incluye el módulo completo de montaje de Smart TVs aplicado al mismo cliente, para que ofrezcas un servicio integral con mayor margen de ganancia y obtengas doble certificación.",
    audience: "Emprendedores del sector técnico, estudiantes de diseño y personas que desean montar un negocio de servicios técnicos del hogar con mayor margen de ganancia.",
    category: "Climatización y Confort Residencial",
    level: "Avanzado / Profesional",
    price: 150000,
    imageUrl: "img/curso-mini-split.svg",
    instructorId: "andres-mercado",
    instructorName: "Andrés Camilo Mercado Marín",
    duration: "8 lecciones · ~10 horas",
    lessonCount: 8,
    requirements: ["Conocimientos básicos de electricidad residencial (o haber tomado el curso de Smart TVs).", "Acceso a herramientas de refrigeración para practicar: cortatubos, abocardador, manómetros y bomba de vacío.", "Celular o computador con internet para ver las lecciones."],
    published: true,
    order: 2
  }
];

// Videos por módulo. Los MP4 viven en /video/ (servidos por GitHub Pages); también se aceptan enlaces de YouTube.
const VIDEO = {
  "montaje-smart-tv": { 1: "video/montaje-smart-tv-m1.mp4" },
  "mini-split-smart-tv": { 1: "https://www.youtube.com/watch?v=Aqq_7399c0M", 2: "https://www.youtube.com/watch?v=Aqq_7399c0M", 3: "https://www.youtube.com/watch?v=Aqq_7399c0M", 4: "https://www.youtube.com/watch?v=Aqq_7399c0M" }
};
const L = (courseId, m, l, moduleName, title, durationMin = 25) => ({
  id: `${courseId}_m${m}-l${l}`,
  courseId,
  moduleNumber: m,
  moduleName,
  order: m * 10 + l,
  title,
  videoUrl: (courseId === "mini-split-smart-tv" && m === 4 && l === 2) ? "" : (VIDEO[courseId]?.[m] || ""),
  content: `En esta lección verás: ${title} Toma apuntes y, al terminar, marca la lección como completada para registrar tu avance.`,
  materialUrl: "",         // [EJEMPLO] pegar enlace de Google Drive
  materialName: "",
  durationMin
});

export const LECCIONES = [
  // Curso 1 · Montaje Profesional de Smart TVs
  L("montaje-smart-tv", 1, 1, "Fundamentos y Herramientas", "Introducción a la instalación de pantallas y normativas de seguridad."),
  L("montaje-smart-tv", 1, 2, "Fundamentos y Herramientas", "Selección de herramientas clave (taladro, nivel láser, detector de vigas)."),
  L("montaje-smart-tv", 2, 1, "Soportes y Mampostería", "Tipos de soportes (fijos, móviles, de techo y articulados)."),
  L("montaje-smart-tv", 2, 2, "Soportes y Mampostería", "Identificación de muros (concreto, ladrillo hueco, yeso/drywall) y elección correcta de chazos o anclajes.", 35),
  L("montaje-smart-tv", 3, 1, "Ejecución y Montaje", "Técnicas de nivelación láser y marcado de puntos de perforación.", 30),
  L("montaje-smart-tv", 3, 2, "Ejecución y Montaje", "Perforación limpia, fijación de soporte y montaje asistido de la pantalla.", 40),
  L("montaje-smart-tv", 4, 1, "Acabados Estéticos", "Ocultamiento profesional de cableado y canaletas estéticas.", 30),
  L("montaje-smart-tv", 4, 2, "Acabados Estéticos", "Pruebas de conectividad, entrega al cliente y pautas para cobrar por el servicio."),

  // Curso 2 · Instalación de Aires Mini Split + Smart TVs
  L("mini-split-smart-tv", 1, 1, "Introducción a la Refrigeración y Climatización", "Principios físicos del funcionamiento de un aire acondicionado Mini Split inverter y convencional.", 40),
  L("mini-split-smart-tv", 1, 2, "Introducción a la Refrigeración y Climatización", "Normas de seguridad eléctrica y manejo seguro de herramientas de refrigeración.", 30),
  L("mini-split-smart-tv", 2, 1, "Tuberías y Conexiones de Cobre", "Técnicas profesionales de corte, doblado y abocardado (pestaña) de tubería de cobre.", 45),
  L("mini-split-smart-tv", 2, 2, "Tuberías y Conexiones de Cobre", "Aislamiento térmico y cableado de comunicación entre la unidad interior y exterior.", 35),
  L("mini-split-smart-tv", 3, 1, "Montaje y Sistema de Vacío", "Instalación física de la consola interior y perforación de muro con pendiente adecuada para desagüe.", 45),
  L("mini-split-smart-tv", 3, 2, "Montaje y Sistema de Vacío", "Conexión de manómetros, proceso de vacío con bomba y prueba rigurosa de hermeticidad para detectar fugas.", 50),
  L("mini-split-smart-tv", 4, 1, "Puesta en Marcha y Curso de Smart TVs (Incluido)", "Liberación de gas refrigerante, medición de amperaje y comprobación de enfriamiento óptimo.", 40),
  L("mini-split-smart-tv", 4, 2, "Puesta en Marcha y Curso de Smart TVs (Incluido)", "Módulo complementario de montaje de Smart TVs aplicado al mismo cliente residencial.", 60)
];

// Preguntas frecuentes de la landing (contenido real del negocio; ajustar si cambia la política)
export const FAQ = [
  { q: "¿Necesito experiencia previa?", a: "No. El curso de Montaje de Smart TVs empieza desde cero. El paquete de Aires Mini Split es de nivel avanzado: te recomendamos tener nociones básicas de electricidad o tomar primero el curso de Smart TVs." },
  { q: "¿Cómo accedo a las lecciones después de pagar?", a: "El pago se hace por Wompi (Bancolombia). Apenas se aprueba, el curso aparece en «Mis cursos» con tu cuenta y puedes empezar de inmediato desde el celular o el computador." },
  { q: "¿Las clases son en vivo o grabadas?", a: "Son grabadas: avanzas a tu ritmo, las veces que quieras, y marcas cada lección como completada para llevar tu progreso." },
  { q: "¿Qué herramientas necesito para practicar?", a: "Para Smart TVs: taladro percutor, nivel (ideal láser), detector de vigas y chazos. Para Mini Split: cortatubos, abocardador, manómetros y bomba de vacío. En cada curso encuentras la lista completa." },
  { q: "¿Puedo pedir reembolso?", a: "Sí, dentro de los 5 días siguientes a la compra si no has completado más del 20 % del curso. Revisa la política de reembolso en la sección Legales." }
];
