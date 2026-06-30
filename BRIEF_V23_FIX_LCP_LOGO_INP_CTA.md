# BRIEF V0.23 · Fix LCP logo home + INP CTA encargos

**Fecha**: 2026-06-19
**Prioridad**: ALTA (post-V0.22, antes de V0.21 Tripo3D)
**Estimación**: 30-45 minutos de implementación, <20 líneas de cambio
**Owner sugerido**: codex

---

## Contexto y por qué este brief

Después del éxito del Brief V0.22 (PageSpeed mobile 35→99, FCP 44.9s→1.1s, LCP 44.9s→2.0s), el tráfico real se disparó en los últimos 3 días:

| Métrica Cloudflare | Valor | Cambio |
|---|---|---|
| Visits | 650 | **+253.26 %** |
| Page views | 693 | **+131 %** |
| Page load time promedio | 2,494 ms | +53.19 % (outliers) |

Las Core Web Vitals globales pasan los thresholds de Google (84% LCP Good, 81% INP Good, 100% CLS Good). **Pero el RUM data de Cloudflare detecta 2 elementos puntuales que están arrastrando el 8 % "Poor"** y, más importante, **son ambos en el home y en el CTA principal del funnel de encargos**.

Este brief arregla esos dos elementos específicos para llevar LCP Good de 84 % → ≥92 % y INP Good de 81 % → ≥90 %.

---

## Problema 1 · LCP del logo home en 19,684 ms (19 sesiones reales)

### Datos del RUM (Cloudflare Web Analytics, últimos 3 días)

| Elemento | URL | LCP | Sesiones |
|---|---|---|---|
| `html>body.motion-ready>section.home>img.logo` | `assets/optimized/inline/inline-png.9eab16084d.webp` | **19,684 ms** | **19** |
| `html>body.motion-ready>section.home>img.logo` | `assets/optimized/logo-home-lcp.8afaa78feb.webp` | **5,132 ms** | **13** |
| `html>body>section.home>img.logo` (sin motion-ready) | `assets/optimized/logo-home-lcp.8afaa78feb.webp` | 2,640 ms | 1 |

### Diagnóstico técnico

El `<img class="logo">` en `mockups/index.html` (línea **3204**) está bien marcado con `fetchpriority="high"` y `loading="eager"`:

```html
<img class="logo"
     src="assets/optimized/logo-home-lcp.8afaa78feb.webp"
     srcset="assets/optimized/logo-home-lcp.8afaa78feb.webp 560w,
             assets/optimized/inline/inline-png.9eab16084d.webp 1100w"
     sizes="(max-width: 640px) 280px, (max-width: 1200px) 38vw, 540px"
     alt="Simio Plateado" width="560" height="373"
     decoding="async" loading="eager" fetchpriority="high">
```

**Pero NO hay `<link rel="preload">` en el `<head>` para esta imagen.** El navegador descubre el logo recién cuando parsea el HTML hasta la línea 3204, y para entonces ya ha consumido ancho de banda en:

- preconnect a connect.facebook.net (Meta Pixel)
- preconnect a googletagmanager.com
- preconnect a api.simioplateado.com
- CSS inline gigante (~3,200 líneas antes del logo)

El logo queda al fondo de la cola de descargas. En desktop el navegador termina pidiendo la versión 1100w (más pesada) y eso es lo que da los 19.7 s.

Adicional: `decoding="async"` le dice al navegador que puede decodificar la imagen en otro hilo y mostrarla después. Para un LCP queremos lo opuesto.

### Fix

**Cambio 1 · Agregar preload del logo en el `<head>`** (después del último `<link rel="preconnect">` de la línea 9):

```html
<link rel="preload" as="image"
      href="assets/optimized/logo-home-lcp.8afaa78feb.webp"
      imagesrcset="assets/optimized/logo-home-lcp.8afaa78feb.webp 560w, assets/optimized/inline/inline-png.9eab16084d.webp 1100w"
      imagesizes="(max-width: 640px) 280px, (max-width: 1200px) 38vw, 540px"
      fetchpriority="high">
```

Esto le dice al navegador, en el primer byte del HTML, que el logo es el recurso más importante y debe descargarlo inmediatamente — antes incluso de bajar el CSS.

**Cambio 2 · Cambiar `decoding="async"` a `decoding="sync"`** en el `<img class="logo">` de la línea 3204.

**Cambio 3 (opcional, investigar)**: la clase `.motion-ready` en `<body>` aparece en 19 de los 19 conteos peores. Sugiere que el LCP del logo se está midiendo DESPUÉS de que el body cambia de "loading" a "motion-ready". Si hay un `body.motion-ready` que se activa via JS al final, el logo no pinta hasta entonces.

**Acción**: investigar dónde se aplica la clase `motion-ready`, y si se aplica via `document.body.classList.add('motion-ready')` después del DOMContentLoaded, mover esa lógica para que el logo pueda pintarse INDEPENDIENTEMENTE del estado motion-ready. Una solución es:

- Aplicar `motion-ready` en el `<body>` directamente desde el HTML (sin JS), y manejar las animaciones de aparición con `@media (prefers-reduced-motion)` o con clases adicionales.
- O quitar `motion-ready` del selector que afecta visibilidad del logo (si lo afecta).

---

## Problema 2 · INP del CTA "Pedido personalizado" en 616 ms (2 sesiones)

### Datos del RUM

| Elemento | INP | Sesiones |
|---|---|---|
| `html>body.motion-ready>section.home>a.home-custom-order>img` | **616 ms** | 2 |
| `html>body.motion-ready>section.home` (probable misma causa) | 528 ms | 1 |
| `#pieza-osito-wu-tang>div.frame>img` | 456 ms | 1 |
| `html>body.motion-ready.route-page-active>section.home>a.home-custom-order>img` | 456 ms | 1 |

### Diagnóstico técnico

El CTA "Pedido personalizado" en línea **3206-3209** de `mockups/index.html` es:

```html
<a class="home-custom-order" href="/encargos" aria-label="Pedido personalizado">
  <img src="assets/optimized/processed/textos/pedido-personalizado.fe9a7216c7.webp"
       alt="" width="1066" height="553"
       decoding="async" loading="lazy">
  <span class="home-custom-order-text">Pedido personalizado</span>
</a>
```

**Tres problemas combinados:**

1. **`loading="lazy"` en una imagen above-the-fold del CTA principal**: el navegador no la descarga hasta que entra en viewport, pero ESTÁ en viewport desde el primer paint en desktop. Esto causa que cuando el usuario hace tap/click, el navegador empieza a procesar la imagen Y la transición de ruta a la vez.
2. **No hay prefetch de `/encargos`**: cuando el usuario clickea, el navegador tiene que descargar/parsear todo el bundle de /encargos desde cero.
3. **La transición SPA (`motion-ready` → `route-page-active`)** bloquea el main thread durante la navegación, sumando tiempo al INP.

### Fix

**Cambio 1 · Quitar lazy loading del CTA y darle prioridad** (línea 3207):

```html
<a class="home-custom-order" href="/encargos" aria-label="Pedido personalizado">
  <img src="assets/optimized/processed/textos/pedido-personalizado.fe9a7216c7.webp"
       alt="" width="1066" height="553"
       decoding="sync" loading="eager" fetchpriority="high">
  <span class="home-custom-order-text">Pedido personalizado</span>
</a>
```

**Cambio 2 · Agregar prefetch en hover/touchstart del CTA**:

Buscar el JS principal de la app (probablemente en `assets/optimized/app.*.js`). Si existe un módulo de routing/navegación, agregar este snippet al final del DOMContentLoaded:

```js
(function prefetchEncargos() {
  const cta = document.querySelector('a.home-custom-order');
  if (!cta) return;

  let prefetched = false;
  function doPrefetch() {
    if (prefetched) return;
    prefetched = true;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/encargos';
    link.as = 'document';
    document.head.appendChild(link);
  }

  cta.addEventListener('mouseenter', doPrefetch, { once: true, passive: true });
  cta.addEventListener('touchstart', doPrefetch, { once: true, passive: true });
  cta.addEventListener('focus', doPrefetch, { once: true });
})();
```

Esto descarga el HTML de /encargos en cuanto el usuario muestra intención (hover/touch/focus), bajando el INP del click a menos de 200 ms.

**Cambio 3 (opcional, mayor impacto)**: investigar si el router SPA actual puede migrarse a la **View Transitions API** nativa de Chrome:

```js
if (document.startViewTransition) {
  document.startViewTransition(() => {
    // navegar a /encargos
  });
}
```

Esto elimina el bloqueo de main thread y le da al navegador una transición fluida sin JavaScript bloqueante. Solo aplicar si el router actual lo permite sin refactor mayor.

---

## Plan de verificación

### Antes del deploy

1. Hacer el cambio en local (`npm run dev` o equivalente).
2. Abrir Chrome DevTools → Performance → Record una carga fresca del home.
3. Verificar que el logo aparece en el waterfall ANTES del CSS.
4. Verificar que el `<img>` del CTA aparece pintado en el primer frame.
5. Tirar Lighthouse local → confirmar LCP < 1.5s en mobile simulated.

### Después del deploy

Esperar 48 horas y volver a Cloudflare → Web Analytics → Core Web Vitals:

| Métrica | Antes | Target post-fix |
|---|---|---|
| LCP Good | 84 % | **≥ 92 %** |
| LCP P75 | 1,888 ms | **≤ 1,500 ms** |
| LCP P99 | 29,840 ms | **≤ 8,000 ms** |
| INP Good | 81 % | **≥ 90 %** |
| INP del CTA encargos | 616 ms | **≤ 200 ms** |
| CLS Good | 100 % | mantener 100 % |

Si LCP Good no llega a 92 % después de 48h, revisar:
- ¿Se está sirviendo el preload correctamente? (verificar Network → Initiator del logo)
- ¿La clase `motion-ready` todavía está bloqueando el paint?
- ¿Hay clientes con DNS lento al CDN de Cloudflare?

---

## Constraints (Juan)

- **No auto-deploy**. Mostrar diff completo antes de mergear. Juan revisa y confirma.
- **Solo cambios en**: `mockups/index.html` (head y líneas 3204, 3206-3209), y opcionalmente el JS de navegación si existe módulo aislado.
- **No tocar** assets ya optimizados (no re-procesar imágenes).
- **No tocar** Meta Pixel ni Mercado Pago (intacto desde V0.19).
- **No tocar** el módulo de Tripo3D (V0.21 está pendiente, no entrar en conflicto).
- **Commit message sugerido**: `perf(home): preload LCP logo + eager load CTA + prefetch /encargos route`

---

## Archivos involucrados

| Archivo | Cambios | Líneas aprox |
|---|---|---|
| `mockups/index.html` | Agregar `<link rel="preload">` en head, cambiar attrs del img.logo, cambiar attrs del CTA img | 3 ubicaciones, ~10 líneas |
| `mockups/assets/optimized/app.*.js` (o JS de routing) | Snippet de prefetch en hover/touch | 1 función, ~15 líneas |

---

## Notas finales

Este brief es la consecuencia directa del éxito de V0.22 — bajar el techo a 1s expuso los pisos que quedaban arriba. Después de aplicar V0.23 deberíamos estar en territorio "todas las métricas Google verdes para el 90%+ de usuarios reales", que es lo que más importa para SEO y conversión TikTok.

V0.23 NO bloquea V0.21 (Tripo3D encargos). Pueden trabajarse en paralelo si querés mandar ambos briefs al mismo tiempo.

---

**Fin del brief V0.23.**
