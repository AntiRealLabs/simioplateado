# Brief V0.19 · Fix Pixel + UX del botón "PAGAR CON MERCADO PAGO"

*Brief autocontenido para un agente de Claude Code / Codex. Corrige dos bugs verificados en vivo el 31 may 2026 que están bloqueando la conversión del checkout. **Prioridad: MÁXIMA — bloqueador real de ventas.** Versión 1.0 · 2026-05-31.*

---

## 0 · Contexto (léelo antes de tocar nada)

El 31 may 2026 se hizo una verificación en vivo del Pixel de Meta (ID `2287847908691158`) en `simioplateado.com` usando la sesión real con tráfico real (604 PageViews acumulados en 27 días). Se encontraron **dos bugs críticos** que explican matemáticamente por qué hay 0 compras a pesar de tráfico significativo y publicidad activa.

**Métricas reales en Events Manager (3 may – 30 may 2026):**

| Evento | Total | Última recepción |
|---|---|---|
| PageView | 604 | Hace 30 min ✓ |
| ViewContent | 7 | Hace 2 horas ✓ |
| AddToCart | 4 | Hace 1 día ⚠ |
| InitiateCheckout | NO EXISTE | — |
| Purchase | NO EXISTE | — |

Lo que técnicamente está bien:

- Pixel cargado correctamente, `fbq` inicializado en cada página.
- `PageView` dispara en cada cambio de ruta SPA (incluyendo `/tienda`, `/tienda/superhombresito`).
- `ViewContent` dispara al abrir el modal de una pieza, con payload completo: `content_ids`, `content_name`, `content_category: figuras`, `content_type: product`, `value: 280000`, `currency: COP`, `cd[source]: modal`.

Lo que está mal y este brief arregla:

- El botón principal de pago (clase `checkout-fast-button`, texto "PAGAR CON MERCADO PAGO") dispara `fbq('track', 'AddToCart')` cuando debería disparar `fbq('track', 'InitiateCheckout')`. El payload lo identifica con `cd[source]=modal_fast_cta`.
- El mismo botón **no hace nada visible** cuando el formulario lateral "COMPRA DIRECTA" está vacío: no scrollea al formulario, no muestra mensaje de error, no marca campos en rojo. El usuario clickea, no pasa nada, abandona.

Lo que existe en el repo:

- `mockups/index.html` — SPA frontend.
- Implementación del Pixel realizada en Brief V0.18 (los eventos disparan, pero algunos están mal nombrados).
- `workers/simio-sondeo/worker.js` — Worker con endpoint `/api/checkout` que crea preferencias en MercadoPago.
- Página `/gracias` que recibe el callback de MercadoPago (debe disparar `Purchase`).

---

## 1 · Objetivo

Dejar el embudo del Pixel correctamente alineado con las convenciones de Meta y desbloquear visualmente el botón de pago, para que la métrica refleje el comportamiento real del usuario y para que los usuarios que **sí** quieren pagar **puedan** pagar.

---

## 2 · Decisiones de diseño (no negociables)

### 2.1 · Taxonomía del embudo (Meta estándar)

| Evento Pixel | Cuándo dispara | Por qué |
|---|---|---|
| `PageView` | Cada cambio de ruta SPA | Ya funciona, no tocar. |
| `ViewContent` | Al abrir el modal/vista de una pieza específica (`/tienda/<slug>`) | Ya funciona, no tocar. |
| `InitiateCheckout` | **AL HACER CLICK EN CUALQUIER BOTÓN QUE INICIE EL PROCESO DE PAGO** (el fast button arriba Y el "Comprar ahora" al final del formulario) | Es el momento de intención de compra. |
| `Purchase` | En la página `/gracias` después del callback exitoso de MercadoPago | Es la compra completada. |

### 2.2 · `AddToCart` se elimina por completo del sitio

Simio Plateado **no tiene carrito**. El checkout es directo a MercadoPago. Disparar `AddToCart` en un sitio sin carrito es engañoso para Meta y para el dueño del Pixel. **Eliminar todas las llamadas a `fbq('track', 'AddToCart')` del frontend.**

### 2.3 · El botón "PAGAR" debe tener UX clara siempre

Si el usuario hace click en "PAGAR CON MERCADO PAGO" (sea el fast button arriba o el botón del formulario) y faltan datos, el sitio debe:

1. Hacer scroll suave al primer campo requerido vacío del formulario "COMPRA DIRECTA".
2. Marcar visualmente todos los campos vacíos requeridos (borde rojo + mensaje breve abajo del campo).
3. Mostrar un toast/banner arriba del formulario: *"Completa estos datos para continuar al pago."*
4. NO disparar `InitiateCheckout` todavía — solo cuando los datos estén completos y se haga el POST real a `/api/checkout`.

### 2.4 · `InitiateCheckout` dispara una sola vez, con datos completos

Aunque el usuario tenga dos rutas para llegar a pagar (fast button arriba o botón del formulario), `InitiateCheckout` solo se dispara cuando **se hace el POST exitoso a `/api/checkout`** (o sea, cuando los datos están validados y la preferencia se está creando en MercadoPago). Esto evita duplicados y eventos huérfanos.

---

## 3 · Implementación paso a paso

### Paso 1 · Eliminar el AddToCart equivocado

En `mockups/index.html` (o donde esté el handler del `checkout-fast-button`), buscar la línea que dispara `fbq('track', 'AddToCart', ...)` con `source: 'modal_fast_cta'`. **Borrarla por completo.**

Buscar también cualquier otra llamada a `fbq('track', 'AddToCart', ...)` en todo el frontend y eliminarla. **No reemplazar — eliminar.**

### Paso 2 · Refactor del handler del fast button

El botón `checkout-fast-button` (texto "PAGAR CON MERCADO PAGO") debe cambiar de comportamiento. Pseudocódigo del nuevo handler:

```js
function onFastCheckoutClick(productSku) {
  const form = document.querySelector('#compra-directa-form');
  const requiredFields = form.querySelectorAll('[required]');

  const emptyFields = Array.from(requiredFields).filter(f => !f.value.trim());

  if (emptyFields.length > 0) {
    // Datos faltantes: scrollear al form y resaltar campos
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    emptyFields.forEach(f => f.classList.add('field-error'));
    emptyFields[0].focus();
    showInlineToast('Completa estos datos para continuar al pago.');
    return; // NO disparar nada al Pixel todavía
  }

  // Datos completos: proceder con el checkout real
  submitCheckout(productSku);
}
```

### Paso 3 · Centralizar el disparo de `InitiateCheckout`

Toda la lógica de pago (sea del fast button o del botón "Comprar ahora" del formulario) debe pasar por una sola función `submitCheckout(productSku)` que:

1. Recolecta los datos del formulario.
2. Dispara `fbq('track', 'InitiateCheckout', { ... })` con el payload completo.
3. Hace `POST /api/checkout` al Worker.
4. Si responde con `init_point`, redirige a MercadoPago.
5. Si responde con error, muestra el error al usuario sin redirigir.

Payload del `InitiateCheckout`:

```js
fbq('track', 'InitiateCheckout', {
  content_ids: [productSku],          // ej "superhombresito"
  content_name: productName,           // ej "NIETZSCHESITO.v01"
  content_category: 'figuras',
  content_type: 'product',
  contents: [{ id: productSku, quantity: 1, item_price: priceCOP }],
  value: priceCOP,                     // ej 280000
  currency: 'COP',
  num_items: 1
});
```

Importante: **disparar el evento ANTES del `window.location.href = init_point`**, no después, porque después el navegador ya salió del sitio y el beacon puede perderse. Idealmente usar `fbq` antes del redirect Y esperar ~150 ms con un `setTimeout` antes del redirect para garantizar que el beacon salió.

```js
fbq('track', 'InitiateCheckout', payload);
setTimeout(() => { window.location.href = init_point; }, 200);
```

### Paso 4 · Asegurar el evento `Purchase` en `/gracias`

En la página `/gracias` (o donde aterriza el usuario después de pagar en MercadoPago), debe dispararse:

```js
fbq('track', 'Purchase', {
  content_ids: [productSku],
  content_name: productName,
  content_type: 'product',
  contents: [{ id: productSku, quantity: 1, item_price: priceCOP }],
  value: priceCOP,
  currency: 'COP'
});
```

Los datos del producto se pueden pasar via query string desde el `back_url` de MercadoPago (`?sku=superhombresito&value=280000`) o leer de la URL del `external_reference`. Si no están en la URL, el evento `Purchase` debe dispararse igual con `value: 0` y `content_ids: ['unknown']` como fallback, anotando un `console.warn` para debug — es mejor un evento Purchase incompleto que ninguno.

**Verificación crítica:** asegurarse de que `/gracias` solo dispare `Purchase` cuando MercadoPago confirma `collection_status=approved` en la URL. Si llega con `status=failed` o `status=pending`, NO disparar `Purchase`.

### Paso 5 · CSS para los campos en error

Agregar al CSS:

```css
.field-error {
  border-color: #c62828 !important;
  background-color: #fff5f5;
}
.field-error + .field-help {
  color: #c62828;
}
.inline-toast {
  position: sticky;
  top: 0;
  background: #c62828;
  color: white;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  z-index: 10;
}
```

Y limpiar la clase `field-error` cuando el usuario empieza a escribir en el campo:

```js
form.querySelectorAll('[required]').forEach(f => {
  f.addEventListener('input', () => f.classList.remove('field-error'));
});
```

### Paso 6 · Corregir el `aria-label` inconsistente

Durante la verificación se vio que en la página `/tienda/superhombresito` el botón aún tenía `aria-label="Pagar con Mercado Pago · MARXITO.v01"` en algunos elementos. Revisar que el `aria-label` se construya dinámicamente con el SKU correcto del producto activo, no con un valor hardcodeado o cacheado.

---

## 4 · Criterios de aceptación

Antes de hacer merge:

- [ ] Búsqueda global `fbq.*AddToCart` en todo el frontend devuelve **0 resultados**.
- [ ] Click en "PAGAR CON MERCADO PAGO" (fast button) con formulario vacío: NO dispara ningún evento Pixel, scrolla al formulario, marca campos en rojo, muestra toast.
- [ ] Click en "PAGAR CON MERCADO PAGO" o "Comprar ahora" con formulario lleno: dispara **exactamente un** `InitiateCheckout` con el payload completo, espera ~200ms, redirige a MercadoPago.
- [ ] Página `/gracias` con `?collection_status=approved&...`: dispara **exactamente un** `Purchase` con el value correcto.
- [ ] Página `/gracias` con `?collection_status=rejected` o `pending`: **NO** dispara `Purchase`.
- [ ] El `aria-label` del botón corresponde siempre al SKU del producto activo.
- [ ] Los campos requeridos muestran feedback visual en rojo cuando se intenta enviar sin llenarlos, y vuelven a la normalidad cuando se empieza a escribir.

---

## 5 · Verificación post-deploy (responsabilidad del agente)

Después de desplegar a producción, hacer las siguientes pruebas reales y reportar el resultado:

1. Abrir `simioplateado.com` en navegador limpio (modo incógnito).
2. Abrir DevTools → Network → filtrar por `facebook.com/tr`.
3. Click en "Tienda" → click en una pieza → verificar que dispara `ViewContent`.
4. Click en "PAGAR CON MERCADO PAGO" sin llenar nada → verificar que NO dispara ningún evento Pixel y que la UX muestra el feedback de error.
5. Llenar el formulario con datos de prueba reales (nombre, email, teléfono, dirección).
6. Click en "PAGAR CON MERCADO PAGO" o "Comprar ahora" → verificar:
   - Se dispara `InitiateCheckout` con el payload completo (incluyendo `value` y `currency: COP`).
   - Inmediatamente después, redirige a `mercadopago.com.co/checkout/...`.
7. En Events Manager → "Probar eventos" en vivo: confirmar que aparecen los eventos en tiempo real.

Reportar a Juan: capturas de pantalla de los pasos 3, 4 y 6, más el JSON del payload de `InitiateCheckout` extraído de DevTools.

---

## 6 · Lo que NO hace este brief (queda para briefs futuros)

- **Brief V0.20 (UX home):** la home actualmente muestra solo el dibujo del simio y "Destrúyelo todo. Que no quede nada." Un visitante nuevo no encuentra el catálogo fácilmente — de 604 PageViews solo 7 personas (1.16%) terminaron viendo una pieza. Eso es un brief separado de UX, no de Pixel.
- **Brief V0.21 (Conversions API):** complemento server-side al Pixel browser-side para sortear adblockers e iOS Tracking Prevention. Lo planeamos para después de que V0.19 esté en producción y tengamos al menos 30 días de datos limpios.
- **Compra de prueba real end-to-end:** la hace Juan personalmente después de que V0.19 esté en producción. Se baja temporalmente el precio de una pieza a 5.000 COP, se hace una compra completa con tarjeta real, se verifica que `Purchase` dispara y que la orden llega a Central y al correo `el@simioplateado.com`.

---

## 7 · Notas finales para el agente

- **Email correcto:** `el@simioplateado.com`. NO uses `juan@simioplateado.com` — no existe.
- **No autoejecutes el deploy.** Después de hacer los cambios, dejá un PR/commit listo y pedile a Juan que lo apruebe antes de merge a `main`.
- **No toques el Worker** (`workers/simio-sondeo/worker.js`). Todo este brief es frontend. El endpoint `/api/checkout` ya funciona correctamente.
- **No toques el Worker de watchdog** (`workers/simio-watchdog`). Vive aparte.
- **No bajes precios reales sin pedirle a Juan.** Si necesitas hacer una prueba con precio bajo, hazla en una rama feature, no en main.
- **Si encontrás otro bug del Pixel mientras implementás esto**, anotálo en una sección "Hallazgos adicionales" al final de tu PR pero no lo arregles dentro del mismo PR — un PR, un fix.

---

*Brief V0.19 creado 2026-05-31 a partir de verificación en vivo del Pixel y del checkout. Acompaña al Brief V0.18 (Pixel implementation original) y precede al Brief V0.20 (UX de la home).*
