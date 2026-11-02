// =====================================================================
// AMARAM TV · Admin: reportes
// Ventas, inscritos, conversión (clientes ÷ contactos), avance promedio y
// margen por curso (ingresos − costos de producción). Sin librerías: barras CSS.
// =====================================================================
import { nuevoPanel, escapar } from "./admin.js";
import { formatoCOP, formatoFecha } from "./app.js";
import { obtenerCursos, obtenerTodosPagos, obtenerTodasInscripciones, obtenerLeads, obtenerTodoProgreso, obtenerTodasLecciones, obtenerRecursos, obtenerUsuarios, aFecha, MODO_DEMO } from "./db.js";

export async function pintar() {
  const [cursos, pagos, inscripciones, leads, progreso, lecciones, recursos, usuarios] = await Promise.all([
    obtenerCursos({ soloPublicados: false }), obtenerTodosPagos(), obtenerTodasInscripciones(), obtenerLeads(), obtenerTodoProgreso(), obtenerTodasLecciones(), obtenerRecursos(), obtenerUsuarios()
  ]);
  const aprobados = pagos.filter(p => p.status === "approved");
  const ingresos = aprobados.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const activas = inscripciones.filter(i => i.status === "active");
  const clientes = leads.filter(l => l.stage === "cliente").length;
  const conversion = leads.length ? clientes / leads.length : 0;

  const porCurso = cursos.map(c => {
    const ins = activas.filter(i => i.courseId === c.id);
    const ventas = aprobados.filter(p => p.courseId === c.id);
    const ingreso = ventas.reduce((s, p) => s + (Number(p.amount) || 0), 0) + ins.filter(i => i.source === "manual" && i.amount).reduce((s, i) => s + Number(i.amount), 0);
    const costo = recursos.filter(r => r.courseId === c.id).reduce((s, r) => s + (Number(r.cost) || 0), 0);
    const nLec = lecciones.filter(l => l.courseId === c.id).length || c.lessonCount || 0;
    const avances = ins.map(i => nLec ? progreso.filter(p => p.userId === i.userId && p.courseId === c.id).length / nLec : 0);
    const avance = avances.length ? avances.reduce((a, b) => a + b, 0) / avances.length : 0;
    const completaron = avances.filter(a => a >= 1).length;
    const interesados = leads.filter(l => l.courseInterest === c.id).length;
    return { c, inscritos: ins.length, ventas: ventas.length, ingreso, costo, margen: ingreso - costo, avance, completaron, interesados };
  });
  const maxIngreso = Math.max(1, ...porCurso.map(p => p.ingreso));

  // Ventas por mes (últimos 6 meses)
  const meses = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return d; });
  const clave = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const ventasMes = meses.map(m => ({ m, total: aprobados.filter(p => { const f = aFecha(p.date || p.createdAt); return f && clave(f) === clave(m); }).reduce((s, p) => s + (Number(p.amount) || 0), 0) }));
  const maxMes = Math.max(1, ...ventasMes.map(v => v.total));
  const fmtMes = new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" });

  // Embudo
  const etapas = ["nuevo", "contactado", "interesado", "cliente", "perdido"];
  const porEtapa = etapas.map(e => ({ e, n: leads.filter(l => l.stage === e).length }));

  const p = nuevoPanel();
  p.innerHTML = `
    ${MODO_DEMO ? `<div class="mensaje mensaje--alerta mb-5">Modo demo: los reportes se llenan cuando Firebase esté configurado y haya datos reales.</div>` : ""}
    <div class="rejilla rejilla--4 mb-5">
      <div class="estadistica"><div class="estadistica__valor">${formatoCOP(ingresos)}</div><div class="estadistica__etiqueta">Ventas aprobadas (${aprobados.length} pagos)</div></div>
      <div class="estadistica"><div class="estadistica__valor">${activas.length}</div><div class="estadistica__etiqueta">Inscripciones activas · ${usuarios.length} usuarios</div></div>
      <div class="estadistica"><div class="estadistica__valor">${Math.round(conversion * 100)} %</div><div class="estadistica__etiqueta">Conversión (${clientes} clientes ÷ ${leads.length} contactos)</div></div>
      <div class="estadistica"><div class="estadistica__valor">${formatoCOP(porCurso.reduce((s, p) => s + p.margen, 0))}</div><div class="estadistica__etiqueta">Margen total (ingresos − costos)</div></div>
    </div>

    <div class="rejilla rejilla--2 mb-5">
      <div class="tarjeta"><h3>Ventas por mes</h3>${ventasMes.map(v => `<div class="barra-horizontal"><span>${fmtMes.format(v.m)}</span><div class="progreso"><div class="progreso__barra" style="width:${Math.round(v.total / maxMes * 100)}%"></div></div><span class="num">${formatoCOP(v.total)}</span></div>`).join("")}</div>
      <div class="tarjeta"><h3>Embudo del CRM</h3>${porEtapa.map(p => `<div class="barra-horizontal"><span style="text-transform:capitalize">${p.e}</span><div class="progreso"><div class="progreso__barra" style="width:${leads.length ? Math.round(p.n / leads.length * 100) : 0}%"></div></div><span class="num">${p.n}</span></div>`).join("")}</div>
    </div>

    <div class="tarjeta mb-5"><h3>Por curso</h3>
      <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Curso</th><th class="num">Interesados</th><th class="num">Inscritos</th><th class="num">Ventas</th><th class="num">Ingresos</th><th class="num">Costos</th><th class="num">Margen</th><th class="num">Avance prom.</th><th class="num">Completaron</th></tr></thead>
      <tbody>${porCurso.map(p => `<tr><td><strong>${escapar(p.c.title)}</strong><div class="progreso mt-3" style="max-width:220px"><div class="progreso__barra" style="width:${Math.round(p.ingreso / maxIngreso * 100)}%"></div></div></td>
        <td class="num">${p.interesados}</td><td class="num">${p.inscritos}</td><td class="num">${p.ventas}</td><td class="num">${formatoCOP(p.ingreso)}</td><td class="num">${formatoCOP(p.costo)}</td>
        <td class="num" style="color:${p.margen >= 0 ? "var(--exito)" : "var(--error)"}"><strong>${formatoCOP(p.margen)}</strong></td><td class="num">${Math.round(p.avance * 100)} %</td><td class="num">${p.completaron}</td></tr>`).join("")}</tbody></table></div>
    </div>

    <div class="tarjeta"><h3>Últimos pagos</h3>
      <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Fecha</th><th>Correo</th><th>Curso</th><th class="num">Valor</th><th>Estado</th><th>ID Mercado Pago</th></tr></thead>
      <tbody>${pagos.sort((a, b) => (aFecha(b.date)?.getTime() || 0) - (aFecha(a.date)?.getTime() || 0)).slice(0, 15).map(p => `<tr><td>${formatoFecha(aFecha(p.date || p.createdAt))}</td><td class="texto-sm">${escapar(p.email || p.userId)}</td><td class="texto-sm">${escapar(cursos.find(c => c.id === p.courseId)?.title || p.courseId)}</td><td class="num">${formatoCOP(p.amount)}</td><td><span class="insignia ${p.status === "approved" ? "insignia--exito" : p.status === "rejected" ? "insignia--error" : "insignia--alerta"}">${escapar(p.status)}</span></td><td class="texto-xs">${escapar(p.id)}</td></tr>`).join("") || `<tr><td colspan="6" class="texto-suave">Sin pagos registrados.</td></tr>`}</tbody></table></div>
    </div>`;
}
