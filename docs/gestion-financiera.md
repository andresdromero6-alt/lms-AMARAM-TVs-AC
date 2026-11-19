# Gestión financiera: costos y gastos

Resumen del documento financiero del proyecto (cifras estimadas en COP, noviembre de 2026; reemplazar por cotizaciones reales antes de presentarlo como definitivo).

**Costo** = lo que cuesta producir los cursos (ocurre una vez por curso). **Gasto** = lo que cuesta mantener y operar el negocio (ocurre cada mes, se venda o no).

## Costos de producción (una sola vez)

| Rubro | Curso 1 · Smart TVs | Curso 2 · Mini Split + Smart TVs | Compartido |
| --- | --- | --- | --- |
| Honorarios del instructor (8 lecciones × 3 h) | $1.080.000 ($45.000/h) | $1.440.000 ($60.000/h) | |
| Edición de video (8 × $80.000) | $640.000 | $640.000 | |
| Materiales de demostración | $160.000 | $400.000 | |
| Guías descargables | $80.000 | $100.000 | |
| Equipo de grabación (micrófono, trípode, luz) | | | $400.000 |
| Herramientas de demostración (si no se tienen) | | | $1.100.000 |
| Espacio de grabación (4 días) | | | $800.000 |
| Diseño de certificado y portadas | | | $100.000 |
| **Subtotal** | **$1.960.000** | **$2.580.000** | **$2.400.000** |

**Total: $6.940.000** (baja a unos $5.040.000 si los instructores ya tienen herramientas y espacio propio).

## Gastos de operación (mensuales)

| Área | Rubros | Mensual |
| --- | --- | --- |
| Administración | Contador $200.000, Cámara de Comercio prorrateada $12.500, celular/WhatsApp $60.000, internet $90.000, papelería $20.000 | $382.500 |
| Tecnología | Dominio prorrateado $5.800, GitHub Pages $0, Firebase Spark $0, Wompi sin mensualidad $0, Canva Pro $50.000 | $55.800 |
| Ventas y marketing | Pauta en redes $300.000, contenido y piezas $100.000 | $400.000 |
| Financieros | Cuota de manejo bancaria $15.000 | $15.000 |
| **Total fijo** | | **$853.300** |

Gastos variables por venta: comisión Wompi (2,65 % + $700 + IVA) y 4×1000 → **$4.060** en el curso de $90.000 y **$6.200** en el de $150.000.

## Indicadores

| Indicador | Valor |
| --- | --- |
| Inversión inicial (producción + matrícula mercantil) | $7.090.000 |
| Gastos fijos mensuales | $853.300 |
| Margen por venta | $85.940 (curso 1) · $143.800 (curso 2) |
| Punto de equilibrio mensual | 10 ventas del curso 1 o 6 del curso 2 |
| Ventas para recuperar la inversión | 83 del curso 1 o 50 del curso 2 |

Conclusión: como el costo de producción se paga una vez y cada venta deja casi todo el precio como margen, el reto financiero no es el costo sino sostener el gasto de marketing hasta alcanzar las ventas de equilibrio.

## Seguimiento

- Los pagos aprobados y su monto se consultan en el panel de administración → Reportes (datos de Wompi en Firestore `payments`).
- Cada mes se compara ventas reales contra el punto de equilibrio y se ajusta el presupuesto de pauta.
- Supuestos pendientes de confirmar: herramientas que ya tiene el equipo, espacio de grabación propio o alquilado, quién edita los videos, tarifa de Wompi en el contrato.
