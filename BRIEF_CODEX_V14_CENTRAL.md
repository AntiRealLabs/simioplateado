# Brief Codex · V0.14 · La Central (panel admin privado)

*Brief operativo para construir **La Central**: un panel de administración privado para simioplateado.com, accesible únicamente por Juan, donde se gestionan los pedidos, su estado de despacho, el inventario de piezas y el checklist de empaque. La Central NO es pública. Versión 1.0 · 2026-05-24.*

---

## 0 · Supuesto crítico de pagos · MercadoPago (NO PayPal)

> **La capa de pago de Simio Plateado es MercadoPago, no PayPal.** El brief V0.13 (PayPal) queda superado para Simio en lo referente al procesador. La Central solo *lee y gestiona* las órdenes que la integración de pago *escribe* en el KV `SIMIO_ORDERS`; por lo tanto el esquema de orden de este brief está modelado sobre la respuesta de MercadoPago.

Implicaciones que codex debe tener presentes:

- El identificador de pago es `mp_payment_id` (ID de pago de MercadoPago), no un capture de PayPal.
- MercadoPago Colombia liquida en **COP**. El campo `monto` y `moneda` reflejan eso.
- Checkout Pro de MercadoPago **no recolecta de forma fiable la dirección de envío completa**. Por eso la dirección de despacho se captura en **nuestro propio formulario de checkout antes de crear la preferencia** y se guarda atada al pedido vía `external_reference`. La Central muestra esa dirección, no una de MercadoPago.
- Si la integración de pago MercadoPago aún no existe, es **prerrequisito** de esta Central (brief de integración aparte). La Central asume que `SIMIO_ORDERS` ya se está poblando.

---

## 1 · Objetivo y alcance

La Central resuelve un hueco actual: hoy cada venta se guarda en `SIMIO_ORDERS`, pero no existe ninguna pantalla para verla ni gestionarla. Juan necesita un lugar privado para:

- Ver los pedidos entrantes con su estado.
- Avanzar el estado de despacho (pagado → en producción → empacado → enviado).
- Pegar el número de guía y notificar al cliente.
- Ver qué piezas 1-de-1 están vendidas o disponibles.
- Seguir el checklist de empaque pedido por pedido.
- Exportar pedidos a CSV para la contabilidad.

**Qué NO es la Central:**

- No es pública. Ningún cliente la ve nunca.
- No reemplaza la página pública de "orden confirmada" ni los correos transaccionales.
- No expone el protocolo de empaque al público (es info interna).

**Quién entra:** únicamente Juan, autenticado por su correo a través de Cloudflare Access (ver §3).

---

## 2 · Arquitectura

```
simioplateado.com
├── Público (sin cambios): /, /galeria, /tienda, /orden-confirmada, /legal/*
│
└── /central  ← PROTEGIDO POR CLOUDFLARE ACCESS (solo email de Juan)
    ├── Frontend estático (Cloudflare Pages): tabla + detalle + checklist
    └── Worker API (todas las rutas detrás de Access):
        ├── GET  /api/central/orders            → lista de pedidos
        ├── GET  /api/central/orders/:id         → detalle de un pedido
        ├── POST /api/central/orders/:id/status  → actualizar estado / guía
        ├── GET  /api/central/inventory          → estado de stock
        ├── POST /api/central/inventory/:pieza   → ajuste manual de stock
        └── GET  /api/central/export             → CSV de pedidos

KV namespaces (ya existentes):
├── SIMIO_ORDERS     → un pedido por clave (external_reference)
└── SIMIO_INVENTORY  → estado por pieza: AVAILABLE | RESERVED | SOLD
```

Regla de seguridad transversal: **toda ruta bajo `/central` y `/api/central/*` queda detrás de Cloudflare Access.** El Worker además valida el correo autenticado como defensa en profundidad (§3.2). Sin sesión válida de Access, la respuesta es `403`.

---

## 3 · El muro de entrada · Cloudflare Access

No construimos un sistema de login propio. Usamos **Cloudflare Access (Zero Trust)**, que pone un muro de identidad delante de la ruta sin escribir código de autenticación.

### 3.1 · Configuración manual (la hace Juan en el dashboard)

Pasos en el panel de Cloudflare → **Zero Trust** → **Access** → **Applications**:

1. **Add an application** → tipo **Self-hosted**.
2. Application name: `Central Simio`.
3. Session duration: `24 hours` (o lo que prefiera).
4. Application domain: `simioplateado.com`, path `central` (cubre `/central` y subrutas). Agregar también `simioplateado.com/api/central` si el path no queda cubierto por wildcard.
5. **Identity providers**: dejar "One-time PIN" (login por código al correo) y/o conectar Google.
6. **Policies** → Add a policy:
   - Policy name: `Solo Juan`
   - Action: **Allow**
   - Include → **Emails** → el correo de Juan (uno solo).
7. Guardar.

Resultado: cualquiera que entre a `simioplateado.com/central` recibe la pantalla de login de Cloudflare. Solo el correo en la lista pasa. Es gratis a esta escala.

### 3.2 · Validación en el Worker (defensa en profundidad)

Cloudflare Access inyecta cabeceras y un JWT firmado en cada request que pasa el muro. El Worker debe verificar que existe identidad válida antes de responder cualquier `/api/central/*`:

```js
// Access manda la cabecera Cf-Access-Authenticated-User-Email y un JWT en
// la cabecera Cf-Access-Jwt-Assertion. Validamos al menos el email contra
// el allowlist; idealmente verificamos la firma del JWT contra el JWKS del team.
const ADMIN_EMAILS = (env.CENTRAL_ADMIN_EMAILS || '').split(',').map(s => s.trim());

function requireAdmin(request, env) {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return new Response('Forbidden', { status: 403 });
  }
  return null; // ok
}
```

- `CENTRAL_ADMIN_EMAILS` = env var (no secreto sensible) con el/los correos admin.
- Validación robusta opcional: verificar la firma del `Cf-Access-Jwt-Assertion` contra `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`. Para v1 basta con la cabecera de email + el muro de Access; documentar el JWKS como mejora.

---

## 4 · Modelo de datos de la orden (esquema MercadoPago)

Cada pedido vive en `SIMIO_ORDERS`, **keyed por `external_reference`** (nuestro ID de orden propio, ej. `SP-2026-0007`). Forma del valor:

```json
{
  "external_reference": "SP-2026-0007",
  "pieza": "superhombresito.v01",
  "tipo": "unica",
  "monto": 360000,
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
    "notas": "Apto 302, portería"
  },
  "fecha": "2026-05-24T15:00:00Z",
  "mp_payment_id": "1234567890",
  "mp_status": "approved",

  "estado_fulfillment": "PAGADO",
  "guia": null,
  "transportadora": null,
  "fecha_envio": null,
  "checklist": {},
  "notas_internas": ""
}
```

Notas:

- Los campos de pago (`mp_payment_id`, `mp_status`, `monto`, `moneda`, datos del cliente, `direccion`) los escribe la integración de pago / webhook de MercadoPago.
- Los campos de despacho (`estado_fulfillment`, `guia`, `transportadora`, `fecha_envio`, `checklist`, `notas_internas`) los gestiona **la Central**.
- `direccion` proviene de nuestro formulario de checkout (no de MercadoPago), atada por `external_reference`.

---

## 5 · Estados de fulfillment

Una orden recorre estos estados (campo `estado_fulfillment`):

| Estado          | Significado                                         |
|-----------------|-----------------------------------------------------|
| `PAGADO`        | Pago aprobado en MercadoPago, aún sin producir      |
| `EN_PRODUCCION` | Pieza en impresión / acabado                        |
| `EMPACADO`      | Pieza terminada, QC pasado, empacada                |
| `ENVIADO`       | Despachada · tiene `guia` y `transportadora`        |
| `ENTREGADO`     | Confirmada la entrega (opcional)                    |
| `CANCELADO`     | Cancelada / reembolsada (refleja `mp_status`)       |

Reglas:

- Al pasar a `ENVIADO`, la guía y la transportadora son **obligatorias**; ese cambio puede disparar el correo "tu pieza va en camino" al cliente (reusar el helper de correo de Simio).
- Si el webhook de MercadoPago reporta `refunded`/`cancelled`, la Central refleja `CANCELADO` y, si la pieza era `unica`, ofrece reponerla a `AVAILABLE` en `SIMIO_INVENTORY` (acción manual, con confirmación).

---

## 6 · Endpoints del backend (todos detrás de Access)

Cada handler llama a `requireAdmin()` (§3.2) antes de operar.

### 6.1 · `GET /api/central/orders`
Lista todos los pedidos, más reciente primero. Soporta filtro opcional `?estado=PAGADO`. Para listar, iterar las claves de `SIMIO_ORDERS` (`list()` + `get()` por clave) y devolver un array resumido (external_reference, pieza, cliente_nombre, monto, moneda, fecha, estado_fulfillment).

### 6.2 · `GET /api/central/orders/:id`
Devuelve el objeto completo del pedido (`:id` = `external_reference`).

### 6.3 · `POST /api/central/orders/:id/status`
Body: `{ estado_fulfillment, guia?, transportadora?, checklist?, notas_internas? }`.
- Valida transición y campos obligatorios (guía+transportadora si pasa a `ENVIADO`).
- Hace merge sobre el objeto existente y reescribe la clave en `SIMIO_ORDERS`.
- Si pasa a `ENVIADO`: setea `fecha_envio` y dispara el correo al cliente con la guía.
- Devuelve el pedido actualizado.

### 6.4 · `GET /api/central/inventory`
Lee `SIMIO_INVENTORY` y devuelve, por pieza: estado (`AVAILABLE`/`RESERVED`/`SOLD`), tipo (`unica`/`wearable`) y, si está vendida, el `external_reference` asociado.

### 6.5 · `POST /api/central/inventory/:pieza`
Ajuste manual de stock (ej. reponer una `unica` a `AVAILABLE` tras un reembolso, o corregir stock de wearable). Requiere confirmación en UI. Registra el cambio en `notas_internas` del inventario si aplica.

### 6.6 · `GET /api/central/export`
Devuelve un CSV de todos los pedidos (todos los campos) para contabilidad. Encabezados en español. Content-Type `text/csv`, `Content-Disposition: attachment`.

---

## 7 · La interfaz (`/central`)

Estética sobria y funcional (no es vitrina; es taller). Coherente con la identidad pero priorizando legibilidad.

**Vista principal — Pedidos:**
- Tabla con: # orden, pieza, cliente, monto, fecha, badge de estado (color por estado).
- Filtro por estado y buscador por # orden / correo.
- Click en una fila → vista detalle.

**Vista detalle de pedido:**
- Datos del cliente y dirección de envío (copiables de un toque).
- Pieza, monto, `mp_payment_id` y **link "ver en MercadoPago"** (al panel de la transacción).
- Selector de estado de fulfillment.
- Campo de **guía** + selector de **transportadora** (Servientrega, Interrapidísimo, Coordinadora, DHL, FedEx, 4-72, Otra).
- **Checklist del protocolo de empaque embebido** (las casillas de `operaciones/protocolo-empaque-despacho.md`), cuyo estado se guarda en `checklist`.
- Campo de notas internas.
- Botón "Marcar como enviado y notificar al cliente".

**Vista Inventario:**
- Grilla de piezas con su estado. Las `unica` vendidas se ven marcadas SOLD con su # orden. Wearables muestran su stock numérico editable.

**Vista/acción Exportar:** botón que descarga el CSV.

---

## 8 · ESPEJO en la Central (fase posterior, opcional)

Cuando ESPEJO esté activo, la Central añade por pedido ESPEJO:
- Estado del flujo: foto recibida → preview generado → preview aprobado → en producción.
- Vínculo al registro de consentimiento (fecha, hash IP, autorizaciones marcadas).
- Visor del preview generado.

**Privacidad reforzada:** las fotos originales son **dato sensible**. La Central no debe descargarlas ni cachearlas innecesariamente; se visualizan bajo demanda y se respetan los plazos de retención (30 días tras entrega; 15 si es menor). El uso promocional solo aparece si el cliente lo autorizó.

---

## 9 · Privacidad y seguridad (no negociable)

- Todo `/central` y `/api/central/*` detrás de Cloudflare Access. Sin excepción.
- El Worker revalida el correo admin en cada request (§3.2).
- La Central maneja PII (direcciones, teléfonos) y, en ESPEJO, dato sensible (rostros). Nunca registrar PII en logs ni en mensajes de error.
- Datos de pedido se conservan 5 años (obligación contable); el export CSV sirve para ese respaldo.
- Coherencia con `doctrina/legal-privacidad.md` y `doctrina/consentimiento-uso-imagen.md`.

---

## 10 · Checklist de implementación

**Para codex (código):**

- [ ] Ruta estática `/central` (frontend: pedidos, detalle, inventario, export).
- [ ] Helper `requireAdmin()` y env var `CENTRAL_ADMIN_EMAILS`.
- [ ] Endpoints `GET/POST /api/central/*` leyendo/escribiendo `SIMIO_ORDERS` y `SIMIO_INVENTORY`.
- [ ] Extender el esquema de orden con los campos de fulfillment (§4) sin romper lo que escribe la capa de pago.
- [ ] Disparo del correo "enviado" al pasar a `ENVIADO` (reusar helper de correo existente).
- [ ] Export CSV.
- [ ] Checklist del protocolo embebido en el detalle, persistido en `checklist`.

**Para Juan (manual, dashboard):**

- [ ] Configurar Cloudflare Access para `simioplateado.com/central` (+ `/api/central`) con política "solo mi correo" (§3.1).
- [ ] Verificar que la integración MercadoPago ya pobla `SIMIO_ORDERS` con el esquema de §4 (prerrequisito).
- [ ] Definir `CENTRAL_ADMIN_EMAILS` como env var del Worker de Simio.

---

*Brief creado 2026-05-24 · Versión 1.0. Supersede a V0.13 (PayPal) en lo referente al procesador de pago de Simio (ahora MercadoPago). Acompaña a `operaciones/protocolo-empaque-despacho.md`, `doctrina/legal-privacidad.md` y `doctrina/consentimiento-uso-imagen.md`.*
