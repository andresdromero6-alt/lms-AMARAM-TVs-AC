# Guía de estilo · AMARAM TV

Todas las variables viven en `css/estilos.css` (`:root`). Cambia un valor allí y cambia en toda la plataforma.

## Marca
- **Nombre:** AMARAM TV (siempre en mayúsculas; "TV" en aguamarina en el logo).
- **Logo:** `img/favicon.svg` y el SVG inline en `js/app.js` (`LOGO_SVG`): un televisor con una onda, en aguamarina sobre azul oscuro.
- **Tono:** cercano, directo, técnico sin tecnicismos innecesarios. Tuteo. Frases cortas. Verbos de acción en los botones ("Ver los cursos", "Comprar el curso", "Marcar como completada").

## Colores
| Variable | Hex | Uso |
|---|---|---|
| `--azul-oscuro` | `#0B1F3A` | Header, footer, hero, títulos, texto principal |
| `--azul-medio` | `#15325C` | Degradados, menú móvil, hover de botones oscuros |
| `--azul-claro` | `#1F4C8F` | Insignias informativas |
| `--aguamarina` | `#2EC4B6` | **Acento principal:** botón primario, barra de progreso, insignias |
| `--aguamarina-claro` | `#7EE8DC` | Hover del botón primario, enlaces sobre fondo oscuro |
| `--aguamarina-oscuro` | `#1A9E92` | Enlaces sobre fondo claro (contraste AA) |
| `--aguamarina-suave` | `#E6FAF7` | Fondos suaves, iconos |
| `--blanco` | `#FFFFFF` | Superficies |
| `--fondo` | `#F3F6FA` | Fondo general |
| `--exito` / `--alerta` / `--error` | `#1B9C5A` / `#E9A23B` / `#D9534F` | Estados |

Contraste: texto `#0B1F3A` sobre blanco = 15:1; botón primario `#0B1F3A` sobre `#2EC4B6` = 7.4:1; enlaces `#1A9E92` sobre blanco = 4.6:1 (AA).

## Tipografía
- **Futura** (si está instalada) → respaldo **Jost** (Google Fonts, geométrica muy similar) → Century Gothic → sans-serif.
- Escala: `--tam-xs` 0.78rem · `--tam-sm` 0.9rem · base 1rem · `--tam-md` 1.15rem · `--tam-lg` 1.45rem · `--tam-xl` 2rem · hero `clamp(2rem, 6vw, 3.2rem)`.
- Títulos en 700, cuerpo en 400, botones y etiquetas en 600. Etiquetas de sección en mayúsculas con `letter-spacing: 0.14em`.

## Componentes
| Componente | Clase | Notas |
|---|---|---|
| Botón primario | `.boton.boton--primario` | Aguamarina, texto azul oscuro, píldora. Un solo primario por bloque. |
| Botón secundario | `.boton--secundario` | Azul oscuro con texto blanco |
| Botón contorno | `.boton--contorno` | Borde azul; en fondo oscuro, borde blanco |
| Tarjeta de curso | `.curso-tarjeta` | Imagen 16:9, categoría, título, promesa, meta, precio + botón |
| Tarjeta | `.tarjeta` | Superficie blanca, borde, radio 12 px, sombra suave |
| Insignia | `.insignia` + modificador | `--exito`, `--alerta`, `--error`, `--info`, `--gris`, `--suave`, `--oscura` |
| Formulario | `.formulario` `.campo` | Foco aguamarina, error en rojo bajo el campo, casilla de consentimiento `.campo--casilla` |
| Tabla | `.tabla-envoltura > .tabla` | Scroll horizontal en móvil; `.num` alinea números a la derecha |
| Progreso | `.progreso > .progreso__barra` | Degradado aguamarina |
| Pestañas | `.pestanas` | Subrayado aguamarina en la activa |
| Kanban | `.kanban` | Columnas del embudo CRM |
| Acordeón | `.acordeon > details` | FAQ y temario |
| Aviso flotante | `aviso(texto, tipo)` en `js/app.js` | Confirmaciones y errores |

## Espaciado y forma
Escala de 0.25 rem (`--esp-1`) a 4.5 rem (`--esp-8`). Radio `12px` en tarjetas, `8px` en campos, píldora en botones e insignias. Ancho máximo `1120px`. Gutter lateral `1rem` en móvil.

## Responsive
Celular primero. Puntos de quiebre: 640 px (rejillas de 2), 860 px (menú horizontal, hero en 2 columnas), 960 px (rejillas de 3, aula con lista lateral fija).

## Imágenes
Nombres sin espacios, tildes ni mayúsculas (`curso-smart-tv.svg`). Portadas 16:9. Fotos reales del equipo y de instalaciones cuando existan; mientras tanto, ilustraciones SVG propias.
