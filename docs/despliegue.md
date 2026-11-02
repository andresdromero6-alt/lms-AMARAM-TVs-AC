# Publicar en GitHub Pages (S1-08) y flujo de trabajo en GitHub

## Publicar
1. En el repositorio: **Settings → Pages**.
2. **Source:** Deploy from a branch · **Branch:** `main` · carpeta `/ (root)` · **Save**.
3. En 1–3 minutos aparece el enlace: `https://andresdromero6-alt.github.io/lms-AMARAM-TVs-AC/`.
4. Cada `git push` a `main` vuelve a publicar automáticamente. Si no ves el cambio: espera 2 minutos y recarga con **Ctrl + Shift + R**.
5. Agrega ese dominio en Firebase → Authentication → Configuración → Dominios autorizados.

> El sitio usa rutas relativas (`css/estilos.css`, `curso.html?id=…`), por eso funciona igual en `localhost`, en GitHub Pages y con dominio propio.

## Probar en el computador
```bash
# cualquiera de estas opciones, desde la carpeta del repositorio
python3 -m http.server 8000        # luego abre http://localhost:8000
npx serve .                        # si tienes Node
```
No abras los `.html` con doble clic (`file://`): los módulos ES y Firebase necesitan un servidor.

## Flujo de ramas y Pull Requests
1. `git checkout -b nombre-de-la-tarea` (ej. `catalogo-cursos`).
2. Trabaja, prueba en celular y computador, `git commit -m "Agrega filtro por categoría al catálogo"`.
3. `git push -u origin nombre-de-la-tarea` → en GitHub, **Compare & pull request** → describe con la plantilla → pide revisión a un compañero.
4. El compañero prueba y aprueba → **Merge** → se publica solo.
5. Mueve el Issue a **Hecho** en el tablero.

Con **GitHub Desktop** todo esto se hace con botones: Current branch → New branch · Commit · Push · Create Pull Request.

## Tablero (GitHub Projects)
Pestaña **Projects → New project → Board** → columnas: `Backlog`, `Por hacer`, `En progreso`, `En revisión`, `Hecho`. Agrega los Issues creados con `scripts/crear-issues.sh` (o a mano) y usa los Milestones `Sprint 0…5` para filtrar.
