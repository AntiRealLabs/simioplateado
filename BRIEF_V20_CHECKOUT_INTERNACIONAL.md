# Brief V0.20 · Checkout internacional · Apertura de mercados USA / México / Canadá / Europa / Pacífico LATAM

*Brief autocontenido para un agente de Claude Code / Codex. Expande el checkout actual (limitado a Colombia) para aceptar envíos internacionales con cálculo de costo de envío automático por país, integración limpia con MercadoPago Checkout Pro, comunicación clara al cliente sobre aranceles del país destino, y guardas operativas. **Prioridad: ALTA — apertura comercial.** Versión 1.0 · 2026-06-05.*

---

## 0 · Contexto (léelo antes de tocar nada)

Hoy `simioplateado.com` solo acepta compras con dirección en Colombia. El formulario de COMPRA DIRECTA tiene el campo "País" con valor fijo "Colombia". Toda la economía del checkout está calculada asumiendo envío nacional incluido.

Juan tiene cuenta DHL Express empresarial con descuento corporativo. El 5 de junio de 2026 se hizo investigación de tarifas DHL Express desde Colombia y se determinó que para una pieza típica Simio Plateado (peso facturable ~1.5 kg, dimensiones de caja ~25×18×15 cm) el costo de envío internacional con descuento ronda:

- USA / México / Canadá: ~$116 USD por envío.
- LATAM cercano (Chile, Perú, Ecuador, Panamá): ~$105 USD.
- Europa principal (España, Francia, Alemania, Italia, Holanda): ~$205 USD.

Mercados a NO habilitar en V1:

- **Argentina, Brasil, Venezuela:** aranceles e impuestos del país destino pueden multiplicar el costo final al cliente por 2-3 veces. Mata la conversión.
- **Reino Unido:** Brexit obliga a registrarse VAT-UK como vendedor para piezas < £135. Demasiada complejidad operativa para arrancar.
- **Asia, Oceanía, África:** costos de envío altos sin de minimis equivalente. No es la prioridad estratégica.

Lo que ya existe en el repo:

- `mockups/index.html` — SPA con formulario de compra directa que ya tiene el campo "País" (hoy `value="Colombia"` y disabled o similar).
- `workers/simio-sondeo/worker.js` — Worker principal con endpoint `POST /api/checkout` que crea preferencias en MercadoPago Checkout Pro. Hoy asume implícitamente envío nacional incluido en el precio.
- `workers/simio-sondeo/wrangler.toml` — variables de entorno con precios por SKU en COP.
- `doctrina/legal-terminos.md` — términos y condiciones canónicos. Hoy mencionan envío nacional incluido y envío internacional "se cotiza aparte". Esto debe actualizarse.
- `doctrina/legal-privacidad.md` — política de privacidad. Ya menciona tratamiento de datos, no debe necesitar cambios mayores.
- Brief V0.19, V0.19.1, V0.19.2 ya implementados (Pixel, /gracias, watchdog, legales). Este brief asume que esa base está cerrada.

---

## 1 · Objetivo

Permitir que un cliente en USA, México, Canadá, España, Francia, Alemania, Italia, Holanda, Chile, Perú, Ecuador o Panamá pueda completar una compra en `simioplateado.com` viendo claramente el costo total (precio de la pieza + envío internacional), y recibiendo después de pagar un correo que le explica el tiempo de tránsito, el tracking DHL, y la responsabilidad de pagar aranceles en su país (modelo DDU — Delivered Duty Unpaid).

---

## 2 · Decisiones de diseño (no negociables)

### 2.1 · Lista cerrada de países habilitados en V1

Solo estos países pueden completar checkout. Cualquier otro país queda bloqueado con mensaje "próximamente":

| Código ISO | País | Zona DHL | Tarifa cliente USD |
|---|---|---|---|
| CO | Colombia | nacional | (incluido en precio) |
| US | Estados Unidos | 3 | 130 |
| MX | México | 3 | 130 |
| CA | Canadá | 3 | 140 |
| ES | España | 5 | 230 |
| FR | Francia | 5 | 230 |
| DE | Alemania | 5 | 230 |
| IT | Italia | 5 | 230 |
| NL | Holanda | 5 | 230 |
| CL | Chile | 1 | 120 |
| PE | Perú | 1 | 120 |
| EC | Ecuador | 1 | 115 |
| PA | Panamá | 1 | 115 |

Las tarifas incluyen un margen del 15 % sobre el costo real DHL con descuento Business para absorber fluctuaciones del recargo de combustible y del tipo de cambio. Estas tarifas se almacenan en `wrangler.toml` como variables de entorno editables sin redeploy de código.

### 2.2 · Modelo DDU (Delivered Duty Unpaid)

El cliente paga al checkout el precio de la pieza + el envío internacional. **NO** paga aranceles del país destino al checkout — los paga al recibir, directamente al transportista DHL en su país. Esto se comunica explícitamente:

- En el formulario, junto al monto de envío.
- En el correo de confirmación de pago.
- En la página `/gracias` cuando el pago se aprueba.
- En los términos y condiciones actualizados.

No usar DDP (Delivered Duty Paid) en V1 — agregaría complejidad de cálculo de impuestos por país y exposición a errores costosos.

### 2.3 · Una sola moneda en el checkout: COP

MercadoPago Checkout Pro de Colombia opera en COP. Toda la conversión USD→COP se hace en el Worker antes de crear la preferencia, usando una tasa configurable en variable de entorno (`USD_TO_COP_RATE`). El cliente internacional ve el costo en COP en MercadoPago pero su tarjeta se le cobrará en su moneda local por la cuenta de su banco emisor (conversión automática del banco a la tasa del día).

Mostrar al cliente AMBAS monedas en el frontend (USD referencial + COP cobrado) para que entienda qué va a aparecer en su estado de cuenta.

### 2.4 · Cálculo de envío server-side, NO client-side

El frontend NUNCA calcula el envío localmente. Le pregunta al Worker con `GET /api/shipping-cost?country=US&sku=superhombresito` y muestra el resultado. Esto garantiza:

- Una única fuente de verdad (las variables del Worker).
- Actualización sin redeploy del frontend cuando Juan ajuste tarifas.
- Imposibilidad de manipular el costo desde el cliente (alguien que abra DevTools no puede cambiar el costo de envío a $1).

### 2.5 · Validación doble del país: frontend Y backend

El frontend solo muestra los países habilitados en el dropdown. PERO el backend (`POST /api/checkout`) también valida el código de país recibido contra la lista whitelist. Si llega un país no permitido, devuelve 400 con mensaje claro. Esto previene que alguien manipule el form vía DevTools para enviar a un país deshabilitado.

### 2.6 · Comunicación de aranceles obligatoria antes del pago

El cliente debe ver, ANTES de hacer click en "Comprar ahora", un mensaje claro que diga: *"Al recibir el paquete en tu país, deberás pagar los aranceles e impuestos locales directamente a DHL. Estos costos varían por país y NO están incluidos en el precio de esta compra."*

Esto NO es letra chica enterrada en términos — es un mensaje visible junto al desglose de precio, con tipografía clara. Razón legal: defensa contra disputas de tarjeta. Razón ética: cliente bien informado no se enoja al recibir.

---

## 3 · Implementación paso a paso

### Paso 1 · Variables de entorno en el Worker

En `workers/simio-sondeo/wrangler.toml`, agregar bloque:

```toml
[vars]
# Tasa USD a COP (Juan la actualiza manualmente cada 1-2 semanas según TRM)
USD_TO_COP_RATE = "4150"

# Tarifas de envío internacional en USD por país (incluye margen 15%)
SHIPPING_US = "130"
SHIPPING_MX = "130"
SHIPPING_CA = "140"
SHIPPING_ES = "230"
SHIPPING_FR = "230"
SHIPPING_DE = "230"
SHIPPING_IT = "230"
SHIPPING_NL = "230"
SHIPPING_CL = "120"
SHIPPING_PE = "120"
SHIPPING_EC = "115"
SHIPPING_PA = "115"

# Lista de países habilitados (CSV, fácil de actualizar)
COUNTRIES_ENABLED = "CO,US,MX,CA,ES,FR,DE,IT,NL,CL,PE,EC,PA"
```

### Paso 2 · Nuevo endpoint `/api/shipping-cost`

En `workers/simio-sondeo/worker.js`, agregar:

```js
if (url.pathname === '/api/shipping-cost' && request.method === 'GET') {
  const country = url.searchParams.get('country');
  const sku = url.searchParams.get('sku');

  const enabledCountries = (env.COUNTRIES_ENABLED || '').split(',');
  if (!country || !enabledCountries.includes(country)) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'country_not_enabled',
      message: 'Aún no enviamos a este país.'
    }), { status: 400, headers: corsHeaders });
  }

  // Colombia: envío incluido en el precio
  if (country === 'CO') {
    return new Response(JSON.stringify({
      ok: true,
      country: 'CO',
      shipping_usd: 0,
      shipping_cop: 0,
      included: true,
      message: 'Envío nacional incluido en el precio.'
    }), { status: 200, headers: corsHeaders });
  }

  const shippingUsd = parseFloat(env[`SHIPPING_${country}`]);
  if (!shippingUsd || isNaN(shippingUsd)) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'rate_not_configured',
      message: 'Tarifa no configurada para este país. Contactanos.'
    }), { status: 500, headers: corsHeaders });
  }

  const rate = parseFloat(env.USD_TO_COP_RATE || '4150');
  const shippingCop = Math.ceil(shippingUsd * rate);

  return new Response(JSON.stringify({
    ok: true,
    country,
    shipping_usd: shippingUsd,
    shipping_cop: shippingCop,
    included: false,
    transit_days_estimate: getTransitDays(country),
    customs_warning: 'Aranceles e impuestos en destino son responsabilidad del comprador y se pagan directamente a DHL al recibir el paquete.'
  }), { status: 200, headers: corsHeaders });
}

function getTransitDays(country) {
  const map = {
    'US': '3-5 días hábiles',
    'MX': '3-5 días hábiles',
    'CA': '3-6 días hábiles',
    'ES': '4-7 días hábiles',
    'FR': '4-7 días hábiles',
    'DE': '4-7 días hábiles',
    'IT': '4-7 días hábiles',
    'NL': '4-7 días hábiles',
    'CL': '3-5 días hábiles',
    'PE': '2-4 días hábiles',
    'EC': '2-4 días hábiles',
    'PA': '2-4 días hábiles'
  };
  return map[country] || '5-10 días hábiles';
}
```

### Paso 3 · Modificar `/api/checkout` para incluir shipping

En el mismo `worker.js`, en la función que crea la preferencia MercadoPago:

```js
async function handleCheckout(request, env) {
  const body = await request.json();
  const { sku, customer, country } = body;

  // 1. Validar país habilitado
  const enabledCountries = (env.COUNTRIES_ENABLED || '').split(',');
  if (!country || !enabledCountries.includes(country)) {
    return jsonResponse({ ok: false, error: 'country_not_enabled' }, 400);
  }

  // 2. Obtener precio del producto (ya existente)
  const productPriceCop = parseInt(env[`PRICE_${sku.toUpperCase()}`]);
  if (!productPriceCop) return jsonResponse({ ok: false, error: 'sku_not_found' }, 400);

  // 3. Calcular shipping
  let shippingCop = 0;
  if (country !== 'CO') {
    const shippingUsd = parseFloat(env[`SHIPPING_${country}`]);
    const rate = parseFloat(env.USD_TO_COP_RATE || '4150');
    shippingCop = Math.ceil(shippingUsd * rate);
  }

  // 4. Construir items para MercadoPago
  const items = [{
    id: sku,
    title: customer.productName || sku,
    quantity: 1,
    unit_price: productPriceCop,
    currency_id: 'COP'
  }];

  // Si hay shipping, agregarlo como item separado para que el cliente lo vea claro en MP
  if (shippingCop > 0) {
    items.push({
      id: `shipping-${country}`,
      title: `Envío internacional a ${country} vía DHL Express`,
      quantity: 1,
      unit_price: shippingCop,
      currency_id: 'COP'
    });
  }

  // 5. external_reference con SKU + country para parsing en /gracias
  const orderId = generateOrderId(); // ej. 0042
  const externalRef = `SP-${new Date().getFullYear()}-${orderId}-${sku}-${country}`;

  // 6. Crear preferencia
  const preference = {
    items,
    payer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone ? { number: customer.phone } : undefined,
      address: {
        street_name: customer.address,
        zip_code: customer.zip || ''
      }
    },
    shipments: {
      receiver_address: {
        street_name: customer.address,
        city_name: customer.city,
        state_name: customer.state,
        zip_code: customer.zip || '',
        country_name: country
      }
    },
    back_urls: {
      success: 'https://simioplateado.com/gracias',
      pending: 'https://simioplateado.com/gracias',
      failure: 'https://simioplateado.com/gracias'
    },
    auto_return: 'approved',
    external_reference: externalRef,
    notification_url: 'https://api.simioplateado.com/api/mercadopago/webhook',
    statement_descriptor: 'SIMIO PLATEADO'
  };

  // 7. POST a MercadoPago (lógica existente)
  const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preference)
  });
  const pref = await mpResponse.json();

  // 8. Guardar orden en KV para tracking
  await env.VOTES.put(`order:${externalRef}`, JSON.stringify({
    sku, country, customer, productPriceCop, shippingCop,
    totalCop: productPriceCop + shippingCop,
    preferenceId: pref.id,
    status: 'created',
    createdAt: new Date().toISOString()
  }));

  return jsonResponse({
    ok: true,
    init_point: pref.init_point,
    preference_id: pref.id,
    total_cop: productPriceCop + shippingCop
  }, 200);
}
```

### Paso 4 · Frontend · selector de país y cálculo dinámico

En `mockups/index.html`, en el formulario "COMPRA DIRECTA":

```html
<label>
  País
  <select name="country" id="country-select" required>
    <option value="CO" selected>Colombia (envío incluido)</option>
    <option value="US">Estados Unidos</option>
    <option value="MX">México</option>
    <option value="CA">Canadá</option>
    <option value="ES">España</option>
    <option value="FR">Francia</option>
    <option value="DE">Alemania</option>
    <option value="IT">Italia</option>
    <option value="NL">Holanda</option>
    <option value="CL">Chile</option>
    <option value="PE">Perú</option>
    <option value="EC">Ecuador</option>
    <option value="PA">Panamá</option>
  </select>
</label>

<div id="shipping-info">
  <p class="shipping-line">Envío: <span id="shipping-amount">Calculando…</span></p>
  <p class="customs-warning" id="customs-warning" style="display:none">
    ⚠ Aranceles e impuestos en destino los paga el comprador directamente a DHL al recibir el paquete. Varían por país y NO están incluidos en este precio.
  </p>
  <p class="total-line">Total a pagar: <strong id="total-amount">—</strong></p>
</div>
```

JavaScript del componente:

```js
const countrySelect = form.querySelector('#country-select');
const shippingAmountEl = form.querySelector('#shipping-amount');
const customsWarningEl = form.querySelector('#customs-warning');
const totalAmountEl = form.querySelector('#total-amount');

async function updateShippingForCountry(country, sku, productPriceCop) {
  shippingAmountEl.textContent = 'Calculando…';
  totalAmountEl.textContent = '—';
  customsWarningEl.style.display = 'none';

  try {
    const r = await fetch(`https://api.simioplateado.com/api/shipping-cost?country=${country}&sku=${sku}`);
    const data = await r.json();
    if (!data.ok) {
      shippingAmountEl.textContent = data.message || 'No disponible';
      return;
    }

    if (data.included) {
      shippingAmountEl.textContent = 'Incluido (Colombia)';
      totalAmountEl.textContent = formatCop(productPriceCop);
    } else {
      shippingAmountEl.textContent = `COP ${formatCop(data.shipping_cop)} (~USD ${data.shipping_usd})`;
      totalAmountEl.textContent = `COP ${formatCop(productPriceCop + data.shipping_cop)}`;
      customsWarningEl.style.display = 'block';
    }
  } catch (e) {
    shippingAmountEl.textContent = 'Error al calcular. Intenta de nuevo.';
  }
}

countrySelect.addEventListener('change', () => {
  updateShippingForCountry(countrySelect.value, currentSku, currentProductPriceCop);
});

// Calcular al abrir el formulario
updateShippingForCountry('CO', currentSku, currentProductPriceCop);

function formatCop(n) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0 });
}
```

### Paso 5 · Adaptar `ciudad`, `departamento/estado` y `código postal`

Los placeholders del formulario hoy dicen "Medellín", "Antioquia", "050001". Cuando el cliente selecciona país internacional, deben actualizarse los placeholders:

```js
const PLACEHOLDERS_BY_COUNTRY = {
  CO: { city: 'Medellín', state: 'Antioquia', zip: '050001 (opcional)' },
  US: { city: 'Brooklyn', state: 'New York', zip: '11201' },
  MX: { city: 'Ciudad de México', state: 'CDMX', zip: '06700' },
  CA: { city: 'Toronto', state: 'Ontario', zip: 'M5H 2N2' },
  ES: { city: 'Madrid', state: 'Madrid', zip: '28013' },
  FR: { city: 'París', state: 'Île-de-France', zip: '75001' },
  DE: { city: 'Berlín', state: 'Berlín', zip: '10115' },
  IT: { city: 'Roma', state: 'Lazio', zip: '00184' },
  NL: { city: 'Ámsterdam', state: 'Noord-Holland', zip: '1011' },
  CL: { city: 'Santiago', state: 'RM', zip: '8320000' },
  PE: { city: 'Lima', state: 'Lima', zip: '15001' },
  EC: { city: 'Quito', state: 'Pichincha', zip: '170135' },
  PA: { city: 'Ciudad de Panamá', state: 'Panamá', zip: '0801' }
};

// Para países internacionales (todos excepto CO), el código postal debería volverse REQUERIDO
// porque DHL necesita ZIP para entrega correcta.
function updateAddressFieldsForCountry(country) {
  const placeholders = PLACEHOLDERS_BY_COUNTRY[country];
  if (!placeholders) return;
  cityInput.placeholder = placeholders.city;
  stateInput.placeholder = placeholders.state;
  zipInput.placeholder = placeholders.zip;
  zipInput.required = country !== 'CO';
}
```

### Paso 6 · Actualizar `/gracias` para internacional

En el render de `/gracias` (Brief V0.19.1), parsear el external_reference completo `SP-YYYY-XXXX-<sku>-<country>` para extraer el país y mostrar mensajería específica:

```js
const refMatch = externalRef.match(/^SP-\d{4}-\d+-([^-]+)-([A-Z]{2})$/);
const sku = refMatch ? refMatch[1] : null;
const country = refMatch ? refMatch[2] : 'CO';

// En la vista "Pago confirmado", si country !== 'CO':
if (country !== 'CO') {
  appendSection(`
    <section class="aviso-internacional">
      <h2>Envío internacional</h2>
      <p>Tu pedido se enviará vía DHL Express desde Medellín, Colombia, a ${COUNTRY_NAME[country]}.</p>
      <p><strong>Tiempo estimado de tránsito:</strong> ${getTransitDays(country)} después del despacho. Recibirás el número de guía y link de rastreo por correo cuando tu pieza salga de nuestro taller.</p>
      <p><strong>Aranceles e impuestos:</strong> al recibir el paquete, DHL te contactará para cobrarte los impuestos de importación de ${COUNTRY_NAME[country]}. Estos NO están incluidos en el precio que pagaste y varían según las leyes de cada país. Para piezas de arte/decoración, suelen rondar el 5-25% del valor declarado.</p>
      <p>Si tienes preguntas sobre el envío, escribinos a <a href="mailto:el@simioplateado.com">el@simioplateado.com</a> citando tu referencia de pedido.</p>
    </section>
  `);
}
```

### Paso 7 · Email de confirmación internacional

En la función que envía email tras webhook de pago aprobado, si `country !== 'CO'`, usar plantilla internacional:

```
Asunto: Pedido confirmado · Simio Plateado · envío internacional a {COUNTRY}

Hola {NOMBRE},

Recibimos tu pago. Tu pieza {SKU} está entrando en producción.

DETALLES:
- Pedido: SP-2026-XXXX
- Pieza: {NOMBRE_PIEZA}
- Destino: {DIRECCIÓN COMPLETA}
- Precio pieza: COP {X}
- Envío internacional: COP {Y}
- Total pagado: COP {Z}

PRÓXIMOS PASOS:
1. Producción y acabado a mano: 5-10 días hábiles.
2. Despacho vía DHL Express: te enviamos número de guía cuando salga.
3. Tránsito a {COUNTRY}: {transit_days}.
4. Recepción: DHL te contactará para coordinar entrega y cobrar aranceles locales.

ARANCELES E IMPUESTOS:
Como te avisamos al pagar, los impuestos de importación a {COUNTRY} corren por tu cuenta y los pagas directamente a DHL al recibir. Estos costos no son parte de tu compra con nosotros — son del gobierno de {COUNTRY}.

Cualquier duda: respondé este correo o escribinos a el@simioplateado.com.

— Simio Plateado / Anti Real Labs S.A.S.
Medellín, Colombia
```

### Paso 8 · Actualizar `doctrina/legal-terminos.md`

Agregar (o modificar la sección existente de envíos):

```markdown
## Envíos internacionales

Simio Plateado despacha a los siguientes países a través de DHL Express en modalidad DDU (Delivered Duty Unpaid): Estados Unidos, México, Canadá, España, Francia, Alemania, Italia, Holanda, Chile, Perú, Ecuador y Panamá.

El costo de envío internacional se calcula al momento del checkout según el país de destino y se cobra junto con el precio de la pieza en una sola transacción en pesos colombianos (COP).

**Aranceles e impuestos del país destino:** son responsabilidad exclusiva del comprador. DHL u otra autoridad aduanera del país destino contactará al comprador para coordinar el pago de aranceles y la entrega. Simio Plateado no es responsable por:

- Aranceles, IVA, impuestos de importación o cargos administrativos cobrados por la aduana del país destino.
- Demoras en la entrega causadas por procesos aduaneros.
- Rechazo de un paquete por el comprador, lo que implica pérdida del valor de la pieza y del envío.

Si el paquete es rechazado en aduana por el comprador o devuelto a Colombia, Simio Plateado reembolsará únicamente el valor de la pieza, descontando los costos de envío (ida y vuelta) y los gastos aduaneros incurridos.

**Tiempos estimados de tránsito** (después del despacho, hábiles):

- USA, México, Centroamérica: 3-5 días.
- LATAM (Chile, Perú, Ecuador, Panamá): 2-5 días.
- Europa: 4-7 días.
- Canadá: 3-6 días.

Estos tiempos son estimados de DHL Express y no constituyen garantía contractual. Los procesos aduaneros del país destino pueden agregar tiempo adicional.
```

### Paso 9 · Watchdog del nuevo endpoint

Agregar `https://api.simioplateado.com/api/shipping-cost?country=US&sku=superhombresito` a la lista de URLs que el Worker `simio-watchdog` verifica cada 15 minutos. Si responde con `ok: false` o status no-200, alertar.

En `workers/simio-watchdog/worker.js` (existente), agregar al array de health checks:

```js
{ name: 'shipping-cost-US', url: 'https://api.simioplateado.com/api/shipping-cost?country=US&sku=superhombresito', expectedKey: 'shipping_cop' },
{ name: 'shipping-cost-ES', url: 'https://api.simioplateado.com/api/shipping-cost?country=ES&sku=superhombresito', expectedKey: 'shipping_cop' }
```

### Paso 10 · Pixel · agregar país al payload de InitiateCheckout y Purchase

En el frontend, cuando se dispara `fbq('track', 'InitiateCheckout', ...)` y `fbq('track', 'Purchase', ...)`, incluir el país en el payload:

```js
fbq('track', 'InitiateCheckout', {
  content_ids: [sku],
  content_name: productName,
  content_category: 'figuras',
  value: totalCop / 1000, // o convertir a USD si preferís
  currency: 'COP',
  country: country // ← agregado
});
```

Esto permite a Meta optimizar campañas geo-targeted y ver conversiones por país en Events Manager.

---

## 4 · Criterios de aceptación

Antes de hacer merge:

- [ ] Variables de entorno agregadas en `wrangler.toml` (tarifas + tasa USD/COP + lista de países).
- [ ] `GET /api/shipping-cost?country=US&sku=superhombresito` devuelve 200 con `shipping_cop` calculado.
- [ ] `GET /api/shipping-cost?country=AR` devuelve 400 con error `country_not_enabled`.
- [ ] `GET /api/shipping-cost?country=CO` devuelve 200 con `included: true, shipping_cop: 0`.
- [ ] Formulario web tiene dropdown de país con los 13 países habilitados.
- [ ] Al cambiar de país, se actualiza dinámicamente el costo de envío y el total visible.
- [ ] Al seleccionar país internacional, aparece el aviso de aranceles en lugar visible (no escondido).
- [ ] Los placeholders de ciudad/estado/zip cambian según el país seleccionado.
- [ ] Al seleccionar país internacional, el campo ZIP/código postal se vuelve REQUERIDO.
- [ ] `POST /api/checkout` con país no habilitado devuelve 400.
- [ ] `POST /api/checkout` con país habilitado y datos válidos crea preferencia MP con 2 items (pieza + envío).
- [ ] El external_reference incluye `-<sku>-<country>` al final.
- [ ] La preferencia MP creada para un cliente en USA, al abrirla en MercadoPago, muestra dos líneas claras: pieza y envío internacional.
- [ ] `/gracias` parsea correctamente el external_reference y muestra mensaje internacional si country !== CO.
- [ ] El correo de confirmación enviado al cliente internacional usa la plantilla internacional con sección de aranceles.
- [ ] `doctrina/legal-terminos.md` tiene la sección de envíos internacionales agregada.
- [ ] El watchdog verifica `/api/shipping-cost` para al menos 2 países (US y ES).
- [ ] El Pixel envía `country` en los payloads de InitiateCheckout y Purchase.

---

## 5 · Verificación post-deploy (responsabilidad del agente)

Reportar a Juan con capturas:

1. Captura del formulario en `/tienda/superhombresito` mostrando el dropdown de países desplegado con los 13 opciones.
2. Captura tras seleccionar "Estados Unidos": mostrar el costo de envío calculado en USD y COP, el aviso de aranceles visible, y el total actualizado.
3. Output de `curl https://api.simioplateado.com/api/shipping-cost?country=US&sku=superhombresito` con el JSON de respuesta.
4. Output de `curl https://api.simioplateado.com/api/shipping-cost?country=BR&sku=superhombresito` mostrando el 400.
5. Captura de una preferencia de prueba creada en MercadoPago (sin pagar) para un envío a México mostrando los 2 items separados.
6. Captura de `/gracias?collection_status=approved&external_reference=SP-2026-9999-superhombresito-US&payment_id=test` renderizando la vista con sección internacional.
7. Captura del correo de prueba enviado a una dirección de prueba con la plantilla internacional.
8. Captura del Events Manager mostrando un evento Purchase con `country: US` en los parámetros.

---

## 6 · Lo que NO hace este brief

- **No implementa cotización DHL en tiempo real vía API.** Esto vendría en Brief V0.21 si la operación lo justifica. Por ahora la tabla estática + actualización manual de Juan es suficiente.
- **No habilita Argentina, Brasil, Venezuela, UK, Asia, Oceanía o África.** Eso queda para Brief V0.22 cuando se evalúe caso por caso.
- **No implementa DDP (Delivered Duty Paid).** Esto requeriría integración con un servicio de cálculo de impuestos por país. Por ahora DDU es el estándar.
- **No traduce el sitio al inglés.** Eso es Brief V0.11 (pendiente). El sitio queda en español; los clientes internacionales que compran asumimos que entienden español o usan traductor del navegador.
- **No cambia la moneda del checkout a USD.** MP Colombia opera en COP y así se queda. El cliente internacional ve COP en MP, su banco hace la conversión.

---

## 7 · Notas finales para el agente

- **Email correcto:** `el@simioplateado.com`. NO uses `juan@simioplateado.com`.
- **No autoejecutes deploy a main.** Deja PR listo y pedile a Juan que apruebe.
- **La tasa USD/COP en variables de entorno la actualiza Juan, NO vos.** No la hardcodees ni la conectes a una API de tipo de cambio en este brief (eso es V0.21).
- **Si encontrás bugs del Pixel o del checkout durante la implementación**, anotálos al final del PR como "Hallazgos adicionales" pero no los arregles dentro de este PR. Un PR, un fix.
- **Las tarifas de envío están SIN descuento aplicado.** Cuando Juan confirme su descuento DHL real con su account manager, podemos bajarlas. Por ahora prefiero estar arriba que abajo — si el cliente paga $130 y nos cuesta $116, ganamos. Si el cliente paga $100 y nos cuesta $116, perdemos en cada envío.
- **Verificá el formato del campo `country_name` en `shipments.receiver_address` de MercadoPago.** Algunas integraciones esperan código ISO de 2 letras, otras esperan nombre completo. Usá el código ISO ("US", no "United States") y confirmá con doc oficial de MP que acepta así.
- **El campo `phone` en MP requiere formato sin espacios.** El cliente puede ingresar "+1 555 123 4567" — antes de enviar a MP normalizá a "+15551234567".

---

*Brief V0.20 creado 2026-06-05 a partir de investigación de tarifas DHL Express Colombia. Acompaña a Brief V0.19 (Pixel), V0.19.1 (gracias + watchdog) y V0.19.2 (legales + footer). Depende de que esos tres estén implementados en producción antes de mergear este.*
