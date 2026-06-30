# Brief Codex · V0.13 · Integración de pagos PayPal

*Brief operativo para integrar PayPal a simioplateado.com (piezas físicas, cobro único) y a colibripdf.com (suscripción digital recurrente). Cuenta PayPal Business de Anti Real Labs S.A.S. aprobada el 2026-05-17.*

---

## 1 · Contexto

Después de descartar Stripe (no opera para vendedores colombianos), Etsy (Colombia no elegible para Etsy Payments), Polar.sh y Lemon Squeezy (solo digital, no físicos), la única plataforma disponible y aprobada para Anti Real Labs S.A.S. es **PayPal Business**. La cuenta quedó activa, en USD como divisa principal, lista para recibir pagos internacionales.

Para minimizar fricción operativa, lanzamos los DOS productos con PayPal:

- **Simio Plateado** (art toys físicos): PayPal Smart Buttons · cobro único en USD por pieza.
- **Colibri** (PDF / suscripción digital): PayPal Subscriptions · cobro recurrente mensual/anual.

Wompi y plataformas MoR (Polar / Lemon Squeezy) quedan diferidos hasta que el volumen lo justifique.

---

## 2 · Arquitectura de la integración

```
SIMIO PLATEADO
├── Frontend: simioplateado.com (Cloudflare Pages)
│   └── Botón "Comprar" en cada pieza con stock disponible
│       → PayPal Smart Button JS SDK
│       → onApprove() llama a Worker /api/capture-order
├── Backend: Cloudflare Worker simioplateado-pagos.workers.dev
│   ├── POST /api/create-order  → crea orden en PayPal API
│   ├── POST /api/capture-order → confirma pago, marca pieza como SOLD
│   └── POST /api/webhook       → recibe eventos de PayPal (backup)
└── KV namespace: SIMIO_INVENTORY
    └── Estado de stock por pieza: AVAILABLE | RESERVED | SOLD

COLIBRI · modelo freemium (30 días gratis sin tarjeta)
├── Frontend: colibripdf.com (Cloudflare Pages)
│   ├── Landing pública + form de signup (solo email, magic link)
│   ├── /lectura/* → contenido protegido por edge middleware
│   └── /suscripcion → muro de pago con botones PayPal Subscriptions
│       (solo aparece cuando el usuario VOLUNTARIAMENTE quiere suscribirse,
│        o cuando trial expiró)
├── Backend: Cloudflare Worker colibri-subs.workers.dev
│   ├── POST /api/signup            → crea TRIAL, envía magic link
│   ├── GET  /api/verify?token=...  → valida link, setea cookie de sesión
│   ├── GET  /api/me                → estado del usuario (TRIAL/EXPIRED/SUBSCRIBED)
│   ├── POST /api/activate-subscription → confirma suscripción PayPal
│   ├── POST /api/cancel            → cancelación voluntaria
│   ├── POST /api/webhook           → eventos PayPal (renewals, fails, cancels)
│   └── POST /api/logout            → limpia cookie
└── KV namespace: COLIBRI_USERS
    └── { email, status, trial_start, trial_end, plan, paypal_sub_id,
          current_period_end, created_at }
```

---

## 3 · Variables de entorno (Cloudflare Pages / Workers)

### 3.1 · Credenciales reales (capturadas 2026-05-17)

**Simio Plateado · Client ID (Live, público):**

```
AZlzi0Y3rUJCP2YKJCinFHgmv-VDXuY4M90I3qWliqkN4UiKVv6GAMUOLQGQWkSXCZ7k9BWW-cs4gTPy
```

**Colibri · Client ID (Live, público):**

```
AafSyusTuCSxYfTwoI1bAo_7IaeClP3ygMUG3FmGjtEXP2sF0F0rMZmud16_QWQjB2i7uPIfHta36EcX
```

Los Secrets correspondientes están guardados por Juan en 1Password — NO van en este repo ni en código fuente. Se cargan como variables de entorno cifradas en Cloudflare Pages → Settings → Environment variables.

### 3.2 · Variables completas a configurar en Cloudflare

**Simio Plateado** (Cloudflare Pages project: simioplateado-com):

```
PAYPAL_CLIENT_ID         = AZlzi0Y3rUJCP2YKJCinFHgmv-VDXuY4M90I3qWliqkN4UiKVv6GAMUOLQGQWkSXCZ7k9BWW-cs4gTPy
PAYPAL_SECRET            = E... (privado, solo en Worker, encriptado en Cloudflare)
PAYPAL_ENV               = production  (o "sandbox" en pruebas)
PAYPAL_WEBHOOK_ID        = (se obtiene al crear webhook en dashboard, ver §9)
RESEND_API_KEY           = (para enviar email de confirmación al cliente)
```

**Colibri** (Cloudflare Pages project: colibripdf-com):

```
PAYPAL_CLIENT_ID         = AafSyusTuCSxYfTwoI1bAo_7IaeClP3ygMUG3FmGjtEXP2sF0F0rMZmud16_QWQjB2i7uPIfHta36EcX
PAYPAL_SECRET            = E... (privado, solo en Worker, encriptado en Cloudflare)
PAYPAL_PLAN_MENSUAL      = P-44930247HK497823KNIFJMII
PAYPAL_PLAN_ANUAL        = P-7BC26124CP186415RNIFJOEY
PAYPAL_ENV               = production
PAYPAL_WEBHOOK_ID        = (se obtiene al crear webhook)
JWT_SECRET               = (generar uno fuerte de 64 bytes, ej. `openssl rand -hex 64`)
MAGIC_LINK_BASE_URL      = https://colibripdf.com
EMAIL_FROM               = "Colibri <contacto@colibripdf.com>"
RESEND_API_KEY           = (opcional si se usa Resend; si MailChannels, no aplica)
TRIAL_DURATION_DAYS      = 30
```

**KV namespaces de Colibri:**

- `COLIBRI_USERS` — estado de cada usuario (TRIAL/SUBSCRIBED/EXPIRED/CANCELLED), keyed por email
```

### 3.3 · Datos que faltan capturar antes de deploy a Live

- [ ] Plan IDs de Colibri (mensual + anual) → Juan los crea en paypal.com → Pay & Get Paid → Subscriptions → Create Plan
- [ ] Webhook IDs (uno por Worker) → se generan al crear webhook en developer.paypal.com → Apps & Credentials → app → Webhooks
- [ ] Resend API key (o decisión de usar MailChannels gratis vía Cloudflare Workers)

---

## 4 · Frontend Simio Plateado · cambios concretos

### 4.1 · Botón en la vista detalle de pieza

En la vista de cada pieza (`/pieza/[slug]`), donde hoy hay solo descripción + fases, agregar bloque de compra **solo si la pieza está en fase HECHO y tiene stock**:

```html
<section class="compra" data-pieza="superhombresito-v01">
  <div class="precio">USD 168</div>
  <div class="stock-status">3 disponibles</div>
  <div id="paypal-button-container"></div>
  <p class="legal">
    Envío internacional incluido. Pago seguro vía PayPal en USD.
    La pieza se procesa una vez confirmado el pago.
  </p>
</section>
```

El SDK de PayPal se carga con el `client-id` de Simio Plateado y la divisa `USD`:

```html
<script src="https://www.paypal.com/sdk/js?client-id=PAYPAL_CLIENT_ID&currency=USD&intent=capture"></script>
```

### 4.2 · Lógica del botón (createOrder → capture)

```js
paypal.Buttons({
  style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'paypal' },

  createOrder: async (data, actions) => {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pieza_slug: 'superhombresito-v01',
        variante: null,  // o "rosa" / "blanca" / "negra" para TUNI
      })
    });
    const { orderID } = await res.json();
    return orderID;
  },

  onApprove: async (data, actions) => {
    const res = await fetch('/api/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID: data.orderID })
    });
    const result = await res.json();
    if (result.status === 'COMPLETED') {
      window.location = `/orden-confirmada?id=${data.orderID}`;
    } else {
      alert('Hubo un problema procesando el pago. Contacta a el@simioplateado.com');
    }
  },

  onError: (err) => {
    console.error('PayPal error:', err);
    alert('Error con PayPal. Intenta de nuevo o escribe a el@simioplateado.com');
  },

  onCancel: () => {
    // usuario canceló, no hacer nada
  }
}).render('#paypal-button-container');
```

### 4.3 · Página de confirmación

`/orden-confirmada?id=...` — vista que muestra:

- Sello "PEDIDO RECIBIDO" en tipo handwritten
- Resumen de la pieza comprada
- Mensaje: *"Tu pieza entra en cola de producción. Recibirás un correo con cada cambio de fase (DISEÑADO → HECHO → ENVIADO)."*
- Botón "Volver a la galería"

### 4.4 · UI de stock agotado

Si la pieza tiene `stock === 0` o `status === 'SOLD'`:

- Reemplazar el botón PayPal por sello **AGOTADO** sobre el precio
- Mostrar texto: *"Esta pieza fue tomada. Si quieres una similar, escríbele a Juan."*
- Botón secundario "Quiero algo parecido" → mailto:el@simioplateado.com

---

## 5 · Backend Simio Plateado · Cloudflare Worker

### 5.1 · POST /api/create-order

Crea una orden en PayPal con el precio canónico de la pieza. **Valida el stock antes** de crear la orden:

```js
async function createOrder(env, request) {
  const { pieza_slug, variante } = await request.json();

  // 1. Verificar stock
  const piezaKey = variante ? `${pieza_slug}.${variante}` : pieza_slug;
  const stock = await env.SIMIO_INVENTORY.get(piezaKey);
  if (stock === 'SOLD' || stock === null) {
    return new Response(JSON.stringify({ error: 'Pieza no disponible' }), { status: 400 });
  }

  // 2. Obtener precio canónico (hardcodeado o desde KV/manifest)
  const precio = getPrecioCanonico(pieza_slug, variante);

  // 3. Crear orden en PayPal API
  const accessToken = await getPayPalAccessToken(env);
  const orderRes = await fetch(`${getPayPalBase(env)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: piezaKey,
        amount: { currency_code: 'USD', value: precio.toFixed(2) },
        description: `Simio Plateado · ${pieza_slug}`,
      }],
      application_context: {
        brand_name: 'Simio Plateado',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
      }
    })
  });
  const order = await orderRes.json();

  // 4. Marcar pieza como RESERVED (con TTL de 15 min por si abandona)
  await env.SIMIO_INVENTORY.put(piezaKey, `RESERVED:${order.id}`, { expirationTtl: 900 });

  return new Response(JSON.stringify({ orderID: order.id }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 5.2 · POST /api/capture-order

Confirma el pago, marca como SOLD definitivamente, dispara email al cliente y a Juan:

```js
async function captureOrder(env, request) {
  const { orderID } = await request.json();
  const accessToken = await getPayPalAccessToken(env);

  // 1. Capturar pago
  const captureRes = await fetch(`${getPayPalBase(env)}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
  });
  const result = await captureRes.json();

  if (result.status === 'COMPLETED') {
    // 2. Marcar pieza como SOLD (sin TTL, permanente)
    const piezaKey = result.purchase_units[0].reference_id;
    await env.SIMIO_INVENTORY.put(piezaKey, `SOLD:${orderID}`);

    // 3. Guardar pedido en KV de órdenes
    await env.SIMIO_ORDERS.put(orderID, JSON.stringify({
      pieza: piezaKey,
      monto: result.purchase_units[0].payments.captures[0].amount.value,
      cliente_email: result.payer.email_address,
      cliente_nombre: `${result.payer.name.given_name} ${result.payer.name.surname}`,
      direccion: result.purchase_units[0].shipping?.address,
      fecha: new Date().toISOString(),
      paypal_capture_id: result.purchase_units[0].payments.captures[0].id,
    }));

    // 4. Email al cliente (Resend / MailChannels)
    await sendOrderConfirmation(env, { orderID, ...result });

    // 5. Email a Juan (notificación interna)
    await sendInternalAlert(env, { orderID, pieza: piezaKey });
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 5.3 · POST /api/webhook (backup)

Recibe eventos de PayPal (PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.REFUNDED, etc.) y reconcilia el estado. Verifica firma con `PAYPAL_WEBHOOK_ID`. Este endpoint es defensa en profundidad por si `capture-order` falla silenciosamente.

---

## 6 · Inventario · cómo manejar piezas únicas vs. edición

**Piezas únicas (1 de 1)** — ej. todos los ESPEJO PLATEADO:

- Stock inicial: `AVAILABLE`
- Tras venta: `SOLD:[orderID]`, nunca vuelve a aparecer en stock

**Piezas de edición pequeña** — ej. SUPERHOMBRESITO edición de 30:

- Stock inicial: numérico (`30`)
- Decremento atómico en `create-order`
- Cuando llega a `0`, UI muestra AGOTADO

**Variantes** — ej. TUNI rosa/blanca/negra:

- Cada variante es su propia entrada de KV: `tuni.v01.rosa`, `tuni.v01.blanca`, `tuni.v01.negra`
- Cada una con su propio stock independiente

**Manifest de inventario inicial · decisión de Juan 2026-05-18:**

Las **piezas escultóricas son únicas (1 de 1)**. Cada pieza se imprime y se acaba a mano una sola vez. Si una pieza se vende, queda agotada permanentemente en esta fase del proyecto (Juan puede decidir reimprimir en un drop futuro, pero ese sería un nuevo registro). Esta decisión es doctrinal — refuerza el carácter curatorial del catálogo y evita overcommit de producción.

Los **wearables son producción más reproducible** (sticker, camiseta, gorra, gafas) — tienen stock disponible más amplio, pero la UI NO muestra el contador. Solo dice "Disponible". Cuando se agota, dice "Agotado".

```js
const PIEZAS_INICIALES = {
  // Escultóricas · 1 de 1 (mostrar "Pieza única · disponible" en UI)
  'superhombresito.v01': { stock: 1, precio: 168, tipo: 'unica' },
  'dialoguin.v01':       { stock: 1, precio: 148, tipo: 'unica' },
  'mini_devenires.v01':  { stock: 1, precio: 148, tipo: 'unica' },
  'traumin.v01':         { stock: 1, precio: 148, tipo: 'unica' },
  'marxito.v01':         { stock: 1, precio: 148, tipo: 'unica' },
  'copa_chiste.v0':      { stock: 1, precio: 148, tipo: 'unica' },
  'tuni.v01.rosa':       { stock: 1, precio: 168, tipo: 'unica' },
  'tuni.v01.blanca':     { stock: 1, precio: 168, tipo: 'unica' },
  'tuni.v01.negra':      { stock: 1, precio: 168, tipo: 'unica' },
  'planti_punk.v01':     { stock: 1, precio: 168, tipo: 'unica' },
  'planti_punk_xl.v01':  { stock: 1, precio: 188, tipo: 'unica' },
  'planti_k.v01':        { stock: 1, precio: 168, tipo: 'unica' },
  'planti_k_xl.v01':     { stock: 1, precio: 188, tipo: 'unica' },

  // Wearables · stock real interno, UI muestra solo "Disponible"
  'camiseta_blanca':     { stock: 10, precio: 34, tipo: 'wearable' },
  'camiseta_negra':      { stock: 10, precio: 38, tipo: 'wearable' },
  'gorra':               { stock: 10, precio: 42, tipo: 'wearable' },
  'parchao.v01':         { stock: 10, precio: 28, tipo: 'wearable' },
  'melisimo.v01':        { stock:  2, precio: 48, tipo: 'wearable' },
};
```

**Reglas de UI según `tipo`**:

| Tipo       | Stock > 0                          | Stock === 0      |
|------------|------------------------------------|------------------|
| `unica`    | "Pieza única · disponible"         | sello AGOTADO    |
| `wearable` | "Disponible" (sin contador)        | sello AGOTADO    |

La diferencia comunica al visitante el carácter de cada producto sin sobrecargar la UI con números.

---

## 7 · Email de confirmación al cliente

Plantilla HTML simple, en español + inglés, enviada vía MailChannels (gratis desde Cloudflare Workers) o Resend (paid).

**Asunto**: `Tu pieza Simio Plateado está en cola · #[orderID]`

**Cuerpo**:

```
[Logo Simio Plateado en handwritten]

Hola [nombre],

Tu pieza fue tomada. Aquí lo que sigue:

• Pieza: [nombre handwritten]
• Pedido #[orderID]
• Monto: USD [monto]

Las próximas semanas trabajamos en producción. Recibirás un correo cada
vez que tu pieza cambie de fase:

  IMAGINADO ✓ → DISEÑADO → HECHO → ENVIADO

Tiempo estimado de entrega: 2-3 semanas desde hoy.

Para cualquier duda, responde este correo o escribe a
el@simioplateado.com

—
Anti Real Labs S.A.S.
Medellín, Colombia
simioplateado.com
```

---

## 8 · Colibri · arquitectura freemium con suscripción digital

### 8.1 · Principio rector

**El usuario nunca da tarjeta al inicio.** Colibri ofrece 30 días reales de acceso completo a cambio de un email verificado. Al día 30, si el usuario quiere seguir, voluntariamente activa la suscripción vía PayPal. Si no, se cierra el acceso sin cobros ni sorpresas.

Este modelo prioriza consentimiento voluntario por encima de tasas de conversión. La hipótesis: una conversión más baja pero de usuarios alineados pesa más que una conversión alta de usuarios atrapados.

### 8.2 · Estados de un usuario Colibri

```
ANÓNIMO       → no ha dado email, ve solo landing y muestras públicas
TRIAL         → email verificado, dentro de los 30 días, acceso completo
EXPIRED       → trial venció, sin suscripción activa, muro de pago
SUBSCRIBED    → suscripción PayPal activa (mensual o anual), acceso completo
CANCELLED     → canceló suscripción, acceso hasta `current_period_end`, luego EXPIRED
```

Cada usuario vive en `COLIBRI_USERS` (KV namespace) con esta forma:

```json
{
  "email": "lector@example.com",
  "nombre": "Lector Anónimo",  // opcional
  "status": "TRIAL",
  "trial_start": "2026-05-17T22:00:00Z",
  "trial_end":   "2026-06-16T22:00:00Z",
  "paypal_subscription_id": null,
  "plan": null,                 // "mensual" | "anual" cuando suscriba
  "current_period_end": null,   // se llena al activar suscripción
  "created_at": "2026-05-17T22:00:00Z"
}
```

### 8.3 · Flujo de autenticación · Magic Link

Sin contraseñas. El usuario se autentica con un link enviado a su email.

**Signup:**

1. Usuario llega a `colibripdf.com`, click "Empezar lectura · 30 días gratis"
2. Form modal con un solo campo: **Email**
3. POST a `/api/signup` con `{ email }`
4. Worker:
   - Crea entrada en `COLIBRI_USERS` con `status: TRIAL`, `trial_end = now + 30d`
   - Genera un token firmado (JWT con `email`, `purpose: 'magic-link'`, `exp: 15min`)
   - Envía email vía MailChannels con link: `https://colibripdf.com/verify?token=...`
5. UI muestra: *"Te enviamos un link a [email]. Click ahí para empezar a leer."*

**Verify:**

1. Usuario abre el email, click en el link
2. Browser navega a `/verify?token=...`
3. Frontend hace GET a `/api/verify?token=...`
4. Worker valida el JWT, si es válido:
   - Genera un nuevo JWT de **sesión** (`email`, `exp: 30d`, signed)
   - Set-Cookie `colibri_session=<jwt>; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
   - Redirect a `/lectura`
5. El usuario queda autenticado por 30 días (sin tener que hacer login otra vez)

**Login posterior (mismo flujo):**

Si la cookie expiró o el usuario está en otro dispositivo, en lugar de "Empezar lectura" usa "Volver a entrar":

- Mismo form de email → mismo magic link → misma cookie nueva
- Si el email ya existe en KV, NO crea trial nuevo, solo manda link de sesión

### 8.4 · Control de acceso a contenido

Cada página de lectura (ej. `/lectura/[slug]`) verifica el estado del usuario antes de renderizar contenido pagado.

**Edge function en Cloudflare Pages (`_middleware.ts` o función equivalente):**

```ts
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Rutas públicas → pasar sin chequeo
  const RUTAS_PUBLICAS = ['/', '/landing', '/signup', '/verify', '/api/'];
  if (RUTAS_PUBLICAS.some(p => url.pathname.startsWith(p))) {
    return next();
  }

  // Rutas protegidas → chequear cookie
  const cookie = parseCookie(request.headers.get('Cookie'), 'colibri_session');
  if (!cookie) return Response.redirect(`${url.origin}/signup`, 302);

  const payload = await verifyJWT(cookie, env.JWT_SECRET);
  if (!payload) return Response.redirect(`${url.origin}/signup`, 302);

  const user = JSON.parse(await env.COLIBRI_USERS.get(payload.email));
  if (!user) return Response.redirect(`${url.origin}/signup`, 302);

  const now = new Date();
  const trialEnd = new Date(user.trial_end);
  const periodEnd = user.current_period_end ? new Date(user.current_period_end) : null;

  const tieneAcceso =
    user.status === 'SUBSCRIBED' ||
    (user.status === 'TRIAL' && now < trialEnd) ||
    (user.status === 'CANCELLED' && periodEnd && now < periodEnd);

  if (!tieneAcceso) {
    // muro de pago
    return Response.redirect(`${url.origin}/suscripcion?expired=1`, 302);
  }

  // Pasar contexto del usuario a la página
  context.data = { user };
  return next();
}
```

### 8.5 · Muro de pago `/suscripcion`

Página que ve el usuario cuando:
- Su trial expiró
- Canceló y se acabó el período pagado
- Hace click voluntario en "Suscribirme antes" durante el trial

Layout sugerido (con doctrina visual del proyecto, sin urgencia ni manipulación):

```
[Logo Colibri handwritten]

Tu prueba de 30 días terminó.
( o: "Sigues leyendo Colibri" si decide suscribirse antes )

Continúa si te sirve.

  ┌─────────────────────────┐    ┌─────────────────────────┐
  │   USD 4.99 / mes        │    │   USD 39.99 / año       │
  │   [Botón PayPal]        │    │   [Botón PayPal]        │
  │                         │    │   (ahorras 20%)         │
  └─────────────────────────┘    └─────────────────────────┘

  o cierra esta página sin cargo
```

Los dos botones PayPal Subscriptions usan los Plan IDs canónicos:

```js
paypal.Buttons({
  style: { layout: 'vertical', color: 'black', label: 'subscribe', shape: 'rect' },
  createSubscription: (data, actions) => {
    return actions.subscription.create({
      plan_id: 'P-44930247HK497823KNIFJMII',  // Mensual · desde env var
      custom_id: userEmail,
      subscriber: { email_address: userEmail }
    });
  },
  onApprove: async (data) => {
    await fetch('/api/activate-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionID: data.subscriptionID,
        email: userEmail,
        plan: 'mensual',
      })
    });
    window.location = '/lectura?bienvenida=suscrito';
  }
}).render('#paypal-mensual');

// idem para anual con plan_id 'P-7BC26124CP186415RNIFJOEY'
```

### 8.6 · Worker endpoints de Colibri

```
POST /api/signup            → crea usuario TRIAL, envía magic link
GET  /api/verify?token=...  → valida magic link, setea cookie de sesión
GET  /api/me                → devuelve estado del usuario actual (UI lo usa para mostrar
                              días restantes, banner de "te quedan X días", etc.)
POST /api/activate-subscription → confirma suscripción PayPal, actualiza KV
POST /api/cancel            → cliente cancela manualmente (también puede hacerlo desde
                              PayPal, ambas rutas válidas)
POST /api/webhook           → recibe eventos PayPal
POST /api/logout            → limpia cookie de sesión
```

### 8.7 · Eventos de webhook que escuchar

```
BILLING.SUBSCRIPTION.ACTIVATED  → status = SUBSCRIBED, plan = mensual|anual,
                                  current_period_end = next billing date
BILLING.SUBSCRIPTION.CANCELLED  → status = CANCELLED (mantener acceso hasta period_end)
BILLING.SUBSCRIPTION.SUSPENDED  → status = SUSPENDED (tarjeta falló, dar grace period)
BILLING.SUBSCRIPTION.EXPIRED    → status = EXPIRED (suscripción terminó)
PAYMENT.SALE.COMPLETED          → extiende current_period_end al siguiente ciclo
PAYMENT.SALE.DENIED             → notificar a Juan + email al usuario "actualiza tu tarjeta"
```

### 8.8 · Emails que envía el sistema

| Trigger                                  | Asunto                                          | Tono |
|------------------------------------------|-------------------------------------------------|------|
| Signup                                   | `Tu link para entrar a Colibri`                 | corto, neutral |
| Bienvenida tras verify                   | `Tienes 30 días de Colibri`                     | acogedor, sin promesas |
| Día 25 (recordatorio amable)             | `Te quedan 5 días de prueba en Colibri`         | informativo, sin presión |
| Día 30 (trial vence)                     | `Tu prueba terminó. Sigues si quieres.`         | sereno, ofrece opción |
| Suscripción activada                     | `Gracias por sumarte a Colibri`                 | breve, agradecido |
| Renovación exitosa                       | `Tu suscripción se renovó`                      | recibo, sin más |
| Tarjeta falló                            | `Hubo un problema cobrando tu suscripción`      | factual, no alarmista |
| Cancelación                              | `Confirmamos la cancelación`                    | respetuoso, sin retención agresiva |

**Reglas para el copy de emails:**

- Nunca usar urgencia falsa ("¡últimas horas!", "¡no pierdas tu acceso!")
- Nunca usar guilt trips ("nos vas a abandonar")
- Frase máxima de 2 líneas, párrafos cortos
- Firmar como "Juan · Colibri" (humano, no marca corporativa)
- Botón único de acción, sin múltiples CTAs

### 8.9 · Banner persistente durante el trial

Mientras el usuario está en TRIAL, mostrar banner sutil en el header:

```
"Te quedan 23 días de prueba. Si te sirve, [suscríbete antes →]"
```

Click → lleva a `/suscripcion` (que muestra los dos botones PayPal voluntariamente, sin paywall).

El banner cambia tono según días restantes:

- Día 1-20: gris claro, sin urgencia
- Día 21-25: amarillo pálido, recordatorio
- Día 26-29: amarillo más visible, recordatorio claro
- Día 30: rojo discreto, "hoy termina"

Nunca esconder el botón "X cerrar banner" para esta sesión. El usuario decide cuánto recordatorio quiere.

---

## 9 · Plan de pruebas

### 9.1 · Sandbox primero

Antes de tocar dinero real, todo se prueba en Sandbox:

1. PayPal Developer Dashboard → modo Sandbox
2. Crear "Personal" sandbox account (comprador de prueba)
3. Crear "Business" sandbox account (vendedor de prueba)
4. Apuntar `PAYPAL_ENV=sandbox` en variables de Cloudflare
5. Hacer 3-5 compras de prueba en simioplateado-staging.pages.dev
6. Verificar:
   - Orden se crea correctamente
   - Stock decrementa atómicamente
   - Email llega al comprador
   - Email llega a Juan
   - Pieza queda como SOLD
   - Si el cliente cancela, el RESERVED expira tras 15 min

### 9.2 · Cambio a Live

Cuando Sandbox funciona:

1. Cambiar `PAYPAL_CLIENT_ID` y `PAYPAL_SECRET` a credenciales Live
2. Cambiar `PAYPAL_ENV=production`
3. Configurar webhook Live en developer.paypal.com con URL del Worker en producción
4. Hacer una compra real con tarjeta de Juan (USD 10) de una pieza dummy
5. Verificar que el dinero llega a PayPal Business real
6. Hacer reembolso de prueba para verificar flujo de devoluciones

---

## 10 · Variantes y precios canónicos · referencia

Tomados de `doctrina/notas-precios.md` (autoridad). Los precios se hardcodean en una constante del Worker para evitar manipulación desde frontend.

```js
const PRECIOS_USD = {
  // Drop 001
  'superhombresito.v01': 168,
  'dialoguin.v01':       148,
  'mini_devenires.v01':  148,
  'traumin.v01':         148,
  'marxito.v01':         148,
  'copa_chiste.v0':      148,
  'tuni.v01':            168,  // misma para rosa/blanca/negra
  'planti_punk.v01':     168,
  'planti_punk_xl.v01':  188,
  'planti_k.v01':        168,
  'planti_k_xl.v01':     188,

  // Wearables
  'camiseta_blanca':     34,
  'camiseta_negra':      38,
  'gorra':               42,
  'parchao.v01':         28,
  'melisimo.v01':        48,

  // ESPEJO PLATEADO (estos se calculan dinámicamente porque tienen variantes)
  // ver doctrina/espejo-plateado.md
};
```

---

## 11 · Notas legales y operativas

- **Términos y condiciones**: agregar página `/legal/terminos` con política de envío, devoluciones, tiempos de entrega, uso de imagen (cross-link a doctrina ESPEJO).
- **Política de privacidad**: agregar página `/legal/privacidad` con manejo de datos de cliente (PayPal almacena datos sensibles, simioplateado.com solo guarda email + nombre + dirección de envío en KV cifrado).
- **Impuestos**: por ser PayPal NO-MoR, Juan es responsable de declarar ingresos en Colombia (renta normal) y de IVA si supera umbrales internacionales (improbable a corto plazo). Documentar en doctrina aparte.
- **Aranceles internacionales**: piezas envío DDU (Delivered Duty Unpaid) — el comprador paga aduana de su país. Aclarar en T&C: *"Los aranceles e impuestos de importación los paga el comprador según las leyes de su país de destino."*
- **Reembolsos**: hasta 14 días desde recepción, pieza en condición original, sin uso. Excluir piezas ESPEJO PLATEADO (personalizadas, no reembolsables).

---

## 12 · Resumen de qué tiene que hacer cada actor

**Juan (en PayPal y Cloudflare):**

- [x] Switch Sandbox → Live en developer.paypal.com
- [x] Apps & Credentials → Create App "Simio Plateado Checkout" → Client ID capturado
- [x] Apps & Credentials → Create App "Colibri Subscriptions" → Client ID capturado
- [x] En paypal.com Business → crear Catalog Product "Colibri Lectura Digital"
- [x] Crear Billing Plans (mensual + anual) → Plan IDs capturados
- [ ] Generar `JWT_SECRET` con `openssl rand -hex 64` (terminal local)
- [ ] En Cloudflare Pages (simioplateado-com) → Environment variables → cargar `PAYPAL_CLIENT_ID` + `PAYPAL_SECRET`
- [ ] En Cloudflare Pages (colibripdf-com) → Environment variables → cargar `PAYPAL_CLIENT_ID` + `PAYPAL_SECRET` + `PAYPAL_PLAN_MENSUAL` + `PAYPAL_PLAN_ANUAL` + `JWT_SECRET` + `EMAIL_FROM`
- [ ] Crear KV namespaces en Cloudflare: `SIMIO_INVENTORY`, `SIMIO_ORDERS`, `COLIBRI_USERS`
- [ ] Configurar webhooks PayPal (uno por app) apuntando a URLs del Worker — después del primer deploy

**Codex · Simio Plateado:**

- [ ] Frontend: botón PayPal en vista detalle de pieza, validando stock vía KV
- [ ] Frontend: página `/orden-confirmada`
- [ ] Frontend: páginas `/legal/terminos` y `/legal/privacidad`
- [ ] Backend Worker `simioplateado-pagos` con endpoints `/api/create-order`, `/api/capture-order`, `/api/webhook`
- [ ] Backend: helper `getPayPalAccessToken()` con caché en memoria
- [ ] Backend: validación de webhook signature de PayPal
- [ ] Backend: email de confirmación al cliente (MailChannels)
- [ ] Manifest inicial de inventario para poblar KV `SIMIO_INVENTORY`

**Codex · Colibri (freemium):**

- [ ] Frontend: landing pública con form de signup (solo email)
- [ ] Frontend: edge middleware (`_middleware.ts`) que protege rutas `/lectura/*`
- [ ] Frontend: página `/suscripcion` con dos botones PayPal Subscriptions
- [ ] Frontend: banner persistente "Te quedan X días" durante TRIAL
- [ ] Backend Worker `colibri-subs` con endpoints completos (§8.6)
- [ ] Backend: helpers `signJWT()` / `verifyJWT()` con `JWT_SECRET`
- [ ] Backend: helper `sendMagicLink()` vía MailChannels
- [ ] Backend: cron schedule diario que pasa usuarios TRIAL → EXPIRED al día 30
- [ ] Backend: cron diario que envía recordatorios (día 25, 29, 30)
- [ ] Backend: webhook PayPal que actualiza estado tras suscripción/cancelación/falla
- [ ] Plantillas de email (8 plantillas, §8.8)

**Pruebas obligatorias antes de deploy a Live:**

- [ ] Signup → magic link → verificación → acceso a `/lectura` → todo OK
- [ ] Trial vence al día 30 → middleware bloquea → muro `/suscripcion`
- [ ] Suscripción mensual en Sandbox → webhook actualiza KV → acceso restaurado
- [ ] Cancelación → mantiene acceso hasta `current_period_end` → después bloquea
- [ ] Compra en Simio Plateado en Sandbox → stock decrementa → email llega → SOLD persistente

---

*Archivo creado 2026-05-17, actualizado misma fecha con arquitectura freemium para Colibri (sección 8 reescrita). Acompaña a `BRIEF_CODEX_V10.md` (catálogo completo) y `BRIEF_CODEX_NAVEGACION.md` (URLs y History API). Brief sucesor: V0.14 será integración Wompi cuando el volumen colombiano lo justifique.*

---

## Apéndice · Doctrina de consentimiento voluntario

La arquitectura freemium de Colibri (sección 8) NO es una decisión técnica — es una decisión doctrinal explícita de Juan: *"si nos ganamos un usuario es porque voluntariamente quiere pagar, no porque le pusimos la exigencia de pago de frente"*.

Implicaciones que esta doctrina impone al producto:

1. **Nunca pedir tarjeta al inicio.** El trial es real, sin captura previa de medio de pago.
2. **Recordatorios sin urgencia falsa.** Los emails de días 25/29/30 son informativos, no de presión.
3. **Cancelación sin fricción.** El usuario cancela sin tener que escribir motivo, sin ofertas de retención, sin "¿estás seguro?" repetido.
4. **Banner siempre cerrable.** El usuario decide cuánto recordatorio tolera durante su trial.
5. **El muro de pago no es muro, es invitación.** Copy sereno, sin tácticas de scarcity ni FOMO.

Conversión esperada bajo este modelo: 5-15% del trial a suscripción. Es deliberadamente más bajo que el estándar de la industria (~60-80% con tarjeta upfront) — y esa diferencia es exactamente el costo ético del proyecto. La hipótesis comercial: usuarios alineados retienen más tiempo y refieren más, compensando la conversión inicial baja.
