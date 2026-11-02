#!/usr/bin/env bash
# Crea las 59 actividades del backlog como Issues de GitHub, con Milestone por sprint
# y etiquetas por módulo/prioridad/tamaño. Requiere GitHub CLI autenticado: `gh auth login`.
#
# Uso:  bash scripts/crear-issues.sh                 # todos los sprints
#       bash scripts/crear-issues.sh "Sprint 1"      # solo un sprint
#
# Después, en la pestaña Projects del repositorio: New project → Board → agrega los Issues
# y crea las columnas Backlog · Por hacer · En progreso · En revisión · Hecho.

set -euo pipefail
REPO="andresdromero6-alt/lms-AMARAM-TVs-AC"
CSV="$(dirname "$0")/../docs/backlog.csv"
FILTRO="${1:-}"

echo "→ Creando milestones…"
for m in "Sprint 0 · Preparar el terreno" "Sprint 1 · Diseñar y maquetar" "Sprint 2 · Usuarios y datos" \
         "Sprint 3 · Aula virtual" "Sprint 4 · Pagos y CRM" "Sprint 5 · Recursos y lanzamiento"; do
  gh api -X POST "repos/$REPO/milestones" -f title="$m" >/dev/null 2>&1 || true
done

echo "→ Creando etiquetas…"
crear_label() { gh label create "$1" --color "$2" --repo "$REPO" --force >/dev/null 2>&1 || true; }
crear_label "Obligatorio" "d73a4a"; crear_label "Deseable" "0e8a16"
crear_label "S" "c5def5"; crear_label "M" "bfd4f2"; crear_label "L" "5319e7"
for mod in "Gestión ágil" "Configuración" "GitHub" "Contenido" "Arquitectura" "Experiencia (UX)" "Marca" \
           "Mercadeo" "LMS" "CRM" "Publicación" "Documentación" "Usuarios" "Datos" "Seguridad" "Pagos" \
           "Recursos" "Reportes" "Legal" "Calidad"; do crear_label "$mod" "2ec4b6"; done

echo "→ Creando issues…"
python3 - "$CSV" "$FILTRO" <<'PY' | while IFS=$'\t' read -r id sprint actividad modulo rol prioridad tam criterio; do
import csv, sys
csv_path, filtro = sys.argv[1], sys.argv[2]
with open(csv_path, encoding="utf-8") as f:
    for r in csv.DictReader(f):
        if filtro and not r["Sprint"].startswith(filtro):
            continue
        print("\t".join([r["ID"], r["Sprint"], r["Actividad"], r["Módulo"], r["Rol responsable"],
                         r["Prioridad"], r["Tamaño"], r["Criterio de aceptación"]]))
PY
  body="**Sprint:** $sprint
**Módulo:** $modulo · **Rol responsable:** $rol · **Tamaño:** $tam

### Criterio de aceptación
$criterio

### Definición de hecho
- [ ] Cumple el criterio de aceptación
- [ ] Funciona en celular y computador
- [ ] Está en GitHub con un commit claro
- [ ] Está publicada en el enlace del proyecto
- [ ] Otro integrante la probó"
  gh issue create --repo "$REPO" --title "$id · $actividad" --body "$body" \
    --milestone "$sprint" --label "$prioridad" --label "$tam" --label "$modulo" >/dev/null \
    && echo "  ✓ $id" || echo "  ✗ $id (revisa permisos o etiquetas)"
done
echo "Listo."
