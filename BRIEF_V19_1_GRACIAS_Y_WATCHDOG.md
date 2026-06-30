# Brief V0.19.1 · Página /gracias real + verificación del Watchdog

*Brief autocontenido para un agente de Claude Code / Codex. Arregla dos cosas que se descubrieron durante la auditoría del 31 may 2026: (1) la página `/gracias` no existe en producción y por eso ninguna compra recibe confirmación ni dispara `Purchase` al Pixel, (2) el endpoint `/api/health` del Worker principal devuelve 404, lo que significa que el Brief V0.16 (Watchdog) no llegó a producción a pesar de estar marcado completed. **Prioridad: MÁXIMA — bloqueador real de venta + bloqueador de monitoreo.** Versión 1.0 · 2026-05-31.*

---

## 0 · Contexto (léelo antes de tocar nada)

Durante la auditoría en vivo del 31 may 2026 se hicieron dos descubrimientos críticos:

**Descubrimiento 1:** Se navegó a `https://simioplateado.com/gracias?collection_status=approved&payment_id=test123&external_reference=SP-2026-9999` y la SPA renderizó la página `/galeria` (la home). No existe ninguna página de gracias en producción.

Implicaciones:
- Cuando un cliente real paga en MercadoPago y este lo redirige al `back_url` configurado (`https://simioplateado.com/gracias`), el cliente termina en la galería sin mensaje de confirmación.
- El evento `Purchase` del Pixel de Meta **nunca dispara** porque no hay JavaScript en `/gracias` que lo dispare.
- Meta no recibe datos de conversión → no puede optimizar campañas → publicidad gasta dinero sin retorno.

**Descubrimiento 2:** Se hizo `GET https://api.simioplateado.com/api/health` y devolvió `404 Not Found`. El Worker `simio-sondeo` no tiene el endpoint `/api/health`. Esto contradice la tarea #16 que está marcada como completed (Brief V0.16 · Watchdog).

Implicaciones:
- Si existe el Worker `simio-watchdog` desplegado en Cloudflare, está fallando todas las verificaciones cada 15 minutos (404 ≠ ok).
- Si no existe, no hay monitoreo en absoluto y la próxima vez que el checkout se rompa nadie se entera (igual que pasó hace pocas semanas).
- Hay que verificar AMBAS cosas: que el endpoint `/api/health` exista en `simio-sondeo` Y que el Worker `simio-watchdog` esté efectivamente desplegado.

Lo que ya existe en el repo:

- `workers/simio-sondeo/worker.js` — Worker principal con `/api/checkout`, `/api/mercadopago/webhook`, `/api/central`. **Probable: NO tiene `/api/health` desplegado a producción.**
- `workers/simio-watchdog/` — carpeta presumiblemente creada por V0.16. **Probable: no se desplegó, o se desplegó sin el KV bindeado.**
- `mockups/index.html` — SPA frontend. Probable: no tiene ruta `/gracias` en el router client-side.
- `doctrina/` — markdowns canónicos (no relevante aquí).
- `.github/workflows/deploy-sondeo-worker.yml` — GH Action que despliega `simio-sondeo` cuando cambia.

---

## 1 · Objetivo

Cerrar el último kilómetro del flujo de compra: que la persona que paga reciba confirmación visual + el Pixel registre `Purchase`. Y dejar el monitoreo realmente activo para que la próxima rotura del checkout dispare alerta en lugar de pasar inadvertida.

---

## 2 · Decisiones de diseño (no negociables)

### 2.1 · La página `/gracias` es ruta SPA, no archivo estático

Toda la app de Simio Plateado es una SPA en `mockups/index.html` con routing client-side. La página `/gracias` debe vivir dentro de ese mismo router, no como HTML aparte. Cuando el router detecta `location.pathname === '/gracias'`, renderiza la vista de gracias en lugar de la galería.

### 2.2 · `/gracias` dispara `Purchase` SOLO si `collection_status=approved`

MercadoPago redirige al `back_url` con query strings que incluyen `collection_status`, `status`, `payment_id`, `external_reference`, etc. La lógica:

- `collection_status === 'approved'` → dispara `Purchase` con el valor real, muestra mensaje "Pago aprobado · pedido recibido".
- `collection_status === 'pending'` o `'in_process'` → NO dispara `Purchase`, muestra mensaje "Pago en revisión · te avisamos por correo cuando se confirme".
- `collection_status === 'rejected'` o `'failure'` → NO dispara `Purchase`, muestra mensaje "El pago no se completó · podés intentar de nuevo" + botón "volver a la tienda".
- Sin `collection_status` (URL escrita a mano, o test) → muestra el mensaje genérico "no hay datos de pago" en lugar de simular aprobación.

### 2.3 · El payload de `Purchase` se reconstruye desde la URL

MercadoPago no devuelve el SKU del producto en el `back_url` por defecto. Hay dos formas de pasarlo:

- **Opción A (recomendada):** en el Worker, al crear la preferencia, incluir el SKU en el `external_reference` con formato `SP-<orderId>-<sku>` (ej `SP-2026-0042-superhombresito`). El frontend parsea ese campo en `/gracias` y lo usa para reconstruir el payload.
- **Opción B (fallback):** parametrizar el `back_url` con `?sku=superhombresito&value=280000&name=NIETZSCHESITO.v01`. Más simple pero expone datos en la URL.

Usar opción A. Si el SKU no se puede parsear, disparar Purchase igual con `content_ids: ['unknown']`, `value: 0`, y un `console.warn` para debug — mejor un Purchase incompleto que ninguno.

### 2.4 · Watchdog: implementar el endpoint `/api/health` realmente y verificar despliegue del watchdog

Brief V0.16 ya describe la arquitectura. Si el endpoint no existe, hay que implementarlo según las especificaciones de V0.16 sección 4.1. Y verificar — con curl — que el Worker `simio-watchdog` corre y responde en `/status`.

### 2.5 · No tocar el Worker `simio-sondeo` más allá de lo necesario

El backend funciona (verificado en vivo: crea preferencias correctamente). Solo tocar dos cosas: (a) agregar `/api/health`, (b) si la opción A de la sección 2.3 requiere ajustar el `external_reference`, modificar **solo** esa línea.

---

## 3 · Implementación paso a paso

### PARTE A · Página /gracias

#### Paso A.1 · Agregar la ruta al router client-side

En `mockups/index.html`, encontrar el router SPA (probablemente una función `handleRoute()` o un `addEventListener('popstate', ...)`). Agregar la ruta `/gracias` con su vista propia:

```js
const routes = {
  '/': renderHome,
  '/galeria': renderGaleria,
  '/tienda': renderTienda,
  '/tienda/:slug': renderProducto,
  '/gracias': renderGracias,
  // ... legal routes vendrán en Brief V0.19.2
};
```

Asegurarse de que la ruta `/gracias` NO esté capturada por un catch-all anterior. Si hay un fallback que cae a `renderGaleria`, la ruta `/gracias` debe matchearse antes.

#### Paso A.2 · Implementar `renderGracias(params)`

Pseudocódigo de la vista:

```js
function renderGracias() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('collection_status') || params.get('status');
  const paymentId = params.get('payment_id');
  const externalRef = params.get('external_reference') || '';

  // Parsear el SKU del external_reference (formato: SP-YYYY-XXXX-<sku>)
  const skuMatch = externalRef.match(/^SP-\d{4}-\d+-(.+)$/);
  const sku = skuMatch ? skuMatch[1] : null;
  const productInfo = sku ? PRODUCT_CATALOG[sku] : null;
  // PRODUCT_CATALOG es el mismo objeto que ya usa la SPA para renderizar la tienda

  const root = document.querySelector('#app-root') || document.body;

  if (status === 'approved') {
    root.innerHTML = renderApproved(productInfo, paymentId, externalRef);
    firePixelPurchase(productInfo, paymentId);
  } else if (status === 'pending' || status === 'in_process') {
    root.innerHTML = renderPending(productInfo, paymentId);
    // NO disparar Purchase
  } else if (status === 'rejected' || status === 'failure') {
    root.innerHTML = renderRejected(sku);
    // NO disparar Purchase
  } else {
    root.innerHTML = renderGenericLanded();
    // NO disparar Purchase
  }
}
```

#### Paso A.3 · Función `firePixelPurchase`

```js
function firePixelPurchase(productInfo, paymentId) {
  if (!window.fbq) return;
  const payload = productInfo ? {
    content_ids: [productInfo.sku],
    content_name: productInfo.name,
    content_type: 'product',
    contents: [{ id: productInfo.sku, quantity: 1, item_price: productInfo.priceCOP }],
    value: productInfo.priceCOP,
    currency: 'COP'
  } : {
    content_ids: ['unknown'],
    value: 0,
    currency: 'COP'
  };
  fbq('track', 'Purchase', payload, { eventID: paymentId || crypto.randomUUID() });
  // eventID se usa para deduplicación si en el futuro se agrega Conversions API server-side
}
```

Importante: usar `eventID` con el `paymentId` de MercadoPago. Esto evita doble conteo cuando se sume Conversions API (Brief V0.21 futuro). Si dos eventos Purchase llegan a Meta con el mismo eventID, Meta los deduplica.

#### Paso A.4 · Vistas HTML

**`renderApproved(productInfo, paymentId, externalRef)`:**

```html
<main class="page-gracias gracias-approved">
  <h1>Pago confirmado</h1>
  <p class="lead">Gracias por tu compra. Recibimos tu pago y empezamos la producción.</p>

  ${productInfo ? `
  <section class="pedido-detalle">
    <h2>Tu pedido</h2>
    <p><strong>${productInfo.name}</strong> · COP ${productInfo.priceCOP.toLocaleString('es-CO')}</p>
  </section>` : ''}

  <section class="proximos-pasos">
    <h2>¿Qué sigue?</h2>
    <ol>
      <li>Recibirás un correo de confirmación en los próximos minutos.</li>
      <li>Tu pieza entra en cola de producción. Tiempo estimado: 5 a 10 días hábiles.</li>
      <li>Cuando esté lista y empacada, te enviamos guía de despacho y link de rastreo.</li>
    </ol>
  </section>

  <section class="referencia">
    <p>Referencia de pedido: <code>${externalRef}</code></p>
    <p>ID de pago: <code>${paymentId}</code></p>
    <p>Guarda esta página o haz captura — la necesitas si nos escribes por soporte.</p>
  </section>

  <section class="contacto">
    <p>Cualquier pregunta: <a href="mailto:el@simioplateado.com">el@simioplateado.com</a></p>
  </section>

  <nav>
    <a href="/tienda" class="btn-secundario">Volver a la tienda</a>
  </nav>
</main>
```

**`renderPending(productInfo, paymentId)`:**

```html
<main class="page-gracias gracias-pending">
  <h1>Pago en revisión</h1>
  <p>Tu pago está siendo procesado por MercadoPago. Esto puede tomar unos minutos a unas pocas horas, dependiendo del medio de pago que usaste.</p>
  <p>Te enviaremos un correo en cuanto se confirme. <strong>No vuelvas a pagar</strong> — si se acredita, recibirás la confirmación.</p>
  <p>Referencia: <code>${paymentId}</code></p>
  <a href="/tienda" class="btn-secundario">Volver a la tienda</a>
</main>
```

**`renderRejected(sku)`:**

```html
<main class="page-gracias gracias-rejected">
  <h1>El pago no se completó</h1>
  <p>MercadoPago no pudo procesar el pago. Puede ser por fondos insuficientes, datos incorrectos, o un rechazo del banco emisor.</p>
  <p>No se cobró nada. Podés intentar de nuevo con otro medio de pago.</p>
  <a href="/tienda/${sku || ''}" class="btn-primario">Volver a intentar</a>
  <a href="/tienda" class="btn-secundario">Ver la tienda</a>
</main>
```

**`renderGenericLanded()`:**

```html
<main class="page-gracias gracias-generic">
  <h1>Página de confirmación</h1>
  <p>Si llegaste aquí después de una compra, deberías ver el detalle de tu pago.</p>
  <p>Si no ves nada, escribinos a <a href="mailto:el@simioplateado.com">el@simioplateado.com</a> con el ID de pago que MercadoPago te haya enviado por correo.</p>
  <a href="/tienda" class="btn-secundario">Volver a la tienda</a>
</main>
```

#### Paso A.5 · CSS para la página /gracias

Agregar al CSS de la SPA:

```css
.page-gracias {
  max-width: 640px;
  margin: 80px auto;
  padding: 0 20px;
  font-size: 16px;
  line-height: 1.6;
}
.page-gracias h1 { font-size: 32px; margin-bottom: 20px; }
.page-gracias .lead { font-size: 18px; color: #555; margin-bottom: 32px; }
.page-gracias section { margin-bottom: 32px; }
.page-gracias code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
.page-gracias .btn-primario, .page-gracias .btn-secundario {
  display: inline-block; padding: 12px 24px; margin-right: 12px; text-decoration: none;
}
.page-gracias .btn-primario { background: #000; color: white; }
.page-gracias .btn-secundario { border: 1px solid #000; color: #000; }
.gracias-rejected h1 { color: #c62828; }
.gracias-pending h1 { color: #f57c00; }
.gracias-approved h1 { color: #2e7d32; }
```

#### Paso A.6 · Verificar que el Worker construye `external_reference` con SKU

En `workers/simio-sondeo/worker.js`, en la función que crea la preferencia de MercadoPago, asegurarse de que el campo `external_reference` incluya el SKU al final, con formato:

```js
external_reference: `SP-${year}-${orderId}-${sku}`
// ej: "SP-2026-0042-superhombresito"
```

Si actualmente es solo `SP-${year}-${orderId}`, agregarle `-${sku}` al final.

#### Paso A.7 · Verificar que el `back_url` apunta a `/gracias`

En el Worker, donde se crea el body de la preferencia para MercadoPago, verificar que:

```js
back_urls: {
  success: 'https://simioplateado.com/gracias',
  pending: 'https://simioplateado.com/gracias',
  failure: 'https://simioplateado.com/gracias'
},
auto_return: 'approved',
```

MercadoPago va a agregar los query strings automáticamente a esa URL.

---

### PARTE B · Watchdog (verificar y desplegar)

#### Paso B.1 · Verificar si `/api/health` existe en `simio-sondeo`

Hacer:

```bash
curl -i https://api.simioplateado.com/api/health
```

Si devuelve 404 (que es lo que devuelve ahora): el endpoint no está. Implementarlo según el Brief V0.16 sección 4.1.

Si devuelve 200/503 con JSON: ya está, pasar al paso B.3.

#### Paso B.2 · Implementar `/api/health` en `simio-sondeo`

En `workers/simio-sondeo/worker.js`, agregar antes del catch-all 404:

```js
if (url.pathname === '/api/health' && request.method === 'GET') {
  return handleHealth(env);
}
```

Y la función `handleHealth`:

```js
async function handleHealth(env) {
  const checks = {
    kv_votes: false,
    mp_token_set: false,
    mp_api_reachable: false,
    mailchannels_set: false
  };

  // kv_votes
  try {
    await env.VOTES.get('__healthcheck__');
    checks.kv_votes = true;
  } catch (e) { /* keep false */ }

  // mp_token_set
  checks.mp_token_set = typeof env.MERCADOPAGO_ACCESS_TOKEN === 'string' && env.MERCADOPAGO_ACCESS_TOKEN.length > 10;

  // mp_api_reachable (con caché de 5 min en KV)
  try {
    const cached = await env.VOTES.get('health:mp_api_cached', 'json');
    const now = Date.now();
    if (cached && (now - cached.ts) < 5 * 60 * 1000) {
      checks.mp_api_reachable = cached.ok;
    } else if (checks.mp_token_set) {
      const r = await fetch('https://api.mercadopago.com/users/me', {
        headers: { Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}` },
        signal: AbortSignal.timeout(5000)
      });
      checks.mp_api_reachable = r.status === 200;
      await env.VOTES.put('health:mp_api_cached', JSON.stringify({ ts: now, ok: checks.mp_api_reachable }));
    }
  } catch (e) { /* keep false */ }

  // mailchannels_set
  checks.mailchannels_set = typeof env.MAILCHANNELS_API_KEY === 'string' && env.MAILCHANNELS_API_KEY.length > 5;

  const ok = Object.values(checks).every(v => v === true);
  return new Response(JSON.stringify({
    ok,
    checks,
    timestamp: new Date().toISOString(),
    version: '1.0'
  }, null, 2), {
    status: ok ? 200 : 503,
    headers: { 'content-type': 'application/json' }
  });
}
```

No incluir nunca los valores de los secretos en la respuesta — solo booleanos.

#### Paso B.3 · Verificar el Worker `simio-watchdog`

```bash
# Verificar que el Worker existe en Cloudflare
wrangler deployments list --name simio-watchdog
# Verificar que el cron está activo
wrangler crons list --name simio-watchdog
# Forzar un trigger manual
wrangler tail simio-watchdog &
# Y desde otro terminal, esperar 15-20 minutos para ver un trigger natural,
# o usar el endpoint /status para inspeccionar el estado actual:
curl https://simio-watchdog.<tu-subdominio>.workers.dev/status
```

Si no está desplegado: desplegarlo siguiendo el Brief V0.16 sección 4.2.

Si está desplegado pero no responde: revisar los logs con `wrangler tail`.

#### Paso B.4 · Confirmar que las alertas llegan al correo correcto

En `workers/simio-watchdog/wrangler.toml`:

```toml
ADMIN_EMAIL = "el@simioplateado.com"
```

**NO usar `juan@simioplateado.com`** — esa dirección no existe.

Después de implementar `/api/health`, forzar una falla simulada (por ejemplo, comentar temporalmente el check de `mp_token_set` para que devuelva siempre false) y verificar que el watchdog detecta la falla y manda correo a `el@simioplateado.com` dentro de 15-30 minutos. Después restaurar el código.

---

## 4 · Criterios de aceptación

Antes de hacer merge:

**Parte A (/gracias):**

- [ ] Navegar a `https://simioplateado.com/gracias?collection_status=approved&payment_id=test123&external_reference=SP-2026-9999-superhombresito` renderiza la vista "Pago confirmado" con los datos parseados del producto, dispara `Purchase` en el Pixel, y el evento aparece en Events Manager (Probar eventos en vivo).
- [ ] Misma URL con `collection_status=pending` renderiza vista "Pago en revisión" y NO dispara `Purchase`.
- [ ] Misma URL con `collection_status=rejected` renderiza vista "Pago no completó" y NO dispara `Purchase`.
- [ ] Navegar a `/gracias` sin query strings muestra mensaje genérico, no rompe, no simula aprobación.
- [ ] El Worker `simio-sondeo` ahora crea preferencias con `external_reference` que incluye el SKU al final.
- [ ] El `back_url` de las preferencias apunta a `https://simioplateado.com/gracias`.

**Parte B (Watchdog):**

- [ ] `curl https://api.simioplateado.com/api/health` devuelve 200 con JSON `{ok: true, checks: {kv_votes, mp_token_set, mp_api_reachable, mailchannels_set}, timestamp, version}`.
- [ ] Cuando un check falla, el endpoint devuelve 503 con el mismo JSON y `ok: false`.
- [ ] `wrangler deployments list --name simio-watchdog` muestra al menos un deployment activo.
- [ ] `curl https://simio-watchdog.<subdominio>.workers.dev/status` devuelve el último resultado del check.
- [ ] Una falla forzada (commit temporal que rompe `mp_token_set`) genera un correo a `el@simioplateado.com` dentro de 30 minutos.
- [ ] Después de restaurar el código, llega un correo de "recuperado".

---

## 5 · Verificación post-deploy (responsabilidad del agente)

Reportar a Juan con capturas y datos reales:

1. Captura de `/gracias?collection_status=approved&...` mostrando la vista renderizada.
2. JSON del payload del `Purchase` extraído de DevTools/Network al cargar `/gracias` con `approved`.
3. Captura del Events Manager mostrando el `Purchase` recibido en vivo.
4. Output de `curl https://api.simioplateado.com/api/health` mostrando 200 OK con todos los checks `true`.
5. Captura de Cloudflare Dashboard mostrando el Worker `simio-watchdog` activo con su último cron exitoso.
6. Captura del último correo de "recuperado" llegado a `el@simioplateado.com`.

---

## 6 · Lo que NO hace este brief

- **No implementa Brief V0.19** (fix Pixel del botón fast). Eso es otro brief, ya creado.
- **No implementa Brief V0.19.2** (routing de páginas legales). Eso es otro brief separado.
- **No agrega Conversions API server-side.** Eso queda para Brief V0.21.
- **No baja precios reales para hacer pruebas.** Las pruebas se hacen con `?collection_status=approved` simulado en URL, no con compras reales.

---

## 7 · Notas finales para el agente

- **Email correcto:** `el@simioplateado.com`. NO uses `juan@simioplateado.com`.
- **No autoejecutes deploy a main.** Deja PR listo y pedile a Juan que apruebe.
- **El Worker `simio-sondeo` ya funciona.** Las únicas modificaciones permitidas son: (a) agregar `/api/health`, (b) agregar el SKU al `external_reference`, (c) asegurar el `back_url` correcto. No tocar nada más.
- **Si el watchdog tiene KV namespace pendiente de crear**, hacelo con `wrangler kv namespace create WATCHDOG` y pegalo en el `wrangler.toml`.
- **Si algo del Brief V0.16 quedó a medio implementar**, completalo antes de pasar a otra cosa. Es bloqueador para la operación segura del sitio.

---

*Brief V0.19.1 creado 2026-05-31 a partir de auditoría en vivo. Acompaña al Brief V0.19 (fix Pixel) y al Brief V0.19.2 (legales). Los tres se pueden implementar en paralelo por agentes distintos.*
