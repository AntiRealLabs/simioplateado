# Brief V0.19.2 · Routing de páginas legales + sección Legal en el footer

*Brief autocontenido para un agente de Claude Code / Codex. Arregla el bug encontrado en la auditoría del 31 may 2026: las rutas `/legal/privacidad`, `/legal/terminos` y `/legal/uso-imagen` redirigen a `/galeria` porque la SPA no las maneja, y el footer no tiene ningún link legal. Esto pone a Anti Real Labs S.A.S. en violación de la Ley 1581 de 2012 de Colombia y de los requisitos de uso del Pixel de Meta. **Prioridad: CRÍTICA — riesgo legal real.** Versión 1.0 · 2026-05-31.*

---

## 0 · Contexto (léelo antes de tocar nada)

Durante la auditoría en vivo del 31 may 2026 se hicieron dos descubrimientos relacionados con páginas legales:

**Descubrimiento 1:** Se navegó a `https://simioplateado.com/legal/privacidad`, `/legal/terminos` y `/legal/uso-imagen`. Las tres devuelven HTTP 200 (porque Cloudflare Pages sirve el `index.html` de la SPA para cualquier ruta no estática), pero el JavaScript del cliente no reconoce esas rutas y cae al default (galería). El usuario nunca ve la política de privacidad, los términos, ni el consentimiento de uso de imagen.

**Descubrimiento 2:** Se inspeccionó el footer del sitio con JavaScript:

```js
document.querySelector('footer a[href*="legal"], footer a[href*="privacidad"], footer a[href*="terminos"]')
// → null
```

El footer tiene secciones de CATÁLOGO, LECTURA, TIENDA, IDIOMA — pero **ningún link** a privacidad, términos o uso de imagen. No hay forma de que un usuario llegue al contenido legal aunque las rutas funcionaran.

Implicaciones legales y de plataformas:

- **Ley 1581 de 2012 de Colombia (Protección de Datos Personales):** todo responsable del tratamiento de datos personales debe tener una política de privacidad publicada, accesible, y comunicada a los titulares en el momento de la recolección. El sitio cumple lo segundo (informa al pagar) pero NO lo primero (no es accesible).
- **Estatuto del Consumidor (Ley 1480 de 2011):** los términos y condiciones de venta deben estar disponibles al consumidor antes de la transacción.
- **Política de Plataformas de Meta:** Pixel requiere política de privacidad accesible que mencione el uso de tecnologías de tracking. Si Meta audita y no la encuentra, puede suspender el Pixel.
- **MercadoPago:** puede pedir T&C visibles para mantener cuentas comerciales activas.

Lo que ya existe:

- `doctrina/legal-privacidad.md` — política de privacidad canónica (markdown).
- `doctrina/legal-terminos.md` — términos y condiciones canónicos (markdown).
- `doctrina/consentimiento-uso-imagen.md` — consentimiento ESPEJO PLATEADO (markdown).
- `mockups/index.html` — SPA frontend con router client-side.
- Brief V0.17 está marcado completed pero la implementación no llegó al cliente (es decir, el contenido se generó pero el routing y el footer no se actualizaron).

---

## 1 · Objetivo

Hacer que las tres páginas legales sean accesibles desde la SPA, con contenido real renderizado desde los archivos canónicos de `doctrina/`, y agregar una sección "Legal" en el footer con los tres links permanentes. Cuando termine este brief, cualquier persona del público debe poder llegar a la política de privacidad de Simio Plateado en menos de 3 clicks desde la home, y la URL directa debe funcionar.

---

## 2 · Decisiones de diseño (no negociables)

### 2.1 · Las páginas legales son rutas SPA, no archivos HTML estáticos

Igual que `/gracias` (Brief V0.19.1), las páginas legales viven dentro del router de `mockups/index.html`. Cuando el router detecta `/legal/privacidad`, `/legal/terminos` o `/legal/uso-imagen`, renderiza la vista correspondiente con el contenido del markdown canónico de `doctrina/`.

### 2.2 · El contenido se sirve desde los `.md` canónicos, NO duplicado en JS

**No copiar el texto de los markdowns dentro del `index.html`.** El contenido debe leerse de los archivos `.md` de `doctrina/` en tiempo de build (o en tiempo de runtime con un `fetch`), para que cuando se actualice la política, no haya que tocar el frontend.

Opciones:

- **Opción A (recomendada):** un step de build que lee los `.md` y los convierte a HTML, los guarda como assets en `public/legal/privacidad.html`, `terminos.html`, `uso-imagen.html`. El frontend hace `fetch('/legal-content/privacidad.html')` en runtime y los inyecta en la vista.
- **Opción B:** servir los `.md` raw via fetch y renderizar con una librería de markdown en cliente (ej `marked.js` desde CDN).

Usar opción A. Es más predecible, no requiere librería adicional cargada en cada visita, y el HTML pre-renderizado es indexable por Google.

### 2.3 · Las URLs deben ser canónicas y compartibles

`/legal/privacidad`, `/legal/terminos`, `/legal/uso-imagen` son las URLs oficiales. Cuando alguien las pega en el navegador (o las comparte por WhatsApp), deben mostrar el contenido. No se permite redirigir a una URL con hash o query.

### 2.4 · Footer obligatorio con sección "Legal"

El footer existente tiene CATÁLOGO, LECTURA, TIENDA, IDIOMA. Hay que agregar una **quinta columna** o sección llamada **"LEGAL"** que contenga:

- Política de privacidad → `/legal/privacidad`
- Términos y condiciones → `/legal/terminos`
- Uso de imagen (ESPEJO) → `/legal/uso-imagen`

Estos links deben aparecer en TODAS las páginas del sitio (la SPA renderiza el footer una vez, así que debería ser automático una vez agregada la sección).

### 2.5 · OG tags y `<title>` por cada página legal

Cuando alguien comparte el link de la política de privacidad por WhatsApp o Slack, el preview debe ser específico, no el genérico del sitio. En cada vista legal, actualizar dinámicamente:

```js
document.title = 'Política de privacidad · Simio Plateado';
document.querySelector('meta[property="og:title"]').content = 'Política de privacidad · Simio Plateado';
document.querySelector('meta[property="og:description"]').content = 'Política de tratamiento de datos personales y privacidad de Simio Plateado, sub-marca de Anti Real Labs S.A.S. en Colombia.';
```

Y equivalente para términos y uso de imagen.

### 2.6 · La política de privacidad debe mencionar el Pixel

Esto YA debería estar en `doctrina/legal-privacidad.md` después del Brief V0.18, pero confirmarlo. La sección debe decir algo como:

> "Utilizamos el Pixel de Meta (Facebook/Instagram) para medir la efectividad de nuestra publicidad y entender cómo los usuarios interactúan con el sitio. El Pixel envía a Meta información sobre las páginas que visitas, las piezas que ves y las compras que realizas. Podés desactivarlo configurando las preferencias de tu navegador..."

Si NO está en el `.md` de privacidad, este brief incluye también agregar esa sección al markdown.

---

## 3 · Implementación paso a paso

### Paso 1 · Pipeline de build para convertir `.md` → HTML

Si el sitio se construye con un script (revisar `package.json`), agregar un step que use por ejemplo `marked` o `markdown-it`:

```bash
npm install --save-dev marked
```

Y un script `build:legal.js` o equivalente:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

const legalDir = 'doctrina';
const outDir = 'public/legal-content';

const docs = [
  { src: 'legal-privacidad.md', out: 'privacidad.html' },
  { src: 'legal-terminos.md', out: 'terminos.html' },
  { src: 'consentimiento-uso-imagen.md', out: 'uso-imagen.html' }
];

await fs.mkdir(outDir, { recursive: true });
for (const d of docs) {
  const md = await fs.readFile(path.join(legalDir, d.src), 'utf-8');
  const html = marked.parse(md);
  await fs.writeFile(path.join(outDir, d.out), html);
}
console.log('Legal docs built.');
```

Agregar este step al pipeline de Cloudflare Pages (en `package.json` como `npm run build:legal` invocado antes del build principal, o como parte del comando de build de Pages).

Si el sitio no tiene proceso de build (es solo HTML estático servido), entonces servir los `.md` directamente y renderizar con `marked` en cliente (Opción B de la sección 2.2). En ese caso saltar al Paso 2 directamente.

### Paso 2 · Agregar rutas al router client-side

En el router SPA de `mockups/index.html`, añadir:

```js
const routes = {
  '/': renderHome,
  '/galeria': renderGaleria,
  '/tienda': renderTienda,
  '/tienda/:slug': renderProducto,
  '/gracias': renderGracias,                  // viene del Brief V0.19.1
  '/legal/privacidad': () => renderLegal('privacidad'),
  '/legal/terminos': () => renderLegal('terminos'),
  '/legal/uso-imagen': () => renderLegal('uso-imagen'),
};
```

Asegurarse de que el catch-all (que renderiza la galería por default) NO matchee `/legal/*`.

### Paso 3 · Función `renderLegal(slug)`

```js
const LEGAL_META = {
  'privacidad': {
    title: 'Política de privacidad',
    fullTitle: 'Política de privacidad · Simio Plateado',
    description: 'Política de tratamiento de datos personales y privacidad de Simio Plateado, sub-marca de Anti Real Labs S.A.S. en Colombia.',
    file: 'privacidad.html'
  },
  'terminos': {
    title: 'Términos y condiciones',
    fullTitle: 'Términos y condiciones · Simio Plateado',
    description: 'Términos y condiciones de venta de piezas físicas y digitales de Simio Plateado.',
    file: 'terminos.html'
  },
  'uso-imagen': {
    title: 'Consentimiento de uso de imagen',
    fullTitle: 'Consentimiento de uso de imagen · Simio Plateado',
    description: 'Consentimiento explícito de uso de imagen para ESPEJO PLATEADO de Simio Plateado.',
    file: 'uso-imagen.html'
  }
};

async function renderLegal(slug) {
  const meta = LEGAL_META[slug];
  if (!meta) return renderGaleria();

  // Actualizar metadatos para SEO/sharing
  document.title = meta.fullTitle;
  setMeta('og:title', meta.fullTitle);
  setMeta('og:description', meta.description);
  setMeta('description', meta.description);

  // Mostrar shell con loading
  const root = document.querySelector('#app-root');
  root.innerHTML = `
    <main class="page-legal">
      <header class="legal-header">
        <h1>${meta.title}</h1>
      </header>
      <article class="legal-body" id="legal-content">
        <p class="loading">Cargando…</p>
      </article>
      <footer class="legal-footer">
        <p>Si tenés preguntas sobre este documento, escribí a <a href="mailto:el@simioplateado.com">el@simioplateado.com</a>.</p>
        <a href="/" class="btn-secundario">Volver al inicio</a>
      </footer>
    </main>
  `;

  // Cargar contenido
  try {
    const res = await fetch(`/legal-content/${meta.file}`);
    if (!res.ok) throw new Error('Documento no disponible');
    const html = await res.text();
    document.querySelector('#legal-content').innerHTML = html;
  } catch (e) {
    document.querySelector('#legal-content').innerHTML = `
      <p>No pudimos cargar este documento en este momento. Por favor escribinos a <a href="mailto:el@simioplateado.com">el@simioplateado.com</a> y te enviamos una copia.</p>
    `;
  }
}

function setMeta(prop, content) {
  const isOg = prop.startsWith('og:');
  const selector = isOg ? `meta[property="${prop}"]` : `meta[name="${prop}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (isOg) el.setAttribute('property', prop); else el.setAttribute('name', prop);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
```

### Paso 4 · CSS de las páginas legales

```css
.page-legal {
  max-width: 760px;
  margin: 60px auto 120px;
  padding: 0 24px;
  font-size: 16px;
  line-height: 1.65;
  color: #1a1a1a;
}
.page-legal h1 { font-size: 36px; margin-bottom: 8px; }
.page-legal .legal-header { border-bottom: 1px solid #ddd; padding-bottom: 24px; margin-bottom: 40px; }
.page-legal h2 { font-size: 22px; margin: 40px 0 12px; }
.page-legal h3 { font-size: 18px; margin: 24px 0 8px; }
.page-legal p { margin-bottom: 16px; }
.page-legal ul, .page-legal ol { margin: 0 0 16px 24px; }
.page-legal li { margin-bottom: 8px; }
.page-legal a { color: #1a73e8; text-decoration: underline; }
.page-legal code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
.page-legal blockquote { border-left: 3px solid #888; padding-left: 16px; margin: 16px 0; color: #555; font-style: italic; }
.page-legal .legal-footer { margin-top: 60px; padding-top: 32px; border-top: 1px solid #ddd; }
.page-legal .btn-secundario {
  display: inline-block; margin-top: 16px; padding: 10px 20px;
  border: 1px solid #000; color: #000; text-decoration: none;
}
```

### Paso 5 · Agregar sección "LEGAL" al footer

Encontrar el componente/HTML del footer en la SPA. Tiene actualmente CATÁLOGO, LECTURA, TIENDA, IDIOMA. Agregar una quinta sección entre TIENDA e IDIOMA (o donde estéticamente quede mejor):

```html
<section class="footer-col">
  <h3>LEGAL</h3>
  <ul>
    <li><a href="/legal/privacidad">Política de privacidad</a></li>
    <li><a href="/legal/terminos">Términos y condiciones</a></li>
    <li><a href="/legal/uso-imagen">Uso de imagen</a></li>
  </ul>
</section>
```

Asegurarse de que los `<a>` usan el router SPA y no fuerzan recarga completa de página (depende de cómo esté el router; típicamente con `preventDefault` y `history.pushState`).

### Paso 6 · Verificar que el `.md` de privacidad menciona el Pixel

Abrir `doctrina/legal-privacidad.md`. Buscar la palabra "Pixel" o "Meta". Si no aparece, agregar esta sección antes del cierre del documento:

```markdown
## Pixel de Meta (Facebook/Instagram)

Utilizamos el Pixel de Meta para medir la efectividad de nuestra publicidad en Facebook e Instagram y entender el comportamiento de los visitantes en nuestro sitio. El Pixel registra eventos como visualización de páginas, visualización de productos, inicio de compra y compras completadas, junto con información técnica básica (navegador, sistema operativo, dirección IP aproximada).

Estos datos los procesa Meta Platforms, Inc. bajo sus propios términos: https://www.facebook.com/about/privacy

Podés desactivar el rastreo del Pixel:

- Configurando tu navegador para bloquear cookies de terceros.
- Usando una extensión de bloqueo de tracking (uBlock Origin, Privacy Badger, etc.).
- Ajustando tus preferencias de anuncios en Meta: https://www.facebook.com/ads/preferences

El uso del Pixel no afecta tu capacidad de comprar en nuestro sitio.
```

Esto activa el step de build (paso 1) automáticamente la próxima vez que se despliegue.

### Paso 7 · Crear un sitemap.xml con las rutas legales

Para que Google indexe las páginas legales (y Meta las pueda encontrar al verificar el Pixel), agregar a `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://simioplateado.com/</loc></url>
  <url><loc>https://simioplateado.com/tienda</loc></url>
  <url><loc>https://simioplateado.com/legal/privacidad</loc></url>
  <url><loc>https://simioplateado.com/legal/terminos</loc></url>
  <url><loc>https://simioplateado.com/legal/uso-imagen</loc></url>
</urlset>
```

Si ya existe un sitemap, solo agregar las 3 URLs legales si no están.

---

## 4 · Criterios de aceptación

Antes de hacer merge:

- [ ] Navegar a `https://simioplateado.com/legal/privacidad` (URL directa, escrita en el navegador) renderiza la política de privacidad con el contenido completo del `.md` canónico, formateado con headings, listas y links.
- [ ] Misma verificación para `/legal/terminos` y `/legal/uso-imagen`.
- [ ] El `<title>` y los OG tags cambian dinámicamente en cada vista legal.
- [ ] El footer del sitio (en cualquier página) muestra la sección "LEGAL" con los tres links activos y clickeables, que navegan via el router SPA sin recarga de página.
- [ ] `view-source:https://simioplateado.com/sitemap.xml` lista las tres rutas legales.
- [ ] La política de privacidad menciona explícitamente el Pixel de Meta y cómo desactivarlo.
- [ ] Compartir el link de privacidad por WhatsApp muestra preview específico (no el genérico del sitio).
- [ ] Una búsqueda de "site:simioplateado.com privacidad" en Google (después de 1-2 semanas de indexación) devuelve la página de privacidad.

---

## 5 · Verificación post-deploy (responsabilidad del agente)

Reportar a Juan con capturas:

1. Captura de la URL directa `https://simioplateado.com/legal/privacidad` mostrando el contenido renderizado.
2. Captura del footer mostrando la sección "LEGAL" con los tres links.
3. Captura de DevTools → Elements mostrando que `<title>` y `<meta property="og:title">` cambiaron correctamente en una vista legal.
4. Output de `curl -I https://simioplateado.com/legal-content/privacidad.html` mostrando 200 OK (si se usó Opción A del build).
5. Captura del sitemap servido con las URLs legales presentes.

---

## 6 · Lo que NO hace este brief

- **No reescribe el contenido de las políticas.** El contenido canónico vive en `doctrina/*.md`. Si hay que actualizarlo (por ejemplo, mencionar el Pixel), se actualiza el `.md`, no el HTML generado.
- **No traduce las páginas legales al inglés.** Eso es Brief V0.11 (versión en inglés del sitio).
- **No agrega banner de consentimiento de cookies.** Hoy el sitio no usa cookies de tracking que requieran consentimiento explícito en Colombia (basta con la política accesible). Si en algún momento se agregan cookies que requieran opt-in explícito (ej GDPR para visitantes europeos), eso será otro brief.
- **No toca el Worker.** Todo este brief es frontend + un step de build opcional.

---

## 7 · Notas finales para el agente

- **Email correcto:** `el@simioplateado.com`. NO uses `juan@simioplateado.com`.
- **El contenido legal es sensible.** No reescribas párrafos a tu gusto. Si encontrás algo que parece mal redactado o inconsistente en los `.md`, anotálo al final del PR como "Hallazgo: revisar redacción de sección X del archivo Y" — pero NO lo modifiques en este PR. La redacción legal la revisa Juan o un abogado.
- **No autoejecutes deploy a main.** Deja PR listo y pedile a Juan que apruebe.
- **Si el build de Cloudflare Pages no soporta el step de Node.js**, usá Opción B (renderizar los `.md` en cliente con `marked` desde CDN). Documenta cuál opción usaste en el PR.
- **Verificá que los links del footer funcionen en SPA-mode**, es decir que `preventDefault()` el click y usen `history.pushState`. Si fuerzan recarga, perdés el estado de la SPA y la experiencia se siente lenta.
- **Brief V0.19.1 (gracias) y V0.19 (fix Pixel) se pueden hacer en paralelo**, no hay dependencia entre ellos. Solo este brief depende de los archivos `doctrina/*.md` (que ya existen).

---

*Brief V0.19.2 creado 2026-05-31 a partir de auditoría en vivo. Acompaña al Brief V0.19 (fix Pixel) y al Brief V0.19.1 (página /gracias + watchdog). Los tres son ortogonales y se pueden implementar simultáneamente.*
