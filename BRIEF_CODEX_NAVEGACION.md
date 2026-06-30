# Brief Codex · NAVEGACIÓN · URLs limpias + History API + OG tags

**Para:** Codex CLI
**De:** Juan / Cowork Simio Plateado
**Fecha:** 2026-05-12+
**Status pre-requisito:** V0.9 y V0.10 deployadas (todos los modales del catálogo existen). Este brief asume el set completo de piezas operativo en simioplateado.com.

---

## Filosofía de este brief

El sitio actual funciona con modales JavaScript pero **no integra esos modales al historial del navegador**. Síntoma: cuando el usuario abre un modal (TUNI, Marxito, etc.) y luego presiona "atrás" en su navegador, el navegador lo saca del sitio en lugar de cerrar el modal. Esto rompe la expectativa universal de cómo funciona la navegación web y hace que el sitio parezca técnicamente incompleto.

La solución es implementar **client-side routing con URLs limpias y catch-all en Cloudflare Pages**. Cada modal se vuelve una URL real (`simioplateado.com/tuni`), compartible, con meta tags propios, y el botón "atrás" del navegador funciona como espera la gente.

**Esto NO es una mejora cosmética**. Para una marca que se posiciona como curada, premium y atenta al detalle, las URLs limpias son parte de la identidad: `simioplateado.com/tuni` dice "esto está bien hecho", `simioplateado.com/#tuni` dice "esto es un workaround". La decisión doctrinal es ir por URLs limpias aunque requieran más trabajo de implementación.

---

## Decisiones doctrinales ya cerradas (no cuestionar)

1. **URLs limpias sin hash**: `/tuni`, no `/#tuni`. Sin excepción.
2. **Slugs canónicos en kebab-case**: minúsculas, separados por guión `-`, sin acentos, sin versionado (`.v01`). El versionado vive en metadata interna, no en URL pública.
3. **Estructura jerárquica**: piezas del Drop principal van en raíz, wearables en `/wearables/`, imposibles en `/imposible/`. La jerarquía de URL refleja la curaduría del sitio.
4. **Catch-all en Cloudflare Pages**: cualquier path no estándar se sirve como `index.html` y el JS del cliente resuelve qué mostrar.
5. **Meta tags Open Graph dinámicos**: cuando se abre un modal, se actualizan los meta tags del documento para que los links compartidos muestren la imagen + título correctos.
6. **Title del tab dinámico**: el `<title>` del documento refleja el modal abierto.
7. **UX de aterrizaje directo**: cuando alguien llega a una URL profunda (ej. `simioplateado.com/tuni`), el sitio carga la home completa, hace scroll automático suave hasta la pieza correspondiente en el grid, y después de ~600ms el modal se abre. Tres acciones encadenadas que dan contexto + foco + entrega.
8. **Backward compatibility con hashes**: si llega un link viejo con `#tuni`, el JS lo detecta y lo convierte limpiamente a `/tuni` con `history.replaceState()` antes de abrir el modal.
9. **Bilingüismo futuro**: la versión inglesa (V0.11) vivirá en `/en/`. El routing se diseña ahora para soportar `/en/tuni`, `/en/wearables/parchao`, etc. sin retrabajos.

---

## Tarea 1 · Tabla de slugs canónicos

Definir un objeto JavaScript con el mapeo de todos los slugs a sus modales correspondientes. Esto vive en el `<script>` del HTML (o en un archivo JS separado si Codex prefiere):

```javascript
const ROUTING = {
  // Drop 001 escultórico — raíz
  'tuni':              { modal: 'modal-tuni',            scrollTo: 'pieza-tuni',         titulo: 'TUNI.v01 · Simio Plateado',                       img: 'assets/processed/tuni-rosa.png' },
  'copa':              { modal: 'modal-copa',            scrollTo: 'pieza-copa',         titulo: 'COPA_CHISTE_COLOMBIA.v0 · Simio Plateado',        img: 'assets/processed/copa-colombia.png' },
  'marxito':           { modal: 'modal-marxito',         scrollTo: 'pieza-marxito',      titulo: 'MARXITO.v01 · Simio Plateado',                    img: 'assets/processed/marxito.png' },
  'superhombresito':   { modal: 'modal-superhombresito', scrollTo: 'pieza-superhombresito', titulo: 'SUPERHOMBRESITO.v01 · Simio Plateado',        img: 'assets/processed/piezas/superhombresito.png' },
  'dialoguin':         { modal: 'modal-dialoguin',       scrollTo: 'pieza-dialoguin',    titulo: 'DIALOGUIN.v01 · Simio Plateado',                  img: 'assets/processed/piezas/dialoguin.png' },
  'traumin':           { modal: 'modal-traumin',         scrollTo: 'pieza-traumin',      titulo: 'TRAUMIN.v01 · Simio Plateado',                    img: 'assets/processed/piezas/traumin.png' },
  'mini-devenires':    { modal: 'modal-minidevenires',   scrollTo: 'pieza-minidevenires', titulo: 'MINI_DEVENIRES.v01 · Simio Plateado',           img: 'assets/processed/piezas/mini-devenires.png' },
  'planti-punk':       { modal: 'modal-punk',            scrollTo: 'pieza-punk',         titulo: 'PLANTI_PUNK.v01 · Simio Plateado',                img: 'assets/processed/planti/punk-regular-barro.png' },
  'planti-punk-xl':    { modal: 'modal-punk-xl',         scrollTo: 'pieza-punk-xl',      titulo: 'PLANTI_PUNK_XL.v01 · Simio Plateado',             img: 'assets/processed/planti/punk-xl-barro.png' },
  'planti-k':          { modal: 'modal-k',               scrollTo: 'pieza-k',            titulo: 'PLANTI_K.v01 · Simio Plateado',                   img: 'assets/processed/planti/k-regular-barro.png' },
  'planti-k-xl':       { modal: 'modal-k-xl',            scrollTo: 'pieza-k-xl',         titulo: 'PLANTI_K_XL.v01 · Simio Plateado',                img: 'assets/processed/planti/k-xl-barro.png' },

  // Wearables — /wearables/
  'wearables/camiseta-blanca':  { modal: 'modal-camiseta-blanca',  scrollTo: 'pieza-camiseta-blanca',  titulo: 'Camiseta blanca · Simio Plateado',     img: 'assets/processed/piezas/camiseta-blanca.png' },
  'wearables/camiseta-negra':   { modal: 'modal-camiseta-negra',   scrollTo: 'pieza-camiseta-negra',   titulo: 'Camiseta negra · Simio Plateado',      img: 'assets/processed/piezas/camiseta-negra.png' },
  'wearables/gorra':            { modal: 'modal-gorra',            scrollTo: 'pieza-gorra',            titulo: 'Gorra · Simio Plateado',               img: 'assets/processed/piezas/gorra.png' },
  'wearables/parchao':          { modal: 'modal-parchao',          scrollTo: 'pieza-parchao',          titulo: 'PARCHAO.v01 · Simio Plateado',         img: 'assets/processed/piezas/parchao.png' },
  'wearables/melisimo':         { modal: 'modal-melisimo',         scrollTo: 'pieza-melisimo',         titulo: 'MELISIMO.v01 · Simio Plateado',        img: 'assets/processed/piezas/melisimo.png' },

  // Imposible — /imposible/ (NO tienen modal, solo scroll)
  'imposible/audio-antropos':  { modal: null, scrollTo: 'pieza-audio-antropos', titulo: 'AUDIO.ANTROPOS.v02 · Simio Plateado · Imposible', img: 'assets/processed/piezas/audifonos-tribu.png' },
  'imposible/audio-neo':       { modal: null, scrollTo: 'pieza-audio-neo',      titulo: 'AUDIO.NEO.v02 · Simio Plateado · Imposible',      img: 'assets/processed/piezas/audifonos-neo.png' },
  'imposible/audio-oimis':     { modal: null, scrollTo: 'pieza-audio-oimis',    titulo: 'AUDIO.OIMIS.v02 · Simio Plateado · Imposible',    img: 'assets/processed/piezas/audifonos-simio.png' },
};

const HOME = {
  titulo: 'Simio Plateado',
  img: 'assets/logo-simio-plateado-master.png'
};
```

**Importante para Codex**: cada `.pieza` del grid en el HTML necesita un `id` único (`id="pieza-tuni"`, `id="pieza-marxito"`, etc.) para que el `scrollTo` funcione. Si los IDs no existen aún, hay que agregarlos en V0.10 o aquí — Codex revisa el HTML existente y agrega los IDs faltantes.

---

## Tarea 2 · JavaScript History API

Reescribir las funciones de modal para integrar History API.

### 2a · Función `abrirModal` actualizada

```javascript
function abrirModal(slug, opts = {}) {
  const route = ROUTING[slug];
  if (!route) return;

  // Mostrar modal (lógica actual)
  if (route.modal) {
    const modalEl = document.getElementById(route.modal);
    if (modalEl) {
      modalEl.classList.add('abierto');
      document.body.classList.add('modal-locked');
    }
  }

  // Actualizar URL — solo si no es una restauración por popstate o aterrizaje inicial
  if (!opts.skipHistory) {
    history.pushState({ slug }, '', '/' + slug);
  }

  // Actualizar meta tags + title
  actualizarMetaTags(route);
}
```

### 2b · Función `cerrarModal` actualizada

```javascript
function cerrarModal(opts = {}) {
  // Cerrar todos los modales (lógica actual)
  document.querySelectorAll('.modal-explosionado.abierto').forEach(m => m.classList.remove('abierto'));
  document.body.classList.remove('modal-locked');

  // Actualizar URL a home
  if (!opts.skipHistory) {
    history.pushState({}, '', '/');
  }

  // Restaurar meta tags
  actualizarMetaTags(HOME);
}
```

### 2c · Listener de `popstate` (botón atrás/adelante)

```javascript
window.addEventListener('popstate', (event) => {
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');

  if (!path) {
    // Es la home → cerrar todos los modales
    cerrarModal({ skipHistory: true });
    return;
  }

  // Buscar slug coincidente
  const route = ROUTING[path];
  if (route) {
    // Cerrar todos los modales antes de abrir el correcto
    document.querySelectorAll('.modal-explosionado.abierto').forEach(m => m.classList.remove('abierto'));
    abrirModal(path, { skipHistory: true });
  } else {
    // URL inválida → cerrar modales y volver a home limpiamente
    cerrarModal({ skipHistory: true });
    history.replaceState({}, '', '/');
  }
});
```

### 2d · Resolución de URL inicial al cargar la página

```javascript
window.addEventListener('DOMContentLoaded', () => {
  // 1. Backward compat con hashes viejos (#tuni → /tuni)
  if (window.location.hash) {
    const hashSlug = window.location.hash.replace(/^#/, '');
    if (ROUTING[hashSlug]) {
      history.replaceState({}, '', '/' + hashSlug);
    } else {
      // Hash inválido, limpiamente quitarlo
      history.replaceState({}, '', '/');
    }
  }

  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');

  if (!path) {
    // Home — no hacer nada especial
    actualizarMetaTags(HOME);
    return;
  }

  const route = ROUTING[path];

  if (!route) {
    // URL inválida (slug no existe) → redirigir limpiamente a home
    history.replaceState({}, '', '/');
    actualizarMetaTags(HOME);
    return;
  }

  // URL válida con slug existente
  // Secuencia: scroll suave a la pieza → delay → abrir modal
  setTimeout(() => {
    const targetEl = document.getElementById(route.scrollTo);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 200);  // pequeño delay para que el render esté completo antes de scroll

  setTimeout(() => {
    if (route.modal) {
      abrirModal(path, { skipHistory: true });
    }
    // Si es una pieza IMPOSIBLE (sin modal), solo el scroll basta
    actualizarMetaTags(route);
  }, 800);  // 200ms (delay scroll) + 600ms (espacio para que el ojo registre contexto) = 800ms total
});
```

---

## Tarea 3 · Configuración Cloudflare Pages

Crear archivo `_redirects` en la raíz del proyecto (mismo nivel que `index.html`):

```
# Cloudflare Pages routing — catch-all para SPA-like behavior
# Las rutas /assets/* y /api/* se sirven normalmente (assets estáticos y endpoints)

# Drop 001 — todas las piezas
/tuni                /index.html  200
/copa                /index.html  200
/marxito             /index.html  200
/superhombresito     /index.html  200
/dialoguin           /index.html  200
/traumin             /index.html  200
/mini-devenires      /index.html  200
/planti-punk         /index.html  200
/planti-punk-xl      /index.html  200
/planti-k            /index.html  200
/planti-k-xl         /index.html  200

# Wearables
/wearables/*         /index.html  200

# Imposible
/imposible/*         /index.html  200

# Catch-all final: cualquier otra ruta no estándar → home (el JS resuelve)
/*                   /index.html  200
```

**Importante**: el catch-all `/* → /index.html` debe ir AL FINAL del archivo. Cloudflare evalúa las reglas de arriba hacia abajo y se queda con la primera que matchea. Si el catch-all está primero, captura todo y rompe los assets.

**Alternativa más limpia con `_routes.json`** (opcional, Codex elige):

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/api/*", "/_redirects"]
}
```

---

## Tarea 4 · Meta tags Open Graph dinámicos

Función `actualizarMetaTags(route)` que actualiza los meta tags del documento:

```javascript
function actualizarMetaTags(route) {
  if (!route) return;

  const baseUrl = 'https://simioplateado.com';
  const path = window.location.pathname;
  const fullUrl = baseUrl + path;
  const imgUrl = baseUrl + '/' + route.img;

  // Title del tab
  document.title = route.titulo;

  // Helpers
  const setMeta = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Open Graph
  setMeta('og:title', route.titulo);
  setMeta('og:image', imgUrl);
  setMeta('og:url', fullUrl);
  setMeta('og:type', 'website');
  setMeta('og:site_name', 'Simio Plateado');

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', route.titulo);
  setMeta('twitter:image', imgUrl);

  // Canonical link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', fullUrl);
}
```

En el `<head>` del HTML, asegurar que existan los meta tags base (con valores de la home por default):

```html
<meta property="og:title" content="Simio Plateado">
<meta property="og:image" content="https://simioplateado.com/assets/logo-simio-plateado-master.png">
<meta property="og:url" content="https://simioplateado.com">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Simio Plateado">
<meta property="og:description" content="Catálogo curado de art toys. Sondeo silencioso.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Simio Plateado">
<meta name="twitter:image" content="https://simioplateado.com/assets/logo-simio-plateado-master.png">
<link rel="canonical" href="https://simioplateado.com/">
```

---

## Tarea 5 · Actualizar los onclick handlers en el HTML

Los tiles del grid actualmente tienen `onclick="abrirModal('tuni')"` con el slug interno (`tuni`, `marxito`, etc.). Esos slugs deben coincidir con las llaves del objeto `ROUTING`. Si hay discrepancia, ajustar.

Para los tiles del IMPOSIBLE (audífonos), que actualmente NO tienen `onclick` (son exhibición pura, no abren modal): agregar atributo `id` al tile (`id="pieza-audio-antropos"`) para que el scroll automático del aterrizaje directo funcione. No agregar onclick — siguen sin abrir modal.

---

## Tarea 6 · Verificación manual

Antes de hacer push, ejecutar esta lista de pruebas en local:

1. **Click natural en un tile** → URL cambia a `/tuni`, modal abre, title del tab cambia.
2. **Cerrar modal con la X** → URL vuelve a `/`, title vuelve a "Simio Plateado".
3. **Click en pieza, después botón atrás del navegador** → modal se cierra, NO sale del sitio. URL vuelve a `/`.
4. **Click en pieza, cerrar, botón adelante del navegador** → modal de la pieza se abre de nuevo. URL vuelve a `/tuni`.
5. **Refresh en `/tuni`** → sitio carga, scroll automático a tile TUNI, modal se abre con ~600ms delay.
6. **Aterrizaje en `/asdfgh`** (slug inválido) → URL se limpia a `/`, sin error visible al usuario.
7. **Aterrizaje en `/#tuni`** (hash viejo) → URL se reescribe a `/tuni` con `replaceState`, modal abre normalmente.
8. **Compartir link a `/tuni`** en WhatsApp / Twitter → preview muestra imagen de TUNI + título correcto.
9. **Aterrizaje en `/imposible/audio-antropos`** → scroll automático a tile audífonos, NO abre modal (es exhibición pura).
10. **Ver consola** → cero errores JavaScript, cero 404 de assets.

---

## Tarea 7 · Push y deploy

```bash
git add -A
git commit -m "NAVEGACIÓN: URLs limpias con History API + OG tags dinámicos + Cloudflare _redirects"
git push origin main
```

Cloudflare Pages hace auto-deploy. Después del deploy, repetir verificación 1-10 en producción (`simioplateado.com`).

---

## Tarea 8 · Reportar a Juan al terminar

Mensaje con:
- ✅ Confirmación de deploy
- ✅ Lista de URLs canónicas funcionando (ej. `simioplateado.com/tuni`, `/marxito`, `/wearables/parchao`, `/imposible/audio-antropos`)
- ✅ Captura de Twitter/WhatsApp mostrando preview con imagen correcta al pegar un link
- ✅ Verificación de botón atrás funcionando
- Cualquier rareza o ajuste hecho fuera de lo descrito

---

## Si algo se rompe

- **El sitio devuelve 404 en `/tuni`**: el archivo `_redirects` no se está aplicando. Verificar que esté en la raíz del proyecto (mismo nivel que `index.html`), no dentro de una subcarpeta. Revisar el log de Cloudflare Pages para confirmar que la regla se procesó.
- **El modal abre pero al refrescar la página no se mantiene**: el listener `DOMContentLoaded` no está leyendo bien `window.location.pathname`. Revisar que el slug se extraiga correctamente (sin slash inicial, sin trailing slash).
- **Los meta tags no se ven al compartir**: cachés de redes sociales. Twitter, Facebook, WhatsApp cachean el preview por horas/días. Usar el [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) y el [Twitter Card Validator](https://cards-dev.twitter.com/validator) para forzar recache.
- **El back button cierra modal pero después saca del sitio**: el listener `popstate` no está siendo llamado o tiene un bug. Revisar consola.
- **Scroll automático va a la posición incorrecta**: los IDs de los tiles (`pieza-tuni`, etc.) no existen o están mal nombrados. Verificar HTML.

---

## Lo que viene después de NAVEGACIÓN (no en este brief)

- **V0.11 versión inglés**: el routing se extiende para soportar `/en/tuni`, `/en/wearables/parchao`. La función `abrirModal` y el objeto `ROUTING` se reorganizan para tener dos espacios (`ROUTING.es` y `ROUTING.en`) y el JS detecta el idioma del pathname.
- **Backend SONDEO**: independiente, ya tiene su brief (`BRIEF_CODEX_SONDEO.md`).
- **404 page custom**: en algún momento podría querer una página 404 con estética del proyecto en lugar de redirección silenciosa. Decisión doctrinal pendiente.

---

## Apéndices

### Apéndice A · Resumen de URLs canónicas del sitio

**Home**
- `simioplateado.com/`

**Drop 001 · escultórico**
- `simioplateado.com/tuni` · `/copa` · `/marxito` · `/superhombresito` · `/dialoguin` · `/traumin` · `/mini-devenires`
- `simioplateado.com/planti-punk` · `/planti-punk-xl` · `/planti-k` · `/planti-k-xl`

**Wearables**
- `simioplateado.com/wearables/camiseta-blanca` · `/wearables/camiseta-negra` · `/wearables/gorra`
- `simioplateado.com/wearables/parchao` · `/wearables/melisimo`

**Imposible** (sin modal, solo scroll automático)
- `simioplateado.com/imposible/audio-antropos` · `/imposible/audio-neo` · `/imposible/audio-oimis`

**Futuro inglés** (V0.11)
- `simioplateado.com/en/` · `/en/tuni` · `/en/wearables/parchao` · etc.

### Apéndice B · Diferencia URL vs slug interno

Para que Codex no se confunda: la **URL canónica visible** está en kebab-case (`/mini-devenires`, `/planti-punk-xl`). El **slug interno en JS** (las llaves de `ROUTING`) también está en kebab-case (`'mini-devenires'`, `'planti-punk-xl'`). El **ID del modal en HTML** sigue la convención del V0.8 sin guiones (`modal-minidevenires`, `modal-punk-xl`) por compatibilidad con la implementación actual. La tabla en Tarea 1 resuelve el mapeo entre los tres.

### Apéndice C · Notas sobre SEO

Esta implementación es SEO-friendly hasta cierto punto, pero NO genera HTML estático por pieza. Los crawlers que ejecutan JavaScript (Google moderno, Bing) van a indexar bien cada URL como página separada con su título y meta tags. Los crawlers viejos que no ejecutan JavaScript (algunos bots de redes sociales antiguas) podrían ver siempre el HTML base sin actualizar.

Para mejor SEO, en una versión futura del sitio se podría considerar:
- Generación estática de HTML por pieza (Astro, Next.js static export)
- Server-side rendering parcial (Cloudflare Workers que sirvan meta tags pre-renderizados)

Por ahora, el approach con JS dinámico es suficiente para 90% del SEO relevante y mantiene el sitio simple. Cuando el catálogo crezca a 50+ piezas y SEO sea crítico, vale la pena reconsiderar la arquitectura.
