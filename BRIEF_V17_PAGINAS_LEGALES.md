# Brief V0.17 · Publicar las páginas legales

*Brief autocontenido para un agente de Claude Code. Hace que las tres doctrinas legales canónicas se sirvan como páginas reales en simioplateado.com en lugar de redirigirse al `/galeria` (problema confirmado en producción el 2026-05-28). Versión 1.0.*

---

## 0 · Problema y objetivo

**Problema confirmado en producción:** las rutas `/legal/privacidad`, `/legal/terminos` y `/legal/uso-imagen` no existen — el SPA las redirige a `/galeria`. Los textos legales canónicos están escritos y son buenos, viven en `doctrina/`, pero **no son accesibles para los clientes**. Eso incumple Habeas Data Colombia y GDPR (la política debe ser accesible), y daña la credibilidad.

**Objetivo:** publicar los tres documentos como páginas estáticas accesibles en:

- `https://simioplateado.com/legal/privacidad`
- `https://simioplateado.com/legal/terminos`
- `https://simioplateado.com/legal/uso-imagen`

Bonitas, ligeras, imprimibles, en línea con la estética de Simio Plateado, y linkadas desde donde tiene que estar (footer del sitio + casillas del checkout).

---

## 1 · Fuente de verdad (NO reescribir el contenido)

Los textos canónicos viven en:

- `doctrina/legal-privacidad.md` → `/legal/privacidad`
- `doctrina/legal-terminos.md` → `/legal/terminos`
- `doctrina/consentimiento-uso-imagen.md` → `/legal/uso-imagen`

**No cambies el texto de fondo.** Solo renderízalo. Si encuentras un typo evidente, repórtalo aparte; no lo "arregles" calladamente — son documentos legales canónicos.

---

## 2 · Decisiones de diseño (no negociables)

1. **Páginas estáticas HTML, NO rutas del SPA.** Razones: legalmente deben ser lo más simples y directas posible, accesibles sin JS, indexables, imprimibles. Cero dependencias.

2. **Carpeta `mockups/legal/`** con tres archivos: `privacidad.html`, `terminos.html`, `uso-imagen.html`. Cloudflare Pages servirá `/legal/privacidad` → `/legal/privacidad.html` automáticamente (clean URLs).

3. **Una CSS compartida** en `mockups/legal/legal.css` (o inlineada en `<style>` de cada página — lo que prefieras, sé consistente). Estilo: papel claro, tipografía serif para los párrafos, monoespaciada para metas/encabezados pequeños, ancho máximo cómodo (~720 px), responsive, imprimible.

4. **Coherencia visual con la marca** sin importar el SPA: el header tiene el logo SIMIO PLATEADO (puede ser el garabato a mano que ya existe en `mockups/assets/...` — buscar `logo-simio` o `brand-wordmark`) y una línea de breadcrumb tipo `Simio Plateado · Legal · Privacidad`. Footer con un link a las otras dos páginas legales y un link a la home.

5. **No incluir analytics, trackers ni cookies** en estas páginas. Coherente con la política misma ("no usamos publicidad invasiva ni cookies de terceros").

---

## 3 · Implementación paso a paso

### Paso 1 · Convertir cada `.md` a HTML

Puedes hacerlo con cualquier conversor Markdown → HTML (pandoc, marked, markdown-it, lo que el agente prefiera). Importante:

- Respeta el orden y estructura de secciones.
- Las tablas del MD deben quedar como `<table>` con estilo decente.
- Los listados con `[ ]` (si los hay) déjalos como bullets normales.
- Conserva los anchors implícitos (los `## 1 · Algo` deben generar `id="1-algo"` o equivalente, para poder linkear directo a secciones).
- Inserta el contenido dentro de la plantilla del Paso 2.

### Paso 2 · Plantilla HTML compartida

Cada página sigue esta estructura (ejemplo `privacidad.html`):

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Política de Privacidad · Simio Plateado</title>
  <meta name="description" content="Política de privacidad de simioplateado.com. Cumple con la Ley 1581 de 2012 (Habeas Data, Colombia) y con el GDPR (UE).">
  <link rel="stylesheet" href="/legal/legal.css">
  <link rel="icon" href="/favicon.ico">
</head>
<body>
  <header class="legal-header">
    <a class="brand" href="/">
      <img src="/assets/logo-simio-pequeño.png" alt="Simio Plateado" width="32" height="32">
      <span>Simio Plateado</span>
    </a>
    <nav class="legal-breadcrumb">
      <a href="/">Inicio</a> · Legal · <strong>Privacidad</strong>
    </nav>
  </header>

  <main class="legal-doc">
    <!-- AQUÍ va el HTML generado a partir del MD -->
  </main>

  <footer class="legal-footer">
    <nav>
      <a href="/legal/terminos">Términos y condiciones</a> ·
      <a href="/legal/uso-imagen">Uso de imagen (ESPEJO)</a> ·
      <a href="/">Volver a la home</a>
    </nav>
    <p class="legal-meta">Última actualización: 18 de mayo de 2026 · Versión 1.0</p>
  </footer>
</body>
</html>
```

(Cambia el `<title>`, `<description>`, el breadcrumb `<strong>Privacidad</strong>` y el contenido `<main>` por los de cada documento.)

Verifica que la ruta del logo exista; si no, usa `mockups/assets/...` el que sí esté disponible. Puedes usar el `brand-wordmark` o el `logo-simio` que ya están en el repo del mockup.

### Paso 3 · CSS (`mockups/legal/legal.css`)

Mínimo y digno, paper-feeling:

```css
:root {
  --paper: #f7f1e4;
  --ink: #1a1a1a;
  --muted: #6b6b6b;
  --gold: #b88a2a;
  --line: rgba(0,0,0,0.12);
}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--paper); color: var(--ink); }
body {
  font-family: Georgia, "Times New Roman", serif;
  line-height: 1.6;
  font-size: 16px;
}
.legal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--line);
  font-family: "Menlo", "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); }
.legal-breadcrumb a { color: var(--muted); text-decoration: none; }
.legal-doc {
  max-width: 720px;
  margin: 40px auto 80px;
  padding: 0 24px;
}
.legal-doc h1 { font-size: 32px; line-height: 1.15; margin-bottom: 6px; }
.legal-doc h2 { font-size: 22px; margin-top: 40px; border-top: 1px solid var(--line); padding-top: 24px; }
.legal-doc h3 { font-size: 16px; margin-top: 24px; font-family: "Menlo", monospace; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.legal-doc p, .legal-doc li { font-size: 16px; }
.legal-doc table { border-collapse: collapse; width: 100%; margin: 18px 0; font-size: 14.5px; }
.legal-doc th, .legal-doc td { border: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top; }
.legal-doc th { background: rgba(0,0,0,0.04); font-family: "Menlo", monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
.legal-doc code { background: rgba(0,0,0,0.06); padding: 2px 5px; border-radius: 3px; font-size: 14px; }
.legal-doc blockquote { border-left: 3px solid var(--gold); margin: 18px 0; padding: 4px 16px; color: var(--muted); font-style: italic; }
.legal-footer {
  border-top: 1px solid var(--line);
  padding: 24px;
  text-align: center;
  font-family: "Menlo", monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.legal-footer nav a { color: var(--muted); text-decoration: none; margin: 0 4px; }
.legal-footer nav a:hover { color: var(--ink); }
.legal-meta { margin-top: 12px; font-size: 11px; }
@media print {
  .legal-header, .legal-footer { border: 0; }
  .legal-header nav, .legal-footer nav { display: none; }
  body { background: #fff; }
}
```

### Paso 4 · Routing en `mockups/_redirects`

El archivo actual tiene solo `/*  /index.html  200`. Agregar reglas explícitas ANTES de la catch-all:

```
# Páginas legales (estáticas, fuera del SPA)
/legal/privacidad     /legal/privacidad.html     200
/legal/terminos       /legal/terminos.html       200
/legal/uso-imagen     /legal/uso-imagen.html     200

# Catch-all SPA (debe ir al final)
/*  /index.html  200
```

(Cloudflare Pages aplica las reglas por orden y para cada solicitud se queda con la primera que matchea.)

### Paso 5 · Linkear las páginas desde el sitio

En `mockups/index.html`:

1. **Footer:** localizar el footer del SPA y asegurarse de que tenga los tres links a las páginas legales. Si no hay footer claro, agregar uno minimal al final del `<body>` con: `Política de privacidad · Términos · Uso de imagen · contacto@simioplateado.com`. Mantenerlo discreto, en monoespaciada chica, fondo neutro.

2. **Checkout — checkboxes de aceptación:** los formularios de compra ya mencionan "Términos y Política de privacidad" en el texto de la `preorder-hint`. Hacer que esas menciones queden como links reales (`<a href="/legal/terminos" target="_blank" rel="noopener">Términos</a>`, etc.) en TODOS los formularios de checkout del index (modal y página de Tienda). Buscar `data-i18n="checkout.copy*"` y revisar también las traducciones EN.

3. **Wizard de ESPEJO (cuando exista):** ahí se firma el consentimiento. Asegurarse de que en ese paso 4 haya un link explícito a `/legal/uso-imagen` que abre en nueva pestaña.

### Paso 6 · Probar local

```bash
# desde la raíz del repo
cd mockups
python3 -m http.server 8000
# navegar a:
#   http://localhost:8000/legal/privacidad.html
#   http://localhost:8000/legal/terminos.html
#   http://localhost:8000/legal/uso-imagen.html
```

Verificar que:

- Se ven bien en desktop y mobile (responsive).
- Las tablas se renderizan limpias.
- Los links del footer funcionan entre las tres páginas y a `/`.
- Print preview da una página decente (Cmd+P).

(Las clean URLs sin `.html` solo funcionan en producción con `_redirects`; local con `python3 -m http.server` no las soporta, eso es normal.)

### Paso 7 · Commit + push

Mensaje sugerido:

```
Publicar páginas legales (privacidad, términos, uso-imagen)

- HTML estático generado desde doctrina/*.md
- CSS compartida en mockups/legal/legal.css
- _redirects con rutas /legal/* explícitas
- Links agregados en footer y en checkout
```

El push a `main` dispara la GH Action de Pages y despliega a producción en ~2 minutos.

---

## 4 · Verificación en producción (no opcional)

Después del deploy:

```bash
for url in \
  "https://simioplateado.com/legal/privacidad" \
  "https://simioplateado.com/legal/terminos" \
  "https://simioplateado.com/legal/uso-imagen" \
; do
  echo "=== $url ==="
  curl -sI "$url" | head -3
done
```

Esperar:

- Status HTTP `200`.
- `Content-Type: text/html`.
- NO debe redirigir a `/galeria`.

Luego abrir cada una en el navegador y confirmar:

- Se ve bien, sin caracteres rotos (acentos, comillas).
- Los emails que aparecen son `el@simioplateado.com` (corregimos el `juan@` el 2026-05-28, debe estar bien en los `.md` actuales).
- Los links cruzados entre las tres páginas funcionan.
- El link a la home funciona.

Si todo pasa: cerrar tarea. Si algo falla en producción aunque local estuviera bien, lo más probable es que el orden de `_redirects` esté mal o que falte un archivo en la build.

---

## 5 · Lo que NO hace este brief

- No agrega capítulo de cookies con banner (no aplica; el sitio no usa cookies de tracking).
- No internacionaliza las páginas a inglés (eso será V0.11, brief pendiente).
- No reescribe el contenido legal (es canónico, vive en `doctrina/`).
- No mueve la doctrina del repo (los `.md` siguen siendo la fuente; las HTML son derivadas).

---

## 6 · Quien hace qué

**Agente (tú):**

- [ ] Convertir los 3 `.md` a 3 `.html` en `mockups/legal/`.
- [ ] Crear `mockups/legal/legal.css`.
- [ ] Actualizar `mockups/_redirects`.
- [ ] Agregar links en el footer del index y en los textos de checkout (modal + Tienda).
- [ ] Probar local con `python3 -m http.server`.
- [ ] Commit + push.
- [ ] Verificar en producción con `curl` y manualmente.

**Juan:**

- [ ] Leer las páginas publicadas y confirmar que se ven dignas.
- [ ] Reportar cualquier typo o cambio de fondo para iterar el `.md` (no la HTML directamente).

---

*Brief creado 2026-05-28 · Versión 1.0. Acompaña a V0.16 (watchdog) y V0.15 (MercadoPago). Si encuentras una contradicción entre este brief y el código actual, prioriza el código actual y comenta la discrepancia al final del PR.*
