# Brief V0.22 · Performance audit + fixes · simioplateado.com

*Brief autocontenido para un agente de Claude Code / Codex. Resuelve el problema más crítico de toda la operación: el sitio carga en 44.9 segundos en mobile (FCP/LCP). El 87 % del tráfico es Android desde TikTok y nunca espera ese tiempo. **Prioridad: MÁXIMA · bloqueador raíz de todo el embudo. Más urgente que Pixel, checkout o cualquier brief anterior.** Versión 1.0 · 2026-06-16.*

---

## 0 · Contexto (léelo antes de tocar nada)

El 16 de junio de 2026 se hizo auditoría real con dos herramientas independientes:

**PageSpeed Insights (Google Lighthouse) · mobile (Moto G Power emulado, 4G lenta):**

- Performance Score: **35/100** (rojo crítico).
- First Contentful Paint: **44.9 s** (benchmark sano <1.8 s).
- Largest Contentful Paint: **44.9 s** (benchmark sano <2.5 s).
- Total Blocking Time: **840 ms** (benchmark sano <200 ms).
- Speed Index: **44.9 s**.
- CLS: 0.022 (verde — único punto sano).
- **Payload total descargado: 72,380 KiB ≈ 72 MB.**

**PageSpeed Insights · desktop:**

- Performance Score: **50/100** (amarillo).
- FCP / LCP: **7.3 s** (4 veces el benchmark).
- TBT: 190 ms (apenas dentro de rango).
- Speed Index: 7.3 s.

**Cloudflare Web Analytics · últimos 30 días:**

- Visitantes únicos: 11.5k.
- Tiempo de carga P75 desde TikTok: 38 s.
- Tiempo de carga P75 desde Android: 35 s.
- Mobile = 87 % del tráfico, Android = 73 %.
- TikTok = canal #1 (1.7k de 2.6k referrers).

**Implicación matemática:** un sitio que tarda 30-45 segundos en mobile pierde el 90+ % de los visitantes antes de mostrar nada. Los 11.5k visitantes únicos de Cloudflare se convierten en ~10 visitas a `/tienda` y ~20 a `/encargos` precisamente por esto. **El embudo no está roto por mala UX o mal Pixel. Está roto porque el sitio físicamente no se carga.**

Ningún otro brief (V0.19 fix Pixel, V0.19.1 /gracias, V0.19.2 legales, V0.20 internacional, V0.21 encargos con Tripo) tiene impacto medible hasta que este se ejecute primero. Por eso este brief es prioridad máxima.

**Causa raíz identificada por Lighthouse:**

1. **Mejora la entrega de imágenes:** ahorro estimado **12,091 KiB en mobile / 15,382 KiB en desktop**. Esto es el problema #1 absoluto.
2. **Reduce el código JavaScript sin usar:** ahorro **449 KiB**.
3. **Evita cargas útiles de red de gran tamaño:** total era **72,380 KiB**.
4. **Reduce el código CSS sin usar:** ahorro **56 KiB**.
5. **Usa tiempos de almacenamiento en caché eficientes:** ahorro **175 KiB**.
6. **Minimiza el trabajo del hilo principal:** 2.8 s en mobile.
7. **Reduce el tiempo de ejecución de JavaScript:** 1.3 s en mobile.
8. **Elementos de imagen sin atributos `width` ni `height` explícitos.**
9. **robots.txt no es válido — 3.110 errores** (probablemente está devolviendo el HTML de la SPA en lugar de texto plano).
10. **Faltan mapas de orígenes para el archivo JavaScript grande propio.**

Lo que ya existe en el repo:

- `mockups/index.html` — SPA frontend.
- `mockups/assets/` — carpeta de imágenes (probablemente PNG grandes sin optimizar).
- `workers/simio-sondeo/worker.js` — Worker que sirve el sitio detrás de Cloudflare.
- `<model-viewer>` cargado desde `unpkg.com/@google/model-viewer@4.2.0` (probablemente bloqueando render).
- Cloudflare Pages + Worker delante (cache parcialmente configurada, solo 38.88 % cacheado).

---

## 1 · Objetivo

Llevar el sitio de **Performance Score 35 → 80+ en mobile**, FCP de **44.9 s → menos de 3 s**, payload total de **72 MB → menos de 5 MB**, sin sacrificar el contenido visual ni la estética del catálogo.

Métricas medibles (objetivo verificable post-deploy en PageSpeed Insights mobile):

| Métrica | Antes | Objetivo | Crítico |
|---|---|---|---|
| Performance Score | 35 | ≥80 | ≥70 |
| FCP | 44.9 s | <3 s | <5 s |
| LCP | 44.9 s | <4 s | <6 s |
| TBT | 840 ms | <300 ms | <500 ms |
| Payload total | 72.4 MB | <5 MB | <10 MB |
| CLS | 0.022 | mantener <0.1 | <0.1 |

---

## 2 · Decisiones de diseño (no negociables)

### 2.1 · Orden estricto de prioridad

Si el tiempo es limitado, el orden de implementación es **inalterable** por impacto medido:

1. **Optimización de imágenes** (resuelve ~60-70 % del problema solo).
2. **Lazy loading + width/height en imágenes** (resuelve CLS futuro y mejora LCP).
3. **JavaScript bundle optimization** (resuelve TBT y FCP secundario).
4. **Cloudflare cache rules** (resuelve visitantes recurrentes).
5. **robots.txt fix** (resuelve SEO).
6. **Critical CSS + preload de recursos críticos** (pulido final).

NO empezar por el #5 o #6 porque el impacto en performance score es marginal sin los #1-3.

### 2.2 · Conservar el aspecto visual exacto

La estética del sitio (logo del simio dibujado a mano, tipografías, animaciones) NO se toca. Solo se cambia **cómo se sirven los assets**, no qué assets son. Si el agente nota que una imagen "se podría diseñar mejor", **fuera de alcance** — Brief V0.20 (UX home) cubre eso, este brief NO.

### 2.3 · Formatos modernos con fallback

Imágenes nuevas se sirven en **AVIF + WebP + PNG/JPG fallback** usando `<picture>` con `<source>`. NO se elimina el PNG/JPG original — se mantiene como fallback para navegadores legacy.

### 2.4 · Lazy loading agresivo

Toda imagen below-the-fold lleva `loading="lazy"`. Las above-the-fold llevan `loading="eager"` + `fetchpriority="high"`. El `<model-viewer>` se carga **después** del FCP (lazy, no en el header).

### 2.5 · No deployar sin medir

Después de cada fix mayor, correr PageSpeed Insights mobile y registrar el delta. Si un fix no mejora score en al menos 5 puntos, revisar implementación antes de pasar al siguiente.

### 2.6 · Cache busting via filenames

Todos los assets versionados (imágenes optimizadas, JS bundles, CSS bundles) llevan **hash en el filename** (`logo.abc123.webp`). Esto permite cache-control de 1 año sin riesgo de servir versión vieja después de actualizar.

---

## 3 · Implementación paso a paso

### Paso 1 · Auditoría inicial de imágenes (5 min)

```bash
cd mockups/assets
find . -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -exec ls -lh {} \; | sort -k5 -h
```

Identificar las imágenes más pesadas. Probables culpables (basado en lo visto en el sitio):

- `logo-simio-plateado-master.png` y variantes.
- Renders de piezas del catálogo (Cor Cogitans, Fatum et Dolor, Copa FLA, etc.).
- Modelos 3D `.glb` del pulpo Kraken Florero u otros.
- Ejemplos de la sección encargos (cuando exista).

Calcular peso total actual.

### Paso 2 · Pipeline de optimización de imágenes con Sharp

Instalar Sharp (Node.js):

```bash
npm install --save-dev sharp glob
```

Crear `scripts/optimize-images.js`:

```js
import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const SRC_DIR = 'mockups/assets/raw';
const OUT_DIR = 'mockups/assets/optimized';

const SIZES = {
  thumb: 320,
  small: 640,
  medium: 1024,
  large: 1920
};

const QUALITY = {
  avif: 60,
  webp: 80,
  jpg: 85
};

async function hashFile(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
}

async function optimizeImage(srcPath) {
  const buffer = await fs.readFile(srcPath);
  const hash = await hashFile(buffer);
  const basename = path.basename(srcPath, path.extname(srcPath));
  const metadata = await sharp(buffer).metadata();

  const results = [];

  for (const [sizeName, width] of Object.entries(SIZES)) {
    if (metadata.width < width) continue; // No upscale

    const baseName = `${basename}.${sizeName}.${hash}`;

    // AVIF (mejor compresión)
    await sharp(buffer)
      .resize(width)
      .avif({ quality: QUALITY.avif, effort: 6 })
      .toFile(path.join(OUT_DIR, `${baseName}.avif`));

    // WebP (fallback principal)
    await sharp(buffer)
      .resize(width)
      .webp({ quality: QUALITY.webp, effort: 6 })
      .toFile(path.join(OUT_DIR, `${baseName}.webp`));

    // JPG (fallback legacy)
    await sharp(buffer)
      .resize(width)
      .jpeg({ quality: QUALITY.jpg, mozjpeg: true })
      .toFile(path.join(OUT_DIR, `${baseName}.jpg`));

    results.push({ size: sizeName, width, baseName });
  }

  return { src: srcPath, hash, results };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await glob(`${SRC_DIR}/**/*.{png,jpg,jpeg}`);
  const manifest = [];
  for (const file of files) {
    console.log(`Optimizing: ${file}`);
    const result = await optimizeImage(file);
    manifest.push(result);
  }
  await fs.writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`Done. Optimized ${files.length} images.`);
}

main().catch(console.error);
```

Agregar al `package.json`:

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js"
  }
}
```

Mover las imágenes originales a `mockups/assets/raw/` (intocables, son la fuente de verdad). Ejecutar:

```bash
npm run optimize:images
```

Esto genera `mockups/assets/optimized/` con todas las variantes en AVIF + WebP + JPG en 4 tamaños (320, 640, 1024, 1920 px) con hash en el nombre.

### Paso 3 · Componente `<Picture>` responsive

En `mockups/index.html`, crear una función helper que genera el `<picture>` correcto para cada imagen:

```js
function renderPicture({ name, alt, lazy = true, priority = false, sizes = '(max-width: 640px) 100vw, 50vw' }) {
  const manifest = window._imageManifest; // cargado al inicio
  const variants = manifest.find(m => m.src.includes(name));
  if (!variants) return `<img src="/assets/${name}" alt="${alt}">`;

  const buildSrcset = (format) => variants.results
    .map(r => `/assets/optimized/${r.baseName}.${format} ${r.width}w`)
    .join(', ');

  const fallback = variants.results.find(r => r.size === 'medium');

  return `
    <picture>
      <source type="image/avif" srcset="${buildSrcset('avif')}" sizes="${sizes}">
      <source type="image/webp" srcset="${buildSrcset('webp')}" sizes="${sizes}">
      <img
        src="/assets/optimized/${fallback.baseName}.jpg"
        srcset="${buildSrcset('jpg')}"
        sizes="${sizes}"
        alt="${alt}"
        loading="${lazy ? 'lazy' : 'eager'}"
        ${priority ? 'fetchpriority="high"' : ''}
        width="${fallback.width}"
        height="auto"
        decoding="async"
      >
    </picture>
  `;
}
```

Reemplazar TODOS los `<img>` actuales del SPA por llamadas a `renderPicture()`. Lista crítica:

- Logo del simio en header → `priority: true, lazy: false`.
- Hero image / primera pieza visible → `priority: true, lazy: false`.
- Resto del catálogo (tienda, galería) → `lazy: true`.
- Imágenes del footer → `lazy: true`.
- Cualquier imagen dentro de `/encargos` o `/legal/*` → `lazy: true`.

**Importante:** las imágenes que están above-the-fold (visibles sin scroll) NO llevan `loading="lazy"` — eso retrasa el LCP. Solo lazy en lo que requiere scroll.

### Paso 4 · `<model-viewer>` cargado en demand, no en header

El componente `<model-viewer>` es pesado (~300 KB de JS + binarios WebGL). Hoy se carga en el `<head>` y bloquea el render.

**Antes (eliminar):**

```html
<script type="module" src="https://unpkg.com/@google/model-viewer@4.2.0/dist/model-viewer.min.js"></script>
```

**Después:**

```js
// Cargar solo cuando un <model-viewer> esté visible
function loadModelViewer() {
  if (window._modelViewerLoaded) return;
  window._modelViewerLoaded = true;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://unpkg.com/@google/model-viewer@4.2.0/dist/model-viewer.min.js';
  document.head.appendChild(script);
}

// IntersectionObserver para detectar cuándo entra en viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadModelViewer();
      observer.disconnect();
    }
  });
});

// Observar el placeholder donde iría el model-viewer
document.querySelectorAll('[data-model-placeholder]').forEach(el => observer.observe(el));
```

En el HTML, donde antes había `<model-viewer src="pulpo.glb">` ahora va:

```html
<div data-model-placeholder data-model-src="/assets/pulpo.glb" style="aspect-ratio: 1; background: #eee;">
  <!-- Placeholder visual mientras el model-viewer carga -->
</div>
```

Después de cargar model-viewer, reemplazar el placeholder por el componente real:

```js
loadModelViewer().then(() => {
  document.querySelectorAll('[data-model-placeholder]').forEach(el => {
    const src = el.dataset.modelSrc;
    el.outerHTML = `<model-viewer src="${src}" camera-controls auto-rotate></model-viewer>`;
  });
});
```

### Paso 5 · Tree-shaking y code-splitting del JavaScript

Si el sitio usa un bundler (Vite, Rollup, esbuild), revisar la configuración:

**Vite ejemplo:**

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-models': ['@google/model-viewer'],
          'vendor-mp': ['mercadopago-sdk-js'], // si existe
        }
      }
    },
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false  // o 'hidden' para production con upload separado
  }
});
```

Si NO hay bundler (el sitio es HTML estático con `<script>` directos), entonces:

1. Identificar el JS más pesado del sitio.
2. Cualquier script no-crítico va con `defer`:
   ```html
   <script defer src="/js/main.js"></script>
   ```
3. Scripts realmente bloqueantes (analytics, error tracking) van con `async`.
4. Inline el JS crítico mínimo en `<script>` dentro del `<head>`.

**Para el SPA actual:** revisar `mockups/index.html` y identificar el bundle principal. Si es un archivo grande monolítico, dividirlo por rutas:

- `main.js` (router + home, carga inmediata).
- `tienda.js` (carga cuando se navega a `/tienda`).
- `encargos.js` (carga cuando se navega a `/encargos`).
- `legal.js` (carga cuando se navega a `/legal/*`).

Usar `import()` dinámico en los handlers de ruta.

### Paso 6 · Cloudflare Cache Rules

En el dashboard de Cloudflare → Caching → Cache Rules, agregar:

**Regla 1: Cache assets versionados agresivamente**

```
Si: URI Path contains "/assets/optimized/" OR URI Path matches ".*\.(webp|avif|jpg|png|js|css)$"
Entonces:
  - Cache: Eligible for cache
  - Edge TTL: 1 year
  - Browser TTL: 1 year
```

**Regla 2: No cachear HTML del SPA**

```
Si: URI Path matches ".*" AND NOT URI Path contains "/api/"
Entonces:
  - Cache: Eligible for cache
  - Edge TTL: 1 hour
  - Browser TTL: 5 minutes
```

**Regla 3: Nunca cachear API**

```
Si: URI Path contains "/api/"
Entonces:
  - Cache: Bypass
```

Adicionalmente, en Cloudflare → Speed → Optimization:

- **Polish: Lossless** (optimiza imágenes server-side automáticamente).
- **Mirage: ON** (optimiza imágenes para mobile).
- **Auto Minify: HTML, CSS, JS** (todos ON).
- **Brotli: ON** (compresión mejor que gzip).
- **Early Hints: ON** (envía hints HTTP 103 antes del HTML completo).

Verificar que el plan actual de Cloudflare soporta Polish y Mirage. Si no, el resto sigue funcionando.

### Paso 7 · Fix `robots.txt`

El error "robots.txt no es válido — 3.110 errores" significa que Cloudflare o el SPA está devolviendo el HTML genérico cuando un crawler pide `/robots.txt`.

**Solución 1 (recomendada):** servir un archivo estático real.

En `public/robots.txt`:

```
User-agent: *
Allow: /

# Bloquear secciones administrativas
Disallow: /api/central
Disallow: /api/

# Sitemap
Sitemap: https://simioplateado.com/sitemap.xml
```

En el Worker (`workers/simio-sondeo/worker.js`), agregar route que sirve este archivo:

```js
if (url.pathname === '/robots.txt') {
  return new Response(ROBOTS_TXT_CONTENT, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
```

Donde `ROBOTS_TXT_CONTENT` es el contenido de arriba como string en el Worker (o leído de R2/KV si preferís dinámico).

**Solución 2 (alternativa):** asegurar que Cloudflare Pages sirva `/public/robots.txt` directamente sin pasar por el SPA. Configurar en `_redirects` o `wrangler.toml`.

### Paso 8 · Generar `sitemap.xml`

Crear `public/sitemap.xml` con las rutas principales:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://simioplateado.com/</loc><priority>1.0</priority></url>
  <url><loc>https://simioplateado.com/tienda</loc><priority>0.9</priority></url>
  <url><loc>https://simioplateado.com/galeria</loc><priority>0.8</priority></url>
  <url><loc>https://simioplateado.com/encargos</loc><priority>0.9</priority></url>
  <url><loc>https://simioplateado.com/legal/privacidad</loc><priority>0.3</priority></url>
  <url><loc>https://simioplateado.com/legal/terminos</loc><priority>0.3</priority></url>
  <url><loc>https://simioplateado.com/legal/uso-imagen</loc><priority>0.3</priority></url>
</urlset>
```

Servir igual que robots.txt (con content-type `application/xml`).

### Paso 9 · Critical CSS inline

Identificar el CSS necesario para renderizar la above-the-fold de la home. Usar herramientas como `critical` de Addy Osmani:

```bash
npm install --save-dev critical
```

```js
// scripts/extract-critical-css.js
import { generate } from 'critical';

await generate({
  base: 'dist/',
  src: 'index.html',
  target: {
    html: 'index.html',
    css: 'critical.css'
  },
  width: 375,  // mobile viewport
  height: 667,
  inline: true
});
```

Esto genera un HTML con el CSS crítico inline en `<style>` dentro del `<head>`, y el resto del CSS cargado de forma async:

```html
<link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/css/main.css"></noscript>
```

### Paso 10 · Preconnect y preload

En el `<head>` del HTML, agregar:

```html
<!-- Preconnect a dominios externos -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://api.simioplateado.com">

<!-- Preload del logo (LCP candidate) -->
<link rel="preload" as="image" href="/assets/optimized/logo-simio.medium.abc123.avif" type="image/avif">

<!-- Preload de la fuente crítica -->
<link rel="preload" as="font" href="/fonts/main.woff2" type="font/woff2" crossorigin>
```

### Paso 11 · Eliminar JavaScript heredado

PageSpeed identificó 23 KiB de "JavaScript heredado" — polyfills para navegadores antiguos que el navegador moderno no necesita.

En el bundler:

```js
// vite.config.js
build: {
  target: 'es2020',  // No transpile a ES5 si no es necesario
}
```

O servir bundles diferenciados con `<script type="module">` para modernos y `<script nomodule>` para legacy (esto reduce el peso para el 95% que son navegadores modernos).

### Paso 12 · Eliminar API obsoletas y warnings

PageSpeed dijo: "Usa API obsoletas — Se encontró 1 advertencia". Resolver leyendo qué API específica está obsoleta. Probablemente algo como `webkitRequestAnimationFrame` o un método deprecated del DOM. Reemplazar por la API moderna.

PageSpeed dijo: "Define el charset adecuadamente — Error". Asegurar que el `<head>` tenga como **primer** elemento:

```html
<meta charset="UTF-8">
```

Antes de cualquier otro `<meta>`, `<title>` o script.

---

## 4 · Criterios de aceptación

Antes de hacer merge a `main`:

- [ ] PageSpeed Insights mobile: **Performance Score ≥ 80**.
- [ ] PageSpeed Insights mobile: **FCP < 3 s**.
- [ ] PageSpeed Insights mobile: **LCP < 4 s**.
- [ ] PageSpeed Insights mobile: **TBT < 300 ms**.
- [ ] PageSpeed Insights mobile: **CLS < 0.1** (mantener el valor actual de 0.022 o mejor).
- [ ] Payload total inicial de la home: **< 5 MB**.
- [ ] Pipeline `npm run optimize:images` funciona y genera AVIF + WebP + JPG en 4 tamaños.
- [ ] Todas las imágenes del catálogo usan `<picture>` con srcset responsive.
- [ ] Todas las imágenes below-the-fold tienen `loading="lazy"`.
- [ ] Todas las imágenes above-the-fold tienen `loading="eager"` + `fetchpriority="high"`.
- [ ] Todas las imágenes tienen `width` y `height` explícitos.
- [ ] `<model-viewer>` se carga solo cuando entra en viewport.
- [ ] Cloudflare Cache Rules configuradas (3 reglas mínimas).
- [ ] `robots.txt` devuelve `text/plain` con contenido válido (no HTML del SPA).
- [ ] `sitemap.xml` accesible y válido.
- [ ] Critical CSS inline en `<head>`.
- [ ] Preconnect a dominios críticos.
- [ ] Charset meta como primer elemento del `<head>`.
- [ ] Visual del sitio NO cambió (logo del simio, tipografías, layout, animaciones idénticas).

---

## 5 · Verificación post-deploy (responsabilidad del agente)

Reportar a Juan con:

1. **Captura de PageSpeed Insights mobile DESPUÉS** del deploy, mostrando los nuevos scores.
2. **Captura de PageSpeed Insights desktop DESPUÉS**.
3. **Comparativa antes/después** en tabla:
   - FCP: 44.9 s → ?
   - LCP: 44.9 s → ?
   - TBT: 840 ms → ?
   - Payload: 72 MB → ?
4. **Output de `curl -I https://simioplateado.com/robots.txt`** mostrando `content-type: text/plain`.
5. **Output de `curl -I https://simioplateado.com/sitemap.xml`** mostrando `content-type: application/xml`.
6. **Lista de imágenes optimizadas** con peso antes/después de cada una.
7. **Captura de Cloudflare Analytics** 24-48 h después del deploy mostrando el cambio en page load time.

Si PageSpeed Score mobile sigue debajo de 70 tras todo, hay algo que se está perdiendo — pedir a Juan que revise antes de cerrar el PR.

---

## 6 · Lo que NO hace este brief

- **NO rediseña la home.** Eso es Brief V0.20 (UX home, separado).
- **NO toca el Pixel ni el checkout.** Briefs V0.19, V0.19.1, V0.19.2 cubren eso.
- **NO implementa la sección encargos.** Eso es Brief V0.21.
- **NO cambia el catálogo de productos.** Visuales y contenido idénticos.
- **NO migra de stack.** Si el sitio es HTML + JS vanilla en Cloudflare Pages, sigue siendo eso. NO migrar a Next.js, Astro, etc.
- **NO toca lighthouse de accesibilidad ni SEO score directamente** (excepto robots.txt). Esos ya están en 91-92.

---

## 7 · Notas finales para el agente

- **Email de contacto:** `el@simioplateado.com`. NO usar `juan@simioplateado.com`.
- **No autoejecutar deploy a `main`.** Dejar PR listo y pedir aprobación de Juan.
- **Si el sitio NO tiene bundler (es HTML estático con scripts directos),** los pasos 5 y 9 cambian: en lugar de configurar Vite/Rollup, hay que dividir manualmente los `<script>` por ruta y usar atributos `defer`/`async`. El resto del brief sigue igual.
- **Probar en mobile real** después del deploy, no solo Lighthouse emulado. Idealmente Android Chrome desde datos móviles (4G) en Medellín. Que Juan use su teléfono y abra el sitio con cronómetro.
- **Si encontrás un asset MUY grande** (modelo 3D de >10 MB, imagen de >5 MB) que sea crítico para la marca, no lo borres — convertilo a formato más eficiente y/o servilo con compresión brotli, pero NO sacrifiques contenido visual por performance.
- **Sharp puede crashear con AVIF en algunas máquinas.** Si pasa, omitir AVIF y servir solo WebP + JPG. El WebP solo ya da 50-70 % de mejora vs PNG/JPG original.
- **El pipeline de imágenes debe correr en CI/CD también**, no solo localmente. Agregar a la GitHub Action de deploy de Cloudflare Pages: `npm run optimize:images` antes de `npm run build`.
- **Sourcemaps:** generar pero NO publicar a producción. Mantenerlos privados (subir a Sentry o similar si se usa error tracking) — eso resuelve el warning "Faltan mapas de orígenes".
- **Si Sharp no está disponible en el entorno**, alternativas: `imagemin` + plugins, `@squoosh/lib`, o ejecutar la conversión manualmente con `cwebp` y `avifenc` por línea de comandos.

---

## 8 · Quick wins inmediatos (si todo lo demás falla)

Si por alguna razón el brief completo no se puede ejecutar en el tiempo disponible, **estos tres cambios solos llevan el score de 35 → ~55-60 en una tarde**:

1. **Comprimir las 10 imágenes más pesadas** (manualmente en Squoosh.app o TinyPNG): convertir a WebP con calidad 80. Reemplazar en HTML. **Impacto: -30 a -50 MB en payload.**
2. **Mover `<model-viewer>` script a `defer` o eliminarlo si no se usa en la home.** **Impacto: -2 s en FCP.**
3. **Cloudflare → Speed → Optimization:** activar **Brotli + Auto Minify + Mirage + Polish**. **Impacto: -10 % a -20 % en payload + mejor TTFB.**

Estos tres son achievable en 2-3 horas sin tocar el código del SPA. **Si todo lo demás se atrasa, al menos hacer estos.**

---

*Brief V0.22 creado 2026-06-16. Acompaña pero PRECEDE en prioridad a Briefs V0.19, V0.19.1, V0.19.2, V0.20 y V0.21 ya redactados. Sin este brief en producción, ninguno de los otros tiene impacto medible en conversión. Implementación estimada: 3-5 días de codex/Claude Code para versión completa, o 4-6 horas para los Quick Wins de la sección 8.*
