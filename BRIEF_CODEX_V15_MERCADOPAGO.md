# Brief Codex · V0.15 · Integración MercadoPago Checkout Pro · Simio Plateado

*Brief operativo para conectar el botón "Comprar ahora" de simioplateado.com a un cobro real vía **MercadoPago Checkout Pro**. Es el bloqueador real del lanzamiento: hoy el botón existe pero no hace nada — no hay SDK cargado, no hay endpoint backend, ninguna venta puede completarse. Este brief construye toda la cadena: frontend → Worker → MercadoPago → webhook → KV. Versión 1.0 · 2026-05-25.*

---

## 0 · Contexto y diagnóstico (lo que está pasando hoy)

Verificación en vivo sobre simioplateado.com revela:

- No hay SDK de MercadoPago (ni de PayPal) cargado en la página.
- Los endpoints `/api/create-order`, `/api/preference`, `/api/mercadopago/*` responden **405 Method Not Allowed** — no existen en el Worker.
- Las rutas tipo `/api/orders`, `/api/me` devuelven el HTML de la SPA — el Worker no las maneja.
- El "formulario" de envío no es un `<form>` real; los 14 botones "Comprar ahora" tienen un `onclick` que solo abre la ficha del producto.
- La nota *"Mercado Pago procesa el cobro en COP"* es solo texto — no refleja una integración real.

Resultado: aunque un cliente quiera pagar, **no puede**. Este brief arregla eso.

---

## 1 · Decisiones clave (no negociables para este brief)

1. **Producto MercadoPago:** **Checkout Pro** (redirección al checkout hospedado de MP). Es el más simple y robusto para empezar. Nada de Checkout Transparente / Bricks por ahora.
2. **País:** Colombia. MercadoPago Colombia liquida en **COP**.
3. **Moneda mostrada vs cobrada:** se muestra USD como referencia (catálogo internacional), se **cobra en COP** vía MP. Conversión por tabla COP del lado del Worker (no FX en vivo en v1).
4. **Tipo de pieza por ahora:** únicas (`unica`) — 1 unidad por SKU. Stock se decrementa de `SIMIO_INVENTORY`.
5. **Identificador propio:** `external_reference = SP-YYYY-NNNN` (autogenerado), KV `SIMIO_ORDERS` keyed por ese ID.
6. **Sandbox primero, live después.** No se conmuta a credenciales productivas hasta que el flujo sandbox esté probado y verificado.

---

## 2 · Arquitectura

```
simioplateado.com (Cloudflare Pages SPA)
└── Frontend
    └── Página /tienda/<pieza>
        ├── Formulario de envío
        └── Botón COMPRAR AHORA
              │
              ▼ POST { pieza, cliente, dirección }
Worker (Cloudflare)
├── POST /api/create-preference
│     ├─ Valida stock en SIMIO_INVENTORY
│     ├─ Reserva (RESERVED:<external_reference> con TTL 30 min)
│     ├─ Crea preferencia en MercadoPago API
│     ├─ Guarda orden parcial en SIMIO_ORDERS (estado PENDIENTE)
│     └─ Devuelve { external_reference, init_point } al frontend
│
├── POST /api/webhook/mercadopago    ← MercadoPago llama acá tras el pago
│     ├─ Verifica firma (x-signature)
│     ├─ Consulta /v1/payments/{id} con Access Token
│     ├─ Actualiza orden en SIMIO_ORDERS (mp_payment_id, mp_status)
│     ├─ Si approved: marca pieza SOLD en SIMIO_INVENTORY
│     ├─ Si rejected/cancelled: libera reserva (vuelve AVAILABLE)
│     ├─ Envía correo de confirmación al cliente
│     └─ Envía alerta interna a Juan
│
└── GET /api/order/:external_reference   ← para la página /orden-confirmada
      └─ Devuelve estado actual de la orden

KV namespaces
├── SIMIO_ORDERS      → JSON de cada pedido por external_reference
└── SIMIO_INVENTORY   → estado por pieza: AVAILABLE | RESERVED:<ref> | SOLD:<ref>
```

Flujo del usuario:

```
1. Cliente llena formulario y presiona COMPRAR AHORA
2. Frontend → POST /api/create-preference
3. Worker valida stock, reserva, crea preferencia en MP, guarda orden, devuelve init_point
4. Frontend redirecciona a init_point (checkout hospedado de MP)
5. Cliente paga en MP (tarjeta, PSE, Nequi, Efecty, etc.)
6. MP redirecciona a back_urls.success → /orden-confirmada?ref=<external_reference>
7. (Asíncrono) MP llama al webhook con el resultado del pago
8. Worker procesa el webhook, marca SOLD, envía correos
9. Página /orden-confirmada consulta /api/order/:ref y muestra estado
```

---

## 3 · Lo que hace Juan manualmente (prerrequisito antes de codex)

### 3.1 · Crear app en MercadoPago Developers

1. Ir a [mercadopago.com.co/developers](https://www.mercadopago.com.co/developers) y entrar con la cuenta de Anti Real Labs.
2. **Tus integraciones → Crear aplicación**.
3. Nombre: `Simio Plateado · Tienda`.
4. ¿Qué producto vas a integrar?: **Checkout Pro** (pagos online).
5. Modelo: `Pago presencial: NO`. Modelo de integración: estándar.
6. Crear.

### 3.2 · Obtener credenciales

Dentro de la app creada → **Credenciales**:

- **Credenciales de prueba** (sandbox): `TEST-...`
  - Public Key (TEST-...)
  - Access Token (TEST-...)
- **Credenciales de producción** (live): `APP_USR-...`
  - Public Key (APP_USR-...)
  - Access Token (APP_USR-...)

⚠️ El **Access Token nunca va al frontend ni a chat**. Es secreto. Solo se mete en Cloudflare como env var cifrada.

### 3.3 · Configurar webhook en MercadoPago

Dentro de la app → **Webhooks → Configurar notificaciones**:

- URL de producción: `https://simioplateado.com/api/webhook/mercadopago`
- URL de pruebas: la misma o un branch preview
- Eventos a recibir: **Pagos** (`payment`)
- Guardar y copiar el **Secret de la firma** (clave para validar x-signature).

### 3.4 · Configurar env vars en Cloudflare (Worker de Simio)

Cloudflare → Workers & Pages → proyecto Simio → Settings → Variables. Agregar:

| Variable | Tipo | Valor |
|---|---|---|
| `MP_PUBLIC_KEY` | Texto plano | Public Key (LIVE) |
| `MP_ACCESS_TOKEN` | **Secreto cifrado** | Access Token (LIVE) |
| `MP_WEBHOOK_SECRET` | **Secreto cifrado** | Secret de la firma |
| `MP_ENV` | Texto plano | `live` (o `sandbox` para pruebas) |
| `MP_PUBLIC_KEY_TEST` | Texto plano | Public Key (TEST) |
| `MP_ACCESS_TOKEN_TEST` | **Secreto cifrado** | Access Token (TEST) |
| `EMAIL_FROM` | Texto plano | `Simio Plateado <contacto@simioplateado.com>` o el que uses |
| `EMAIL_ADMIN` | Texto plano | correo de Juan para alertas internas |

El Worker elige credenciales según `MP_ENV`.

---

## 4 · Esquema de la orden en `SIMIO_ORDERS`

Cada orden se guarda con clave `external_reference` (ej. `SP-2026-0001`).

```json
{
  "external_reference": "SP-2026-0001",
  "pieza": "superhombresito.v01",
  "tipo": "unica",
  "monto_usd": 77,
  "monto_cop": 308000,
  "moneda": "COP",
  "cliente_nombre": "Nombre Apellido",
  "cliente_email": "cliente@correo.com",
  "cliente_telefono": "+57 300 0000000",
  "direccion": {
    "linea1": "Calle 00 #00-00",
    "ciudad": "Medellín",
    "departamento": "Antioquia",
    "pais": "CO",
    "codigo_postal": "050001",
    "notas": ""
  },
  "fecha_creacion": "2026-05-25T15:00:00Z",
  "fecha_pago": null,
  "mp_preference_id": "1234-abcd",
  "mp_payment_id": null,
  "mp_status": "pending",
  "estado": "PENDIENTE_PAGO",
  "init_point": "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=..."
}
```

Estados de `estado` (campo nuestro, distinto al `mp_status` de MP):

- `PENDIENTE_PAGO` (creada, esperando que el cliente pague)
- `PAGADO` (webhook recibió approved)
- `RECHAZADO` (webhook recibió rejected)
- `CANCELADO` (cliente canceló o expiró la reserva)

Los campos de fulfillment (`guia`, `estado_fulfillment`, `checklist`, etc.) los agrega la Central (V0.14), no este brief.

---

## 5 · Tabla de precios COP (catálogo)

Crear un módulo `pricing.js` (o constante en el Worker) con los precios en COP por SKU. Esto evita FX en vivo en v1.

```js
// Actualizar manualmente cuando cambie el tipo de cambio o el catálogo.
const CATALOGO = {
  'superhombresito.v01':  { usd: 77, cop: 308000, tipo: 'unica' },
  'marxito.v01':          { usd: 83, cop: 332000, tipo: 'unica' },
  'traumin.v01':          { usd: 74, cop: 296000, tipo: 'unica' },
  // … resto del catálogo a medida que se publique
};
```

Regla: el monto cobrado es `cop`. El `usd` se muestra como referencia. La tabla la actualiza Juan periódicamente.

---

## 6 · Endpoints del Worker

### 6.1 · `POST /api/create-preference`

**Request body** (del frontend):

```json
{
  "pieza": "superhombresito.v01",
  "cliente": {
    "nombre": "Nombre Apellido",
    "email": "cliente@correo.com",
    "telefono": "+57 300 0000000"
  },
  "direccion": {
    "linea1": "...", "ciudad": "Medellín", "departamento": "Antioquia",
    "pais": "CO", "codigo_postal": "050001", "notas": ""
  }
}
```

**Lógica:**

1. Validar payload (campos obligatorios, formato email, etc.). Si falla → `400` con mensaje.
2. Validar pieza existe en `CATALOGO`. Si no → `400`.
3. Validar stock en `SIMIO_INVENTORY`:
   - Lee `SIMIO_INVENTORY.get(piezaKey)`.
   - Si es `AVAILABLE` → continúa.
   - Si es `RESERVED:<ref>` y la TTL aún no expira → `409 Conflict` ("alguien está pagando esta pieza, intenta en unos minutos").
   - Si es `SOLD:<ref>` → `410 Gone` ("pieza ya vendida").
4. Generar `external_reference = "SP-" + año + "-" + zeroPad(counter)`. El contador se mantiene en `SIMIO_COUNTERS` KV (clave `orders`).
5. Crear preferencia en MercadoPago:

```js
const base = env.MP_ENV === 'live' 
  ? 'https://api.mercadopago.com' 
  : 'https://api.mercadopago.com'; // misma URL, las credenciales determinan el modo
const accessToken = env.MP_ENV === 'live' ? env.MP_ACCESS_TOKEN : env.MP_ACCESS_TOKEN_TEST;

const preferenceRes = await fetch(`${base}/checkout/preferences`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [{
      id: piezaKey,
      title: `${piezaKey} · Simio Plateado`,
      description: 'Pieza única hecha a mano · Medellín',
      quantity: 1,
      currency_id: 'COP',
      unit_price: precio.cop
    }],
    payer: {
      name: cliente.nombre,
      email: cliente.email,
      phone: { number: cliente.telefono }
    },
    external_reference: external_reference,
    notification_url: 'https://simioplateado.com/api/webhook/mercadopago',
    back_urls: {
      success: `https://simioplateado.com/orden-confirmada?ref=${external_reference}`,
      failure: `https://simioplateado.com/orden-fallida?ref=${external_reference}`,
      pending: `https://simioplateado.com/orden-pendiente?ref=${external_reference}`
    },
    auto_return: 'approved',
    statement_descriptor: 'SIMIO PLATEADO',
    metadata: { external_reference, pieza: piezaKey }
  })
});

const preference = await preferenceRes.json();
```

6. Reservar pieza: `SIMIO_INVENTORY.put(piezaKey, "RESERVED:" + external_reference, { expirationTtl: 1800 })` (30 min).
7. Guardar orden parcial en `SIMIO_ORDERS` con estado `PENDIENTE_PAGO`, `mp_preference_id`, `init_point: preference.init_point` (o `sandbox_init_point` en pruebas).
8. Devolver al frontend:

```json
{ "external_reference": "SP-2026-0001", "init_point": "https://..." }
```

### 6.2 · `POST /api/webhook/mercadopago`

MercadoPago llama acá cuando hay un evento de pago. Ejemplo de body:

```json
{ "action": "payment.updated", "data": { "id": "1234567890" }, "type": "payment" }
```

**Lógica:**

1. **Verificar firma** (`x-signature` header) usando `MP_WEBHOOK_SECRET`. Si falla → `401`. (Documentación MP: la firma combina `ts`, `id` y el secret con HMAC-SHA256.)
2. Si `type !== 'payment'` → `200 OK` (ignorar otros eventos en v1).
3. Consultar `/v1/payments/{id}` a MP con el Access Token para obtener el detalle del pago.
4. Sacar `external_reference` del campo del pago.
5. Leer la orden en `SIMIO_ORDERS`. Si no existe → log + `200` (defensa: no romper si MP manda algo inesperado).
6. Actualizar la orden:
   - `mp_payment_id = pago.id`
   - `mp_status = pago.status` (`approved`, `pending`, `rejected`, `cancelled`, etc.)
   - Mapear a nuestro `estado`:
     - `approved` → `PAGADO` + `fecha_pago = now`
     - `pending`, `in_process` → `PENDIENTE_PAGO`
     - `rejected`, `cancelled` → `RECHAZADO`/`CANCELADO`
7. Si `PAGADO`:
   - `SIMIO_INVENTORY.put(piezaKey, "SOLD:" + external_reference)` (sin TTL).
   - Enviar correo al cliente (§7.1).
   - Enviar alerta a Juan (§7.2).
8. Si `RECHAZADO`/`CANCELADO`:
   - `SIMIO_INVENTORY.put(piezaKey, "AVAILABLE")` (libera).
9. Responder `200 OK` siempre que se haya procesado correctamente. Errores → 5xx para que MP reintente.

### 6.3 · `GET /api/order/:external_reference`

Devuelve el estado público de la orden para la página `/orden-confirmada`. Solo campos seguros (no datos internos):

```json
{
  "external_reference": "SP-2026-0001",
  "pieza": "superhombresito.v01",
  "estado": "PAGADO",
  "monto_cop": 308000,
  "fecha_pago": "2026-05-25T15:30:00Z"
}
```

---

## 7 · Correos

Reutilizar el helper de correos existente (Resend/MailChannels) si lo hay, o crear uno simple con `EMAIL_FROM`.

### 7.1 · Correo al cliente (al aprobarse el pago)

**Asunto:** `Tu pieza Simio Plateado está en cola · #SP-2026-0001`

**Cuerpo (texto):**
```
¡Gracias por tu compra!

Tu pieza {NOMBRE_PIEZA} entró en cola de producción.
Te escribimos a este correo cuando esté lista y al despacho.

Tu orden: #SP-2026-0001
Monto: $308.000 COP

Más sobre el proceso y nuestras políticas en simioplateado.com/legal/terminos.

— Simio Plateado
```

### 7.2 · Alerta interna a Juan

**Asunto:** `Nueva venta · #SP-2026-0001 · superhombresito.v01`

**Cuerpo (texto):**
```
Nueva venta confirmada.

Pieza: superhombresito.v01
Monto: $308.000 COP
Cliente: Nombre Apellido (cliente@correo.com)
Dirección: Calle 00 #00-00, Medellín, Antioquia, CO

Entrar a la Central para procesar.
```

---

## 8 · Frontend · wiring del botón

### 8.1 · Convertir el contenedor del formulario en un `<form>` real

Hoy los inputs no están dentro de `<form>`. Envolverlos en uno con `id="checkout-form"` y `novalidate` (validación manual en JS).

### 8.2 · Handler del botón

```js
document.querySelector('#checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = e.target.querySelector('button.submit');
  btn.disabled = true;
  btn.textContent = 'Procesando…';
  
  const payload = {
    pieza: PIEZA_SLUG,  // viene del contexto de la página
    cliente: {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim()
    },
    direccion: {
      linea1: form.direccion.value.trim(),
      ciudad: form.ciudad.value.trim(),
      departamento: form.departamento.value.trim(),
      pais: form.pais.value.trim(),
      codigo_postal: form.codigo_postal.value.trim(),
      notas: form.notas.value.trim()
    }
  };
  
  try {
    const res = await fetch('/api/create-preference', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear la orden');
    }
    
    const { init_point } = await res.json();
    window.location.href = init_point;  // redirecciona al checkout de MP
    
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'COMPRAR AHORA';
    mostrarError(err.message);  // toast o mensaje inline
  }
});
```

### 8.3 · Páginas de retorno

Crear (o asegurarse que existen) tres rutas en el SPA:

- `/orden-confirmada?ref=SP-...` — éxito. Consulta `GET /api/order/:ref` y muestra: gracias, número de orden, monto, qué sigue (te llega correo, producción 7-14 días). Link a home.
- `/orden-fallida?ref=SP-...` — pago rechazado. Mensaje claro, link para volver a intentar.
- `/orden-pendiente?ref=SP-...` — pago pendiente (ej. PSE pendiente). Mensaje: "te avisamos por correo cuando se confirme".

---

## 9 · Pruebas (sandbox primero, no negociable)

### 9.1 · Setup sandbox

- Cambiar `MP_ENV=sandbox` en Cloudflare (o tenerlo en preview environment).
- Usar credenciales TEST.
- En MercadoPago developers, crear **usuarios de prueba** (vendedor y comprador) — necesarios para que las transacciones TEST funcionen end-to-end.

### 9.2 · Casos a probar (todos en sandbox)

| # | Caso | Tarjeta de prueba | Esperado |
|---|------|-------------------|----------|
| 1 | Pago aprobado con tarjeta | Mastercard `5031 7557 3453 0604`, CVV `123`, vencimiento futuro, titular `APRO` | Webhook recibido, orden `PAGADO`, pieza `SOLD`, correos enviados |
| 2 | Pago rechazado | Mismo número, titular `OTHE` | Orden `RECHAZADO`, pieza vuelve a `AVAILABLE` |
| 3 | Pago pendiente | Mismo número, titular `CONT` | Orden `PENDIENTE_PAGO` |
| 4 | Reserva expira | Crear preferencia y no pagar 31 min | Pieza vuelve a `AVAILABLE` automáticamente (por TTL) |
| 5 | Stock agotado | Marcar pieza como `SOLD` manualmente y reintentar | `410 Gone`, mensaje claro al cliente |
| 6 | Webhook con firma inválida | Postman con `x-signature` falsa | `401`, no actualiza nada |

(Verificar tarjetas actuales en docs.mercadopago.com.co — pueden cambiar.)

### 9.3 · Switch a live

- Solo cuando todos los casos sandbox pasen.
- Cambiar `MP_ENV=live` en Cloudflare.
- Hacer **una transacción real pequeña** (puedes pagarte tú mismo desde otra cuenta) para confirmar end-to-end con plata real.
- Verificar que el dinero llega a la cuenta MP de Anti Real Labs y que la orden quedó en `SIMIO_ORDERS`.

---

## 10 · Seguridad y privacidad

- `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` **nunca** salen del Worker. No al frontend, no a logs, no a respuestas de error.
- Validación de firma del webhook **obligatoria**. Sin firma válida → 401, sin tocar estado.
- Logs no deben incluir el cuerpo completo del pago (números de tarjeta no llegan al Worker, pero por higiene).
- `external_reference` es público (va en URLs), no contiene PII.
- Cumple con `doctrina/legal-privacidad.md`: los datos se guardan 5 años por obligación contable, lo demás según los plazos definidos.

---

## 11 · Checklist de implementación

### Para codex (código)

- [ ] Tabla `CATALOGO` con USD + COP por pieza.
- [ ] Endpoint `POST /api/create-preference` (con validación, reserva, llamada a MP, guardado en KV).
- [ ] Endpoint `POST /api/webhook/mercadopago` (con verificación de firma, query del pago, actualización, correos).
- [ ] Endpoint `GET /api/order/:ref` para la página de confirmación.
- [ ] Helper `generarExternalReference()` con contador en KV `SIMIO_COUNTERS`.
- [ ] Helper de correos (cliente + alerta interna) — reusar lo de Colibri si aplica.
- [ ] Frontend: envolver inputs en `<form>`, wire `submit` al endpoint, redirección a `init_point`.
- [ ] Páginas `/orden-confirmada`, `/orden-fallida`, `/orden-pendiente`.
- [ ] Manejo de estados de error claros (toast/inline).
- [ ] Test suite básico (al menos los casos 1-6 de §9.2).

### Para Juan (manual)

- [ ] Crear app en MercadoPago Developers (§3.1).
- [ ] Copiar credenciales TEST y LIVE (§3.2).
- [ ] Configurar webhook en panel de MP apuntando a `https://simioplateado.com/api/webhook/mercadopago` (§3.3).
- [ ] Meter todas las env vars en Cloudflare (§3.4) — `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` como **secretos cifrados**.
- [ ] Crear usuarios de prueba en MP para testing sandbox.
- [ ] Verificar `SIMIO_INVENTORY` está poblado con el estado inicial (`AVAILABLE` por cada pieza).
- [ ] Validar la tabla COP del §5 antes del lanzamiento (que los precios estén correctos al tipo de cambio actual).

---

## 12 · Después de este brief (lo que se desbloquea)

Una vez deployado y probado en live:

1. **Se pueden vender los muñequitos.** El embudo deja de estar roto.
2. **Cada venta puebla `SIMIO_ORDERS`** con el esquema correcto, lo que **desbloquea la Central** (V0.14) — que era el siguiente paso y dependía de tener data real entrando.
3. Se puede **publicar el video de lanzamiento** sin miedo: el "Compra ahora → simioplateado.com" va a llevar a un checkout que de verdad cobra.

---

*Brief creado 2026-05-25 · Versión 1.0. Prerrequisito directo de V0.14 Central. Reemplaza la sección de pagos físicos de V0.13 (PayPal). Acompaña a `doctrina/legal-terminos.md`, `doctrina/legal-privacidad.md` y `operaciones/protocolo-empaque-despacho.md`.*
